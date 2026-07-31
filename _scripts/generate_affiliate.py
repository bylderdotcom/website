#!/usr/bin/env python3
# Genereert de /affiliate/-hub (pillar + artikelen): Bylder als affiliate-netwerk
# voor wonen, bouw, interieur & renovatie. Statische root-HTML, huisstijl =
# kennisbank/deelnemer-template. Bron: data/clusters/affiliate/artikelen/*.json.
# Draaien vanuit repo-root: python3 _scripts/generate_affiliate.py
import json, os, glob, re, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SITE = 'https://www.bylder.com'
BASE = '/affiliate/'
SRC = os.path.join(ROOT, 'data', 'clusters', 'affiliate')
VANDAAG = datetime.date.today().isoformat()

CSS = """*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.75;}
h1,h2,h3,h4{letter-spacing:-0.02em;color:#1A1208;line-height:1.2;}
a{color:#3D5A3E;text-decoration:none;}a:hover{text-decoration:underline;}
.container{max-width:1080px;margin:0 auto;padding:0 48px;}
@media(max-width:768px){.container{padding:0 20px;}}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:48px 0;}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0;}
@media(max-width:768px){.stat-row{grid-template-columns:1fr;}}
.stat-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:24px;text-align:center;}
.stat-val{font-size:2.2rem;font-weight:800;letter-spacing:-0.04em;color:#3D5A3E;}
.stat-lbl{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.06em;color:rgba(61,46,30,0.72);margin-top:4px;}
article p{margin:0 0 16px;font-size:16px;color:rgba(61,46,30,0.78);}
article h2{font-size:1.45rem;font-weight:800;margin:44px 0 16px;}
article ul,article ol{margin:0 0 16px 22px;font-size:16px;color:rgba(61,46,30,0.78);}
article li{margin-bottom:8px;}
table.vgl{width:100%;border-collapse:collapse;margin:20px 0 28px;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;}
table.vgl th{background:rgba(61,90,62,0.08);text-align:left;padding:12px 14px;font-weight:700;color:#1A1208;}
table.vgl td{padding:11px 14px;border-top:1px solid rgba(61,46,30,0.07);color:rgba(61,46,30,0.75);vertical-align:top;}
.vgl-wrap{overflow-x:auto;}
.faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:20px 0;}
.faq-item:last-child{border-bottom:none;}
.faq-q{font-size:16px;font-weight:700;color:#1A1208;margin-bottom:8px;}
.faq-a{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.75;}
.internal-links{background:rgba(61,46,30,0.03);border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px 24px;margin:36px 0;}
.il-title{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.72);margin-bottom:12px;}
.il-links{display:flex;flex-wrap:wrap;gap:10px;}
.il-link{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#fff;border:1px solid rgba(61,90,62,0.2);border-radius:999px;font-size:13px;color:#3D5A3E;text-decoration:none;font-weight:600;}
.cta-block{background:linear-gradient(135deg,#3D5A3E 0%,#4E7350 100%);border-radius:24px;padding:48px 40px;text-align:center;margin:48px 0 8px;}
.cta-block h2{font-size:1.7rem;font-weight:800;color:#F5F0E8;margin:0 0 12px;}
.cta-block p{color:rgba(245,240,232,0.7);font-size:15px;max-width:520px;margin:0 auto 28px;}
.cta-btn{display:inline-flex;align-items:center;gap:8px;background:#F5F0E8;color:#3D5A3E;padding:15px 30px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;}
.art-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:28px 0;}
@media(max-width:768px){.art-grid{grid-template-columns:1fr;}}
.art-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:14px;padding:18px 22px;text-decoration:none;display:block;}
.art-card:hover{border-color:rgba(61,90,62,0.35);text-decoration:none;}
.art-card b{display:block;font-size:15px;color:#1A1208;margin-bottom:4px;}
.art-card span{font-size:13px;color:rgba(61,46,30,0.72);line-height:1.55;}"""

