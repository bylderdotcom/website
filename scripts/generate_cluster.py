#!/usr/bin/env python3
# ============================================================================
# CLUSTER-GENERATOR — build-time generatie, cluster voor cluster.
#
#   python3 scripts/generate_cluster.py extract <cluster>   # eenmalig: bootstrap
#   python3 scripts/generate_cluster.py build <cluster>     # data+template → HTML
#   python3 scripts/generate_cluster.py check <cluster>     # byte-pariteit vs disk
#
# Werkwijze: het template wordt uit de ECHTE pagina-bytes afgeleid — de waarde-
# spans (title, description, canonical/og, robots, JSON-LD, artikel, footer)
# worden vervangen door placeholders, al het overige blijft letterlijk staan.
# Pagina's met een afwijkend skelet worden automatisch een eigen template-
# variant (template.<naam>.html). Zo blijft elke cluster-conventie (regelindeling,
# extra meta-tags) byte-exact behouden zonder cluster-specifieke code.
#
# Model per cluster:
#   templates/clusters/<cluster>/template.<variant>.html  gedeelde chrome
#   templates/clusters/<cluster>/aside.<naam>.html         gedeelde asides
#   templates/clusters/<cluster>/footer.<naam>.html        gedeelde footers
#   data/clusters/<cluster>/pages.json                     per pagina: meta + varianten
#   data/clusters/<cluster>/content/<slug>.html            artikel-content (verbatim)
#
# Na extract moet `check` 100% byte-identiek zijn; daarna is elke chrome-
# wijziging één template-edit + `build`. Alleen stdlib; geen dependencies.
# ============================================================================
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.bylder.com"

CLUSTERS = {
    name: sorted(
        p.relative_to(ROOT).as_posix() for p in (ROOT / name).rglob("index.html")
    )
    for name in ("bouwvergunning", "gietvloer")
}

VARIANT_NAMES = ["default", "v2", "v3", "v4", "v5", "v6"]


def slug_of(rel_path: str) -> str:
    parts = Path(rel_path).parts
    return "index" if len(parts) == 2 else "/".join(parts[1:-1])


class ParseError(Exception):
    pass


# ---------------------------------------------------------------------------
# Parsen: waarde-spans lokaliseren. Alles wat we NIET benoemen blijft skelet.
# ---------------------------------------------------------------------------
def parse_page(html: str, rel_path: str) -> dict:
    if "{{" in html:
        raise ParseError(f"{rel_path}: bevat letterlijke '{{{{' — placeholder-conflict")

    spans = []  # (start, eind, placeholder)
    values = {}

    def span(pattern, placeholder, required=True, flags=0):
        matches = list(re.finditer(pattern, html, flags))
        if not matches:
            if required:
                raise ParseError(f"{rel_path}: niet gevonden: {pattern[:60]}")
            return None
        if len(matches) > 1:
            raise ParseError(f"{rel_path}: meerdere matches voor {pattern[:60]}")
        m = matches[0]
        spans.append((m.start(1), m.end(1), placeholder))
        return m.group(1)

    values["title"] = span(r"<title>(.*?)</title>", "{{title}}", flags=re.S)
    values["description"] = span(r'<meta name="description" content="(.*?)"', "{{description}}")
    canonical = span(r'<link rel="canonical" href="(.*?)"', "{{url}}")
    if not canonical.startswith(SITE):
        raise ParseError(f"{rel_path}: canonical buiten {SITE}: {canonical}")
    values["path"] = canonical[len(SITE):]

    for pattern, placeholder, key in [
        (r'<meta property="og:title" content="(.*?)"', "{{og_title}}", "og_title"),
        (r'<meta property="og:description" content="(.*?)"', "{{og_description}}", "og_description"),
        (r'<meta property="og:url" content="(.*?)"', "{{url}}", "og_url"),
        (r'<meta property="og:type" content="(.*?)"', "{{og_type}}", "og_type"),
        (r'<meta name="robots" content="(.*?)"', "{{robots}}", "robots"),
        (r'<meta property="og:image" content="(.*?)"', "{{og_image}}", "og_image"),
        (r'<meta name="twitter:card" content="(.*?)"', "{{twitter_card}}", "twitter_card"),
    ]:
        values[key] = span(pattern, placeholder, required=key in ("og_type", "robots"))
    if values.get("og_url") is not None and values["og_url"] != canonical:
        raise ParseError(f"{rel_path}: og:url wijkt af van canonical")

    # JSON-LD: elk blok is data; de regio (incl. scheidingstekens) wordt {{ldjson}}.
    ld = list(re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S))
    if ld:
        seps = {html[a.end(): b.start()] for a, b in zip(ld, ld[1:])}
        if len(seps) > 1:
            raise ParseError(f"{rel_path}: JSON-LD-blokken met wisselende scheidingstekens")
        values["ldjson"] = [m.group(1) for m in ld]
        for block in values["ldjson"]:
            json.loads(block)
        values["ldjson_sep"] = seps.pop() if seps else ""
        spans.append((ld[0].start(), ld[-1].end(), "{{ldjson}}"))
    else:
        values["ldjson"], values["ldjson_sep"] = [], ""

    # Artikel (main): tussen </nav> (of <body>) en <footer. Footer: eigen fragment.
    footer = re.search(r"<footer.*?</footer>", html, re.S)
    if not footer:
        raise ParseError(f"{rel_path}: geen <footer> gevonden")
    nav = re.search(r"<body>(<nav.*?</nav>)", html, re.S)
    main_start = nav.end(1) if nav else re.search(r"<body[^>]*>", html).end()
    spans.append((main_start, footer.start(), "{{main}}"))
    values["_main"] = html[main_start: footer.start()]
    spans.append((footer.start(), footer.end(), "{{footer}}"))
    values["_footer"] = footer.group(0)

    # Skelet: waarde-spans vervangen door placeholders (van achter naar voren).
    for a, b, _ in spans:
        for a2, b2, _ in spans:
            if (a, b) != (a2, b2) and a < b2 and a2 < b and not (a >= b2 or a2 >= b):
                if not (b <= a2 or b2 <= a):
                    raise ParseError(f"{rel_path}: overlappende spans")
    skeleton = html
    for a, b, placeholder in sorted(spans, key=lambda s: -s[0]):
        skeleton = skeleton[:a] + placeholder + skeleton[b:]
    values["_skeleton"] = skeleton
    return values


