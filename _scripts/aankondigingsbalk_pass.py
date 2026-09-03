#!/usr/bin/env python3
"""Zet de aankondigingsbalk voor de Beurs Eigen Huis op elke statische pagina.

WAAROM IN DE HTML EN NIET VIA JAVASCRIPT
Een balk die na het laden wordt ingevoegd duwt de hele pagina omlaag: bij elke
paginaweergave een zichtbare sprong. Dat is precies de irritatie die de
verspringende tekening op de homepage veroorzaakte. In de HTML staat hij er
meteen, en verschuift er niets.

De prijs is een grote wijziging over 8.713 bestanden. Die is te overzien omdat
hij in één keer terug te draaien is: `--verwijder` haalt het blok er overal weer
uit, en het blok is herkenbaar aan zijn eigen data-attribuut.

DE BALK IS TIJDELIJK. De beurs is 9, 10 en 11 oktober 2026; aanvragen sluit op
5 oktober. Draai daarna `--verwijder`.

Bewust géén wegklik-knop: die vraagt om een voorkeur uit localStorage, en die
kan pas ná de eerste tekening gelezen worden — waarmee de sprong die we hier
vermijden alsnog terug is, juist bij de terugkerende bezoeker.

De balk staat vóór de navigatie en is niet sticky: hij schuift weg zodra je
scrollt, waarna de navigatie gewoon bovenaan blijft plakken.

Gebruik:
    python3 _scripts/aankondigingsbalk_pass.py --dry
    python3 _scripts/aankondigingsbalk_pass.py
    python3 _scripts/aankondigingsbalk_pass.py --verwijder
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DRY = "--dry" in sys.argv
WEG = "--verwijder" in sys.argv

MERK = "data-aankondiging=\"beurs2026\""

# Eén bron voor de tekst; de Next-laag toont exact dezelfde regels via
# web/app/components/Aankondiging.tsx.
BALK = (
    f'<div {MERK} style="background:#1A1208;color:#F5F0E8;font-size:13.5px;'
    'line-height:1.5;padding:10px 20px;text-align:center;">'
    '<span style="font-weight:700;">25 gratis kaarten voor de Beurs Eigen Huis</span>'
    '<span style="opacity:.62;"> &middot; 9 t/m 11 oktober, Jaarbeurs Utrecht &middot; </span>'
    '<a href="/beurs-eigen-huis/" style="color:#F5F0E8;font-weight:700;'
    'text-decoration:underline;text-underline-offset:3px;">Vraag je kaarten aan</a>'
    '</div>'
)

OVERSLAAN = ("web/", "node_modules/", ".git/", ".claude/", "_og-templates/",
             "output/", "docs/", "reports/", "_audits/")


def paginas():
    for pad, mappen, bestanden in os.walk(ROOT):
        rel = os.path.relpath(pad, ROOT).replace(os.sep, "/") + "/"
        if any(rel.startswith(o) or f"/{o}" in f"/{rel}" for o in OVERSLAAN):
            mappen[:] = []
            continue
        for b in bestanden:
            if b.endswith(".html"):
                yield os.path.join(pad, b)


def main():
    gedaan = overgeslagen = zonder_body = 0
    for p in paginas():
        try:
            h = open(p, encoding="utf8").read()
        except (UnicodeDecodeError, OSError):
            continue

        heeft = MERK in h
        if WEG:
            if not heeft:
                overgeslagen += 1
                continue
            nieuw = re.sub(r'<div data-aankondiging="beurs2026".*?</div>\s*', "", h,
                           count=1, flags=re.S)
        else:
            if heeft:
                overgeslagen += 1
                continue
            m = re.search(r"<body[^>]*>", h)
            if not m:
                zonder_body += 1
                continue
            nieuw = h[:m.end()] + BALK + h[m.end():]

        if nieuw != h:
            if not DRY:
                open(p, "w", encoding="utf8").write(nieuw)
            gedaan += 1

    actie = "verwijderd van" if WEG else "geplaatst op"
    print(f"{'DROOGDRAAI — ' if DRY else ''}{actie} {gedaan} pagina's, "
          f"{overgeslagen} hadden hem al {'niet' if WEG else 'wel'}"
          + (f", {zonder_body} zonder <body>" if zonder_body else ""))


if __name__ == "__main__":
    main()
