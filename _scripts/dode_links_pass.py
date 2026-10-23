#!/usr/bin/env python3
# Dode-links-pass (23-10-2026): zet elke interne link in de build-output die op een 404
# uitkomt om naar de dichtstbijzijnde pagina erboven die wél bestaat.
#
# Waarom: Search Console telde 979 niet-gevonden pagina's en dat liep op (362 in augustus).
# Een controle van alle 55.222 interne linkdoelen die niet in een sitemap staan gaf er 6.231
# met een 404, uit minstens vijf generatoren: profielen die naar een stadspagina linken die
# alleen voor de 291 grotere plaatsen bestaat (/stukadoor/zuidwolde/), renovatiekosten per vak
# en stad, wijkpagina's onder /nieuwbouw/, product- en projectpagina's per gemeente, en
# projectpagina's die er niet (meer) zijn. Elke generator los repareren laat de deur open voor
# de volgende; deze stap draait bij elke build over het eindresultaat en houdt het dicht.
#
# Wat "bestaat" is: een bestand in de output (map/index.html, bestand.html of bestand), of een
# pad dat een redirect of rewrite uit vercel.json opvangt (die werkt gewoon). Een link naar een
# redirect met een bestaand doel gaat sinds 23-10-2026 meteen naar dat doel. Redirects met een
# host-voorwaarde (bylder.com → www) tellen niet mee: die vangen alles.
#
# Voorbeelden: /stukadoor/zuidwolde/ → /stukadoor/; /nieuwbouw/zeeland/terneuzen/terneuzen-west/
# → /nieuwbouw/zeeland/terneuzen/. Querystring en anker vervallen, want ze horen bij het oude doel.
#
# ALLEEN DE ZICHTBARE HTML, NOOIT <script>. Een eerste versie paste ook de RSC-payload van
# Next aan (href=\"…\" in self.__next_f.push). Die payload bevat tekststukken met hun lengte
# ervoor; een langere of kortere link maakte die lengte fout en de pagina bouwde in de browser
# niet meer op ("This page couldn't load", 23-10-2026, ~15 min live, teruggedraaid in #269).
# Nu blijft elk script ongemoeid. React laat bij het hydrateren de href in de server-HTML
# staan, dus de bezoeker krijgt de omgezette link. Ook JavaScript dat zelf een link opbouwt
# ('/bouwvergunning/'+c.slug+'/') valt zo buiten schot. Schrijft alleen bestanden die echt
# veranderen.
#
# Gebruik:  python3 _scripts/dode_links_pass.py <out-map> [--droog] [--rapport <bestand>]
#   --droog    niets schrijven, alleen tellen
#   --rapport  per dood linkdoel een regel "oud<TAB>nieuw" naar <bestand>
import collections
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LINK = re.compile(r'href="(/[^"#?\s<>\'+\\]*)([#?][^"]*)?"')
SCRIPT = re.compile(r'(<script\b.*?</script>)', re.S | re.I)
BESTAND = re.compile(r'\.(?!html?$)[a-z0-9]{2,5}$', re.I)


def bron_regex(bron):
    """Een Vercel-source (/x/:pad*, /y/(.*), /z/:slug) als regex voor het hele pad, met de
    benoemde stukken als groep, zodat een doel als /project/badkamer/:stad/ in te vullen is."""
    uit, i = '', 0
    while i < len(bron):
        c = bron[i]
        if c == ':':
            m = re.match(r':(\w+)([*+?])?', bron[i:])
            uit += f"(?P<{m.group(1)}>{'.*' if m.group(2) in ('*', '+') else '[^/]+'})"
            if m.group(2) == '?':
                uit += '?'
            i += len(m.group(0))
        elif c == '(':
            j = bron.index(')', i)
            uit += '(?:' + bron[i + 1:j] + ')'
            i = j + 1
        else:
            uit += re.escape(c)
            i += 1
    return re.compile('^' + uit + '/?$')


