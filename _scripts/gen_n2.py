#!/usr/bin/env python3
import os, sys
sys.path.insert(0, '/Users/danielpaaij/Documents/GitHub/website')
exec(open('/Users/danielpaaij/Documents/GitHub/website/generate_op_maat.py').read())

# ── NIVEAU-2 DATA ──────────────────────────────────────────────────────────────
N2 = [
  {
    "slug": "keuken",
    "title": "Keuken op maat laten maken",
    "icon": "🍳",
    "label": "Keuken",
    "desc": "Een maatwerk keuken voor nieuwbouw past exact in de beschikbare ruimte en sluit aan op de aansluitpunten die de aannemer heeft aangelegd. Prijs, levertijd en de beste merken vind je hier.",
    "intro": "Een nieuwbouwkeuken op maat biedt maximale benutting van de ruimte en past precies bij de aansluitpunten voor water, gas en elektra. De gemiddelde prijs van een maatwerkkeuken ligt tussen €8.000 en €25.000, afhankelijk van materialen en apparatuur.",
    "price": "€8.000 – €25.000 incl. plaatsing en apparatuur",
    "leadtime": "8–14 weken na opmeting",
    "faqs": [
      ("Wanneer moet ik mijn keuken bestellen bij nieuwbouw?", "Bestel je keuken minimaal 6 maanden voor de geplande oplevering. Zo heb je ruimte voor opmeting, productie (6–10 weken) en planning van de montage direct na sleuteloverdracht."),
      ("Wat kost een keuken op maat?", "Een basiskeuken op maat kost €8.000–€12.000. Een middensegment keuken met kwalitatieve apparatuur ligt op €12.000–€18.000. Luxe maatwerk keukens kosten €18.000–€40.000+."),
      ("Kan ik de keuken al opmeten vóór oplevering?", "Ja. Met de definitieve bouwtekeningen (revisietekening) kan een keukenspecialist al op maat tekenen. De daadwerkelijke opmeting in de woning vindt dan vlak voor montage plaats als controle."),
    ],
    "products": [("Maatwerk keuken", "maatwerk-keuken"), ("Keukeneiland op maat", "keukeneiland-op-maat"), ("Keukenkasten op maat", "keukenkasten-op-maat")],
    "related": [("/kopen/keuken/", "Keukenproducten kopen"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen"), ("/op-maat/badkamer/", "Badkamer op maat")],
  },
  {
    "slug": "kasten-en-opbergen",
    "title": "Kasten & opbergen op maat",
    "icon": "🗄️",
    "label": "Kasten",
    "desc": "Inbouwkasten, inloopkasten, wandmeubels en schuifdeuren die precies in de maat van jouw nieuwbouwwoning worden gemaakt.",
    "intro": "Maatwerk kasten benutten elk centimeter van de beschikbare ruimte. In nieuwbouw zijn de maten zelden standaard — het plafond is hoog, de breedte afwijkend. Een inbouwkast op maat kost €800–€4.000 afhankelijk van de indeling.",
    "price": "€800 – €8.000 afhankelijk van type en grootte",
    "leadtime": "4–10 weken na opmeting",
    "faqs": [
      ("Wat kost een inbouwkast op maat?", "Een eenvoudige inbouwkast (deur + planken) kost €800–€1.800. Een kastenwand met schuifdeuren en ladeblokken ligt op €2.500–€6.000. Een volledige inloopkast kost €3.000–€12.000."),
      ("Inbouwkast zelf bouwen of laten maken?", "Zelf bouwen is goedkoper (materiaal €400–€800) maar tijdrovend. Een vakman levert een betere afwerking en garantie. Overweeg laten maken als het om een prominente ruimte gaat."),
      ("Welk materiaal is het beste voor kasten?", "MDF is het meest gebruikte materiaal: stabiel, goed te lakken. Multiplex is sterker voor zware belasting. Massief hout is duurder maar geeft meer uitstraling."),
    ],
    "products": [("Inbouwkast op maat", "inbouwkast-op-maat"), ("Inloopkast op maat", "inloopkast-op-maat"), ("Schuifdeuren op maat", "schuifdeuren-op-maat"), ("Wandmeubel op maat", "wandmeubel-op-maat"), ("Boekenkast op maat", "boekenkast-op-maat"), ("Tv-meubel op maat", "tv-meubel-op-maat")],
    "related": [("/op-maat/slaapkamer/", "Slaapkamer op maat"), ("/op-maat/woonkamer/", "Woonkamer op maat"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "slaapkamer",
    "title": "Slaapkamer op maat inrichten",
    "icon": "🛏️",
    "label": "Slaapkamer",
    "desc": "Inloopkasten, bedombouwen en hoofdborden speciaal gemaakt voor de afmetingen van jouw slaapkamer in nieuwbouw.",
    "intro": "In nieuwbouwslaapkamers zijn maten zelden standaard. Een maatwerk oplossing — of het nu een inloopkast, bedombouw of hoofdbord is — maakt de kamer af en benut elke centimeter ruimte.",
    "price": "€500 – €12.000 afhankelijk van type",
    "leadtime": "4–10 weken na opmeting",
    "faqs": [
      ("Wat kost een slaapkamer op maat?", "Dat hangt sterk af van wat je wilt. Een maatwerk hoofdbord kost €300–€1.200. Een bedombouw €800–€3.000. Een complete inloopkast €3.000–€10.000."),
      ("Wanneer plan ik de slaapkamerinrichting bij nieuwbouw?", "Begin 3–4 maanden voor oplevering met offertes aanvragen. De opmeting kan pas na sleuteloverdracht, maar het ontwerp kun je eerder uitwerken op basis van de tekeningen."),
      ("Is een kinderkamer op maat de moeite waard?", "Ja, zeker in kleinere kinderkamers. Maatwerk benutten de volledige hoogte (tot plafond) en biedt een slaaphoek, bureau en opbergruimte in één meubel."),
    ],
    "products": [("Inloopkast slaapkamer", "inloopkast-slaapkamer"), ("Bedombouw op maat", "bedombouw-op-maat"), ("Hoofdbord op maat", "hoofdbord-op-maat"), ("Kinderkamer op maat", "kinderkamer-op-maat")],
    "related": [("/op-maat/kasten-en-opbergen/", "Kasten op maat"), ("/op-maat/raamdecoratie/", "Raamdecoratie op maat"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "badkamer",
    "title": "Badkamer op maat laten maken",
    "icon": "🚿",
    "label": "Badkamer",
    "desc": "Badkamermeubels, wastafelbladen, spiegelkasten en douchecabines op exact maat voor jouw nieuwbouwbadkamer.",
    "intro": "De badkamer in nieuwbouw heeft doorgaans standaard aansluitpunten maar niet-standaard afmetingen. Een maatwerk badkamermeubel of wastafelblad zorgt voor een strakke afwerking zonder zichtbare gaten of sloddige voegen.",
    "price": "€600 – €6.000 afhankelijk van type",
    "leadtime": "4–8 weken na opmeting",
    "faqs": [
      ("Wat kost een badkamermeubel op maat?", "Een eenvoudig maatwerk onderkast kost €600–€1.500. Een complete badkamerwand met spiegelkast en verlichting ligt op €2.000–€5.000."),
      ("Moet ik ook het wastafelblad op maat laten maken?", "Ja, als de ruimte niet standaard is. Een composiet of natuursteen wastafelblad op maat kost €300–€1.200 en past exact op de onderbouw. Populaire materialen: Corian, keramiek, natuursteen."),
      ("Welke leverancier voor maatwerk badkamer?", "Zowel gespecialiseerde badkamerwinkels als lokale schrijnwerkers maken badkamermeubels op maat. Vergelijk minimaal 3 offertes en vraag naar garantie op vochtbestendigheid."),
    ],
    "products": [("Badkamermeubel op maat", "badkamermeubel-op-maat"), ("Wastafelblad op maat", "wastafelblad-op-maat"), ("Spiegelkast op maat", "spiegelkast-op-maat"), ("Douchecabine op maat", "douchecabine-op-maat"), ("Bad op maat", "bad-op-maat")],
    "related": [("/op-maat/keuken/", "Keuken op maat"), ("/kopen/sanitair/", "Sanitair kopen"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "woonkamer",
    "title": "Woonkamer op maat inrichten",
    "icon": "🛋️",
    "label": "Woonkamer",
    "desc": "Bankstellen, eettafels, bureaus en roomdividers die speciaal worden gemaakt voor de maten en sfeer van jouw woonkamer.",
    "intro": "Een woonkamer op maat meubilair geeft een coherente uitstraling die je met standaard meubels zelden bereikt. Van een eettafel in het exacte formaat tot een roomdivider die twee zones scheidt — maatwerk maakt het verschil.",
    "price": "€500 – €15.000 afhankelijk van type",
    "leadtime": "6–14 weken na opmeting",
    "faqs": [
      ("Wat kost een eettafel op maat?", "Een massief houten eettafel op maat kost €1.200–€4.000. Een metalen frame met keramisch blad liegt op €1.500–€5.000. De prijs hangt af van materiaal, grootte en maker."),
      ("Is een bank op maat duurder dan een design bank?", "Vergelijkbaar in prijs. Een maatwerk bank kost €2.000–€8.000. Je krijgt echter exact de breedte, diepte, kleur en stof die je wilt — en hij past perfect in de ruimte."),
      ("Wat is een roomdivider op maat?", "Een roomdivider is een vrijstaande of vaste wand die een kamer optisch verdeelt. Op maat gemaakt in MDF, staal of hout, prijs €800–€3.500."),
    ],
    "products": [("Bankstellen op maat", "bankstellen-op-maat"), ("Eettafel op maat", "eettafel-op-maat"), ("Bureau op maat", "bureau-op-maat"), ("Roomdivider op maat", "roomdivider-op-maat")],
    "related": [("/op-maat/kasten-en-opbergen/", "Kasten op maat"), ("/op-maat/verlichting/", "Verlichting op maat"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "trap-en-hal",
    "title": "Trap & hal op maat",
    "icon": "🪜",
    "label": "Trap & hal",
    "desc": "Trapombouwen, trapleuningen en garderobewanden die perfect passen bij de trap en hal van jouw nieuwbouwwoning.",
    "intro": "De trap en hal in nieuwbouw zijn standaard functioneel maar zelden mooi afgewerkt. Een trapombouw of garderobewand op maat verandert de entree in een visitekaartje van je woning.",
    "price": "€800 – €8.000 afhankelijk van type",
    "leadtime": "4–8 weken na opmeting",
    "faqs": [
      ("Wat kost een trapombouw?", "Een eenvoudige trapombouw (nieuwe treden en leuning) kost €2.000–€5.000. Een complete renovatie met nieuwe balusters en kwartslag kost €4.000–€10.000."),
      ("Kan ik de trap aanpassen in nieuwbouw?", "Na oplevering kun je de trap laten ombouwen. Let op: de constructie van de trap (de bomen en aantrede) wijzig je niet — alleen de afwerking: treden, stootborden en leuning."),
      ("Wat kost een garderobewand?", "Een maatwerk garderobewand in de hal kost €1.200–€4.000. Je combineert ophangruimte, schoenenkast en eventueel een spiegel in één geheel."),
    ],
    "products": [("Trapombouw op maat", "trapombouw-op-maat"), ("Trapleuning op maat", "trapleuning-op-maat"), ("Garderobewand op maat", "garderobewand-op-maat")],
    "related": [("/op-maat/kasten-en-opbergen/", "Kasten op maat"), ("/op-maat/verlichting/", "Verlichting op maat"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "raamdecoratie",
    "title": "Raamdecoratie op maat",
    "icon": "🪟",
    "label": "Raamdecoratie",
    "desc": "Gordijnen, shutters, jaloezieen en vouwgordijnen op exact maat voor de ramen van jouw nieuwbouwwoning.",
    "intro": "Nieuwbouwramen zijn zelden standaard formaat. Raamdecoratie op maat zorgt voor een perfecte pasvorm, optimale lichtregeling en betere isolatie. Bestellen kan al vóór oplevering op basis van de tekeningen.",
    "price": "€100 – €2.500 per raam afhankelijk van type",
    "leadtime": "2–6 weken na opmeting",
    "faqs": [
      ("Wat kosten gordijnen op maat?", "Gordijnen op maat kosten €150–€800 per raam inclusief stof en confectie. Een volledig verhang voor een woning kost gemiddeld €2.000–€6.000. Prijzen variëren sterk op basis van stof."),
      ("Wanneer bestel ik raamdecoratie voor nieuwbouw?", "Bestel minimaal 6–8 weken voor je gewenste plaatsingsdatum. De opmeting moet na sleuteloverdracht plaatsvinden — kozijnen hebben een garantietermijn en de exacte maten kunnen licht afwijken van tekening."),
      ("Shutters of gordijnen — wat is beter?", "Shutters bieden meer privacy en lichtcontrole, zijn duurzamer (15–25 jaar) en onderhoudsvriendelijk. Gordijnen zijn warmer en akoestisch beter. Prijs shutters: €300–€900 per raam; gordijnen: €150–€600 per raam."),
    ],
    "products": [("Gordijnen op maat", "gordijnen-op-maat"), ("Shutters op maat", "shutters-op-maat"), ("Jaloezieen op maat", "jaloezieen-op-maat"), ("Vouwgordijnen op maat", "vouwgordijnen-op-maat")],
    "related": [("/op-maat/verlichting/", "Verlichting op maat"), ("/kopen/", "Producten kopen"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "verlichting",
    "title": "Verlichting op maat voor nieuwbouw",
    "icon": "💡",
    "label": "Verlichting",
    "desc": "Lichtplannen, inbouwspots en hanglampen die speciaal worden ontworpen voor de indeling van jouw nieuwbouwwoning.",
    "intro": "Verlichting op maat begint bij een goed lichtplan — vóór de aanleg van elektra. Een lichtplan bepaalt waar spots komen, welke schakelgroepen je wilt en hoe je sfeer en functionaliteit combineert. Dit doe je idealiter al tijdens de bouwfase.",
    "price": "€500 – €5.000 voor volledig lichtplan en installatie",
    "leadtime": "Lichtplan: 1–2 weken; armaturen: 2–6 weken",
    "faqs": [
      ("Wanneer maak ik een lichtplan voor nieuwbouw?", "Tijdens de bouwfase, vóór het stucwerk. De elektricien legt dan precies de leidingen aan zoals het lichtplan aangeeft. Na het stucwerk extra punten bijplaatsen kost veel meer geld."),
      ("Wat kost een lichtplan?", "Een professioneel lichtplan kost €300–€800. Sommige verlichtingswinkels bieden gratis lichtplannen aan als je armaturen bij hen koopt. Doe-het-zelf met apps als Dialux is ook mogelijk."),
      ("Hoeveel inbouwspots per vierkante meter?", "Als vuistregel: 1 spot per 1,5–2 m². In een woonkamer van 30 m² heb je dus 15–20 spots nodig. Gebruik dimbare LED-spots (5–7W per spot) voor de beste sfeer."),
    ],
    "products": [("Lichtplan op maat", "lichtplan-op-maat"), ("Inbouwspots op maat", "inbouwspots-op-maat"), ("Hanglamp op maat", "hanglamp-op-maat")],
    "related": [("/op-maat/woonkamer/", "Woonkamer op maat"), ("/nieuwbouw-gids/fase-2-bouwfase/lichtplan-nieuwbouw/", "Lichtplan gids"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "tuin-en-buiten",
    "title": "Tuin & buiten op maat",
    "icon": "🌿",
    "label": "Tuin & buiten",
    "desc": "Overkappingen, tuinschuren, schuttingen en terrasmeubilair op maat voor de tuin van jouw nieuwbouwwoning.",
    "intro": "De tuin van een nieuwbouwwoning is een lege vlakte bij oplevering. Maatwerk buitenproducten — van een houten overkapping tot een composiet schutting — maken van die lege ruimte een verblijfsplek die aansluit bij de architectuur van de woning.",
    "price": "€500 – €20.000 afhankelijk van type",
    "leadtime": "4–12 weken na opmeting",
    "faqs": [
      ("Heb ik een vergunning nodig voor een overkapping?", "Overkappingen tot 2,5 m hoog en maximaal 30 m² zijn in de meeste gemeenten vergunningsvrij, mits niet meer dan 50% van het achtererf bebouwd wordt. Check altijd de regels bij jouw gemeente."),
      ("Wat kost een houten overkapping op maat?", "Een eenvoudige houten overkapping kost €2.500–€6.000 inclusief plaatsing. Een aluminium overkapping met glas of polycarbonaat ligt op €4.000–€12.000."),
      ("Wanneer leg ik de tuin aan bij nieuwbouw?", "De meeste kopers wachten 6–12 maanden na oplevering zodat de grond is gezakt. Bestrating en verharding kun je eerder plaatsen. Maatwerk tuinproducten bestel je het best 2–3 maanden na oplevering."),
    ],
    "products": [("Overkapping op maat", "overkapping-op-maat"), ("Tuinschuur op maat", "tuinschuur-op-maat"), ("Schutting op maat", "schutting-op-maat"), ("Terrasmeubilair op maat", "terrasmeubilair-op-maat"), ("Tuinverlichting op maat", "tuinverlichting-op-maat")],
    "related": [("/op-maat/techniek-en-energie/", "Techniek & energie"), ("/kopen/tuin/", "Tuinproducten kopen"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen")],
  },
  {
    "slug": "techniek-en-energie",
    "title": "Techniek & energie op maat",
    "icon": "⚡",
    "label": "Techniek",
    "desc": "Vloerverwarming, smart home systemen, zonnepanelen en laadpalen op maat voor jouw nieuwbouwwoning.",
    "intro": "Technische installaties in nieuwbouw zijn bij uitstek geschikt om op maat te laten uitvoeren. Vloerverwarming, smart home en zonnepanelen worden aangelegd terwijl de woning nog in aanbouw is — dat bespaart kosten ten opzichte van later aanpassen.",
    "price": "€800 – €15.000 afhankelijk van type",
    "leadtime": "Moet vaak tijdens bouwfase worden besteld",
    "faqs": [
      ("Kan ik vloerverwarming toevoegen bij nieuwbouw?", "Standaard nieuwbouw heeft al een cv-installatie die geschikt is voor lage-temperatuurverwarming. Vloerverwarming kun je als meerwerk bij de aannemer bestellen (€3.000–€8.000) of later laten installeren door een installateur."),
      ("Wat kost een smart home systeem?", "Een basisinstallatie met slimme thermostaat, verlichting en stopcontacten kost €1.500–€4.000. Een volledig geïntegreerd systeem (Fibaro, KNX) kost €5.000–€20.000+."),
      ("Hoeveel zonnepanelen passen op mijn nieuwbouwdak?", "Gemiddeld 10–16 panelen op een standaard rijtjeswoning. Met een vermogen van 400W per paneel levert dat 3.500–5.500 kWh per jaar. Kosten inclusief installatie: €6.000–€10.000; terugverdientijd 7–10 jaar."),
    ],
    "products": [("Vloerverwarming op maat", "vloerverwarming-op-maat"), ("Smart home op maat", "smart-home-op-maat"), ("Zonnepanelen op maat", "zonnepanelen-op-maat"), ("Laadpaal op maat", "laadpaal-op-maat")],
    "related": [("/op-maat/tuin-en-buiten/", "Tuin & buiten op maat"), ("/nieuwbouw-gids/", "Nieuwbouw gidsen"), ("/kopen/", "Producten kopen")],
  },
]

for cat in N2:
    slug = cat["slug"]
    prod_links = "".join([
        f'<a href="/op-maat/{slug}/{p[1]}/" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:10px;text-decoration:none;color:#1A1208;font-weight:600;font-size:14px;"><span>{p[0]}</span><span style="color:#3D5A3E;">→</span></a>'
        for p in cat["products"]
    ])
    related_links = "".join([f'<a href="{r[0]}" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">{r[1]}</a>' for r in cat["related"]])

    sidebar_nav = "".join([
        f'<a href="/op-maat/{slug}/{p[1]}/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">{p[0]}</a>'
        for p in cat["products"]
    ])

    bc_html = breadcrumb_html([("Bylder", "/"), ("Op maat", "/op-maat/"), (cat["label"], f"/op-maat/{slug}/")])
    bc_ld = breadcrumb_ld([("Bylder", "/"), ("Op maat", "/op-maat/"), (cat["label"], f"/op-maat/{slug}/")])
    faq_blocks = "".join([faq_block(q, a) for q, a in cat["faqs"]])
    faq_schema = faq_ld(cat["faqs"])

    html = f"""<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{cat["title"]} — prijzen, tips & leveranciers | Bylder</title>
<meta name="description" content="{cat["desc"][:155]}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.bylder.com/op-maat/{slug}/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Bylder">
<meta property="og:url" content="https://www.bylder.com/op-maat/{slug}/">
<meta property="og:title" content="{cat["title"]} | Bylder">
<meta property="og:description" content="{cat["desc"][:155]}">
<script type="application/ld+json">{faq_schema}</script>
<script type="application/ld+json">{bc_ld}</script>
{HEAD_COMMON}
</head><body>
{NAV}
<div style="padding-top:68px;"><div class="container" style="padding-top:10px;padding-bottom:10px;">{bc_html}</div></div>
<section style="padding:40px 0 52px;background:#fff;">
  <div class="container" style="max-width:800px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(61,46,30,0.08);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:#5C4433;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.08em;">Op maat · {cat["label"]}</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.15;margin-bottom:16px;">{cat["title"]}</h1>
    <p style="font-size:17px;color:rgba(61,46,30,0.65);line-height:1.8;margin-bottom:24px;">{cat["intro"]}</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
      <div style="background:rgba(61,46,30,0.06);border-radius:10px;padding:12px 16px;"><div style="font-size:11px;font-family:'Space Mono',monospace;color:rgba(61,46,30,0.4);text-transform:uppercase;margin-bottom:4px;">Prijs</div><div style="font-weight:700;color:#1A1208;font-size:14px;">{cat["price"]}</div></div>
      <div style="background:rgba(61,46,30,0.06);border-radius:10px;padding:12px 16px;"><div style="font-size:11px;font-family:'Space Mono',monospace;color:rgba(61,46,30,0.4);text-transform:uppercase;margin-bottom:4px;">Levertijd</div><div style="font-weight:700;color:#1A1208;font-size:14px;">{cat["leadtime"]}</div></div>
    </div>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;">
    <article>
      <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin-bottom:16px;">Productpagina's in deze categorie</h2>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:40px;">{prod_links}</div>
      <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin-bottom:16px;">Veelgestelde vragen</h2>
      {faq_blocks}
      <div style="margin-top:32px;">
        <h3 style="font-size:1rem;font-weight:700;color:#1A1208;margin-bottom:12px;">Verwant</h3>
        <div style="display:flex;flex-direction:column;gap:6px;">{related_links}</div>
      </div>
    </article>
    <aside class="sidebar" style="position:sticky;top:80px;">
      {SIDEBAR_CTA}
      <div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:18px;">
        <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.35);margin-bottom:10px;">In deze categorie</div>
        <div style="display:flex;flex-direction:column;gap:7px;">{sidebar_nav}
          <a href="/op-maat/" style="font-size:13px;color:#3D5A3E;font-weight:700;margin-top:4px;">← Alle categorieën</a>
        </div>
      </div>
    </aside>
  </div>
</section>
<div class="warm-divider"></div>
{CTA_SECTION}
{FOOTER}
<script src="/auping-popup.js"></script>
</body></html>"""

    write_page(f"{BASE}/{slug}/index.html", html)

print("Niveau-2 klaar.")
