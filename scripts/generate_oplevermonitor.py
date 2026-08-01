#!/usr/bin/env python3
"""Bouwt de Nieuwbouw-oplevermonitor: /nieuwbouw-project/oplevermonitor/

Waarom deze pagina bestaat. Bylder heeft als enige een gestructureerd beeld van wat er
in Nederland aan nieuwbouw wordt opgeleverd, bekeken vanuit de kóper in plaats van de
verkoop. Dat is een citeerbaar feit, en het is het bewijsstuk onder de outreach: een
winkel die hoort dat er in zijn werkgebied duizenden woningen opgeleverd worden, luistert
anders dan een winkel die een vermelding aangeboden krijgt.

Eerlijkheid is hier de hele waarde. Daarom:
- we publiceren de ONDERGRENS ("minstens"), niet een geëxtrapoleerd totaal;
- bij elk cijfer staat van hoeveel projecten het aantal bekend is;
- de bron staat erbij, en we nemen geen aanbod over — alleen eigen bewerkingen.

Gebruik: python3 scripts/generate_oplevermonitor.py
"""
import json, os, sys, html, collections
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import nieuwbouw_scraper as ns

BRON = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
CLUSTER = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project")
SLUG = "oplevermonitor"
PAD = f"/nieuwbouw-project/{SLUG}/"
VANDAAG = date.today()
NL_MAAND = ("januari februari maart april mei juni juli augustus september oktober "
            "november december").split()


def nl_datum(d):
    return f"{d.day} {NL_MAAND[d.month - 1]} {d.year}"


def dz(n):
    return f"{n:,}".replace(",", ".")


def netjes(plaats):
    """gemeenteslug → leesbare naam."""
    vast = {"s-gravenhage": "Den Haag", "rijswijk-zh": "Rijswijk",
            "capelle-aan-den-ijssel": "Capelle aan den IJssel",
            "krimpen-aan-den-ijssel": "Krimpen aan den IJssel",
            "hendrik-ido-ambacht": "Hendrik-Ido-Ambacht",
            "leidschendam-voorburg": "Leidschendam-Voorburg",
            "pijnacker-nootdorp": "Pijnacker-Nootdorp",
            "s-hertogenbosch": "'s-Hertogenbosch", "nissewaard": "Nissewaard"}
    if plaats in vast:
        return vast[plaats]
    return " ".join(w.capitalize() if len(w) > 3 else w for w in plaats.split("-"))


