#!/usr/bin/env python3
"""
GSC-tractie voor de kortingscode-hub.
Leest per /kortingscode/[merk]-pagina de impressies/klikken uit Google Search Console
(service-account), zodat we de outreach kunnen gaten op aantoonbare vraag en de
mailcijfers kunnen vullen. Geheime sleutel staat buiten git in de app-repo.

Gebruik: python3 gsc_traction.py [dagen]   (default 28)
"""
import json, ssl, sys, urllib.request, urllib.parse
from datetime import date, timedelta
from google.oauth2 import service_account
from google.auth.transport.requests import Request

KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 28

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE

creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
creds.refresh(Request())
TOK = creds.token

def api(method, url, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method,
        headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return json.load(r)

# 1) Welke properties mag dit service-account zien?
sites = api("GET", "https://www.googleapis.com/webmasters/v3/sites")
entries = sites.get("siteEntry", [])
print("Toegankelijke properties:")
for s in entries:
    print("  -", s["siteUrl"], f"({s['permissionLevel']})")
urls = [s["siteUrl"] for s in entries]
prop = next((c for c in ["sc-domain:bylder.com", "https://www.bylder.com/", "https://bylder.com/"] if c in urls), None)
if not prop:
    print("\n⚠ Geen bylder-property toegankelijk voor dit service-account.")
    print("  → Controleer stap 4: service-account-mail als gebruiker toevoegen in Search Console.")
    sys.exit(0)
print("\nGebruik property:", prop)

# 2) Performance per pagina, laatste N dagen
end = date.today(); start = end - timedelta(days=DAYS)
body = {"startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": ["page"], "rowLimit": 5000}
res = api("POST",
    f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(prop, safe='')}/searchAnalytics/query",
    body)
rows = [r for r in res.get("rows", []) if "/kortingscode/" in r["keys"][0]]
rows.sort(key=lambda r: (-r["impressions"], -r["clicks"]))
imp = sum(r["impressions"] for r in rows); clk = sum(r["clicks"] for r in rows)
print(f"\nPeriode: {start} t/m {end} ({DAYS} dagen)")
print(f"/kortingscode/-pagina's met data: {len(rows)} | totaal impressies: {imp} | klikken: {clk}")
if rows:
    print("\nTop pagina's:")
    for r in rows[:25]:
        print(f"  {int(r['impressions']):>6} imp  {int(r['clicks']):>4} klik  {r['keys'][0]}")
else:
    print("(nog geen data — pagina's zijn vers; GSC heeft doorgaans ~1–3 weken nodig na indexatie)")
