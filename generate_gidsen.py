#!/usr/bin/env python3
import json, re, os, sys
from pathlib import Path
from datetime import date
from collections import defaultdict

BASE_URL = "https://bylder.com"
OUTPUT   = Path("output")
TODAY    = date.today().isoformat()

sys.path.insert(0, str(Path(__file__).parent))
from gidsen_data import GIDSEN, TOOLS

def slugify(t):
    t = t.lower().strip()
    t = re.sub(r"[^a-z0-9\-]", "-", t)
    t = re.sub(r"-{2,}", "-", t)
    return t.strip("-")

NAV = '''<nav style="position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(245,240,232,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);padding:14px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;"><span style="color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace;">B.</span></div>
      <span style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:24px;">
      <a href="/nieuwbouw-gids/" style="font-size:14px;color:rgba(61,46,30,0.6);text-decoration:none;font-weight:600;">Gidsen</a>
      <a href="/nieuwbouw/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Gemeenten</a>
      <a href="/tools/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Tools</a>
    </div>
    <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis</a>
  </div>
</nav>'''

FOOTER = '''<div style="background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px;"></div>
<footer style="padding:40px 0 24px;background:#1A1208;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
    <span style="font-weight:700;color:#F5F0E8;font-size:17px;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      <a href="/nieuwbouw-gids/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Gidsen</a>
      <a href="/nieuwbouw/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Gemeenten</a>
      <a href="/tools/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Tools</a>
      <a href="/privacy/" style="font-size:13px;color:rgba(245,240,232,0.4);text-decoration:none;">Privacy</a>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.2);font-family:'Space Mono',monospace;">© 2025 Bylder Nederland B.V.</p>
  </div>
</footer>'''

FASE_MAP = {
    "fase-1-orientatie": ("Fase 1", "Oriëntatie & Aankoop", "#3D5A3E", "rgba(61,90,62,0.1)"),
    "fase-2-bouwfase":   ("Fase 2", "Bouwfase & Koperskeuzes", "#B85C38", "rgba(184,92,56,0.1)"),
    "fase-3-oplevering": ("Fase 3", "Oplevering & Nazorg", "#5C4433", "rgba(61,46,30,0.08)"),
}

