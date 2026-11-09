#!/usr/bin/env python3
"""Zet een zelf aangemeld vakbedrijf op de site (besluit Daniel, 9-11-2026).

Gebruik:  python3 scripts/profiel_toevoegen.py <bestand.json>
          (JSON-lijst met rijen uit Supabase public.vakbedrijven, bron 'aanmelding')
of via de wekelijkse ronde (scripts/vakbedrijven_ronde.py).

WAT HET DOET. De gids (data/clusters/<vak>/) is gegenereerde data; een profiel bestaat
uit een regel in bedrijven.json + pages.json, en de plaatspagina toont de kaarten uit
cities.json. Voor een zelf aangemeld bedrijf zetten we alleen neer wat het zelf opgaf:
naam, plaats, website, telefoon. Geen beoordeling, geen adres. Sjabloon:
templates/clusters/<vak>/content.bedrijf.aanmelding.html (dezelfde vorm als KVE Smart
Solutions en CV Allround, de eerste twee met de hand).

Het profiel staat op noindex tot het bedrijf het claimt en aanvult: een profiel met
alleen naam en telefoonnummer is precies de dunne pagina waar de indexatieregel voor is.
De kaart komt onderaan de plaatslijst, na de bedrijven met beoordelingen.

Weigert (en meldt) als het vak geen gids heeft of de plaats geen plaatspagina.
"""
import json
import os
import re
import sys
import unicodedata
import urllib.parse

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from profiel_verwijderen import schrijf  # noqa: E402

ENKELVOUD = {
    'aannemer': 'aannemer', 'badkamer': 'badkamerspecialist', 'dakkapel': 'dakkapelspecialist',
    'elektricien': 'elektricien', 'gietvloer': 'gietvloerspecialist', 'loodgieter': 'loodgieter',
    'schilder': 'schilder', 'stukadoor': 'stukadoor',
}


def slugify(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-'))


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def tel_weergave(t):
    d = re.sub(r'\D', '', t or '')
    if d.startswith('31'):
        d = '0' + d[2:]
    if len(d) != 10:
        return t or ''
    return f'{d[:2]} {d[2:]}' if d.startswith('06') else f'{d[:3]} {d[3:6]} {d[6:]}'


def contact_row(vak, website, tel):
    """Kiest (en maakt zo nodig) een contactregel die precies past bij wat er is."""
    soort = 'zelf_' + ('w' if website else '') + ('t' if tel else '') if (website or tel) else 'zelf_geen'
    pad = os.path.join(REPO, 'templates/clusters', vak, f'row.contact_row.{soort}.html')
    if not os.path.exists(pad):
        delen = []
        if website:
            delen.append('<a href="{{website}}" target="_blank" rel="nofollow noopener" style="font-weight:700;">Website &#8594;</a>')
        if tel:
            delen.append('<a href="tel:{{tel}}" style="font-weight:700;">{{tel_disp}}</a>')
        html = ('<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-size:14px;">' + ''.join(delen) + '</div>') if delen else ''
        open(pad, 'w', encoding='utf-8').write(html)
    return soort


def voeg_toe(r):
    """r = rij uit vakbedrijven. Geeft (True, regel) of (False, reden)."""
    vak, slug, naam, stad = r.get('vak'), r.get('slug') or '', (r.get('naam') or '').strip(), (r.get('stad') or '').strip()
    cdir = os.path.join(REPO, 'data/clusters', vak or '-')
    tpl = os.path.join(REPO, 'templates/clusters', vak or '-', 'content.bedrijf.aanmelding.html')
    if vak not in ENKELVOUD or not os.path.exists(tpl):
        return False, f'{naam}: vak "{vak}" heeft geen gids'
    if not naam or not slug.startswith(vak + '-'):
        return False, f'{naam or slug}: naam of slug ontbreekt'
    key = 'bedrijf/' + slug[len(vak) + 1:]
    href = f'/{vak}/{key}/'
    bp, pp, cp = (os.path.join(cdir, f) for f in ('bedrijven.json', 'pages.json', 'cities.json'))
    bedrijven, pages, cities = json.load(open(bp)), json.load(open(pp)), json.load(open(cp))
    if key in bedrijven:
        return False, f'{naam}: staat er al'
    city_slug = slugify(stad)
    stadje = cities.get(city_slug)
    if not stadje:
        return False, f'{naam}: plaats "{stad}" heeft nog geen pagina bij {vak}'
    stad = stadje.get('city') or stad

    website = (r.get('website') or '').strip() or None
    tel = re.sub(r'[^\d+]', '', r.get('telefoon') or '') or None
    b = {'name': esc(naam), 'city': stad, 'city_slug': city_slug}
    if website:
        b['website'] = esc(website)
    if tel:
        b['tel'], b['tel_disp'] = tel, tel_weergave(r.get('telefoon'))
    b['contact_row'] = contact_row(vak, website, tel)
    b['template'] = 'aanmelding'
    b['siblings'] = [{'href': c['profile_href'], 'name': c['name'], 'rating': c.get('rating_disp') or None}
                     for c in stadje.get('companies', []) if c.get('profile_href') != href][:5]
    for s in b['siblings']:
        if not s['rating'] or s['rating'] in ('0', '0,0', '0.0'):
            s.pop('rating')
        else:
            s['rating'] = s['rating'].replace('.', ',')
    bedrijven[key] = b

    enk = ENKELVOUD[vak]
    ld = {'@context': 'https://schema.org', '@type': 'LocalBusiness', 'name': naam,
          'address': {'@type': 'PostalAddress', 'addressLocality': stad, 'addressCountry': 'NL'}, 'areaServed': stad}
    if website:
        ld['url'] = website
    pages.append({
        'slug': key, 'file': f'{vak}/{key}/index.html', 'path': href,
        'title': f'{esc(naam)} — {enk} in {stad} | Bylder',
        'description': f'{esc(naam)}, {enk} in {stad}. Contactgegevens en werkgebied op één plek — plus een gratis check of je offerte een eerlijke prijs heeft.',
        'og_type': 'article', 'robots': 'noindex,follow', 'template': 'default', 'footer': 'default', 'aside': None,
        'ldjson': [json.dumps(ld, ensure_ascii=False)], 'ldjson_sep': '\n', 'content_kind': 'bedrijf',
    })

    q = urllib.parse.quote(f'{naam} {stad}')
    stadje.setdefault('companies', []).append({
        'profile_href': href, 'name': esc(naam), 'plaats': stad, 'rating': '0', 'reviews': '0',
        'maps_href': f'https://www.google.com/maps/search/?api=1&amp;query={q}',
        'claim_href': f'https://app.bylder.com/vakbedrijf/claim/{slug}', 'shape': 'unrated',
    })
    schrijf(bp, bedrijven)
    schrijf(pp, pages)
    schrijf(cp, cities)

    vp = os.path.join(REPO, 'data/vakbedrijven.json')
    vb = json.load(open(vp))
    if isinstance(vb, dict) and not any(x.get('slug') == slug for x in vb.get('vakbedrijven', [])):
        vb['vakbedrijven'].append(r)
        schrijf(vp, vb)
    return True, f'{vak}: {naam} ({stad}) → https://www.bylder.com{href}'


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for rij in json.load(open(sys.argv[1], encoding='utf-8')):
        print(('+ ' if (u := voeg_toe(rij))[0] else '- ') + u[1])
