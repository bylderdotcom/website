#!/usr/bin/env python3
# ============================================================================
# CLUSTER-GENERATOR — build-time generatie, cluster voor cluster.
#
#   python3 scripts/generate_cluster.py extract bouwvergunning   # eenmalig: bootstrap
#   python3 scripts/generate_cluster.py build bouwvergunning     # data+template → HTML
#   python3 scripts/generate_cluster.py check bouwvergunning     # byte-pariteit vs disk
#
# Model per cluster:
#   templates/clusters/<cluster>/page.html            gedeelde chrome (head/nav/style/…)
#   templates/clusters/<cluster>/aside.<naam>.html    gedeelde aside-varianten
#   templates/clusters/<cluster>/footer.<naam>.html   gedeelde footer-varianten
#   data/clusters/<cluster>/pages.json                per pagina: meta + varianten
#   data/clusters/<cluster>/content/<slug>.html       artikel-content (verbatim), met
#                                                     {{aside}} waar een gedeelde aside zat
#
# De extract-modus is de inverse van build: na extract moet `check` 100% byte-
# identiek zijn. Elke chrome-wijziging daarna = één template-edit + `build`.
# Alleen stdlib; geen dependencies.
# ============================================================================
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.bylder.com"

# Per cluster: welke bestanden horen erbij (relatief aan repo-root).
CLUSTERS = {
    "bouwvergunning": sorted(
        p.relative_to(ROOT).as_posix() for p in (ROOT / "bouwvergunning").rglob("index.html")
    ),
}


def slug_of(rel_path: str, cluster: str) -> str:
    # "bouwvergunning/dakkapel/index.html" → "dakkapel"; hub-index → "index"
    parts = Path(rel_path).parts
    return "index" if len(parts) == 2 else "/".join(parts[1:-1])


# ---------------------------------------------------------------------------
# Parsen: strikt geanchord — een pagina die niet matcht is een variant die we
# expliciet willen zien (extract faalt dan luid, geen stille gaten).
# ---------------------------------------------------------------------------
class ParseError(Exception):
    pass


def parse_page(html: str, rel_path: str) -> dict:
    def grab(pattern, required=True, flags=0):
        m = re.search(pattern, html, flags)
        if not m and required:
            raise ParseError(f"{rel_path}: patroon niet gevonden: {pattern[:60]}")
        return m

    title = grab(r"<title>(.*?)</title>", flags=re.S).group(1)
    desc = grab(r'<meta name="description" content="(.*?)">').group(1)
    canonical = grab(r'<link rel="canonical" href="(.*?)">').group(1)
    og_type = grab(r'<meta property="og:type" content="(.*?)">').group(1)
    og_title = grab(r'<meta property="og:title" content="(.*?)">').group(1)
    og_desc = grab(r'<meta property="og:description" content="(.*?)">').group(1)
    og_url = grab(r'<meta property="og:url" content="(.*?)">').group(1)
    robots = grab(r'<meta name="robots" content="(.*?)">').group(1)
    og_image = grab(r'<meta property="og:image" content="(.*?)">', required=False)
    twitter = grab(r'<meta name="twitter:card" content="(.*?)">', required=False)
    gstatic = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' in html

    if not canonical.startswith(SITE):
        raise ParseError(f"{rel_path}: canonical buiten {SITE}: {canonical}")
    expected = canonical[len(SITE):]
    if og_title != title or og_desc != desc or og_url != canonical:
        raise ParseError(f"{rel_path}: og-velden wijken af van title/description/canonical")

    ldjson = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    for block in ldjson:
        json.loads(block)  # moet geldige JSON zijn

    nav_m = grab(r"<body>(<nav.*?</nav>)", flags=re.S)
    style_m = grab(r"<style>.*?</style>", flags=re.S)
    footer_m = grab(r"<footer.*?</footer>", flags=re.S)
    main = html[nav_m.end(1): footer_m.start()]
    tail = html[footer_m.end():]

    return {
        "path": expected,
        "title": title,
        "description": desc,
        "og_type": og_type,
        "robots": robots,
        "og_image": og_image.group(1) if og_image else None,
        "twitter_card": twitter.group(1) if twitter else None,
        "preconnect_gstatic": gstatic,
        "ldjson": ldjson,
        "_nav": nav_m.group(1),
        "_style": style_m.group(0),
        "_footer": footer_m.group(0),
        "_main": main,
        "_head_prefix": html[: html.find("<title>")],
        "_tail": tail,
    }


