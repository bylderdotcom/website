#!/usr/bin/env python3
"""Zet de projectcijfers uit de oplevermonitor op de regionale pagina's.

De monitor (/nieuwbouw-project/oplevermonitor/) is de motor; dit script maakt de
uitsnedes. Dezelfde data, drie lagen:

  provincie   nieuwbouw/<prov>/index.html                (12, statisch)
  gemeente    nieuwbouw/<prov>/<gemeente>/index.html     (370, statisch)
  gemeente    data/clusters/wonen-in/                    (342, Next)

Aanleiding (1 aug 2026): /nieuwbouw/noord-brabant/ noemde het woord "project"
67 keer, linkte naar nul projectpagina's en bevatte geen enkel projectcijfer.
Diezelfde 396 pagina's haalden samen 6 klikken in 90 dagen. De data lag er wel —
alleen niet op de pagina.

Injectie gebeurt vóór </main> tussen HTML-markers, zodat opnieuw draaien vervangt
in plaats van stapelt. Er wordt niets anders aan de pagina aangeraakt.

Gebruik: python3 scripts/generate_regio_cijfers.py [--dry]
"""
import json, os, re, sys, glob, html, collections
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRON = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
UIT = os.path.join(ROOT, "data", "regio-cijfers.json")
DRY = "--dry" in sys.argv

START, EIND = "<!--bylder:regiocijfers-->", "<!--/bylder:regiocijfers-->"
BLOK = re.compile(re.escape(START) + r".*?" + re.escape(EIND), re.S)
NL_MAAND = ("januari februari maart april mei juni juli augustus september oktober "
            "november december").split()
VANDAAG = date.today()


def dz(n):
    return f"{n:,}".replace(",", ".")


def netjes(s):
    vast = {"s-gravenhage": "Den Haag", "rijswijk-zh": "Rijswijk", "beek-l": "Beek",
            "hengelo-o": "Hengelo", "laren-nh": "Laren", "middelburg-z": "Middelburg",
            "s-hertogenbosch": "'s-Hertogenbosch", "noord-brabant": "Noord-Brabant",
            "noord-holland": "Noord-Holland", "zuid-holland": "Zuid-Holland"}
    if s in vast:
        return vast[s]
    return " ".join(w.capitalize() if len(w) > 3 else w for w in s.split("-"))


def projectpaden():
    """Slugs waarvoor al een echte projectpagina bestaat."""
    p = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project", "pages.json")
    return {x["slug"] for x in json.load(open(p, encoding="utf8"))
            if x.get("slug") not in ("index", "oplevermonitor")}


def blok_html(naam, projecten, paden, niveau):
    """Het injectieblok. Compact: cijfer, tabel, verwijzing naar de monitor."""
    metw = [p for p in projecten if p.get("woningen")]
    won = sum(p["woningen"] for p in metw)
    E = html.escape
    if not projecten:
        return ""

    top = sorted(projecten, key=lambda p: -(p.get("woningen") or 0))[:10]
    rijen = []
    for p in top:
        naam_p = E(p["naam"])
        slug = re.sub(r"[^a-z0-9]+", "-", p["naam"].lower()).strip("-") + "-" + p["plaats"]
        if slug in paden:
            naam_p = f'<a href="/nieuwbouw-project/{slug}/">{naam_p}</a>'
        w = dz(p["woningen"]) if p.get("woningen") else "&mdash;"
        pl = "" if niveau == "gemeente" else f"<td>{E(netjes(p['plaats']))}</td>"
        rijen.append(f"<tr><td>{naam_p}</td>{pl}<td style='text-align:right;'>{w}</td></tr>")

    kop_pl = "" if niveau == "gemeente" else "<th>Gemeente</th>"
    zin = (f"In {E(netjes(naam))} staan op dit moment <strong>{dz(len(projecten))} "
           f"nieuwbouwproject{'en' if len(projecten) != 1 else ''}</strong> in verkoop")
    if metw:
        zin += (f", samen minstens <strong>{dz(won)} woningen</strong> "
                f"(aantal bekend voor {len(metw)} van de {len(projecten)})")
    zin += "."

    return f"""{START}
<section style="margin-top:40px;padding-top:26px;border-top:1px solid rgba(61,46,30,0.1);">
<h2 style="font-size:1.25rem;font-weight:800;color:#1A1208;margin:0 0 8px;">Nieuwbouwprojecten in {E(netjes(naam))}</h2>
<p style="font-size:15px;color:rgba(61,46,30,0.75);line-height:1.75;margin:0 0 14px;">{zin}
Die woningen worden de komende jaren opgeleverd &mdash; evenzoveel huishoudens die keuzes maken
over vloeren, keuken, sanitair en tuin.</p>
<div style="overflow-x:auto;">
<table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;overflow:hidden;">
<thead><tr style="background:rgba(61,46,30,0.04);"><th style="text-align:left;padding:9px 12px;">Project</th>{kop_pl}<th style="text-align:right;padding:9px 12px;">Woningen</th></tr></thead>
<tbody>{''.join(rijen)}</tbody></table></div>
<p style="font-size:13px;color:rgba(61,46,30,0.72);margin:12px 0 0;">
Stand van {VANDAAG.day} {NL_MAAND[VANDAAG.month-1]} {VANDAAG.year}. Aantallen uit de eigen
projectbeschrijving; waar die ontbreekt telt het project als nul, dus dit is een ondergrens.
Volledige telling in de <a href="/nieuwbouw-project/oplevermonitor/">nieuwbouw-oplevermonitor</a>.</p>
</section>
{EIND}"""


