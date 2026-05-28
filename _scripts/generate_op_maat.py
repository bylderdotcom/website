#!/usr/bin/env python3
import os

BASE = "/Users/danielpaaij/Documents/GitHub/website/op-maat"
SITE = "https://www.bylder.com"

NAV = """<nav style="position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(245,240,232,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);padding:14px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;"><span style="color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace;">B.</span></div>
      <span style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:24px;">
      <a href="/nieuwbouw-gids/" style="font-size:14px;color:rgba(61,46,30,0.6);text-decoration:none;font-weight:600;">Gidsen</a>
      <a href="/nieuwbouw/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Gemeenten</a>
      <a href="/op-maat/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Op maat</a>
    </div>
    <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis</a>
  </div>
</nav>"""

FOOTER = """<footer style="padding:40px 0 24px;background:#1A1208;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
    <span style="font-weight:700;color:#F5F0E8;font-size:17px;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      <a href="/nieuwbouw-gids/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Gidsen</a>
      <a href="/op-maat/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Op maat</a>
      <a href="/nieuwbouw/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Gemeenten</a>
      <a href="/privacy/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Privacy</a>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.2);font-family:'Space Mono',monospace;">© 2025 Bylder Nederland B.V.</p>
  </div>
</footer>"""

HEAD_COMMON = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.6}.container{max-width:1280px;margin:0 auto;padding:0 48px}@media(max-width:768px){.container{padding:0 20px}.sidebar{display:none}}.warm-divider{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}.fb.o{max-height:600px!important}</style>"""

CTA_SECTION = """<section style="padding:48px 0;background:#1A1208;text-align:center;">
  <div class="container">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;color:#F5F0E8;letter-spacing:-0.03em;margin-bottom:12px;">Laat Bylder dit voor jou regelen</h2>
    <p style="font-size:15px;color:rgba(245,240,232,0.5);max-width:420px;margin:0 auto 22px;line-height:1.7;">Upload je documenten, de AI controleert alles. €99 eenmalig.</p>
    <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Start gratis QuickScan</a>
  </div>
</section>"""

SIDEBAR_CTA = """<div style="background:#1A1208;border-radius:16px;padding:22px;margin-bottom:14px;">
  <div style="font-size:1.3rem;margin-bottom:10px;">🔨</div>
  <div style="font-size:15px;font-weight:700;color:#F5F0E8;margin-bottom:8px;">Maatwerk plannen?</div>
  <p style="font-size:13px;color:rgba(245,240,232,0.5);line-height:1.6;margin-bottom:14px;">Bylder's AI helpt je de juiste keuzes maken voor jouw nieuwbouwwoning.</p>
  <a href="/login.html" style="display:block;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:9px;font-size:13px;font-weight:700;text-decoration:none;text-align:center;">Start gratis →</a>
</div>"""

def faq_block(q, a):
    return f"""<div style="border:1px solid rgba(61,46,30,0.09);border-radius:14px;overflow:hidden;background:#fff;margin-bottom:10px;">
<h3 style="margin:0;"><button onclick="var b=this.parentElement.nextElementSibling;var o=b.classList.contains('o');document.querySelectorAll('.fb.o').forEach(x=>x.classList.remove('o'));if(!o)b.classList.add('o');"
  style="width:100%;text-align:left;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:#1A1208;">
  {q}<span style="color:#5C4433;font-size:12px;flex-shrink:0;">▾</span></button></h3>
