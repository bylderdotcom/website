#!/usr/bin/env python3
# ============================================================================
# GEO/AEO-LAAG over de indexeerbare template-clusters.
#
#   python3 scripts/add_geo_layer.py            # past templates aan
#   daarna: generate_cluster.py build <cluster> per cluster
#
# Wat het toevoegt (alleen op indexeerbare paginatypen):
#  - Stad-directorypagina's (8 stad+bedrijf-clusters, 2.155 pag): het bestaande
#    marktprijs-blok wordt een citeerbaar "Kort antwoord" (stad + aantal +
#    prijzen in één zelfstandige alinea) + zichtbare bijgewerkt/bron-regel.
#  - kopen (32.877) en project (5.620): bijgewerkt/bron-regel direct onder de
#    intro — datum + herkomst zijn de sterkste citatie-signalen voor
#    AI-zoekmachines.
#
# Idempotent: templates met een data-geo-marker worden overgeslagen.
# Noindex-clusters (offerte-check/renovatiekosten/aannemer-matching-leafs)
# worden bewust NIET aangeraakt.
# ============================================================================
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKER = 'data-geo="1"'
DATUM = "juli 2026"

CITY_CLUSTERS = ["gietvloer", "aannemer", "elektricien", "badkamer",
                 "dakkapel", "schilder", "loodgieter", "stukadoor"]
VAKSTAD_CLUSTERS = ["kopen", "project"]

BRON_REGEL = (
    f' <span style="display:block;margin-top:8px;font-size:12px;'
    f'color:rgba(61,46,30,0.45)" {MARKER}>Bijgewerkt: {DATUM} &middot; '
    f'Bron: Bylder-marktdata op basis van geanalyseerde offertes van leden.</span>'
)


def upgrade_city_templates(cluster: str) -> int:
    """Bestaand highlight-blok → citeerbaar 'Kort antwoord' + bron/datum."""
    changed = 0
    for tpl in sorted((ROOT / "templates" / "clusters" / cluster).glob("content.city.*.html")):
        html = tpl.read_text()
        if MARKER in html:
            continue
        # Vak-benaming oogsten uit de listing-kop ("{{count}} aannemers in {{city}}").
        noun_m = re.search(r'">\{\{count\}\} ([a-zë-]+) in \{\{city\}\}</h2>', html)
        if not noun_m:
            raise SystemExit(f"{tpl}: vak-benaming niet gevonden — anker checken")
        noun = noun_m.group(1)
        anchor = '<div class="highlight">'
        if anchor not in html:
            raise SystemExit(f"{tpl}: highlight-blok niet gevonden — anker checken")
        kort = (
            f'<div class="highlight" id="kort-antwoord"><strong>Kort antwoord:</strong> '
            f'in {{{{city}}}} vergelijk je {{{{count}}}} {noun} op reviews en marktprijs. '
        )
        html = html.replace(anchor, kort, 1)
        # Bron/datum-regel vóór het einde van datzelfde blok.
        i = html.index("</div>", html.index('id="kort-antwoord"'))
        html = html[:i] + BRON_REGEL + html[i:]
        tpl.write_text(html)
        changed += 1
    return changed


def add_dateline_vakstad(cluster: str) -> int:
    """Bijgewerkt/bron-regel direct onder de intro-alinea van elk vak-template."""
    regel = (
        f'\n    <p style="font-size:12.5px;color:rgba(61,46,30,0.45);'
        f'margin:-16px 0 28px" {MARKER}>Bijgewerkt: {DATUM} &middot; '
        f'Prijspeil: Nederland 2026 &middot; Bron: Bylder-marktdata</p>'
    )
    changed = 0
    for tpl in sorted((ROOT / "templates" / "clusters" / cluster).glob("content.vakstad.*.html")):
        html = tpl.read_text()
        if MARKER in html:
            continue
        # Anker: de eerste </p> ná de </h1> (de intro-alinea).
        h1_end = html.find("</h1>")
        if h1_end < 0:
            raise SystemExit(f"{tpl}: geen h1 gevonden")
        p_end = html.find("</p>", h1_end)
        if p_end < 0:
            raise SystemExit(f"{tpl}: geen intro-alinea gevonden")
        p_end += len("</p>")
        html = html[:p_end] + regel + html[p_end:]
        tpl.write_text(html)
        changed += 1
    return changed


def add_dateline_bedrijf(cluster: str) -> int:
    """Bijgewerkt/bron-regel in het neutraliteits-blok van bedrijfsprofielen."""
    regel = (
        f' <span style="display:block;margin-top:8px;font-size:12px;'
        f'color:rgba(61,46,30,0.45)" {MARKER}>Gegevens bijgewerkt: {DATUM} &middot; '
        f'Bron: Google &amp; OpenStreetMap (&copy; OpenStreetMap-bijdragers).</span>'
    )
    changed = 0
    for tpl in sorted((ROOT / "templates" / "clusters" / cluster).glob("content.bedrijf.*.html")):
        html = tpl.read_text()
        if MARKER in html:
            continue
        anchor = '<div class="highlight" style="margin-top:20px;">'
        if anchor not in html:
            raise SystemExit(f"{tpl}: neutraliteits-blok niet gevonden — anker checken")
        i = html.index("</div>", html.index(anchor))
        html = html[:i] + regel + html[i:]
        tpl.write_text(html)
        changed += 1
    return changed


def main():
    total = 0
    for c in CITY_CLUSTERS:
        n = upgrade_city_templates(c)
        total += n
        print(f"{c}: {n} stad-templates bijgewerkt")
    for c in VAKSTAD_CLUSTERS:
        n = add_dateline_vakstad(c)
        total += n
        print(f"{c}: {n} vakstad-templates bijgewerkt")
    for c in CITY_CLUSTERS:
        n = add_dateline_bedrijf(c)
        total += n
        print(f"{c}: {n} bedrijf-templates bijgewerkt")
    print(f"totaal: {total} templates — nu per cluster `generate_cluster.py build` draaien")


if __name__ == "__main__":
    main()
