#!/usr/bin/env python3
"""Commercieel blok op de gemeentepagina's van /renovatiekosten/ (11-10-2026).

Besluit Daniel: elke pagina heeft een commerciële vervolgstap. De 2.248 gemeentepagina's
(renovatiekosten/<onderdeel>/<gemeente>/) hadden alleen "Controleer mijn offerte" en "Start
gratis". Dit script zet er per onderdeel de stap bij die past, dezelfde als op de
onderdeelpagina (web/app/renovatiekosten/categorieen.ts, veld 'aanbod'):

  gietvloer, aanbouw, warmtepomp  → gietvloerontwerper
  dakkapel                        → kastontwerper
  badkamer, keuken, schilderwerk,
  zonnepanelen                    → ledenkorting

Het blok komt vóór de sectie "Gerelateerd in <gemeente>". Idempotent via de marker: een
tweede run vervangt het blok, dus tekst aanpassen = hier aanpassen en opnieuw draaien.
"""
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BEGIN, EIND = '<!--bylder:aanbod-->', '<!--/bylder:aanbod-->'


def merken():
    with open(os.path.join(ROOT, 'data', 'deelnemers.json'), encoding='utf-8') as fh:
        d = json.load(fh)
    lijst = d if isinstance(d, list) else d.get('deelnemers', [])
    return len({x['naam'] for x in lijst if x.get('naam')})


GIET = ('/gietvloer/ontwerpen/', 'Ontwerp je gietvloer', 'Gietvloer &middot; ontwerpen')
KAST = ('/kasten-op-maat/ontwerpen/', 'Ontwerp je kast', 'Maatwerk &middot; kasten')
KORT = ('/vouchers/', 'Bekijk de kortingen', 'Ledenkorting')

AANBOD = {
    'gietvloer': (GIET, 'Zie je gietvloer in je eigen woning, vanaf één foto',
                  'Upload een foto van een vloer die je mooi vindt. Wij lezen de kleur, je kiest de ruimtes en je krijgt tot drie stalen gratis thuis. Daarna een offerte van een verwerker in de buurt van {g}.'),
    'aanbouw': (GIET, 'Een vloer die zonder drempel doorloopt',
                'Een gietvloer loopt naadloos van de aanbouw de woonkamer in. Upload een foto van een vloer die je mooi vindt en ontvang tot drie stalen gratis.'),
    'warmtepomp': (GIET, 'Een vloer die past bij je warmtepomp',
                   'Een gietvloer is dun en geleidt warmte goed, dus hij werkt goed met vloerverwarming. Upload een foto van een vloer die je mooi vindt en ontvang tot drie stalen gratis.'),
    'dakkapel': (KAST, 'Maak van je zolder een kamer met bergruimte',
                 'Ontwerp een kast op maat vanaf een voorbeeldfoto, zie hem in 3D en vraag een offerte aan bij een timmerbedrijf.'),
    'badkamer': (KORT, 'Korting op sanitair en tegels',
                 'Met een gratis Bylder-account krijg je ledenkorting bij {m} merken, onder meer Swanenberg, Pand16 en Sanitairwinkel.nl.'),
    'keuken': (KORT, 'Korting op je keuken',
               'Met een gratis Bylder-account krijg je onder meer €750 korting bij Van Eigen Hand, en ledenkorting bij {m} merken.'),
    'schilderwerk': (KORT, 'Korting op behang en wandafwerking',
                     'Met een gratis Bylder-account krijg je ledenkorting bij {m} merken, onder meer Graham &amp; Brown, Enzo Pellini en Super-stuc.nl.'),
    'zonnepanelen': (KORT, 'Korting bij {m} woonmerken',
                     'Bezig met verduurzamen en inrichten? Met een gratis Bylder-account krijg je ledenkorting, van verlichting tot zonwering.'),
}

LINKS = ('<a href="/kozijnloze-deuren/configurator/" style="color:#F5F0E8;font-weight:700;font-size:14px">Kozijnloze deuren</a>'
         ' &middot; <a href="/gietvloer/ontwerpen/" style="color:#F5F0E8;font-weight:700;font-size:14px">Gietvloer</a>'
         ' &middot; <a href="/kasten-op-maat/ontwerpen/" style="color:#F5F0E8;font-weight:700;font-size:14px">Kast op maat</a>'
         ' &middot; <a href="/onzichtbare-plinten/" style="color:#F5F0E8;font-weight:700;font-size:14px">Onzichtbare plinten</a>')


def blok(onderdeel, gemeente, m):
    (href, knop, label), titel, tekst = AANBOD[onderdeel]
    titel, tekst = titel.format(m=m, g=gemeente), tekst.format(m=m, g=gemeente)
    return (
        f'{BEGIN}<section aria-label="Direct regelen via Bylder" style="padding:0 0 48px"><div class="c">'
        '<div style="background:#1A1208;border-radius:20px;padding:28px">'
        f'<div style="font-size:11.5px;font-family:\'Space Mono\',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#E8A87C;font-weight:700;margin-bottom:10px">{label}</div>'
        f'<h2 style="font-size:1.5rem;line-height:1.2;font-weight:800;color:#F5F0E8;margin:0 0 10px;letter-spacing:-0.022em">{titel}</h2>'
        f'<p style="font-size:15.5px;line-height:1.7;color:rgba(245,240,232,0.78);margin:0 0 18px;max-width:60ch">{tekst}</p>'
        f'<a href="{href}" style="display:inline-block;background:#F5F0E8;color:#1A1208;font-weight:800;font-size:16px;padding:14px 24px;border-radius:12px;text-decoration:none">{knop} &rarr;</a>'
        f'<p style="margin:18px 0 0;color:rgba(245,240,232,0.6);font-size:13px">Ook via Bylder: {LINKS}</p>'
        f'</div></div></section>{EIND}'
    )


def run():
    m = merken()
    gedaan = 0
    basis = os.path.join(ROOT, 'renovatiekosten')
    for onderdeel in sorted(AANBOD):
        map_ = os.path.join(basis, onderdeel)
        for gem in sorted(os.listdir(map_)):
            f = os.path.join(map_, gem, 'index.html')
            if not os.path.isfile(f):
                continue
            h = open(f, encoding='utf-8').read()
            g = re.search(r'› ([^<›]+)</div>', h)
            gemeente = g.group(1).strip() if g else gem
            nieuw = blok(onderdeel, gemeente, m)
            if BEGIN in h:
                nh = re.sub(re.escape(BEGIN) + '.*?' + re.escape(EIND), lambda _: nieuw, h, flags=re.S)
            else:
                i = h.find('<section style="background:#EDE6D8')
                if i < 0:
                    i = h.find('<footer')
                if i < 0:
                    continue
                nh = h[:i] + nieuw + '\n' + h[i:]
            if nh != h:
                open(f, 'w', encoding='utf-8').write(nh)
                gedaan += 1
    print(f'aangepast: {gedaan} gemeentepagina\'s')


if __name__ == '__main__':
    run()