def render_gids(gids):
    fase  = gids["fase"]
    slug  = gids["slug"]
    url   = f"{BASE_URL}/nieuwbouw-gids/{fase}/{slug}/"
    fl, fn, fc, fbg = FASE_MAP.get(fase, ("Gids","Gids","#3D5A3E","rgba(61,90,62,0.1)"))

    faq_ld = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":f["vraag"],"acceptedAnswer":{"@type":"Answer","text":f["antwoord"]}} for f in gids.get("faq",[])]}
    bc_ld  = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Bylder","item":BASE_URL},{"@type":"ListItem","position":2,"name":"Gidsen","item":f"{BASE_URL}/nieuwbouw-gids/"},{"@type":"ListItem","position":3,"name":fn,"item":f"{BASE_URL}/nieuwbouw-gids/{fase}/"},{"@type":"ListItem","position":4,"name":gids["h1"],"item":url}]}
    art_ld = {"@context":"https://schema.org","@type":"Article","headline":gids["h1"],"description":gids["meta_desc"],"url":url,"datePublished":TODAY,"dateModified":TODAY,"publisher":{"@type":"Organization","name":"Bylder.com","url":BASE_URL}}

    secties = "".join(f'<h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin:32px 0 12px;">{s["h2"]}</h2><p style="font-size:16px;color:rgba(61,46,30,0.7);line-height:1.85;margin-bottom:8px;">{s["tekst"]}</p>' for s in gids.get("secties",[]))

    faq_html = "".join(f'''<div style="border:1px solid rgba(61,46,30,0.09);border-radius:14px;overflow:hidden;background:#fff;margin-bottom:10px;">
<h3 style="margin:0;"><button onclick="var b=this.parentElement.nextElementSibling;var o=b.classList.contains('o');document.querySelectorAll('.fb.o').forEach(x=>x.classList.remove('o'));if(!o)b.classList.add('o');"
  style="width:100%;text-align:left;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:#1A1208;">
  {f["vraag"]}<span style="color:{fc};font-size:12px;flex-shrink:0;">▾</span></button></h3>
<div class="fb" style="max-height:0;overflow:hidden;transition:max-height 0.35s ease;"><div style="padding:0 22px 18px;font-size:14px;line-height:1.75;color:rgba(61,46,30,0.7);">{f["antwoord"]}</div></div>
</div>''' for f in gids.get("faq",[]))

    title = gids["title"] if len(gids["title"]) <= 62 else gids["title"][:59]+"..."

    return f'''<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{gids["meta_desc"]}">
<meta name="robots" content="index, follow"><meta name="last-modified" content="{TODAY}">
<link rel="canonical" href="{url}"><link rel="sitemap" type="application/xml" href="/sitemap.xml">
<meta property="og:type" content="article"><meta property="og:url" content="{url}">
<meta property="og:title" content="{gids["h1"]}"><meta property="og:description" content="{gids["meta_desc"]}">
<meta property="og:image" content="https://bylder.com/og/nieuwbouw-gids.jpg">
<meta name="twitter:card" content="summary_large_image"><link rel="alternate" hreflang="nl" href="{url}">
<script type="application/ld+json">{json.dumps(faq_ld,ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(bc_ld,ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(art_ld,ensure_ascii=False)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.6}}.container{{max-width:1280px;margin:0 auto;padding:0 48px}}@media(max-width:768px){{.container{{padding:0 20px}}.sidebar{{display:none}}}}.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}.fb.o{{max-height:600px!important}}</style>
</head><body>
{NAV}
<div style="padding-top:68px;"><div class="container" style="padding-top:10px;padding-bottom:10px;">
<nav style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(61,46,30,0.4);flex-wrap:wrap;">
<a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder</a> ›
<a href="/nieuwbouw-gids/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Gidsen</a> ›
<a href="/nieuwbouw-gids/{fase}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">{fn}</a> ›
<span style="color:{fc};font-weight:600;">{gids["slug"].replace("-"," ").title()}</span>
</nav></div></div>
<main>
<section style="padding:40px 0 52px;background:#fff;">
  <div class="container" style="max-width:800px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:{fbg};border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:{fc};margin-bottom:14px;text-transform:uppercase;letter-spacing:0.08em;">{fl} · {fn}</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.15;margin-bottom:16px;">{gids["h1"]}</h1>
    <p style="font-size:17px;color:rgba(61,46,30,0.65);line-height:1.8;margin-bottom:24px;">{gids["intro"]}</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> AI controleert dit voor mij</a>
      <a href="/nieuwbouw-gids/" style="border:1.5px solid rgba(61,46,30,0.15);color:#3D2E1E;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;background:rgba(255,255,255,0.8);">Alle gidsen</a>
    </div>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;">
    <article>
      {secties}
      <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin:40px 0 16px;">Veelgestelde vragen</h2>
      {faq_html}
    </article>
    <aside class="sidebar" style="position:sticky;top:80px;">
      <div style="background:#1A1208;border-radius:16px;padding:22px;margin-bottom:14px;">
        <div style="font-size:1.3rem;margin-bottom:10px;">🤖</div>
        <div style="font-size:15px;font-weight:700;color:#F5F0E8;margin-bottom:8px;">Laat de AI dit checken</div>
        <p style="font-size:13px;color:rgba(245,240,232,0.5);line-height:1.6;margin-bottom:14px;">Upload je documenten en Bylder's AI analyseert direct jouw situatie.</p>
        <a href="/login.html" style="display:block;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:9px;font-size:13px;font-weight:700;text-decoration:none;text-align:center;">Start gratis →</a>
      </div>
      <div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:18px;">
        <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.35);margin-bottom:10px;">Andere gidsen</div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <a href="/nieuwbouw-gids/fase-1-orientatie/koopakte-nieuwbouw-controleren/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Koopakte controleren</a>
          <a href="/nieuwbouw-gids/fase-2-bouwfase/meerwerk-nieuwbouw/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Meerwerk controleren</a>
          <a href="/nieuwbouw-gids/fase-2-bouwfase/lichtplan-nieuwbouw/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Lichtplan maken</a>
          <a href="/nieuwbouw-gids/fase-3-oplevering/opleveringskeuring-nieuwbouw/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Opleveringskeuring</a>
          <a href="/nieuwbouw-gids/fase-3-oplevering/5-procent-depot-regeling/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">5%-depot regeling</a>
          <a href="/nieuwbouw-gids/" style="font-size:13px;color:#3D5A3E;font-weight:700;margin-top:4px;">Alle gidsen →</a>
        </div>
      </div>
    </aside>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;background:#1A1208;text-align:center;">
  <div class="container">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;color:#F5F0E8;letter-spacing:-0.03em;margin-bottom:12px;">Laat Bylder dit voor jou regelen</h2>
    <p style="font-size:15px;color:rgba(245,240,232,0.5);max-width:420px;margin:0 auto 22px;line-height:1.7;">Upload je documenten, de AI controleert alles. €99 eenmalig.</p>
    <a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Start gratis QuickScan</a>
  </div>
</section>
</main>
{FOOTER}
</body></html>'''

