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
    for name in (
        "bouwvergunning", "gietvloer", "aannemer", "elektricien", "offerte-check",
        "aannemer-matching", "badkamer", "dakkapel", "schilder", "loodgieter",
        "stukadoor", "renovatiekosten", "kopen", "project", "kortingscode",
    )
}

# Clusters met vak×stad-tekstpagina's (geen bedrijfskaarten): template per vak +
# datarij per stad. h1_city = patroon dat de stadsnaam uit de h1 haalt.
VAKSTAD_CLUSTERS = {
    "offerte-check": {"h1_city": r" in (.*?) —"},
    "aannemer-matching": {"h1_city": r"<h1[^>]*>[A-Za-zëï-]+ (.*?) — "},
    # Stad geanchord op het map-pin-icoon: de h1 bevat een dubbele "kosten"
    # (bron-bug) waardoor een h1-patroon de stad niet betrouwbaar vangt.
    "renovatiekosten": {"h1_city": r'ph-map-pin"></i> ([^<]+)<'},
    # kopen = subcategorie×stad: slug heeft 3 segmenten (vloeren/tapijt/goes).
    "kopen": {"h1_city": r" in (.*?) —", "depth": 3},
    "project": {"h1_city": r" in (.*?) —"},
}

# Per-cluster waarde-slots binnen de footer (vóór variant-groepering gemaskeerd);
# waarden komen als footer_*-velden in pages.json en worden bij render teruggezet.
FOOTER_SLOTS = {
    "kopen": [
        (r'<a href="/kopen/([a-z0-9-]+/[a-z0-9-]+)/">Alle steden voor ', "{{footer_sub_slug}}", "footer_sub_slug"),
        (r'">Alle steden voor ([^<]+)</a>', "{{footer_sub_label}}", "footer_sub_label"),
        (r'<a href="/kopen/([a-z0-9-]+)/">[^<]+</a> ·\s*<a href="/kopen/">', "{{footer_cat_slug}}", "footer_cat_slug"),
        (r'<a href="/kopen/\{\{footer_cat_slug\}\}/">([^<]+)</a>', "{{footer_cat_label}}", "footer_cat_label"),
    ],
    "project": [
        (r'<a href="/project/([a-z0-9-]+)/">Alle steden voor ', "{{footer_sub_slug}}", "footer_sub_slug"),
        (r'">Alle steden voor ([^<]+)</a>', "{{footer_sub_label}}", "footer_sub_label"),
        (r'<a href="/nieuwbouw/([a-z-]+)/[a-z0-9-]+/">Nieuwbouw ', "{{footer_prov_slug}}", "footer_prov_slug"),
        (r'<a href="/nieuwbouw/\{\{footer_prov_slug\}\}/([a-z0-9-]+)/">Nieuwbouw ', "{{footer_city_slug}}", "footer_city_slug"),
        (r'/">Nieuwbouw ([^<]+)</a>', "{{footer_city}}", "footer_city"),
    ],
}

PROVINCES = {
    "drenthe": "Drenthe", "flevoland": "Flevoland", "friesland": "Friesland",
    "gelderland": "Gelderland", "groningen": "Groningen", "limburg": "Limburg",
    "noord-brabant": "Noord-Brabant", "noord-holland": "Noord-Holland",
    "overijssel": "Overijssel", "utrecht": "Utrecht", "zeeland": "Zeeland",
    "zuid-holland": "Zuid-Holland",
}

VARIANT_NAMES = ["default"] + [f"v{i}" for i in range(2, 41)]


def slug_of(rel_path: str) -> str:
    parts = Path(rel_path).parts
    return "index" if len(parts) == 2 else "/".join(parts[1:-1])


class ParseError(Exception):
    pass