# ---------------------------------------------------------------------------
# Renderen — exact de inverse van parse_page.
# ---------------------------------------------------------------------------
def render_page(page: dict, tpl: str, fragments: dict, content: str) -> str:
    aside = fragments.get(f"aside.{page['aside']}") if page.get("aside") else None
    main = content.replace("{{aside}}", aside) if aside else content
    head_extra = ""
    if page.get("og_image"):
        head_extra += f'\n<meta property="og:image" content="{page["og_image"]}">'
    if page.get("twitter_card"):
        head_extra += f'\n<meta name="twitter:card" content="{page["twitter_card"]}">'
    gstatic = (
        '\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        if page.get("preconnect_gstatic")
        else ""
    )
    ldjson = "".join(
        f'\n<script type="application/ld+json">{b}</script>' for b in page["ldjson"]
    )
    url = SITE + page["path"]
    out = tpl
    for key, val in {
        "{{title}}": page["title"],
        "{{description}}": page["description"],
        "{{url}}": url,
        "{{og_type}}": page["og_type"],
        "{{robots}}": page["robots"],
        "{{head_extra}}": head_extra,
        "{{preconnect_gstatic}}": gstatic,
        "{{ldjson}}": ldjson,
        "{{main}}": main,
        "{{footer}}": fragments[f"footer.{page['footer']}"],
    }.items():
        out = out.replace(key, val)
    return out


PAGE_TEMPLATE = """{{head_prefix}}<title>{{title}}</title>
<meta name="description" content="{{description}}">
<link rel="canonical" href="{{url}}">
<meta property="og:type" content="{{og_type}}">
<meta property="og:title" content="{{title}}">
<meta property="og:description" content="{{description}}">
<meta property="og:url" content="{{url}}">{{head_extra}}
<meta name="robots" content="{{robots}}">
<link rel="preconnect" href="https://fonts.googleapis.com">{{preconnect_gstatic}}
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">{{ldjson}}
{{style}}
</head>
<body>{{nav}}{{main}}{{footer}}{{tail}}"""


def tpl_dir(cluster):
    return ROOT / "templates" / "clusters" / cluster


def data_dir(cluster):
    return ROOT / "data" / "clusters" / cluster