def render_fase_overzicht(fase, gidsen_in_fase):
    fl, fn, fc, fbg = FASE_MAP.get(fase, ("Gids","Gids","#3D5A3E","rgba(61,90,62,0.1)"))
    url   = f"{BASE_URL}/nieuwbouw-gids/{fase}/"
    kaarten = "".join(f'''<a href="/nieuwbouw-gids/{g["fase"]}/{g["slug"]}/" style="text-decoration:none;display:block;background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px;transition:all 0.2s;" onmouseover="this.style.borderColor='rgba(61,90,62,0.25)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(61,46,30,0.08)';this.style.transform=''">
<div style="font-size:15px;font-weight:700;color:#1A1208;margin-bottom:6px;line-height:1.3;">{g["h1"]}</div>
<div style="font-size:13px;color:rgba(61,46,30,0.5);line-height:1.5;margin-bottom:12px;">{g["intro"][:100]}...</div>
<div style="font-size:13px;font-weight:700;color:{fc};">Lees gids →</div></a>''' for g in gidsen_in_fase)

    return f'''<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Nieuwbouw gids {fn} — {len(gidsen_in_fase)} artikelen | Bylder</title>
<meta name="description" content="Bylder-gidsen voor {fn.lower()} bij nieuwbouw. {len(gidsen_in_fase)} artikelen.">
<meta name="robots" content="index, follow"><link rel="canonical" href="{url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif}}.container{{max-width:1280px;margin:0 auto;padding:0 48px}}@media(max-width:768px){{.container{{padding:0 20px}}}}.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}</style>
</head><body>
{NAV}<div style="padding-top:68px;"></div>
<section style="padding:40px 0 48px;background:#fff;">
  <div class="container">
    <nav style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(61,46,30,0.4);margin-bottom:20px;">
      <a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder</a> ›
      <a href="/nieuwbouw-gids/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Gidsen</a> ›
      <span style="color:{fc};font-weight:600;">{fn}</span>
    </nav>
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:{fbg};border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:{fc};margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em;">{fl} · {fn}</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;margin-bottom:10px;">{fn}</h1>
    <p style="font-size:16px;color:rgba(61,46,30,0.6);max-width:540px;line-height:1.75;">{len(gidsen_in_fase)} gidsen voor deze fase van jouw nieuwbouwtraject.</p>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;"><div class="container">
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">{kaarten}</div>
</div></section>
{FOOTER}
</body></html>'''

