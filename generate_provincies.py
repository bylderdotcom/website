#!/usr/bin/env python3
"""
Bylder.com — Provincie overzichtspagina generator
Genereert /nieuwbouw/[provincie]/index.html voor alle 12 provincies
"""

import csv, re, json
from pathlib import Path
from datetime import date
from collections import defaultdict
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

BASE_URL   = "https://bylder.com"
OUTPUT_DIR = Path("output")
TODAY      = date.today().isoformat()

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"['\u2018\u2019]", "", text)
    text = re.sub(r"[^a-z0-9\-]", "-", text)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-")

def fmt_euro(val):
    try:
        return f"€{int(float(val)):,}".replace(",",".")
    except:
        return str(val)

# Laad gemeentedata
with open("gemeenten_data_v2.csv", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))

# Groepeer per provincie
provincies = defaultdict(list)
for row in rows:
    provincies[row['provincie']].append(row)

# Provincie emoji mapping
prov_emoji = {
    "Noord-Holland": "🌷", "Zuid-Holland": "🏙️", "Utrecht": "🏛️",
    "Noord-Brabant": "🌳", "Gelderland": "🦅", "Overijssel": "💧",
    "Flevoland": "🌊", "Groningen": "⚡", "Friesland": "⛵",
    "Drenthe": "🌲", "Zeeland": "🦞", "Limburg": "🏔️",
}

