#!/usr/bin/env python3
"""
Genereer de prefab-contenthubs (/aanbouw/, /dakopbouw/, /bijgebouw/) als statische
pillar-pagina's — Bylder-tegenhanger van prefabmaat.com's productpagina's, maar vanuit
het onafhankelijke vergelijk/offerte-check-model i.p.v. als fabrikant.

Gedeelde shell (nav/CSS/footer) identiek aan /voor-vakbedrijven/ en /installatiepartner-worden/.
Body per categorie is BEWUST onderscheidend (andere vergunningregels, prijzen, gebruik) → geen
near-duplicate. Volledige SEO/GEO/AEO/schema/E-E-A-T/CRO/a11y ingebakken.

Draai: python3 scripts/generate_prefab_hubs.py
"""
import html as _html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://www.bylder.com"

# ---------------------------------------------------------------- shared shell

NAV = '''<nav aria-label="Hoofdnavigatie" class="glass-nav">
  <div class="nav-inner">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div class="nav-links">
      <a href="/#features">Voordelen</a>
      <a href="/vouchers/">Vouchers</a>
      <a href="/functies/">Functies</a>
      <div class="nav-dd">
        <button class="nav-dd-btn" type="button">Voor wie? <span style="font-size:10px;">&#9660;</span></button>
        <div class="nav-dd-menu">
          <a href="/nieuwbouw-koper/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Nieuwbouwkoper</strong><span style="font-size:11px;color:rgba(61,46,30,0.72);">Meerwerklijst, vouchers, planning</span></a>
          <a href="/bestaande-bouw/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Bestaande bouw koper</strong><span style="font-size:11px;color:rgba(61,46,30,0.72);">Offerte-check, aannemer matching</span></a>
          <a href="/renovatie/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Renovatiewoning</strong><span style="font-size:11px;color:rgba(61,46,30,0.72);">Budgettool, subsidies, planning</span></a>
          <a href="/voor-vakbedrijven/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Vakbedrijf</strong><span style="font-size:11px;color:rgba(61,46,30,0.72);">Profiel activeren, leads via kopers</span></a>
        </div>
      </div>
      <a href="/prijzen/">Prijzen</a>
    </div>
    <div class="nav-right">
      <a href="https://app.bylder.com" class="nav-login">Inloggen</a>
      <a href="https://app.bylder.com/registreer" class="nav-cta">Start gratis &#8594;</a>
      <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false" onclick="var m=document.getElementById('navMobile');this.setAttribute('aria-expanded',m.classList.toggle('open'));"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-mobile" id="navMobile">
    <a href="/#features">Voordelen</a>
    <a href="/vouchers/">Vouchers</a>
    <a href="/functies/">Functies</a>
    <a href="/nieuwbouw-koper/">Voor nieuwbouwkopers</a>
    <a href="/bestaande-bouw/">Voor bestaande bouw</a>
    <a href="/voor-vakbedrijven/">Voor vakbedrijven</a>
    <a href="/prijzen/">Prijzen</a>
    <a href="https://app.bylder.com">Inloggen</a>
    <a href="https://app.bylder.com/registreer" class="m-cta">Start gratis &#8594;</a>
  </div>
</nav>'''

STYLE = '''<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.7;}
h1,h2,h3{letter-spacing:-0.02em;color:#1A1208;}
a{color:#3D5A3E;}
.container{max-width:1180px;margin:0 auto;padding:0 48px;}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.card{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:22px;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.highlight{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;font-size:15px;color:rgba(61,46,30,0.85);line-height:1.7;}
.faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}
.faq-item h3{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}
.faq-item p{font-size:14px;color:rgba(61,46,30,0.82);line-height:1.7;}
.prose p{font-size:15.5px;color:rgba(61,46,30,0.85);line-height:1.75;margin-bottom:14px;}
.prose h2{font-size:1.5rem;font-weight:800;margin:40px 0 14px;}
.prose h3{font-size:1.05rem;font-weight:700;margin:22px 0 8px;color:#1A1208;}
.check-list{list-style:none;display:flex;flex-direction:column;gap:11px;margin:14px 0;}
.check-list li{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;color:rgba(61,46,30,0.85);}
.check-list li::before{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}
.ptable{width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;overflow:hidden;font-size:14.5px;margin:16px 0;}
.ptable th{text-align:left;background:rgba(61,90,62,0.07);padding:13px 16px;font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.05em;color:rgba(61,46,30,0.7);}
.ptable td{padding:13px 16px;border-top:1px solid rgba(61,46,30,0.07);vertical-align:top;color:rgba(61,46,30,0.85);}
.ptable td.price{font-weight:800;color:#1A1208;white-space:nowrap;}
.tile{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;padding:14px 16px;transition:border-color .15s;font-size:14px;font-weight:600;}
.tile:hover{border-color:rgba(61,90,62,0.4);}
.tile small{display:block;font-weight:400;color:rgba(61,46,30,0.72);margin-top:3px;font-size:12.5px;}
.cta-primary{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}
@media(max-width:768px){.container{padding:0 20px;}.grid-2,.grid-3{grid-template-columns:1fr;}}

.glass-nav{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links>a{font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;}
.nav-links>a:hover{color:#1A1208;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-login{font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;}
.nav-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
.nav-burger span{width:22px;height:2px;background:#1A1208;border-radius:2px;display:block;}
.nav-mobile{display:none;flex-direction:column;gap:2px;padding:10px 20px 18px;background:rgba(245,240,232,0.98);border-bottom:1px solid rgba(61,46,30,0.08);}
.nav-mobile.open{display:flex;}
.nav-mobile a{padding:11px 10px;color:rgba(61,46,30,0.75);text-decoration:none;font-size:15px;border-radius:8px;}
.nav-mobile .m-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;text-align:center;margin-top:8px;}
.nav-dd{position:relative;}
.nav-dd-btn{background:none;border:none;cursor:pointer;font-size:14px;color:rgba(61,46,30,0.72);font-family:inherit;padding:0;display:flex;align-items:center;gap:4px;}
.nav-dd-menu{display:none;position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);padding:8px;min-width:248px;z-index:200;}
.nav-dd:hover .nav-dd-menu,.nav-dd:focus-within .nav-dd-menu{display:block;}
.nav-dd-menu a{display:block;padding:10px 14px;border-radius:10px;color:#3D2E1E;text-decoration:none;}
.nav-dd-menu a:hover{background:#F5F0E8;}
@media(max-width:860px){.nav-links,.nav-login{display:none;}.nav-burger{display:flex;}.nav-inner{padding:14px 20px;}}
/*a11y-focus*/:focus-visible{outline:3px solid #3D5A3E!important;outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}</style>'''

