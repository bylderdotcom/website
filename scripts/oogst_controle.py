#!/usr/bin/env python3
"""Controleert of geoogste data wel over het juiste onderwerp gaat.

WAAROM DIT BESTAAT
------------------
Op 4 en 5 augustus 2026 ging drie keer data live die niet over het juiste
onderwerp ging:

  1. HORNBACH stond als badkamerspecialist op projectpagina's, omdat het vak-veld
     handgemaakt was en geen echt bedrijfstype kende.
  2. Een FAQ-schema beloofde drie vragen die nergens op de pagina stonden.
  3. De verkoopstand per project kwam uit een aanbevelingsblok met ANDERE
     projecten. Edisonpark en Soeterdael leverden exact dezelfde vijf regels op.
     Dat stond op 34 live pagina's.
  4. Een GSC-meting rapporteerde "8 impressies, 0 klikken" voor 25.698
     bedrijfsprofielen, waarop ze op noindex gingen. Het script had niets
     opgehaald: nul records kregen een cijfer. In werkelijkheid waren die
     pagina's 43% van al het siteverkeer — 402 klikken en 91.462 impressies.
     Een lege uitvoer is geen leeg resultaat.

Alle drie waren te vangen met een controle vóór publicatie. De derde zelfs met
één regel: twee verschillende onderwerpen die identieke cijfers opleveren, is per
definitie fout — tenzij ze zo dicht bij elkaar liggen dat het klopt.

Deze module is bedoeld om te draaien aan het einde van elk oogstscript, vóór de
uitkomst wordt weggeschreven. De poort hoort in de oogst, niet in de
paginagenerator; daar is het te laat.

Gebruik in een oogstscript:

    from oogst_controle import controleer
    fouten = controleer(uit, sleutels=("in_aanbouw", "opgeleverd"),
                        positie=lambda v: (v.get("lat"), v.get("lng")))
    if fouten:
        for f in fouten: print("  !", f)

Los draaien op een bestaande momentopname:

    python3 scripts/oogst_controle.py data/bag-snapshots/2026-08-04.json
"""
import json, math, sys, collections

# Twee onderwerpen mogen dezelfde uitkomst hebben als ze fysiek naast elkaar
# liggen — twee projecten op 300 meter delen hun omgeving nu eenmaal. Verder weg
# is identieke data een teken dat de bron gedeeld is in plaats van specifiek.
ZELFDE_BUURT_KM = 2.0


def km(a, b, c, d):
    R = 6371; p = math.pi / 180
    return 2 * R * math.asin(math.sqrt(math.sin((c - a) * p / 2) ** 2 +
           math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2))


def _vingerafdruk(v, sleutels):
    return tuple(v.get(k) for k in sleutels)


def identieke_uitkomsten(data, sleutels, positie=None, drempel=ZELFDE_BUURT_KM):
    """Onderwerpen die dezelfde cijfers opleveren terwijl ze ver uit elkaar liggen.

    Dit is de controle die de verkoopdata-blunder had gevangen: Edisonpark
    (Zoetermeer) en Soeterdael gaven dezelfde vijf regels, en dat kon niet.
    """
    groepen = collections.defaultdict(list)
    for sleutel, v in data.items():
        if not isinstance(v, dict) or v.get("fout"):
            continue
        fp = _vingerafdruk(v, sleutels)
        if all(x is None for x in fp):
            continue
        groepen[fp].append((sleutel, v))

    fouten = []
    for fp, leden in groepen.items():
        if len(leden) < 2:
            continue
        if positie is None:
            fouten.append(("FOUT" if len(leden) >= 3 else "verdacht",
                           f"{len(leden)} onderwerpen met identieke waarden {fp} — "
                           f"o.a. {', '.join((v.get('naam') or s)[:26] for s, v in leden[:3])}"))
            continue
        ver = []
        for i in range(len(leden)):
            for j in range(i + 1, len(leden)):
                pa, pb = positie(leden[i][1]), positie(leden[j][1])
                if not (pa and pb and all(pa) and all(pb)):
                    continue
                if km(float(pa[0]), float(pa[1]), float(pb[0]), float(pb[1])) > drempel:
                    ver.append((leden[i][1].get("naam"), leden[j][1].get("naam")))
        if ver:
            a, b = ver[0]
            # Twee onderwerpen met dezelfde getallen is toeval: bij 976 projecten
            # zijn er honderdduizenden paren en dan botst een combinatie een keer.
            # Drie of meer is systematiek — dan komt de data uit een gedeelde bron.
            ernst = "FOUT" if len(leden) >= 3 else "verdacht"
            fouten.append((ernst, f"identieke waarden {fp} bij {len(leden)} onderwerpen die niet "
                                  f"naast elkaar liggen — bv. {a} en {b}"))
    return fouten


def onmogelijke_verhouding(data, deel, geheel, marge=1.15):
    """Een deel dat groter is dan het geheel. Ving de 343 projecten waar de meting
    meer eenheden telde dan het project woningen had."""
    fouten = []
    for sleutel, v in data.items():
        if not isinstance(v, dict):
            continue
        d, g = v.get(deel), v.get(geheel)
        if d and g and d > g * marge:
            fouten.append(("FOUT", f"{(v.get('naam') or sleutel)[:34]}: {deel}={d} > {geheel}={g}"))
    return fouten


def geen_variatie(data, veld, drempel=0.98):
    """Een veld dat overal hetzelfde is, meet niets. Zo bleek `status` waardeloos:
    voor alle 976 projecten "In verkoop", omdat dat woord in het filtermenu stond."""
    waarden = [v.get(veld) for v in data.values() if isinstance(v, dict) and v.get(veld) is not None]
    if len(waarden) < 20:
        return []
    top, n = collections.Counter(waarden).most_common(1)[0]
    if n / len(waarden) >= drempel:
        return [("FOUT", f"veld '{veld}' is bij {100*n//len(waarden)}% van de {len(waarden)} "
                         f"records '{top}' — dat meet niets")]
    return []


