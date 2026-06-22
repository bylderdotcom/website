#!/usr/bin/env python3
"""
Landingspagina's voor de inrichten-tool: /plattegrond-inrichten/ (pillar) + spokes.
Propositie: pas je meubels/kasten op schaal in op je eigen plattegrond ("past het?")
en zie 't met één klik in 3D in een stijl ("hoe voelt het?"). Gekoppeld aan
producten/vouchers. SEO/GEO/AEO/CRO/schema-geoptimaliseerd.
"""
import os, html, json

BASE = "https://www.bylder.com"
HUB = "/plattegrond-inrichten"
SIGNUP = "https://app.bylder.com/registreer"
ROOT = os.path.dirname(os.path.abspath(__file__))

NAV_CSS = """
.glass-nav{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links>a{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-links>a:hover{color:#1A1208;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-login{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
.nav-burger span{width:22px;height:2px;background:#1A1208;border-radius:2px;display:block;}
.nav-mobile{display:none;flex-direction:column;gap:2px;padding:10px 20px 18px;background:rgba(245,240,232,0.98);border-bottom:1px solid rgba(61,46,30,0.08);}
.nav-mobile.open{display:flex;}
.nav-mobile a{padding:11px 10px;color:rgba(61,46,30,0.72);text-decoration:none;font-size:15px;border-radius:8px;}
.nav-mobile .m-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;text-align:center;margin-top:8px;}
@media(max-width:860px){.nav-links,.nav-login{display:none;}.nav-burger{display:flex;}.nav-inner{padding:14px 20px;}}
"""

NAV_HTML = f"""<nav class="glass-nav">
  <div class="nav-inner">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div class="nav-links">
      <a href="/#features">Voordelen</a>
      <a href="/functies/">Functies</a>
      <a href="/3d-sfeerimpressie/">3D-impressie</a>
      <a href="/vouchers/">Vouchers</a>
      <a href="/prijzen/">Prijzen</a>
    </div>
    <div class="nav-right">
      <a href="https://app.bylder.com" class="nav-login">Inloggen</a>
      <a href="{SIGNUP}" class="nav-cta">Start gratis &#8594;</a>
      <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false" onclick="var m=document.getElementById('navMobile');this.setAttribute('aria-expanded',m.classList.toggle('open'));"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-mobile" id="navMobile">
    <a href="/#features">Voordelen</a>
    <a href="/functies/">Functies</a>
    <a href="/3d-sfeerimpressie/">3D-impressie</a>
    <a href="/vouchers/">Vouchers</a>
    <a href="/prijzen/">Prijzen</a>
    <a href="https://app.bylder.com">Inloggen</a>
    <a href="{SIGNUP}" class="m-cta">Start gratis &#8594;</a>
  </div>
</nav>"""

