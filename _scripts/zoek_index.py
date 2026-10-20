#!/usr/bin/env python3
"""Bouwt de zoeklijst achter het zoekvak op de homepage ("Het adres of de naam van je project").

Waarom (gebruikerstest 20-10-2026): de lijst (web/public/zoek-index.json) was met de hand
gemaakt op 16-09-2026 en daarna nooit bijgewerkt. Er stonden 38 van de 288 projecten in,
een paar als paginatitel ("CondorPark Apeldoorn — wat je nu moet uitzoeken | Bylder.com").
Wie de naam van zijn project intypte, kreeg "Daar hebben wij nog geen projectpagina van",
terwijl die pagina er wél was.

Nu: de projecten komen uit de projectpagina's zelf (data/clusters/nieuwbouw-project/), de
gemeenten uit de gemeentepagina's (nieuwbouw/<provincie>/<gemeente>/). web/build.sh draait
dit bij elke build, dus een nieuw project staat er vanzelf in.

Gebruik:
  python3 _scripts/zoek_index.py                    # schrijft web/public/ en data/
  python3 _scripts/zoek_index.py --uit <bestand>    # alleen naar dat bestand (build)
"""
import html
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CLUSTER = os.path.join(ROOT, 'data', 'clusters', 'nieuwbouw-project')


def schoon(t):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', t or ''))).strip()


def projecten():
    pages = json.load(open(os.path.join(CLUSTER, 'pages.json'), encoding='utf-8'))
    uit = []
    for p in pages:
        slug = p['slug']
        f = os.path.join(CLUSTER, 'content', f'{slug}.html')
        if slug in ('index', 'oplevermonitor') or not os.path.exists(f):
            continue
        h = open(f, encoding='utf-8').read()
        if 'noindex' in json.dumps(p.get('robots', '')):
            continue
        m = re.search(r'Nieuwbouwprojecten</a>\s*&rsaquo;\s*([^<]+)</nav>', h)
        naam = schoon(m.group(1)) if m else schoon(re.split(r'\s+[—|-]\s+|\s*\|', p.get('title', ''))[0])
        e = re.search(r'<div class="pk-etiket">([^<&]+?)\s*(?:&middot;|<)', h)
        plaats = schoon(e.group(1)) if e and not re.search(r'deur|kozijn|vloer|kast', e.group(1), re.I) else ''
        if not plaats:
            # De handgemaakte pagina's: de plaats staat als laatste deel in de slug.
            plaats = slug.rsplit('-', 1)[-1].replace('-', ' ').title()
        if naam:
            uit.append({'n': naam, 'p': plaats, 'u': f'/nieuwbouw-project/{slug}/'})
    return uit


def gemeenten():
    basis = os.path.join(ROOT, 'nieuwbouw')
    lijst, kaart = [], {}
    for prov in sorted(os.listdir(basis)):
        pd = os.path.join(basis, prov)
        if not os.path.isdir(pd):
            continue
        for gem in sorted(os.listdir(pd)):
            f = os.path.join(pd, gem, 'index.html')
            if not os.path.isfile(f):
                continue
            h = open(f, encoding='utf-8', errors='ignore').read()
            m = re.search(r'<h1[^>]*>\s*Nieuwbouw in ([^<:]+)', h)
            naam = schoon(m.group(1)) if m else gem.replace('-', ' ').title()
            u = f'/nieuwbouw/{prov}/{gem}/'
            lijst.append({'n': naam, 'p': 'gemeente', 'u': u})
            kaart[re.sub(r'[^a-z0-9]', '', naam.lower().replace("'", ''))] = u
    return lijst, kaart


def bouw():
    pr = projecten()
    gl, gk = gemeenten()
    return {'ingangen': pr + gl, 'gemeenten': gk}


if __name__ == '__main__':
    d = bouw()
    tekst = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    if '--uit' in sys.argv:
        doelen = [sys.argv[sys.argv.index('--uit') + 1]]
    else:
        doelen = [os.path.join(ROOT, 'web', 'public', 'zoek-index.json'), os.path.join(ROOT, 'data', 'zoek-index.json')]
    for doel in doelen:
        with open(doel, 'w', encoding='utf-8') as fh:
            fh.write(tekst)
    n = sum(1 for x in d['ingangen'] if x['p'] != 'gemeente')
    print(f'zoeklijst: {n} projecten, {len(d["gemeenten"])} gemeenten')