# ---------------------------------------------------------------------------
# Parsen: waarde-spans lokaliseren. Alles wat we NIET benoemen blijft skelet.
# ---------------------------------------------------------------------------
def parse_page(html: str, rel_path: str, cluster: str = "") -> dict:
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
        # Meerdere matches mag alleen bij identieke waarden (bv. dubbele robots-tag
        # in de bron) — elk voorkomen wordt dezelfde placeholder.
        if len({m.group(1) for m in matches}) > 1:
            raise ParseError(f"{rel_path}: meerdere ONGELIJKE matches voor {pattern[:60]}")
        for m in matches:
            spans.append((m.start(1), m.end(1), placeholder))
        return matches[0].group(1)

    values["title"] = span(r"<title>(.*?)</title>", "{{title}}", flags=re.S)
    values["description"] = span(r'<meta name="description" content="(.*?)"', "{{description}}")
    canonical = span(r'<link rel="canonical" href="(.*?)"', "{{url}}")
    if not canonical.startswith(SITE):
        raise ParseError(f"{rel_path}: canonical buiten {SITE}: {canonical}")
    values["path"] = canonical[len(SITE):]
    # Zelf-verwijzende hreflang-tags (href == canonical) worden {{url}};
    # cross-market hreflangs (andere href) blijven letterlijk in het skelet.
    for m in re.finditer(r'<link rel="alternate" hreflang="[^"]*" href="(.*?)"', html):
        if m.group(1) == canonical:
            spans.append((m.start(1), m.end(1), "{{url}}"))

    for pattern, placeholder, key in [
        (r'<meta property="og:title" content="(.*?)"', "{{og_title}}", "og_title"),
        (r'<meta property="og:description" content="(.*?)"', "{{og_description}}", "og_description"),
        (r'<meta property="og:url" content="(.*?)"', "{{og_url}}", "og_url"),
        (r'<meta property="og:type" content="(.*?)"', "{{og_type}}", "og_type"),
        (r'<meta name="robots" content="(.*?)"', "{{robots}}", "robots"),
        (r'<meta property="og:image" content="(.*?)"', "{{og_image}}", "og_image"),
        (r'<meta name="twitter:card" content="(.*?)"', "{{twitter_card}}", "twitter_card"),
    ]:
        values[key] = span(pattern, placeholder, required=False)
    # og:url wijkt soms af van de canonical (bron-bug, bv. kopen-subcategorieën
    # die naar de bovenliggende categorie wijzen) — dan blijft het een dataveld.

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
    footer_blob = footer.group(0)
    for pattern, placeholder, key in FOOTER_SLOTS.get(cluster, []):
        footer_blob = mask(footer_blob, pattern, placeholder, key, values, rel_path, required=False)
    values["_footer"] = footer_blob

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
        "{{og_url}}": page.get("og_url") or (SITE + page["path"]),
        "{{og_type}}": page.get("og_type") or "",
        "{{robots}}": page.get("robots") or "",
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
    # Footer-slots (FOOTER_SLOTS): waarden staan als footer_*-velden op de pagina.
    for key, val in page.items():
        if key.startswith("footer_") and isinstance(val, str) and key != "footer":
            out = out.replace("{{" + key + "}}", val)
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


def card_slots(cluster: str):
    return [
        (rf'href="(/{cluster}/bedrijf/[^"]+)"', "{{profile_href}}", "profile_href", True),
        (r'style="color:#1A1208;text-decoration:none;">(.*?)</a>', "{{name}}", "name", True),
        (r'margin-top:2px;">(.*?)</div>', "{{plaats}}", "plaats", True),
        (r'data-rating="([\d.]+)"', "{{rating}}", "rating", True),
        (r'data-reviews="(\d+)"', "{{reviews}}", "reviews", True),
        (r"Google &#9733; ([\d.]+) <span", "{{rating_disp}}", "rating_disp", False),
        (r'font-weight:400;">\((\d+)\)</span>', "{{reviews_disp}}", "reviews_disp", False),
        (r'href="(https://www\.google\.com/maps/search/[^"]*)"', "{{maps_href}}", "maps_href", False),
        # Tweede Maps-linkvorm (loodgieter-kaarten): maps.google.com/?cid=…
        (r'href="(https://maps\.google\.com/\?[^"]*)"', "{{maps_cid_href}}", "maps_cid_href", False),
        (r'href="(https://app\.bylder\.com/vakbedrijf/claim/[^"]*)"', "{{claim_href}}", "claim_href", True),
    ]