def heeft_gemeten(data, sleutels, min_gevuld=0.05):
    """Bewijst deze oogst dat hij gemeten heeft?

    Op 31 juli 2026 verwierp ik 14.191 profielpagina's omdat mijn meetscript "8
    impressies, 0 klikken" rapporteerde. In werkelijkheid schreef het script nul
    van de 25.698 bedrijven een cijfer toe: het had niets opgehaald. Ik las een
    lege uitvoer als een leeg resultaat, en haalde daarmee 43% van het siteverkeer
    uit de index.

    Een script dat duizenden records verwerkt en er vrijwel geen een waarde geeft,
    heeft een storing — geen bevinding. Dat onderscheid is niet uit de uitkomst af
    te leiden, alleen uit de vulgraad.
    """
    n = sum(1 for v in data.values() if isinstance(v, dict))
    if n < 20:
        return []
    gevuld = sum(1 for v in data.values()
                 if isinstance(v, dict) and any(v.get(k) not in (None, 0, "") for k in sleutels))
    aandeel = gevuld / n
    if aandeel < min_gevuld:
        return [("FOUT", f"slechts {gevuld} van de {n} records ({aandeel*100:.1f}%) heeft een "
                         f"waarde op {sleutels}. Dat is een storing in de oogst, geen bevinding "
                         f"— trek er geen conclusie uit voordat je weet waarom hij leeg is.")]
    return []


def besmet_aandeel(data, sleutels, positie=None, drempel=ZELFDE_BUURT_KM):
    """Welk deel van de records deelt zijn cijfers met een ver verwijderd ander
    record. Dit is de maat die toeval van systematiek scheidt.

    Bij de ongeldige verkoopdata is dat aandeel groot: de cijfers kwamen uit één
    gedeeld blok, dus honderden projecten deelden hun uitkomst. Bij de BAG-meting
    is het klein: daar botsen alleen af en toe twee getallen bij toeval.
    """
    groepen = collections.defaultdict(list)
    for sleutel, v in data.items():
        if not isinstance(v, dict) or v.get("fout"):
            continue
        fp = _vingerafdruk(v, sleutels)
        if all(x is None for x in fp):
            continue
        groepen[fp].append(v)
    totaal = sum(len(g) for g in groepen.values())
    besmet = 0
    for leden in groepen.values():
        if len(leden) < 2:
            continue
        if positie is None:
            besmet += len(leden); continue
        ver = False
        for i in range(len(leden)):
            for j in range(i + 1, len(leden)):
                pa, pb = positie(leden[i]), positie(leden[j])
                if pa and pb and all(pa) and all(pb) and km(
                        float(pa[0]), float(pa[1]), float(pb[0]), float(pb[1])) > drempel:
                    ver = True; break
            if ver: break
        if ver:
            besmet += len(leden)
    return (besmet / totaal if totaal else 0.0), besmet, totaal


def oordeel(data, sleutels, positie=None, grens=0.10):
    """Eén regel: deugt deze oogst? Boven de grens komt de data uit een gedeelde
    bron in plaats van van het onderwerp zelf, en mag hij de site niet raken."""
    aandeel, besmet, totaal = besmet_aandeel(data, sleutels, positie)
    ok = aandeel < grens
    return ok, (f"{besmet} van de {totaal} records ({aandeel*100:.1f}%) deelt zijn cijfers "
                f"met een ver verwijderd ander record — grens is {grens*100:.0f}%. "
                + ("Aanvaard." if ok else "AFGEKEURD: dit wijst op een gedeelde bron."))


def controleer(data, sleutels, positie=None, deel=None, geheel=None, velden=(),
               alleen_fouten=True):
    """Geeft een lijst (ernst, melding). Met alleen_fouten=True blijven de losse
    toevalstreffers weg en houd je over wat op een gedeelde bron wijst."""
    uit = heeft_gemeten(data, sleutels)
    if uit:
        # Bij een lege oogst zeggen de andere controles niets zinnigs meer.
        return uit if alleen_fouten else uit
    uit = identieke_uitkomsten(data, sleutels, positie)
    if deel and geheel:
        uit += onmogelijke_verhouding(data, deel, geheel)
    for v in velden:
        uit += geen_variatie(data, v)
    return [x for x in uit if x[0] == "FOUT"] if alleen_fouten else uit


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    data = json.load(open(sys.argv[1], encoding="utf8"))
    # raad de meetvelden: numerieke velden die niet overal gelijk zijn
    eerste = next((v for v in data.values() if isinstance(v, dict) and not v.get("fout")), {})
    num = [k for k, v in eerste.items() if isinstance(v, (int, float))]
    print(f"{len(data)} records · meetvelden: {', '.join(num) or '(geen)'}\n")
    fouten = controleer(data, sleutels=tuple(num), alleen_fouten=False,
                        positie=lambda v: (v.get("lat"), v.get("lng")),
                        velden=[k for k, v in eerste.items() if isinstance(v, str)][:3])
    echt = [f for f in fouten if f[0] == "FOUT"]
    if not echt:
        print("Geen bezwaren." + (f" ({len(fouten)} losse toevalstreffers genegeerd)"
                                  if fouten else ""))
    else:
        print(f"{len(echt)} bezwaren:")
        for _, m in echt[:20]:
            print("  !", m)
        if len(echt) > 20:
            print(f"  … en nog {len(echt)-20}")
    sys.exit(1 if echt else 0)


if __name__ == "__main__":
    main()