def vercel_bronnen():
    """[(regex, doel)] in de volgorde van vercel.json (de eerste die past wint, net als bij
    Vercel). Doel is None bij een rewrite: die werkt, maar het adres blijft hetzelfde."""
    d = json.load(open(os.path.join(ROOT, 'vercel.json'), encoding='utf-8'))
    return [(bron_regex(r['source']), r['destination']) for r in d.get('redirects', []) if 'has' not in r] + \
           [(bron_regex(r['source']), None) for r in d.get('rewrites', []) if 'has' not in r]


def ingevuld(m, doel):
    """Het doel van een redirect met de stukken uit het pad ingevuld, of None als dat niet
    zeker kan (extern doel, $1-verwijzing)."""
    if not doel or not doel.startswith('/') or '$' in doel:
        return None
    return re.sub(r':(\w+)\*?', lambda g: m.groupdict().get(g.group(1)) or '', doel)


def bestaande_paden(out):
    paden = set()
    for map_, _, bestanden in os.walk(out):
        rel = '/' + os.path.relpath(map_, out).replace(os.sep, '/').strip('./')
        rel = '/' if rel == '/' else rel + '/'
        for b in bestanden:
            if b == 'index.html':
                paden.add(rel)
            paden.add(rel + b)
            if b.endswith('.html'):
                paden.add(rel + b[:-5])
    return paden


def main():
    out = sys.argv[1]
    droog = '--droog' in sys.argv
    paden = bestaande_paden(out)
    bronnen = vercel_bronnen()
    besluit = {}

    def doel(pad):
        if pad in besluit:
            return besluit[pad]
        nieuw = pad
        # Een redirect gaat vóór een bestand, net als bij Vercel. Is het doel er, dan linkt de
        # pagina er meteen heen in plaats van via de omweg (bv. de samengevoegde
        # /renovatiekosten/badkamer/utrecht/ → /project/badkamer-renovatie/utrecht/, 23-10-2026).
        r = next(((rx.match(pad), d) for rx, d in bronnen if rx.match(pad)), None)
        if r:
            via = ingevuld(*r)
            if via and (via in paden or via + '/' in paden):
                nieuw = via
        elif not (pad in paden or pad + '/' in paden or pad.startswith(('/api/', '/_next/'))
                  or '//' in pad or BESTAND.search(pad)):
            delen = pad.strip('/').split('/')
            nieuw = '/'
            for n in range(len(delen) - 1, 0, -1):
                kandidaat = '/' + '/'.join(delen[:n]) + '/'
                if kandidaat in paden:
                    nieuw = kandidaat
                    break
        besluit[pad] = nieuw
        return nieuw

    bestanden = links = 0
    per_groep = collections.Counter()
    for map_, _, namen in os.walk(out):
        for naam in namen:
            if not naam.endswith('.html'):
                continue
            pad = os.path.join(map_, naam)
            with open(pad, encoding='utf-8', errors='surrogateescape') as f:
                html = f.read()
            if 'href=' not in html:
                continue
            telling = [0]

            def vervang(m):
                nieuw = doel(m.group(1))
                if nieuw == m.group(1):
                    return m.group(0)
                telling[0] += 1
                per_groep['/' + m.group(1).strip('/').split('/')[0] + '/'] += 1
                return f'href="{nieuw}"'

            # Even delen zijn HTML, oneven delen zijn complete <script>-blokken.
            delen = SCRIPT.split(html)
            nieuw_html = ''.join(d if i % 2 else LINK.sub(vervang, d) for i, d in enumerate(delen))
            if telling[0]:
                bestanden += 1
                links += telling[0]
                if not droog:
                    with open(pad, 'w', encoding='utf-8', errors='surrogateescape') as f:
                        f.write(nieuw_html)

    dood = sorted(p for p, n in besluit.items() if n != p)
    if '--rapport' in sys.argv:
        with open(sys.argv[sys.argv.index('--rapport') + 1], 'w', encoding='utf-8') as f:
            f.writelines(f'{p}\t{besluit[p]}\n' for p in dood)
    print(f'  {len(dood)} dode linkdoelen, {links} links in {bestanden} pagina\'s omgezet'
          + (' (droog: niets geschreven)' if droog else ''))
    for groep, n in per_groep.most_common(12):
        print(f'    {groep:<28}{n:>8}')
    for p in dood[:8]:
        print(f'    bv. {p} → {besluit[p]}')


if __name__ == '__main__':
    main()