def mask_card(card: str, rel: str, cluster: str):
    values = {}
    for pattern, placeholder, key, required in card_slots(cluster):
        card = mask(card, pattern, placeholder, key, values, rel, required)
    return card, values


def parse_city_fragment(html: str, rel: str, cluster: str):
    """None als dit geen stad-directorypagina is; anders (template, datarij, kaartvormen)."""
    h1 = re.search(r"<h1[^>]*>[^<]*? in (.*?)</h1>", html)
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
        shape, v = mask_card(CARD_START + raw, rel, cluster)
        shapes.append(shape)
        companies.append(v)

    body = html[:a] + "{{cards}}" + html[b:]
    values = {}
    body = mask(body, r"(\d+) [a-z-]+ in en rond", "{{count}}", "count", values, rel)
    body = mask(body, r'margin:32px 0 8px;">(\d+) ', "{{count}}", "count", values, rel)
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
    body = mask(body, rf"/offerte-check/{cluster}/([a-z0-9-]+)/", "{{city_slug}}", "city_slug", values, rel, required=False)
    entry = {"city": city, "companies": companies}
    if has_alt:
        entry["city_alt"] = city_alt
    if "city_slug" in values:
        entry["city_slug"] = values["city_slug"]
    return body, entry, shapes


def bounded(value: str) -> str:
    return rf"(?<![\w-]){re.escape(value)}(?![\w-])"


def replace_spellings(body: str, value: str, base: str, entry: dict) -> str:
    """Vervang een waarde én haar alternatieve encoding (&amp;/&#x27; vs rauw) door
    eigen slots — pagina's mixen beide encodings binnen één document."""
    body = re.sub(bounded(value), "{{" + base + "}}", body)
    alt = value.replace("&amp;", "&").replace("&#x27;", "'").replace("&quot;", '"')
    if alt != value and re.search(bounded(alt), body):
        body = re.sub(bounded(alt), "{{" + base + "_alt}}", body)
        entry[base + "_alt"] = alt
    return body


def tile_re(cluster: str):
    return re.compile(
        rf'<a href="(/{cluster}/bedrijf/[^"]+)" class="tile">(.*?)'
        r'(?: <span style="color:rgba\(61,46,30,0\.4\);font-weight:400;">&#9733; ([\d,]+)</span>)?</a>'
    )


