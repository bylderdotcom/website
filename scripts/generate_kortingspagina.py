#!/usr/bin/env python3
"""Genereert de persoonlijke kortingspagina die een vakbedrijf via WhatsApp naar zijn klant stuurt.

Eén pagina per aangesloten vakbedrijf op /korting/<slug>/. De pagina draagt de naam van het
vakbedrijf, toont het werkelijke merkenaanbod uit data/deelnemers.json en heeft één actie:
een gratis account aanmaken. De koppeling klant -> vakbedrijf gebeurt via ?ref=<slug>.

Deze pagina's zijn NOINDEX en staan bewust niet in een sitemap: het zijn deellinks, geen
zoekpagina's. De WhatsApp-preview (og:title / og:description / og:image) is de eigenlijke pitch.

Draaien:  python3 scripts/generate_kortingspagina.py
"""

import html
import json
import pathlib
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEELNEMERS = ROOT / "data" / "deelnemers.json"
UITVOER = ROOT / "korting"
APP = "https://app.bylder.com"

# Ruwe categorie uit deelnemers.json -> tonen als. Volgorde bepaalt de volgorde op de pagina:
# eerst waar een vakman fysiek naast staat, daarna de rest.
CATEGORIEN = [
    ("Raamdecoratie", ["Raamdecoratie"]),
    ("Zonwering", ["Zonwering"]),
    ("Verlichting & smart home", ["Verlichting", "Smart home"]),
    ("Vloeren", ["PVC vloer", "Gietvloer", "Trapbekleding"]),
    ("Meubels & slaapkamer", ["Meubelen"]),
    ("Keuken", ["Kitchen"]),
    ("Badkamer & sanitair", ["Sanitair", "Wandtegels", "Vloertegels"]),
    ("Deuren & kasten", ["Deuren", "Kasten"]),
    ("Wanden", ["Behang", "Muurbekleding", "Stucwerk"]),
    ("Tuin & buiten", ["Tuin", "Tuinmeubelen", "Groen dak"]),
    ("Verhuizen & klussen", ["Verhuisbedrijf", "Verhuiskado", "Vakman", "Bouwmaterialen"]),
]

# Demo-bedrijven voor de preview. Bewust verzonnen namen: een echte bedrijfsnaam op een
# voorbeeldpagina suggereert deelname die er niet is.
DEMO = [
    {"slug": "jansen-schilderwerken", "naam": "Jansen Schilderwerken", "plaats": "Zwolle", "vak": "schilder"},
    {"slug": "van-dijk-elektrotechniek", "naam": "Van Dijk Elektrotechniek", "plaats": "Apeldoorn", "vak": "elektricien"},
    {"slug": "de-boer-installatie", "naam": "De Boer Installatietechniek", "plaats": "Haarlem", "vak": "loodgieter"},
]

VAKZIN = {
    "schilder": "Je schilder",
    "elektricien": "Je elektricien",
    "loodgieter": "Je installateur",
    "stukadoor": "Je stukadoor",
    "aannemer": "Je aannemer",
}


def laad_merken():
    ruw = json.loads(DEELNEMERS.read_text(encoding="utf-8"))["deelnemers"]
    per_cat = defaultdict(list)
    for d in ruw:
        per_cat[(d.get("cat") or "").strip()].append(d)
    groepen = []
    gezien = set()
    for label, ruwe_cats in CATEGORIEN:
        merken = []
        for rc in ruwe_cats:
            for d in per_cat.get(rc, []):
                merken.append(d)
                gezien.add(id(d))
        if merken:
            merken.sort(key=lambda d: (d.get("naam") or "").lower())
            groepen.append((label, merken))
    rest = [d for d in ruw if id(d) not in gezien]
    if rest:
        rest.sort(key=lambda d: (d.get("naam") or "").lower())
        groepen.append(("Overig", rest))
    return groepen, len(ruw)


def e(s):
    return html.escape(str(s or ""), quote=True)


