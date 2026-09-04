#!/usr/bin/env python3
"""Cijferaudit: welke getallen op de site wijken af van de data eronder?

WAT DIT ANDERS DOET DAN scripts/check_claims.py
Die bewaker controleert of een pagina zichzélf tegenspreekt: zichtbare tekst,
titel, meta en schema moeten hetzelfde beweren. Dat vangt niet het geval waarin
alle vier hetzelfde beweren en het samen fout is.

Dat is precies wat er gebeurde met "61 merken". Dat getal stond consistent op
8.669 pagina's, in tekst én menu, en was al maanden onwaar: het was het aantal
vouchers uit de legacy-import, niet het aantal merken. Geen enkele bestaande
controle kon dat zien, want er was niets om tegen af te zetten.

DE KERN: elk getal dat met de hand is ingetypt, drift. De site groeit; de zin
niet. Dit script zoekt de getallen op en zet ze naast de bron die het antwoord
kent. Wat geen bron heeft, wordt niet stil goedgekeurd maar apart gezet als
'handmatig beoordelen' — dat is een lijst voor een mens, geen groen vinkje.

DRAAIT OP DE BUILD-OUTPUT, niet op de bron. Een bron liegt niet maar vertelt de
helft: pagina's komen uit generatoren, sjablonen en sweeps, en pas in web/out
staat wat een bezoeker werkelijk leest.

Gebruik:
    python3 scripts/claim_drift.py web/out
    python3 scripts/claim_drift.py web/out --steekproef 2000
"""
import html as htmllib
import json
import os
import re
import sys
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAPPORT_JSON = os.path.join(REPO, "reports", "claim-drift.json")
RAPPORT_MD = os.path.join(REPO, "reports", "claim-drift.md")


# ── De bronnen die een antwoord kennen ────────────────────────────────────
def tel_json(pad, sleutel=None, uniek_op=None):
    """Telt items in een databestand. None als het bestand ontbreekt."""
    p = os.path.join(REPO, pad)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf8") as f:
        d = json.load(f)
    lijst = d if isinstance(d, list) else d.get(sleutel or "", [])
    if not isinstance(lijst, list):
        return None
    if uniek_op:
        return len({x[uniek_op] for x in lijst if isinstance(x, dict) and x.get(uniek_op)})
    return len(lijst)


# Alleen deze woorden hebben één onbetwiste noemer. "gemeenten" niet: de
# homepage zegt "288 gemeenten" en bedoelt gemeenten mét een nieuwbouwproject,
# terwijl data/gemeenten.json alle 342 Nederlandse gemeenten kent. Dat is geen
# fout maar een andere noemer, en een audit die dat verschil niet kent roept
# vals alarm — precies waardoor niemand hem meer leest.
#
# Zulke claims komen daarom in de lijst 'geen bron', mét het datacijfer als
# context, zodat een mens beslist welke noemer geldt en die vastlegt.
ONBETWIST = {"merken", "woonmerken", "deelnemers", "klussen", "beoordelingen", "reviews"}


def waarheden():
    """Wat is er werkelijk? Per zelfstandig naamwoord één getal, of None."""
    return {
        "merken": tel_json("data/deelnemers.json", "deelnemers", "naam"),
        "woonmerken": tel_json("data/deelnemers.json", "deelnemers", "naam"),
        "deelnemers": tel_json("data/deelnemers.json", "deelnemers", "naam"),
        "vakbedrijven": tel_json("data/vakbedrijven.json", "vakbedrijven"),
        "nieuwbouwprojecten": tel_json("data/nieuwbouwprojecten.json", "projecten"),
        "gemeenten": tel_json("data/gemeenten.json", "gemeenten"),
        "projecten": tel_json("data/nieuwbouwprojecten.json", "projecten"),
        "klussen": tel_json("data/uitgevoerde-klussen.json", "klussen"),
        "beoordelingen": tel_json("data/vakman-reviews.json", "reviews"),
        "reviews": tel_json("data/vakman-reviews.json", "reviews"),
    }