def generate_provincie_page(provincie, gemeenten):
    slug_prov     = slugify(provincie)
    url           = f"{BASE_URL}/nieuwbouw/{slug_prov}/"
    totaal_proj   = sum(int(g['aantal_projecten']) for g in gemeenten)
    gem_besp      = sum(float(g['gem_besparing'].replace('€','').replace('.','').replace(',','.')) for g in gemeenten) / len(gemeenten)
    gem_besp_fmt  = fmt_euro(gem_besp)
    emoji         = prov_emoji.get(provincie, "🏠")

    # Top 6 gemeenten op aantal projecten
    top6 = sorted(gemeenten, key=lambda g: int(g['aantal_projecten']), reverse=True)[:6]

    # JSON-LD
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"Welke nieuwbouwprojecten zijn er in {provincie}?",
                "acceptedAnswer": {"@type": "Answer", "text": f"In {provincie} zijn momenteel {totaal_proj} actieve nieuwbouwprojecten verdeeld over {len(gemeenten)} gemeenten. De grootste projecten vind je in {', '.join(g['gemeente'] for g in top6[:3])}."}
            },
            {
                "@type": "Question",
                "name": f"Hoeveel bespaar ik als nieuwbouwkoper in {provincie}?",
                "acceptedAnswer": {"@type": "Answer", "text": f"Kopers in {provincie} besparen gemiddeld {gem_besp_fmt} via Bylder op de afwerking en inrichting van hun nieuwbouwwoning."}
            },
            {
                "@type": "Question",
                "name": f"In welke gemeenten in {provincie} is Bylder actief?",
                "acceptedAnswer": {"@type": "Answer", "text": f"Bylder is actief in alle {len(gemeenten)} gemeenten van {provincie}, waaronder {', '.join(g['gemeente'] for g in top6)}."}
            },
        ]
    }

    breadcrumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Bylder", "item": BASE_URL},
            {"@type": "ListItem", "position": 2, "name": "Nieuwbouw", "item": f"{BASE_URL}/nieuwbouw/"},
            {"@type": "ListItem", "position": 3, "name": f"Nieuwbouw {provincie}", "item": url},
        ]
    }

    # Gemeente kaarten HTML
    gemeente_cards = ""
    for g in sorted(gemeenten, key=lambda x: int(x['aantal_projecten']), reverse=True):
        slug_gem = slugify(g['gemeente'])
        gemeente_cards += f"""
        <a href="/nieuwbouw/{slug_prov}/{slug_gem}/" style="text-decoration:none;display:block;background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:18px;transition:all 0.2s;" onmouseover="this.style.background='#fff';this.style.borderColor='rgba(61,90,62,0.25)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(61,46,30,0.08)'" onmouseout="this.style.background='#F5F0E8';this.style.borderColor='rgba(61,46,30,0.08)';this.style.transform='';this.style.boxShadow=''">
          <div style="font-size:15px;font-weight:700;color:#1A1208;margin-bottom:4px;">{g['gemeente']}</div>
          <div style="font-size:12px;color:rgba(61,46,30,0.5);margin-bottom:10px;">{g['aantal_projecten']} projecten · {g['gem_besparing']} bespaard</div>
          <div style="font-size:12px;color:rgba(61,46,30,0.4);line-height:1.5;margin-bottom:10px;">{g['wijken_lijst'][:60]}{'...' if len(g['wijken_lijst'])>60 else ''}</div>
          <div style="font-size:12px;font-weight:700;color:#3D5A3E;display:flex;align-items:center;gap:5px;">Bekijk pagina <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></div>
        </a>"""

    # Volledige pagina HTML
    title_txt = f"Nieuwbouw {provincie} — alle gemeenten & projecten | Bylder"
    if len(title_txt) > 62:
        title_txt = f"Nieuwbouw {provincie} — gemeenten & korting | Bylder"

    html = f"""<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_txt}</title>
<meta name="description" content="Nieuwbouw in {provincie}: {len(gemeenten)} gemeenten, {totaal_proj} actieve projecten. AI offerte check, gem. {gem_besp_fmt} bespaard en 10% korting bij 40+ merken via Bylder.">
<meta name="robots" content="index, follow">
<meta name="last-modified" content="{TODAY}">
<link rel="canonical" href="{url}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="Nieuwbouw {provincie} — {len(gemeenten)} gemeenten | Bylder">
<meta property="og:description" content="{totaal_proj} projecten in {provincie}. Gem. {gem_besp_fmt} bespaard via Bylder.">
<meta property="og:image" content="https://bylder.com/og/nieuwbouw-gemeente.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" hreflang="nl" href="{url}">
<script type="application/ld+json">{json.dumps(faq_ld, ensure_ascii=False, indent=2)}</script>
<script type="application/ld+json">{json.dumps(breadcrumb_ld, ensure_ascii=False, indent=2)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}}
.container{{width:100%!important;max-width:1280px!important;margin-left:auto!important;margin-right:auto!important;padding-left:48px!important;padding-right:48px!important}}
@media(max-width:768px){{.container{{padding-left:20px!important;padding-right:20px!important}}}}
.glass-nav{{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08)}}
.cta-btn{{background:#3D5A3E;color:#F5F0E8;font-weight:700;transition:all 0.25s;text-decoration:none}}
.cta-btn:hover{{background:#4E7350;transform:translateY(-1px)}}
.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}
.faq-body{{max-height:0;overflow:hidden;transition:max-height 0.35s ease}}
.faq-body.open{{max-height:400px}}
.faq-icon{{transition:transform 0.3s}}
.faq-trigger.active .faq-icon{{transform:rotate(180deg)}}
</style>
</head>
<body>

<a href="#main-content" style="position:absolute;left:-9999px;" onfocus="this.style.cssText='position:fixed;top:0;left:0;z-index:9999;padding:12px 20px;background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;'">Ga naar hoofdinhoud</a>

<!-- NAV -->
<nav class="glass-nav fixed top-0 left-0 right-0 z-50 py-4">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;">
        <span style="color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace;">B.</span>
      </div>
      <span style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:24px;">
      <a href="/nieuwbouw/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Alle gemeenten</a>
      <a href="/#vouchers" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Vouchers</a>
      <a href="/kopersbegeleiding-nieuwbouw/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Begeleiding</a>
    </div>
    <a href="https://mijn.bylder.com" class="cta-btn px-5 py-2.5 rounded-lg text-sm inline-block">Start gratis <i class="fa-solid fa-arrow-right ml-1 text-xs"></i></a>
  </div>
</nav>

<!-- BREADCRUMB -->
<div style="padding-top:72px;">
  <div class="container" style="padding-top:10px;padding-bottom:10px;">
    <nav style="display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(61,46,30,0.4);flex-wrap:wrap;">
      <a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder</a> ›
      <a href="/nieuwbouw/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Nieuwbouw</a> ›
      <span style="color:#3D5A3E;font-weight:600;">{provincie}</span>
    </nav>
  </div>
</div>

<main id="main-content">

<!-- HERO -->
<section style="padding:48px 0 64px;background:#fff;">
  <div class="container">
    <div style="margin-bottom:16px;">
      <span style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#3D5A3E;">
        {emoji} {len(gemeenten)} gemeenten · {totaal_proj} projecten
      </span>
    </div>
    <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;margin-bottom:16px;line-height:1.1;">
      Nieuwbouw in {provincie}:<br>
      <span style="color:#3D5A3E;font-style:italic;font-weight:300;">alle gemeenten & projecten</span>
    </h1>
    <p style="font-size:16px;color:rgba(61,46,30,0.65);line-height:1.8;max-width:620px;margin-bottom:32px;">
      In {provincie} ondersteunt Bylder <strong style="color:#1A1208;">{totaal_proj} actieve nieuwbouwprojecten</strong> in <strong style="color:#1A1208;">{len(gemeenten)} gemeenten</strong>. Kopers in deze provincie besparen gemiddeld <strong style="color:#3D5A3E;">{gem_besp_fmt}</strong> op afwerking en inrichting via AI offerte check en collectieve korting.
    </p>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:700px;">
      <div style="background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:800;color:#1A1208;letter-spacing:-0.04em;">{len(gemeenten)}</div>
        <div style="font-size:11px;color:rgba(61,46,30,0.45);font-family:'Space Mono',monospace;margin-top:3px;">gemeenten</div>
      </div>
      <div style="background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:800;color:#3D5A3E;letter-spacing:-0.04em;">{totaal_proj}</div>
        <div style="font-size:11px;color:rgba(61,46,30,0.45);font-family:'Space Mono',monospace;margin-top:3px;">projecten</div>
      </div>
      <div style="background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:800;color:#B85C38;letter-spacing:-0.04em;">{gem_besp_fmt}</div>
        <div style="font-size:11px;color:rgba(61,46,30,0.45);font-family:'Space Mono',monospace;margin-top:3px;">gem. bespaard</div>
      </div>
      <div style="background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:800;color:#1A1208;letter-spacing:-0.04em;">10%</div>
        <div style="font-size:11px;color:rgba(61,46,30,0.45);font-family:'Space Mono',monospace;margin-top:3px;">korting merken</div>
      </div>
    </div>
  </div>
</section>

<div class="warm-divider"></div>

<!-- GEMEENTEN GRID -->
<section style="padding:64px 0;">
  <div class="container">
    <div style="display:flex;align-items:end;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
      <div>
        <h2 style="font-size:clamp(1.5rem,2.5vw,2rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;">
          Alle gemeenten in {provincie}
        </h2>
        <p style="font-size:14px;color:rgba(61,46,30,0.5);margin-top:6px;">Klik op een gemeente voor lokale marktdata, projecten en de 5% depot calculator</p>
      </div>
      <a href="https://mijn.bylder.com" class="cta-btn px-6 py-3 rounded-xl inline-flex items-center gap-2" style="font-size:13px;">
        Start QuickScan <i class="fa-solid fa-arrow-right text-xs"></i>
      </a>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
      {gemeente_cards}
    </div>
  </div>
</section>

<div class="warm-divider"></div>

<!-- FAQ -->
<section style="padding:64px 0;background:#fff;">
  <div class="container" style="max-width:760px;">
    <h2 style="font-size:clamp(1.5rem,2.5vw,2rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;margin-bottom:28px;">
      Veelgestelde vragen over nieuwbouw in {provincie}
    </h2>

    <div style="border:1px solid rgba(61,46,30,0.09);border-radius:14px;overflow:hidden;background:#fff;margin-bottom:10px;">
      <h3 style="margin:0;"><button class="faq-trigger" onclick="toggleFaq(this)" style="width:100%;text-align:left;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:#1A1208;">
        Welke nieuwbouwprojecten zijn er in {provincie}?
        <i class="fa-solid fa-chevron-down faq-icon" style="color:#3D5A3E;font-size:12px;flex-shrink:0;"></i>
      </button></h3>
      <div class="faq-body"><div style="padding:0 22px 18px;font-size:14px;line-height:1.75;color:rgba(61,46,30,0.7);">In {provincie} zijn momenteel <strong>{totaal_proj} actieve nieuwbouwprojecten</strong> verdeeld over {len(gemeenten)} gemeenten. De grootste projecten vind je in {', '.join(g['gemeente'] for g in top6[:4])}. Klik op een gemeente hierboven voor het complete projectoverzicht.</div></div>
    </div>

    <div style="border:1px solid rgba(61,46,30,0.09);border-radius:14px;overflow:hidden;background:#fff;margin-bottom:10px;">
      <h3 style="margin:0;"><button class="faq-trigger" onclick="toggleFaq(this)" style="width:100%;text-align:left;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:#1A1208;">
        Hoeveel bespaar ik als nieuwbouwkoper in {provincie}?
        <i class="fa-solid fa-chevron-down faq-icon" style="color:#3D5A3E;font-size:12px;flex-shrink:0;"></i>
      </button></h3>
      <div class="faq-body"><div style="padding:0 22px 18px;font-size:14px;line-height:1.75;color:rgba(61,46,30,0.7);">Kopers in {provincie} besparen gemiddeld <strong>{gem_besp_fmt}</strong> via Bylder. Dit is de gecombineerde besparing via AI-offerte controle, collectieve inkoopkorting bij 40+ merken en voucheractivaties. Per gemeente verschilt dit — klik op jouw gemeente voor de exacte cijfers.</div></div>
    </div>

    <div style="border:1px solid rgba(61,46,30,0.09);border-radius:14px;overflow:hidden;background:#fff;">
      <h3 style="margin:0;"><button class="faq-trigger" onclick="toggleFaq(this)" style="width:100%;text-align:left;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:none;border:none;font-family:inherit;font-size:15px;font-weight:700;color:#1A1208;">
        In welke gemeenten in {provincie} is Bylder actief?
        <i class="fa-solid fa-chevron-down faq-icon" style="color:#3D5A3E;font-size:12px;flex-shrink:0;"></i>
      </button></h3>
      <div class="faq-body"><div style="padding:0 22px 18px;font-size:14px;line-height:1.75;color:rgba(61,46,30,0.7);">Bylder is actief in alle {len(gemeenten)} gemeenten van {provincie}: {', '.join(g['gemeente'] for g in sorted(gemeenten, key=lambda x: x['gemeente']))}.</div></div>
    </div>
  </div>
</section>

<div class="warm-divider"></div>

<!-- CTA -->
<section style="padding:64px 0;background:#1A1208;text-align:center;">
  <div class="container">
    <h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:800;color:#F5F0E8;letter-spacing:-0.03em;margin-bottom:14px;line-height:1.1;">
      Klaar om slim te bouwen<br><span style="color:#8AAE8B;font-style:italic;font-weight:300;">in {provincie}?</span>
    </h2>
    <p style="font-size:15px;color:rgba(245,240,232,0.5);max-width:440px;margin:0 auto 28px;line-height:1.7;">Gratis QuickScan · gem. {gem_besp_fmt} bespaard · 10% korting bij 40+ merken</p>
    <a href="https://mijn.bylder.com" class="cta-btn px-8 py-4 rounded-xl inline-flex items-center gap-2" style="font-size:14px;">
      <i class="fa-solid fa-wand-magic-sparkles"></i> Start gratis QuickScan
    </a>
  </div>
</section>

<!-- INTERNE LINKS -->
<div class="warm-divider"></div>
<section style="padding:40px 0;background:rgba(237,230,216,0.4);">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
      <div>
        <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(61,46,30,0.35);margin-bottom:12px;">Andere provincies</p>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <a href="/nieuwbouw/noord-holland/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Noord-Holland</a>
          <a href="/nieuwbouw/zuid-holland/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Zuid-Holland</a>
          <a href="/nieuwbouw/utrecht/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Utrecht</a>
          <a href="/nieuwbouw/noord-brabant/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Noord-Brabant</a>
          <a href="/nieuwbouw/gelderland/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Gelderland</a>
          <a href="/nieuwbouw/" style="font-size:12px;color:#3D5A3E;font-weight:600;margin-top:3px;">Alle provincies →</a>
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(61,46,30,0.35);margin-bottom:12px;">Populaire gemeenten</p>
        <div style="display:flex;flex-direction:column;gap:7px;">
          {''.join(f'<a href="/nieuwbouw/{slug_prov}/{slugify(g["gemeente"])}/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">{g["gemeente"]}</a>' for g in top6)}
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(61,46,30,0.35);margin-bottom:12px;">Kopersbegeleiding</p>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <a href="/kopersbegeleiding-nieuwbouw/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Wat is kopersbegeleiding?</a>
          <a href="/kopersbegeleiding/meerwerklijst-nieuwbouw-controleren/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Meerwerklijst controleren</a>
          <a href="/nieuwbouw-gids/oplevering/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Checklist oplevering</a>
          <a href="/kopersbegeleiding-nieuwbouw/" style="font-size:12px;color:#3D5A3E;font-weight:600;margin-top:3px;">Alle begeleiding →</a>
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(61,46,30,0.35);margin-bottom:12px;">Tools</p>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <a href="/ai-offerte-check-aannemer/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Aannemer offerte check</a>
          <a href="/online-budget-tracker-verbouwing/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Budget tracker</a>
          <a href="/nieuwbouw-gids/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">Nieuwbouw gidsen</a>
          <a href="/#vouchers" style="font-size:12px;color:#3D5A3E;font-weight:600;margin-top:3px;">Alle vouchers →</a>
        </div>
      </div>
    </div>
  </div>
</section>

</main>

<!-- FOOTER -->
<div class="warm-divider"></div>
<footer style="padding:48px 0 28px;background:#1A1208;">
  <div class="container">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="width:30px;height:30px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;">
        <span style="color:#F5F0E8;font-size:12px;font-weight:800;font-family:'Space Mono',monospace;">B.</span>
      </div>
      <span style="font-weight:700;font-size:17px;letter-spacing:-0.02em;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:13px;color:rgba(245,240,232,0.3);max-width:300px;line-height:1.6;margin-bottom:20px;">AI-platform voor nieuwbouwkopers. Actief in alle gemeenten van {provincie} en heel Nederland.</p>
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:16px;border-top:1px solid rgba(245,240,232,0.08);">
      <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2025 Bylder Nederland B.V. · KvK 65020006</p>
      <div style="display:flex;gap:16px;">
        <a href="/privacy/" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Privacy</a>
        <a href="/algemene-voorwaarden/" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Voorwaarden</a>
        <a href="/sitemap.xml" style="font-size:12px;color:rgba(245,240,232,0.25);text-decoration:none;">Sitemap</a>
      </div>
    </div>
  </div>
</footer>

<script>
function toggleFaq(btn) {{
  const body = btn.parentElement.nextElementSibling;
  const isOpen = body.classList.contains('open');
  document.querySelectorAll('.faq-body.open').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.faq-trigger.active').forEach(b => b.classList.remove('active'));
  if (!isOpen) {{ body.classList.add('open'); btn.classList.add('active'); }}
}}
</script>
</body>
</html>"""

    return html