def render_hoofdoverzicht(alle_gidsen):
    url = f"{BASE_URL}/nieuwbouw-gids/"
    blokken = ""
    emojis = {"fase-1-orientatie":"📝","fase-2-bouwfase":"🏗️","fase-3-oplevering":"🔑"}
    for fase, (fl, fn, fc, fbg) in FASE_MAP.items():
        g_fase = [g for g in alle_gidsen if g["fase"] == fase]
        links = "".join(f'<a href="/nieuwbouw-gids/{g["fase"]}/{g["slug"]}/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">› {g["h1"][:50]}</a>' for g in g_fase[:4])
        blokken += f'''<div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:18px;padding:24px;">
<div style="font-size:1.6rem;margin-bottom:10px;">{emojis.get(fase,"📋")}</div>
<div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.35);margin-bottom:6px;">{fl}</div>
<h2 style="font-size:17px;font-weight:800;color:#1A1208;margin-bottom:12px;letter-spacing:-0.02em;">{fn}</h2>
<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px;">{links}</div>
<a href="/nieuwbouw-gids/{fase}/" style="font-size:13px;font-weight:700;color:{fc};text-decoration:none;">Alle {len(g_fase)} gidsen →</a>
</div>'''

    return f'''<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Nieuwbouw gids — complete tijdlijn | Bylder</title>
<meta name="description" content="Alle {len(alle_gidsen)} Bylder nieuwbouw gidsen: van koopakte en bouwdepot tot meerwerk, lichtplan en opleveringskeuring.">
<meta name="robots" content="index, follow"><link rel="canonical" href="{url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif}}.container{{max-width:1280px;margin:0 auto;padding:0 48px}}@media(max-width:768px){{.container{{padding:0 20px}}}}.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}</style>
</head><body>
{NAV}<div style="padding-top:68px;"></div>
<section style="padding:48px 0 56px;background:#fff;text-align:center;">
  <div class="container" style="max-width:620px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 14px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:#3D5A3E;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.08em;">{len(alle_gidsen)} gidsen · 3 fases</div>
    <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.1;margin-bottom:12px;">Nieuwbouw gids</h1>
    <p style="font-size:17px;color:rgba(61,46,30,0.6);line-height:1.75;">Van koopakte tot sleuteloverdracht — alles voor elke fase van jouw traject.</p>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;"><div class="container">
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">{blokken}</div>
</div></section>
{FOOTER}
</body></html>'''

