#!/usr/bin/env python3
"""Relevante interne links voor bedrijfsprofielen, gerangschikt door Jev (TypeSafe).

Aanleiding: de tegels "Andere <vak> in <stad>" onder een profiel komen uit de oude
generator en volgen één regel — zelfde stad. Staat een bedrijf als enige in zijn
plaats, dan blijft het blok leeg: 2.345 van de 25.699 profielen hebben nul
gerelateerde links, 4.077 hooguit één. Bereikbaarheid is daarmee niet het probleem
(die staat op 99,5%, zie reports/interne-linkarchitectuur-ontwerp.md); relevantie wel.

Werkverdeling, conform de Jev-documentatie: de voorselectie gebeurt hier in code
(zelfde vak, dichtstbijzijnde bedrijven, straal begrensd), Jev doet uitsluitend het
oordeel "is dit een zinvol vervolg voor deze lezer". Jev genereert niets — de
linktekst is de bestaande bedrijfsnaam.

Draaien:
    python3 scripts/jev_interne_links.py gietvloer --dry-run   # kandidaten, geen API
    python3 scripts/jev_interne_links.py gietvloer             # met TYPESAFE_API_KEY
"""
from __future__ import annotations

import argparse
import html
import json
import math
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DATA = REPO / "data"
UIT = DATA / "interne-links"

# Voorselectie: ruim genoeg dat Jev iets te kiezen heeft, krap genoeg dat de
# irrelevante meerderheid niet als afleiding meegaat (bekende zwakte van jev-1.13).
KANDIDATEN = 12
MAX_KM = 45.0
DOEL_TEGELS = 6          # zoveel tegels wil een profiel uiteindelijk hebben
# Twee losse oordelen per kandidaat. Eén vraag die "nuttig vervolg" meet, meet in de
# praktijk afstand en vakgebied door elkaar: een gietvloerder twee provincies verderop
# en een vastgoedonderhoudsbedrijf om de hoek belanden dan op dezelfde score. Vandaar
# een aparte vraag of het bedrijf het vak überhaupt uitoefent — dat is de fout die we
# willen uitsluiten. Beide moeten slagen (de "composite scoring"-vorm uit de docs).
DREMPEL = 0.60           # ondergrens voor "nuttig vervolg"

# Het vak wordt in een APARTE ronde bepaald, met het bedrijf zelf als context.
# Vraag je het binnen de profielronde, dan stuur je het profiel van een gietvloerder
# als state mee en kleurt die context elk oordeel: dan wordt ook een
# vastgoedonderhoudsbedrijf "gietvloer". Het vak van een bedrijf hangt niet af van
# welke pagina je toevallig bekijkt, dus hoort het er ook niet in.
#
# Het is een keuze, geen ja-nee-vraag. Als Noul gesteld ("doet dit bedrijf
# gietvloeren?") antwoordt Jev over de hele linie laag: de meeste bedrijven hebben
# geen dienstenlijst, en hij bevestigt niet wat er niet staat — ook Soldicoat
# Kunststofvloeren kwam zo niet boven 0,63 uit. Als Choice gesteld hoeft hij niets
# te bewijzen, alleen het best passende vak aan te wijzen, en dat is precies het
# oordeel dat we nodig hebben.
VAK_ZEKERHEID = 0.55     # onder deze zekerheid durven we het vak niet vast te stellen
VAKKEN = {
    "gietvloer": "Pours seamless resin, PU, epoxy, concrete-look or microcement floors",
    "tegel": "Lays tiles, natural stone or ceramic floor and wall coverings",
    "parket": "Supplies or lays wooden floors, parquet, PVC or laminate",
    "stukadoor": "Plasters walls and ceilings, stucco and rendering work",
    "loodgieter": "Plumbing, heating, sanitary installation",
    "elektricien": "Electrical installation work",
    "schilder": "Painting and decorating",
    "aannemer": "General contracting, construction and renovation",
    "onderhoud": "General property maintenance, cleaning or facility services",
    "anders": "None of the above, or a shop or showroom rather than an installer",
}

