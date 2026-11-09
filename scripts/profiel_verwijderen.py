#!/usr/bin/env python3
"""Haal een vakbedrijf helemaal van de site, op eigen verzoek van dat bedrijf.

Gebruik:  python3 scripts/profiel_verwijderen.py <id-achtervoegsel> [<id> ...]
          bv. mug8im  (het laatste stuk van de slug: /dakkapel/bedrijf/jacobs-daken-helmond-mug8im/)

WAAROM. Een verwijderverzoek zet in de app opt_out aan, maar de profielen staan als
gegenereerde data in deze repo (data/clusters/<vak>/). Zonder een nieuwe pipelinerun
met de servicesleutel bleven ze staan; Jacobs daken stond er na 19 dagen nog. Dit script
haalt het bedrijf uit alle gecommitte bestanden, in elk vak waar het voorkomt:
  - het profiel (bedrijven.json, pages.json, eventueel content/bedrijf__*.html)
  - de kaart op de plaatspagina en de ItemList in de gestructureerde data
  - de links vanaf andere profielen ("andere bedrijven in <plaats>")
  - interne-links, vakbedrijven.json en de sitemap
en zet een permanente doorverwijzing van het oude profiel naar de plaatspagina.
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


def bevat(x, ids):
    s = json.dumps(x, ensure_ascii=False) if not isinstance(x, str) else x
    return any(re.search(rf'-{re.escape(i)}(/|"|\b)', s) for i in ids)


def slug_id(slug):
    return slug.rstrip('/').split('-')[-1]


def schoon(x, ids):
    """Recursief: lijst-items en dict-sleutels die naar het bedrijf verwijzen weg."""
    if isinstance(x, list):
        return [schoon(v, ids) for v in x if not (isinstance(v, (dict, str)) and bevat(v, ids))]
    if isinstance(x, dict):
        return {k: schoon(v, ids) for k, v in x.items() if not any(k.endswith('-' + i) for i in ids)}
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
    uit = []
    pos = 0
    for m in re.finditer(r'<div class="card vb-card"', html):
        if m.start() < pos:
            continue
        diepte, j = 0, m.start()
        for t in re.finditer(r'<div\b|</div>', html[m.start():]):
            diepte += 1 if t.group() != '</div>' else -1
            if diepte == 0:
                j = m.start() + t.end()
                break
        kaart = html[m.start():j]
        if href in kaart:
            uit.append(html[pos:m.start()])
            pos = j
    uit.append(html[pos:])
    html = ''.join(uit)
    html = re.sub(rf'<a href="{re.escape(href)}" class="tile">.*?</a>', '', html)
    return html


def main(ids):
    redirects = []
    for cdir in sorted(glob.glob(os.path.join(REPO, 'data/clusters/*'))):
        bp = os.path.join(cdir, 'bedrijven.json')
        pp = os.path.join(cdir, 'pages.json')
        if not (os.path.exists(bp) and os.path.exists(pp)):
            continue
        vak = os.path.basename(cdir)
        bedrijven = json.load(open(bp))
        weg = {k: v for k, v in bedrijven.items() if slug_id(k) in ids}
        if not weg:
            continue
        namen = {v.get('name') for v in weg.values()}
        hrefs = [f'/{vak}/{k}/' for k in weg]
        for k, v in weg.items():
            stad = v.get('city_slug')
            redirects.append((f'/{vak}/{k}/', f'/{vak}/{stad}/' if stad else f'/{vak}/'))
            print(f'{vak}: {v.get("name")} ({v.get("city")}) weg')
        bedrijven = {k: v for k, v in bedrijven.items() if k not in weg}
        for v in bedrijven.values():
            if isinstance(v.get('siblings'), list):
                v['siblings'] = [s for s in v['siblings'] if s.get('href') not in hrefs]
        schrijf(bp, bedrijven)

        pages = [p for p in json.load(open(pp)) if slug_id(p['slug']) not in ids]
        for p in pages:
            if isinstance(p.get('ldjson'), list):
                p['ldjson'] = [ld_zonder(b, namen) if isinstance(b, str) else b for b in p['ldjson']]
            elif isinstance(p.get('ldjson'), str) and p.get('ldjson_sep'):
                p['ldjson'] = p['ldjson_sep'].join(ld_zonder(b, namen) for b in p['ldjson'].split(p['ldjson_sep']))
        schrijf(pp, pages)

        cp = os.path.join(cdir, 'cities.json')
        if os.path.exists(cp):
            schrijf(cp, schoon(json.load(open(cp)), ids))

        for f in glob.glob(os.path.join(cdir, 'content', '*.html')):
            if any(f.endswith(f'-{i}.html') for i in ids):
                os.remove(f)
                continue
            html = open(f, encoding='utf-8').read()
            nieuw = html
            for h in hrefs:
                if h in nieuw:
                    nieuw = knip_kaarten(nieuw, h)
            if nieuw != html:
                open(f, 'w', encoding='utf-8').write(nieuw)

    for f in glob.glob(os.path.join(REPO, 'data/interne-links/*.json')) + [os.path.join(REPO, 'data/vakbedrijven.json')]:
        s = open(f).read()
        if bevat(s, ids):
            schrijf(f, schoon(json.loads(s), ids))

    for f in glob.glob(os.path.join(REPO, '*sitemap*.xml')):
        s = open(f).read()
        n = re.sub(r'\s*<url>(?:(?!</url>).)*?-(?:%s)/(?:(?!</url>).)*?</url>' % '|'.join(map(re.escape, ids)), '', s, flags=re.S)
        if n != s:
            open(f, 'w').write(n)

    vp = os.path.join(REPO, 'vercel.json')
    v = json.load(open(vp))
    bestaand = {r['source'] for r in v['redirects']}
    for bron, doel in redirects:
        for s in (bron, bron.rstrip('/')):
            if s not in bestaand:
                v['redirects'].append({'source': s, 'destination': doel, 'permanent': True})
    schrijf(vp, v)

    # Controle: nergens meer een verwijzing.
    rest = []
    for f in glob.glob(os.path.join(REPO, 'data/**/*.*'), recursive=True) + glob.glob(os.path.join(REPO, '*sitemap*.xml')):
        if f.endswith(('.json', '.html', '.xml')):
            s = open(f, encoding='utf-8', errors='ignore').read()
            for i in ids:
                if re.search(rf'-{re.escape(i)}(/|"|\.html)', s):
                    rest.append((os.path.relpath(f, REPO), i))
    print('Restverwijzingen:', rest or 'geen')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