FOOTER = '''<footer style="background:#1A1208;padding:56px 0;">
  <div style="max-width:1180px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:30px;height:30px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:12px;">B.</div>
      <span style="font-weight:700;font-size:16px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.5);max-width:640px;line-height:1.6;">Prijzen zijn indicatieve marktbandbreedtes (NL 2026) en verschillen per project, afmeting, constructie, regio en afwerking &mdash; geen offerte. Vergunningregels vatten de landelijke hoofdlijn samen; je gemeente en omgevingsplan zijn leidend. Bylder is een onafhankelijk platform en zelf geen prefab-fabrikant of bouwbedrijf.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.55);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer>'''


def esc(s):
    return _html.escape(s, quote=True)


def faq_ldjson(faqs):
    return json.dumps({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q,
                        "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]
    }, ensure_ascii=False)


def breadcrumb_ldjson(label, path):
    return json.dumps({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Bylder.com", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": label, "item": f"{BASE}/{path}/"},
        ]}, ensure_ascii=False)


def article_ldjson(title, desc, path):
    return json.dumps({
        "@context": "https://schema.org", "@type": "Article",
        "headline": title, "description": desc,
        "author": {"@type": "Organization", "name": "Bylder Nederland B.V.", "url": BASE + "/"},
        "publisher": {"@type": "Organization", "name": "Bylder.com", "url": BASE + "/"},
        "datePublished": "2026-07-10", "dateModified": "2026-07-10",
        "mainEntityOfPage": f"{BASE}/{path}/", "inLanguage": "nl-NL"}, ensure_ascii=False)


