"""Overzicht van de feedbacklijst (feature_requests + feature_clusters), alleen lezen.

Verzoek Daniel 11-11-2026: kijken wat er al binnen is voordat de feedbackronde verder wordt
uitgebouwd. Schrijft een samenvatting naar $GITHUB_STEP_SUMMARY: aantallen, de groepen en de
laatste meldingen. Geen e-mailadressen, IP-hashes of gebruikers-id's; e-mailadressen en
telefoonnummers in de tekst worden weggepoetst. Aanmeldingen (VS-wachtlijst, uitvoerders,
vermeldingen) tellen alleen mee als aantal.
"""
import json, os, re, sys, urllib.request
from collections import Counter

URL = os.environ['SUPABASE_URL'].rstrip('/')
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
AANMELDING = {'us_wachtlijst', 'uitvoerder', 'vermelding'}


def lees(pad):
    hdr = {'apikey': KEY}
    if KEY.count('.') == 2:  # klassieke JWT-sleutel; sb_secret_ alleen als apikey
        hdr['Authorization'] = f'Bearer {KEY}'
    req = urllib.request.Request(f'{URL}/rest/v1/{pad}', headers=hdr)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def poets(t, n):
    t = re.sub(r'[^\s@]+@[^\s@]+\.[^\s@]+', '[e-mail]', t or '')
    t = re.sub(r'(\+31|0)[\d\s-]{8,}', '[telefoon]', t)
    t = ' '.join(t.split())
    return (t[:n] + '…') if len(t) > n else t


m = lees('feature_requests?select=segment,bron,bron_repo,status,context,tekst,created_at,cluster_id,score&order=created_at.desc&limit=2000')
try:
    c = lees('feature_clusters?select=titel,samenvatting,triage,status,aantal,score,bron_repo,segmenten,created_at&order=score.desc&limit=200')
except Exception as e:  # tabel of kolom anders: overzicht van de meldingen gaat voor
    c, cfout = [], str(e)
else:
    cfout = ''

fb = [x for x in m if x['segment'] not in AANMELDING]
uit = []
p = uit.append
p('# Feedbacklijst: stand van zaken\n')
p(f'Totaal rijen: **{len(m)}**, waarvan aanmeldingen {len(m) - len(fb)} en feedback **{len(fb)}**.\n')
p('| Segment | Aantal |\n|---|---|')
for k, v in Counter(x['segment'] for x in m).most_common():
    p(f'| {k} | {v} |')
p('\n**Feedback per status:** ' + ', '.join(f'{k} {v}' for k, v in Counter(x['status'] for x in fb).most_common()))
p('\n**Feedback per bron:** ' + ', '.join(f'{k} {v}' for k, v in Counter(f"{x['bron_repo']}/{x['bron']}" for x in fb).most_common()))
p('\n**Feedback per maand:** ' + ', '.join(f'{k} {v}' for k, v in sorted(Counter(x['created_at'][:7] for x in fb).items())))
p(f"\n**Nog niet gegroepeerd:** {sum(1 for x in fb if not x['cluster_id'] and x['status'] not in ('spam', 'afgewezen'))}")
scores = [x['score'] for x in fb if x.get('score')]
if scores:
    p(f'\n**Rapportcijfer (1-5):** gemiddeld {sum(scores)/len(scores):.1f} uit {len(scores)} keer')

p(f'\n## Groepen ({len(c)})\n')
if cfout:
    p(f'Groepen niet te lezen: {cfout[:200]}')
if c:
    p('**Per status:** ' + ', '.join(f'{k} {v}' for k, v in Counter(x['status'] for x in c).most_common()) + '\n')
    p('| Score | Meldingen | Status | Triage | Repo | Titel | Samenvatting |\n|---|---|---|---|---|---|---|')
    for x in c[:40]:
        p(f"| {x.get('score')} | {x.get('aantal')} | {x.get('status')} | {x.get('triage')} | {x.get('bron_repo')} | {poets(x.get('titel'), 80)} | {poets(x.get('samenvatting'), 200)} |")

p('\n## Laatste 40 meldingen\n')
p('| Datum | Segment | Bron | Status | Waar | Tekst |\n|---|---|---|---|---|---|')
for x in fb[:40]:
    p(f"| {x['created_at'][:10]} | {x['segment']} | {x['bron_repo']}/{x['bron']} | {x['status']} | {poets(x.get('context'), 60)} | {poets(x['tekst'], 220).replace('|', '/')} |")

tekst = '\n'.join(uit)
open(os.environ.get('GITHUB_STEP_SUMMARY', '/dev/stdout'), 'a').write(tekst + '\n')
print(tekst[:3000])