def parse_bedrijf_fragment(html: str, rel: str, cluster: str):
    """Bedrijfsprofielpagina → (template, datarij). Tegels (siblings) worden data."""
    values = {}
    body = mask(html, r"<h1[^>]*>(.*?)</h1>", "{{name}}", "name", values, rel)
    name = values.pop("name")

    # Siblings-regio ("Andere <vak> in <stad>") vóór de naam/stad-vervanging.
    grid = re.search(r'<div class="grid-3">(.*?)</div>', body, re.S)
    siblings = []
    if grid:
        tiles = list(tile_re(cluster).finditer(grid.group(1)))
        if "".join(t.group(0) for t in tiles) != grid.group(1):
            raise ParseError(f"{rel}: grid-3 bevat meer dan alleen tegels")
        for t in tiles:
            s = {"href": t.group(1), "name": t.group(2)}
            if t.group(3) is not None:
                s["rating"] = t.group(3)
            siblings.append(s)
        body = body[: grid.start(1)] + "{{tiles}}" + body[grid.end(1):]

    city = None
    m = re.search(rf'<a href="/{cluster}/(?!bedrijf)[a-z0-9-]+/"[^>]*>([^<]+)</a> &rarr; <span', body)
    if m:
        city = m.group(1)

    body = mask(body, r"&#9733; ([\d,]+)</span>", "{{rating_disp}}", "rating_disp", values, rel, required=False)
    body = mask(body, r'font-weight:400;">\((\d+)\)</span>', "{{reviews_disp}}", "reviews_disp", values, rel, required=False)
    body = mask(body, r'>(\d+) beoordelingen ', "{{reviews}}", "reviews", values, rel, required=False)
    body = mask(body, r'href="(https://www\.google\.com/maps/search/[^"]*)"', "{{maps_href}}", "maps_href", values, rel, required=False)
    body = mask(body, r'href="(https://maps\.google\.com/\?[^"]*)"', "{{maps_cid_href}}", "maps_cid_href", values, rel, required=False)
    body = mask(body, r'<a href="([^"]+)" target="_blank" rel="nofollow noopener" style="font-weight:700;">Website', "{{website}}", "website", values, rel, required=False)
    body = mask(body, r'href="tel:([^"]+)"', "{{tel}}", "tel", values, rel, required=False)
    body = mask(body, r'href="tel:\{\{tel\}\}" style="font-weight:700;">(.*?)</a>', "{{tel_disp}}", "tel_disp", values, rel, required=False)

    entry = {"name": name, **({"city": city} if city else {}), **values}
    for i, lit in enumerate(PROTECTED_LITERALS):
        body = body.replace(lit, f"\x00P{i}\x00")
    # Stad éérst en alleen op geanchorde plekken (breadcrumb + "… in <stad>"):
    # bedrijven die naar hun stad heten ("Borne", "Balk") zouden bij een globale
    # naam-vervanging anders de stad-plekken opeten (en andersom).
    if city:
        for spelling, base in ((city, "city"), (city.replace("&#x27;", "'").replace("&amp;", "&"), "city_alt")):
            if base == "city_alt" and spelling == city:
                continue
            hit = False
            pat1 = rf"{re.escape(spelling)}(</a> &rarr; <span)"
            if re.search(pat1, body):
                body = re.sub(pat1, "{{" + base + "}}\\1", body)
                hit = True
            pat2 = rf"(?<= in ){re.escape(spelling)}(?![\w-])"
            if re.search(pat2, body):
                body = re.sub(pat2, "{{" + base + "}}", body)
                hit = True
            if hit and base == "city_alt":
                entry["city_alt"] = spelling
    body = replace_spellings(body, name, "name", entry)
    for i, lit in enumerate(PROTECTED_LITERALS):
        body = body.replace(f"\x00P{i}\x00", lit)
    body = mask(body, rf"/{cluster}/(?!bedrijf)([a-z0-9-]+)/", "{{city_slug}}", "city_slug", entry, rel, required=False)

    # Rating- en contact-rij worden sub-templates: de aan/afwezigheid en volgorde
    # van website/tel/rating creëert anders tientallen body-varianten.
    rows = {}
    for key, pattern in (
        ("rating_row", r'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;">.*?</div>'),
        ("contact_row", r'<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-size:14px;">.*?</div>'),
    ):
        m = re.search(pattern, body, re.S)
        if m:
            rows[key] = m.group(0)
            body = body[: m.start()] + "{{" + key + "}}" + body[m.end():]
    if siblings:
        entry["siblings"] = siblings
    return body, entry, rows


