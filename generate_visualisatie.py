#!/usr/bin/env python3
"""
Content-hub rond de 3D-sfeerimpressie-tool (plattegrond → 3D-impressie in een stijl).
Genereert een pillar-hub + 6 stijl-spokes, volledig geoptimaliseerd (SEO/GEO/AEO/
schema/CRO/a11y/CWV). Funnel: gratis account → €99-lid ontgrendelt de tool.

Output: /3d-sfeerimpressie/index.html, /3d-sfeerimpressie/<stijl>/index.html,
        3d-sfeerimpressie-sitemap.xml

Gebruik: python3 generate_visualisatie.py
"""
import os, html, json

BASE = "https://www.bylder.com"
HUB = "/3d-sfeerimpressie"
SIGNUP = "https://app.bylder.com/registreer"
ROOT = os.path.dirname(os.path.abspath(__file__))

# ── De 6 stijlen (1-op-1 met app/src/lib/renderStyles.ts) ────────────────────
STYLES = [
    {
        "key": "scandinavisch", "label": "Scandinavisch",
        "tagline": "Licht, luchtig en natuurlijk",
        "palette": ["#F4EFE7", "#D8C3A5", "#A9B7A0", "#2E2A24"],
        "materialen": "licht eikenhout, witte wanden, natuurlijk linnen en wol",
        "kleuren": "warm wit, zachte houttinten en gedempt saliegroen",
        "sfeer": "minimalistisch, luchtig en gevuld met zacht daglicht",
        "intro": "De Scandinavische stijl draait om rust, licht en functioneel comfort. Lichte houtsoorten, witte wanden en natuurlijke textiel maken elke ruimte luchtig en tijdloos — ideaal voor wie een kalme, opgeruimde nieuwbouwwoning voor ogen heeft.",
        "ruimtes": {
            "Woonkamer": "een lichte eiken vloer, een neutrale bank met linnen kussens en veel daglicht via grote raampartijen.",
            "Keuken": "matwitte fronten zonder grepen, houten accenten en een rustige, opgeruimde uitstraling.",
            "Slaapkamer": "zachte aardetinten, natuurlijk linnen beddengoed en warme, indirecte verlichting.",
        },
    },
    {
        "key": "japandi", "label": "Japandi",
        "tagline": "Warm minimalisme met rust",
        "palette": ["#EDE6DA", "#C9A88B", "#8A7B6B", "#3B342B"],
        "materialen": "natuurlijk hout, keramiek, papier en handgemaakte textiel",
        "kleuren": "gedempte aardetinten, taupe en zachte zwart-accenten",
        "sfeer": "kalm, serene en bewust minimalistisch met lage meubels",
        "intro": "Japandi versmelt Japanse soberheid met Scandinavische warmte. Lage, eerlijke meubels, natuurlijke materialen en gedempte tinten geven een diepe rust — perfect voor wie een woning wil die voelt als een adempauze.",
        "ruimtes": {
            "Woonkamer": "lage houten meubels, een neutrale vloerlamp en een bewust lege, rustige vloer.",
            "Keuken": "natuurlijke houtnerven, mat keramiek en een opgeruimd aanrecht zonder visuele ruis.",
            "Slaapkamer": "een lage bedstee, aardetinten en zacht filterend daglicht.",
        },
    },
    {
        "key": "industrieel", "label": "Industrieel",
        "tagline": "Stoer met warme accenten",
        "palette": ["#CDC4BA", "#8A8178", "#B5653F", "#2A2723"],
        "materialen": "zichtbaar metselwerk, zwart staal, beton en warm hout",
        "kleuren": "betongrijs, baksteenrood, mat zwart en warme houttinten",
        "sfeer": "stoer en ruimtelijk, verzacht door hout en warme verlichting",
        "intro": "De industriële stijl combineert robuuste materialen met warmte. Stalen kozijnen, een betonlook-vloer en zichtbaar metselwerk krijgen karakter door houtaccenten en sfeervolle verlichting — krachtig zonder kil te worden.",
        "ruimtes": {
            "Woonkamer": "zwartstalen taatsdeuren, een betonlook-vloer en een leren bank met houten elementen.",
            "Keuken": "een mat-zwart keukenblok, open stellingen van staal en hout, en een stoer werkblad.",
            "Slaapkamer": "een bakstenen accentwand, warm hout en gedempte verlichting voor balans.",
        },
    },
    {
        "key": "modern-warm", "label": "Modern warm",
        "tagline": "Zacht, rond en sfeervol",
        "palette": ["#EFE7DC", "#D9B98C", "#B98A5E", "#2E261F"],
        "materialen": "zachte stoffen, gebogen meubels en messing accenten",
        "kleuren": "zachte neutralen, warm zand en subtiel messing",
        "sfeer": "knus en eigentijds met warme sfeerverlichting",
        "intro": "Modern warm verzacht het strakke moderne interieur met ronde vormen, warme neutralen en messing details. Het resultaat voelt eigentijds én uitnodigend — een woning die er gelikt uitziet maar waar je je meteen thuis voelt.",
        "ruimtes": {
            "Woonkamer": "een gebogen bank in een warme zandtint, messing verlichting en zachte texturen.",
            "Keuken": "warme greeploze fronten, een natuursteen-look blad en subtiele messing details.",
            "Slaapkamer": "een gestoffeerd hoofdbord, gelaagde verlichting en rustige neutrale tinten.",
        },
    },
    {
        "key": "klassiek", "label": "Klassiek",
        "tagline": "Tijdloos en verfijnd",
        "palette": ["#ECE4D6", "#C2B79C", "#6E6453", "#2B2823"],
        "materialen": "paneelwanden, verfijnd meubilair en edele stoffen",
        "kleuren": "warm crème, salie, taupe en gedempt goud",
        "sfeer": "elegant, symmetrisch en warm verlicht",
        "intro": "De klassieke stijl staat voor tijdloze elegantie: paneelwanden, verfijnde meubels en warme sfeerverlichting. Een interieur dat nooit gedateerd raakt en je woning een gevoel van blijvende kwaliteit geeft.",
        "ruimtes": {
            "Woonkamer": "paneelwanden, een statige bank en symmetrisch geplaatste verlichting.",
            "Keuken": "een keuken met kaderfronten, een klassiek werkblad en warme accenten.",
            "Slaapkamer": "rustige crèmetinten, verfijnde textiel en een tijdloze indeling.",
        },
    },
    {
        "key": "botanisch", "label": "Botanisch",
        "tagline": "Groen, fris en organisch",
        "palette": ["#E9E9DC", "#9FB089", "#5E7A4F", "#2C3327"],
        "materialen": "rotan en riet, veel planten en organische texturen",
        "kleuren": "frisse groenen, natuurlijk wit en warme natuurtinten",
        "sfeer": "fris en levendig met veel natuurlijk licht",
        "intro": "De botanische stijl brengt de natuur naar binnen: weelderige planten, rotan en riet en frisse groenen maken je woning levendig en ontspannen. Ideaal voor wie energie en buitengevoel in huis wil halen.",
        "ruimtes": {
            "Woonkamer": "een groene accentwand, rotan meubels en groepen planten bij het raam.",
            "Keuken": "frisse groene fronten, natuurlijke materialen en kruiden op het aanrecht.",
            "Slaapkamer": "zachte groenen, natuurlijk licht en rustgevende, organische texturen.",
        },
    },
]
STYLE_BY_KEY = {s["key"]: s for s in STYLES}

