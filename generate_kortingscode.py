#!/usr/bin/env python3
"""
Bylder.com — Kortingscode-hub generator (native pSEO)
=====================================================
Genereert /kortingscode/ (hub) + /kortingscode/[merk]/ (per merk) als statische
HTML met volledige site-chrome, JSON-LD, FAQ en interne links. Data komt uit
Supabase (public.brands + public.brand_offers) — CODES worden NOOIT opgehaald of
in HTML gezet; de code-onthulling gebeurt na doorklik naar de app (login).

Vereist env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
Gebruik:    python3 generate_kortingscode.py
Output:     ./kortingscode/index.html, ./kortingscode/<slug>/index.html, ./sitemap-kortingscode.xml
"""
import os, json, html, ssl, urllib.request
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape as xesc

# Lokale build-tool tegen onze eigen Supabase. macOS/Python mist soms de CA-bundle;
# gebruik certifi indien beschikbaar, anders een ongeverifieerde context.
try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL = ssl.create_default_context()
    _SSL.check_hostname = False
    _SSL.verify_mode = ssl.CERT_NONE

BASE = "https://www.bylder.com"
APP  = "https://app.bylder.com"
OUT  = Path(".")
TODAY = date.today()
TODAY_NL = TODAY.strftime("%-d %B %Y").replace("January","januari").replace("February","februari").replace("March","maart").replace("April","april").replace("May","mei").replace("June","juni").replace("July","juli").replace("August","augustus").replace("September","september").replace("October","oktober").replace("November","november").replace("December","december")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

def fetch(path):
    req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req, context=_SSL) as r:
        return json.load(r)

def esc(s): return html.escape(str(s or ""), quote=True)

