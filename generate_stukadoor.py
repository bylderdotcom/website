#!/usr/bin/env python3
"""
Stukadoor-autoriteitspillar /stukadoor/ — eerste pagina van de vakbedrijven-laag.
Dual-audience: nieuwbouw-/verbouwkopers (wat doet Bylder voor jou) + stukadoors
(voordelen om je profiel te claimen). Plus marktcijfers, trends en de neutrale
review-meta-laag. Volledig SEO/GEO/AEO/schema/CRO/a11y geoptimaliseerd.

Prijzen INDICATIEF (NL 2026), gehedged. Gebruik: python3 generate_stukadoor.py
"""
import os, html, json, re, unicodedata

BASE = "https://www.bylder.com"
SLUG = "/stukadoor"
SIGNUP = "https://app.bylder.com/registreer"
VOORDELEN = "/voor-vakbedrijven"   # overtuigings-/activatiepagina voor vakbedrijven (€79)
INTAKE = "mailto:partners@bylder.com?subject=Mijn%20bedrijf%20aanmelden%20op%20Bylder&body=Bedrijfsnaam%3A%0APlaats%3A%0AGoogle-%2FWerkspot-%2Fwebsite-link%3A%0A"
OFFERTE_HUB = "/offerte-check"
ROOT = os.path.dirname(os.path.abspath(__file__))

def euro(n): return "€" + format(n, ",d").replace(",", ".")

# Marktprijzen per werksoort (NL 2026, indicatief). Wandstucwerk-rij = mirror van
# de Prijs-benchmark (src/lib/priceBenchmarks.ts 'stucwerk' 18/26/38) — in sync houden.
WERKSOORTEN = [
    {"naam": "Spuitwerk / spackspuiten (plafond & wand)", "low": 8, "high": 14,
     "uitleg": "Machinaal spuitpleister op plafonds en wanden — de snelste en goedkoopste afwerking, sausklaar."},
    {"naam": "Wanden behangklaar pleisteren", "low": 14, "high": 22,
     "uitleg": "Wanden vlak en strak voor behang; iets minder voorwerk dan sausklaar glad."},
    {"naam": "Wanden glad pleisteren (sausklaar)", "low": 18, "high": 38,
     "uitleg": "Glad pleisterwerk dat direct schilderbaar is — meer handwerk, hoogste kwaliteit binnenwerk."},
    {"naam": "Sierpleister / decoratief (kalk, betonlook, Marokkaans)", "low": 40, "high": 95,
     "uitleg": "Ambachtelijk decoratief pleisterwerk; sterk afhankelijk van techniek en materiaal."},
    {"naam": "Buitenstucwerk / gevelpleister", "low": 45, "high": 90,
     "uitleg": "Gevelafwerking; in combinatie met gevelisolatie (na-isolatie) loopt de prijs verder op."},
]

FACTOREN = [
    "Werksoort en afwerkniveau — spuitwerk is goedkoper dan glad sausklaar handwerk.",
    "Staat van de ondergrond — voorstrijken, uitvlakken en herstel kosten extra arbeid.",
    "Oppervlak en bereikbaarheid — grotere vlakken hebben een lagere prijs per m²; hoge plafonds en trapgaten juist hoger.",
    "Regio en drukte — in de Randstad en bij lange wachttijden liggen de tarieven doorgaans hoger.",
    "Materiaalkeuze — duurzame kalk- en leempleisters of speciale sierpleisters zijn duurder dan standaard gips.",
]

TRENDS = [
    ("Personeelstekort & wachttijden", "De afbouwsector kampt structureel met een tekort aan vakmensen. Goede stukadoors zijn weken tot maanden vooruit volgeboekt — wie op tijd plant en vergelijkt, betaalt minder en wacht korter."),
    ("Machinaal spuiten wint terrein", "Spuitpleister (machinaal) verdringt voor standaardwerk steeds vaker het handmatige glad pleisteren: sneller, gelijkmatiger en goedkoper per m². Voor strak design-werk blijft handwerk de norm."),
    ("Duurzame pleisters in opmars", "Kalk- en leempleisters worden populairder vanwege vochtregulatie en een gezonder binnenklimaat — een hoger tarief, maar gevraagd in bewuste nieuwbouw en renovatie."),
    ("Gevelisolatie met stucafwerking", "Buitenstucwerk groeit door na-isolatie van gevels. In combinatie met isolatie zijn er soms subsidies — wat de terugverdientijd verkort."),
    ("Stijgende loon- en materiaalkosten", "Tarieven zijn de afgelopen jaren gestegen door hogere loon- en gipskosten. Daardoor lopen offertes voor hetzelfde werk sterker uiteen — vergelijken loont meer dan ooit."),
]

STEDEN = ["amsterdam","rotterdam","den-haag","utrecht","eindhoven","groningen","tilburg",
          "almere","breda","nijmegen","apeldoorn","haarlem","arnhem","amersfoort","zwolle"]