# ── Chrome ───────────────────────────────────────────────────────────────────
def head(title, desc, canonical, schema_blocks):
    schema = "\n".join(
        f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>'
        for b in schema_blocks
    )
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canonical}">
<meta name="robots" content="index,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
{schema}
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.7;}}
h1,h2,h3{{letter-spacing:-0.02em;color:#1A1208;}}
a{{color:#3D5A3E;}}
.container{{max-width:1280px;margin:0 auto;padding:0 48px;}}
.badge{{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}}
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}}
.grid-2{{display:grid;grid-template-columns:1fr 1fr;gap:16px;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:10px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:20px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.swatches{{display:flex;gap:0;border-radius:10px;overflow:hidden;height:64px;margin-bottom:16px;border:1px solid rgba(61,46,30,0.1);}}
.swatches span{{flex:1;}}
.style-tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:18px;transition:border-color .15s;}}
.style-tile:hover{{border-color:rgba(61,90,62,0.4);}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-2,.grid-3{{grid-template-columns:1fr;}}.hero-grid{{grid-template-columns:1fr!important;gap:32px!important;}}aside{{position:static!important;}}}}
</style>
</head>
<body><nav style="background:rgba(245,240,232,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;padding:16px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:24px;">
      <a href="/functies/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Functies</a>
      <a href="/nieuwbouw-tools/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Tools</a>
      <a href="/#vouchers" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Vouchers</a>
      <a href="{SIGNUP}" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
    </div>
  </div>
</nav>"""

FOOTER = """<footer style="background:#1A1208;padding:64px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;flex-wrap:wrap;gap:48px;justify-content:space-between;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
        <span style="font-weight:700;font-size:17px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
      </div>
      <p style="font-size:13px;color:rgba(245,240,232,0.4);max-width:240px;line-height:1.6;">AI-gestuurd platform voor kopers van een nieuwbouw- of verbouwwoning.</p>
    </div>
    <div>
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.25);margin-bottom:16px;">3D-sfeerimpressie</p>
      <div style="display:flex;flex-direction:column;gap:8px;">__FOOTER_LINKS__</div>
    </div>
  </div>
  <div style="max-width:1280px;margin:32px auto 0;padding:24px 48px 0;border-top:1px solid rgba(245,240,232,0.08);">
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer><script src="/auping-popup.js"></script>
</body></html>"""

def footer():
    links = "".join(
        f'<a href="{HUB}/{s["key"]}/" style="font-size:14px;color:rgba(245,240,232,0.45);text-decoration:none;">{s["label"]}</a>'
        for s in STYLES
    )
    links = f'<a href="{HUB}/" style="font-size:14px;color:rgba(245,240,232,0.45);text-decoration:none;">Overzicht</a>' + links
    return FOOTER.replace("__FOOTER_LINKS__", links)

def swatches(palette):
    return '<div class="swatches" aria-hidden="true">' + "".join(f'<span style="background:{c};"></span>' for c in palette) + "</div>"

def cta_block():
    return f"""<div style="background:#3D5A3E;border-radius:20px;padding:48px;text-align:center;margin:48px 0;">
  <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">Gratis account · €99 ontgrendelt de tool</p>
  <h2 style="font-size:1.8rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Zie je nieuwe woning vóór je een euro uitgeeft</h2>
  <p style="color:rgba(245,240,232,0.7);margin-bottom:28px;max-width:520px;margin-left:auto;margin-right:auto;font-size:15px;">Maak gratis een account aan en upload je plattegrond. Met Bylder-lidmaatschap (eenmalig €99) genereer je tot {10} 3D-sfeerimpressies per maand in elke stijl — en activeer je kortingen bij 40+ woonmerken.</p>
  <a href="{SIGNUP}" class="cta-primary">Start gratis →</a>