def render(cfg):
    faqs = cfg["faqs"]
    faq_html = "".join(
        f'<div class="faq-item"><h3>{esc(q)}</h3><p>{a}</p></div>' for q, a in faqs)
    tiles = "".join(
        f'<a class="tile" href="{href}">{label}<small>{sub}</small></a>'
        for href, label, sub in cfg["related"])
    price_rows = "".join(
        f'<tr><td>{r[0]}</td><td class="price">{r[1]}</td><td>{r[2]}</td></tr>'
        for r in cfg["prices"])

    doc = f'''<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{esc(cfg["title"])}</title>
<meta name="description" content="{esc(cfg["desc"])}">
<link rel="canonical" href="{BASE}/{cfg["path"]}/">
<meta name="author" content="Bylder Nederland B.V.">
<meta property="og:type" content="article"><meta property="og:title" content="{esc(cfg["title"])}"><meta property="og:description" content="{esc(cfg["desc"])}"><meta property="og:url" content="{BASE}/{cfg["path"]}/">
<meta name="robots" content="index,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<script type="application/ld+json">{faq_ldjson(faqs)}</script>
<script type="application/ld+json">{breadcrumb_ldjson(cfg["crumb"], cfg["path"])}</script>
<script type="application/ld+json">{article_ldjson(cfg["title"], cfg["desc"], cfg["path"])}</script>
{STYLE}</head>
<body>{NAV}<main style="padding:56px 0 20px;"><div class="container" style="max-width:1000px;">
  <div style="max-width:820px;">
    <nav aria-label="Kruimelpad" style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:14px;"><a href="/">Bylder.com</a> &rarr; {esc(cfg["crumb"])}</nav>
    <div class="badge">{esc(cfg["badge"])}</div>
    <h1 style="font-size:2.5rem;font-weight:800;line-height:1.14;margin-bottom:16px;">{cfg["h1"]}</h1>
    <p style="font-size:1.12rem;color:#1A1208;line-height:1.6;margin-bottom:14px;font-weight:600;">{cfg["tldr"]}</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
      <a href="{cfg["cta_href"]}" style="background:#B85C38;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">{cfg["cta_label"]} &#8594;</a>
      <a href="#kosten" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Bekijk de kosten</a>
    </div>
  </div>
  <div class="divider"></div>
  <div class="prose">
  {cfg["body"]}
  </div>

  <h2 id="prijstabel" style="font-size:1.5rem;font-weight:800;margin:40px 0 6px;">{esc(cfg["price_h"])}</h2>
  <p style="font-size:14px;color:rgba(61,46,30,0.7);margin-bottom:6px;">Indicatieve marktbandbreedtes (NL 2026). Je eigen offerte check je gratis tegen actuele data.</p>
  <table class="ptable"><thead><tr><th>Onderdeel</th><th>Richtprijs</th><th>Toelichting</th></tr></thead><tbody>{price_rows}</tbody></table>

  <div style="background:rgba(61,90,62,0.06);border:1px solid rgba(61,90,62,0.18);border-radius:16px;padding:26px;margin:40px 0;">
    <h2 style="font-size:1.35rem;font-weight:800;margin-bottom:8px;">Betaal je een eerlijke prijs?</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.85);line-height:1.7;margin-bottom:16px;max-width:640px;">Bylder is onafhankelijk: geen fabrikant, geen leadveiling. Je vergelijkt bedrijven neutraal en checkt je offerte gratis tegen actuele marktdata &mdash; met gemiddeld <strong>&euro;1.640</strong> besparing per gecontroleerde offerte.</p>
    <a href="{cfg["cta_href"]}" style="display:inline-block;background:#3D5A3E;color:#F5F0E8;padding:13px 26px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">{cfg["cta_label"]} &#8594;</a>
  </div>

  <h2 style="font-size:1.5rem;font-weight:800;margin:40px 0 14px;">Veelgestelde vragen over {esc(cfg["faq_topic"])}</h2>
  {faq_html}

  <div style="background:#F5F0E8;border:1px solid rgba(61,46,30,0.12);border-radius:16px;padding:24px;margin:36px 0;">
    <div style="font-weight:800;font-size:1.05rem;color:#1A1208;margin-bottom:6px;">Ben je zelf een bouwbedrijf?</div>
    <p style="font-size:14.5px;color:rgba(61,46,30,0.82);line-height:1.7;margin-bottom:14px;max-width:640px;">Prefab-producenten zoeken lokale bouwbedrijven om {esc(cfg["installer_work"])} op locatie te plaatsen. Sta je op Bylder, dan kun je jezelf als installatiepartner beschikbaar stellen.</p>
    <a href="/installatiepartner-worden/" style="font-weight:700;color:#3D5A3E;text-decoration:none;">Word installatiepartner &#8594;</a>
  </div>

  <div class="divider"></div>
  <h2 style="font-size:1.3rem;font-weight:800;margin:8px 0 14px;">Verder lezen</h2>
  <div class="grid-3">{tiles}</div>
  <p style="font-size:12px;color:rgba(61,46,30,0.72);margin-top:22px;">Bijgewerkt: juli 2026 &middot; Bylder Nederland B.V. &middot; Vragen? <a href="mailto:hallo@bylder.com">hallo@bylder.com</a></p>
  </div></main>{FOOTER}</body></html>'''
    return doc


# ---------------------------------------------------------------- per-category content