# NIET ELK CLUSTER IS EEN VAK.
# De eerste ronde over badkamer en dakkapel leverde nul links op, en dat was geen
# storing: de voorselectie eist "zelfde vak als het cluster", en "badkamer" en
# "dakkapel" staan niet in VAKKEN — dat zijn klussen, geen beroepen. Een badkamer
# wordt gelegd door een loodgieter of een tegelzetter, een dakkapel gezet door een
# aannemer. Van de 2.144 badkamerbedrijven classificeerde Jev er 705 als loodgieter
# en 512 als tegelzetter; van de 1.526 dakkapelbedrijven 1.031 als aannemer.
#
# Bewust géén "aannemer" bij badkamer: een algemene aannemer onder het kopje
# badkamerspecialist is precies de vervuiling die dit blok moest opruimen.
CLUSTER_VAKKEN = {
    "badkamer": {"loodgieter", "tegel"},
    "dakkapel": {"aannemer"},
}


def laad(cluster: str):
    cl = json.loads((DATA / "clusters" / cluster / "bedrijven.json").read_text())
    bron = json.loads((DATA / "vakbedrijven.json").read_text())["vakbedrijven"]
    # De cluster-sleutel (bedrijf/<naam>-<id>) en de bron-slug delen alleen het
    # id-achtervoegsel; daarop koppelen.
    op_id = {b["slug"].rsplit("-", 1)[-1]: b for b in bron if b.get("vak") == cluster}
    rijen = {}
    for sleutel, c in cl.items():
        b = op_id.get(sleutel.rsplit("-", 1)[-1])
        if not b or not b.get("lat") or not b.get("lng"):
            continue
        rijen[sleutel] = {
            "sleutel": sleutel,
            "href": f"/{cluster}/{sleutel}/",
            # De clusterdata komt uit geparste HTML en bevat nog entities.
            "naam": html.unescape(c.get("name") or b.get("naam") or ""),
            "stad": html.unescape(c.get("city") or b.get("stad") or ""),
            "regio": b.get("regio"),
            "lat": float(b["lat"]),
            "lng": float(b["lng"]),
            "rating": b.get("google_rating"),
            "reviews": b.get("google_reviews") or 0,
            "diensten": b.get("diensten") or [],
            "tegels": [s.get("href") for s in (c.get("siblings") or [])],
            "vak_cluster": cluster,
        }
    return rijen


def km(a, b) -> float:
    """Hemelsbrede afstand in kilometers."""
    r = 6371.0
    dlat = math.radians(b["lat"] - a["lat"])
    dlng = math.radians(b["lng"] - a["lng"])
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(a["lat"])) * math.cos(math.radians(b["lat"])) * math.sin(dlng / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(h))


def kandidaten(doel, alle, vakken=None) -> list:
    """Voorselectie in code: dichtstbijzijnde bedrijven die nog niet gelinkt zijn.
    Met `vakken` vallen bedrijven af die het vak niet uitoefenen."""
    bezet = set(doel["tegels"]) | {doel["href"]}
    nabij = []
    for r in alle.values():
        if r["href"] in bezet:
            continue
        if vakken is not None:
            v = vakken.get(r["sleutel"])
            toegestaan = CLUSTER_VAKKEN.get(doel["vak_cluster"], {doel["vak_cluster"]})
            if not v or v["zeker"] < VAK_ZEKERHEID or v["vak"] not in toegestaan:
                continue
        d = km(doel, r)
        if d <= MAX_KM:
            nabij.append((d, r))
    nabij.sort(key=lambda t: t[0])
    return [(round(d, 1), r) for d, r in nabij[:KANDIDATEN]]


def state_van(r) -> str:
    """De pagina zoals een lezer hem ziet, zonder ruis."""
    regels = [f"Bedrijf: {r['naam']}", f"Plaats: {r['stad']}"]
    if r.get("regio"):
        regels.append(f"Regio: {r['regio']}")
    if r.get("rating"):
        regels.append(f"Google-beoordeling: {r['rating']} uit {r['reviews']} reviews")
    if r.get("diensten"):
        regels.append("Diensten: " + ", ".join(r["diensten"][:12]))
    return "\n".join(regels)


def kandidaat_regel(afstand, k) -> str:
    stukken = [f"{k['naam']} in {k['stad']}, {afstand} km away"]
    if k.get("rating"):
        stukken.append(f"rated {k['rating']} from {k['reviews']} reviews")
    if k.get("diensten"):
        stukken.append("services: " + ", ".join(k["diensten"][:8]))
    return "; ".join(stukken)


def vraag_van(afstand, k):
    """Instructie in het Engels — Jev is daar aantoonbaar nauwkeuriger in — terwijl
    de bedrijfsgegevens Nederlands blijven."""
    return (
        "A homeowner is reading the company profile in the state above and wants a "
        "worthwhile alternative to consider. The candidate is: "
        + kandidaat_regel(afstand, k)
        + ". Answer true only if visiting this candidate is genuinely useful for that "
        "reader: it must be reachable from their location and comparable in what it "
        "offers. Answer false if it is too far to be practical, or if it does not "
        "serve the same need."
    )