</div>"""

def faq_schema(qa):
    return {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in qa
        ],
    }

def breadcrumb(items):
    return {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
            for i, (n, u) in enumerate(items)
        ],
    }

def faq_html(qa):
    items = "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{html.escape(a)}</p></div>' for q, a in qa)
    return f'<h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Veelgestelde vragen</h2>{items}'

# ── Hub ──────────────────────────────────────────────────────────────────────
def build_hub():
    title = "3D-sfeerimpressie maken van je plattegrond | Bylder.com"
    desc = "Upload je plattegrond en zie je nieuwe woning in 3D, in 6 interieurstijlen. Zo kies je vol vertrouwen je afwerking en inrichting — vóór je duizenden euro's uitgeeft."
    canonical = f"{BASE}{HUB}/"

    howto = {
        "@context": "https://schema.org", "@type": "HowTo",
        "name": "Een 3D-sfeerimpressie van je plattegrond maken",
        "step": [
            {"@type": "HowToStep", "name": "Upload je plattegrond", "text": "Upload je bouwtekening of plattegrond (PDF of afbeelding) in je Bylder-dashboard."},
            {"@type": "HowToStep", "name": "Kies een stijl", "text": "Kies uit zes interieurstijlen: Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch."},
            {"@type": "HowToStep", "name": "Genereer de impressie", "text": "Bylder's AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte in de gekozen stijl."},
            {"@type": "HowToStep", "name": "Vergelijk en beslis", "text": "Vergelijk stijlen, deel ze en gebruik ze om je afwerking, inrichting en meerwerk te kiezen."},
        ],
    }
    software = {
        "@context": "https://schema.org", "@type": "SoftwareApplication",
        "name": "Bylder 3D-sfeerimpressie", "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "offers": {"@type": "Offer", "price": "99", "priceCurrency": "EUR", "description": "Eenmalig Bylder-lidmaatschap"},
        "description": desc,
    }
    qa = [
        ("Wat is een 3D-sfeerimpressie?", "Een 3D-sfeerimpressie is een realistische weergave van hoe een ruimte eruit kan zien, gegenereerd uit je plattegrond. Het laat materialen, kleuren en sfeer zien, zodat je je nieuwe woning kunt ervaren vóór de afwerking en inrichting vaststaan."),
        ("Hoe maakt Bylder de impressie?", "Je uploadt je plattegrond of bouwtekening in je Bylder-dashboard en kiest een van de zes interieurstijlen. De AI genereert binnen enkele minuten een sfeerimpressie van je ruimte in die stijl."),
        ("Is het gratis?", "Een account aanmaken en je plattegrond uploaden is gratis. Het genereren van 3D-sfeerimpressies zit in het Bylder-lidmaatschap (eenmalig €99), waarmee je tot tien impressies per maand maakt en kortingen bij 40+ woonmerken activeert."),
        ("Vervangt dit een interieurontwerper of bouwtekening?", "Nee. Een sfeerimpressie is bedoeld om snel te verkennen, keuzes te maken en te communiceren. Voor een definitief ontwerp of een bouwvergunning blijven een interieurontwerper en gecertificeerde tekeningen nodig."),
        ("Voor welke woningen werkt het?", "Voor nieuwbouw, bestaande bouw én renovatie. De tool is woningtype-bewust, zodat de impressie aansluit op jouw situatie."),
    ]
    schema = [howto, software, faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("3D-sfeerimpressie", canonical)])]

    tiles = "".join(f"""<a href="{HUB}/{s['key']}/" class="style-tile">
      {swatches(s['palette'])}
      <div style="font-weight:700;font-size:16px;color:#1A1208;margin-bottom:2px;">{s['label']}</div>
      <div style="font-size:13px;color:rgba(61,46,30,0.55);">{s['tagline']}</div>
    </a>""" for s in STYLES)

    body = f"""<main style="padding:64px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:64px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <span style="color:rgba(61,46,30,0.6);">3D-sfeerimpressie</span></p>
        <div class="badge">AI-visualisatie</div>
        <h1 style="font-size:2.6rem;font-weight:800;margin-bottom:8px;line-height:1.15;">3D-sfeerimpressie van je plattegrond</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);margin-bottom:8px;font-style:italic;">Zie hoe je nieuwe woning wordt — vóór je kiest, koopt en afwerkt</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:16px;line-height:1.8;">Een nieuwbouw- of verbouwwoning koop je op basis van een plattegrond — een platte tekening waarop moeilijk te zien is hoe het écht wordt. Toch maak je juist dán keuzes van tienduizenden euro's: vloeren, keuken, kleuren, inrichting. Bylder zet je plattegrond om in een realistische <strong>3D-sfeerimpressie</strong>, zodat je je woning kunt ervaren en met vertrouwen beslist.</p>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:8px;line-height:1.8;">Je kiest uit zes interieurstijlen en ziet binnen enkele minuten hoe je ruimte eruit kan zien. Vergelijk stijlen naast elkaar, ontdek wat bij je past en gebruik de beelden om af te stemmen met je partner, aannemer of leverancier.</p>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Kies je stijl</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.65);margin-bottom:18px;">Elke stijl heeft een eigen materiaal- en kleurenpalet. Bekijk per stijl hoe je woonkamer, keuken en slaapkamer eruit kunnen zien.</p>
        <div class="grid-3" style="margin-bottom:8px;">{tiles}</div>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Zo werkt het — in 4 stappen</h2>
        <ol style="list-style:decimal;padding-left:24px;display:flex;flex-direction:column;gap:12px;font-size:15px;">
          <li><strong>Upload je plattegrond.</strong> Een bouwtekening of plattegrond als PDF of foto, direct in je Bylder-dashboard.</li>
          <li><strong>Kies een stijl.</strong> Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch.</li>
          <li><strong>Genereer de impressie.</strong> De AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte.</li>
          <li><strong>Vergelijk en beslis.</strong> Zet stijlen naast elkaar en gebruik ze voor je afwerking, inrichting en meerwerkkeuzes.</li>
        </ol>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Wat je ermee wint</h2>
        <ul class="check-list">
          <li><strong>Betere keuzes.</strong> Zie het effect van een vloer, kleur of stijl vóórdat je tekent bij de leverancier.</li>
          <li><strong>Minder spijt en meerwerk.</strong> Twijfel je tussen opties? Visualiseer beide en kies bewust.</li>
          <li><strong>Makkelijker afstemmen.</strong> Eén beeld zegt meer dan tien gesprekken met je partner of aannemer.</li>
          <li><strong>Direct gekoppeld aan voordeel.</strong> Vanuit je impressie activeer je kortingen bij 40+ woonmerken.</li>
        </ul>

        <div class="highlight"><strong>Voor nieuwbouw, bestaande bouw én renovatie.</strong> De tool is woningtype-bewust: of je nu een nieuwbouwwoning afwerkt of een bestaande woning verbouwt, de impressie sluit aan op jouw situatie.</div>

        {cta_block()}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Eerlijk over wat het wél en niet is</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.7);line-height:1.8;margin-bottom:8px;">Een 3D-sfeerimpressie is een <em>verkenningstool</em>: hij laat sfeer, materialen en kleurrichting zien en helpt je sneller en bewuster kiezen. Het is geen exacte maatvoering en vervangt geen interieurontwerper of gecertificeerde bouwtekening. Voor een definitief ontwerp of een vergunning blijf je bij een professional. De kracht zit in het verkennen: in minuten zie je richtingen die anders pas op de bouwplaats duidelijk worden.</p>

        {faq_html(qa)}

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder lezen: <a href="/ai-plattegrond-maken-3d/">plattegrond maken (2D naar 3D)</a> · <a href="/nieuwbouw-tools/">gratis nieuwbouw-tools</a> · <a href="/functies/">alle functies van Bylder</a></p>
      </article>

      <aside style="position:sticky;top:100px;">
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Probeer de tool</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Maak gratis een account en upload je plattegrond. Met lidmaatschap genereer je tot 10 impressies per maand.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:12px;">De 6 stijlen</p>
          <div style="display:flex;flex-direction:column;gap:8px;">{"".join(f'<a href="{HUB}/{s["key"]}/" style="font-size:13px;color:#3D5A3E;text-decoration:none;">{s["label"]} — {s["tagline"].lower()}</a>' for s in STYLES)}</div>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">10% korting bij 40+ merken</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Auping, Goossens en meer — gekoppeld aan je woning.</p>
          <a href="/#vouchers" style="display:block;text-align:center;background:#F5F0E8;color:#3D5A3E;border:1.5px solid rgba(61,90,62,0.3);padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Vouchers bekijken →</a>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Spoke per stijl ──────────────────────────────────────────────────────────