# Genereer alle provincie-pagina's
generated = 0
sitemap_urls = []

for provincie, gemeenten in sorted(provincies.items()):
    slug_prov = slugify(provincie)
    out_dir   = OUTPUT_DIR / "nieuwbouw" / slug_prov
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file  = out_dir / "index.html"

    html = generate_provincie_page(provincie, gemeenten)
    out_file.write_text(html, encoding="utf-8")

    url = f"{BASE_URL}/nieuwbouw/{slug_prov}/"
    sitemap_urls.append(url)
    generated += 1
    print(f"[OK] {url}")

# Voeg ook /nieuwbouw/ hoofdpagina toe
nieuwbouw_dir = OUTPUT_DIR / "nieuwbouw"
nieuwbouw_dir.mkdir(parents=True, exist_ok=True)

# Simpele redirect/overzichtspagina voor /nieuwbouw/
alle_provincies = sorted(provincies.items())
prov_cards = ""
for prov, gemeenten in alle_provincies:
    slug = slugify(prov)
    totaal = sum(int(g['aantal_projecten']) for g in gemeenten)
    emoji = {"Noord-Holland":"🌷","Zuid-Holland":"🏙️","Utrecht":"🏛️","Noord-Brabant":"🌳","Gelderland":"🦅","Overijssel":"💧","Flevoland":"🌊","Groningen":"⚡","Friesland":"⛵","Drenthe":"🌲","Zeeland":"🦞","Limburg":"🏔️"}.get(prov,"🏠")
    prov_cards += f"""<a href="/nieuwbouw/{slug}/" style="text-decoration:none;display:block;background:#F5F0E8;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px;transition:all 0.2s;" onmouseover="this.style.background='#fff';this.style.borderColor='rgba(61,90,62,0.25)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#F5F0E8';this.style.borderColor='rgba(61,46,30,0.08)';this.style.transform=''">
  <div style="font-size:1.8rem;margin-bottom:8px;">{emoji}</div>
  <div style="font-size:16px;font-weight:800;color:#1A1208;margin-bottom:4px;">{prov}</div>
  <div style="font-size:13px;color:rgba(61,46,30,0.5);margin-bottom:10px;">{len(gemeenten)} gemeenten · {totaal} projecten</div>
  <div style="font-size:13px;font-weight:700;color:#3D5A3E;display:flex;align-items:center;gap:5px;">Bekijk gemeenten <i class="fa-solid fa-arrow-right" style="font-size:10px;"></i></div>
</a>"""

