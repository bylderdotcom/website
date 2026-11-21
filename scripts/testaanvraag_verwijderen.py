"""Verwijdert één testaanvraag uit de app (offerte_aanvragen), op verzoek van Daniel.

Veiligheidsgrens: alleen een aanvraag waarvan de naam met "TEST" begint. Gekoppelde rijen gaan
mee via de database (logboek en partnerrijen: cascade; kast_sessies.aanvraag_id: wordt leeg).
Het kastontwerp van de test wordt ook verwijderd als het alleen aan deze aanvraag hing.
Gebruik: python3 scripts/testaanvraag_verwijderen.py <aanvraag-id>
"""
import json, os, re, sys, urllib.request

URL = os.environ['SUPABASE_URL'].rstrip('/')
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
HDR = {'apikey': KEY, 'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'}


def vraag(methode, pad, data=None, prefer=None):
    h = dict(HDR)
    if prefer:
        h['Prefer'] = prefer
    req = urllib.request.Request(f'{URL}/rest/v1/{pad}', method=methode, headers=h,
                                 data=json.dumps(data).encode() if data is not None else None)
    with urllib.request.urlopen(req, timeout=30) as r:
        t = r.read().decode()
        return json.loads(t) if t else None


aid = (sys.argv[1] if len(sys.argv) > 1 else '').strip()
if not re.fullmatch(r'[0-9a-f-]{36}', aid):
    sys.exit('Geef een geldig aanvraag-id.')
rij = vraag('GET', f'offerte_aanvragen?id=eq.{aid}&select=id,naam,product,created_at')
if not rij:
    sys.exit('Aanvraag niet gevonden (al verwijderd?).')
rij = rij[0]
if not (rij.get('naam') or '').upper().startswith('TEST'):
    sys.exit(f"Geweigerd: de naam begint niet met TEST ({rij.get('product')}, {rij.get('created_at')}).")
sessies = vraag('GET', f'kast_sessies?aanvraag_id=eq.{aid}&select=id') or []
vraag('DELETE', f'offerte_aanvragen?id=eq.{aid}', prefer='return=minimal')
for s in sessies:
    vraag('DELETE', f"kast_sessies?id=eq.{s['id']}", prefer='return=minimal')
over = vraag('GET', f'offerte_aanvragen?id=eq.{aid}&select=id')
print(f"Verwijderd: {rij['product']} van {rij['created_at'][:16]} ({'gelukt' if not over else 'NIET gelukt'}); "
      f"kastontwerpen weg: {len(sessies)}.")
