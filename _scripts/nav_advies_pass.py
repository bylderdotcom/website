#!/usr/bin/env python3
"""Advies-pass (2026-08-29): voegt het menu 'Advies' toe aan de bn2-hoofdnav.

De Next-routes krijgen hun nav uit web/app/components/Nav.tsx; die is los
bijgewerkt. De statische pagina's dragen elk hun eigen kopie van dezelfde nav
(de bn2-variant uit de veegronde van eind augustus), dus daar moet het menu
er per bestand in. Twee plekken per pagina: de desktopbalk (div.bn2-m) en het
mobiele uitklapmenu (details.bn2-det in div.bn2-sheet).

Het menu komt tussen Diensten en Kortingsvouchers te staan: advies gaat vooraf
aan kopen, niet erna.

Idempotent: pagina's waar 'Advies' al in de nav staat worden overgeslagen, dus
de pass mag zo vaak draaien als nodig.

Gebruik:
    python3 _scripts/nav_advies_pass.py --dry
    python3 _scripts/nav_advies_pass.py
"""
import os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DRY = "--dry" in sys.argv

# Mappen die niet gedeployed worden of hun eigen nav hebben (zie web/build.sh).
SKIP_DIRS = {".git", "node_modules", "web", "output", "bylder-seo-v3", "bylder-seo-v4",
             "bylder-seo-v5", "templates", "docs", "_og-templates", ".claude",
             "__pycache__", "en-us", ".next", "out"}

PIJL = ('<svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true">'
        '<path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" '
        'stroke-linecap="round"/></svg>')

# De twee koppen zijn primair (bn2-p, met subregel); de negen artikelen zijn
# secundair (bn2-s). Zelfde opbouw als de andere menu's, zodat de nav overal
# identiek blijft — dat was de hele inzet van de veegronde.
DESK = (
    '<div class="bn2-m"><button type="button" class="bn2-btn">Advies' + PIJL + '</button>'
    '<div class="bn2-dd">'
    '<a href="/kopersbegeleiding-nieuwbouw/" class="bn2-p"><strong>Woningregisseur</strong>'
    '<span>E&eacute;n plan voor verbouwen, afwerken en inrichten &mdash; gratis</span></a>'
    '<a href="/kopersbegeleiding-nieuwbouw/#ai-kopersbegeleider" class="bn2-p">'
    '<strong>AI Kopersbegeleider</strong>'
    '<span>Direct antwoord op je meerwerk- en keuzevragen, 24/7</span></a>'
    '<div class="bn2-sep"></div>'
    '<a href="/kopersbegeleiding/meerwerklijst-nieuwbouw-controleren/" class="bn2-s">Meerwerklijst controleren</a>'
    '<a href="/kopersbegeleiding/sluitingsdata-meerwerk-deadlines/" class="bn2-s">Sluitingsdata &amp; deadlines</a>'
    '<a href="/kopersbegeleiding/bouwkundig-meerwerk-indeling/" class="bn2-s">Bouwkundig &amp; indeling</a>'
    '<a href="/kopersbegeleiding/elektra-lichtplan-nieuwbouw/" class="bn2-s">Elektra &amp; lichtplan</a>'
    '<a href="/kopersbegeleiding/keuken-badkamer-casco-opleveren/" class="bn2-s">Keuken &amp; badkamer casco</a>'
    '<a href="/kopersbegeleiding/klimaat-vloerkoeling-nieuwbouw/" class="bn2-s">Klimaat &amp; vloerkoeling</a>'
    '<a href="/kopersbegeleiding/onafhankelijke-kopersbegeleider-bouwkundig/" class="bn2-s">Onafhankelijke kopersbegeleider</a>'
    '</div></div>')

MOB = (
    '<details class="bn2-det"><summary class="bn2-sum">Advies</summary><div>'
    '<a href="/kopersbegeleiding-nieuwbouw/" class="bn2-mi p">Woningregisseur</a>'
    '<a href="/kopersbegeleiding-nieuwbouw/#ai-kopersbegeleider" class="bn2-mi p">AI Kopersbegeleider</a>'
    '<a href="/kopersbegeleiding/meerwerklijst-nieuwbouw-controleren/" class="bn2-mi">Meerwerklijst controleren</a>'
    '<a href="/kopersbegeleiding/sluitingsdata-meerwerk-deadlines/" class="bn2-mi">Sluitingsdata &amp; deadlines</a>'
    '<a href="/kopersbegeleiding/bouwkundig-meerwerk-indeling/" class="bn2-mi">Bouwkundig &amp; indeling</a>'
    '<a href="/kopersbegeleiding/elektra-lichtplan-nieuwbouw/" class="bn2-mi">Elektra &amp; lichtplan</a>'
    '<a href="/kopersbegeleiding/keuken-badkamer-casco-opleveren/" class="bn2-mi">Keuken &amp; badkamer casco</a>'
    '<a href="/kopersbegeleiding/klimaat-vloerkoeling-nieuwbouw/" class="bn2-mi">Klimaat &amp; vloerkoeling</a>'
    '<a href="/kopersbegeleiding/onafhankelijke-kopersbegeleider-bouwkundig/" class="bn2-mi">Onafhankelijke kopersbegeleider</a>'
    '</div></details>')

# Ankers: het menu komt vóór Kortingsvouchers. Beide ankers zijn letterlijk
# identiek op elke pagina — dat is precies wat de veegronde heeft opgeleverd.
DESK_ANKER = '<div class="bn2-m"><button type="button" class="bn2-btn">Kortingsvouchers'
MOB_ANKER = '<details class="bn2-det"><summary class="bn2-sum">Kortingsvouchers</summary>'


def verwerk(h):
    """Geeft (nieuwe_html, desk_toegevoegd, mob_toegevoegd) terug."""
    d = m = 0
    if '>Advies<' not in h:
        if DESK_ANKER in h:
            h = h.replace(DESK_ANKER, DESK + DESK_ANKER, 1); d = 1
        if MOB_ANKER in h:
            h = h.replace(MOB_ANKER, MOB + MOB_ANKER, 1); m = 1
    return h, d, m


def main():
    gewijzigd = overgeslagen = zonder_nav = 0
    scheef = []
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [x for x in dirnames if x not in SKIP_DIRS]
        for f in files:
            if not f.endswith(".html"):
                continue
            pad = os.path.join(dirpath, f)
            try:
                h = open(pad, encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            if "byl-nav2026" not in h:
                zonder_nav += 1
                continue
            if ">Advies<" in h:
                overgeslagen += 1
                continue
            nieuw, d, m = verwerk(h)
            if not (d and m):
                # Eén van de twee ankers ontbreekt: dan is deze nav niet de
                # variant waar deze pass op rekent. Niet half wegschrijven —
                # melden, zodat het opvalt in plaats van stil scheef te gaan.
                scheef.append(os.path.relpath(pad, ROOT))
                continue
            if not DRY:
                open(pad, "w", encoding="utf8").write(nieuw)
            gewijzigd += 1

    print(f"{'DROOGDRAAI — ' if DRY else ''}{gewijzigd} pagina's kregen het Advies-menu, "
          f"{overgeslagen} hadden het al, {zonder_nav} zonder bn2-nav overgeslagen.")
    if scheef:
        print(f"LET OP: {len(scheef)} pagina's met een afwijkende nav, niet aangeraakt:")
        for x in scheef[:10]:
            print("  ", x)


if __name__ == "__main__":
    main()