# ── Wat we zoeken ─────────────────────────────────────────────────────────
# Telbare beweringen: een getal met een zelfstandig naamwoord dat we kunnen
# natellen. "40+" en "ruim 300" horen er ook bij; die zijn ondergrenzen en
# worden als zodanig beoordeeld.
TELBAAR = re.compile(
    r"\b(?:(ruim|meer dan|bijna|al)\s+)?(\d{1,3}(?:\.\d{3})*)\s*(\+)?\s*"
    r"(merken|woonmerken|deelnemers|vakbedrijven|nieuwbouwprojecten|projecten|gemeenten|"
    r"steden|plaatsen|winkels|klussen|beoordelingen|reviews|categorie\u00ebn)\b",
    re.I)

# Geldbedragen met hun aanloop, want "€759" zonder context zegt niets.
GELD = re.compile(r"((?:vanaf|gemiddeld|bespaar[a-z]*|tot|al)\s+)?"
                  r"(€\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?)", re.I)

# Beweringen die per definitie niet na te tellen zijn en dus door een mens
# beoordeeld moeten worden.
ONVERIFIEERBAAR = re.compile(
    r"\b(de grootste|het grootste|de enige|als enige|de eerste|de meest complete|"
    r"marktleider|nummer 1|beste van nederland|altijd de laagste)\b", re.I)

SCHOON = re.compile(r"<(script|style)[^>]*>.*?</\1>|<[^>]+>", re.S)

# Pagina's waar een fout getal het meeste kost. Hun beweringen worden apart
# gezet, ook als ze maar op die ene pagina staan: de variatie-regel hierboven
# beschermt tegen ruis, maar zou een verkeerd cijfer op de homepage in 1.500
# lokale cijfers begraven — en dat is nu juist de plek waar het telt.
SLEUTELPAGINAS = {"/", "/vouchers/", "/assortiment/", "/inkoopvoordeel/", "/nieuwbouw/",
                  "/deelnemer-worden/", "/kozijnloze-deuren/", "/prijzen/", "/zakelijk/",
                  "/voor-vakbedrijven/", "/nieuwbouw-project/"}


def tekst_van(h):
    return htmllib.unescape(SCHOON.sub(" ", h))


def url_van(pad, wortel):
    rel = os.path.relpath(pad, wortel).replace(os.sep, "/")
    rel = rel[:-len("index.html")] if rel.endswith("index.html") else rel
    rel = rel.rstrip("/")
    return "/" + rel + ("/" if rel and not rel.endswith(".html") else "")


def scan(wortel, limiet=None):
    telbaar, geld, groot = defaultdict(set), defaultdict(set), defaultdict(set)
    n = 0
    for pad, mappen, bestanden in os.walk(wortel):
        mappen[:] = [m for m in mappen if m not in ("_next", "img", "api")]
        for b in bestanden:
            if not b.endswith(".html"):
                continue
            p = os.path.join(pad, b)
            try:
                t = tekst_van(open(p, encoding="utf8").read())
            except (UnicodeDecodeError, OSError):
                continue
            u = url_van(p, wortel)
            for aanloop, getal, plus, woord in TELBAAR.findall(t):
                sleutel = (woord.lower(), getal, bool(plus) or bool(aanloop.strip()))
                telbaar[sleutel].add(u)
            for aanloop, bedrag in GELD.findall(t):
                if aanloop.strip():
                    geld[(aanloop.strip().lower(), bedrag.replace(" ", ""))].add(u)
            for m in ONVERIFIEERBAAR.findall(t):
                groot[m.lower()].add(u)
            n += 1
            if limiet and n >= limiet:
                return telbaar, geld, groot, n
    return telbaar, geld, groot, n