def stadnaam(s): return s.replace("-", " ").title().replace("Den ", "Den ")

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
      <a href="/vouchers/">Vouchers</a>
      <a href="/functies/">Functies</a>
      <a href="/eerlijke-prijzen/">Eerlijke prijzen</a>
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
    <a href="/vouchers/">Vouchers</a>
    <a href="/functies/">Functies</a>
    <a href="/eerlijke-prijzen/">Eerlijke prijzen</a>
    <a href="/prijzen/">Prijzen</a>
    <a href="https://app.bylder.com">Inloggen</a>
    <a href="{SIGNUP}" class="m-cta">Start gratis &#8594;</a>
  </div>
</nav>"""

def head(title, desc, canonical, schema_blocks, robots="index,follow"):
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
<meta name="robots" content="{robots}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
{schema}
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.7;}}
h1,h2,h3{{letter-spacing:-0.02em;color:#1A1208;}}
a{{color:#3D5A3E;}}
.container{{max-width:1180px;margin:0 auto;padding:0 48px;}}
.badge{{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}}
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}}
.grid-2{{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;font-size:14px;color:rgba(61,46,30,0.78);line-height:1.7;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:11px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;padding:13px 16px;transition:border-color .15s;font-size:14px;font-weight:600;}}
.tile:hover{{border-color:rgba(61,90,62,0.4);}}
.ptable{{width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;overflow:hidden;font-size:14.5px;}}
.ptable th{{text-align:left;background:rgba(61,90,62,0.07);padding:13px 16px;font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.05em;color:rgba(61,46,30,0.6);}}
.ptable td{{padding:13px 16px;border-top:1px solid rgba(61,46,30,0.07);vertical-align:top;}}
.ptable td.price{{font-weight:800;color:#1A1208;white-space:nowrap;}}
.reviewbar{{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0;}}
.reviewbar span{{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid rgba(61,46,30,0.12);border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;color:#1A1208;}}
.reviewbar small{{color:rgba(61,46,30,0.5);font-weight:400;}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-2,.grid-3{{grid-template-columns:1fr;}}.hero-grid{{grid-template-columns:1fr!important;gap:32px!important;}}aside{{position:static!important;}}}}
{NAV_CSS}
</style></head>
<body>{NAV_HTML}"""

FOOTER = """<footer style="background:#1A1208;padding:56px 0;">
  <div style="max-width:1180px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:30px;height:30px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:12px;">B.</div>
      <span style="font-weight:700;font-size:16px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.4);max-width:620px;line-height:1.6;">Prijzen zijn indicatieve marktbandbreedtes (NL 2026) en verschillen per project, regio en afwerking. Reviewscores zijn afkomstig van de genoemde externe platforms; bekijk de volledige beoordelingen bij de bron. Bylder is een onafhankelijk platform en geen stukadoorsbedrijf.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer></body></html>"""

def faq_schema(qa): return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
def breadcrumb(items): return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}
def faq_html(qa): return '<h2 style="font-size:1.5rem;font-weight:800;margin:8px 0 12px;">Veelgestelde vragen over stukadoors</h2>' + "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{a}</p></div>' for q, a in qa)


def load_vakbedrijven(vak):
    path = os.path.join(ROOT, "data", "vakbedrijven.json")
    if not os.path.exists(path): return []
    rows = [b for b in json.load(open(path, encoding="utf-8")).get("vakbedrijven", [])
            if b.get("vak") == vak and not b.get("opt_out") and b.get("naam")]
    rows.sort(key=lambda b: ((b.get("stad") or "zzz"), b.get("naam") or ""))
    return rows


MIN_PER_STAD = 3        # index-gate: minder bedrijven → noindex (voorkomt dunne pagina's)


def _slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")


def _prominentie(b):
    return (-(b.get("google_reviews") or 0), -(b.get("google_rating") or 0))


def per_stad(bedrijven):
    """Groepeer op stad → bedrijven (gesorteerd op prominentie). Sleutel = (label, slug)."""
    groepen = {}
    for b in bedrijven:
        stad = (b.get("stad") or "").strip()
        if not stad:
            continue
        groepen.setdefault(stad, []).append(b)
    out = {}
    for stad, lijst in groepen.items():
        out[stad] = sorted(lijst, key=_prominentie)
    return out


