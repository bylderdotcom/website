#!/usr/bin/env python3
"""Zet projecten en winkels uit deze repo in de app-database.

WAAROM DIT NODIG IS
-------------------
De publieke site en de app zijn twee repo's met twee databronnen. De site kent
995 nieuwbouwprojecten en duizenden winkels; de app-database bevatte op 4 aug
2026 nog 18 projecten en 77 winkels — de Zwolle-MVP van juni.

Sinds vandaag linkt elke projectpagina naar app.bylder.com/winkelwens?project=…,
waar de koper de winkels rond zíjn project aanvinkt. Zonder deze synchronisatie
vindt de app dat project niet en krijgt hij een lege lijst: de funnel eindigt in
een doodlopende gang op het moment dat hij net besloot mee te doen.

WAT WEL EN NIET MEEGAAT
-----------------------
Projecten: naam, plaats, aantal woningen, coördinaten, bron-URL en de slug zoals
de site die maakt. Zonder die slug kan de app de link van de site niet volgen.

Winkels: naam, plaats, e-mail, categorie, beoordeling, coördinaten. Alleen uit de
regiobestanden die e-mailadressen bevatten, want outreach_winkels bestaat om te
kunnen benaderen. Bestaande rijen worden niet overschreven op status of sent_at —
wie al gemaild is, blijft gemaild.

Gebruik:
    python3 scripts/sync_app_data.py --droog      # tonen wat er zou gebeuren
    python3 scripts/sync_app_data.py --projecten
    python3 scripts/sync_app_data.py --winkels
    python3 scripts/sync_app_data.py --alles
"""
import json, os, re, sys, glob, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_ENV = os.path.expanduser("~/Documents/GitHub/app/.env.local")
DROOG = "--droog" in sys.argv or "--dry" in sys.argv
BATCH = 200


def verbinding():
    if not os.path.exists(APP_ENV):
        sys.exit(f"{APP_ENV} niet gevonden — draai dit op de machine met de app-repo.")
    env = {}
    for line in open(APP_ENV, encoding="utf8"):
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    url = env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not (url and key):
        sys.exit("Supabase-URL of service-role-sleutel ontbreekt in de app-.env.local")
    return url, key


def stuur(url, key, tabel, rijen, conflict):
    """Upsert in blokken. merge-duplicates laat bestaande kolommen die wij niet
    meesturen met rust — status en sent_at blijven dus staan."""
    ok = fout = 0
    for i in range(0, len(rijen), BATCH):
        blok = rijen[i:i + BATCH]
        r = subprocess.run(
            ["curl", "-s", "-m", "60", "-X", "POST",
             f"{url}/rest/v1/{tabel}?on_conflict={conflict}",
             "-H", f"apikey: {key}", "-H", f"Authorization: Bearer {key}",
             "-H", "Content-Type: application/json",
             "-H", "Prefer: resolution=merge-duplicates,return=minimal",
             "--data-binary", "@-"],
            input=json.dumps(blok, ensure_ascii=False), capture_output=True, text=True)
        if r.stdout.strip().startswith('{"code"'):
            fout += len(blok)
            print("   fout:", r.stdout[:200])
        else:
            ok += len(blok)
        print(f"   {min(i + BATCH, len(rijen))}/{len(rijen)}", flush=True)
    return ok, fout


def slugify(naam, plaats):
    s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def projecten(url, key):
    bron = json.load(open(os.path.join(ROOT, "data", "nieuwbouwprojecten.json"),
                          encoding="utf8"))["projecten"]
    rijen = [{
        "naam": p["naam"], "plaats": p.get("plaats"), "woningen": p.get("woningen"),
        "status": p.get("status"), "url": p["url"],
        "lat": float(p["lat"]) if p.get("lat") else None,
        "lng": float(p["lng"]) if p.get("lng") else None,
        "slug": slugify(p["naam"], p.get("plaats") or ""),
    } for p in bron if p.get("url")]
    print(f"projecten: {len(rijen)} uit de site-data")
    if DROOG:
        print("  (droog)", rijen[0]); return
    ok, fout = stuur(url, key, "nieuwbouwprojecten", rijen, "url")
    print(f"  {ok} weggeschreven, {fout} mislukt")


def winkels(url, key):
    zien, rijen = set(), []
    for f in glob.glob(os.path.join(ROOT, "data", "winkels_*.json")):
        d = json.load(open(f, encoding="utf8"))
        for w in (d["winkels"] if isinstance(d, dict) else d):
            mail = (w.get("email") or "").strip().lower()
            plaats = w.get("plaats") or w.get("zoekplaats")
            if not mail or "@" not in mail or (mail, plaats) in zien:
                continue
            zien.add((mail, plaats))
            rijen.append({
                "naam": w.get("naam"), "plaats": plaats, "email": mail,
                "website": w.get("website"), "cat": w.get("cat"),
                "rating": float(w["rating"]) if w.get("rating") else None,
                "lat": float(w["lat"]) if w.get("lat") else None,
                "lng": float(w["lng"]) if w.get("lng") else None,
            })
    print(f"winkels: {len(rijen)} met e-mailadres uit de regiobestanden")
    if DROOG:
        print("  (droog)", {k: v for k, v in rijen[0].items() if k != "email"}); return
    ok, fout = stuur(url, key, "outreach_winkels", rijen, "email,plaats")
    print(f"  {ok} weggeschreven, {fout} mislukt")


if __name__ == "__main__":
    u, k = verbinding()
    a = sys.argv[1:]
    if "--projecten" in a or "--alles" in a or DROOG:
        projecten(u, k)
    if "--winkels" in a or "--alles" in a or DROOG:
        winkels(u, k)
    if not any(x in a for x in ("--projecten", "--winkels", "--alles", "--droog", "--dry")):
        sys.exit(__doc__)
