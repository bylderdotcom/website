#!/usr/bin/env python3
"""Zet dunne bedrijfsprofielen op noindex — voorzichtig, met Search Console als vangnet.

WAAROM
------
De bedrijfsprofielen halen het grootste deel van het zoekverkeer (Search Console,
juli–okt 2026: 888 profielpagina's met klikken, samen 3.607 klikken). Op 31 juli
ging alles op noindex en dat kostte klikken; dat herhalen we niet. De grens van
minstens 5 reviews (profielen_index_herstel.py) blijft dus staan.

Wat wél weg moet uit de index, zijn profielen die niet kloppen of niets zeggen:
  uitgesloten   bedrijf staat in data/vakbedrijven-uitgesloten.json (geen
                vakbedrijf: groothandel, betoncentrale, beleggingsmaatschappij…)
  adresgids     de "website" is een adresgids-pagina, niet de eigen site
  geen_contact  geen website én geen telefoonnummer

Vangnet: een profiel met klikken in Search Console blijft altijd in de index
(reports/gsc-paginas-*.csv, export "Pagina's", plus gsc_clicks uit
data/vakbedrijven.json). Google heeft dan al laten zien dat het profiel iets
oplevert voor een zoeker.

Dit script past alleen profielen aan die nu indexeerbaar zijn; het zet nooit iets
terug in de index. Daarna schrijft het de /bedrijf/-regels in <vak>-sitemap.xml
opnieuw uit pages.json, zodat sitemap en robots altijd hetzelfde zeggen (dat liep
uiteen: 28 sitemap-URL's zonder pagina, 23 indexeerbare pagina's zonder
sitemapregel).

Gebruik:
    python3 scripts/profielen_dun.py --droog
    python3 scripts/profielen_dun.py
"""
import csv, glob, json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAKKEN = ["loodgieter", "aannemer", "schilder", "elektricien",
          "stukadoor", "badkamer", "dakkapel", "gietvloer"]
SITE = "https://www.bylder.com"
DROOG = "--droog" in sys.argv

# Adresgidsen en directorysites die zich als bedrijfswebsite voordoen.
ADRESGIDS = re.compile(
    r"(netherbusi|netherbusinesses|nlcompanies|hollandsa|nlmap[a-z]*|bedrijvenpagina|"
    r"openingstijden|cylex|telefoonboek|goudengids|bedrijfsinformatie)", re.I)


def gsc_klikken():
    """Profielpaden met klikken, uit de nieuwste Search Console-export(s)."""
    uit = collections.Counter()
    for f in sorted(glob.glob(os.path.join(ROOT, "reports", "gsc-paginas-*.csv"))):
        for r in csv.DictReader(open(f, encoding="utf-8")):
            pad = r["Toppagina's"].replace(SITE, "")
            if "/bedrijf/" in pad:
                uit[pad] = max(uit[pad], int(r["Aantal klikken"] or 0))
    return uit


def main():
    gsc = gsc_klikken()
    db = {x["slug"]: x for x in json.load(open(os.path.join(ROOT, "data", "vakbedrijven.json")))["vakbedrijven"]}
    uitgesloten = json.load(open(os.path.join(ROOT, "data", "vakbedrijven-uitgesloten.json")))
    totaal = collections.Counter()

    for vak in VAKKEN:
        pj = os.path.join(ROOT, "data", "clusters", vak, "pages.json")
        pages = json.load(open(pj, encoding="utf8"))
        telling = collections.Counter()
        for p in pages:
            if p.get("content_kind") != "bedrijf" or "noindex" in (p.get("robots") or ""):
                continue
            rest = p["slug"][len("bedrijf/"):]
            dbslug = f"{vak}-{rest}"
            zonder2 = re.sub(r"-2$", "", dbslug)       # naamgenoten krijgen -2 op de site
            b = db.get(dbslug) or db.get(zonder2) or {}
            reden = None
            if dbslug in uitgesloten or zonder2 in uitgesloten:
                reden = "uitgesloten"
            elif b and b.get("website") and ADRESGIDS.search(b["website"]):
                reden = "adresgids"
            elif b and not b.get("website") and not b.get("telefoon"):
                reden = "geen_contact"
            if not reden:
                continue
            if gsc.get(p["path"], 0) > 0 or (b.get("gsc_clicks") or 0) > 0:
                telling["gered (klikken)"] += 1
                continue
            p["robots"] = "noindex,follow"
            telling[reden] += 1

        indexeerbaar = [p for p in pages if p.get("content_kind") == "bedrijf" and "noindex" not in (p.get("robots") or "")]
        print(f"  {vak:<12} noindex: {dict(telling)} · blijft indexeerbaar: {len(indexeerbaar)}")
        totaal.update(telling)
        if DROOG:
            continue
        json.dump(pages, open(pj, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        open(pj, "a").write("\n")
        schrijf_sitemap(vak, indexeerbaar)
    print(f"  totaal: {dict(totaal)}{'  (droog, niets geschreven)' if DROOG else ''}")


def schrijf_sitemap(vak, indexeerbaar):
    """Andere regels (pillar, steden) ongemoeid; /bedrijf/-regels opnieuw uit pages.json."""
    sm = os.path.join(ROOT, f"{vak}-sitemap.xml")
    regels = open(sm, encoding="utf8").read().splitlines()
    oud = {}
    for r in regels:
        m = re.search(r"<loc>([^<]*/bedrijf/[^<]*)</loc>.*?<lastmod>([^<]*)</lastmod>", r)
        if m:
            oud[m.group(1)] = m.group(2)
    houden = [r for r in regels if "/bedrijf/" not in r and r.strip() != "</urlset>"]
    nieuw = []
    for p in sorted(indexeerbaar, key=lambda p: p["path"]):
        loc = SITE + p["path"]
        lastmod = oud.get(loc, "2026-10-05")
        nieuw.append(f"  <url><loc>{loc}</loc><lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>")
    open(sm, "w", encoding="utf8").write("\n".join(houden + nieuw + ["</urlset>"]) + "\n")


if __name__ == "__main__":
    main()