def injecteer(pad, blok):
    if not blok:
        return False
    s = open(pad, encoding="utf8").read()
    if BLOK.search(s):
        n = BLOK.sub(blok, s)
    elif "</main>" in s:
        n = s.replace("</main>", blok + "</main>", 1)
    else:
        # Cluster-fragmenten (wonen-in, kopen, project) leveren de <main> zonder
        # sluittag — de wrapper zet die eromheen. Dan achteraan toevoegen.
        n = s.rstrip() + "\n" + blok + "\n"
    if n == s:
        return False
    if not DRY:
        open(pad, "w", encoding="utf8").write(n)
    return True


def main():
    projecten = [p for p in json.load(open(BRON, encoding="utf8"))["projecten"] if p.get("status")]
    per_plaats = collections.defaultdict(list)
    for p in projecten:
        per_plaats[p["plaats"]].append(p)
    paden = projectpaden()

    # provincie → gemeenten, uit de mapstructuur
    prov_gem = collections.defaultdict(list)
    for d in sorted(glob.glob(os.path.join(ROOT, "nieuwbouw", "*", "*", ""))):
        deel = d.rstrip("/").split(os.sep)
        prov_gem[deel[-2]].append(deel[-1])

    cijfers, gem_ok, prov_ok, wi_ok = {}, 0, 0, 0

    # 1) provinciepagina's
    for prov, gemeenten in prov_gem.items():
        proj = [p for g in gemeenten for p in per_plaats.get(g, [])]
        metw = [p for p in proj if p.get("woningen")]
        cijfers[prov] = {"niveau": "provincie", "projecten": len(proj),
                         "woningen": sum(p["woningen"] for p in metw), "bekend": len(metw)}
        pad = os.path.join(ROOT, "nieuwbouw", prov, "index.html")
        if os.path.exists(pad) and injecteer(pad, blok_html(prov, proj, paden, "provincie")):
            prov_ok += 1

    # 2) gemeentepagina's onder nieuwbouw/
    for prov, gemeenten in prov_gem.items():
        for g in gemeenten:
            proj = per_plaats.get(g, [])
            if not proj:
                continue
            metw = [p for p in proj if p.get("woningen")]
            cijfers[g] = {"niveau": "gemeente", "provincie": prov, "projecten": len(proj),
                          "woningen": sum(p["woningen"] for p in metw), "bekend": len(metw)}
            pad = os.path.join(ROOT, "nieuwbouw", prov, g, "index.html")
            if os.path.exists(pad) and injecteer(pad, blok_html(g, proj, paden, "gemeente")):
                gem_ok += 1

    # 3) wonen-in (Next-cluster: content-fragment per gemeente)
    wi = os.path.join(ROOT, "data", "clusters", "wonen-in", "content")
    for f in sorted(glob.glob(os.path.join(wi, "*.html"))):
        slug = os.path.basename(f)[:-5]
        proj = per_plaats.get(slug, [])
        if proj and injecteer(f, blok_html(slug, proj, paden, "gemeente")):
            wi_ok += 1

    if not DRY:
        json.dump({"gemeten_op": VANDAAG.isoformat(), "regios": cijfers},
                  open(UIT, "w", encoding="utf8"), ensure_ascii=False, indent=1)

    print(f"{'DROOGDRAAI — ' if DRY else ''}blok geplaatst op:")
    print(f"  {prov_ok:>4} provinciepagina's")
    print(f"  {gem_ok:>4} gemeentepagina's (nieuwbouw/)")
    print(f"  {wi_ok:>4} wonen-in-pagina's")
    print(f"  {len(projecten)} projecten verdeeld over {len(per_plaats)} plaatsen")
    if not DRY:
        print(f"  cijfers weggeschreven naar data/regio-cijfers.json")


if __name__ == "__main__":
    main()