# ── CHROME ──────────────────────────────────────────────────────────────────
def head(title, description, canonical, jsonld):
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<link rel="sitemap" type="application/xml" href="/kortingscode-sitemap.xml">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:locale" content="nl_NL">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" hreflang="nl" href="{canonical}">
{jsonld}
<meta name="author" content="Bylder Nederland B.V.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={{theme:{{extend:{{colors:{{cream:'#F5F0E8','cream-2':'#EDE6D8',sand:'#C8B89A',bark:'#3D2E1E',moss:'#3D5A3E','moss-light':'#4E7350',rust:'#B85C38',charcoal:'#1A1208'}},fontFamily:{{sans:['Plus Jakarta Sans','sans-serif'],mono:['Space Mono','monospace']}}}}}}}}</script>
<style>
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;margin:0}}
.container{{width:100%;max-width:1100px;margin:0 auto;padding-left:48px;padding-right:48px}}
@media(max-width:768px){{.container{{padding-left:20px;padding-right:20px}}.hide-mob{{display:none!important}}.grid-cards{{grid-template-columns:1fr 1fr!important}}}}
.glass-nav{{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08)}}
.cta-btn{{background:#3D5A3E;color:#F5F0E8;font-weight:700;transition:all .25s}}
.cta-btn:hover{{background:#4E7350;box-shadow:0 8px 30px rgba(61,90,62,.3);transform:translateY(-1px)}}
.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,.5),transparent);height:1px}}
.card{{background:#fff;border:1px solid rgba(61,46,30,.08);border-radius:16px;transition:all .25s}}
.card:hover{{box-shadow:0 8px 30px rgba(61,46,30,.08)}}
.badge-moss{{background:rgba(61,90,62,.1);border:1px solid rgba(61,90,62,.2);color:#3D5A3E}}
details.faq{{border-top:1px solid rgba(61,46,30,.1);padding:14px 0}}
details.faq summary{{font-size:15px;font-weight:600;color:#1A1208;cursor:pointer;list-style:none}}
details.faq summary::-webkit-details-marker{{display:none}}
details.faq p{{font-size:14px;color:rgba(61,46,30,.6);line-height:1.6;margin:10px 0 0}}
a.brandcard{{background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:12px;padding:14px 16px;text-decoration:none;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:border-color .2s}}
a.brandcard:hover{{border-color:#3D5A3E}}
::-webkit-scrollbar{{width:5px}}::-webkit-scrollbar-track{{background:#EDE6D8}}::-webkit-scrollbar-thumb{{background:#C8B89A;border-radius:3px}}
</style>
</head>
<body>
{NAV}
<main id="main-content">"""

NAV = """<nav class="glass-nav fixed top-0 left-0 right-0 z-50" style="height:64px;display:flex;align-items:center;">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;gap:24px;max-width:1280px;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;">
      <div style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;"><span style="color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace;">B.</span></div>
      <span style="font-weight:800;font-size:17px;letter-spacing:-0.02em;color:#1A1208;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:4px;flex:1;justify-content:center;" class="hide-mob">
      <a href="/#features" style="font-size:14px;color:rgba(61,46,30,0.55);text-decoration:none;padding:8px 12px;border-radius:8px;">Voordelen</a>
      <a href="/vouchers/" style="font-size:14px;color:rgba(61,46,30,0.55);text-decoration:none;padding:8px 12px;border-radius:8px;">Vouchers</a>
      <a href="/kortingscode/" style="font-size:14px;color:#3D5A3E;font-weight:600;text-decoration:none;padding:8px 12px;border-radius:8px;">Kortingscodes</a>
      <a href="/prijzen/" style="font-size:14px;color:rgba(61,46,30,0.55);text-decoration:none;padding:8px 12px;border-radius:8px;">Prijzen</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
      <a href="https://app.bylder.com" class="hide-mob" style="font-size:13px;font-weight:600;color:rgba(61,46,30,0.5);text-decoration:none;padding:8px 12px;border-radius:8px;">Inloggen</a>
      <a href="/prijzen/" class="cta-btn px-5 py-2.5 rounded-lg text-sm inline-block" style="text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;">Start gratis →</a>
    </div>
  </div>
</nav>"""

FOOTER = """</main>
<div class="warm-divider"></div>
<footer style="padding:48px 0 32px;background:#1A1208;color:rgba(245,240,232,0.8);">
  <div class="container" style="max-width:1280px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
      <div style="width:30px;height:30px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;"><span style="color:#F5F0E8;font-size:12px;font-weight:800;font-family:'Space Mono',monospace;">B.</span></div>
      <span style="font-weight:700;font-size:17px;letter-spacing:-0.02em;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:13px;color:rgba(245,240,232,0.3);max-width:340px;line-height:1.6;margin-bottom:24px;">Kortingscodes voor woon-, interieur- en bouwmerken — voor wie z'n nieuwe woning slim en voordelig afwerkt.</p>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:20px;border-top:1px solid rgba(245,240,232,0.08);">
      <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2026 Bylder Nederland B.V. · KvK 65020006</p>
      <div style="display:flex;gap:16px;">
        <a href="/kortingscode/" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Kortingscodes</a>
        <a href="/privacy/" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Privacy</a>
        <a href="/algemene-voorwaarden/" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Voorwaarden</a>
      </div>
    </div>
  </div>
</footer>
</body>
</html>"""

# ── DATA ────────────────────────────────────────────────────────────────────
def load_data():
    brands = fetch("brands?select=id,slug,name,website,category,subcategory,status,priority&order=name.asc")
    offers = fetch("brand_offers?select=brand_id,discount_label,title,description,verified_at&status=eq.active&order=created_at.asc")
    by_brand = {}
    for o in offers:
        by_brand.setdefault(o["brand_id"], []).append(o)
    for b in brands:
        b["offers"] = by_brand.get(b["id"], [])
    return brands

# ── BRAND PAGE ──────────────────────────────────────────────────────────────
def render_brand(b, siblings):
    name, slug = b["name"], b["slug"]
    offers = b["offers"]
    has = len(offers) > 0
    cat = b.get("category") or "Wonen"
    canonical = f"{BASE}/kortingscode/{slug}/"
    unlock = f"{APP}/kortingscode/{slug}"

    title = f"{name} kortingscode" + (f" — {offers[0]['discount_label']} korting | Bylder" if has else " | Bylder")
    if len(title) > 65 and has:
        title = f"{name} kortingscode {offers[0]['discount_label']} | Bylder"
    desc = (f"Actuele {name} kortingscode: {offers[0]['discount_label']} korting voor je nieuwe woning. Geverifieerd door Bylder — maak gratis een account en ontgrendel de code."
            if has else
            f"{name} kortingscode? Bekijk de actuele status, besparingstips en alternatieven voor je nieuwbouw of verbouwing bij Bylder.")

    if has:
        faq = [
            (f"Hoe krijg ik de {name} kortingscode?", f"Maak gratis een Bylder-account aan, dan wordt de {name}-code direct zichtbaar. Je gebruikt 'm in de webshop of winkel van {name}."),
            (f"Moet ik bij {name} onderhandelen over korting?", f"Nee. Met de {name}-korting via Bylder hoef je niet af te dingen — je krijgt direct een vaste ledenkorting. Veel woonmerken hanteren bewust vaste prijzen; in de winkel is het advies dan ook simpel: er is geen losse korting, behalve via een gratis Bylder-account. Zo bespaar je zeker, zonder het ongemak van onderhandelen."),
            (f"Werkt de {name} code echt?", f"Ja. Bylder-codes komen rechtstreeks van het merk en worden gecontroleerd (laatst geverifieerd op {TODAY_NL}). Werkt een code niet meer? Meld het en we updaten 'm."),
            ("Wat kost een Bylder-account?", "Een account is gratis en ontgrendelt de kortingscodes voor je nieuwe woning. Het uitgebreide lidmaatschap (kopersbegeleiding, offerte-check, meerwerk) is optioneel."),
        ]
    else:
        faq = [
            (f"Is er een {name} kortingscode?", f"Op dit moment heeft Bylder geen actieve {name}-code. We werken samen met steeds meer woonmerken — maak gratis een account en je hoort het zodra er een deal is."),
            (f"Moet ik bij {name} onderhandelen over korting?", f"Onderhandelen levert bij merken met vaste prijzen meestal weinig op. Maak gratis een Bylder-account aan; zodra er een {name}-deal is, krijg je een vaste ledenkorting zonder afdingen."),
            (f"Hoe bespaar ik toch bij {name}?", "Plan je aankopen rond merk-acties, vraag in de showroom naar een nieuwbouw- of projectkorting, en bekijk de alternatieven hieronder in dezelfde categorie."),
        ]

    jsonld = json.dumps({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Bylder", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Kortingscodes", "item": f"{BASE}/kortingscode/"},
            {"@type": "ListItem", "position": 3, "name": name, "item": canonical},
        ]}, ensure_ascii=False)
    jsonld2 = json.dumps({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]
    }, ensure_ascii=False)
    jsonld_block = f'<script type="application/ld+json">{jsonld}</script>\n<script type="application/ld+json">{jsonld2}</script>'

    # offer cards
    if has:
        cards = ""
        for o in offers:
            cards += f"""<div class="card" style="padding:22px;">
  <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
    <span style="font-size:26px;font-weight:800;color:#3D5A3E;">{esc(o['discount_label'])}</span>
    <span style="font-size:15px;font-weight:600;color:#1A1208;">{esc(o.get('title') or (name + ' korting'))}</span>
  </div>
  {f'<p style="font-size:14px;color:rgba(61,46,30,.6);line-height:1.5;margin-top:10px;">{esc(o.get("description"))}</p>' if o.get('description') else ''}
  <a href="{unlock}" class="cta-btn" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;padding:13px 18px;border-radius:10px;font-size:14px;text-decoration:none;"><i class="ph-thin ph-lock-simple"></i> Maak gratis account &amp; toon code</a>
  <p style="font-size:12px;color:rgba(61,46,30,.5);margin-top:14px;">✓ Geverifieerd op {TODAY_NL} · code rechtstreeks van {esc(name)}</p>
</div>"""
        offer_html = f'<div style="display:flex;flex-direction:column;gap:16px;margin-top:28px;">{cards}</div>'
    else:
        offer_html = f"""<div class="card" style="padding:22px;margin-top:28px;">
  <p style="font-size:15px;font-weight:700;margin:0;color:#1A1208;">Nog geen actieve {esc(name)}-code</p>
  <p style="font-size:14px;color:rgba(61,46,30,.6);line-height:1.55;margin-top:8px;">Bylder werkt samen met steeds meer woonmerken. Maak gratis een account en je krijgt bericht zodra er een {esc(name)}-deal is. Tot die tijd: vraag in de showroom naar een nieuwbouw- of projectkorting en bekijk de alternatieven hieronder.</p>
  <a href="{APP}/registreer" class="cta-btn" style="display:inline-block;margin-top:14px;padding:11px 18px;border-radius:10px;font-size:14px;text-decoration:none;">Gratis account aanmaken →</a>
</div>"""

    faq_html = "".join(f'<details class="faq"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in faq)

    # interne links — vergelijkbare merken (broertjes in dezelfde categorie, mét-code eerst)
    sib_html = ""
    if siblings:
        alt_with_code = any(s["offers"] for s in siblings)
        # Op een merk zónder eigen code framen we de alternatieven als aanbeveling.
        if not has and alt_with_code:
            heading = f"Vergelijkbare merken mét korting"
        elif not has:
            heading = f"Vergelijkbare merken in {esc(cat)}"
        else:
            heading = f"Meer in {esc(cat)}"
        cards = "".join(f'<a class="brandcard" href="/kortingscode/{s["slug"]}/"><span style="font-weight:600;font-size:14px;color:#1A1208;">{esc(s["name"])}</span>{"<span style=\'font-size:11px;font-weight:700;color:#3D5A3E;background:rgba(61,90,62,.1);border-radius:999px;padding:3px 9px;\'>code</span>" if s["offers"] else "<span style=\'color:rgba(61,46,30,.4);\'>→</span>"}</a>' for s in siblings)
        sib_html = f"""<section style="margin-top:44px;">
  <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3D5A3E;margin-bottom:14px;">{heading}</h2>
  <div class="grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">{cards}</div>
</section>"""

    body = f"""<div style="padding-top:72px;"><div class="container" style="padding-top:10px;padding-bottom:10px;">
  <nav style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(61,46,30,.4);flex-wrap:wrap;">
    <a href="/" style="color:rgba(61,46,30,.4);text-decoration:none;">Bylder</a> ›
    <a href="/kortingscode/" style="color:rgba(61,46,30,.4);text-decoration:none;">Kortingscodes</a> ›
    <span style="color:#3D5A3E;font-weight:600;">{esc(name)}</span>
  </nav>
</div></div>
<div class="container" style="max-width:720px;padding-bottom:64px;">
  <h1 style="font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;letter-spacing:-0.025em;line-height:1.12;margin:14px 0 0;color:#1A1208;">{esc(name)} kortingscode</h1>
  <p style="font-size:16px;color:rgba(61,46,30,.6);margin-top:14px;line-height:1.55;">{'Bespaar bij ' + esc(name) + ' op de afwerking van je nieuwe woning. Hieronder de actuele, geverifieerde Bylder-korting.' if has else 'Zoek je een ' + esc(name) + ' kortingscode voor je nieuwbouw of verbouwing? Hieronder de actuele status plus tips om toch te besparen.'}</p>
  {offer_html}
  <section style="margin-top:44px;">
    <h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3D5A3E;margin-bottom:8px;">Veelgestelde vragen</h2>
    {faq_html}
  </section>
  {sib_html}
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(61,46,30,.1);">
    <a href="/kortingscode/" style="font-size:14px;color:#3D5A3E;font-weight:600;text-decoration:none;">← Alle kortingscodes</a>
  </div>
</div>"""
    return head(title, desc, canonical, jsonld_block) + body + FOOTER

# ── HUB PAGE ────────────────────────────────────────────────────────────────
def render_hub(brands):
    canonical = f"{BASE}/kortingscode/"
    with_deal = [b for b in brands if b["offers"]]
    by_cat = {}
    for b in brands:
        by_cat.setdefault(b.get("category") or "Overig", []).append(b)
    # Op aantal aflopend, maar "Overig" altijd onderaan.
    cats = sorted(by_cat.items(), key=lambda kv: (kv[0] == "Overig", -len(kv[1])))

    title = "Kortingscodes voor je nieuwe woning — merken & winkels | Bylder"
    desc = f"Actuele kortingscodes voor {len(brands)}+ woon-, interieur- en bouwmerken. Van schakelaars tot keukens en meubels — bespaar op de afwerking van je nieuwbouw of verbouwing met Bylder."
    jsonld_block = '<script type="application/ld+json">' + json.dumps({
        "@context": "https://schema.org", "@type": "CollectionPage", "name": "Kortingscodes voor je nieuwe woning",
        "description": desc, "url": canonical, "isPartOf": {"@type": "WebSite", "name": "Bylder", "url": BASE}
    }, ensure_ascii=False) + '</script>'

    sections = ""
    for cat, lst in cats:
        cards = "".join(f'<a class="brandcard" href="/kortingscode/{b["slug"]}/"><span style="font-weight:600;font-size:15px;color:#1A1208;">{esc(b["name"])}</span>{"<span style=\'font-size:11px;font-weight:700;color:#3D5A3E;background:rgba(61,90,62,.1);border-radius:999px;padding:3px 9px;\'>code</span>" if b["offers"] else "<span style=\'font-size:16px;color:rgba(61,46,30,.4);\'>→</span>"}</a>' for b in sorted(lst, key=lambda x: x["name"].lower()))
        sections += f"""<section style="margin-top:44px;">
  <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#3D5A3E;margin:0 0 16px;">{esc(cat)} <span style="color:rgba(61,46,30,.45);font-weight:500;">({len(lst)})</span></h2>
  <div class="grid-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">{cards}</div>
</section>"""

    def stat(n, l): return f'<div><div style="font-size:28px;font-weight:800;color:#3D5A3E;line-height:1;">{n}</div><div style="font-size:12px;color:rgba(61,46,30,.55);margin-top:4px;">{l}</div></div>'

    body = f"""<div style="padding-top:72px;"><div class="container" style="padding-top:10px;padding-bottom:10px;max-width:1000px;">
  <nav style="font-size:12px;color:rgba(61,46,30,.4);"><a href="/" style="color:rgba(61,46,30,.4);text-decoration:none;">Bylder</a> › <span style="color:#3D5A3E;font-weight:600;">Kortingscodes</span></nav>
</div></div>
<div class="container" style="max-width:1000px;padding-bottom:72px;">
  <h1 style="font-size:clamp(1.9rem,4vw,2.8rem);font-weight:800;letter-spacing:-0.025em;line-height:1.1;margin:8px 0 0;color:#1A1208;">Kortingscodes voor je nieuwe woning</h1>
  <p style="font-size:17px;color:rgba(61,46,30,.6);max-width:640px;margin-top:16px;line-height:1.55;">Bespaar op de afwerking van je nieuwbouw of verbouwing. Bylder verzamelt kortingen bij {len(brands)}+ woon-, interieur- en bouwmerken — van schakelaars en sanitair tot keukens en meubels. Maak gratis een account en ontgrendel de codes.</p>
  <div style="display:flex;gap:32px;margin-top:24px;flex-wrap:wrap;">{stat(len(with_deal),'merken met actieve code')}{stat(len(brands),'merken in de gids')}{stat(len(cats),'categorieën')}</div>
  {sections}
</div>"""
    return head(title, desc, canonical, jsonld_block) + body + FOOTER

# ── SITEMAP ─────────────────────────────────────────────────────────────────
def write_sitemap(brands):
    urls = [f"{BASE}/kortingscode/"] + [f"{BASE}/kortingscode/{b['slug']}/" for b in brands]
    items = "".join(f"  <url><loc>{xesc(u)}</loc><lastmod>{TODAY.isoformat()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n" for u in urls)
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'
    (OUT / "kortingscode-sitemap.xml").write_text(xml, encoding="utf-8")
    return len(urls)

# ── MAIN ────────────────────────────────────────────────────────────────────
def main():
    brands = load_data()
    print(f"[OK] {len(brands)} merken, {sum(1 for b in brands if b['offers'])} met actieve code")
    (OUT / "kortingscode").mkdir(exist_ok=True)
    (OUT / "kortingscode" / "index.html").write_text(render_hub(brands), encoding="utf-8")

    by_cat = {}
    for b in brands:
        by_cat.setdefault(b.get("category") or "Overig", []).append(b)

    for b in brands:
        # Vergelijkbare merken, met-code eerst (zo bevelen we op een code-loze pagina alternatieven mét korting aan).
        siblings = sorted(
            [s for s in by_cat[b.get("category") or "Overig"] if s["slug"] != b["slug"]],
            key=lambda s: (not bool(s["offers"]), s["name"].lower()),
        )[:8]
        d = OUT / "kortingscode" / b["slug"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(render_brand(b, siblings), encoding="utf-8")

    n = write_sitemap(brands)
    print(f"[OK] hub + {len(brands)} merkpagina's + sitemap ({n} URL's) geschreven naar ./kortingscode/")

if __name__ == "__main__":
    main()