<div class="fb" style="max-height:0;overflow:hidden;transition:max-height 0.35s ease;"><div style="padding:0 22px 18px;font-size:14px;line-height:1.75;color:rgba(61,46,30,0.7);">{a}</div></div>
</div>"""

def breadcrumb_html(crumbs):
    parts = []
    for i, (name, url) in enumerate(crumbs):
        if i < len(crumbs) - 1:
            parts.append(f'<a href="{url}" style="color:rgba(61,46,30,0.4);text-decoration:none;">{name}</a> ›')
        else:
            parts.append(f'<span style="color:#5C4433;font-weight:600;">{name}</span>')
    return '<nav style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(61,46,30,0.4);flex-wrap:wrap;">' + ' '.join(parts) + '</nav>'

def breadcrumb_ld(crumbs):
    items = []
    for i, (name, url) in enumerate(crumbs):
        items.append(f'{{"@type":"ListItem","position":{i+1},"name":"{name}","item":"https://www.bylder.com{url}"}}')
    return '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[' + ','.join(items) + ']}'

def faq_ld(faqs):
    items = []
    for q, a in faqs:
        aq = a.replace('"', '\\"')
        qq = q.replace('"', '\\"')
        items.append(f'{{"@type":"Question","name":"{qq}","acceptedAnswer":{{"@type":"Answer","text":"{aq}"}}}}')
    return '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + ','.join(items) + ']}'

def write_page(path, html):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(html)
    print(f"  ✓ {path.replace('/Users/danielpaaij/Documents/GitHub/website/', '')}")

# ─────────────────────────────────────────────
# NIVEAU 1 — /op-maat/index.html
# ─────────────────────────────────────────────

CATEGORIES = [
    ("keuken", "Keuken op maat", "🍳", "Maatwerk keukens, eilanden en kastjes afgestemd op jouw nieuwbouwwoning.", [
        ("Maatwerk keuken", "maatwerk-keuken"),
        ("Keukeneiland op maat", "keukeneiland-op-maat"),
        ("Keukenkasten op maat", "keukenkasten-op-maat"),
    ]),
    ("kasten-en-opbergen", "Kasten & opbergen op maat", "🗄️", "Inbouwkasten, inloopkasten en wandmeubels perfect in jouw ruimte.", [
        ("Inbouwkast op maat", "inbouwkast-op-maat"),
        ("Inloopkast op maat", "inloopkast-op-maat"),
        ("Schuifdeuren op maat", "schuifdeuren-op-maat"),
        ("Wandmeubel op maat", "wandmeubel-op-maat"),
        ("Boekenkast op maat", "boekenkast-op-maat"),
        ("Tv-meubel op maat", "tv-meubel-op-maat"),
    ]),
    ("slaapkamer", "Slaapkamer op maat", "🛏️", "Bedombouwen, inloopkasten en hoofdborden voor de ideale slaapkamer.", [
        ("Inloopkast slaapkamer", "inloopkast-slaapkamer"),
        ("Bedombouw op maat", "bedombouw-op-maat"),
        ("Hoofdbord op maat", "hoofdbord-op-maat"),
        ("Kinderkamer op maat", "kinderkamer-op-maat"),
    ]),
    ("badkamer", "Badkamer op maat", "🚿", "Badkamermeubels, wastafelbladen en douchecabines op maat.", [
        ("Badkamermeubel op maat", "badkamermeubel-op-maat"),
        ("Wastafelblad op maat", "wastafelblad-op-maat"),
        ("Spiegelkast op maat", "spiegelkast-op-maat"),
        ("Douchecabine op maat", "douchecabine-op-maat"),
        ("Bad op maat", "bad-op-maat"),
    ]),
    ("woonkamer", "Woonkamer op maat", "🛋️", "Bankstellen, eettafels en roomdividers die passen bij jouw interieur.", [
        ("Bankstellen op maat", "bankstellen-op-maat"),
        ("Eettafel op maat", "eettafel-op-maat"),
        ("Bureau op maat", "bureau-op-maat"),
        ("Roomdivider op maat", "roomdivider-op-maat"),
    ]),
    ("trap-en-hal", "Trap & hal op maat", "🪜", "Trapombouwen, leuningen en garderobewanden voor entree en hal.", [
        ("Trapombouw op maat", "trapombouw-op-maat"),
        ("Trapleuning op maat", "trapleuning-op-maat"),
        ("Garderobewand op maat", "garderobewand-op-maat"),
    ]),
    ("raamdecoratie", "Raamdecoratie op maat", "🪟", "Gordijnen, shutters en vouwgordijnen op exact maat gesneden.", [
        ("Gordijnen op maat", "gordijnen-op-maat"),
        ("Shutters op maat", "shutters-op-maat"),
        ("Jaloezieen op maat", "jaloezieen-op-maat"),
        ("Vouwgordijnen op maat", "vouwgordijnen-op-maat"),
    ]),
    ("verlichting", "Verlichting op maat", "💡", "Lichtplannen, inbouwspots en hanglampen op maat voor nieuwbouw.", [
        ("Lichtplan op maat", "lichtplan-op-maat"),
        ("Inbouwspots op maat", "inbouwspots-op-maat"),
        ("Hanglamp op maat", "hanglamp-op-maat"),
    ]),
    ("tuin-en-buiten", "Tuin & buiten op maat", "🌿", "Overkappingen, schuttingen en terrasmeubilair afgestemd op jouw tuin.", [
        ("Overkapping op maat", "overkapping-op-maat"),
        ("Tuinschuur op maat", "tuinschuur-op-maat"),
        ("Schutting op maat", "schutting-op-maat"),
        ("Terrasmeubilair op maat", "terrasmeubilair-op-maat"),
        ("Tuinverlichting op maat", "tuinverlichting-op-maat"),
    ]),
    ("techniek-en-energie", "Techniek & energie op maat", "⚡", "Vloerverwarming, smart home en zonnepanelen voor jouw nieuwbouwwoning.", [
        ("Vloerverwarming op maat", "vloerverwarming-op-maat"),
        ("Smart home op maat", "smart-home-op-maat"),
        ("Zonnepanelen op maat", "zonnepanelen-op-maat"),
        ("Laadpaal op maat", "laadpaal-op-maat"),
    ]),
]

# Build niveau-1 page
cat_cards = ""
for slug, title, icon, desc, products in CATEGORIES:
    prod_links = "".join([f'<a href="/op-maat/{slug}/{p[1]}/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;padding:4px 0;border-bottom:1px solid rgba(61,46,30,0.06);">{p[0]}</a>' for p in products])
    cat_cards += f"""<div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px;">
  <div style="font-size:2rem;">{icon}</div>
  <a href="/op-maat/{slug}/" style="font-size:1.1rem;font-weight:800;color:#1A1208;text-decoration:none;letter-spacing:-0.02em;">{title}</a>
  <p style="font-size:13px;color:rgba(61,46,30,0.6);line-height:1.6;margin:0;">{desc}</p>
  <div style="display:flex;flex-direction:column;gap:0;">{prod_links}</div>
  <a href="/op-maat/{slug}/" style="font-size:13px;color:#3D5A3E;font-weight:700;margin-top:4px;">Bekijk alle →</a>