NAV = """<nav aria-label="Hoofdnavigatie" style="background:rgba(245,240,232,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;padding:16px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;">
      <a href="/nieuwbouw-koper/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Nieuwbouw kopen</a>
      <a href="/verbouwen/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Verbouwen</a>
      <a href="/interieur-woning/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Inrichten</a>
      <a href="/woning-verduurzamen/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Verduurzamen</a>
      <a href="/kennisbank/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Kennisbank</a>
      <a href="/nieuwbouw-tools/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Tools</a>
      <div class="byl-zk" style="position:relative;display:inline-block;"><style>.byl-zk-menu{display:none;}.byl-zk:hover .byl-zk-menu{display:block;}.byl-zk-menu a:hover{background:rgba(61,90,62,0.07);text-decoration:none;}</style><a href="/zakelijk/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;display:inline-flex;align-items:center;gap:4px;">Zakelijk <span style="font-size:9px;">▼</span></a><div class="byl-zk-menu" style="position:absolute;top:100%;left:-14px;padding-top:12px;z-index:70;"><div style="background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 18px 40px rgba(26,18,8,0.14);padding:8px;min-width:230px;"><a href="/deelnemer-worden/" style="display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:13.5px;font-weight:600;color:#1A1208;white-space:nowrap;">Deelnemer worden</a><a href="/deelnemer-worden/commercieel-vastgoed/" style="display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:13.5px;font-weight:600;color:#1A1208;white-space:nowrap;">Commercieel vastgoed</a><a href="/zakelijk/" style="display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;color:#3D5A3E;border-top:1px solid rgba(61,46,30,0.07);white-space:nowrap;">Alles over Bylder Zakelijk →</a></div></div></div>
      <a href="https://app.bylder.com" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Inloggen</a>
      <a href="https://app.bylder.com/registreer" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;">Start gratis →</a>
    </div>
  </div>
</nav>"""

FOOTER = """<footer style="background:#1A1208;padding:56px 0 36px;">
  <div style="max-width:1080px;margin:0 auto;padding:0 48px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.55);">© 2026 Bylder Nederland B.V. — KvK 65020006</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.55);"><a href="/deelnemer-worden/woonwinkels-merken/" style="color:rgba(245,240,232,0.55);">Word deelnemer</a> · <a href="/zakelijk/" style="color:rgba(245,240,232,0.55);">Zakelijk</a> · <a href="/affiliate/" style="color:rgba(245,240,232,0.55);">Affiliate</a></p>
  </div>
</footer>"""

def ld(o): return '<script type="application/ld+json">'+json.dumps(o,ensure_ascii=False)+'</script>'