# ---------------------------------------------------------------------------
# extract — bootstrap template/fragments/data uit de bestaande HTML.
# ---------------------------------------------------------------------------
def extract(cluster: str):
    pages = []
    parsed = {}
    for rel in CLUSTERS[cluster]:
        parsed[rel] = parse_page((ROOT / rel).read_text(), rel)

    # Footer-varianten: aparte fragment-bestanden per unieke variant (meest gebruikte eerst).
    seen = {}
    for rel, p in parsed.items():
        h = hashlib.md5(p["_footer"].encode()).hexdigest()
        seen.setdefault(h, {"blob": p["_footer"], "pages": []})["pages"].append(rel)
    footer_variants = sorted(seen.values(), key=lambda v: -len(v["pages"]))
    names = ["default", "hub", "extra1", "extra2"]
    if len(footer_variants) > len(names):
        raise ParseError(f"_footer: {len(footer_variants)} varianten, breid namenlijst uit")
    footer_names = {}
    for i, v in enumerate(footer_variants):
        for rel in v["pages"]:
            footer_names[rel] = names[i]
        (tpl_dir(cluster) / f"footer.{names[i]}.html").parent.mkdir(parents=True, exist_ok=True)
        (tpl_dir(cluster) / f"footer.{names[i]}.html").write_text(v["blob"])

    # Nav/style/head-prefix/tail moeten cluster-uniform zijn (anders: eerst opschonen).
    for key in ("_nav", "_style", "_head_prefix", "_tail"):
        blobs = {p[key] for p in parsed.values()}
        if len(blobs) != 1:
            raise ParseError(f"{key} is niet uniform over het cluster ({len(blobs)} varianten)")
    ref = parsed[CLUSTERS[cluster][0]]

    # Aside-varianten: byte-identieke asides in main → {{aside}} + fragment.
    aside_re = re.compile(r"<aside.*?</aside>", re.S)
    aside_count = {}
    for rel, p in parsed.items():
        m = aside_re.search(p["_main"])
        if m:
            aside_count.setdefault(m.group(0), []).append(rel)
    aside_names = {}
    shared = [(blob, rels) for blob, rels in aside_count.items() if len(rels) > 1]
    for i, (blob, rels) in enumerate(sorted(shared, key=lambda x: -len(x[1]))):
        name = ["project", "thema", "extra1", "extra2"][i]
        (tpl_dir(cluster) / f"aside.{name}.html").write_text(blob)
        for rel in rels:
            aside_names[rel] = (name, blob)

    # Template + content-fragmenten + pages.json wegschrijven.
    tpl = PAGE_TEMPLATE.replace("{{head_prefix}}", ref["_head_prefix"])
    tpl = tpl.replace("{{style}}", ref["_style"]).replace("{{nav}}", ref["_nav"])
    tpl = tpl.replace("{{tail}}", ref["_tail"])
    (tpl_dir(cluster) / "page.html").write_text(tpl)

    (data_dir(cluster) / "content").mkdir(parents=True, exist_ok=True)
    for rel in CLUSTERS[cluster]:
        p, slug = parsed[rel], slug_of(rel, cluster)
        main = p["_main"]
        aside = None
        if rel in aside_names:
            aside, blob = aside_names[rel]
            main = main.replace(blob, "{{aside}}")
        (data_dir(cluster) / "content" / f"{slug.replace('/', '__')}.html").write_text(main)
        pages.append({
            "slug": slug,
            "file": rel,
            "path": p["path"],
            "title": p["title"],
            "description": p["description"],
            "og_type": p["og_type"],
            "robots": p["robots"],
            "og_image": p["og_image"],
            "twitter_card": p["twitter_card"],
            "preconnect_gstatic": p["preconnect_gstatic"],
            "footer": footer_names[rel],
            "aside": aside,
            "ldjson": p["ldjson"],
        })
    (data_dir(cluster) / "pages.json").write_text(
        json.dumps(pages, ensure_ascii=False, indent=1) + "\n"
    )
    print(f"extract: {len(pages)} pagina's → {data_dir(cluster).relative_to(ROOT)} + {tpl_dir(cluster).relative_to(ROOT)}")
    print(f"  footer-varianten: {len(footer_variants)}, gedeelde asides: {sorted({v[0] for v in aside_names.values()})}")


# ---------------------------------------------------------------------------
# build / check
# ---------------------------------------------------------------------------
def build(cluster: str, check_only: bool) -> int:
    tpl = (tpl_dir(cluster) / "page.html").read_text()
    fragments = {
        f.stem: f.read_text()
        for f in tpl_dir(cluster).glob("*.html")
        if f.name != "page.html"
    }
    pages = json.loads((data_dir(cluster) / "pages.json").read_text())
    mismatches = []
    for page in pages:
        content = (data_dir(cluster) / "content" / f"{page['slug'].replace('/', '__')}.html").read_text()
        out = render_page(page, tpl, fragments, content)
        target = ROOT / page["file"]
        if check_only:
            current = target.read_text() if target.exists() else None
            if current != out:
                mismatches.append(page["file"])
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(out)
    if check_only:
        ok = len(pages) - len(mismatches)
        print(f"check: {ok}/{len(pages)} byte-identiek")
        for f in mismatches:
            print(f"   MISMATCH: {f}")
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