def render_bedrijf_content(entry: dict, body_tpl: str, fragments: dict) -> str:
    out = body_tpl
    for row in ("rating_row", "contact_row"):
        if row in entry:
            out = out.replace("{{" + row + "}}", fragments[f"row.{row}.{entry[row]}"])
    if "siblings" in entry:
        tiles = []
        for s in entry["siblings"]:
            tile = TILE_SHAPES["rated" if "rating" in s else "unrated"]
            for key, val in s.items():
                tile = tile.replace("{{" + key + "}}", val)
            tiles.append(tile)
        out = out.replace("{{tiles}}", "".join(tiles))
    for key in ("name", "name_alt", "city", "city_alt", "city_slug", "rating_disp",
                "reviews_disp", "reviews", "maps_href", "maps_cid_href", "website", "tel", "tel_disp"):
        if key in entry:
            out = out.replace("{{" + key + "}}", entry[key])
    if "{{" in out:
        raise ParseError(f"onvervulde placeholder in bedrijf '{entry['name']}'")
    return out


TILE_SHAPES = {
    "rated": '<a href="{{href}}" class="tile">{{name}} <span style="color:rgba(61,46,30,0.4);font-weight:400;">&#9733; {{rating}}</span></a>',
    "unrated": '<a href="{{href}}" class="tile">{{name}}</a>',
}


def parse_vakstad_fragment(html: str, rel: str, page_slug: str, h1_city: str):
    """Vak×stad-tekstpagina → (template, datarij). Variabelen: stad (+alt), stad-slug,
    provincie (+slug). Steden die gelijk heten aan hun provincie worden vanzelf een
    eigen template-variant (onherleidbaar onder byte-pariteit)."""
    m = re.search(h1_city, html)
    if not m:
        raise ParseError(f"{rel}: stadsnaam niet in h1 gevonden ({h1_city})")
    city = m.group(1)
    city_slug = page_slug.rsplit("/", 1)[1]
    entry = {"city": city, "city_slug": city_slug}

    body = html
    prov_m = re.search(r"/nieuwbouw/([a-z-]+)/", body)
    if prov_m:
        prov_slug = prov_m.group(1)
        if prov_slug not in PROVINCES:
            raise ParseError(f"{rel}: onbekende provincie-slug '{prov_slug}'")
        entry["prov_slug"] = prov_slug
        entry["prov"] = PROVINCES[prov_slug]
        body = re.sub(bounded(entry["prov"]), "{{prov}}", body)
        body = re.sub(bounded(prov_slug), "{{prov_slug}}", body)

    body = replace_spellings(body, city, "city", entry)
    body = re.sub(bounded(city_slug), "{{city_slug}}", body)
    return body, entry


