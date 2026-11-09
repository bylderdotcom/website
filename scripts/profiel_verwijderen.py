#!/usr/bin/env python3
"""Haal een vakbedrijf helemaal van de site, op eigen verzoek van dat bedrijf.

Gebruik:  python3 scripts/profiel_verwijderen.py <doel> [<doel> ...]
  doel = <vak>/bedrijf/<naam>   exact profiel, bv. dakkapel/bedrijf/jacobs-daken-helmond-mug8im
       = <id-achtervoegsel>      alle profielen met dat achtervoegsel in elk vak, bv. mug8im
                                 (alleen voor Places-slugs; zelf aangemelde bedrijven hebben er geen)

WAAROM. Een verwijderverzoek zet in de app opt_out aan, maar de profielen staan als
gegenereerde data in deze repo (data/clusters/<vak>/). Dit script haalt het bedrijf uit
alle gecommitte bestanden:
  - het profiel (bedrijven.json, pages.json, eventueel content/bedrijf__*.html)
  - de kaart op de plaatspagina en de ItemList in de gestructureerde data
  - de links vanaf andere profielen ("andere bedrijven in <plaats>")
  - interne-links, vakbedrijven.json en de sitemap
en zet een permanente doorverwijzing van het oude profiel naar de plaatspagina.
De wekelijkse ronde (scripts/vakbedrijven_ronde.py) roept dit aan voor elk bedrijf met opt_out.
"""
import glob
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def schrijf(pad, data):
    """Zelfde inspringing als het bestand al had, zodat de diff klein blijft."""
    eerste = open(pad, encoding='utf-8').read(200).split('\n')
    ind = len(eerste[1]) - len(eerste[1].lstrip(' ')) if len(eerste) > 1 else 1
    with open(pad, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=ind or 1)
        f.write('\n')


def clusters():
    for cdir in sorted(glob.glob(os.path.join(REPO, 'data/clusters/*'))):
        if os.path.exists(os.path.join(cdir, 'bedrijven.json')) and os.path.exists(os.path.join(cdir, 'pages.json')):
            yield os.path.basename(cdir), cdir


def doelen_uit(argumenten):
    """Zet argumenten om in een set (vak, sleutel), alleen voor profielen die echt bestaan."""
    doelen = set()
    alle = {vak: json.load(open(os.path.join(cdir, 'bedrijven.json'))) for vak, cdir in clusters()}
    for a in argumenten:
        a = a.strip('/')
        if '/bedrijf/' in a:
            vak, naam = a.split('/bedrijf/', 1)
            if f'bedrijf/{naam}' in alle.get(vak, {}):
                doelen.add((vak, f'bedrijf/{naam}'))
        else:
            for vak, b in alle.items():
                doelen.update((vak, k) for k in b if k.rstrip('/').split('-')[-1] == a)
    return doelen


def zonder_href(x, hrefs):
    """Recursief: lijst-items (dicts) die naar een van de profielen linken weg."""
    if isinstance(x, list):
        return [zonder_href(v, hrefs) for v in x
                if not (isinstance(v, dict) and (v.get('profile_href') in hrefs or v.get('href') in hrefs))]
    if isinstance(x, dict):
        return {k: zonder_href(v, hrefs) for k, v in x.items()}
    return x


def ld_zonder(blok, namen):
    try:
        d = json.loads(blok)
    except Exception:
        return blok
    if isinstance(d, dict) and d.get('@type') == 'ItemList' and isinstance(d.get('itemListElement'), list):
        over = [e for e in d['itemListElement'] if (e.get('item') or {}).get('name') not in namen]
        if len(over) != len(d['itemListElement']):
            for n, e in enumerate(over, 1):
                e['position'] = n
            d['itemListElement'] = over
            if 'numberOfItems' in d:
                d['numberOfItems'] = len(over)
            return json.dumps(d, ensure_ascii=False)
    return blok


def knip_kaarten(html, href):
    """Verwijdert elke <div class="card vb-card"...>…</div> (gebalanceerd) die href bevat,
    en losse tegel-links <a href="href" class="tile">…</a>."""
    uit, pos = [], 0
    for m in re.finditer(r'<div class="card vb-card"', html):
        if m.start() < pos:
            continue
        diepte, j = 0, m.start()
        for t in re.finditer(r'<div\b|</div>', html[m.start():]):
            diepte += 1 if t.group() != '</div>' else -1
            if diepte == 0:
                j = m.start() + t.end()
                break
        if href in html[m.start():j]:
            uit.append(html[pos:m.start()])
            pos = j
    uit.append(html[pos:])
    return re.sub(rf'<a href="{re.escape(href)}" class="tile">.*?</a>', '', ''.join(uit))


