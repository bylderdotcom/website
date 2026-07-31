#!/usr/bin/env python3
"""
GSC-tractie voor de vakbedrijven-laag.

Beantwoordt de vraag waar de hele "pull"-strategie op leunt: googelen vakbedrijven
zichzelf en landen ze op hun Bylder-profiel? Leest per /<vak>/bedrijf/<slug>/-pagina
de impressies/klikken uit Search Console en schrijft ze naar Supabase.vakbedrijven.

Dit is de vakbedrijven-tegenhanger van gsc_traction.py (die alleen /kortingscode/
dekt en naar de brands-tabel schrijft).

Gebruik: python3 gsc_vakbedrijven.py [dagen] [--sync]
  dagen   meetvenster, standaard 28
  --sync  schrijft gsc_impressions/gsc_clicks naar Supabase (zonder deze vlag
          alleen rapporteren — veilig om eerst droog te draaien)
"""
import json, os, re, ssl, sys, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone, timedelta
from google.oauth2 import service_account
from google.auth.transport.requests import Request

KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
ENV = "/Users/danielpaaij/Documents/GitHub/app/.env.local"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
REPORT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports", "gsc-vakbedrijven.json")

ARGS = sys.argv[1:]
SYNC = "--sync" in ARGS
DAYS = next((int(a) for a in ARGS if a.isdigit()), 28)

# /<vak>/bedrijf/<profiel-slug>/ — zie generate_vakpillar.py (_profiel_url)
PROFIEL_RE = re.compile(r"^/([a-z0-9-]+)/bedrijf/([^/?#]+)/?$")


def app_env(name):
    try:
        with open(ENV) as f:
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

if not os.path.exists(KEY):
    sys.exit(f"⚠ Sleutel ontbreekt: {KEY}\n  → Maak een nieuwe service-account-key aan en zet hem op dit pad.")

creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
try:
    creds.refresh(Request())
except Exception as e:
    sys.exit(
        f"⚠ Inloggen bij Google mislukt: {e}\n"
        "  'account not found' = het Google Cloud-project of de service account bestaat niet meer.\n"
        "  → Nieuw project + service account + JSON-key, daarna toevoegen als gebruiker in Search Console."
    )
TOK = creds.token


def api(method, url, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method,
        headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, context=CTX) as r:
        return json.load(r)


# 1) Property bepalen
sites = api("GET", "https://www.googleapis.com/webmasters/v3/sites")
entries = sites.get("siteEntry", [])
print("Toegankelijke properties:")
for s in entries:
    print("  -", s["siteUrl"], f"({s['permissionLevel']})")
urls = [s["siteUrl"] for s in entries]
prop = next((c for c in ["sc-domain:bylder.com", "https://www.bylder.com/", "https://bylder.com/"] if c in urls), None)
if not prop:
    print("\n⚠ Geen bylder-property toegankelijk voor dit service-account.")
    print("  → Voeg", creds.service_account_email, "toe als gebruiker in Search Console.")
    sys.exit(1)
print("\nGebruik property:", prop)

# 2) Alle pagina's ophalen — mét paginering. bylder.com heeft ~14k indexeerbare
#    profielpagina's; zonder paginering kap je de meting stil af.
end = date.today() - timedelta(days=2)   # GSC-data loopt ~2 dagen achter
start = end - timedelta(days=DAYS)
endpoint = (f"https://www.googleapis.com/webmasters/v3/sites/"
            f"{urllib.parse.quote(prop, safe='')}/searchAnalytics/query")

PAGE = 25000
rows_all, startrow = [], 0
while True:
    res = api("POST", endpoint, {
        "startDate": start.isoformat(), "endDate": end.isoformat(),
        "dimensions": ["page"], "rowLimit": PAGE, "startRow": startrow,
    })
    batch = res.get("rows", [])
    rows_all.extend(batch)
    print(f"  … {len(rows_all)} pagina's opgehaald", end="\r")
    if len(batch) < PAGE:
        break
    startrow += PAGE
print(" " * 40, end="\r")


def parse(u):
    """URL → (vak, profiel-slug) of None."""
    m = PROFIEL_RE.match(urllib.parse.urlparse(u).path)
    return (m.group(1), m.group(2)) if m else None


profielen = []
for r in rows_all:
    p = parse(r["keys"][0])
    if p:
        profielen.append({"url": r["keys"][0], "vak": p[0], "profiel": p[1],
                          "impressions": int(r["impressions"]), "clicks": int(r["clicks"]),
                          "position": r.get("position")})
profielen.sort(key=lambda r: (-r["impressions"], -r["clicks"]))

imp = sum(r["impressions"] for r in profielen)
clk = sum(r["clicks"] for r in profielen)
met_klik = [r for r in profielen if r["clicks"] > 0]

print(f"\nPeriode: {start} t/m {end} ({DAYS} dagen)")
print(f"Totaal pagina's met GSC-data (hele site): {len(rows_all)}")
print(f"Vakbedrijf-profielpagina's met vertoningen: {len(profielen)}")
print(f"  totaal impressies: {imp}   klikken: {clk}")
print(f"  profielen met ≥1 klik: {len(met_klik)}")