def render_vakstad_content(entry: dict, body_tpl: str) -> str:
    out = body_tpl
    for key in ("city", "city_alt", "city_slug", "prov", "prov_slug"):
        if key in entry:
            out = out.replace("{{" + key + "}}", entry[key])
    if "{{" in out:
        raise ParseError(f"onvervulde placeholder in vakstad '{entry['city_slug']}'")
    return out


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
    """Vervang stad- en bedrijf-fragmenten door content-templates + data (pariteit verplicht).

    Transactioneel: eerst wordt ALLES geparseerd en gegroepeerd; pas als dat
    volledig slaagt worden bestanden geschreven en fragmenten verwijderd. Een
    ParseError halverwege laat de cluster-data dus onaangeroerd."""
    ddir, tdir = data_dir(cluster), tpl_dir(cluster)
    pages = json.loads((ddir / "pages.json").read_text())

    # ---- fase 1: parsen (geen mutaties) ----
    city_bodies, cities, card_shapes = {}, {}, {}
    bedrijf_bodies, bedrijven = {}, {}
    city_pages, bedrijf_pages = [], []
    vakstad_bodies, vaksteden, vakstad_pages = {}, {}, []
    vakstad_cfg = VAKSTAD_CLUSTERS.get(cluster)
    for page in pages:
        frag = ddir / "content" / f"{page['slug'].replace('/', '__')}.html"
        if page.get("content_kind") or not frag.exists():
            continue
        if vakstad_cfg and page["slug"].count("/") == vakstad_cfg.get("depth", 2) - 1:
            body, entry = parse_vakstad_fragment(frag.read_text(), page["file"], page["slug"], vakstad_cfg["h1_city"])
            vak = page["slug"].rsplit("/", 1)[0].replace("/", "__")
            vakstad_bodies.setdefault(vak, {})[page["file"]] = {"_skeleton": body}
            vaksteden[page["slug"]] = entry
            vakstad_pages.append((page, frag, vak))
            continue
        if page["slug"].startswith("bedrijf/"):
            body, entry, rows = parse_bedrijf_fragment(frag.read_text(), page["file"], cluster)
            bedrijf_bodies[page["file"]] = {"_skeleton": body}
            bedrijven[page["slug"]] = entry
            bedrijf_pages.append((page, frag, rows))
            continue
        parsed = parse_city_fragment(frag.read_text(), page["file"], cluster)
        if not parsed:
            continue
        body, entry, shapes = parsed
        city_bodies[page["file"]] = {"_skeleton": body}
        for c, shape in zip(entry["companies"], shapes):
            card_shapes.setdefault(shape, []).append(c)
        cities[page["slug"]] = entry
        city_pages.append((page, frag, shapes))

    if not city_pages and not bedrijf_pages and not vakstad_pages:
        print("extract-content: geen content-fragmenten gevonden om te migreren")
        return

    vakstad_names = {}  # per vak: rel → templatenaam
    vakstad_blobs = {}  # f"{vak}.{variant}" → blob
    for vak, bodies in vakstad_bodies.items():
        names, blobs = name_variants(bodies, "_skeleton", f"vakstad {vak}")
        for rel, n in names.items():
            vakstad_names[rel] = f"{vak}.{n}"
        for n, blob in blobs.items():
            vakstad_blobs[f"{vak}.{n}"] = blob

    city_body_names = city_body_blobs = shape_names = None
    if city_pages:
        city_body_names, city_body_blobs = name_variants(city_bodies, "_skeleton", "content-template stad")
        shape_names = {}
        for i, (shape, _) in enumerate(sorted(card_shapes.items(), key=lambda kv: -len(kv[1]))):
            if i >= len(VARIANT_NAMES):
                raise ParseError(f"kaartvormen: {i + 1}+ varianten — kaart-slots eerst uitbreiden")
            shape_names[shape] = ["rated", "unrated"][i] if i < 2 else VARIANT_NAMES[i]

    bedrijf_body_names = bedrijf_body_blobs = None
    row_variants = {}
    if bedrijf_pages:
        bedrijf_body_names, bedrijf_body_blobs = name_variants(bedrijf_bodies, "_skeleton", "content-template bedrijf")
        for row_key in ("rating_row", "contact_row"):
            rows_by_page = {
                page["file"]: {"_skeleton": rows[row_key]}
                for page, _, rows in bedrijf_pages if row_key in rows
            }
            if rows_by_page:
                row_variants[row_key] = name_variants(rows_by_page, "_skeleton", f"rij {row_key}")

    # ---- fase 2: wegschrijven (alle parsing is geslaagd) ----
    if city_pages:
        for name, blob in city_body_blobs.items():
            (tdir / f"content.city.{name}.html").write_text(blob)
        for shape, name in shape_names.items():
            (tdir / f"card.{name}.html").write_text(shape)
        for page, frag, shapes in city_pages:
            for c, shape in zip(cities[page["slug"]]["companies"], shapes):
                c["shape"] = shape_names[shape]
            cities[page["slug"]]["template"] = city_body_names[page["file"]]
            page["content_kind"] = "city"
            frag.unlink()
        (ddir / "cities.json").write_text(json.dumps(cities, ensure_ascii=False, indent=1) + "\n")
        print(
            f"extract-content: {len(city_pages)} stadspagina's → {len(city_body_blobs)} template(s) + "
            f"{len(shape_names)} kaartvormen ({sum(len(e['companies']) for e in cities.values())} vermeldingen)"
        )

    if bedrijf_pages:
        for name, blob in bedrijf_body_blobs.items():
            (tdir / f"content.bedrijf.{name}.html").write_text(blob)
        for row_key, (row_names, row_blobs) in row_variants.items():
            for name, blob in row_blobs.items():
                (tdir / f"row.{row_key}.{name}.html").write_text(blob)
            for page, _, rows in bedrijf_pages:
                if row_key in rows:
                    bedrijven[page["slug"]][row_key] = row_names[page["file"]]
        for page, frag, _ in bedrijf_pages:
            bedrijven[page["slug"]]["template"] = bedrijf_body_names[page["file"]]
            page["content_kind"] = "bedrijf"
            frag.unlink()
        (ddir / "bedrijven.json").write_text(json.dumps(bedrijven, ensure_ascii=False, indent=1) + "\n")
        print(
            f"extract-content: {len(bedrijf_pages)} bedrijfspagina's → {len(bedrijf_body_blobs)} body-template(s), "
            f"rijvarianten: { {k: len(v[1]) for k, v in row_variants.items()} }"
        )

    if vakstad_pages:
        for name, blob in vakstad_blobs.items():
            (tdir / f"content.vakstad.{name}.html").write_text(blob)
        for page, frag, vak in vakstad_pages:
            vaksteden[page["slug"]]["template"] = vakstad_names[page["file"]]
            page["content_kind"] = "vakstad"
            frag.unlink()
        (ddir / "vaksteden.json").write_text(json.dumps(vaksteden, ensure_ascii=False, indent=1) + "\n")
        per_vak = {}
        for name in vakstad_blobs:
            per_vak[name.split(".")[0]] = per_vak.get(name.split(".")[0], 0) + 1
        print(
            f"extract-content: {len(vakstad_pages)} vak×stad-pagina's → {len(vakstad_blobs)} template(s) "
            f"over {len(per_vak)} vakken (varianten per vak: {per_vak})"
        )

    (ddir / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")


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
    parsed = {rel: parse_page((ROOT / rel).read_text(), rel, cluster) for rel in CLUSTERS[cluster]}

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
        for opt in ("og_title", "og_description", "og_url", "og_image", "twitter_card"):
            if p.get(opt) is not None and p[opt] != entry.get(opt.replace("og_title", "title").replace("og_description", "description")):
                if opt == "og_title" and p[opt] == p["title"]:
                    continue
                if opt == "og_description" and p[opt] == p["description"]:
                    continue
                if opt == "og_url" and p[opt] == SITE + p["path"]:
                    continue
                entry[opt] = p[opt]
        for key, val in p.items():
            if key.startswith("footer_"):
                entry[key] = val
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
    bedrijven_file = data_dir(cluster) / "bedrijven.json"
    bedrijven = json.loads(bedrijven_file.read_text()) if bedrijven_file.exists() else {}
    vaksteden_file = data_dir(cluster) / "vaksteden.json"
    vaksteden = json.loads(vaksteden_file.read_text()) if vaksteden_file.exists() else {}
    card_shapes = {name.split(".", 1)[1]: blob for name, blob in fragments.items() if name.startswith("card.")}
    mismatches = []
    for page in pages:
        template = fragments[f"template.{page['template']}"]
        if page.get("content_kind") == "city":
            entry = cities[page["slug"]]
            content = render_city_content(entry, fragments[f"content.city.{entry['template']}"], card_shapes)
        elif page.get("content_kind") == "bedrijf":
            entry = bedrijven[page["slug"]]
            content = render_bedrijf_content(entry, fragments[f"content.bedrijf.{entry['template']}"], fragments)
        elif page.get("content_kind") == "vakstad":
            entry = vaksteden[page["slug"]]
            content = render_vakstad_content(entry, fragments[f"content.vakstad.{entry['template']}"])
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