def bouw(bedrijf, groepen, aantal):
    naam = bedrijf["naam"]
    slug = bedrijf["slug"]
    plaats = bedrijf.get("plaats") or ""
    vakzin = VAKZIN.get(bedrijf.get("vak"), "Je vakman")
    url = f"https://www.bylder.com/korting/{slug}/"
    reg = f"{APP}/register?ref={slug}&utm_source=vakbedrijf&utm_medium=whatsapp&utm_campaign=kortingslink"

    og_titel = f"Korting via {naam}"
    og_oms = (f"{naam} regelde korting bij {aantal} merken voor jouw woning — "
              f"van raamdecoratie tot vloeren. Gratis, geen abonnement.")

    cat_tegels = "".join(
        f'<a href="#m-{i}" class="ct"><span class="ct-n">{e(label)}</span>'
        f'<span class="ct-c">{len(merken)} merk{"en" if len(merken) != 1 else ""}</span></a>'
        for i, (label, merken) in enumerate(groepen)
    )

    blokken = []
    for i, (label, merken) in enumerate(groepen):
        rijen = "".join(
            f'<li><span class="m-n">{e(m.get("naam"))}</span>'
            f'<span class="m-a">{e(m.get("aanbod") or "Korting")}</span></li>'
            for m in merken
        )
        blokken.append(
            f'<section class="mg" id="m-{i}"><h3>{e(label)}</h3><ul class="ml">{rijen}</ul></section>'
        )
    merkenlijst = "".join(blokken)

    schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": og_titel,
        "description": og_oms,
        "url": url,
        "isPartOf": {"@type": "WebSite", "name": "Bylder.com", "url": "https://www.bylder.com/"},
        "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V.",
                      "url": "https://www.bylder.com/"},
    }, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{e(og_titel)} | Bylder</title>