def bedrijf_card(b):
    naam = html.escape(b["naam"])
    stad = html.escape(b.get("stad") or "Nederland")
    site = b.get("website")
    rating = b.get("google_rating")
    score = (f'<span style="font-size:12px;color:#3D5A3E;font-weight:700;white-space:nowrap;">Google &#9733; {rating} '
             f'<span style="color:rgba(61,46,30,0.45);font-weight:400;">({b.get("google_reviews") or 0})</span></span>') if rating else ""
    link = (f'<a href="{html.escape(site)}" target="_blank" rel="nofollow noopener" style="font-size:13px;font-weight:700;">Website &#8594;</a>'
            if site else '<span style="font-size:12px;color:rgba(61,46,30,0.4);">Nog geen website bekend</span>')
    return (f'<div class="card" style="padding:16px 18px;">'
            f'<div style="display:flex;justify-content:space-between;gap:10px;align-items:start;">'
            f'<div><div style="font-weight:700;font-size:15px;color:#1A1208;">{naam}</div>'
            f'<div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">{stad}</div></div>{score}</div>'
            f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">{link}'
            f'<a href="https://app.bylder.com/vakbedrijf/claim/{b["slug"]}" style="font-size:11.5px;color:rgba(61,46,30,0.45);text-decoration:underline;">Is dit jouw bedrijf? Claim &#8594;</a></div>'
            f'</div>')


def bedrijven_grid(lijst):
    return f'<div class="grid-3">{"".join(bedrijf_card(b) for b in lijst)}</div>'


def claim_cta(stad_label=None):
    waar = f" in {html.escape(stad_label)}" if stad_label else ""
    return (f'<div style="background:rgba(184,92,56,0.06);border:1px solid rgba(184,92,56,0.2);border-radius:14px;padding:18px 20px;margin:22px 0;">'
            f'<div style="font-weight:700;color:#1A1208;font-size:15px;margin-bottom:4px;">Ben jij stukadoor{waar}? Sta erbij.</div>'
            f'<div style="font-size:13.5px;color:rgba(61,46,30,0.7);line-height:1.6;margin-bottom:12px;">Vermelding is gratis. Activeer je profiel eenmalig voor &euro;79 en word gekoppeld aan nieuwbouw- en verbouwkopers die n&uacute; een stukadoor zoeken &mdash; geen terugkerende leadkosten.</div>'
            f'<a href="{VOORDELEN}/" style="display:inline-block;background:#B85C38;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Bekijk de voordelen &amp; meld je aan &#8594;</a></div>'
            f'<p style="font-size:11px;color:rgba(61,46,30,0.4);margin-top:8px;">Bedrijfsgegevens via Google &amp; OpenStreetMap (&copy; OpenStreetMap-bijdragers, ODbL). Reviewscores afkomstig van de genoemde bronnen. Klopt iets niet? Laat het ons weten.</p>')


def offerte_check_slug_bestaat(slug):
    return os.path.isdir(os.path.join(ROOT, "offerte-check", "stukadoor", slug))


def build_city_page(stad, lokaal):
    slug = _slug(stad)
    n = len(lokaal)
    canonical = f"{BASE}{SLUG}/{slug}/"
    indexeer = n >= MIN_PER_STAD
    title = f"Stukadoor in {stad} nodig? {n} bedrijven, reviews & prijzen (2026) | Bylder"
    desc = (f"Vind en vergelijk {n} stukadoors in {stad}: reviews, websites en marktprijzen per m&sup2;. "
            f"Check gratis of je offerte eerlijk is. Onafhankelijk overzicht van Bylder.")
    qa = [
        (f"Wat kost een stukadoor in {stad}?",
         "Indicatief reken je in 2026 op &euro;8&ndash;&euro;14/m&sup2; voor spuitwerk, &euro;14&ndash;&euro;22/m&sup2; voor behangklaar "
         "en &euro;18&ndash;&euro;38/m&sup2; voor glad sausklaar. De prijs hangt af van de ondergrond, het afwerkniveau en het oppervlak. "
         "Check je offerte gratis tegen actuele marktdata."),
        (f"Hoe vind ik een goede stukadoor in {stad}?",
         f"Vergelijk de stukadoors in {stad} op beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n platform. "
         "Bylder toont ze neutraal en laat je je offerte per post controleren op een eerlijke prijs."),
    ]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("Stukadoor", f"{BASE}{SLUG}/"), (stad, canonical)]),
        {"@context": "https://schema.org", "@type": "ItemList", "name": f"Stukadoors in {stad}",
         "itemListElement": [
             {"@type": "ListItem", "position": i + 1,
              "item": {k: v for k, v in {
                  "@type": "LocalBusiness", "name": b["naam"], "url": b.get("website"),
                  "address": {"@type": "PostalAddress", "addressLocality": b.get("stad"), "addressCountry": "NL"},
              }.items() if v}}
             for i, b in enumerate(lokaal)]},
    ]
    oc = f'<a href="{OFFERTE_HUB}/stukadoor/{slug}/">offerte-check voor {html.escape(stad)}</a>' if offerte_check_slug_bestaat(slug) else f'<a href="{OFFERTE_HUB}/">offerte-check</a>'
    body = f"""<main style="padding:48px 0 20px;"><div class="container" style="max-width:1000px;">
  <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:18px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> &rarr; <a href="{SLUG}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Stukadoor</a> &rarr; <span style="color:rgba(61,46,30,0.6);">{html.escape(stad)}</span></p>
  <div class="badge">Stukadoors &middot; {html.escape(stad)}</div>
  <h1 style="font-size:2.3rem;font-weight:800;line-height:1.14;margin-bottom:12px;">Stukadoors in {html.escape(stad)}</h1>
  <p style="font-size:1.08rem;color:rgba(61,46,30,0.7);line-height:1.7;max-width:760px;margin-bottom:8px;">
    {n} stukadoorsbedrijven in en rond {html.escape(stad)}, met hun beoordelingen en websites naast elkaar. Bylder toont ze
    <strong>neutraal</strong> &mdash; en laat je gratis checken of je offerte een eerlijke prijs heeft.</p>
  <div class="highlight">Marktprijs stucwerk (2026): spuitwerk &euro;8&ndash;&euro;14/m&sup2;, behangklaar &euro;14&ndash;&euro;22/m&sup2;, glad sausklaar &euro;18&ndash;&euro;38/m&sup2;. Bekijk de volledige <a href="{SLUG}/">marktprijzen en werksoorten</a>.</div>

  <h2 style="font-size:1.5rem;font-weight:800;margin:32px 0 14px;">{n} stukadoors in {html.escape(stad)}</h2>
  {bedrijven_grid(lokaal)}
  {claim_cta(stad)}

  <div style="background:#3D5A3E;border-radius:18px;padding:34px;text-align:center;margin:32px 0;">
    <h2 style="font-size:1.45rem;font-weight:800;color:#F5F0E8;margin-bottom:10px;">Een offerte van een stukadoor in {html.escape(stad)}?</h2>
    <p style="color:rgba(245,240,232,0.72);margin-bottom:20px;max-width:540px;margin-left:auto;margin-right:auto;font-size:14.5px;line-height:1.6;">Check gratis of je prijs per m&sup2; marktconform is voordat je tekent.</p>
    <a href="{SIGNUP}" class="cta-primary">Check je prijs gratis &#8594;</a>
  </div>

  <div class="divider"></div>
  {faq_html(qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder: terug naar <a href="{SLUG}/">stukadoors &amp; marktprijzen</a> &middot; {oc} &middot; <a href="/eerlijke-prijzen/stucwerk/">wat kost stucwerk per m&sup2;</a></p>
  </div></main>"""
    robots = "index,follow" if indexeer else "noindex,follow"
    return head(title, desc, canonical, schema, robots=robots) + body + FOOTER


