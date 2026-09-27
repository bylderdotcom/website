#!/usr/bin/env python3
"""Wat de projectpagina's opleveren: vertoningen, klikken en registraties per project.

WAAROM DIT ER NOG NIET WAS
Op de projectpagina's staan UTM-tags per project — `project-<slug>` op de
knoppen en `project-<slug>-tekening` op de plattegrond-CTA. Die tags bestaan
sinds juli, en niemand heeft er ooit naar gekeken. In september is de hele
trechter omgebouwd (plattegrond-upload naar boven, configurator erachteraan,
ledenkorting erbij) zonder dat er één cijfer tegenover stond.

Zonder deze meting weten we straks wel of pagina's geïndexeerd raken, maar niet
of iemand op die knoppen drukt. Dat is het verschil tussen bereik en werking.

DE TWEE HELFTEN
Search Console geeft de linkerkant: hoeveel mensen zagen de pagina en hoeveel
klikten er door naar ons. Supabase geeft de rechterkant: hoeveel van hen maakten
een account, met de campagne die de site meegaf.

Samen leveren ze drie soorten lek op, en die vragen om verschillende dingen:

  veel vertoningen, weinig klikken   → de titel of omschrijving werkt niet
  veel klikken, geen registraties    → de pagina overtuigt niet
  weinig vertoningen                 → het project wordt niet gevonden

WAT DIT NIET DOET
Het oordeelt niet en het verandert niets. Het zet de cijfers naast elkaar en
noemt de tien grootste lekken. Wat daarmee gebeurt, is een besluit van een mens.

Gebruik:
    python3 scripts/trechter_meting.py                 # laatste 28 dagen
    python3 scripts/trechter_meting.py --dagen 90
    python3 scripts/trechter_meting.py --zonder-registraties
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLUSTER = ROOT / "data" / "clusters" / "nieuwbouw-project"
RAPPORT = ROOT / "reports" / "trechter-nieuwbouw-project.json"
GSC_KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
APP_ENV = "/Users/danielpaaij/Documents/GitHub/app/.env.local"
SITE = "sc-domain:bylder.com"

DAGEN = 28
for i, a in enumerate(sys.argv):
    if a == "--dagen" and i + 1 < len(sys.argv):
        DAGEN = int(sys.argv[i + 1])
ZONDER_REG = "--zonder-registraties" in sys.argv


def gsc_rijen(vanaf: str, tot: str) -> dict[str, dict]:
    """Vertoningen, klikken en positie per projectpagina.

    De API geeft maximaal 25.000 rijen per verzoek; dit cluster heeft er 287, dus
    één verzoek volstaat. Het filter staat op het pad, niet op een reguliere
    expressie: dat is sneller en het cluster heeft een eigen prefix.
    """
    from google.auth.transport.requests import Request
    from google.oauth2 import service_account

    c = service_account.Credentials.from_service_account_file(
        GSC_KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    c.refresh(Request())
    body = json.dumps({
        "startDate": vanaf, "endDate": tot,
        "dimensions": ["page"],
        "dimensionFilterGroups": [{"filters": [
            {"dimension": "page", "operator": "contains", "expression": "/nieuwbouw-project/"}]}],
        "rowLimit": 25000,
    })
    r = subprocess.run(
        ["curl", "-sS", "-m", "60",
         f"https://www.googleapis.com/webmasters/v3/sites/{SITE}/searchAnalytics/query",
         "-H", f"Authorization: Bearer {c.token}",
         "-H", "Content-Type: application/json", "-d", body],
        capture_output=True, text=True)
    d = json.loads(r.stdout)
    if "error" in d:
        sys.exit("Search Console: " + d["error"].get("message", "")[:200])
    uit = {}
    for rij in d.get("rows", []):
        pad = rij["keys"][0].split("bylder.com")[-1]
        uit[pad] = {"vertoningen": rij["impressions"], "klikken": rij["clicks"],
                    "positie": round(rij["position"], 1)}
    return uit


def registraties() -> dict[str, int]:
    """Accounts per campagne, uit profiles.acquisition in Supabase.

    De app legt de first-touch vast bij binnenkomst (src/lib/attribution.ts), dus
    een bezoeker die via een projectpagina binnenkwam en pas een week later
    registreert, telt nog steeds bij dat project.
    """
    env = {}
    for regel in open(APP_ENV):
        if "=" in regel and not regel.lstrip().startswith("#"):
            k, v = regel.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    sleutel = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not sleutel:
        print("  (geen Supabase-gegevens gevonden; registraties overgeslagen)")
        return {}
    r = subprocess.run(
        ["curl", "-sS", "-m", "60",
         f"{url}/rest/v1/profiles?select=acquisition&limit=50000",
         "-H", f"apikey: {sleutel}", "-H", f"Authorization: Bearer {sleutel}"],
        capture_output=True, text=True)
    try:
        rijen = json.loads(r.stdout)
    except Exception:
        print("  (Supabase gaf geen bruikbaar antwoord; registraties overgeslagen)")
        return {}
    if not isinstance(rijen, list):
        print(f"  (Supabase: {str(rijen)[:120]})")
        return {}
    met_campagne = sum(1 for x in rijen
                       if ((x.get("acquisition") or {}).get("utm_campaign") or "").strip())
    print(f"  {len(rijen)} profielen in Supabase, {met_campagne} met een herkomstcampagne")
    tel = {}
    for x in rijen:
        acq = x.get("acquisition") or {}
        camp = (acq.get("utm_campaign") or "").strip()
        if camp.startswith("project-"):
            # -tekening en -regisseur horen bij hetzelfde project.
            basis = re.sub(r"-(tekening|regisseur|budget|kluskist)$", "", camp)
            tel[basis] = tel.get(basis, 0) + 1
    return tel


def main():
    tot = date.today() - timedelta(days=3)      # GSC loopt ~3 dagen achter
    vanaf = tot - timedelta(days=DAGEN)
    print(f"Search Console, {vanaf} t/m {tot} ({DAGEN} dagen)")
    gsc = gsc_rijen(vanaf.isoformat(), tot.isoformat())
    print(f"  {len(gsc)} projectpagina's met vertoningen")

    reg = {} if ZONDER_REG else registraties()
    if reg:
        print(f"  {sum(reg.values())} registraties toe te wijzen aan {len(reg)} projecten")

    pages = json.loads((CLUSTER / "pages.json").read_text())
    rijen = []
    for p in pages:
        if p["slug"] in ("index", "oplevermonitor"):
            continue
        g = gsc.get(p["path"], {})
        rijen.append({
            "slug": p["slug"], "pad": p["path"],
            "vertoningen": g.get("vertoningen", 0),
            "klikken": g.get("klikken", 0),
            "positie": g.get("positie"),
            "registraties": reg.get(f"project-{p['slug']}", 0),
        })

    v = sum(r["vertoningen"] for r in rijen)
    k = sum(r["klikken"] for r in rijen)
    a = sum(r["registraties"] for r in rijen)
    gezien = sum(1 for r in rijen if r["vertoningen"] > 0)
    print(f"\n{len(rijen)} pagina's · {gezien} met vertoningen · {v} vertoningen · "
          f"{k} klikken ({k / v * 100:.1f}%)" if v else f"\n{len(rijen)} pagina's, geen vertoningen")
    if a:
        print(f"{a} registraties · {a / k * 100:.1f}% van de klikken" if k else f"{a} registraties")

    # Drie lekken, elk met een eigen vraag erachter.
    with_v = [r for r in rijen if r["vertoningen"] >= 20]
    geen_klik = sorted([r for r in with_v if r["klikken"] == 0],
                       key=lambda r: -r["vertoningen"])[:10]
    if geen_klik:
        print("\nWél gezien, niet aangeklikt — de titel of omschrijving werkt niet:")
        for r in geen_klik:
            print(f"  {r['vertoningen']:6} vertoningen  pos {r['positie']:4}  {r['slug'][:52]}")

    geen_reg = sorted([r for r in rijen if r["klikken"] >= 5 and r["registraties"] == 0],
                      key=lambda r: -r["klikken"])[:10]
    if geen_reg:
        print("\nWél bezocht, geen account — de pagina overtuigt niet:")
        for r in geen_reg:
            print(f"  {r['klikken']:6} klikken      pos {r['positie']:4}  {r['slug'][:52]}")

    onzichtbaar = [r for r in rijen if r["vertoningen"] == 0]
    if onzichtbaar:
        print(f"\nNul vertoningen: {len(onzichtbaar)} pagina's. "
              f"Die worden niet gevonden, en dat is een indexatie- of vraagprobleem.")

    RAPPORT.parent.mkdir(exist_ok=True)
    RAPPORT.write_text(json.dumps({
        "gemeten_op": date.today().isoformat(), "venster": [vanaf.isoformat(), tot.isoformat()],
        "totaal": {"pagina's": len(rijen), "vertoningen": v, "klikken": k, "registraties": a},
        "per_project": sorted(rijen, key=lambda r: -r["vertoningen"]),
    }, ensure_ascii=False, indent=1) + "\n")
    print(f"\nVolledige tabel: {RAPPORT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