def render_tool(tool):
    url  = f"{BASE_URL}/tools/{tool['slug']}/"
    slug = tool["slug"]

    if slug == "5-procent-depot-calculator":
        body = '''<div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:20px;padding:32px;max-width:580px;margin:0 auto;">
  <div style="margin-bottom:14px;"><label style="display:block;font-size:12px;font-weight:700;color:rgba(61,46,30,0.5);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Aanneemsom (excl. grond en BTW)</label>
  <div style="position:relative;"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(61,46,30,0.4);font-weight:600;">€</span>
  <input id="ci" type="number" placeholder="350.000" oninput="tc(this.value)" style="width:100%;padding:13px 14px 13px 32px;background:#F5F0E8;border:1.5px solid rgba(61,46,30,0.12);border-radius:10px;font-size:17px;color:#1A1208;font-family:inherit;outline:none;" onfocus="this.style.borderColor='rgba(61,90,62,0.5)'" onblur="this.style.borderColor='rgba(61,46,30,0.12)'"></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px;">
    <div style="background:#F5F0E8;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:10px;font-family:'Space Mono',monospace;text-transform:uppercase;color:rgba(61,46,30,0.4);margin-bottom:5px;">5% Depot</div><div id="d" style="font-size:1.4rem;font-weight:800;color:#3D5A3E;letter-spacing:-0.04em;">€ —</div></div>
    <div style="background:#F5F0E8;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:10px;font-family:'Space Mono',monospace;text-transform:uppercase;color:rgba(61,46,30,0.4);margin-bottom:5px;">Meerwerk (14%)</div><div id="m" style="font-size:1.4rem;font-weight:800;color:#B85C38;letter-spacing:-0.04em;">€ —</div></div>
    <div style="background:#F5F0E8;border-radius:12px;padding:14px;text-align:center;"><div style="font-size:10px;font-family:'Space Mono',monospace;text-transform:uppercase;color:rgba(61,46,30,0.4);margin-bottom:5px;">Totaal</div><div id="t" style="font-size:1.4rem;font-weight:800;color:#1A1208;letter-spacing:-0.04em;">€ —</div></div>
  </div>
  <div id="a" style="display:none;background:rgba(61,90,62,0.07);border:1px solid rgba(61,90,62,0.15);border-radius:10px;padding:14px;font-size:14px;color:#3D5A3E;line-height:1.6;margin-bottom:14px;"></div>
  <a href="/login.html" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#3D5A3E;color:#F5F0E8;border-radius:10px;padding:13px;font-size:14px;font-weight:700;text-decoration:none;">Volledige AI-analyse starten →</a>
  <p style="font-size:11px;color:rgba(61,46,30,0.35);text-align:center;margin-top:10px;font-family:'Space Mono',monospace;">Geen financieel advies · gebaseerd op marktgemiddelden</p>
</div>
<script>function tc(v){const n=parseFloat(v)||0,d=Math.round(n*.05),mw=Math.round(n*.14),tt=n+mw,f=x=>'€\u00A0'+Math.round(x).toLocaleString('nl-NL');document.getElementById('d').textContent=n?f(d):'€ —';document.getElementById('m').textContent=n?f(mw):'€ —';document.getElementById('t').textContent=n?f(tt):'€ —';const a=document.getElementById('a');if(n){a.style.display='block';a.textContent=`Houd ${f(d)} in depot bij de notaris en reserveer ${f(mw)} voor meerwerk. Totaal benodigde liquiditeit: ${f(tt)}.`}else a.style.display='none';}</script>'''

    elif slug == "meerwerk-calculator":
        body = '''<div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:20px;padding:32px;max-width:680px;margin:0 auto;">
  <div id="mp" style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;"></div>
  <div style="background:#F5F0E8;border-radius:12px;padding:14px;text-align:center;margin-bottom:14px;">
    <div style="font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;color:rgba(61,46,30,0.4);margin-bottom:5px;">Totaal meerwerk-budget</div>
    <div id="mt" style="font-size:2rem;font-weight:800;color:#3D5A3E;letter-spacing:-0.04em;">€ 0</div>
  </div>
  <a href="/login.html" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#3D5A3E;color:#F5F0E8;border-radius:10px;padding:13px;font-size:14px;font-weight:700;text-decoration:none;">Laat AI jouw offerte controleren →</a>
</div>
<script>
const P=[{l:"Extra stopcontacten",p:95},{l:"Extra lichtpunten",p:75},{l:"Inbouwspots",p:60},{l:"Vloerverwarming per kamer",p:1100},{l:"Keuken upgrade",p:3500},{l:"Badkamer upgrade",p:2000},{l:"Extra groep meterkast",p:280}];
const c=document.getElementById('mp');const q=P.map(()=>0);
P.forEach((p,i)=>{const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:10px;background:#F5F0E8;border-radius:10px;padding:11px 14px;';
r.innerHTML=`<div style="flex:1;font-size:14px;font-weight:600;color:#1A1208;">${p.l}<span style="font-size:12px;color:rgba(61,46,30,0.4);font-weight:400;margin-left:6px;">€${p.p.toLocaleString('nl-NL')}/stuk</span></div>
<button onclick="adj(${i},-1)" style="width:28px;height:28px;border:1.5px solid rgba(61,46,30,0.15);border-radius:7px;background:#fff;cursor:pointer;font-size:15px;font-weight:700;">−</button>
<span id="q${i}" style="min-width:22px;text-align:center;font-weight:700;font-size:14px;">0</span>
<button onclick="adj(${i},1)" style="width:28px;height:28px;border:1.5px solid rgba(61,46,30,0.15);border-radius:7px;background:#fff;cursor:pointer;font-size:15px;font-weight:700;">+</button>
<div id="s${i}" style="min-width:70px;text-align:right;font-weight:700;color:#3D5A3E;font-size:13px;">€ 0</div>`;
c.appendChild(r);});
function adj(i,d){q[i]=Math.max(0,q[i]+d);document.getElementById('q'+i).textContent=q[i];const s=q[i]*P[i].p;document.getElementById('s'+i).textContent=s?'€\u00A0'+s.toLocaleString('nl-NL'):'€ 0';const tot=q.reduce((s,v,j)=>s+v*P[j].p,0);document.getElementById('mt').textContent='€\u00A0'+tot.toLocaleString('nl-NL');}
</script>'''

    elif slug == "opleveringschecklist-download":
        items = ["Gevelmetselwerk","Dakbedekking","Kozijnen en deuren","CV-ketel werkt","Alle groepen werken","Ventilatie ingeregeld","Warm water aanwezig","Waterdichtheid douche","Kitranden intact","Tegelwerk compleet","Alle extra stopcontacten","Lichtpunten conform tekening","Meerwerk volledig uitgevoerd"]
        checks = "".join(f'<label style="display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(61,46,30,0.7);padding:8px 0;border-bottom:1px solid rgba(61,46,30,0.06);cursor:pointer;"><input type="checkbox" style="width:16px;height:16px;accent-color:#3D5A3E;">{item}</label>' for item in items)
        body = f'''<div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:20px;padding:32px;max-width:580px;margin:0 auto;">
  <div style="margin-bottom:16px;">{checks}</div>
  <div id="score" style="background:#F5F0E8;border-radius:10px;padding:14px;text-align:center;margin-bottom:14px;font-weight:700;color:#3D5A3E;font-size:15px;">0 / {len(items)} gecontroleerd</div>
  <a href="/login.html" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#3D5A3E;color:#F5F0E8;border-radius:10px;padding:13px;font-size:14px;font-weight:700;text-decoration:none;">Gebruik de volledige 47-punten checklist in Bylder →</a>
</div>
<script>document.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.addEventListener('change',()=>{{const c=document.querySelectorAll('input:checked').length;document.getElementById('score').textContent=c+' / {len(items)} gecontroleerd';}}));</script>'''

    else:
        body = f'<div style="text-align:center;padding:40px;"><a href="/login.html" style="background:#3D5A3E;color:#F5F0E8;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;">Start in de Bylder app →</a></div>'

    title = tool["title"] if len(tool["title"]) <= 62 else tool["title"][:59]+"..."
    return f'''<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{tool["meta_desc"]}">
<meta name="robots" content="index, follow"><link rel="canonical" href="{url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>*{{box-sizing:border-box;margin:0;padding:0}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif}}.container{{max-width:1280px;margin:0 auto;padding:0 48px}}@media(max-width:768px){{.container{{padding:0 20px}}}}.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}</style>
</head><body>
{NAV}<div style="padding-top:68px;"></div>
<section style="padding:40px 0 36px;background:#fff;text-align:center;">
  <div class="container" style="max-width:600px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.25);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:#A88030;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.08em;">Gratis tool</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.4rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.15;margin-bottom:12px;">{tool["h1"]}</h1>
    <p style="font-size:16px;color:rgba(61,46,30,0.6);line-height:1.75;">{tool["intro"]}</p>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:40px 0 56px;"><div class="container">{body}</div></section>
{FOOTER}
</body></html>'''

