#!/usr/bin/env python3
"""Haalt uit de app op wie er meedoet, zodat de site dat kan tonen.

DE LUS SLUITEN
--------------
Een winkel die betaalt moet zichzelf terugzien op de projectpagina's, en de koper
die om die winkel vroeg moet zijn korting zien verschijnen. Zonder dat krijgt geen
van beiden bevestiging dat het werkte, en blijft de funnel een reeks losse stappen
in plaats van een lus die zichzelf versterkt.

De generator van de projectpagina's weet niet wie lid is — die data zit in de
app-database. Dit script schrijft hem naar data/deelnemers.json, waarna de
winkellijst op elke projectpagina de deelnemers bovenaan zet met hun aanbod erbij.

WAAROM NIET OP DE STATUSKOLOM
-----------------------------
`merchants.status` staat bij Van Eigen Hand nog op 'pending' terwijl die winkel in
juli €79 betaalde. Wie op dat veld filtert, laat juist de enige betalende winkel
weg. Daarom is het criterium: een goedgekeurde korting, of een betaling. Dat is
ook wat de bezoeker ziet — een winkel zonder aanbod heeft op de pagina niets te
melden.

Er gaan geen e-mailadressen of contactgegevens mee: dit bestand komt in git en
wordt op de publieke site gebruikt.

Gebruik:
    python3 scripts/export_deelnemers.py
"""
import json, os, subprocess, sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_ENV = os.path.expanduser("~/Documents/GitHub/app/.env.local")
UIT = os.path.join(ROOT, "data", "deelnemers.json")


def verbinding():
    if not os.path.exists(APP_ENV):
        sys.exit(f"{APP_ENV} niet gevonden — draai dit op de machine met de app-repo.")
    env = {}
    for line in open(APP_ENV, encoding="utf8"):
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and key):
        sys.exit("Supabase-URL of service-role-sleutel ontbreekt.")
    return url, key


def get(url, key, pad):
    r = subprocess.run(["curl", "-s", "-m", "60", f"{url}/rest/v1/{pad}",
                        "-H", f"apikey: {key}", "-H", f"Authorization: Bearer {key}"],
                       capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        return d if isinstance(d, list) else []
    except Exception:
        return []


def main():
    url, key = verbinding()
    vouchers = get(url, key, "merchant_vouchers?select=title,discount_label,city,lat,lng,"
                             "website,status,paid_at,category,brand,valid_until&limit=2000")
    winkels = get(url, key, "outreach_winkels?select=naam,plaats,website,cat,lat,lng,status"
                            "&status=eq.lid&limit=1000")

    deelnemers = []
    for v in vouchers:
        if v.get("status") != "approved" and not v.get("paid_at"):
            continue
        naam = (v.get("brand") or "").strip()
        if not naam:
            continue
        deelnemers.append({
            "naam": naam,
            "plaats": v.get("city"),
            "aanbod": (v.get("discount_label") or v.get("title") or "").strip()[:80],
            "cat": v.get("category"),
            "website": v.get("website"),
            "lat": v.get("lat"), "lng": v.get("lng"),
            "bron": "voucher",
        })
    for w in winkels:
        deelnemers.append({
            "naam": w.get("naam"), "plaats": w.get("plaats"),
            "aanbod": "ledenkorting", "cat": w.get("cat"),
            "website": w.get("website"), "lat": w.get("lat"), "lng": w.get("lng"),
            "bron": "winkel",
        })

    # Ontdubbelen op naam; wie zowel een voucher als een winkelrij heeft, telt één keer.
    zien, uniek = set(), []
    for d in deelnemers:
        sleutel = (d["naam"] or "").lower().strip()
        if not sleutel or sleutel in zien:
            continue
        zien.add(sleutel)
        uniek.append(d)

    json.dump({"bijgewerkt": date.today().isoformat(), "deelnemers": uniek},
              open(UIT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"{len(uniek)} deelnemers weggeschreven → data/deelnemers.json")
    for d in uniek[:10]:
        print(f"   {(d['naam'] or '')[:34]:<36} {d.get('plaats') or '—':<16} {d['aanbod'][:40]}")
    if not uniek:
        print("   (nog geen enkele deelnemer met een goedgekeurd aanbod — "
              "de badge blijft dan gewoon weg)")


if __name__ == "__main__":
    main()