# ---------------------------------------------------------------------------
# Renderen — exact de inverse: placeholders → waarden.
# ---------------------------------------------------------------------------
def render_page(page: dict, template: str, fragments: dict, content: str) -> str:
    main = content
    if page.get("aside"):
        main = main.replace("{{aside}}", fragments[f"aside.{page['aside']}"])
    subs = {
        "{{title}}": page["title"],
        "{{description}}": page["description"],
        "{{url}}": SITE + page["path"],
        "{{og_title}}": page.get("og_title") or page["title"],
        "{{og_description}}": page.get("og_description") or page["description"],
        "{{og_type}}": page["og_type"],
        "{{robots}}": page["robots"],
        "{{og_image}}": page.get("og_image") or "",
        "{{twitter_card}}": page.get("twitter_card") or "",
        "{{ldjson}}": page["ldjson_sep"].join(
            f'<script type="application/ld+json">{b}</script>' for b in page["ldjson"]
        ),
        "{{main}}": main,
        "{{footer}}": fragments[f"footer.{page['footer']}"],
    }
    out = template
    for key, val in subs.items():
        out = out.replace(key, val)
    return out


def tpl_dir(cluster):
    return ROOT / "templates" / "clusters" / cluster


def data_dir(cluster):
    return ROOT / "data" / "clusters" / cluster


# ---------------------------------------------------------------------------
# CONTENT-NIVEAU (fase 2 per cluster): stad-directorypagina's → template + data.
# De artikel-fragmenten van stadspagina's zijn zelf getemplated (stad, aantal,
# bedrijfskaarten). Deze laag vervangt die fragmenten door één content-template
# + kaart-vormen + een datarij per stad in cities.json. Zelfde bewijsstandaard:
# na extract-content moet `check` 100% byte-identiek blijven.
# ---------------------------------------------------------------------------
GRID_START = '<div class="grid-3" id="dir-grid">'
GRID_END = "</div><script>(function(){var sel"
CARD_START = '<div class="card vb-card"'
# Vaste tekst die met een stadsnaam kan botsen (stad "Best" vs sorteeroptie).
PROTECTED_LITERALS = ["Best beoordeeld"]


def mask(text, pattern, placeholder, key, values, rel, required=True):
    """Vervang groep(1)-spans door placeholder; alle voorkomens moeten gelijk zijn."""
    ms = list(re.finditer(pattern, text))
    if not ms:
        if required:
            raise ParseError(f"{rel}: content-slot niet gevonden: {key}")
        return text
    vals = {m.group(1) for m in ms}
    if len(vals) > 1:
        raise ParseError(f"{rel}: {key} inconsistent binnen pagina: {vals}")
    if key in values and values[key] != ms[0].group(1):
        raise ParseError(f"{rel}: {key} wijkt af van eerder gevonden waarde")
    values[key] = ms[0].group(1)
    out, last = [], 0
    for m in ms:
        out.append(text[last: m.start(1)])
        out.append(placeholder)
        last = m.end(1)
    out.append(text[last:])
    return "".join(out)


