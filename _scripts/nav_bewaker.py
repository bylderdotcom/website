#!/usr/bin/env python3
"""Nav-bewaker: meldt pagina's die niet het huidige menu dragen.

Waarom dit bestaat. De veegronde die het menu uitrolt (nav_pijlers_pass.py)
slaat de mappen over waarvan Next de pagina's rendert. Next rendert echter niet
élk pad in zo'n map — waar generateStaticParams niets oplevert, wordt het
statische bestand uitgeleverd. Op 11-09-2026 bleken daardoor 86 pagina's, bijna
alle overgebleven vakbedrijfprofielen, nog maanden het menu van vóór 26 augustus
te dragen: andere links, andere knop, andere site. Niemand die het zag, want
niets controleerde het.

Dit script controleert het wél, in twee lagen:

  lokaal  elke pagina die volgens nav_gaten.txt echt wordt uitgeleverd, moet de
          marker 'byl-nav2026' bevatten. Kost geen netwerk en is de echte poort.
  live    steekproef op www.bylder.com, om te zien of de deploy klopt met de
          repo (een pagina kan in de repo goed staan en in de build verkeerd).

Gebruik:
  python3 _scripts/nav_bewaker.py              # alleen lokaal
  python3 _scripts/nav_bewaker.py --live 200   # plus 200 live-steekproeven
  python3 _scripts/nav_bewaker.py --live 200 --basis https://voorbeeld.vercel.app

Exitcode 1 zodra er pagina's zonder het huidige menu zijn, zodat een GitHub
Action erop kan falen. reports/nav-bewaker.json houdt de volledige lijst bij.
"""
import json
import os
import random
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nav_pijlers_pass import EXCLUDE, MARKER, NEXT_ROUTES, ROOT, lees_gaten  # noqa: E402

RAPPORT = os.path.join(ROOT, 'reports', 'nav-bewaker.json')
BASIS = 'https://www.bylder.com'

# Mappen die web/build.sh niet meekopieert naar web/out. Ze staan dus nooit
# online en horen hier niet als fout te tellen — data/clusters/*/content/ zijn
# bronfragmenten, geen pagina's. Bijwerken als EXCLUDE_TOP in web/build.sh
# verandert.
NIET_GEDEPLOYED = {
    'data', 'scripts', '_scripts', '_audits', 'reports', 'output', 'templates',
    'docs', '_og-templates', 'supabase', 'api', 'web', 'node_modules', 'out',
    '.next', '.vercel', '.claude', '.git',
}


def uitgeleverde_paginas():
    """Statische pagina's die een bezoeker echt krijgt.

    Dus: alles buiten de uitgesloten mappen, en binnen een Next-map alleen de
    paden die Next niet rendert (nav_gaten.txt).
    """
    gaten = lees_gaten()
    uit = []
    for dp, dns, fns in os.walk(ROOT):
        rel = dp.replace(ROOT, '') + '/'
        if any(x in rel for x in EXCLUDE):
            dns[:] = []
            continue
        top = rel.strip('/').split('/')[0]
        if top in NIET_GEDEPLOYED:
            dns[:] = []
            continue
        for fn in fns:
            if fn != 'index.html':
                continue
            pad = os.path.relpath(os.path.join(dp, fn), ROOT)
            if top in NEXT_ROUTES and pad not in gaten:
                continue
            uit.append(pad)
    return sorted(uit)


def url_van(pad):
    p = '/' + pad[:-len('index.html')] if pad.endswith('index.html') else '/' + pad
    return p


def lokaal_controleren(paden):
    mist = []
    for pad in paden:
        try:
            h = open(os.path.join(ROOT, pad), encoding='utf-8', errors='ignore').read()
        except OSError:
            continue
        # Een pagina zonder <nav> (losse landingspagina, inlogscherm) heeft geen
        # menu en hoort hier niet als fout te tellen.
        if '<nav' not in h:
            continue
        if MARKER not in h:
            mist.append(pad)
    return mist


def live_controleren(paden, basis, aantal):
    steek = paden if aantal >= len(paden) else random.sample(paden, aantal)

    def haal(pad):
        url = basis + url_van(pad)
        out = subprocess.run(['curl', '-s', '--max-time', '25', url],
                             capture_output=True, text=True).stdout
        if not out:
            return (pad, 'onbereikbaar')
        if '<nav' not in out:
            return None
        return None if MARKER in out else (pad, 'oud menu live')

    with ThreadPoolExecutor(8) as ex:
        return [r for r in ex.map(haal, steek) if r]


def main():
    live = 0
    if '--live' in sys.argv:
        i = sys.argv.index('--live')
        live = int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 200
    basis = BASIS
    if '--basis' in sys.argv:
        basis = sys.argv[sys.argv.index('--basis') + 1].rstrip('/')

    paden = uitgeleverde_paginas()
    mist = lokaal_controleren(paden)
    print(f'uitgeleverde statische pagina\'s: {len(paden)}')
    print(f'zonder het huidige menu (lokaal): {len(mist)}')
    for pad in mist[:20]:
        print('  ', url_van(pad))
    if len(mist) > 20:
        print(f'   ... en nog {len(mist) - 20}')

    live_mist = []
    if live:
        live_mist = live_controleren(paden, basis, live)
        print(f'live-steekproef ({min(live, len(paden))} pagina\'s op {basis}): '
              f'{len(live_mist)} mis')
        for pad, waarom in live_mist[:20]:
            print('  ', url_van(pad), '—', waarom)

    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    with open(RAPPORT, 'w', encoding='utf-8') as fh:
        json.dump({
            'uitgeleverd': len(paden),
            'lokaal_mist': mist,
            'live_mist': [{'pad': p, 'waarom': w} for p, w in live_mist],
            'basis': basis if live else None,
        }, fh, ensure_ascii=False, indent=1)
    print('rapport:', os.path.relpath(RAPPORT, ROOT))

    return 1 if (mist or live_mist) else 0


if __name__ == '__main__':
    raise SystemExit(main())