AANBOUW = {
    "path": "aanbouw", "crumb": "Prefab aanbouw", "badge": "Aanbouw &amp; uitbouw",
    "title": "Prefab aanbouw: kosten, vergunning en aanpak | Bylder",
    "desc": "Wat kost een prefab aanbouw of uitbouw? Marktprijzen per m², wanneer het vergunningvrij is en waar je op let bij offertes. Onafhankelijk van Bylder.",
    "h1": "Prefab aanbouw &amp; uitbouw: kosten, vergunning en aanpak",
    "tldr": "Een prefab aanbouw wordt in een fabriek gemaakt en in delen op locatie geplaatst &mdash; vaak binnen een dag. Reken op &euro;1.200&ndash;&euro;2.800+ per m². In het achtererfgebied is een aanbouw vaak vergunningvrij, binnen grenzen.",
    "cta_href": "/offerte-check/aannemer/", "cta_label": "Check je aanbouw-offerte",
    "faq_topic": "prefab aanbouw", "installer_work": "aanbouwen en uitbouwen",
    "faqs": [
        ("Wat kost een prefab aanbouw per m²?",
         "Reken indicatief op &euro;1.200&ndash;&euro;2.800+ per m² (NL 2026), afhankelijk van afwerkniveau, de hoeveelheid glas en de fundering. Een aanbouw van ~20 m² komt daarmee doorgaans tussen &euro;25.000 en &euro;55.000 uit."),
        ("Is een prefab aanbouw goedkoper dan traditioneel bouwen?",
         "Niet per se in materiaalprijs, wel vaak in totaal: door de kortere bouwtijd, minder faalkosten en een vaste prijs vooraf zijn de totale kosten beter voorspelbaar dan bij in het werk metselen."),
        ("Heb ik een vergunning nodig voor een aanbouw?",
         "In het achtererfgebied is een aanbouw vaak vergunningvrij binnen de landelijke grenzen voor diepte, oppervlakte en hoogte. Aan de voor- of zijkant, of bij een monument, is vrijwel altijd een omgevingsvergunning nodig. Zie onze pagina aanbouw &amp; vergunning."),
        ("Hoe lang duurt het plaatsen van een prefab aanbouw?",
         "De plaatsing zelf gebeurt bij een standaard aanbouw vaak binnen een dag, nadat de fundering is voorbereid. De hele doorlooptijd van akkoord tot plaatsing ligt doorgaans rond enkele weken."),
        ("Kan ik tijdens de bouw in mijn huis blijven wonen?",
         "Meestal wel. Omdat het meeste werk in de fabriek gebeurt, is de overlast op locatie kort. Alleen bij het doorbreken van de bestaande gevel is er tijdelijk meer hinder."),
    ],
    "price_h": "Wat kost een aanbouw of uitbouw?",
    "prices": [
        ("Prefab aanbouw (per m²)", "&euro;1.200&ndash;&euro;2.800+", "Casco tot compleet afgewerkt; hoger bij veel glas of maatwerk."),
        ("Aanbouw ~20 m² (totaal)", "&euro;25.000&ndash;&euro;55.000", "Inclusief plaatsing en afwerking; sterk afhankelijk van afwerkniveau."),
        ("Uitbouw keuken ~12 m²", "&euro;16.000&ndash;&euro;34.000", "Vaak met pui of lichtstraat; die bepalen een groot deel van de prijs."),
        ("Fundering / aansluiting", "&euro;3.000&ndash;&euro;9.000", "Grondwerk en aansluiten op de bestaande woning, per situatie."),
    ],
    "related": [
        ("/bouwvergunning/aanbouw/", "Aanbouw: vergunning?", "Wanneer vergunningvrij, wanneer niet"),
        ("/bouwvergunning/uitbouw/", "Uitbouw: vergunning?", "Regels voor de uitbouw"),
        ("/dakopbouw/", "Prefab dakopbouw", "Een extra verdieping i.p.v. aanbouw"),
        ("/bijgebouw/", "Prefab bijgebouw", "Losstaand in de tuin"),
        ("/offerte-check/aannemer/", "Aannemer vergelijken", "Neutraal, met marktprijs ernaast"),
        ("/eerlijke-prijzen/", "Eerlijke prijzen", "Hoe Bylder je offerte checkt"),
    ],
    "body": '''
    <h2 id="wat">Wat is een prefab aanbouw?</h2>
    <p>Een aanbouw voegt ruimte toe aan je woning: een grotere keuken, een extra kamer of een serre-achtige leefruimte. <em>Prefab</em> betekent dat de wanden, het dak en de kozijnen in een fabriek worden gemaakt en als grote elementen naar je woning komen. Op locatie worden ze in korte tijd samengezet &mdash; bij een standaard aanbouw vaak binnen een dag, na de voorbereiding van de fundering.</p>
    <p>Het verschil met een <strong>uitbouw</strong> is klein: een uitbouw is meestal een verlenging van een bestaande ruimte aan de achterkant, een aanbouw kan ook een losser aangehecht volume zijn. Voor kosten en vergunning gelden vrijwel dezelfde regels, dus we behandelen ze hier samen.</p>

    <h2 id="kosten">Wat bepaalt de prijs?</h2>
    <p>De prijs per vierkante meter loopt sterk uiteen omdat "een aanbouw" alles kan zijn van een casco doos tot een volledig afgewerkte leefkeuken met vloerverwarming en een schuifpui van vier meter. De grootste kostenposten zijn doorgaans: de hoeveelheid glas (puien en lichtstraten), het afwerkniveau binnen, de fundering en de aansluiting op de bestaande woning.</p>
    <ul class="check-list">
      <li>Meer glas = hogere prijs: een schuifpui of lichtstraat is een van de duurste onderdelen.</li>
      <li>Casco of compleet: casco laten plaatsen en zelf afwerken drukt de prijs, maar vraagt eigen regie.</li>
      <li>Fundering: de staat van de grond en de afstand tot leidingen bepalen het grondwerk.</li>
      <li>Aansluiting: het doorbreken en netjes aanhelen van de bestaande gevel is maatwerk.</li>
    </ul>

    <h2 id="vergunning">Heb je een vergunning nodig?</h2>
    <p>In het <strong>achtererfgebied</strong> is een aanbouw vaak vergunningvrij, zolang je binnen de landelijke grenzen voor diepte, oppervlakte en hoogte blijft en de aanbouw past in het omgevingsplan van je gemeente. Aan de voor- of zijkant, of bij een monument of beschermd stadsgezicht, is vrijwel altijd een omgevingsvergunning nodig. "Vergunningvrij" betekent overigens niet "regelvrij": het Besluit bouwwerken leefomgeving en de constructie-eisen blijven gelden.</p>
    <div class="highlight">Twijfel je? Op onze pagina <a href="/bouwvergunning/aanbouw/">aanbouw &amp; vergunning</a> staat wanneer je vergunningvrij mag bouwen en wanneer niet &mdash; met de regels voor het achtererfgebied en de uitzonderingen.</div>

    <h2 id="hoe">Hoe verloopt een prefab-aanbouwproject?</h2>
    <p>Een prefab-traject volgt grofweg vijf stappen: ontwerp en offerte, een technische en constructieve toets, inmeten op locatie, productie in de fabriek en tot slot de plaatsing. Doordat de productie in een geconditioneerde fabriek gebeurt, is er minder weersafhankelijkheid en zijn de bouwtijd op locatie en de overlast korter dan bij traditioneel metselwerk. De doorlooptijd van akkoord tot plaatsing ligt bij de meeste aanbieders rond enkele weken.</p>

    <h2 id="prefab-vs-traditioneel">Prefab of traditioneel bouwen?</h2>
    <p>Prefab wint op snelheid, voorspelbaarheid en overlast: kortere bouwtijd, een vaste prijs vooraf en minder wekenlange bouwput. Traditioneel (gemetseld, in het werk gebouwd) geeft meer vrijheid in bijzondere vormen en sluit soms visueel strakker aan op een bestaande gemetselde woning. Voor de meeste rechthoekige aan- en uitbouwen is prefab inmiddels de snellere en beter te plannen route; bij grillige vormen of hoge esthetische eisen aan de gevel kan traditioneel alsnog passen.</p>

    <h2 id="offerte">Waar let je op bij een offerte?</h2>
    <p>Let op of de prijs echt compleet is: staan fundering, aansluiting op de woning, afwerking en het afvoeren van grond erin, of zijn dat losse posten? Een lage "vanaf"-prijs zegt weinig zonder die onderdelen. Vergelijk minstens drie bedrijven op een gespecificeerde offerte in plaats van op één totaalbedrag &mdash; en zet de marktprijs ernaast.</p>
    ''',
}