def build_style(s):
    others = [o for o in STYLES if o["key"] != s["key"]]
    title = f"{s['label']} interieur — 3D-sfeerimpressie van je woning | Bylder.com"
    desc = f"Zie je nieuwe woning in {s['label'].lower()}e stijl: {s['materialen']}. Upload je plattegrond en maak met Bylder een 3D-sfeerimpressie in deze stijl."
    canonical = f"{BASE}{HUB}/{s['key']}/"

    qa = [
        (f"Wat kenmerkt een {s['label'].lower()} interieur?", f"Een {s['label'].lower()} interieur draait om {s['materialen']}, met {s['kleuren']}. De sfeer is {s['sfeer']}."),
        (f"Hoe zie ik mijn woning in {s['label'].lower()}e stijl?", f"Upload je plattegrond in je Bylder-dashboard en kies de stijl {s['label']}. De AI genereert binnen enkele minuten een 3D-sfeerimpressie van je ruimte in deze stijl."),
        ("Kan ik stijlen vergelijken?", "Ja. Met een Bylder-lidmaatschap maak je tot tien impressies per maand, zodat je meerdere stijlen naast elkaar kunt zetten en bewust kunt kiezen."),
    ]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("3D-sfeerimpressie", f"{BASE}{HUB}/"), (s["label"], canonical)]),
        {"@context": "https://schema.org", "@type": "Article", "headline": f"{s['label']} interieur — 3D-sfeerimpressie", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}},
    ]

    ruimtes = "".join(f"""<div class="card" style="margin-bottom:12px;">
      <div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:4px;">{r}</div>
      <p style="font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;">{html.escape(txt)}</p>
    </div>""" for r, txt in s["ruimtes"].items())

    other_tiles = "".join(f"""<a href="{HUB}/{o['key']}/" class="style-tile">
      {swatches(o['palette'])}
      <div style="font-weight:700;font-size:15px;color:#1A1208;">{o['label']}</div>
      <div style="font-size:12px;color:rgba(61,46,30,0.55);">{o['tagline']}</div>
    </a>""" for o in others)

    body = f"""<main style="padding:64px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:64px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">3D-sfeerimpressie</a> → <span style="color:rgba(61,46,30,0.6);">{s['label']}</span></p>
        <div class="badge">{s['label']} · {s['tagline']}</div>
        <h1 style="font-size:2.4rem;font-weight:800;margin-bottom:8px;line-height:1.15;">{s['label']} interieur in 3D</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);margin-bottom:8px;font-style:italic;">{s['tagline']} — zie je woning in deze stijl vóór je kiest</p>
        {swatches(s['palette'])}
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:16px;line-height:1.8;">{html.escape(s['intro'])}</p>
        <div class="highlight"><strong>Kenmerkend:</strong> {s['materialen']}, met {s['kleuren']}. De sfeer is {s['sfeer']}.</div>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">{s['label']} per ruimte</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.65);margin-bottom:18px;">Zo kan {s['label'].lower()} uitpakken in de belangrijkste ruimtes van je woning:</p>
        {ruimtes}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Zie het op jouw plattegrond</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.7);line-height:1.8;">Inspiratiebeelden zijn mooi, maar jouw woning heeft jouw indeling. Upload je plattegrond in Bylder, kies <strong>{s['label']}</strong> en de AI maakt een 3D-sfeerimpressie van jóuw ruimtes in deze stijl — zodat je ziet of het bij je huis en je leven past.</p>

        {cta_block()}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Andere stijlen</h2>
        <div class="grid-3">{other_tiles}</div>

        {faq_html(qa)}

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">overzicht 3D-sfeerimpressie</a> · <a href="/nieuwbouw-tools/">gratis nieuwbouw-tools</a></p>
      </article>

      <aside style="position:sticky;top:100px;">
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Maak je impressie in {s['label']}</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Gratis account, upload je plattegrond, kies deze stijl.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:12px;">Alle stijlen</p>
          <div style="display:flex;flex-direction:column;gap:8px;">{"".join(f'<a href="{HUB}/{o["key"]}/" style="font-size:13px;color:#3D5A3E;text-decoration:none;">{o["label"]}</a>' for o in STYLES)}</div>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Sitemap ──────────────────────────────────────────────────────────────────
def build_sitemap():
    urls = [f"{BASE}{HUB}/"] + [f"{BASE}{HUB}/{s['key']}/" for s in STYLES]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓", path)

if __name__ == "__main__":
    print("3D-sfeerimpressie content-hub genereren…")
    write("3d-sfeerimpressie/index.html", build_hub())
    for s in STYLES:
        write(f"3d-sfeerimpressie/{s['key']}/index.html", build_style(s))
    write("3d-sfeerimpressie-sitemap.xml", build_sitemap())
    print(f"Klaar: 1 hub + {len(STYLES)} stijl-spokes + sitemap.")
