#!/usr/bin/env python3
"""
GSC-tractie voor de kortingscode-hub.
Leest per /kortingscode/[merk]-pagina de impressies/klikken uit Google Search Console
(service-account), zodat we de outreach kunnen gaten op aantoonbare vraag en de
mailcijfers kunnen vullen. Geheime sleutel staat buiten git in de app-repo.

Gebruik: python3 gsc_traction.py [dagen] [--sync]
  --sync  schrijft impressies/klikken per merk naar Supabase brands.gsc_impressions/clicks
          (matcht op de slug uit de /kortingscode/<slug>-URL) → voedt de admin-outreach-gate.
"""
import json, os, ssl, sys, urllib.request, urllib.parse
from datetime import date, datetime, timezone, timedelta
from google.oauth2 import service_account
from google.auth.transport.requests import Request

KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
ARGS = sys.argv[1:]
SYNC = "--sync" in ARGS
DAYS = next((int(a) for a in ARGS if a.isdigit()), 28)

def app_env(name):
    """Leest een waarde uit app/.env.local (voor de Supabase-sync)."""
    path = "/Users/danielpaaij/Documents/GitHub/app/.env.local"
    try:
        with open(path) as f:
            for line in f:
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return os.environ.get(name)

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

# 3) Optioneel: schrijf de cijfers per merk naar Supabase (admin-outreach-gate).
def slug_from_url(u):
    path = urllib.parse.urlparse(u).path.rstrip("/")
    marker = "/kortingscode/"
    return path.rsplit(marker, 1)[1] if marker in path else None

if SYNC:
    sb_url = app_env("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = app_env("SUPABASE_SERVICE_ROLE_KEY")
    if not sb_url or not sb_key:
        print("\n⚠ --sync: Supabase-URL of service-role-sleutel niet gevonden in app/.env.local."); sys.exit(1)
    now = datetime.now(timezone.utc).isoformat()
    ok = miss = 0
    print("\nSynchroniseren naar Supabase (brands)…")
    for r in rows:
        slug = slug_from_url(r["keys"][0])
        if not slug:
            continue
        payload = json.dumps({
            "gsc_impressions": int(r["impressions"]),
            "gsc_clicks": int(r["clicks"]),
            "gsc_synced_at": now,
        }).encode()
        url = f"{sb_url}/rest/v1/brands?slug=eq.{urllib.parse.quote(slug)}"
        req = urllib.request.Request(url, data=payload, method="PATCH", headers={
            "apikey": sb_key, "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json", "Prefer": "return=representation",
        })
        try:
            with urllib.request.urlopen(req, context=CTX) as resp:
                updated = json.load(resp)
            if updated:
                ok += 1
            else:
                miss += 1  # slug bestaat (nog) niet in de brands-catalogus
        except Exception as e:
            miss += 1
            print(f"  ! {slug}: {e}")
    print(f"Bijgewerkt: {ok} merken · {miss} zonder match in catalogus.")