CARD_SLOTS = [
    (r'href="(/gietvloer/bedrijf/[^"]+)"', "{{profile_href}}", "profile_href", True),
    (r'style="color:#1A1208;text-decoration:none;">(.*?)</a>', "{{name}}", "name", True),
    (r'margin-top:2px;">(.*?)</div>', "{{plaats}}", "plaats", True),
    (r'data-rating="([\d.]+)"', "{{rating}}", "rating", True),
    (r'data-reviews="(\d+)"', "{{reviews}}", "reviews", True),
    (r"Google &#9733; ([\d.]+) <span", "{{rating_disp}}", "rating_disp", False),
    (r'font-weight:400;">\((\d+)\)</span>', "{{reviews_disp}}", "reviews_disp", False),
    (r'href="(https://www\.google\.com/maps/search/[^"]*)"', "{{maps_href}}", "maps_href", True),
    (r'href="(https://app\.bylder\.com/vakbedrijf/claim/[^"]*)"', "{{claim_href}}", "claim_href", True),
]


def mask_card(card: str, rel: str):
    values = {}
    for pattern, placeholder, key, required in CARD_SLOTS:
        card = mask(card, pattern, placeholder, key, values, rel, required)
    return card, values


def parse_city_fragment(html: str, rel: str):
    """None als dit geen stad-directorypagina is; anders (template, datarij, kaartvormen)."""
    h1 = re.search(r"<h1[^>]*>Gietvloer-specialisten in (.*?)</h1>", html)
    if not h1 or GRID_START not in html:
        return None
    city = h1.group(1)
    a = html.index(GRID_START) + len(GRID_START)
    b = html.index(GRID_END, a)
    parts = html[a:b].split(CARD_START)
    if parts[0] != "":
        raise ParseError(f"{rel}: onverwachte inhoud vóór eerste kaart in dir-grid")
    companies, shapes = [], []
    for raw in parts[1:]:
        shape, v = mask_card(CARD_START + raw, rel)
        shapes.append(shape)
        companies.append(v)

    body = html[:a] + "{{cards}}" + html[b:]
    values = {}
    body = mask(body, r"(\d+) gietvloerbedrijven in en rond", "{{count}}", "count", values, rel)
    body = mask(body, r'">(\d+) gietvloer-specialisten in ', "{{count}}", "count", values, rel)
    if int(values["count"]) != len(companies):
        raise ParseError(f"{rel}: count {values['count']} ≠ {len(companies)} kaarten")
    for i, lit in enumerate(PROTECTED_LITERALS):
        body = body.replace(lit, f"\x00P{i}\x00")
    body = re.sub(rf"(?<![\w-]){re.escape(city)}(?![\w-])", "{{city}}", body)
    # Sommige pagina's mixen apostrof-encodings (&#x27; in h1, rauwe ' in lopende
    # tekst) — de alternatieve spelling krijgt een eigen slot zodat het template
    # geen stad-literal overhoudt én de bytes exact reproduceren.
    city_alt = city.replace("&#x27;", "'")
    has_alt = city_alt != city and re.search(rf"(?<![\w-]){re.escape(city_alt)}(?![\w-])", body)
    if has_alt:
        body = re.sub(rf"(?<![\w-]){re.escape(city_alt)}(?![\w-])", "{{city_alt}}", body)
    for i, lit in enumerate(PROTECTED_LITERALS):
        body = body.replace(f"\x00P{i}\x00", lit)
    body = mask(body, r"/offerte-check/gietvloer/([a-z0-9-]+)/", "{{city_slug}}", "city_slug", values, rel, required=False)
    entry = {"city": city, "companies": companies}
    if has_alt:
        entry["city_alt"] = city_alt
    if "city_slug" in values:
        entry["city_slug"] = values["city_slug"]
    return body, entry, shapes


