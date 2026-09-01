#!/usr/bin/env python3
"""Bouwt per project een dossier: wat we weten, en vooral wat we níét weten.

WAAROM DIT BESTAAT
------------------
Trede 1 en 3 van de verrijking brachten de gegenereerde projectpagina's van 939
naar 1.419 woorden, met feiten uit onze eigen data. De handgeschreven pagina's
zitten op 1.677, en het verschil is precies het soort feit dat we níét hebben:
wat er eerder op deze plek stond, welke starterslening deze gemeente kent, wie de
ontwikkelaar is, wat er in het bestemmingsplan afwijkt.

Dat is opzoekwerk. Dit script maakt de opdracht daarvoor: per project een brief
met alles wat we al weten (zodat niemand dat opnieuw uitzoekt) en een expliciete
lijst van openstaande vragen met de bron waar het antwoord waarschijnlijk staat.

DE BRONPLICHT
-------------
Een antwoord telt pas als er een vindplaats bij staat. Dat is geen formaliteit:
"wat stond er eerder op deze plek" is precies de vraag waarbij een taalmodel iets
plausibels verzint als de bron ontbreekt, en één verzonnen feit op een
projectpagina kost meer dan de hele sectie oplevert. Vandaag stonden er nog drie
pagina's op de site met bedrijven die niet bestaan; dat was dezelfde fout in een
ander jasje.

Feiten worden daarom vastgelegd in data/clusters/nieuwbouw-project/
handwerk-feiten.json, en de generator toont alleen wat een bron én een
controledatum heeft. Wat geen bron heeft, komt niet op de pagina.

Gebruik:
    python3 scripts/projectdossier.py --top 10     # de tien met de eerste oplevering
    python3 scripts/projectdossier.py <slug> ...   # specifieke projecten
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLUSTER = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project")
FEITEN = os.path.join(CLUSTER, "handwerk-feiten.json")
RAPPORT = os.path.join(ROOT, "reports", "projectdossiers.md")

# De vragen die de handgeschreven pagina's beantwoorden en de gegenereerde niet.
# Per vraag staat erbij waar het antwoord doorgaans te vinden is, zodat het
# opzoekwerk niet elke keer opnieuw bedacht hoeft te worden.
OPEN_VRAGEN = [
    ("historie", "Wat stond er eerder op deze plek?",
     "Gemeentelijk archief, de projectsite ('over dit project'), lokale krant, "
     "topotijdreis.nl voor het kaartbeeld door de jaren heen."),
    ("starterslening", "Kent deze gemeente een starterslening of koopregeling?",
     "svn.nl (per gemeente doorzoekbaar) en de gemeentesite onder 'wonen'."),
    ("ontwikkelaar", "Wie ontwikkelt en wie bouwt dit project?",
     "De projectsite, meestal in de voettekst of onder 'contact'."),
    ("bestemming", "Wijkt er iets af in het bestemmingsplan of de welstand?",
     "omgevingswet-portaal (ruimtelijkeplannen.nl), gemeentelijke welstandsnota."),
    ("voorzieningen", "Wat komt er in de wijk aan school, winkels en openbaar vervoer?",
     "Gebiedsvisie of wijkplan op de gemeentesite; 9292 voor haltes."),
]

LEEG = {"waarde": "", "bron": "", "gecontroleerd_op": ""}


def slugify(naam, plaats):
    s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def laad():
    pages = json.load(open(os.path.join(CLUSTER, "pages.json"), encoding="utf8"))
    slugs = {p["slug"] for p in pages if p["slug"] not in ("index", "oplevermonitor")}
    projecten = json.load(open(os.path.join(ROOT, "data", "nieuwbouwprojecten.json"),
                               encoding="utf8"))["projecten"]
    gem = {g["slug"]: g for g in json.load(
        open(os.path.join(ROOT, "data", "gemeenten.json"), encoding="utf8"))["gemeenten"]}
    koppel = {}
    for p in projecten:
        s = slugify(p.get("naam") or "", p["plaats"])
        if s in slugs:
            koppel[s] = p
    return koppel, gem


def kies(koppel, args):
    n = 10
    overslaan = set()
    for i, a in enumerate(args):
        if a == "--top" and i + 1 < len(args):
            n = int(args[i + 1])
            overslaan.add(i + 1)          # het getal is geen slug
    expliciet = [a for i, a in enumerate(args)
                 if not a.startswith("-") and i not in overslaan]
    if expliciet:
        return [(s, koppel[s]) for s in expliciet if s in koppel]
    # Eerste oplevering eerst, dan de grootste: daar is de vraag het meest actueel
    # en het cohort het grootst.
    rijen = sorted(koppel.items(),
                   key=lambda kv: (str(kv[1].get("oplevering") or "9999"),
                                   -(kv[1].get("woningen") or 0)))
    return rijen[:n]


def main():
    koppel, gem = laad()
    gekozen = kies(koppel, sys.argv[1:])
    if not gekozen:
        sys.exit("Geen projecten gevonden. Draai zonder argumenten voor de top-10.")

    feiten = json.load(open(FEITEN, encoding="utf8")) if os.path.exists(FEITEN) else {}
    regels = ["# Projectdossiers", "",
              "Per project: wat we weten, en wat er nog opgezocht moet worden.",
              "Antwoorden horen in `data/clusters/nieuwbouw-project/handwerk-feiten.json`.",
              "**Een antwoord zonder bron komt niet op de pagina.**", ""]

    for slug, p in gekozen:
        g = gem.get(p["plaats"], {})
        f = feiten.get(slug, {})
        regels += [f"## {p.get('naam')} &mdash; {p['plaats']}", "",
                   f"`{slug}` &middot; {p.get('woningen') or '?'} woningen &middot; "
                   f"oplevering {p.get('oplevering') or 'onbekend'} "
                   f"({p.get('oplevering_bron') or 'geen bron'})", "",
                   "**Wat we al hebben** &mdash; niet opnieuw uitzoeken:", ""]
        regels.append(f"- Gemeente: gemiddelde woningprijs &euro;{g.get('prijs', '?')}, "
                      f"{g.get('prijs_vs_nl', '?')}% t.o.v. Nederland; "
                      f"{g.get('nieuwbouw_gem5', '?')} nieuwbouwwoningen per jaar; "
                      f"{g.get('vergund', '?')} vergunningen in de pijplijn")
        regels.append(f"- Bron van het project: {p.get('url', '?')}")
        regels += ["", "**Nog op te zoeken:**", ""]
        for sleutel, vraag, waar in OPEN_VRAGEN:
            huidig = f.get(sleutel) or {}
            if huidig.get("waarde") and huidig.get("bron"):
                regels.append(f"- [x] **{vraag}** &rarr; {huidig['waarde'][:90]} "
                              f"({huidig['bron']}, gecontroleerd {huidig.get('gecontroleerd_op', '?')})")
            else:
                regels.append(f"- [ ] **{vraag}**  \n      _waar te vinden:_ {waar}")
        regels.append("")

    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    open(RAPPORT, "w", encoding="utf8").write("\n".join(regels) + "\n")

    # Lege plekken klaarzetten zodat invullen alleen nog invullen is.
    nieuw = 0
    for slug, _ in gekozen:
        vak = feiten.setdefault(slug, {})
        for sleutel, _v, _w in OPEN_VRAGEN:
            if sleutel not in vak:
                vak[sleutel] = dict(LEEG)
                nieuw += 1
    json.dump(feiten, open(FEITEN, "w", encoding="utf8"), ensure_ascii=False, indent=1,
              sort_keys=True)
    open(FEITEN, "a").write("\n")

    ingevuld = sum(1 for v in feiten.values() for x in v.values()
                   if x.get("waarde") and x.get("bron"))
    totaal = sum(len(v) for v in feiten.values())
    print(f"{len(gekozen)} dossiers geschreven naar {os.path.relpath(RAPPORT, ROOT)}")
    print(f"{nieuw} lege velden toegevoegd aan {os.path.relpath(FEITEN, ROOT)}")
    print(f"{ingevuld} van de {totaal} velden heeft een waarde mét bron.")


if __name__ == "__main__":
    main()
