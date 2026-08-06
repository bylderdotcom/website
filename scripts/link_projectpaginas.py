#!/usr/bin/env python3
"""Linkt projectnamen op gemeente- en provinciepagina's naar hun projectpagina.

WAAROM
------
Fable's audit (4 aug) noemde dit de goedkoopste openstaande winst: de
gemeentepagina's noemen projecten bij naam maar linken er niet naartoe. Dat is
geen kannibalisatie maar verspilde autoriteit — die pagina's staan al in de index
en sturen nu niemand door naar de nieuwe laag.

De projectpagina's hangen op dit moment aan één smalle brug: de hub, die zelf
vanuit geen enkele andere pagina wordt gelinkt. Elke link vanaf een bestaande
gemeentepagina is een tweede route.

HOE
---
Alleen de eerste vermelding per pagina wordt gelinkt, en alleen buiten bestaande
links, koppen en attributen. Idempotent: een naam die al gelinkt is wordt
overgeslagen, dus meermaals draaien verandert niets.

Gebruik:
    python3 scripts/link_projectpaginas.py --droog
    python3 scripts/link_projectpaginas.py
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DROOG = "--droog" in sys.argv or "--dry" in sys.argv


def slugify(naam, plaats):
    s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def laad_projecten():
    pages = json.load(open(os.path.join(
        ROOT, "data", "clusters", "nieuwbouw-project", "pages.json"), encoding="utf8"))
    live = {x["slug"] for x in pages
            if x["slug"] not in ("index", "oplevermonitor")
            and "noindex" not in (x.get("robots") or "")}
    prj = json.load(open(os.path.join(ROOT, "data", "nieuwbouwprojecten.json"),
                         encoding="utf8"))["projecten"]
    uit = {}
    for p in prj:
        sg = slugify(p["naam"], p["plaats"])
        # korte namen ("West", "Riva") linken we niet: te veel valse treffers in
        # lopende tekst.
        if sg in live and len(p["naam"]) >= 8:
            uit.setdefault(p["naam"], sg)
    return uit


def link_in(html, naam, slug):
    """Eerste vrije vermelding linken. Slaat alles binnen een tag, een bestaande
    link of een kop over."""
    doel = f'/nieuwbouw-project/{slug}/'
    if doel in html:
        return html, 0
    beschermd = []
    for m in re.finditer(r'<a\b[^>]*>.*?</a>|<h[1-6]\b[^>]*>.*?</h[1-6]>|<[^>]+>', html, re.S):
        beschermd.append((m.start(), m.end()))

    def vrij(i):
        return not any(a <= i < b for a, b in beschermd)

    for m in re.finditer(re.escape(naam), html):
        if not vrij(m.start()):
            continue
        return (html[:m.start()] + f'<a href="{doel}">{naam}</a>' + html[m.end():], 1)
    return html, 0


def main():
    projecten = laad_projecten()
    bestanden = (glob.glob(os.path.join(ROOT, "nieuwbouw", "**", "index.html"), recursive=True)
                 + glob.glob(os.path.join(ROOT, "wonen-in", "**", "index.html"), recursive=True))
    totaal = geraakt = 0
    for f in bestanden:
        h = open(f, encoding="utf8").read()
        origineel = h
        n = 0
        for naam, slug in projecten.items():
            if naam not in h:
                continue
            h, k = link_in(h, naam, slug)
            n += k
        if n and h != origineel:
            geraakt += 1
            totaal += n
            print(f"  {os.path.relpath(f, ROOT)[:56]:<58} {n} link(s)")
            if not DROOG:
                open(f, "w", encoding="utf8").write(h)
    print(f"\n{'DROOGDRAAI — ' if DROOG else ''}{totaal} links op {geraakt} pagina's")
    if not totaal:
        print("  (alles al gelinkt, of geen vermeldingen gevonden)")


if __name__ == "__main__":
    main()
