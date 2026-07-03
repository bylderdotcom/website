#!/usr/bin/env python3
# ============================================================================
# BRON-NORMALISATIE — eerste bewust byte-wijzigende opruimronde.
# Herstelt bugs uit de oorspronkelijke generator die de migratie blootlegde:
#
#  1. Gemixte encodings (rauwe & / ' / " naast &amp;/&#x27;/&quot; binnen één
#     pagina): alt-slots ({{name_alt}}/{{city_alt}}) verdwijnen — overal de
#     correcte escaped vorm. Rendert identiek, valide HTML.
#  2. Dubbele "kosten kosten" in renovatiekosten (h1/titles/ldjson).
#  3. og:url die naar de bovenliggende categorie wees (kopen-subcats).
#  4. Dubbele robots-meta in twee kopen-chromes.
#
# Na de placeholder-unificatie worden byte-identiek geworden template-
# varianten gededupliceerd (entries omgehangen, bestanden verwijderd).
# Eenmalig; idempotent (tweede run doet niets).
# ============================================================================
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLUSTERS = [p.name for p in (ROOT / "data" / "clusters").iterdir() if p.is_dir()]


def dedupe_templates(cluster: str, entries_by_file: dict) -> int:
    """Groepeer byte-identieke varianten binnen elke template-familie; hang
    entries om naar de canonieke naam en verwijder overtollige bestanden."""
    tdir = ROOT / "templates" / "clusters" / cluster
    removed = 0
    fams = defaultdict(list)
    for f in sorted(tdir.glob("*.html")):
        stem = f.stem  # bv. content.bedrijf.v4 / content.vakstad.schilder.v2
        fam, _, variant = stem.rpartition(".")
        # Alleen families waarvan we de verwijzingen hieronder ook omhangen;
        # footer/card/aside-varianten blijven staan (verwijzing zit elders).
        if not (fam == "template" or fam.startswith("content.") or fam.startswith("row.")):
            continue
        fams[fam].append((variant, f))
    remap = {}  # (fam, oude_variant) -> nieuwe_variant
    for fam, items in fams.items():
        by_hash = defaultdict(list)
        for variant, f in items:
            by_hash[hashlib.md5(f.read_bytes()).hexdigest()].append((variant, f))
        for group in by_hash.values():
            if len(group) < 2:
                continue
            group.sort(key=lambda x: (x[0] != "default", x[0]))
            keep = group[0][0]
            for variant, f in group[1:]:
                remap[(fam, variant)] = keep
                f.unlink()
                removed += 1
    if not remap:
        return 0
    # Entries omhangen. Verwijzingen: pages.json "template" (fam template.*),
    # cities/bedrijven/vaksteden "template" (content.city.* / content.bedrijf.* /
    # content.vakstad.<vak>.*), bedrijven "rating_row"/"contact_row" (row.*).
    for fname, data in entries_by_file.items():
        changed = False
        entries = data.values() if isinstance(data, dict) else data
        for e in entries:
            for key, fam_of in (
                ("template", lambda e, fn: template_family(fn, e)),
                ("rating_row", lambda e, fn: "row.rating_row"),
                ("contact_row", lambda e, fn: "row.contact_row"),
            ):
                if key not in e or e[key] is None:
                    continue
                fam = fam_of(e, fname)
                variant = e[key].rpartition(".")[2] if key == "template" and fname.endswith(("vaksteden.json",)) else e[key]
                if key == "template" and fname.endswith("vaksteden.json"):
                    vak = e[key].rpartition(".")[0]
                    fam = f"content.vakstad.{vak}"
                new = remap.get((fam, variant))
                if new:
                    e[key] = f"{vak}.{new}" if key == "template" and fname.endswith("vaksteden.json") else new
                    changed = True
        if changed:
            path = ROOT / "data" / "clusters" / cluster / fname
            path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    return removed


def template_family(fname: str, e: dict) -> str:
    if fname == "pages.json":
        return "template"
    if fname == "cities.json":
        return "content.city"
    if fname == "bedrijven.json":
        return "content.bedrijf"
    return "content.vakstad"


def main():
    # ---- 1. alt-placeholders unificeren in templates ----
    n_tpl = 0
    for f in (ROOT / "templates" / "clusters").rglob("*.html"):
        h = f.read_text()
        if "{{name_alt}}" in h or "{{city_alt}}" in h:
            f.write_text(h.replace("{{name_alt}}", "{{name}}").replace("{{city_alt}}", "{{city}}"))
            n_tpl += 1
    #      … en alt-velden uit de data
    n_alt = 0
    for f in (ROOT / "data" / "clusters").rglob("*.json"):
        if f.name not in ("bedrijven.json", "cities.json", "vaksteden.json"):
            continue
        data = json.loads(f.read_text())
        changed = False
        for e in data.values():
            for k in ("name_alt", "city_alt"):
                if k in e:
                    del e[k]
                    changed = True
                    n_alt += 1
        if changed:
            f.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(f"1. encoding-unificatie: {n_tpl} templates, {n_alt} alt-velden verwijderd")

    # ---- 2. dubbele "kosten kosten" (renovatiekosten) ----
    n_kk = 0
    for f in list((ROOT / "templates" / "clusters" / "renovatiekosten").glob("*.html")) + \
             [ROOT / "data" / "clusters" / "renovatiekosten" / "pages.json"]:
        h = f.read_text()
        if "kosten kosten" in h:
            n_kk += h.count("kosten kosten")
            f.write_text(h.replace("kosten kosten", "kosten"))
    print(f"2. dubbele 'kosten': {n_kk} voorkomens hersteld")

    # ---- 3. og:url-overrides die naar de verkeerde pagina wijzen (kopen) ----
    pj = ROOT / "data" / "clusters" / "kopen" / "pages.json"
    pages = json.loads(pj.read_text())
    n_og = 0
    for p in pages:
        if "og_url" in p:
            del p["og_url"]
            n_og += 1
    pj.write_text(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")
    print(f"3. og:url-overrides verwijderd: {n_og} (rendert nu de canonical)")

    # ---- 4. dubbele robots-meta in kopen-chromes ----
    n_rb = 0
    for f in (ROOT / "templates" / "clusters" / "kopen").glob("template.*.html"):
        h = f.read_text()
        line = '<meta name="robots" content="{{robots}}">'
        if h.count(line) > 1:
            first = h.index(line) + len(line)
            h = h[:first] + h[first:].replace("\n" + line, "", h.count(line) - 1)
            f.write_text(h)
            n_rb += 1
    print(f"4. dubbele robots-meta verwijderd uit {n_rb} chrome(s)")

    # ---- 5. dedupliceren van identiek geworden template-varianten ----
    total_removed = 0
    for cluster in sorted(CLUSTERS):
        ddir = ROOT / "data" / "clusters" / cluster
        entries_by_file = {}
        for fname in ("pages.json", "cities.json", "bedrijven.json", "vaksteden.json"):
            p = ddir / fname
            if p.exists():
                entries_by_file[fname] = json.loads(p.read_text())
        removed = dedupe_templates(cluster, entries_by_file)
        if removed:
            print(f"5. {cluster}: {removed} template-variant(en) samengevoegd")
        total_removed += removed
    print(f"totaal samengevoegd: {total_removed}")


if __name__ == "__main__":
    main()
