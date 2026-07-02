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
    mismatches = []
    for page in pages:
        template = fragments[f"template.{page['template']}"]
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
    if len(sys.argv) != 3 or sys.argv[1] not in ("extract", "build", "check") or sys.argv[2] not in CLUSTERS:
        print(f"gebruik: {sys.argv[0]} extract|build|check {'|'.join(CLUSTERS)}")
        sys.exit(2)
    mode, cluster = sys.argv[1], sys.argv[2]
    if mode == "extract":
        extract(cluster)
        sys.exit(build(cluster, check_only=True))
    sys.exit(build(cluster, check_only=(mode == "check")))


if __name__ == "__main__":
    main()