<meta name="description" content="{e(og_oms)}">
<link rel="canonical" href="{e(url)}">
<meta name="robots" content="noindex,nofollow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bylder.com">
<meta property="og:title" content="{e(og_titel)}">
<meta property="og:description" content="{e(og_oms)}">
<meta property="og:url" content="{e(url)}">
<meta property="og:image" content="https://www.bylder.com/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<script type="application/ld+json">{schema}</script>
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',system-ui,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased;}}
h1,h2,h3{{letter-spacing:-0.02em;color:#1A1208;line-height:1.15;text-wrap:balance;}}
a{{color:#3D5A3E;}}
.wrap{{max-width:680px;margin:0 auto;padding:0 20px;}}
.top{{border-bottom:1px solid rgba(61,46,30,0.08);background:rgba(245,240,232,0.92);}}
.top .wrap{{display:flex;align-items:center;justify-content:space-between;padding-top:14px;padding-bottom:14px;}}
.logo{{display:flex;align-items:center;gap:9px;text-decoration:none;}}
.logo i{{width:28px;height:28px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;color:#F5F0E8;font-size:12px;font-style:normal;}}
.logo b{{font-weight:700;font-size:15px;color:#1A1208;}}
.logo b span{{color:#3D5A3E;font-weight:600;}}
.top small{{font-size:12px;color:rgba(61,46,30,0.5);}}
.badge{{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.22);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;}}
.hero{{padding:34px 0 6px;}}
.hero h1{{font-size:2rem;font-weight:800;margin:16px 0 12px;}}
.hero p.sub{{font-size:1.05rem;color:rgba(61,46,30,0.72);}}
.cta{{display:block;background:#B85C38;color:#F5F0E8;padding:17px 24px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;text-align:center;margin:24px 0 10px;}}
.cta:focus-visible{{outline:3px solid #1A1208;outline-offset:3px;}}
.cta-sub{{font-size:13px;color:rgba(61,46,30,0.55);text-align:center;margin-bottom:10px;}}
.rule{{height:1px;background:rgba(61,46,30,0.1);margin:32px 0;}}
h2{{font-size:1.35rem;font-weight:800;margin-bottom:6px;}}
.lead{{font-size:15px;color:rgba(61,46,30,0.65);margin-bottom:18px;}}
.cats{{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}}
.ct{{display:flex;flex-direction:column;gap:2px;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;padding:13px 15px;text-decoration:none;color:inherit;}}
.ct:hover{{border-color:rgba(61,90,62,0.45);}}
.ct-n{{font-weight:700;font-size:14.5px;color:#1A1208;line-height:1.3;}}
.ct-c{{font-family:'Space Mono',monospace;font-size:11.5px;color:rgba(61,46,30,0.5);}}
.steps{{display:flex;flex-direction:column;gap:18px;margin-top:8px;}}
.step{{display:flex;gap:14px;align-items:flex-start;}}
.step i{{flex:0 0 34px;height:34px;border-radius:9px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;font-size:14px;font-style:normal;}}
.step b{{display:block;font-size:15px;color:#1A1208;}}
.step span{{font-size:14px;color:rgba(61,46,30,0.66);line-height:1.6;}}
.mg{{margin-bottom:22px;scroll-margin-top:16px;}}
.mg h3{{font-size:15px;font-weight:800;margin-bottom:8px;}}
.ml{{list-style:none;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;overflow:hidden;}}
.ml li{{display:flex;justify-content:space-between;gap:14px;padding:11px 15px;border-top:1px solid rgba(61,46,30,0.07);font-size:14.5px;}}
.ml li:first-child{{border-top:0;}}
.m-n{{color:#1A1208;font-weight:600;}}
.m-a{{font-family:'Space Mono',monospace;font-size:13px;color:#3D5A3E;white-space:nowrap;font-weight:700;}}
.note{{background:#EBF0E8;border:1px solid rgba(61,90,62,0.28);border-radius:14px;padding:18px 20px;}}
.note b{{display:block;font-size:15.5px;color:#1A1208;margin-bottom:6px;}}
.note p{{font-size:14.5px;color:rgba(61,46,30,0.75);}}
footer{{background:#1A1208;margin-top:44px;padding:34px 0 40px;}}
footer .wrap{{color:rgba(245,240,232,0.45);font-size:12.5px;line-height:1.65;}}
footer a{{color:#8AAE8B;}}
footer .disc{{margin-top:14px;}}
@media(min-width:560px){{.hero h1{{font-size:2.4rem;}}.cats{{grid-template-columns:repeat(3,1fr);}}}}
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a class="logo" href="/"><i>B.</i><b>Bylder<span>.com</span></b></a>
  <small>Gratis voor bewoners</small>
</div></header>

<main>
<div class="wrap hero">
  <span class="badge">Geregeld door je vakman</span>
  <h1>{e(naam)} regelde korting voor jouw woning</h1>
  <p class="sub">{vakzin} werkt samen met Bylder. Daardoor krijg jij korting bij
  <strong>{aantal} merken en winkels</strong> — van raamdecoratie en vloeren tot je keuken en je bed.
  Je activeert het met een gratis account, en je zit nergens aan vast.</p>
  <a class="cta" href="{e(reg)}">Korting activeren &#8594;</a>
  <p class="cta-sub">Gratis account · geen abonnement · je kiest zelf waar je korting op wilt</p>
</div>

<div class="wrap">
  <div class="rule"></div>
  <h2>Waar je korting op krijgt</h2>
  <p class="lead">{aantal} aangesloten merken en winkels, verdeeld over {len(groepen)} categorieën.
  Tik een categorie om te zien wie erin zit.</p>
  <div class="cats">{cat_tegels}</div>

  <div class="rule"></div>
  <h2>Zo werkt het</h2>
  <p class="lead">Drie stappen, tien minuten.</p>
  <div class="steps">
    <div class="step"><i>1</i><span><b>Maak je gratis account</b>Je vult je woning in — nieuwbouw of bestaand, en wanneer je erin gaat.</span></div>
    <div class="step"><i>2</i><span><b>Kies waar je korting op wilt</b>Jij weet wat je nodig hebt. Wij zoeken de winkel of het merk erbij.</span></div>
    <div class="step"><i>3</i><span><b>Koop met korting</b>Je krijgt de kortingscode uit je Bylder-account en toont die bij de winkel.</span></div>
  </div>

  <div class="rule"></div>
  <h2>Alle merken op een rij</h2>
  <p class="lead">Kortingen verschillen per merk en gelden niet bovenop een lopende actie of sale.</p>
  {merkenlijst}

  <div class="note">
    <b>Wat kost dit jou?</b>
    <p>Niets. Je account is gratis en je zit nergens aan vast. {e(naam)} ontvangt van ons een
    vergoeding als je via Bylder iets koopt — dat verandert niets aan jouw prijs of aan de korting
    die je krijgt. Wij vinden dat je dat mag weten.</p>
  </div>

  <a class="cta" href="{e(reg)}">Korting activeren &#8594;</a>
  <p class="cta-sub">Aangeboden via {e(naam)}{f" &middot; {e(plaats)}" if plaats else ""}</p>
</div>
</main>

<footer><div class="wrap">
  <strong style="color:#F5F0E8;">Bylder.com</strong> — onafhankelijk platform voor nieuwbouw- en
  verbouwkopers. Vragen? <a href="mailto:info@bylder.com">info@bylder.com</a>
  <p class="disc">Kortingen worden aangeboden door de genoemde merken en winkels en kunnen wijzigen.
  Ze gelden niet in combinatie met een lopende actie of sale. Bylder is geen partij bij de koop.</p>
  <p class="disc" style="font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">
  &copy; 2026 Bylder Nederland B.V. — KvK 65020006</p>
</div></footer>
</body>
</html>
"""


def main():
    groepen, aantal = laad_merken()
    for bedrijf in DEMO:
        map_ = UITVOER / bedrijf["slug"]
        map_.mkdir(parents=True, exist_ok=True)
        (map_ / "index.html").write_text(bouw(bedrijf, groepen, aantal), encoding="utf-8")
        print(f"geschreven  korting/{bedrijf['slug']}/index.html")
    print(f"{aantal} merken over {len(groepen)} categorieën")


if __name__ == "__main__":
    main()
