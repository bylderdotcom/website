#!/usr/bin/env python3
"""Zet de bedrijfsprofielen terug in de index — nu op de plek die de site echt leest.

WAAROM DIT SCRIPT BESTAAT
-------------------------
Op 21 augustus draaide ik de noindex op 14.191 profielen terug en herschreef ik de
titels. Beide in generate_vakpillar.py, dat statische HTML in de repo-root schrijft.
Vier dagen later bleek productie nog steeds de oude versie te serveren.

De oorzaak zit in de bouw. Er bestaat een Next-route per vak
(web/app/<vak>/[[...slug]]) die de profielpagina's genereert uit
data/clusters/<vak>/pages.json. web/build.sh legt daarna de statische root eroverheen
met `cp -a -n` — en die -n betekent niet-overschrijven. De Next-uitvoer wint dus, en
de HTML uit generate_vakpillar.py wordt bij elke bouw weggegooid.

Voor deze acht clusters is pages.json de bron. generate_vakpillar.py is dat niet.

WAT DIT SCRIPT DOET
-------------------
Per cluster in data/clusters/<vak>/pages.json, alleen voor rijen met
content_kind == "bedrijf":

  robots      noindex,follow  →  index,follow, als het bedrijf een beoordeling
                                 heeft met minstens 5 reviews (de poort van vóór
                                 31 juli)
  title       "Naam — vak in Stad | reviews, prijzen & offerte-check | Bylder"
              (gemiddeld 95 tekens, 100% boven de afkapgrens van Google)
              →  "Naam · 5,0★ uit 35 reviews | Bylder"  (gemiddeld 53, 0% erboven)
  description  begint met het cijfer in plaats van met onze eigen diensten

De beoordeling komt uit data/clusters/<vak>/bedrijven.json, op dezelfde sleutel als
de slug van de pagina.

Gebruik:
    python3 scripts/profielen_index_herstel.py --droog
    python3 scripts/profielen_index_herstel.py
    python3 scripts/profielen_index_herstel.py --terug     # alles weer op noindex
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLUSTERS = ["loodgieter", "aannemer", "schilder", "elektricien",
            "stukadoor", "badkamer", "dakkapel", "gietvloer"]
MIN_REVIEWS = 5
MAX_TITEL = 60

DROOG = "--droog" in sys.argv or "--dry" in sys.argv
TERUG = "--terug" in sys.argv


def getal(x):
    """'5,0' of '4.7' of 35 → float, anders None."""
    if x is None:
        return None
    try:
        return float(str(x).replace(",", "."))
    except ValueError:
        return None


def maak_titel(naam, rating, reviews, vak, stad):
    """Het cijfer moet de afkapping overleven; dat is de hele reden voor de
    herschrijving. Bij een lange bedrijfsnaam korten we de naam in, niet het
    cijfer — liever zelf bepalen waar de titel breekt dan dat Google dat doet."""
    if rating and reviews:
        r = f"{rating:.1f}".replace(".", ",")
        n = int(reviews)
        staart = f" · {r}★ uit {n} review{'s' if n != 1 else ''} | Bylder"
    elif stad:
        staart = f" — {vak} in {stad} | Bylder"
    else:
        staart = f" — {vak} | Bylder"
    # Ook de terugvalvorm moet binnen de afkapgrens blijven; anders staat er
    # alsnog een titel die Google halverwege afsnijdt.
    ruimte = MAX_TITEL - len(staart)
    kort = naam if len(naam) <= ruimte else naam[:max(12, ruimte - 1)].rstrip(" ,-–—") + "…"
    return f"{kort}{staart}"


def maak_desc(naam, rating, reviews, vak, stad, oud):
    """Eerst het cijfer, dan wie het is. Wie een bedrijf bij naam zoekt wil weten
    of het deugt, niet wat ons platform kan."""
    kop = f"{rating:.1f}".replace(".", ",") + f"★ uit {int(reviews)} beoordelingen. " if (rating and reviews) else ""
    wie = f"{naam}, {vak}" + (f" in {stad}" if stad else "") + ". "
    staart = ("Contactgegevens, werkgebied en gebundelde beoordelingen op één plek — "
              "plus een gratis check of je offerte een eerlijke prijs heeft.")
    nieuw = kop + wie + staart
    return nieuw if len(nieuw) <= 320 else (kop + wie + staart)[:317] + "…"


def vak_woord(cluster, oude_titel):
    """Het vakwoord zoals het in de oude titel stond ('badkamerspecialist' hoort
    bij cluster 'badkamer'), zodat we niets verzinnen."""
    m = re.search(r"—\s*([a-zà-ÿ]+(?:specialist|bedrijf|zetter|dekker)?)\s+in\s", oude_titel or "")
    return m.group(1) if m else cluster


def main():
    tot = idx = titels = 0
    for c in CLUSTERS:
        pj = os.path.join(ROOT, "data", "clusters", c, "pages.json")
        bj = os.path.join(ROOT, "data", "clusters", c, "bedrijven.json")
        if not (os.path.exists(pj) and os.path.exists(bj)):
            print(f"  {c:<14} overgeslagen (bestanden ontbreken)")
            continue
        pages = json.load(open(pj, encoding="utf8"))
        bedr = json.load(open(bj, encoding="utf8"))

        n = ni = nt = 0
        for p in pages:
            if p.get("content_kind") != "bedrijf":
                continue
            n += 1
            b = bedr.get(p["slug"]) or {}
            rating = getal(b.get("rating_disp"))
            reviews = getal(b.get("reviews"))
            naam = b.get("name") or ""
            stad = b.get("city") or ""
            vak = vak_woord(c, p.get("title", ""))

            if TERUG:
                p["robots"] = "noindex,follow"
                continue

            mag = bool(rating) and (reviews or 0) >= MIN_REVIEWS
            if mag and "noindex" in (p.get("robots") or ""):
                p["robots"] = "index,follow"; ni += 1
            if naam:
                t = maak_titel(naam, rating, reviews, vak, stad)
                if t != p.get("title"):
                    p["title"] = t; nt += 1
                p["description"] = maak_desc(naam, rating, reviews, vak, stad, p.get("description"))

        tot += n; idx += ni; titels += nt
        staat = "TERUG naar noindex" if TERUG else f"{ni} naar index · {nt} titels"
        print(f"  {c:<14} {n:>6} profielen · {staat}")
        if not DROOG:
            json.dump(pages, open(pj, "w", encoding="utf8"), ensure_ascii=False, indent=1)
            open(pj, "a").write("\n")

    print(f"\n{'DROOGDRAAI — ' if DROOG else ''}{tot} profielen bekeken, "
          f"{idx} op index, {titels} titels herschreven.")
    if not DROOG:
        print("\nLET OP: verifieer ná de uitrol op de úitgeleverde pagina, niet op deze data.")
        print("Dat is precies waar het de vorige keer misging.")


if __name__ == "__main__":
    main()