DAKOPBOUW = {
    "path": "dakopbouw", "crumb": "Prefab dakopbouw", "badge": "Dakopbouw",
    "title": "Prefab dakopbouw: kosten, vergunning en constructie | Bylder",
    "desc": "Wat kost een prefab dakopbouw en waarom is die vrijwel altijd vergunningplichtig? Marktprijzen per m², constructie-eisen en plaatsing in één dag.",
    "h1": "Prefab dakopbouw: kosten, vergunning en constructie",
    "tldr": "Een dakopbouw voegt een hele verdieping toe door het dak op te toppen. Prefab wordt vaak in een dag geplaatst. Reken indicatief op &euro;1.700&ndash;&euro;2.800 per m² &mdash; en houd er rekening mee dat een dakopbouw vrijwel nooit vergunningvrij is.",
    "cta_href": "/offerte-check/aannemer/", "cta_label": "Check je dakopbouw-offerte",
    "faq_topic": "prefab dakopbouw", "installer_work": "dakopbouwen",
    "faqs": [
        ("Wat kost een prefab dakopbouw?",
         "Indicatief &euro;1.700&ndash;&euro;2.800 per m² vloeroppervlak van de nieuwe verdieping (NL 2026). Een volledige dakopbouw komt daarmee doorgaans tussen &euro;25.000 en &euro;60.000 uit, afhankelijk van breedte, constructie en afwerking."),
        ("Is een dakopbouw vergunningvrij?",
         "Vrijwel nooit. Een dakopbouw verandert de hoogte en het silhouet van de woning en is daarom bijna altijd vergunningplichtig, met toetsing aan de maximale bouwhoogte en vaak welstand. Een constructieberekening is verplicht."),
        ("Kan mijn woning een extra verdieping dragen?",
         "Dat hangt af van de bestaande constructie. Bij een dakopbouw is een constructieve haalbaarheidstoets de eerste stap; soms is versterking van de draagconstructie nodig, wat een aparte kostenpost is."),
        ("Hoe lang duurt de plaatsing?",
         "De prefab-opbouw wordt vaak binnen één dag geplaatst en waterdicht gemaakt, nadat het bestaande dak deels is verwijderd. De totale doorlooptijd inclusief vergunning ligt hoger, doorgaans enkele maanden."),
        ("Dakopbouw of dakkapel &mdash; wat kies ik?",
         "Een dakkapel brengt alleen een deel van het dakvlak naar buiten en geeft beperkt extra ruimte; een dakopbouw voegt een hele verdieping toe. Een dakopbouw is groter, duurder en vrijwel altijd vergunningplichtig."),
    ],
    "price_h": "Wat kost een dakopbouw?",
    "prices": [
        ("Prefab dakopbouw (per m²)", "&euro;1.700&ndash;&euro;2.800", "Vloeroppervlak van de nieuwe verdieping; incl. plaatsing."),
        ("Volledige dakopbouw (totaal)", "&euro;25.000&ndash;&euro;60.000", "Hele extra bouwlaag; sterk afhankelijk van breedte en afwerking."),
        ("Constructieve versterking", "&euro;2.000&ndash;&euro;8.000", "Als de bestaande draagconstructie moet worden verzwaard."),
        ("Vergunning &amp; constructieberekening", "&euro;1.000&ndash;&euro;4.000", "Leges, constructieberekening en eventueel welstand."),
    ],
    "related": [
        ("/bouwvergunning/dakopbouw/", "Dakopbouw: vergunning?", "Waarom vrijwel altijd nodig"),
        ("/bouwvergunning/dakkapel/", "Dakkapel: vergunning?", "Kleiner alternatief op het dak"),
        ("/aanbouw/", "Prefab aanbouw", "Ruimte op de begane grond"),
        ("/dakkapel/", "Dakkapelspecialisten", "Vergelijk bedrijven per plaats"),
        ("/offerte-check/aannemer/", "Aannemer vergelijken", "Neutraal, met marktprijs ernaast"),
        ("/eerlijke-prijzen/", "Eerlijke prijzen", "Hoe Bylder je offerte checkt"),
    ],
    "body": '''
    <h2 id="wat">Wat is een dakopbouw?</h2>
    <p>Een dakopbouw voegt een volledige bouwlaag toe: je "topt" het bestaande dak op met een nieuwe verdieping, of vervangt een schuin dak door een rechte extra laag. Het is de grootste van de dakingrepen &mdash; groter dan een <a href="/dakkapel/">dakkapel</a>, die alleen een stuk van het dakvlak naar buiten brengt. Prefab betekent hier dat de complete opbouw als elementen wordt aangeleverd en in korte tijd op de bestaande woning wordt gezet, vaak binnen een dag gesloten en waterdicht.</p>

    <h2 id="kosten">Wat bepaalt de prijs?</h2>
    <p>Bij een dakopbouw zit de prijs niet alleen in de nieuwe verdieping zelf, maar ook in wat eronder gebeurt. De bestaande woning moet het extra gewicht dragen; soms is versterking van de constructie nodig. Daarnaast bepalen de breedte, het aantal kozijnen, de trapaansluiting naar de nieuwe verdieping en het afwerkniveau de eindprijs.</p>
    <ul class="check-list">
      <li>Draagkracht: kan de bestaande constructie de extra laag aan, of is verzwaring nodig?</li>
      <li>Trap en indeling: een nieuwe verdieping vraagt een trap en soms aanpassing van de laag eronder.</li>
      <li>Breedte en kozijnen: hoe breder en hoe meer glas, hoe hoger de prijs.</li>
      <li>Vergunning en berekening: bij een dakopbouw vrijwel altijd een kostenpost (zie hieronder).</li>
    </ul>

    <h2 id="vergunning">Vergunning: vrijwel altijd nodig</h2>
    <p>Anders dan bij een aanbouw is een dakopbouw <strong>vrijwel nooit vergunningvrij</strong>. Je verandert de hoogte en het silhouet van de woning, en dat raakt het straatbeeld. In de praktijk betekent dit bijna altijd een omgevingsvergunning, een toets aan de maximale bouwhoogte in het omgevingsplan en vaak een welstandstoets. Een constructieberekening is essentieel. Reken hier dus zowel op doorlooptijd als op leges &mdash; het is geen formaliteit.</p>
    <div class="highlight">Op <a href="/bouwvergunning/dakopbouw/">dakopbouw &amp; vergunning</a> lees je precies waarom een dakopbouw vrijwel altijd vergunningplichtig is en welke toetsen erbij horen.</div>

    <h2 id="hoe">Hoe verloopt een prefab-dakopbouw?</h2>
    <p>Het traject start met ontwerp en een constructieve haalbaarheidstoets, omdat de draagkracht van de bestaande woning bepalend is. Daarna volgt het inmeten, de vergunningaanvraag, de productie in de fabriek en de plaatsing. Op de plaatsingsdag wordt vaak het bestaande dak (deels) verwijderd en de nieuwe opbouw in delen gehesen en gesloten &mdash; een korte, intensieve dag waarop het huis tijdelijk open is. Juist daarom is een strakke voorbereiding belangrijk.</p>

    <h2 id="prefab-vs-traditioneel">Prefab of traditioneel?</h2>
    <p>De grote winst van prefab bij een dakopbouw is de tijd dat je woning "open" ligt: bij traditioneel optoppen ben je wekenlang afhankelijk van het weer, bij prefab is dat vaak teruggebracht tot één plaatsingsdag. Dat scheelt overlast en risico op waterschade. Traditioneel bouwen kan meer maatwerk geven bij ongebruikelijke daken of aansluitingen. Voor de meeste rijtjes- en twee-onder-een-kapwoningen is prefab de snellere en voorspelbaardere route.</p>

    <h2 id="offerte">Waar let je op bij een offerte?</h2>
    <p>Vraag expliciet of de constructieve versterking, de vergunning en de constructieberekening in de prijs zitten &mdash; dat zijn bij een dakopbouw de posten waarop offertes het meest verschillen. Vergelijk minstens drie bedrijven op een gespecificeerde offerte, niet op een "vanaf"-bedrag, en check de prijs tegen de markt.</p>
    ''',
}