def build_pillar():
    title = "Stukadoor nodig? Marktprijzen, kosten per m² & een eerlijke offerte (2026) | Bylder"
    desc = ("Wat kost een stukadoor in 2026? Marktprijzen per m² per werksoort, de trends in de branche en hoe je via "
            "Bylder een eerlijke offerte checkt. Plus: stukadoors, claim je gratis neutrale profiel.")
    canonical = f"{BASE}{SLUG}/"
    bedrijven = load_vakbedrijven("stukadoor")
    groepen = per_stad(bedrijven)
    steden_idx = sorted([(s, l) for s, l in groepen.items() if len(l) >= MIN_PER_STAD],
                        key=lambda x: (-len(x[1]), x[0]))
    top_landelijk = sorted([b for b in bedrijven if b.get("google_reviews")], key=_prominentie)[:9]

    qa = [
        ("Wat kost een stukadoor per m² in 2026?",
         "Indicatief reken je in 2026 op &euro;8&ndash;&euro;14/m&sup2; voor spuitwerk (sausklaar plafond en wand), "
         "&euro;14&ndash;&euro;22/m&sup2; voor behangklaar en &euro;18&ndash;&euro;38/m&sup2; voor glad sausklaar handwerk. "
         "Sierpleister en buitenstucwerk liggen hoger (&euro;40&ndash;&euro;95/m&sup2;). De exacte prijs hangt af van de ondergrond, "
         "het afwerkniveau, het oppervlak en de regio."),
        ("Hoe weet ik of mijn stukadoor-offerte eerlijk is?",
         "Vergelijk de prijs per m&sup2; per werksoort met de marktbandbreedte. Bylder controleert je offerte per post met "
         "actuele marktdata en zegt of die marktconform (groen), twijfelachtig (oranje) of te hoog (rood) is &mdash; met een "
         "concreet onderhandelpunt. Gemiddelde besparing via de offerte-check: &euro;1.640."),
        ("Wat is het verschil tussen spuitwerk en glad pleisteren?",
         "Spuitwerk (spackspuiten) wordt machinaal aangebracht en is sneller en goedkoper, met een licht korrelige sausklare "
         "afwerking. Glad pleisteren is handwerk dat een volledig vlakke, direct schilderbare wand oplevert &mdash; arbeidsintensiever "
         "en daardoor duurder per m&sup2;."),
        ("Is Bylder een stukadoorsbedrijf of bemiddelaar?",
         "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen stucwerk en zijn geen leadverkoper. "
         "We helpen kopers een eerlijke prijs te betalen en tonen stukadoors neutraal &mdash; met beoordelingsscores van "
         "verschillende externe bronnen naast elkaar."),
        ("Ik ben stukadoor &mdash; wat kost een profiel op Bylder?",
         "Vermelding is gratis. Wil je je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan kopers-projecten &mdash; "
         "dan kost dat eenmalig &euro;79 (geen abonnement). Je deelt je Werkspot-, Google- of websitelink en wij stellen je profiel samen. "
         "Je betaalt geen terugkerende leadkosten; Bylder brengt je in contact met nieuwbouw- en verbouwkopers op het moment dat zij stucwerk plannen."),
    ]

    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("Stukadoor", canonical)]),
        {"@context": "https://schema.org", "@type": "Article",
         "headline": "Stukadoor nodig? Marktprijzen, kosten per m² en een eerlijke offerte (2026)",
         "description": desc, "inLanguage": "nl-NL",
         "author": {"@type": "Organization", "name": "Bylder.com"},
         "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V."}},
        {"@context": "https://schema.org", "@type": "Service",
         "serviceType": "Stukadoor offerte-check en marktprijsvergelijking",
         "areaServed": {"@type": "Country", "name": "Nederland"},
         "provider": {"@type": "Organization", "name": "Bylder.com", "url": BASE + "/"},
         "description": "Onafhankelijke controle van stukadoor-offertes op marktconformiteit en een neutraal overzicht van stukadoors."},
    ]
    if top_landelijk:
        schema.append({"@context": "https://schema.org", "@type": "ItemList", "name": "Hoogst beoordeelde stukadoors in Nederland",
                       "itemListElement": [
                           {"@type": "ListItem", "position": i + 1,
                            "item": {k: v for k, v in {
                                "@type": "LocalBusiness", "name": b["naam"], "url": b.get("website"),
                                "address": {"@type": "PostalAddress", "addressLocality": b.get("stad"), "addressCountry": "NL"} if b.get("stad") else None,
                            }.items() if v}}
                           for i, b in enumerate(top_landelijk)]})

    # Marktprijs-tabel
    rows = "".join(
        f'<tr><td>{html.escape(w["naam"])}<div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:3px;">{html.escape(w["uitleg"])}</div></td>'
        f'<td class="price">{euro(w["low"])}&ndash;{euro(w["high"])}<div style="font-size:11px;font-weight:400;color:rgba(61,46,30,0.45);">per m&sup2;</div></td></tr>'
        for w in WERKSOORTEN)
    factoren = "".join(f"<li>{html.escape(x)}</li>" for x in FACTOREN)
    trends = "".join(
        f'<div class="card"><div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:6px;">{html.escape(t)}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.68);line-height:1.65;">{html.escape(d)}</div></div>'
        for t, d in TRENDS)
    stad_tiles = "".join(
        f'<a href="{SLUG}/{_slug(s)}/" class="tile">Stukadoors in {html.escape(s)} <span style="color:rgba(61,46,30,0.4);font-weight:400;">({len(l)})</span></a>'
        for s, l in steden_idx)
    highlight_grid = bedrijven_grid(top_landelijk) if top_landelijk else ""

    body = f"""<main style="padding:56px 0 20px;"><div class="container">

  <!-- HERO -->
  <div style="max-width:820px;">
    <div class="badge">Stukadoors &middot; Marktgids 2026</div>
    <h1 style="font-size:2.7rem;font-weight:800;line-height:1.12;margin-bottom:16px;">Een stukadoor met een eerlijke prijs &mdash; en een eerlijk oordeel</h1>
    <p style="font-size:1.15rem;color:rgba(61,46,30,0.7);line-height:1.7;margin-bottom:22px;">
      Stucwerk is een van de posten waar offertes het sterkst uiteenlopen. Bylder laat je zien wat een eerlijke prijs per m&sup2;
      is, controleert je offerte per post, en toont stukadoors <strong>neutraal</strong> &mdash; met beoordelingen uit
      meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <a href="{SIGNUP}" style="background:#3D5A3E;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Check je stucwerk-offerte gratis &#8594;</a>
      <a href="#voor-stukadoors" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Ik ben stukadoor &#8594;</a>
    </div>
  </div>

  <div class="divider"></div>

  <!-- DUAL AUDIENCE -->
  <div class="grid-2">
    <div class="card">
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#3D5A3E;margin-bottom:10px;">Voor jou als koper</p>
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:12px;">Wat Bylder voor je doet</h2>
      <ul class="check-list">
        <li><strong>Offerte-check per post.</strong> Upload je stukadoor-offerte en zie per regel of de prijs marktconform is.</li>
        <li><strong>Prijs-benchmark.</strong> Vergelijk je prijs per m&sup2; direct met actuele marktdata &mdash; niet met een gok.</li>
        <li><strong>Neutraal vergelijken.</strong> Beoordelingen van Werkspot, Google en Trustpilot naast elkaar, zodat je niet op &eacute;&eacute;n bron hoeft te vertrouwen.</li>
        <li><strong>Kortingsvouchers</strong> bij aangesloten afbouw- en woonpartners.</li>
      </ul>
      <a href="{SIGNUP}" style="display:inline-block;margin-top:16px;background:#3D5A3E;color:#F5F0E8;padding:11px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Start gratis &#8594;</a>
    </div>
    <div class="card" id="voor-stukadoors">
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#B85C38;margin-bottom:10px;">Voor stukadoors</p>
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:12px;">Claim je gratis profiel</h2>
      <ul class="check-list">
        <li><strong>Geen velden invullen.</strong> Deel je Werkspot-, Google- of websitelink en wij stellen je profiel samen.</li>
        <li><strong>Hoog-intentie kopers.</strong> Nieuwbouw- en verbouwkopers die n&uacute; stucwerk plannen &mdash; geen koude leads.</li>
        <li><strong>Geen vaste leadkosten.</strong> Geen veiling om dezelfde lead; je betaalt niet per klik.</li>
        <li><strong>Je reviews gebundeld.</strong> Je scores van alle platforms samen &mdash; eerlijk en transparant.</li>
      </ul>
      <a href="{VOORDELEN}/" style="display:inline-block;margin-top:16px;background:#B85C38;color:#F5F0E8;padding:11px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Voordelen voor stukadoors &#8594;</a>
    </div>
  </div>

  <!-- NEUTRALITEIT / REVIEW-METALAAG -->
  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 10px;">Eén stukadoor, alle beoordelingen op één plek</h2>
  <p style="font-size:15.5px;color:rgba(61,46,30,0.68);max-width:760px;margin-bottom:8px;">
    De meeste platforms tonen alleen hun eigen reviews. Dat geeft een gekleurd beeld. Bylder bundelt de
    beoordelingsscores van meerdere onafhankelijke bronnen, zodat je in &eacute;&eacute;n oogopslag ziet hoe een
    stukadoor er echt voor staat. Voor de volledige reviews linken we door naar de bron.
  </p>
  <div class="reviewbar" aria-label="Voorbeeld van gebundelde beoordelingsscores">
    <span>Werkspot &#9733; 4,7 <small>(213)</small></span>
    <span>Google &#9733; 4,5 <small>(88)</small></span>
    <span>Trustpilot &#9733; 4,6 <small>(40)</small></span>
    <small style="align-self:center;color:rgba(61,46,30,0.45);font-size:12px;">voorbeeldweergave</small>
  </div>
  <div class="highlight">Bylder verkoopt geen stucwerk en is geen leadveiling. Daardoor kunnen we onafhankelijk vergelijken &mdash; in jouw belang als koper, en eerlijk voor de vakman.</div>

  <!-- MARKTPRIJZEN -->
  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">Wat kost een stukadoor in 2026? Marktprijzen per m&sup2;</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">Indicatieve bandbreedtes per werksoort (laag&ndash;hoog), NL 2026. Inclusief materiaal en arbeid, exclusief btw en voorrijkosten.</p>
  <table class="ptable">
    <thead><tr><th>Werksoort</th><th>Prijs</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <h3 style="font-size:1.2rem;font-weight:700;margin:28px 0 10px;">Wat bepaalt de prijs?</h3>
  <ul class="check-list">{factoren}</ul>

  <!-- CTA PRIJS-BENCHMARK -->
  <div style="background:#3D5A3E;border-radius:20px;padding:42px;text-align:center;margin:44px 0;">
    <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">Bylder Prijs-benchmark</p>
    <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Betaal jij een eerlijke prijs voor je stucwerk?</h2>
    <p style="color:rgba(245,240,232,0.72);margin-bottom:24px;max-width:560px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.65;">Vul je geoffreerde prijs per m&sup2; in en zie direct of die marktconform is. Met lidmaatschap controleert Bylder je hele offerte automatisch &mdash; gemiddeld &euro;1.640 bespaard.</p>
    <a href="{SIGNUP}" class="cta-primary">Check je prijs gratis &#8594;</a>
  </div>

  <!-- TRENDS -->
  <h2 style="font-size:1.6rem;font-weight:800;margin:8px 0 6px;">Trends in de stukadoorsbranche</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;max-width:760px;">Wat er speelt in de afbouwsector &mdash; en wat het betekent voor jouw prijs en planning.</p>
  <div class="grid-2">{trends}</div>

  <!-- HOOGST BEOORDEELD (landelijk) -->
  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">Hoogst beoordeelde stukadoors van Nederland</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;max-width:760px;">Een onafhankelijk, groeiend overzicht van {len(bedrijven)} stukadoorsbedrijven &mdash; hier de best beoordeelde. Bekijk je eigen plaats hieronder.</p>
  {highlight_grid}
  {claim_cta()}

  <!-- PER STAD -->
  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">Stukadoors per stad</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;">Bekijk de stukadoors, reviews en marktprijzen voor jouw plaats:</p>
  <div class="grid-3">{stad_tiles}</div>

  <div class="divider"></div>

  <!-- FAQ -->
  {faq_html(qa)}

  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder lezen: <a href="/eerlijke-prijzen/stucwerk/">wat kost stucwerk per m&sup2;</a> &middot; <a href="/meerwerk/">meerwerk bij nieuwbouw</a> &middot; <a href="/functies/">alle functies van Bylder</a> &middot; <a href="/vouchers/">kortingsvouchers</a></p>

  </div></main>"""
    return head(title, desc, canonical, schema) + body + FOOTER