overzicht_html = f"""<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nieuwbouw per gemeente — heel Nederland | Bylder</title>
<meta name="description" content="Bylder is actief in 288 gemeenten verdeeld over 12 provincies. Vind jouw gemeente en ontdek actuele nieuwbouwprojecten, AI offerte check en collectieve korting.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{BASE_URL}/nieuwbouw/">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{{box-sizing:border-box}}body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden}}
.container{{width:100%!important;max-width:1280px!important;margin-left:auto!important;margin-right:auto!important;padding-left:48px!important;padding-right:48px!important}}
@media(max-width:768px){{.container{{padding-left:20px!important;padding-right:20px!important}}}}
.glass-nav{{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08)}}
.cta-btn{{background:#3D5A3E;color:#F5F0E8;font-weight:700;transition:all 0.25s;text-decoration:none}}
.warm-divider{{background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);height:1px}}
</style>
</head>
<body>
<nav class="glass-nav fixed top-0 left-0 right-0 z-50 py-4">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:flex;align-items:center;justify-content:center;"><span style="color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace;">B.</span></div>
      <span style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <a href="https://mijn.bylder.com" class="cta-btn px-5 py-2.5 rounded-lg text-sm inline-block">Start gratis <i class="fa-solid fa-arrow-right ml-1 text-xs"></i></a>
  </div>
</nav>
<main style="padding-top:72px;">
  <section style="padding:56px 0 64px;background:#fff;">
    <div class="container">
      <div style="text-align:center;max-width:640px;margin:0 auto 48px;">
        <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;margin-bottom:14px;">Nieuwbouw per gemeente</h1>
        <p style="font-size:16px;color:rgba(61,46,30,0.6);line-height:1.75;">Bylder is actief in <strong style="color:#1A1208;">288 gemeenten</strong> verdeeld over alle 12 provincies. Kies jouw provincie.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">{prov_cards}</div>
    </div>
  </section>
</main>
<div class="warm-divider"></div>
<footer style="padding:40px 0 24px;background:#1A1208;">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <span style="font-weight:700;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2025 Bylder Nederland B.V.</p>
  </div>
</footer>
</body>
</html>"""

(nieuwbouw_dir / "index.html").write_text(overzicht_html, encoding="utf-8")
sitemap_urls.append(f"{BASE_URL}/nieuwbouw/")
generated += 1
print(f"[OK] {BASE_URL}/nieuwbouw/")

print(f"\n{'='*50}")
print(f"Gegenereerd: {generated} provincie-pagina's")
print(f"{'='*50}")
