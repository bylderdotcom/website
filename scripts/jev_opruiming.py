#!/usr/bin/env python3
"""Bedrijven die geen vakbedrijf zijn uit de overzichtslijsten halen.

WAT ER MIS IS
De acht bedrijfsclusters bevatten 25.594 profielen. De vakclassificatie uit
scripts/jev_interne_links.py wijst er 3.342 aan die niet het vak uitoefenen
waaronder ze staan. Maar dat getal is niet één probleem:

  381  geen installateur — winkel, showroom, of iets heel anders
  390  aanpalend vak dat in de praktijk samengaat (installatietechniek doet
       elektra én water; Jev moet er één kiezen)
  530  een ander vak dat niet overlapt (een parketzaak onder gietvloeren)

Alleen de eerste groep is schadelijk. Onder "badkamerspecialisten in De Bilt"
staat Van der Valk Hotel De Bilt; onder dezelfde noemer een witgoedwinkel en
een webshop voor badmatten. De tweede groep moet juist blijven staan, en de
derde is te onzeker om op te ruimen — DRT Contemporary Flooring staat bij ons
als parketzaak maar levert ook gietvloeren en is voucherpartner.

WAAROM DRIE SIGNALEN EN GEEN HANDMATIGE CONTROLE
381 gevallen met de hand nakijken is geen werk voor een mens. In plaats van
controleren verdubbelen we het oordeel:

  1. De classificatie zei al "anders", met zekerheid 0,90 of hoger.
  2. Een ánders gestelde vraag: voert dit bedrijf werk uit bij mensen thuis?
     Dezelfde uitkomst uit een andere vraag is een veel harder oordeel dan
     dezelfde vraag twee keer stellen. "Anders" is in de eerste vraag een
     restcategorie; hier is het de vraag zelf.
  3. De eigen website, opgehaald en beoordeeld. Dat is geen model dat zijn
     eigen oordeel bevestigt maar een nieuwe bron. 311 van de 381 hebben er een.

Alleen waar de signalen het eens zijn, gaat de vlag om. Waar ze botsen gebeurt
er niets, en dat stapeltje is precies wat aandacht verdient.

WAT DE VLAG DOET, EN WAT NIET
Hij haalt het bedrijf uit de overzichtslijsten ("badkamerspecialisten in X").
Het profiel zelf blijft bestaan: geen URL die verdwijnt, geen 404, geen
redirect. Zit er een fout in, dan is het één regel in dit bestand weghalen en
de volgende bouw staat het weer goed. Omkeerbaar is hier meer waard dan zeker.

Gebruik:
    python3 scripts/jev_opruiming.py --droog        # kandidaten tellen
    python3 scripts/jev_opruiming.py --max 30       # proefronde
    python3 scripts/jev_opruiming.py                # alles
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINKS = ROOT / "data" / "interne-links"
UIT = ROOT / "data" / "vakbedrijven-uitgesloten.json"
CLUSTERS = ("gietvloer", "aannemer", "loodgieter", "schilder",
            "elektricien", "stukadoor", "badkamer", "dakkapel")
CLUSTER_VAKKEN = {"badkamer": {"loodgieter", "tegel"}, "dakkapel": {"aannemer"}}

VAK_ZEKER = 0.90      # ondergrens van de eerste ronde
UITVOEREND = 0.40     # onder deze Noul-waarde voert het bedrijf geen werk uit
SITE_UITVOEREND = 0.40  # dezelfde vraag, maar gesteld aan de eigen website
DELAY = 1.0
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")

DROOG = "--droog" in sys.argv
MAX = None
for i, a in enumerate(sys.argv):
    if a == "--max" and i + 1 < len(sys.argv):
        MAX = int(sys.argv[i + 1])


def kandidaten() -> list[dict]:
    bron = {b["slug"].rsplit("-", 1)[-1]: b
            for b in json.loads((ROOT / "data" / "vakbedrijven.json").read_text())["vakbedrijven"]}
    uit = []
    for c in CLUSTERS:
        pad = LINKS / f"vakken-{c}.json"
        if not pad.exists():
            continue
        ok = CLUSTER_VAKKEN.get(c, {c})
        for sleutel, x in json.loads(pad.read_text()).items():
            if x.get("vak") != "anders" or x.get("zeker", 0) < VAK_ZEKER or "anders" in ok:
                continue
            b = bron.get(sleutel.rsplit("-", 1)[-1])
            if b:
                uit.append({"cluster": c, "sleutel": sleutel, "slug": b["slug"],
                            "naam": b["naam"], "stad": b.get("stad") or "",
                            "website": b.get("website") or "",
                            "diensten": b.get("diensten") or [],
                            "vak_zeker": x["zeker"]})
    return uit


def sitetekst(url: str) -> str:
    """Eerste pagina van de eigen site, kaal. Faalt hij, dan geen derde signaal."""
    try:
        r = subprocess.run(["curl", "-sSL", "-m", "20", "-A", UA, url],
                           capture_output=True, text=True, timeout=30)
        h = r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""
    h = re.sub(r"<(script|style|noscript|svg)\b[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    import html as H
    return re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", h))).strip()[:4000]


def main():
    lijst = kandidaten()
    if MAX:
        lijst = lijst[:MAX]
    print(f"{len(lijst)} kandidaten (vak 'anders', zekerheid >= {VAK_ZEKER})")
    met_site = sum(1 for k in lijst if k["website"])
    print(f"waarvan {met_site} met een eigen website\n")
    if DROOG:
        return

    from typesafe_sdk import Noul, TypeSafeClient
    client = TypeSafeClient()

    bestaand = json.loads(UIT.read_text()) if UIT.exists() else {}
    eens = oneens = geen_derde = 0

    for i, k in enumerate(lijst, 1):
        state = "\n".join(filter(None, [
            f"Company: {k['naam']}",
            f"Town: {k['stad']}",
            ("Services listed: " + ", ".join(k["diensten"][:12])) if k["diensten"] else "",
        ]))
        # Tweede signaal: niet "welk vak", maar "voert het überhaupt werk uit".
        a = client.system_one(state=state, questions={"uitvoerend": Noul(
            instructions="The company in the state above carries out installation, "
                         "construction or finishing work at customers' premises.",
            criteria={
                "true": "It is a contractor, installer, fitter or craftsman that does "
                        "the work itself at the customer's home or building.",
                "false": "It is a shop, showroom, webshop, wholesaler, manufacturer, "
                         "hotel, restaurant or any other business that does not carry "
                         "out installation work at customers' premises.",
            })})
        uitv = a.answers["uitvoerend"].noul

        # Derde signaal: de eigen website, een bron buiten ons eigen oordeel.
        site_noul = None
        if k["website"]:
            tekst = sitetekst(k["website"])
            time.sleep(DELAY)
            if len(tekst) > 200:
                b = client.system_one(
                    state=f"Website text of {k['naam']}:\n\n{tekst}",
                    questions={"uitvoerend": Noul(
                        instructions="The business behind this website carries out "
                                     "installation, construction or finishing work at "
                                     "customers' premises.",
                        criteria={
                            "true": "A contractor, installer, fitter or craftsman that "
                                    "does the work itself at the customer's home or "
                                    "building.",
                            "false": "A shop, showroom, webshop, wholesaler, manufacturer, "
                                     "holding company, consultancy, or a business in a "
                                     "different line of work entirely.",
                        })})
                site_noul = b.answers["uitvoerend"].noul

        # De vlag gaat alleen om als de signalen elkaar niet tegenspreken.
        # Beide vragen zijn nu dezelfde vraag, aan twee verschillende bronnen: de
        # profielgegevens en de eigen website. Dat maakt een verschil tussen de
        # twee betekenisvol — de eerste opzet vroeg aan de website "is dit een
        # winkel", en "geen winkel" bleek geen bewijs van "wel installateur":
        # een holding en een adviesbureau scoorden daar allebei laag op.
        tweede = uitv <= UITVOEREND
        derde = None if site_noul is None else site_noul <= SITE_UITVOEREND
        if tweede and derde is not False:
            bestaand[k["slug"]] = {
                "cluster": k["cluster"], "naam": k["naam"], "stad": k["stad"],
                "vak_zeker": round(k["vak_zeker"], 3),
                "uitvoerend": round(uitv, 3),
                "site_uitvoerend": None if site_noul is None else round(site_noul, 3),
                "website": k["website"],
                "beoordeeld_op": date.today().isoformat(),
            }
            eens += 1
            if derde is None:
                geen_derde += 1
            merk = "✓" if derde else ("·" if derde is None else "?")
            print(f"  {merk} {k['naam'][:40]:42} {k['cluster']:10} "
                  f"uitv {uitv:.2f}" + (f" site {site_noul:.2f}" if site_noul is not None else ""))
        else:
            oneens += 1
            print(f"  – {k['naam'][:40]:42} {k['cluster']:10} "
                  f"uitv {uitv:.2f}" + (f" site {site_noul:.2f}" if site_noul is not None else "")
                  + "  (signalen oneens, blijft staan)")

        if i % 25 == 0:
            UIT.write_text(json.dumps(bestaand, ensure_ascii=False, indent=1, sort_keys=True) + "\n")

    UIT.write_text(json.dumps(bestaand, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    print(f"\n{eens} uitgesloten, {oneens} blijven staan omdat de signalen elkaar tegenspreken.")
    print(f"Van de uitgeslotenen hadden er {geen_derde} geen bruikbare website als derde signaal.")
    print(f"Weggeschreven naar {UIT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