# ── MAIN ────────────────────────────────────────────────────────────────────
sitemap_urls = []
generated    = 0

for gids in GIDSEN:
    d = OUTPUT / "nieuwbouw-gids" / gids["fase"] / gids["slug"]
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(render_gids(gids), encoding="utf-8")
    url = f"{BASE_URL}/nieuwbouw-gids/{gids['fase']}/{gids['slug']}/"
    sitemap_urls.append(url); generated += 1
    print(f"[OK] {url}")

fases_g = defaultdict(list)
for g in GIDSEN: fases_g[g["fase"]].append(g)

for fase, gs in fases_g.items():
    d = OUTPUT / "nieuwbouw-gids" / fase
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(render_fase_overzicht(fase, gs), encoding="utf-8")
    url = f"{BASE_URL}/nieuwbouw-gids/{fase}/"
    sitemap_urls.append(url); generated += 1
    print(f"[OK] {url}")

d = OUTPUT / "nieuwbouw-gids"
d.mkdir(parents=True, exist_ok=True)
(d / "index.html").write_text(render_hoofdoverzicht(GIDSEN), encoding="utf-8")
sitemap_urls.append(f"{BASE_URL}/nieuwbouw-gids/"); generated += 1
print(f"[OK] {BASE_URL}/nieuwbouw-gids/")