def main():
    projecten = json.load(open(BRON, encoding="utf8"))["projecten"]
    verrijkt = [p for p in projecten if p.get("status")]
    metw = [p for p in verrijkt if p.get("woningen")]
    woningen = sum(p["woningen"] for p in metw)
    dekking = round(100 * len(metw) / max(1, len(verrijkt)))

    regio = ns.KERN | ns.RING
    reg = [p for p in verrijkt if p["plaats"] in regio]
    reg_w = [p for p in reg if p.get("woningen")]
    reg_won = sum(p["woningen"] for p in reg_w)

    # per gemeente, gesorteerd op bekend aantal woningen
    per = collections.defaultdict(lambda: {"n": 0, "w": 0, "wn": 0})
    for p in verrijkt:
        g = per[p["plaats"]]
        g["n"] += 1
        if p.get("woningen"):
            g["w"] += p["woningen"]; g["wn"] += 1
    top = sorted(per.items(), key=lambda kv: (-kv[1]["w"], -kv[1]["n"]))[:25]

    # per opleverjaar — alleen waar een hard oplevertrefwoord gevonden is
    jaren = collections.defaultdict(lambda: {"n": 0, "w": 0})
    for p in verrijkt:
        if p.get("oplevering") and p.get("oplevering_bron") == "oplevertrefwoord":
            j = jaren[p["oplevering"]]
            j["n"] += 1; j["w"] += p.get("woningen") or 0
    hard = sum(v["n"] for v in jaren.values())

    grootste = sorted(metw, key=lambda p: -p["woningen"])[:12]

    E = html.escape
    rows_g = "".join(
        f"<tr><td>{E(netjes(g))}</td><td>{v['n']}</td>"
        f"<td>{dz(v['w'])}</td><td>{v['wn']}/{v['n']}</td></tr>"
        for g, v in top)
    rows_j = "".join(
        f"<tr><td>{j}</td><td>{v['n']}</td><td>{dz(v['w'])}</td></tr>"
        for j, v in sorted(jaren.items()))
    rows_p = "".join(
        f"<tr><td>{E(p['naam'])}</td><td>{E(netjes(p['plaats']))}</td>"
        f"<td>{dz(p['woningen'])}</td></tr>" for p in grootste)

    body = f"""<main>
<nav aria-label="Kruimelpad" style="font-size:12.5px;color:rgba(61,46,30,0.72);margin-bottom:14px;">
<a href="/" style="color:inherit;">Bylder.com</a> &rsaquo; <a href="/nieuwbouw-project/" style="color:inherit;">Nieuwbouwprojecten</a> &rsaquo; Oplevermonitor</nav>

<h1>Nieuwbouw-oplevermonitor</h1>
<p class="badge">Stand van {nl_datum(VANDAAG)} &middot; samengesteld door Bylder</p>

<p>Hoeveel nieuwbouwwoningen staan er in Nederland in verkoop, en waar? Deze monitor
telt dat op vanuit het perspectief van de k&oacute;per: niet wat er te koop is, maar hoeveel
huishoudens er de komende jaren een sleutel krijgen &mdash; en dus keuzes moeten maken over
vloeren, keuken, sanitair en tuin.</p>

<div class="highlight">
<p><strong>In het kort:</strong> Bylder volgt <strong>{dz(len(verrijkt))} nieuwbouwprojecten</strong>
in Nederland. Van {dz(len(metw))} daarvan ({dekking}%) is het aantal woningen bekend; samen zijn dat
<strong>minstens {dz(woningen)} woningen</strong>. Het werkelijke aantal ligt hoger, omdat niet elk
project zijn omvang publiceert.</p>
</div>

<h2>Waarom &ldquo;minstens&rdquo;</h2>
<p>Van {100 - dekking}% van de projecten is het aantal woningen niet publiek. We tellen die als nul in
plaats van te schatten. Elk getal op deze pagina is dus een ondergrens, en de kolom
&ldquo;bekend&rdquo; laat zien op hoeveel projecten het cijfer rust. Wie liever een schatting heeft:
het gemiddelde project waarvan we het aantal w&eacute;l weten telt
{woningen // max(1, len(metw))} woningen.</p>

<h2>Per gemeente</h2>
<p>De 25 gemeenten met de meeste bekende woningen in verkoop.</p>
<table class="feit-tabel">
<thead><tr><th>Gemeente</th><th>Projecten</th><th>Woningen (minstens)</th><th>Bekend</th></tr></thead>
<tbody>{rows_g}</tbody></table>

<h2>Regio Rotterdam</h2>
<p>In de regio Rotterdam &mdash; Rotterdam, Den Haag, Zoetermeer, Leidschendam-Voorburg en de
omliggende gemeenten &mdash; staan <strong>{dz(len(reg))} projecten</strong> in verkoop, samen
minstens <strong>{dz(reg_won)} woningen</strong> (bekend voor {len(reg_w)} van de {len(reg)}).
Dat zijn evenzoveel huishoudens die binnen enkele jaren hun woning gaan inrichten.</p>

<h2>Verwachte oplevering</h2>
<p>Alleen projecten waarbij een opleverjaar expliciet genoemd wordt: {hard} van de {dz(len(verrijkt))}.
Bij de rest staat er geen datum, of alleen een kwartaalnotatie die net zo goed over de start van de
verkoop kan gaan &mdash; die tellen we niet mee.</p>
<table class="feit-tabel">
<thead><tr><th>Opleverjaar</th><th>Projecten</th><th>Woningen</th></tr></thead>
<tbody>{rows_j}</tbody></table>
<p style="font-size:13px;color:rgba(61,46,30,0.72);">Let op: een opleverdatum in nieuwbouw is zelden hard. De bouwtijd staat in de
koop-/aannemingsovereenkomst in <a href="/kennisbank/bouwtechniek/">werkbare werkdagen</a>, niet in
kalenderdagen &mdash; vorst, wind en regen schuiven de datum op. Je eigen koperscommunicatie is
altijd leidend.</p>

<h2>Grootste projecten</h2>
<table class="feit-tabel">
<thead><tr><th>Project</th><th>Gemeente</th><th>Woningen</th></tr></thead>
<tbody>{rows_p}</tbody></table>

<h2>Hoe we tellen</h2>
<ul>
<li>Peildatum {nl_datum(VANDAAG)}. Alleen projecten die op dat moment in verkoop staan.</li>
<li>Aantal woningen komt uit de eigen projectbeschrijving; is die er niet, dan telt het project als nul.</li>
<li>Opleverjaar alleen als het expliciet als oplevering genoemd wordt, niet uit losse jaartallen.</li>
<li>Bron van de projectgegevens: <a href="https://nieuwbouw.nl/" rel="nofollow noopener" target="_blank">nieuwbouw.nl</a>.
Bylder telt op en bewerkt; voor het aanbod zelf verwijzen we naar de bron.</li>
<li>Deze monitor wordt periodiek herzien. Projecten verdwijnen zodra ze uitverkocht zijn.</li>
</ul>

<div class="card" style="background:#3D5A3E;color:#F5F0E8;margin-top:32px;">
<h2>Staat jouw project erbij?</h2>
<p>Bylder helpt nieuwbouwkopers met wat er n&aacute; de handtekening komt: meerwerk, keuzes met
deadlines, oplevering en inrichten. Een account is gratis.</p>
<p><a class="cta-primary" href="https://app.bylder.com/registreer?utm_source=bylder-site&amp;utm_campaign=oplevermonitor">Maak een gratis account</a>
<a class="cta-primary" style="background:transparent;border:1px solid rgba(245,240,232,0.4);color:#F5F0E8;margin-left:8px;" href="/nieuwbouw-project/">Bekijk de projectpagina&rsquo;s</a></p>
</div>
</main>"""

    os.makedirs(os.path.join(CLUSTER, "content"), exist_ok=True)
    open(os.path.join(CLUSTER, "content", f"{SLUG}.html"), "w", encoding="utf8").write(body)

    titel = f"Nieuwbouw-oplevermonitor — {dz(len(verrijkt))} projecten, minstens {dz(woningen)} woningen | Bylder.com"
    desc = (f"Hoeveel nieuwbouwwoningen staan er in Nederland in verkoop? Bylder volgt "
            f"{dz(len(verrijkt))} projecten, samen minstens {dz(woningen)} woningen. Per gemeente, "
            f"per opleverjaar, met de telmethode erbij.")
    dataset = {
        "@context": "https://schema.org", "@type": "Dataset",
        "name": "Nieuwbouw-oplevermonitor Nederland",
        "description": desc,
        "url": f"https://www.bylder.com{PAD}",
        "dateModified": VANDAAG.isoformat(),
        "temporalCoverage": f"{VANDAAG.year}/..",
        "spatialCoverage": {"@type": "Country", "name": "Nederland"},
        "creator": {"@type": "Organization", "name": "Bylder Nederland B.V.",
                    "url": "https://www.bylder.com/"},
        "variableMeasured": [
            {"@type": "PropertyValue", "name": "Projecten in verkoop", "value": len(verrijkt)},
            {"@type": "PropertyValue", "name": "Woningen (ondergrens)", "value": woningen},
        ],
        "isBasedOn": "https://nieuwbouw.nl/",
        "license": "https://www.bylder.com/algemene-voorwaarden/",
    }
    brood = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Bylder.com", "item": "https://www.bylder.com/"},
        {"@type": "ListItem", "position": 2, "name": "Nieuwbouwprojecten",
         "item": "https://www.bylder.com/nieuwbouw-project/"},
        {"@type": "ListItem", "position": 3, "name": "Oplevermonitor",
         "item": f"https://www.bylder.com{PAD}"}]}

    pj = os.path.join(CLUSTER, "pages.json")
    pages = json.load(open(pj, encoding="utf8"))
    rij = {"slug": SLUG, "path": PAD, "title": titel, "description": desc,
           "og_type": "article", "robots": "index,follow",
           "ldjson": [json.dumps(dataset, ensure_ascii=False),
                      json.dumps(brood, ensure_ascii=False)],
           "content_kind": None}
    pages = [p for p in pages if p.get("slug") != SLUG]
    idx = next((i for i, p in enumerate(pages) if p.get("slug") == "index"), -1)
    pages.insert(idx + 1, rij)
    json.dump(pages, open(pj, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    open(pj, "a").write("\n")

    print(f"Oplevermonitor gebouwd: {len(verrijkt)} projecten, minstens {dz(woningen)} woningen "
          f"({dekking}% dekking) · regio Rotterdam {len(reg)} projecten / {dz(reg_won)} woningen")
    print(f"  content: data/clusters/nieuwbouw-project/content/{SLUG}.html")
    print(f"  pagina : {PAD}")


if __name__ == "__main__":
    main()