def main():
    wortel = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "web/out"
    wortel = os.path.join(REPO, wortel) if not os.path.isabs(wortel) else wortel
    limiet = None
    if "--steekproef" in sys.argv:
        limiet = int(sys.argv[sys.argv.index("--steekproef") + 1])

    if not os.path.isdir(wortel):
        sys.exit(f"Niet gevonden: {wortel}. Draai eerst de build.")

    echt = waarheden()
    telbaar, geld, groot, paginas = scan(wortel, limiet)

    # SITEBREED VERSUS LOKAAL — het onderscheid waar deze audit op staat of valt.
    #
    # "4 nieuwbouwprojecten" op /wonen-in/amersfoort/ is een lokaal cijfer dat
    # klopt; dat naast het landelijke totaal van 995 leggen levert een fout op
    # die er niet is. Een audit die zulke ruis produceert wordt niet gelezen, en
    # dan vangt hij de echte fouten ook niet meer.
    #
    # Tellen op hoeveel pagina's een claim staat werkt niet als scheidslijn. Het
    # menu staat op 8.669 van de 67.726 pagina's — 13%, ruim onder elke drempel
    # die lokale cijfers buiten zou houden — terwijl "1 nieuwbouwproject" juist
    # op honderden gemeentepagina's terugkomt.
    #
    # Wat wél scheidt: variatie. Een lokaal cijfer verschilt per pagina, dus het
    # zelfstandig naamwoord komt met tientallen verschillende getallen voor. Een
    # sitebrede bewering staat overal met hetzelfde getal. Domineert één waarde
    # het beeld, dan is dat een claim over het geheel en toetsen we hem.
    per_woord = defaultdict(lambda: defaultdict(int))
    for (woord, getal, _o), urls in telbaar.items():
        per_woord[woord][getal] += len(urls)

    def is_sitebreed(woord, getal, aantal_paginas):
        totaal = sum(per_woord[woord].values())
        return aantal_paginas >= 20 and totaal and aantal_paginas / totaal >= 0.80

    bevindingen = []
    for (woord, getal, ondergrens), urls in telbaar.items():
        beweerd = int(getal.replace(".", ""))
        werkelijk = echt.get(woord)
        claim = f"{getal}{'+' if ondergrens else ''} {woord}"

        op_sleutel = sorted(urls & SLEUTELPAGINAS)
        if op_sleutel and not is_sitebreed(woord, getal, len(urls)):
            bevindingen.append({
                "soort": "telbaar", "claim": claim, "beweerd": beweerd,
                "werkelijk": werkelijk, "oordeel": "sleutelpagina",
                "uitleg": (f"Staat op {', '.join(op_sleutel)}."
                           + (f" Ter vergelijking: {werkelijk} in de data."
                              if werkelijk else " Geen databestand om tegen te toetsen.")),
                "paginas": len(urls), "voorbeelden": op_sleutel[:3],
            })
            continue

        if not is_sitebreed(woord, getal, len(urls)):
            varianten = len(per_woord[woord])
            bevindingen.append({
                "soort": "telbaar", "claim": claim, "beweerd": beweerd,
                "werkelijk": werkelijk, "oordeel": "lokaal",
                "uitleg": (f"'{woord}' komt op de site met {varianten} verschillende getallen "
                           f"voor, dus dit is een cijfer over deze pagina en niet over het "
                           f"geheel." + (f" Landelijk totaal: {werkelijk}." if werkelijk else "")),
                "paginas": len(urls), "voorbeelden": sorted(urls)[:3],
            })
            continue

        if woord not in ONBETWIST:
            oordeel = "geen bron"
            uitleg = ("Meerdere noemers mogelijk, dus niet automatisch te toetsen."
                      + (f" Ter vergelijking: {werkelijk} in de data." if werkelijk else ""))
        elif werkelijk is None:
            oordeel, uitleg = "geen bron", "Geen databestand dat dit kan natellen."
        elif ondergrens:
            oordeel = "klopt" if beweerd <= werkelijk else "wijkt af"
            uitleg = (f"Ondergrens: er zijn er {werkelijk}."
                      + ("" if beweerd <= werkelijk else " De ondergrens is te hoog."))
        elif beweerd == werkelijk:
            oordeel, uitleg = "klopt", f"Er zijn er {werkelijk}."
        else:
            oordeel = "wijkt af"
            uitleg = f"Beweerd {beweerd}, werkelijk {werkelijk} ({beweerd - werkelijk:+d})."
        bevindingen.append({
            "soort": "telbaar", "claim": claim, "beweerd": beweerd, "werkelijk": werkelijk,
            "oordeel": oordeel, "uitleg": uitleg, "paginas": len(urls),
            "voorbeelden": sorted(urls)[:3],
        })

    # Bedragen die per pagina verschillen ("gemiddeld €490.856" op één
    # bedrijfsprofiel) komen uit data en verouderen mee. Alleen een bedrag dat
    # overal hetzelfde is, is een met de hand ingetypte belofte.
    per_aanloop = defaultdict(int)
    for (aanloop, _b), urls in geld.items():
        per_aanloop[aanloop] += len(urls)
    for (aanloop, bedrag), urls in sorted(geld.items(), key=lambda kv: -len(kv[1])):
        aandeel = len(urls) / per_aanloop[aanloop]
        if len(urls) < 20 or aandeel < 0.80:
            continue
        bevindingen.append({
            "soort": "geld", "claim": f"{aanloop} {bedrag}", "oordeel": "handmatig",
            "uitleg": "Overal hetzelfde bedrag, dus met de hand ingetypt. Bedragen "
                      "verouderen stil — controleer bij de bron of dit nog klopt.",
            "paginas": len(urls), "voorbeelden": sorted(urls)[:3],
        })

    for term, urls in sorted(groot.items(), key=lambda kv: -len(kv[1])):
        bevindingen.append({
            "soort": "superlatief", "claim": term, "oordeel": "handmatig",
            "uitleg": "Niet na te tellen. Vaak idioom (\'de eerste grote tuinpost\') en dan "
                      "onschuldig; kijk of het een belofte over ons of over een merk is.",
            "paginas": len(urls), "voorbeelden": sorted(urls)[:3],
        })

    volgorde = {"wijkt af": 0, "sleutelpagina": 1, "geen bron": 2, "handmatig": 3,
                "lokaal": 4, "klopt": 5}
    bevindingen.sort(key=lambda b: (volgorde[b["oordeel"]], -b["paginas"]))

    os.makedirs(os.path.dirname(RAPPORT_JSON), exist_ok=True)
    with open(RAPPORT_JSON, "w", encoding="utf8") as f:
        json.dump({"paginas_gescand": paginas, "waarheden": echt,
                   "bevindingen": bevindingen}, f, ensure_ascii=False, indent=1)

    regels = [f"# Cijferaudit — {paginas:,} pagina's gescand".replace(",", "."), ""]
    for oordeel, kop in (("wijkt af", "Klopt niet"),
                         ("sleutelpagina", "Op een sleutelpagina — zelf nalopen"),
                         ("geen bron", "Geen bron om tegen te toetsen"),
                         ("handmatig", "Handmatig beoordelen"),
                         ("lokaal", "Waarschijnlijk een lokaal cijfer"), ("klopt", "Klopt")):
        blok = [b for b in bevindingen if b["oordeel"] == oordeel]
        if not blok:
            continue
        regels += [f"## {kop} ({len(blok)})", ""]
        for b in blok[:40]:
            regels.append(f"- **{b['claim']}** &mdash; {b['uitleg']} "
                          f"Staat op {b['paginas']} pagina's, bv. {b['voorbeelden'][0]}")
        regels.append("")
    with open(RAPPORT_MD, "w", encoding="utf8") as f:
        f.write("\n".join(regels) + "\n")

    fout = sum(1 for b in bevindingen if b["oordeel"] == "wijkt af")
    print(f"{paginas} pagina's gescand, {len(bevindingen)} beweringen gevonden.")
    print(f"  wijkt af: {fout}")
    for k in ("sleutelpagina", "geen bron", "handmatig", "lokaal", "klopt"):
        print(f"  {k}: {sum(1 for b in bevindingen if b['oordeel'] == k)}")
    print(f"Rapport: {os.path.relpath(RAPPORT_MD, REPO)}")
    return 1 if fout else 0


if __name__ == "__main__":
    sys.exit(main())