def head(title, desc, url):
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-LZYCRP1169');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>{CSS}/*a11y-focus*/:focus-visible{{outline:3px solid #3D5A3E!important;outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}}@media (prefers-reduced-motion:reduce){{*{{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}}}</style>
</head>
<body>"""

PILLAR_STATS = [('5%', 'commissie — laagste van de netwerken'),
                ('60+', 'deelnemende woonmerken'),
                ('€4.200', 'gem. besparing per koper')]

def pad(slug): return BASE if slug == 'index' else BASE + slug + '/'

def render(a, arts):
    slug = a['slug']
    is_pillar = a.get('is_pillar') or slug == 'index'
    url = SITE + pad(slug)
    crumbs = [("Bylder.com", SITE + "/"), ("Affiliate", SITE + BASE)]
    if not is_pillar:
        crumbs.append((a['titel'], url))
    blocks = [ld({"@context": "https://schema.org", "@type": "Article", "headline": a['titel'],
        "description": a['meta_description'], "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "inLanguage": "nl-NL", "datePublished": VANDAAG, "dateModified": VANDAAG,
        "author": {"@type": "Organization", "name": "Bylder", "url": SITE + "/over-ons/"},
        "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V.", "url": SITE + "/", "logo": {"@type": "ImageObject", "url": SITE + "/android-chrome-512x512.png"}}})]
    if a.get('faq'):
        blocks.append(ld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": f['q'], "acceptedAnswer": {"@type": "Answer", "text": f['a']}} for f in a['faq']]}))
    blocks.append(ld({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}))

    intro = ''.join(f'<p style="font-size:1.08rem;">{p}</p>' for p in a.get('intro', []))
    statrow = ''
    if is_pillar:
        statrow = '<div class="stat-row">' + ''.join(
            f'<div class="stat-card"><div class="stat-val">{v}</div><div class="stat-lbl">{l}</div></div>' for v, l in PILLAR_STATS) + '</div>'
    secties = ''.join(f'<h2>{s["kop"]}</h2>\n<div class="vgl-wrap">{s["html"]}</div>' for s in a.get('secties', []))
    faq = ''.join(f'<div class="faq-item"><div class="faq-q">{f["q"]}</div><div class="faq-a">{f["a"]}</div></div>' for f in a.get('faq', []))
    faqblok = f'<div class="divider"></div><h2>Veelgestelde vragen</h2>{faq}' if faq else ''

    grid = ''
    if is_pillar:
        cards = ''.join(f'<a href="{pad(s)}" class="art-card"><b>{art["titel"]}</b><span>{art["meta_description"][:110]}…</span></a>'
                        for s, art in sorted(arts.items()) if s != 'index')
        grid = f'<div class="divider"></div><h2>Alles over aansluiten bij Bylder</h2><div class="art-grid">{cards}</div>'

    il = []
    if not is_pillar:
        il.append((BASE, 'Alles over het Bylder affiliate-netwerk'))
    il.append(('/deelnemer-worden/woonwinkels-merken/', 'Word deelnemer: woonwinkels & merken'))
    il.append(('/zakelijk/', 'Bylder Zakelijk'))
    il_html = ''.join(f'<a href="{h}" class="il-link">→ {t}</a>' for h, t in il)

    cta_label, cta_url = a.get('cta', ['Maak een merchant-account aan', 'https://app.bylder.com'])
    crumb_html = ' → '.join(f'<a href="{u.replace(SITE, "")}" style="color:rgba(61,46,30,0.72);">{n}</a>' for n, u in crumbs[:-1]) + f' → <span style="color:rgba(61,46,30,0.72);">{crumbs[-1][0]}</span>'

    body = f"""{''.join(blocks)}{NAV}
<main style="padding:64px 0 72px;"><div class="container">
<p style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:28px;">{crumb_html}</p>
<article>
<div class="badge">Affiliate-netwerk · Wonen, bouw &amp; interieur</div>
<h1 style="font-size:2.4rem;font-weight:800;margin-bottom:18px;line-height:1.12;">{a['titel']}</h1>
{intro}
{statrow}
{secties}
{grid}
<div class="internal-links"><div class="il-title">Verder</div><div class="il-links">{il_html}</div></div>
{faqblok}
<div class="cta-block"><h2>Sluit je aan bij Bylder</h2><p>Bereik koopklare kopers op het juiste moment — vlak 5% commissie, no cure no pay. Koppel je webshop of maak een merchant-account aan.</p><a href="{cta_url}" class="cta-btn">{cta_label} →</a></div>
</article>
</div></main>{FOOTER}
</body></html>
"""
    return head(a['title_tag'], a['meta_description'], url) + body

def main():
    arts = {}
    for f in sorted(glob.glob(os.path.join(SRC, 'artikelen', '*.json'))):
        a = json.load(open(f, encoding='utf-8'))
        arts[a['slug']] = a
    if 'index' not in arts:
        print('LET OP: geen pillar (index.json) gevonden')
    os.makedirs(os.path.join(SRC, 'content'), exist_ok=True)
    urls = []
    for slug, a in sorted(arts.items()):
        html = render(a, arts)
        d = os.path.join(ROOT, pad(slug).strip('/'))
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(html)
        m = re.search(r'<main.*?</main>', html, re.S)
        if m:
            open(os.path.join(SRC, 'content', f'{slug}.html'), 'w', encoding='utf-8').write(m.group(0))
        urls.append(SITE + pad(slug))
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += ''.join(f'<url><loc>{u}</loc><lastmod>{VANDAAG}</lastmod><priority>0.7</priority></url>\n' for u in urls)
    sm += '</urlset>\n'
    open(os.path.join(ROOT, 'affiliate-sitemap.xml'), 'w').write(sm)
    print(f'gegenereerd: {len(arts)} affiliate-pagina\'s, sitemap {len(urls)} urls')

if __name__ == '__main__':
    main()
