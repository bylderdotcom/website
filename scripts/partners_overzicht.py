"""Hoeveel bedrijven doen er mee, per product en per provincie? Alleen lezen, alleen aantallen.

Verzoek Daniel 13-11-2026, voor de 3D-aanbesteding ("één ontwerp, drie offertes"): we kunnen drie offertes pas
beloven als er per regio genoeg bedrijven zijn. Leest partner_organisaties, offerte_aanvragen en partner_offertes
en schrijft tellingen naar $GITHUB_STEP_SUMMARY. Geen namen, geen e-mailadressen, geen bedragen per bedrijf.
"""
import json, os, urllib.request
from collections import Counter, defaultdict

URL = os.environ['SUPABASE_URL'].rstrip('/')
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']


def lees(pad):
    hdr = {'apikey': KEY}
    if KEY.count('.') == 2:
        hdr['Authorization'] = f'Bearer {KEY}'
    with urllib.request.urlopen(urllib.request.Request(f'{URL}/rest/v1/{pad}', headers=hdr), timeout=30) as r:
        return json.load(r)


uit = []
p = uit.append
p('# Bedrijven per product en regio\n')
try:
    orgs = lees('partner_organisaties?select=id,soort,producten,werkgebied,status,moeder_id&limit=2000')
except Exception as e:
    orgs = []
    p(f'partner_organisaties niet te lezen: {str(e)[:200]}')

actief = [o for o in orgs if o.get('status') == 'actief']
p(f'Partnerbedrijven: **{len(orgs)}**, waarvan actief **{len(actief)}**.\n')
p('**Per soort (actief):** ' + (', '.join(f'{k} {v}' for k, v in Counter(o['soort'] for o in actief).most_common()) or 'geen'))

per_product = defaultdict(list)
for o in actief:
    for pr in (o.get('producten') or ['(geen product ingevuld)']):
        per_product[pr].append(o)
p('\n## Actieve bedrijven per product\n\n| Product | Bedrijven | Zonder werkgebied | Landelijk of 6+ provincies |\n|---|---|---|---|')
for pr, lijst in sorted(per_product.items(), key=lambda x: -len(x[1])):
    leeg = sum(1 for o in lijst if not o.get('werkgebied'))
    breed = sum(1 for o in lijst if len(o.get('werkgebied') or []) >= 6)
    p(f'| {pr} | {len(lijst)} | {leeg} | {breed} |')

for pr in ('kast-op-maat', 'gietvloer', 'kozijnloze-deur', 'afwerking-nieuwbouw'):
    lijst = per_product.get(pr, [])
    if not lijst:
        p(f'\n### {pr}: geen actieve bedrijven')
        continue
    prov = Counter()
    for o in lijst:
        for w in (o.get('werkgebied') or []):
            prov[w] += 1
    p(f'\n### {pr}: per provincie\n')
    if prov:
        p('| Provincie | Bedrijven | Drie of meer? |\n|---|---|---|')
        for k, v in prov.most_common():
            p(f'| {k} | {v} | {"ja" if v >= 3 else "nee"} |')
    else:
        p('Bij geen van deze bedrijven is een werkgebied ingevuld.')

# Hoeveel offertes kreeg een aanvraag tot nu toe?
try:
    aanvr = lees('offerte_aanvragen?select=id,product,status,created_at&order=created_at.desc&limit=2000')
    po = lees('partner_offertes?select=aanvraag_id,status,bedrag&limit=5000')
except Exception as e:
    aanvr, po = [], []
    p(f'\nAanvragen niet te lezen: {str(e)[:200]}')
if aanvr:
    uitgenodigd, metprijs = Counter(), Counter()
    for x in po:
        uitgenodigd[x['aanvraag_id']] += 1
        if x.get('bedrag') is not None:
            metprijs[x['aanvraag_id']] += 1
    p('\n## Aanvragen tot nu toe\n\n| Product | Aanvragen | Uitgezet bij een bedrijf | Gemiddeld uitgenodigd | Met 2+ offertes met prijs | Met 3+ |\n|---|---|---|---|---|---|')
    for pr, n in Counter(a['product'] for a in aanvr).most_common():
        ids = [a['id'] for a in aanvr if a['product'] == pr]
        uit_ids = [i for i in ids if uitgenodigd[i]]
        gem = (sum(uitgenodigd[i] for i in uit_ids) / len(uit_ids)) if uit_ids else 0
        p(f'| {pr} | {n} | {len(uit_ids)} | {gem:.1f} | {sum(1 for i in ids if metprijs[i] >= 2)} | {sum(1 for i in ids if metprijs[i] >= 3)} |')
    p('\n**Aanvragen per maand:** ' + ', '.join(f'{k} {v}' for k, v in sorted(Counter(a['created_at'][:7] for a in aanvr).items())))

tekst = '\n'.join(uit)
print(tekst)
if os.environ.get('GITHUB_STEP_SUMMARY'):
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as f:
        f.write(tekst + '\n')