BIJGEBOUW = {
    "path": "bijgebouw", "crumb": "Prefab bijgebouw", "badge": "Bijgebouw",
    "title": "Prefab bijgebouw: kosten, vergunning en gebruik | Bylder",
    "desc": "Wat kost een prefab bijgebouw en wanneer is het vergunningvrij? De 70 m²-regel, gebruik als tuinkantoor of mantelzorgwoning en marktprijzen per m².",
    "h1": "Prefab bijgebouw: kosten, vergunning en gebruik",
    "tldr": "Een bijgebouw is een losstaand gebouw in de tuin &mdash; kantoor, hobbyruimte, mantelzorgwoning of berging. In het achtererfgebied mag je vaak tot 70 m² vergunningvrij bouwen. Reken indicatief op &euro;1.500&ndash;&euro;3.500 per m².",
    "cta_href": "/offerte-check/aannemer/", "cta_label": "Check je bijgebouw-offerte",
    "faq_topic": "prefab bijgebouw", "installer_work": "bijgebouwen",
    "faqs": [
        ("Wat kost een prefab bijgebouw?",
         "Indicatief &euro;1.500&ndash;&euro;3.500 per m² (NL 2026), sterk afhankelijk van het gebruik. Een geïsoleerd tuinkantoor van ~15 m² ligt rond &euro;22.000&ndash;&euro;50.000; een volwaardige mantelzorgwoning met keuken en badkamer loopt op tot &euro;100.000 of meer."),
        ("Hoeveel m² bijgebouw mag ik vergunningvrij bouwen?",
         "In het achtererfgebied vaak tot maximaal 70 m², afhankelijk van de grootte van je perceel en binnen de landelijke voorwaarden voor hoogte en gebruik. Boven die grens of aan de voorkant is doorgaans een vergunning nodig."),
        ("Mag ik in een vergunningvrij bijgebouw wonen?",
         "Niet automatisch. Vergunningvrij bouwen betekent niet dat permanente bewoning is toegestaan &mdash; daarvoor is het bestemmingsplan/omgevingsplan leidend. Voor een mantelzorgwoning gelden aparte regels."),
        ("Waarvoor wordt een bijgebouw meestal gebruikt?",
         "De meest gevraagde toepassingen zijn een tuinkantoor om thuis te werken, een mantelzorgwoning voor een familielid, en een hobby- of logeerruimte. Omdat het los staat, is het gebruik later relatief eenvoudig te wijzigen."),
        ("Wat is het verschil met een aanbouw?",
         "Een aanbouw zit vast aan de woning en vergroot een bestaande ruimte; een bijgebouw staat los in de tuin met eigen wanden en dak. Een bijgebouw houdt scheiding tussen woning en nieuwe ruimte, een aanbouw juist niet."),
    ],
    "price_h": "Wat kost een bijgebouw?",
    "prices": [
        ("Prefab bijgebouw (per m²)", "&euro;1.500&ndash;&euro;3.500", "Van geïsoleerde tuinkamer tot volwaardige verblijfsruimte."),
        ("Tuinkantoor ~15 m² (totaal)", "&euro;22.000&ndash;&euro;50.000", "Geïsoleerd, met elektra; geschikt voor werken aan huis."),
        ("Mantelzorgwoning (totaal)", "&euro;45.000&ndash;&euro;100.000+", "Volwaardige woonunit met keuken, badkamer en drempelloze vloer."),
        ("Fundering / aansluiting", "&euro;2.500&ndash;&euro;8.000", "Fundering en aansluiten op nutsvoorzieningen."),
    ],
    "related": [
        ("/bouwvergunning/mantelzorgwoning/", "Mantelzorgwoning: vergunning?", "Regels voor zorg aan huis"),
        ("/bouwvergunning/schuur-tuinhuis/", "Schuur of tuinhuis?", "Vergunning voor bijgebouwen"),
        ("/aanbouw/", "Prefab aanbouw", "Vast aan de woning i.p.v. los"),
        ("/dakopbouw/", "Prefab dakopbouw", "Ruimte op het dak"),
        ("/offerte-check/aannemer/", "Aannemer vergelijken", "Neutraal, met marktprijs ernaast"),
        ("/eerlijke-prijzen/", "Eerlijke prijzen", "Hoe Bylder je offerte checkt"),
    ],
    "body": '''
    <h2 id="wat">Wat is een bijgebouw?</h2>
    <p>Een bijgebouw staat &mdash; anders dan een aanbouw &mdash; <strong>los</strong> van de woning: vier eigen wanden, een eigen dak, ergens in de tuin. Dat maakt het geschikt voor functies waarvoor je scheiding met het huis wilt: een tuinkantoor om thuis te werken, een hobby- of atelierruimte, een logeer- of mantelzorgverblijf, of simpelweg een ruime berging. Prefab betekent dat de unit grotendeels in de fabriek wordt gemaakt en in enkele uren op een voorbereide fundering wordt geplaatst.</p>

    <h2 id="kosten">Wat bepaalt de prijs?</h2>
    <p>De grootste prijsbepaler is het beoogde gebruik. Een geïsoleerde tuinkamer is een heel ander product dan een volwaardige mantelzorgwoning met keuken, badkamer en verwarming. Isolatiewaarde, sanitair, aansluitingen op nutsvoorzieningen en het afwerkniveau bepalen samen of je onderin of bovenin de bandbreedte uitkomt.</p>
    <ul class="check-list">
      <li>Gebruik: berging < tuinkantoor < verblijfsruimte < zelfstandige woonunit.</li>
      <li>Isolatie en verwarming: nodig zodra je er het hele jaar in wilt verblijven.</li>
      <li>Sanitair en keuken: een badkamer en keuken tillen een mantelzorgwoning fors omhoog.</li>
      <li>Aansluitingen: water, elektra en riool naar het bijgebouw is maatwerk per tuin.</li>
    </ul>

    <h2 id="vergunning">Vergunning: vaak tot 70 m² vrij</h2>
    <p>In het <strong>achtererfgebied</strong> mag je vaak een fors bijgebouw zonder vergunning plaatsen &mdash; tot een oppervlak dat oploopt tot maximaal 70 m², afhankelijk van de grootte van je perceel en binnen de landelijke voorwaarden voor hoogte en gebruik. Let op: vergunningvrij bouwen betekent niet automatisch dat je er ook permanent in mag <em>wonen</em>. Voor bewoning (bijvoorbeeld een mantelzorgwoning) gelden aparte regels en is het bestemmingsplan/omgevingsplan leidend.</p>
    <div class="highlight">Voor zorg aan huis: op <a href="/bouwvergunning/mantelzorgwoning/">mantelzorgwoning &amp; vergunning</a> staat wanneer een woonbijgebouw vergunningvrij mag en wanneer niet.</div>

    <h2 id="gebruik">Waarvoor gebruik je een bijgebouw?</h2>
    <p>De meest gevraagde toepassingen zijn het <strong>tuinkantoor</strong> (een aparte, rustige werkplek los van het huis, sinds meer thuiswerken sterk gegroeid), de <strong>mantelzorgwoning</strong> (een zelfstandig verblijf voor een ouder of familielid, met drempelloze vloer en eigen voorzieningen) en de <strong>hobby- of logeerruimte</strong>. Omdat een bijgebouw los staat, kun je het gebruik later relatief eenvoudig wijzigen &mdash; van kantoor naar logeerverblijf, bijvoorbeeld.</p>

    <h2 id="hoe">Hoe verloopt een prefab-bijgebouw?</h2>
    <p>Na ontwerp en offerte volgt een check op de vergunningsituatie, het inmeten, de aanleg van de fundering, de productie en tot slot de plaatsing &mdash; die door de prefab-aanpak vaak binnen enkele uren gebeurt. De doorlooptijd van akkoord tot plaatsing ligt doorgaans rond enkele weken, met minimale overlast omdat het meeste werk in de fabriek is gedaan.</p>

    <h2 id="offerte">Waar let je op bij een offerte?</h2>
    <p>Controleer of fundering, isolatie, aansluitingen (water/elektra/riool) en afwerking in de prijs zitten &mdash; bij bijgebouwen zijn dat vaak de verborgen posten. Wil je er wonen of werken, vraag dan naar de isolatiewaarde en of het bouwbesluit voor verblijfsruimte wordt gehaald. Vergelijk minstens drie bedrijven op een gespecificeerde offerte en zet de marktprijs ernaast.</p>
    ''',
}

CONFIGS = [AANBOUW, DAKOPBOUW, BIJGEBOUW]


def main():
    for cfg in CONFIGS:
        d = os.path.join(ROOT, cfg["path"])
        os.makedirs(d, exist_ok=True)
        out = os.path.join(d, "index.html")
        open(out, "w", encoding="utf-8").write(render(cfg))
        # ruwe woordtelling van de prose
        import re
        txt = re.sub(r"<[^>]+>", " ", cfg["body"])
        txt = re.sub(r"&[a-z]+;", " ", txt)
        words = len(txt.split())
        print(f"  {cfg['path']}/index.html  (prose ~{words} woorden body, +tabel/FAQ)")
    print("Klaar. Vergeet niet: sitemap + interne links.")


if __name__ == "__main__":
    main()