def build_voor_vakbedrijven(aantal_bedrijven, aantal_steden):
    """Overtuigings- + activatiepagina voor vakbedrijven (€79). CTA = aanmeld-intake."""
    canonical = f"{BASE}{VOORDELEN}/"
    title = "Voor vakbedrijven: sta waar kopers je zoeken — eenmalig €79 | Bylder"
    desc = ("Stukadoors, schilders, installateurs en andere vakbedrijven: activeer je Bylder-profiel voor eenmalig €79. "
            "Geen abonnement, geen leadveiling. Gekoppeld aan nieuwbouw- en verbouwkopers op het juiste moment.")
    qa = [
        ("Wat kost een profiel op Bylder?",
         "Vermelding is gratis &mdash; veel bedrijven staan er al in. Je profiel <strong>activeren</strong> kost eenmalig &euro;79. "
         "Geen abonnement en geen terugkerende leadkosten."),
        ("Wat is het verschil met Werkspot of een leadplatform?",
         "Bij leadplatforms betaal je per lead of per maand en bied je mee op dezelfde aanvraag. Bij Bylder betaal je &eacute;&eacute;n keer &euro;79 "
         "voor een geactiveerd profiel &mdash; en wij tonen je neutraal, met je beoordelingen uit meerdere bronnen naast elkaar."),
        ("Hoe meld ik mijn bedrijf aan?",
         "Je deelt je Google-, Werkspot- of websitelink en wij stellen je profiel samen &mdash; geen formulieren invullen. "
         "Daarna activeer je het en ben je vindbaar voor kopers in jouw plaats."),
        ("Voor welke vakbedrijven is dit?",
         "We starten met stukadoors en breiden uit naar schilders, tegelzetters, installateurs, dakdekkers en alle andere bouw- en afbouwvakken."),
        ("Krijg ik leads?",
         "Je wordt gekoppeld aan nieuwbouw- en verbouwkopers in jouw regio op het moment dat zij jouw vak plannen &mdash; via hun project in de Bylder-app. "
         "Geen koude leads, geen veiling."),
    ]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("Voor vakbedrijven", canonical)]),
        {"@context": "https://schema.org", "@type": "Service", "serviceType": "Vakbedrijf-profiel en leadkoppeling",
         "areaServed": {"@type": "Country", "name": "Nederland"},
         "provider": {"@type": "Organization", "name": "Bylder.com", "url": BASE + "/"},
         "offers": {"@type": "Offer", "price": "79", "priceCurrency": "EUR",
                    "description": "Eenmalige activering van een vakbedrijf-profiel, geen abonnement."}},
    ]
    voordelen = [
        ("Geverifieerd profiel + badge", "Een geclaimd, geverifieerd profiel valt op en wekt vertrouwen bij kopers."),
        ("Hoger in je plaats", "Geactiveerde bedrijven staan bovenaan op de stad-pagina van jouw plaats."),
        ("Beheer je eigen profiel", "Pas je gegevens, diensten en foto's zelf aan &mdash; altijd actueel."),
        ("Reviews gebundeld", "Je scores van Google, Werkspot en Trustpilot naast elkaar &mdash; eerlijk en compleet."),
        ("Gekoppeld aan kopers-projecten", "Word getoond aan kopers in jouw regio op het moment dat zij jouw vak plannen."),
        ("Geen terugkerende leadkosten", "Eenmalig &euro;79. Geen abonnement, geen veiling, geen kosten per lead."),
    ]
    vgrid = "".join(
        f'<div class="card"><div style="width:28px;height:4px;border-radius:2px;background:#3D5A3E;margin-bottom:12px;"></div>'
        f'<div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:4px;">{t}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.66);line-height:1.6;">{d}</div></div>'
        for t, d in voordelen)
    stappen = [
        ("1", "Deel je link", "Stuur je Google-, Werkspot- of websitelink &mdash; geen formulieren."),
        ("2", "Wij vullen je profiel", "Bylder stelt je profiel samen met je gegevens en gebundelde reviews."),
        ("3", "Activeer voor &euro;79", "Eenmalig betalen en je bent live, hoger vindbaar en gekoppeld aan kopers."),
    ]
    sgrid = "".join(
        f'<div style="flex:1;min-width:220px;"><div style="width:38px;height:38px;border-radius:10px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-weight:800;font-family:\'Space Mono\',monospace;">{n}</div>'
        f'<div style="font-weight:700;font-size:15px;color:#1A1208;margin:12px 0 4px;">{t}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.66);line-height:1.6;">{d}</div></div>'
        for n, t, d in stappen)

    body = f"""<main style="padding:56px 0 20px;"><div class="container" style="max-width:1000px;">
  <div style="max-width:760px;">
    <div class="badge">Voor vakbedrijven</div>
    <h1 style="font-size:2.6rem;font-weight:800;line-height:1.12;margin-bottom:14px;">Sta waar kopers je zoeken &mdash; voor eenmalig &euro;79</h1>
    <p style="font-size:1.15rem;color:rgba(61,46,30,0.7);line-height:1.7;margin-bottom:14px;">
      Bylder helpt nieuwbouw- en verbouwkopers een eerlijke prijs te betalen &mdash; en koppelt ze aan vakbedrijven in hun plaats.
      Je staat er waarschijnlijk al tussen: <strong>{format(aantal_bedrijven, ",d").replace(",", ".")} stukadoors over {aantal_steden} plaatsen</strong>.
      Activeer je profiel en word geverifieerd, beter vindbaar en gekoppeld aan kopers.</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
      <a href="{INTAKE}" style="background:#B85C38;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Meld je bedrijf aan &#8594;</a>
      <a href="#hoe" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Hoe werkt het?</a>
    </div>
  </div>

  <div class="divider"></div>

  <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:6px;">Wat je krijgt voor &euro;79</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;">Eenmalig. Geen abonnement, geen leadkosten.</p>
  <div class="grid-3">{vgrid}</div>

  <h2 id="hoe" style="font-size:1.6rem;font-weight:800;margin:48px 0 18px;">Zo werkt het</h2>
  <div style="display:flex;flex-wrap:wrap;gap:28px;">{sgrid}</div>

  <!-- VERGELIJK -->
  <div style="background:rgba(61,90,62,0.06);border:1px solid rgba(61,90,62,0.18);border-radius:16px;padding:26px;margin:44px 0;">
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:14px;">Bylder vs. een leadplatform</h2>
    <div class="grid-2" style="gap:16px;">
      <div><div style="font-weight:700;color:#3D5A3E;margin-bottom:6px;">Bylder</div>
        <ul class="check-list">
          <li>Eenmalig &euro;79 &mdash; geen abonnement</li>
          <li>Geen kosten per lead, geen veiling</li>
          <li>Neutraal getoond, reviews uit meerdere bronnen</li>
          <li>Gekoppeld aan het project van de koper</li>
        </ul></div>
      <div><div style="font-weight:700;color:rgba(61,46,30,0.5);margin-bottom:6px;">Leadplatform</div>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:15px;color:rgba(61,46,30,0.6);">
          <li>&times; Maandlasten of kosten per lead</li>
          <li>&times; Meebieden op dezelfde aanvraag</li>
          <li>&times; Alleen hun eigen reviews</li>
          <li>&times; Koude leads</li>
        </ul></div>
    </div>
  </div>

  <!-- CTA -->
  <div style="background:#3D5A3E;border-radius:20px;padding:42px;text-align:center;margin:40px 0;">
    <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:10px;">Klaar om erbij te staan?</h2>
    <p style="color:rgba(245,240,232,0.72);margin-bottom:24px;max-width:520px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.6;">Deel je Google-, Werkspot- of websitelink. Wij stellen je profiel samen en je activeert het voor eenmalig &euro;79.</p>
    <a href="{INTAKE}" class="cta-primary">Meld je bedrijf aan &#8594;</a>
  </div>

  <div class="divider"></div>
  {faq_html(qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Bekijk een voorbeeld: <a href="{SLUG}/">stukadoors &amp; marktprijzen</a>. Vragen? <a href="mailto:partners@bylder.com">partners@bylder.com</a></p>
  </div></main>"""
    return head(title, desc, canonical, schema) + body + FOOTER


def build_sitemap(steden_idx):
    urls = [f"{BASE}{SLUG}/", f"{BASE}{VOORDELEN}/"] + [f"{BASE}{SLUG}/{_slug(s)}/" for s, _ in steden_idx]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)


if __name__ == "__main__":
    print("Stukadoor-pillar + stad-pagina's genereren…")
    bedrijven = load_vakbedrijven("stukadoor")
    groepen = per_stad(bedrijven)
    steden_idx = sorted([(s, l) for s, l in groepen.items() if len(l) >= MIN_PER_STAD],
                        key=lambda x: (-len(x[1]), x[0]))
    write("stukadoor/index.html", build_pillar())
    write("voor-vakbedrijven/index.html", build_voor_vakbedrijven(len(bedrijven), len(groepen)))
    for stad, lokaal in steden_idx:
        write(f"stukadoor/{_slug(stad)}/index.html", build_city_page(stad, lokaal))
    write("stukadoor-sitemap.xml", build_sitemap(steden_idx))
    print(f"Klaar: pillar + {len(steden_idx)} stad-pagina's (≥{MIN_PER_STAD} bedrijven) + sitemap. Bron: {len(bedrijven)} bedrijven.")