def verwijder(doelen):
    """doelen = set van (vak, 'bedrijf/<naam>'). Geeft de lijst verwijderde profielen terug."""
    if not doelen:
        return []
    weg_lijst, redirects = [], []
    alle_hrefs = {f'/{vak}/{k}/' for vak, k in doelen}
    db_slugs = {f'{vak}-{k[len("bedrijf/"):]}' for vak, k in doelen}
    for vak, cdir in clusters():
        hrefs = {h for h in alle_hrefs if h.startswith(f'/{vak}/')}
        if not hrefs:
            continue
        sleutels = {k for v, k in doelen if v == vak}
        bp, pp = os.path.join(cdir, 'bedrijven.json'), os.path.join(cdir, 'pages.json')
        bedrijven = json.load(open(bp))
        weg = {k: bedrijven[k] for k in sleutels if k in bedrijven}
        namen = {v.get('name') for v in weg.values()}
        for k, v in weg.items():
            stad = v.get('city_slug')
            redirects.append((f'/{vak}/{k}/', f'/{vak}/{stad}/' if stad else f'/{vak}/'))
            weg_lijst.append(f'{vak}: {v.get("name")} ({v.get("city")})')
            f = os.path.join(cdir, 'content', f'bedrijf__{k[len("bedrijf/"):]}.html')
            if os.path.exists(f):
                os.remove(f)
        bedrijven = {k: v for k, v in bedrijven.items() if k not in weg}
        for v in bedrijven.values():
            if isinstance(v.get('siblings'), list):
                v['siblings'] = [s for s in v['siblings'] if s.get('href') not in hrefs]
        schrijf(bp, bedrijven)

        pages = [p for p in json.load(open(pp)) if p['slug'] not in weg]
        if namen:
            for p in pages:
                if isinstance(p.get('ldjson'), list):
                    p['ldjson'] = [ld_zonder(b, namen) if isinstance(b, str) else b for b in p['ldjson']]
        schrijf(pp, pages)

        cp = os.path.join(cdir, 'cities.json')
        if os.path.exists(cp):
            schrijf(cp, zonder_href(json.load(open(cp)), hrefs))
        for f in glob.glob(os.path.join(cdir, 'content', '*.html')):
            html = open(f, encoding='utf-8').read()
            nieuw = html
            for h in hrefs:
                if h in nieuw:
                    nieuw = knip_kaarten(nieuw, h)
            if nieuw != html:
                open(f, 'w', encoding='utf-8').write(nieuw)

    for f in glob.glob(os.path.join(REPO, 'data/interne-links/*.json')):
        s = open(f).read()
        if not any(h in s for h in alle_hrefs) and not any(f'"{k}"' in s for _, k in doelen):
            continue
        d = zonder_href(json.loads(s), alle_hrefs)
        naam = os.path.basename(f)
        if isinstance(d, dict):
            d = {k: v for k, v in d.items() if not any(k == sk and naam.endswith(f'{vak}.json') for vak, sk in doelen)}
        schrijf(f, d)

    vp = os.path.join(REPO, 'data/vakbedrijven.json')
    vb = json.load(open(vp))
    lijst = vb.get('vakbedrijven', []) if isinstance(vb, dict) else vb
    over = [r for r in lijst if r.get('slug') not in db_slugs]
    if len(over) != len(lijst):
        if isinstance(vb, dict):
            vb['vakbedrijven'] = over
        else:
            vb = over
        schrijf(vp, vb)

    for f in glob.glob(os.path.join(REPO, '*sitemap*.xml')):
        s = open(f).read()
        n = s
        for h in alle_hrefs:
            n = re.sub(r'\s*<url>(?:(?!</url>).)*?<loc>https://www\.bylder\.com%s</loc>(?:(?!</url>).)*?</url>' % re.escape(h), '', n, flags=re.S)
        if n != s:
            open(f, 'w').write(n)

    vjp = os.path.join(REPO, 'vercel.json')
    v = json.load(open(vjp))
    bestaand = {r['source'] for r in v['redirects']}
    for bron, doel in redirects:
        for s in (bron, bron.rstrip('/')):
            if s not in bestaand:
                v['redirects'].append({'source': s, 'destination': doel, 'permanent': True})
    schrijf(vjp, v)

    rest = []
    for f in glob.glob(os.path.join(REPO, 'data/clusters/**/*.*'), recursive=True) + glob.glob(os.path.join(REPO, '*sitemap*.xml')):
        if f.endswith(('.json', '.html', '.xml')):
            s = open(f, encoding='utf-8', errors='ignore').read()
            rest += [(os.path.relpath(f, REPO), h) for h in alle_hrefs if f'"{h}"' in s or f'>{h}<' in s or f'bylder.com{h}<' in s]
    if rest:
        raise SystemExit(f'Restverwijzingen na verwijderen: {rest[:10]}')
    return weg_lijst


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for regel in verwijder(doelen_uit(sys.argv[1:])) or ['niets gevonden']:
        print(regel)