def render_city_content(entry: dict, body_tpl: str, card_shapes: dict) -> str:
    cards = []
    for c in entry["companies"]:
        card = card_shapes[c["shape"]]
        for key, val in c.items():
            if key != "shape":
                card = card.replace("{{" + key + "}}", val)
        cards.append(card)
    out = body_tpl.replace("{{cards}}", "".join(cards))
    out = out.replace("{{count}}", str(len(entry["companies"])))
    out = out.replace("{{city}}", entry["city"])
    if "city_alt" in entry:
        out = out.replace("{{city_alt}}", entry["city_alt"])
    if "city_slug" in entry:
        out = out.replace("{{city_slug}}", entry["city_slug"])
    if "{{" in out:
        raise ParseError(f"onvervulde placeholder in stad '{entry['city_slug']}'")
    return out


def extract_content(cluster: str):
    """Vervang stad-fragmenten door content-template + cities.json (pariteit verplicht)."""
    ddir, tdir = data_dir(cluster), tpl_dir(cluster)
    pages = json.loads((ddir / "pages.json").read_text())
    bodies, cities, all_shapes = {}, {}, {}
    migrated = []
    for page in pages:
        frag = ddir / "content" / f"{page['slug'].replace('/', '__')}.html"
        if page.get("content_kind") or not frag.exists():
            continue
        parsed = parse_city_fragment(frag.read_text(), page["file"])
        if not parsed:
            continue
        body, entry, shapes = parsed
        bodies[page["file"]] = {"_skeleton": body}
        for c, shape in zip(entry["companies"], shapes):
            all_shapes.setdefault(shape, []).append(c)
        cities[page["slug"]] = entry
        migrated.append((page, frag, shapes))

    if not migrated:
        print("extract-content: geen stad-fragmenten gevonden")
        return
    body_names, body_blobs = name_variants(bodies, "_skeleton", "content-template")
    for name, blob in body_blobs.items():
        (tdir / f"content.city.{name}.html").write_text(blob)

    shape_names = {}
    for i, (shape, _) in enumerate(sorted(all_shapes.items(), key=lambda kv: -len(kv[1]))):
        name = ["rated", "unrated"][i] if i < 2 else VARIANT_NAMES[i]
        shape_names[shape] = name
        (tdir / f"card.{name}.html").write_text(shape)
    for page, frag, shapes in migrated:
        for c, shape in zip(cities[page["slug"]]["companies"], shapes):
            c["shape"] = shape_names[shape]
        cities[page["slug"]]["template"] = body_names[page["file"]]
        page["content_kind"] = "city"
        frag.unlink()
    (ddir / "cities.json").write_text(json.dumps(cities, ensure_ascii=False, indent=1) + "\n")
    (ddir / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")
    print(
        f"extract-content: {len(migrated)} stadspagina's → {len(body_blobs)} content-template(s) + "
        f"{len(shape_names)} kaartvormen + cities.json "
        f"({sum(len(e['companies']) for e in cities.values())} bedrijfsvermeldingen)"
    )


def name_variants(parsed: dict, key: str, label: str):
    """Groepeer byte-identieke blobs; geef {rel: naam} + {naam: blob} (grootste eerst)."""
    seen = {}
    for rel, p in parsed.items():
        seen.setdefault(hashlib.md5(p[key].encode()).hexdigest(), {"blob": p[key], "pages": []})["pages"].append(rel)
    ordered = sorted(seen.values(), key=lambda v: -len(v["pages"]))
    if len(ordered) > len(VARIANT_NAMES):
        raise ParseError(f"{label}: {len(ordered)} varianten (> {len(VARIANT_NAMES)}) — cluster eerst normaliseren")
    names, blobs = {}, {}
    for i, v in enumerate(ordered):
        blobs[VARIANT_NAMES[i]] = v["blob"]
        for rel in v["pages"]:
            names[rel] = VARIANT_NAMES[i]
    return names, blobs


# ---------------------------------------------------------------------------
# extract — bootstrap template/fragments/data uit de bestaande HTML.
# ---------------------------------------------------------------------------
def extract(cluster: str):
    parsed = {rel: parse_page((ROOT / rel).read_text(), rel) for rel in CLUSTERS[cluster]}

    tdir, ddir = tpl_dir(cluster), data_dir(cluster)
    tdir.mkdir(parents=True, exist_ok=True)
    (ddir / "content").mkdir(parents=True, exist_ok=True)
    for stale in list(tdir.glob("*.html")) + list((ddir / "content").glob("*.html")):
        stale.unlink()

    tpl_names, tpl_blobs = name_variants(parsed, "_skeleton", "template")
    footer_names, footer_blobs = name_variants(parsed, "_footer", "footer")
    for name, blob in tpl_blobs.items():
        (tdir / f"template.{name}.html").write_text(blob)
    for name, blob in footer_blobs.items():
        (tdir / f"footer.{name}.html").write_text(blob)

    # Gedeelde asides binnen main → {{aside}} + fragment.
    aside_re = re.compile(r"<aside.*?</aside>", re.S)
    by_aside = {}
    for rel, p in parsed.items():
        m = aside_re.search(p["_main"])
        if m:
            by_aside.setdefault(m.group(0), []).append(rel)
    aside_names = {}
    shared = sorted(((b, r) for b, r in by_aside.items() if len(r) > 1), key=lambda x: -len(x[1]))
    for i, (blob, rels) in enumerate(shared):
        name = ["project", "thema"][i] if i < 2 else VARIANT_NAMES[i]
        (tdir / f"aside.{name}.html").write_text(blob)
        for rel in rels:
            aside_names[rel] = (name, blob)

    pages = []
    for rel in CLUSTERS[cluster]:
        p, slug = parsed[rel], slug_of(rel)
        main = p["_main"]
        aside = None
        if rel in aside_names:
            aside, blob = aside_names[rel]
            main = main.replace(blob, "{{aside}}")
        (ddir / "content" / f"{slug.replace('/', '__')}.html").write_text(main)
        entry = {
            "slug": slug,
            "file": rel,
            "path": p["path"],
            "title": p["title"],
            "description": p["description"],
            "og_type": p["og_type"],
            "robots": p["robots"],
            "template": tpl_names[rel],
            "footer": footer_names[rel],
            "aside": aside,
            "ldjson": p["ldjson"],
            "ldjson_sep": p["ldjson_sep"],
        }
        for opt in ("og_title", "og_description", "og_image", "twitter_card"):
            if p.get(opt) is not None and p[opt] != entry.get(opt.replace("og_title", "title").replace("og_description", "description")):
                if opt == "og_title" and p[opt] == p["title"]:
                    continue
                if opt == "og_description" and p[opt] == p["description"]:
                    continue
                entry[opt] = p[opt]
        pages.append(entry)
    (ddir / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")
    print(
        f"extract: {len(pages)} pagina's — templates: {len(tpl_blobs)}, "
        f"footers: {len(footer_blobs)}, gedeelde asides: {sorted({v[0] for v in aside_names.values()})}"
    )


# ---------------------------------------------------------------------------
# build / check
# ---------------------------------------------------------------------------
def build(cluster: str, check_only: bool) -> int:
    fragments = {f.stem: f.read_text() for f in tpl_dir(cluster).glob("*.html")}
    pages = json.loads((data_dir(cluster) / "pages.json").read_text())
    cities_file = data_dir(cluster) / "cities.json"
    cities = json.loads(cities_file.read_text()) if cities_file.exists() else {}
    card_shapes = {name.split(".", 1)[1]: blob for name, blob in fragments.items() if name.startswith("card.")}
    mismatches = []
    for page in pages:
        template = fragments[f"template.{page['template']}"]
        if page.get("content_kind") == "city":
            entry = cities[page["slug"]]
            content = render_city_content(entry, fragments[f"content.city.{entry['template']}"], card_shapes)
        else:
            content = (data_dir(cluster) / "content" / f"{page['slug'].replace('/', '__')}.html").read_text()
        out = render_page(page, template, fragments, content)
        target = ROOT / page["file"]
        if check_only:
            if not target.exists() or target.read_text() != out:
                mismatches.append(page["file"])
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(out)
    if check_only:
        print(f"check: {len(pages) - len(mismatches)}/{len(pages)} byte-identiek")
        for f in mismatches[:10]:
            print(f"   MISMATCH: {f}")
        if len(mismatches) > 10:
            print(f"   … +{len(mismatches) - 10} meer")
        return 1 if mismatches else 0
    print(f"build: {len(pages)} pagina's geschreven")
    return 0


def main():
    modes = ("extract", "extract-content", "build", "check")
    if len(sys.argv) != 3 or sys.argv[1] not in modes or sys.argv[2] not in CLUSTERS:
        print(f"gebruik: {sys.argv[0]} {'|'.join(modes)} {'|'.join(CLUSTERS)}")
        sys.exit(2)
    mode, cluster = sys.argv[1], sys.argv[2]
    if mode == "extract":
        extract(cluster)
        sys.exit(build(cluster, check_only=True))
    if mode == "extract-content":
        extract_content(cluster)
        sys.exit(build(cluster, check_only=True))
    sys.exit(build(cluster, check_only=(mode == "check")))


if __name__ == "__main__":
    main()