def head(title, desc, canonical, schema_blocks):
    schema = "\n".join(f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>' for b in schema_blocks)
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="author" content="Bylder Nederland B.V.">
<meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{canonical}">
<meta name="robots" content="index,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
{schema}
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.7;}}
h1,h2,h3{{letter-spacing:-0.02em;color:#1A1208;}}
a{{color:#3D5A3E;}}
.container{{max-width:1100px;margin:0 auto;padding:0 48px;}}
.badge{{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}}
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}}
.grid-2{{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:11px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.step{{flex:1;min-width:200px;}}
.step .n{{width:38px;height:38px;border-radius:10px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-weight:800;font-family:'Space Mono',monospace;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;padding:16px 18px;transition:border-color .15s;}}
.tile:hover{{border-color:rgba(61,90,62,0.4);}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-2,.grid-3{{grid-template-columns:1fr;}}}}
{NAV_CSS}
</style></head>
<body>{NAV_HTML}"""

FOOTER = """<footer style="background:#1A1208;padding:56px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:30px;height:30px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:12px;">B.</div>
      <span style="font-weight:700;font-size:16px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.4);max-width:560px;line-height:1.6;">Bylder begeleidt nieuwbouw- en verbouwkopers: van eerlijke offerte-check tot je woning inrichten en in 3D zien. De inrichttool start gratis; de fotorealistische 3D-render is een lidmaatschap-functie.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer></body></html>"""

def faq_schema(qa): return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
def breadcrumb(items): return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}
def faq_html(qa): return '<h2 style="font-size:1.5rem;font-weight:800;margin:8px 0 12px;">Veelgestelde vragen</h2>' + "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{a}</p></div>' for q, a in qa)

def softwareapp(name, desc, url):
    return {"@context": "https://schema.org", "@type": "SoftwareApplication", "name": name,
            "applicationCategory": "DesignApplication", "operatingSystem": "Web", "url": url, "description": desc,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR", "description": "Gratis te starten; 3D-render met lidmaatschap."}}

def cta_block(titel, sub):
    return f"""<div style="background:#3D5A3E;border-radius:20px;padding:44px;text-align:center;margin:40px 0;">
  <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">{titel}</h2>
  <p style="color:rgba(245,240,232,0.72);margin-bottom:26px;max-width:560px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.65;">{sub}</p>
  <a href="{SIGNUP}" class="cta-primary">Start gratis &#8594;</a>
</div>"""

# Spokes: (slug, title, h1, desc, intro, bullets[], faq[(q,a)])
SPOKES = [
    {"slug": "meubels-inpassen",
     "title": "Past mijn bank, bed of kast? Meubels inpassen op je plattegrond | Bylder",
     "h1": "Past mijn meubel? Pas het in op je plattegrond",
     "desc": "Twijfel je of je bank, bed of kledingkast past? Plaats je meubels op schaal op je eigen plattegrond en zie het direct. Gratis bij Bylder.",
     "intro": "De grootste vraag bij een nieuwe woning: <em>past mijn inrichting eigenlijk wel?</em> In plaats van meten en gokken plaats je je meubels op ware grootte op je eigen plattegrond &mdash; en zie je meteen of het werkt.",
     "bullets": ["Meubels, kasten en keuken op échte schaal (in meters).", "Kalibreer de schaal met één bekende maat van je tekening.", "Schuif, draai en probeer indelingen tot het klopt.", "Koppel een meubel direct aan een product mét kortingsvoucher."],
     "faq": [("Hoe weet ik of mijn bank past?", "Plaats je bank op ware grootte op je plattegrond en schuif 'm op z'n plek. Omdat alles op schaal staat, zie je direct of er genoeg loopruimte overblijft."),
             ("Moet ik exact meten?", "Nee. Je kalibreert de schaal één keer met een bekende maat van je tekening (bijvoorbeeld de breedte van een muur), daarna staat alles automatisch goed.")]},
    {"slug": "nieuwbouw",
     "title": "Je nieuwbouwwoning inrichten vóór de oplevering | Bylder",
     "h1": "Richt je nieuwbouwwoning in vóór de oplevering",
     "desc": "Plan de inrichting van je nieuwbouwwoning op de bouwtekening: meubels op schaal + een 3D-impressie in jouw stijl. Maak keuzes vóór de eerste muur geverfd is.",
     "intro": "Bij nieuwbouw maak je keuzes lang voordat je iets ziet. Met Bylder pas je je inrichting in op je bouwtekening en zie je je afgewerkte woning in 3D &mdash; zodat je meerwerk- en inrichtingskeuzes met vertrouwen maakt.",
     "bullets": ["Werkt direct op je bouwtekening of plattegrond.", "Zie hoe je stijl uitpakt vóór je beslist over vloeren, kleuren en keuken.", "Inrichtingskeuzes sluiten aan op je meerwerk en je budget.", "Eén klik naar een fotorealistische 3D-impressie in jouw stijl."],
     "faq": [("Kan dit al vóór de oplevering?", "Ja, juist dan is het waardevol. Je werkt op de tekening, dus je kunt indeling en stijl bepalen voordat er iets gebouwd is."),
             ("Helpt dit bij meerwerk-keuzes?", "Zeker. Door je inrichting en afwerking vooraf te visualiseren, zie je beter welk meerwerk de moeite waard is.")]},
    {"slug": "mooie-plattegrond",
     "title": "Mooie plattegrond maken van je bouwtekening | Bylder",
     "h1": "Maak een mooie plattegrond van je bouwtekening",
     "desc": "Zet je rommelige technische bouwtekening om in een nette, overzichtelijke plattegrond — strakke wanden en duidelijke ruimtes. In je browser bij Bylder.",
     "intro": "Een technische bouwtekening is functioneel, maar rommelig en lastig te lezen. Bylder schoont 'm met één klik op tot een <strong>nette, overzichtelijke plattegrond</strong> &mdash; strakke wanden, duidelijke ruimtes, prettig om naar te kijken. Zo wordt je woning meteen tastbaarder.",
     "bullets": ["Upload je bouwtekening of plattegrond.", "Eén klik &rarr; een opgeschoonde, overzichtelijke 2D-plattegrond.", "Je indeling blijft kloppen &mdash; alleen netter en duidelijker.", "Wil je verder? Pas je meubels in en render 'm in 3D in jouw stijl."],
     "faq": [("Hoe maak ik mijn plattegrond netter?", "Upload je technische tekening en Bylder schoont 'm met AI op tot een nette, overzichtelijke plattegrond &mdash; strakke wanden en duidelijke ruimtes, in je browser. Indicatief beeld."),
             ("Blijft mijn indeling kloppen?", "Ja. De opmaak houdt je plattegrond-indeling aan; het maakt 'm vooral netter en makkelijker te lezen.")]},
    {"slug": "online-gratis",
     "title": "Je woning online indelen — gratis starten | Bylder",
     "h1": "Je woning online indelen — gratis",
     "desc": "Deel je woning online in: sleep meubels op schaal op je plattegrond. Gratis te starten bij Bylder, met optioneel een 3D-impressie in jouw stijl.",
     "intro": "Geen ingewikkelde 3D-software nodig. Upload je plattegrond, sleep je meubels erop en deel je woning in &mdash; in je browser, gratis te starten.",
     "bullets": ["Gratis starten met een Bylder-account.", "Werkt in je browser, geen installatie.", "Op schaal, dus betrouwbaar voor &lsquo;past het?&rsquo;-vragen.", "Wil je 't zien? Render met lidmaatschap een 3D-impressie in een stijl."],
     "faq": [("Is het echt gratis?", "Het indelen op je plattegrond start gratis met een Bylder-account. De fotorealistische 3D-render is een lidmaatschap-functie."),
             ("Heb ik software nodig?", "Nee, het werkt volledig in je browser. Upload je plattegrond en je kunt meteen beginnen.")]},
]


def waarom_block():
    return """<h2 style="font-size:1.6rem;font-weight:800;margin:8px 0 6px;">Twee vragen, het juiste antwoord per vraag</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;max-width:760px;">Een 3D-omgeving waarin je zelf moet modelleren is voor de meeste mensen onnodig ingewikkeld. Bylder splitst het slim:</p>
    <div class="grid-2">
      <div class="card"><div style="font-weight:800;color:#1A1208;margin-bottom:6px;">&ldquo;Past het?&rdquo; &rarr; 2D</div><div style="font-size:14px;color:rgba(61,46,30,0.68);line-height:1.6;">Een bovenaanzicht op schaal is het snelst en exactst om indeling en pasvorm te beoordelen. Sleep, draai, probeer.</div></div>
      <div class="card"><div style="font-weight:800;color:#1A1208;margin-bottom:6px;">&ldquo;Hoe voelt het?&rdquo; &rarr; 3D</div><div style="font-size:14px;color:rgba(61,46,30,0.68);line-height:1.6;">Voor de sfeer maakt Bylder met één klik een fotorealistische 3D-impressie in de stijl die jij kiest.</div></div>
    </div>"""


def build_pillar():
    title = "Plattegrond inrichten: meubels op schaal + 3D-impressie | Bylder.com"
    desc = "Richt je woning in op je eigen plattegrond: sleep meubels en kasten op schaal en zie 't met één klik in 3D in jouw stijl. Gratis starten bij Bylder."
    canonical = f"{BASE}{HUB}/"
    qa = [
        ("Hoe richt ik mijn plattegrond in?", "Upload je plattegrond als afbeelding, stel de schaal in met één bekende maat en sleep meubels, kasten en je keuken op ware grootte op de tekening. Zo zie je direct wat past."),
        ("Heb ik 3D-software of ervaring nodig?", "Nee. Het inpassen gebeurt in 2D in je browser &mdash; geen installatie of modelleerwerk. Voor de sfeer maakt Bylder met één klik een 3D-impressie."),
        ("Is het gratis?", "Het inrichten op je plattegrond start gratis met een Bylder-account. De fotorealistische 3D-render in een stijl is een lidmaatschap-functie."),
        ("Werkt het ook voor nieuwbouw?", "Juist dan. Je werkt op je bouwtekening, dus je bepaalt indeling en stijl al voordat er gebouwd is &mdash; handig bij meerwerk-keuzes."),
        ("Kan ik meubels meteen kopen?", "Je koppelt een geplaatst meubel aan een product, en als er een Bylder-kortingsvoucher voor dat merk is, gebruik je die direct."),
    ]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Plattegrond inrichten", canonical)]),
              softwareapp("Bylder Inrichten", desc, canonical),
              {"@context": "https://schema.org", "@type": "Article", "headline": "Plattegrond inrichten: meubels op schaal + 3D-impressie", "description": desc, "inLanguage": "nl-NL", "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V."}}]
    spoke_tiles = "".join(f'<a href="{HUB}/{s["slug"]}/" class="tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{html.escape(s["h1"])}</div></a>' for s in SPOKES)
    body = f"""<main style="padding:56px 0 20px;"><div class="container">
  <div style="max-width:780px;">
    <div class="badge">Inrichten &middot; In de app</div>
    <h1 style="font-size:2.7rem;font-weight:800;line-height:1.12;margin-bottom:16px;">Richt je woning in op je eigen plattegrond</h1>
    <p style="font-size:1.15rem;color:rgba(61,46,30,0.7);line-height:1.7;margin-bottom:14px;">Sleep je meubels, kasten en keuken <strong>op schaal</strong> op je plattegrond &mdash; zo zie je meteen wat past. En met één klik maakt Bylder er een <strong>fotorealistische 3D-impressie</strong> van, in de stijl die jij kiest.</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
      <a href="{SIGNUP}" style="background:#3D5A3E;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Start gratis &#8594;</a>
      <a href="/3d-sfeerimpressie/" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Bekijk de 3D-stijlen</a>
    </div>
  </div>
  <div class="divider"></div>
  <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:18px;">Zo werkt het</h2>
  <div style="display:flex;flex-wrap:wrap;gap:24px;">
    <div class="step"><div class="n">1</div><div style="font-weight:700;margin:12px 0 4px;">Upload je plattegrond</div><div style="font-size:14px;color:rgba(61,46,30,0.66);line-height:1.6;">Je bouwtekening of plattegrond als afbeelding.</div></div>
    <div class="step"><div class="n">2</div><div style="font-weight:700;margin:12px 0 4px;">Pas je inrichting in</div><div style="font-size:14px;color:rgba(61,46,30,0.66);line-height:1.6;">Sleep meubels op schaal, stel de schaal in met één maat.</div></div>
    <div class="step"><div class="n">3</div><div style="font-weight:700;margin:12px 0 4px;">Zie 't in 3D</div><div style="font-size:14px;color:rgba(61,46,30,0.66);line-height:1.6;">Eén klik naar een fotorealistische impressie in jouw stijl.</div></div>
  </div>
  {cta_block("Maak je nieuwe woning tastbaar", "Begin gratis met inrichten op je eigen plattegrond. Zie wat past — en hoe het voelt.")}
  {waarom_block()}
  <h2 style="font-size:1.6rem;font-weight:800;margin:44px 0 14px;">Meer over inrichten</h2>
  <div class="grid-3">{spoke_tiles}</div>
  <div class="divider"></div>
  {faq_html(qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder: <a href="/3d-sfeerimpressie/">3D-sfeerimpressie maken</a> &middot; <a href="/functies/">alle functies</a> &middot; <a href="/vouchers/">kortingsvouchers</a> &middot; <a href="/eerlijke-prijzen/">eerlijke prijzen</a></p>
  </div></main>"""
    return head(title, desc, canonical, schema) + body + FOOTER


def build_spoke(s):
    canonical = f"{BASE}{HUB}/{s['slug']}/"
    schema = [faq_schema(s["faq"]), breadcrumb([("Bylder.com", BASE + "/"), ("Plattegrond inrichten", f"{BASE}{HUB}/"), (s["h1"], canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": s["h1"], "description": s["desc"], "inLanguage": "nl-NL", "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V."}}]
    bullets = "".join(f"<li>{b}</li>" for b in s["bullets"])
    others = "".join(f'<a href="{HUB}/{o["slug"]}/" class="tile"><div style="font-weight:700;font-size:14px;color:#1A1208;">{html.escape(o["h1"])}</div></a>' for o in SPOKES if o["slug"] != s["slug"])
    body = f"""<main style="padding:56px 0 20px;"><div class="container" style="max-width:820px;">
    <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:24px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> &rarr; <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Plattegrond inrichten</a> &rarr; <span style="color:rgba(61,46,30,0.6);">{html.escape(s["h1"])}</span></p>
    <div class="badge">Inrichten</div>
    <h1 style="font-size:2.3rem;font-weight:800;line-height:1.14;margin-bottom:14px;">{html.escape(s["h1"])}</h1>
    <p style="font-size:1.08rem;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:20px;">{s["intro"]}</p>
    <ul class="check-list">{bullets}</ul>
    {cta_block("Probeer het gratis", "Upload je plattegrond en pas je inrichting in — in je browser, gratis te starten.")}
    {faq_html(s["faq"])}
    <h2 style="font-size:1.4rem;font-weight:700;margin:36px 0 12px;">Verder lezen</h2>
    <div class="grid-2">{others}</div>
    <div class="divider"></div>
    <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar <a href="{HUB}/">plattegrond inrichten</a> &middot; <a href="/3d-sfeerimpressie/">3D-sfeerimpressie</a> &middot; <a href="/functies/">functies</a></p>
    </div></main>"""
    return head(s["title"], s["desc"], canonical, schema) + body + FOOTER


def build_sitemap():
    urls = [f"{BASE}{HUB}/"] + [f"{BASE}{HUB}/{s['slug']}/" for s in SPOKES]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)
    print("  ✓", path)


if __name__ == "__main__":
    print("Inrichten-landingspagina's genereren…")
    write("plattegrond-inrichten/index.html", build_pillar())
    for s in SPOKES:
        write(f"plattegrond-inrichten/{s['slug']}/index.html", build_spoke(s))
    write("plattegrond-inrichten-sitemap.xml", build_sitemap())
    print(f"Klaar: pillar + {len(SPOKES)} spokes + sitemap.")