def vakbestand(cluster: str) -> Path:
    return UIT / f"vakken-{cluster}.json"


def classificeer(cluster: str, alle: dict) -> dict:
    """Eenmalig per bedrijf: welk vak oefent het uit? Resultaat wordt bewaard, zodat
    een tweede ronde over hetzelfde cluster niets opnieuw hoeft te vragen."""
    from typesafe_sdk import Choice, TypeSafeClient

    pad = vakbestand(cluster)
    bekend = json.loads(pad.read_text()) if pad.exists() else {}
    te_doen = [r for r in alle.values() if r["sleutel"] not in bekend]
    if not te_doen:
        return bekend

    print(f"vak bepalen voor {len(te_doen)} bedrijven")
    client = TypeSafeClient()
    for i, r in enumerate(te_doen, 1):
        antwoord = client.system_one(
            state=state_van(r),
            questions={"vak": Choice(
                instructions="Which trade does the company in the state above carry "
                             "out itself? Judge from its name and, when present, its "
                             "listed services.",
                criteria=VAKKEN)},
        )
        a = antwoord.answers["vak"]
        bekend[r["sleutel"]] = {"vak": a.choice, "zeker": round(a.confidence, 3)}
        if i % 50 == 0:
            print(f"  {i}/{len(te_doen)}")
            pad.parent.mkdir(parents=True, exist_ok=True)
            pad.write_text(json.dumps(bekend, ensure_ascii=False, indent=2) + "\n")
    pad.parent.mkdir(parents=True, exist_ok=True)
    pad.write_text(json.dumps(bekend, ensure_ascii=False, indent=2) + "\n")
    return bekend


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("cluster")
    p.add_argument("--dry-run", action="store_true", help="kandidaten tonen, geen API-aanroep")
    p.add_argument("--limiet", type=int, default=0, help="beperk tot N profielen (proef)")
    args = p.parse_args()

    alle = laad(args.cluster)
    arm = [r for r in alle.values() if len(r["tegels"]) < DOEL_TEGELS]
    if args.limiet:
        arm = arm[: args.limiet]
    print(f"{args.cluster}: {len(alle)} profielen, {len(arm)} met minder dan {DOEL_TEGELS} tegels")

    if args.dry_run:
        for r in arm[:5]:
            ks = kandidaten(r, alle)
            print(f"\n{r['naam']} ({r['stad']}) — nu {len(r['tegels'])} tegels")
            for d, k in ks[:6]:
                print(f"   {d:>5} km  {k['naam']} ({k['stad']})")
        return 0

    sleutel = os.environ.get("TYPESAFE_API_KEY")
    if not sleutel:
        print("TYPESAFE_API_KEY ontbreekt in de omgeving.", file=sys.stderr)
        return 1

    from typesafe_sdk import Noul, TypeSafeClient  # pas importeren als hij nodig is

    vakken = classificeer(args.cluster, alle)
    client = TypeSafeClient()
    uit = {}
    for i, r in enumerate(arm, 1):
        ks = kandidaten(r, alle, vakken)
        if not ks:
            continue
        vragen = {}
        for n, (d, k) in enumerate(ks):
            vragen[f"nut{n}"] = Noul(instructions=vraag_van(d, k))
        antwoord = client.system_one(state=state_van(r), questions=vragen)
        scores = []
        for n, (d, k) in enumerate(ks):
            nut = antwoord.answers[f"nut{n}"].noul
            if nut >= DREMPEL:
                scores.append((nut, vakken[k["sleutel"]]["zeker"], d, k))
        scores.sort(key=lambda t: -t[0])
        ruimte = DOEL_TEGELS - len(r["tegels"])
        uit[r["sleutel"]] = [
            {"href": k["href"], "name": k["naam"], "rating": k.get("rating"),
             "km": d, "noul": round(w, 3), "vak_zeker": v}
            for w, v, d, k in scores[:ruimte]
        ]
        if i % 25 == 0:
            print(f"  {i}/{len(arm)}")

    UIT.mkdir(parents=True, exist_ok=True)
    pad = UIT / f"{args.cluster}.json"
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=2) + "\n")
    gevuld = sum(1 for v in uit.values() if v)
    print(f"geschreven: {pad} — {gevuld} profielen kregen extra links")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