per_vak = {}
for r in profielen:
    v = per_vak.setdefault(r["vak"], {"paginas": 0, "impressies": 0, "klikken": 0})
    v["paginas"] += 1; v["impressies"] += r["impressions"]; v["klikken"] += r["clicks"]
if per_vak:
    print("\nPer vak:")
    for vak, v in sorted(per_vak.items(), key=lambda kv: -kv[1]["impressies"]):
        print(f"  {vak:<16} {v['paginas']:>5} pag  {v['impressies']:>7} imp  {v['klikken']:>5} klik")

if profielen:
    print("\nTop profielen:")
    for r in profielen[:25]:
        pos = f" pos {r['position']:.1f}" if r.get("position") else ""
        print(f"  {r['impressions']:>6} imp  {r['clicks']:>4} klik{pos}  {r['url']}")
else:
    print("\n(geen enkele profielpagina kreeg vertoningen in dit venster)")

os.makedirs(os.path.dirname(REPORT), exist_ok=True)
with open(REPORT, "w") as f:
    json.dump({
        "gemeten_op": datetime.now(timezone.utc).isoformat(),
        "property": prop, "periode": {"start": start.isoformat(), "eind": end.isoformat(), "dagen": DAYS},
        "totaal": {"profielen_met_vertoningen": len(profielen), "impressies": imp,
                   "klikken": clk, "profielen_met_klik": len(met_klik)},
        "per_vak": per_vak,
        "top": profielen[:100],
    }, f, ensure_ascii=False, indent=2)
print(f"\nRapport: {REPORT}")

# 3) Wegschrijven naar Supabase
if not SYNC:
    print("\n(droogdraai — geef --sync mee om de cijfers naar Supabase te schrijven)")
    sys.exit(0)

sb_url = app_env("NEXT_PUBLIC_SUPABASE_URL")
sb_key = app_env("SUPABASE_SERVICE_ROLE_KEY")
if not sb_url or not sb_key:
    sys.exit("\n⚠ --sync: Supabase-URL of service-role-sleutel niet gevonden in app/.env.local.")

# Heeft de tabel een gsc_synced_at-kolom? (brands wel, vakbedrijven van origine niet)
def has_col(col):
    req = urllib.request.Request(f"{sb_url}/rest/v1/vakbedrijven?select={col}&limit=1",
        headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"})
    try:
        urllib.request.urlopen(req, context=CTX).read()
        return True
    except Exception:
        return False

STAMP = has_col("gsc_synced_at")
if not STAMP:
    print("\nℹ Kolom gsc_synced_at ontbreekt op vakbedrijven — schrijf alleen impressies/klikken.")
    print("  → Draai supabase/migrations/20260727120000_vakbedrijven_gsc_synced_at.sql voor versheidsstempel.")

now = datetime.now(timezone.utc).isoformat()


def db_slug_kandidaten(vak, profiel):
    """DB-slug is '<vak>-<profiel>'; bij naamsbotsing kreeg de URL een -2/-3-suffix."""
    yield f"{vak}-{profiel}"
    m = re.match(r"^(.*)-(\d+)$", profiel)
    if m:
        yield f"{vak}-{m.group(1)}"


def push(r):
    payload = {"gsc_impressions": r["impressions"], "gsc_clicks": r["clicks"]}
    if STAMP:
        payload["gsc_synced_at"] = now
    for slug in db_slug_kandidaten(r["vak"], r["profiel"]):
        url = f"{sb_url}/rest/v1/vakbedrijven?slug=eq.{urllib.parse.quote(slug)}"
        req = urllib.request.Request(url, data=json.dumps(payload).encode(), method="PATCH", headers={
            "apikey": sb_key, "Authorization": f"Bearer {sb_key}",
            "Content-Type": "application/json", "Prefer": "return=representation",
        })
        try:
            with urllib.request.urlopen(req, context=CTX) as resp:
                if json.load(resp):
                    return ("ok", slug)
        except Exception as e:
            return ("err", f"{slug}: {e}")
    return ("miss", f"{r['vak']}-{r['profiel']}")


print(f"\nSynchroniseren naar Supabase (vakbedrijven) — {len(profielen)} profielen…")
ok = miss = err = 0
problemen = []
with ThreadPoolExecutor(max_workers=8) as pool:
    for i, (kind, info) in enumerate(pool.map(push, profielen), 1):
        if kind == "ok":
            ok += 1
        else:
            if kind == "miss":
                miss += 1
            else:
                err += 1
            if len(problemen) < 20:
                problemen.append(f"{kind}: {info}")
        if i % 250 == 0:
            print(f"  … {i}/{len(profielen)}", end="\r")

print(" " * 40, end="\r")
print(f"Bijgewerkt: {ok} profielen · {miss} zonder match in de tabel · {err} fouten.")
for p in problemen:
    print("  !", p)