</div>"""

itemlist_items = ",".join([f'{{"@type":"ListItem","position":{i+1},"name":"{c[1]}","url":"https://www.bylder.com/op-maat/{c[0]}/"}}' for i, c in enumerate(CATEGORIES)])

niveau1_html = f"""<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Op maat laten maken voor nieuwbouw — overzicht | Bylder</title>
<meta name="description" content="Alles wat je op maat kunt laten maken voor je nieuwbouwwoning: keuken, kasten, badkamer, raamdecoratie, verlichting en meer. Prijzen, tips en leveranciers.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.bylder.com/op-maat/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Bylder">
<meta property="og:url" content="https://www.bylder.com/op-maat/">
<meta property="og:title" content="Op maat laten maken voor nieuwbouw — overzicht | Bylder">
<meta property="og:description" content="Alles wat je op maat kunt laten maken voor je nieuwbouwwoning: keuken, kasten, badkamer, raamdecoratie, verlichting en meer.">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebPage","name":"Op maat laten maken voor nieuwbouw","url":"https://www.bylder.com/op-maat/","description":"Overzicht van alle maatwerk-opties voor in en rondom de nieuwbouwwoning.","breadcrumb":{{"@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"Bylder","item":"https://www.bylder.com"}},{{"@type":"ListItem","position":2,"name":"Op maat","item":"https://www.bylder.com/op-maat/"}}]}}}}</script>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"ItemList","name":"Op maat categorieën","itemListElement":[{itemlist_items}]}}</script>
{HEAD_COMMON}
</head><body>
{NAV}
<div style="padding-top:68px;"><div class="container" style="padding-top:10px;padding-bottom:10px;">
{breadcrumb_html([("Bylder", "/"), ("Op maat laten maken", "/op-maat/")])}
</div></div>
<section style="padding:40px 0 52px;background:#fff;">
  <div class="container" style="max-width:800px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(61,46,30,0.08);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:#5C4433;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.08em;">Maatwerk voor nieuwbouw</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.15;margin-bottom:16px;">Op maat laten maken voor je nieuwbouwwoning</h1>
    <p style="font-size:17px;color:rgba(61,46,30,0.65);line-height:1.8;margin-bottom:24px;">Een nieuwbouwwoning biedt de perfecte gelegenheid om alles op maat te laten maken — van de keuken tot de raamdecoratie. Hier vind je per categorie wat het kost, hoe je een goede leverancier kiest en welke keuzes je het beste vroeg maakt.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI-advies voor mijn woning</a>
      <a href="/nieuwbouw-gids/" style="border:1.5px solid rgba(61,46,30,0.15);color:#3D2E1E;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;background:rgba(255,255,255,0.8);">Alle gidsen</a>
    </div>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;">
  <div class="container">
    <h2 style="font-size:1.5rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin-bottom:8px;">Alle categorieën</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:32px;">Kies een categorie om prijzen, tips en productpagina's te bekijken.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
      {cat_cards}
    </div>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;">
  <div class="container" style="max-width:800px;">
    <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin-bottom:16px;">Wanneer bestel je maatwerk voor nieuwbouw?</h2>
    <p style="font-size:16px;color:rgba(61,46,30,0.7);line-height:1.85;margin-bottom:16px;">De grootste fout die nieuwbouwkopers maken: te laat beginnen. Voor maatwerk geldt doorgaans een levertijd van 8–14 weken. Reken terug vanuit de geplande oplevering:</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:24px;">
      <div style="background:#fff;border-radius:12px;padding:18px;border:1px solid rgba(61,46,30,0.08);"><div style="font-weight:800;color:#B85C38;font-size:1.1rem;margin-bottom:6px;">−6 maanden</div><div style="font-size:13px;color:rgba(61,46,30,0.7);">Keuken bestellen</div></div>
      <div style="background:#fff;border-radius:12px;padding:18px;border:1px solid rgba(61,46,30,0.08);"><div style="font-weight:800;color:#B85C38;font-size:1.1rem;margin-bottom:6px;">−4 maanden</div><div style="font-size:13px;color:rgba(61,46,30,0.7);">Kasten & inbouwkasten</div></div>
      <div style="background:#fff;border-radius:12px;padding:18px;border:1px solid rgba(61,46,30,0.08);"><div style="font-weight:800;color:#B85C38;font-size:1.1rem;margin-bottom:6px;">−3 maanden</div><div style="font-size:13px;color:rgba(61,46,30,0.7);">Raamdecoratie & verlichting</div></div>
      <div style="background:#fff;border-radius:12px;padding:18px;border:1px solid rgba(61,46,30,0.08);"><div style="font-weight:800;color:#B85C38;font-size:1.1rem;margin-bottom:6px;">−2 maanden</div><div style="font-size:13px;color:rgba(61,46,30,0.7);">Badkamermeubel & accessoires</div></div>
    </div>
    <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin:32px 0 12px;">Veelgestelde vragen over maatwerk nieuwbouw</h2>
    {faq_block("Wat is het voordeel van maatwerk boven standaard meubels?", "Maatwerk past exact in jouw ruimte — geen verloren hoeken, geen onlogische indelingen. Nieuwbouwwoningen hebben vaak specifieke maten die je bij standaard meubels nooit precies vindt. Bovendien kies je zelf materiaal, kleur en afwerking.")}
    {faq_block("Is maatwerk altijd duurder dan standaard?", "Niet altijd. Een maatwerk inbouwkast kost €800–€2.500 en benut de volledige hoogte en breedte. Een vergelijkbaar IKEA PAX systeem met maatpanelen kan door arbeidskosten ook richting €1.000–€1.800 gaan. Het prijsverschil is kleiner dan mensen denken, zeker bij complexe ruimtes.")}
    {faq_block("Hoe vind ik een goede maatwerkleverancier?", "Vraag minimaal 3 offertes aan. Check referenties en reviews op Google. Kijk of ze showrooms hebben waar je het werk kunt beoordelen. Let op: de goedkoopste aanbieder is zelden de beste keuze — levertijd, garantie en service zijn minstens zo belangrijk.")}
    {faq_block("Kan ik maatwerk al bestellen voor de sleuteloverdracht?", "Ja, en dat is zelfs aanbevolen. Na tekening van de koopakte kun je al op maat opnemen laten doen (de tekeningmaten zijn dan beschikbaar). Sommige leveranciers plannen de opmeting pas vlak voor oplevering in, maar met 3D-tekeningen is eerder bestellen goed mogelijk.")}
  </div>
</section>
<div class="warm-divider"></div>
{CTA_SECTION}
{FOOTER}
<script src="/auping-popup.js"></script>
</body></html>"""

write_page(f"{BASE}/index.html", niveau1_html)

print("Niveau-1 klaar.")