for tool in TOOLS:
    d = OUTPUT / "tools" / tool["slug"]
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(render_tool(tool), encoding="utf-8")
    url = f"{BASE_URL}/tools/{tool['slug']}/"
    sitemap_urls.append(url); generated += 1
    print(f"[OK] {url}")

d = OUTPUT / "tools"
d.mkdir(parents=True, exist_ok=True)
tools_kaarten = "".join(f'<a href="/tools/{t["slug"]}/" style="text-decoration:none;display:block;background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px;transition:all 0.2s;" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'"><div style="font-size:15px;font-weight:700;color:#1A1208;margin-bottom:6px;">{t["h1"]}</div><div style="font-size:13px;color:rgba(61,46,30,0.5);margin-bottom:12px;line-height:1.5;">{t["intro"][:80]}...</div><span style="font-size:13px;font-weight:700;color:#3D5A3E;">Gebruik tool →</span></a>' for t in TOOLS)
tools_html = f'''<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Gratis nieuwbouw tools | Bylder</title><meta name="description" content="Gratis tools voor nieuwbouwkopers: depot calculator, meerwerk calculator en opleveringschecklist."><link rel="canonical" href="{BASE_URL}/tools/"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap" rel="stylesheet"><style>*{{box-sizing:border-box;margin:0;padding:0}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif}}.container{{max-width:1280px;margin:0 auto;padding:0 48px}}@media(max-width:768px){{.container{{padding:0 20px}}}}</style></head><body>{NAV}<div style="padding-top:68px;"></div><section style="padding:48px 0;background:#fff;text-align:center;"><div class="container" style="max-width:640px;"><h1 style="font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;margin-bottom:14px;">Gratis tools voor nieuwbouwkopers</h1><p style="font-size:16px;color:rgba(61,46,30,0.6);line-height:1.75;margin-bottom:36px;">Bereken je depot, meerwerk-budget of doorloop de opleveringschecklist.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:left;">{tools_kaarten}</div></div></section>{FOOTER}</body></html>'''
(d / "index.html").write_text(tools_html, encoding="utf-8")
sitemap_urls.append(f"{BASE_URL}/tools/"); generated += 1

print(f"\n{'='*55}")
print(f"Gegenereerd: {generated} pagina's")
print(f"  {len(GIDSEN)} gids-artikelen")
print(f"  {len(fases_g)} fase-overzichten + 1 hoofdoverzicht")
print(f"  {len(TOOLS)} tools + 1 tools-overzicht")
print(f"{'='*55}")
