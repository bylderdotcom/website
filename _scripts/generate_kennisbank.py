#!/usr/bin/env python3
# Kennisbank-generator (fase 1+). Bron van waarheid: data/clusters/kennisbank/
# artikelen/*.json (schema: SCHRIJFWIJZER.md). Rendert statische root-pagina's
# onder /kennisbank/<cluster>/(<slug>/) én schrijft de canonieke datalaag
# (pages.json + content-fragmenten) naar het bestaande cluster-patroon, zodat
# een latere Next-route (à la bouwvergunning) er direct op kan aansluiten.
# Draaien vanuit repo-root: python3 _scripts/generate_kennisbank.py
import json, os, glob, re, sys, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SITE = 'https://www.bylder.com'
SRC = os.path.join(ROOT, 'data', 'clusters', 'kennisbank')
VANDAAG = datetime.date.today().isoformat()

# ── Amazon-affiliate (bulk) ─────────────────────────────────────────────
# Één store-ID voor alle links. Wijzig hier = sitewide door.
AMAZON_TAG = 'bylder05-21'
AMAZON_DOM = 'www.amazon.nl'
ASIN_RE = re.compile(r'^[A-Z0-9]{10}$')

def laad_producten():
    """Leest producten.json. Alleen items met een geldige 10-teken ASIN
    worden meegenomen — zo gaat er nooit een kapotte/lege link live."""
    p = os.path.join(SRC, 'producten.json')
    if not os.path.exists(p):
        return []
    try:
        items = json.load(open(p, encoding='utf-8'))
    except Exception:
        return []
    out = []
    for x in items:
        if isinstance(x, dict) and ASIN_RE.match((x.get('asin') or '').strip().upper()):
            x['asin'] = x['asin'].strip().upper()
            out.append(x)
    return out

def amazon_link(asin):
    return f'https://{AMAZON_DOM}/dp/{asin}/?tag={AMAZON_TAG}'

def aff_producten_voor(a, producten):
    """Kies producten voor een artikel: expliciete ASIN-lijst (a['affiliate'])
    wint; anders alle producten met a['affiliate_categorie']. Max 6."""
    by = {p['asin']: p for p in producten}
    asins = [x.strip().upper() for x in (a.get('affiliate') or [])]
    if asins:
        sel = [by[x] for x in asins if x in by]
    else:
        cat = a.get('affiliate_categorie')
        sel = [p for p in producten if cat and p.get('categorie') == cat] if cat else []
    return sel[:6]

CLUSTERS = {
    'keuken':    ('Keuken', '/kennisbank/keuken/'),
    'badkamer':  ('Badkamer', '/kennisbank/badkamer/'),
    'materialen':('Materialen interieur', '/kennisbank/materialen/'),
    'vloeren':   ('Vloeren & afwerking', '/kennisbank/vloeren/'),
    'installaties':('Installaties & duurzaam', '/kennisbank/installaties/'),
    'bim':       ('BIM & digitaal bouwen', '/kennisbank/bim/'),
    'begrip':    ('Begrippenlijst', '/kennisbank/begrip/'),
}

CSS = """*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.75;}
h1,h2,h3{letter-spacing:-0.02em;color:#1A1208;line-height:1.2;}
a{color:#3D5A3E;text-decoration:none;}a:hover{text-decoration:underline;}
.container{max-width:1080px;margin:0 auto;padding:0 48px;}
@media(max-width:768px){.container{padding:0 20px;}}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:48px 0;}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0;}
@media(max-width:768px){.stat-row{grid-template-columns:1fr;}}
.stat-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:24px;text-align:center;}
.stat-val{font-size:1.9rem;font-weight:800;letter-spacing:-0.04em;color:#3D5A3E;}
.stat-lbl{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.06em;color:rgba(61,46,30,0.45);margin-top:4px;}
article p{margin:0 0 16px;font-size:16px;color:rgba(61,46,30,0.78);}
article h2{font-size:1.45rem;font-weight:800;margin:44px 0 16px;}
article ul,article ol{margin:0 0 16px 22px;font-size:16px;color:rgba(61,46,30,0.78);}
table.vgl{width:100%;border-collapse:collapse;margin:20px 0 28px;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;}
table.vgl th{background:rgba(61,90,62,0.08);text-align:left;padding:12px 14px;font-weight:700;color:#1A1208;}
table.vgl td{padding:11px 14px;border-top:1px solid rgba(61,46,30,0.07);color:rgba(61,46,30,0.75);vertical-align:top;}
.vgl-wrap{overflow-x:auto;}
.eeat{display:flex;align-items:center;gap:12px;margin:28px 0 8px;padding:14px 18px;background:rgba(61,46,30,0.03);border:1px solid rgba(61,46,30,0.08);border-radius:12px;font-size:13px;color:rgba(61,46,30,0.6);}
.eeat b{color:#1A1208;}
.faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:20px 0;}
.faq-item:last-child{border-bottom:none;}
.faq-q{font-size:16px;font-weight:700;color:#1A1208;margin-bottom:8px;}
.faq-a{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.75;}
.internal-links{background:rgba(61,46,30,0.03);border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px 24px;margin:36px 0;}
.il-title{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.4);margin-bottom:12px;}
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
.art-card span{font-size:13px;color:rgba(61,46,30,0.55);line-height:1.55;}
.aff-disclosure{font-size:12px;color:rgba(61,46,30,0.5);line-height:1.55;margin:6px 0 14px;font-style:italic;}
.aff-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:0 0 8px;}
@media(max-width:768px){.aff-grid{grid-template-columns:1fr;}}
.aff-card{background:#fff;border:1px solid rgba(61,46,30,0.10);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;}
.aff-body{flex:1;}
.aff-titel{font-size:15px;font-weight:800;color:#1A1208;margin-bottom:6px;letter-spacing:-0.01em;}
.aff-desc{font-size:13.5px;color:rgba(61,46,30,0.65);line-height:1.6;}
.aff-btn{align-self:flex-start;background:#3D5A3E;color:#F5F0E8;padding:9px 17px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;}
.aff-btn:hover{background:#4E7350;text-decoration:none;}"""

NAV = """<nav style="background:rgba(245,240,232,0.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;padding:16px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;align-items:center;justify-content:space-between;">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;">
      <a href="/nieuwbouw-koper/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Nieuwbouw kopen</a>
      <a href="/verbouwen/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Verbouwen</a>
      <a href="/interieur-woning/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Inrichten</a>
      <a href="/woning-verduurzamen/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Verduurzamen</a>
      <a href="/kennisbank/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Kennisbank</a>
      <a href="/nieuwbouw-tools/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Tools</a>
      <a href="/zakelijk/" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">Zakelijk</a>
      <a href="https://app.bylder.com/registreer" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
    </div>
  </div>
</nav>"""

FOOTER = """<footer style="background:#1A1208;padding:56px 0 36px;">
  <div style="max-width:1080px;margin:0 auto;padding:0 48px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2026 Bylder Nederland B.V. — KvK 65020006</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);"><a href="/kennisbank/" style="color:rgba(245,240,232,0.25);">Kennisbank</a> · <a href="/privacy/" style="color:rgba(245,240,232,0.25);">Privacy</a> · <a href="/zakelijk/" style="color:rgba(245,240,232,0.25);">Zakelijk</a></p>
  </div>
</footer>"""

def ld(o): return '<script type="application/ld+json">'+json.dumps(o,ensure_ascii=False)+'</script>'

def head(title,desc,url):
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
<meta property="og:type" content="article">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>"""

def laad():
    arts={}
    for f in sorted(glob.glob(os.path.join(SRC,'artikelen','*.json'))):
        a=json.load(open(f,encoding='utf-8'))
        arts[(a['cluster'],a['slug'])]=a
    return arts

def pad(cluster,slug):
    base=CLUSTERS[cluster][1]
    return base if slug=='index' else base+slug+'/'

def resolve_zuster(z,cluster):
    if ':' in z:
        c,s=z.split(':',1)
    else:
        c,s=cluster,z
    return c,s

def render(a,arts,producten=()):
    cluster, slug = a['cluster'], a['slug']
    cnaam, cbase = CLUSTERS[cluster]
    url = SITE+pad(cluster,slug)
    is_pillar = slug=='index'
    # schema
    blocks=[ld({"@context":"https://schema.org","@type":"Article","headline":a['titel'],
        "description":a['meta_description'],"mainEntityOfPage":{"@type":"WebPage","@id":url},
        "inLanguage":"nl-NL","datePublished":VANDAAG,"dateModified":VANDAAG,
        "author":{"@type":"Organization","name":"Bylder Redactie","url":SITE+"/over-ons/"},
        "publisher":{"@type":"Organization","name":"Bylder Nederland B.V.","url":SITE+"/","logo":{"@type":"ImageObject","url":SITE+"/android-chrome-512x512.png"}}})]
    if a.get('faq'):
        blocks.append(ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
            {"@type":"Question","name":f['q'],"acceptedAnswer":{"@type":"Answer","text":f['a']}} for f in a['faq']]}))
    crumbs=[("Bylder.com",SITE+"/"),("Kennisbank",SITE+"/kennisbank/"),(cnaam,SITE+cbase)]
    if not is_pillar: crumbs.append((a['titel'],url))
    blocks.append(ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":i+1,"name":n,"item":u} for i,(n,u) in enumerate(crumbs)]}))
    # body-delen
    stats=''.join(f'<div class="stat-card"><div class="stat-val">{v}</div><div class="stat-lbl">{l}</div></div>' for v,l in a.get('stats') or [])
    statrow=f'<div class="stat-row">{stats}</div>' if stats else ''
    secties=''.join(f'<h2>{s["kop"]}</h2>\n<div class="vgl-wrap">{s["html"]}</div>' for s in a.get('secties',[]))
    faq=''.join(f'<div class="faq-item"><div class="faq-q">{f["q"]}</div><div class="faq-a">{f["a"]}</div></div>' for f in a.get('faq',[]))
    faqblok=f'<div class="divider"></div><h2>Veelgestelde vragen</h2>{faq}' if faq else ''
    intro=''.join(f'<p style="font-size:1.08rem;">{p}</p>' for p in a['intro'])
    # interne links
    il=[]
    if not is_pillar: il.append((cbase,f'Alle {cnaam.lower()}-kennis'))
    for z in (a.get('links',{}).get('zusters') or []):
        c,s=resolve_zuster(z,cluster)
        art=arts.get((c,s))
        if art: il.append((pad(c,s),art['titel']))
    for k in ('tool','commercieel'):
        v=a.get('links',{}).get(k)
        if v: il.append((v[0],v[1]))
    il_html=''.join(f'<a href="{h}" class="il-link">→ {t}</a>' for h,t in il)
    # pillar: kaarten naar alle artikelen in het cluster
    grid=''
    if is_pillar:
        cards=''.join(f'<a href="{pad(cluster,s)}" class="art-card"><b>{art["titel"]}</b><span>{art["meta_description"][:110]}…</span></a>'
                      for (c,s),art in sorted(arts.items()) if c==cluster and s!='index')
        grid=f'<div class="divider"></div><h2>Alle artikelen in dit cluster</h2><div class="art-grid">{cards}</div>'
    # affiliate-blok (alleen als er geldige producten aan het artikel hangen)
    aff=aff_producten_voor(a,producten)
    affblok=''
    if aff:
        cards_aff=''.join(
            f'<div class="aff-card"><div class="aff-body"><div class="aff-titel">{p["titel"]}</div>'
            f'<div class="aff-desc">{p.get("omschrijving","")}</div></div>'
            f'<a class="aff-btn" href="{amazon_link(p["asin"])}" target="_blank" rel="sponsored nofollow noopener">Bekijk op Amazon →</a></div>'
            for p in aff)
        affblok=('<div class="divider"></div><h2>Aanbevolen producten</h2>'
            '<p class="aff-disclosure">Als Amazon-partner verdient Bylder aan kwalificerende aankopen. '
            'Deze aanbevelingen staan los van — en be&iuml;nvloeden niet — onze onafhankelijke prijsanalyses.</p>'
            f'<div class="aff-grid">{cards_aff}</div>')
    crumb_html=' → '.join(f'<a href="{u.replace(SITE,"")}" style="color:rgba(61,46,30,0.4);">{n}</a>' for n,u in crumbs[:-1]) + f' → <span style="color:rgba(61,46,30,0.65);">{crumbs[-1][0]}</span>'
    body=f"""{''.join(blocks)}{NAV}
<main style="padding:64px 0 72px;"><div class="container">
<p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:28px;">{crumb_html}</p>
<article>
<div class="badge">Kennisbank · {cnaam}</div>
<h1 style="font-size:2.4rem;font-weight:800;margin-bottom:18px;line-height:1.12;">{a['titel']}</h1>
{intro}
{statrow}
<div class="eeat"><span style="width:34px;height:34px;background:#3D5A3E;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;color:#F5F0E8;font-weight:800;font-family:'Space Mono',monospace;font-size:12px;flex-shrink:0;">B.</span><span>Door <b>Bylder Redactie</b> · Laatst bijgewerkt: {VANDAAG} · Onderbouwd met marktprijzen uit door Bylder geanalyseerde offertes.</span></div>
{secties}
{grid}
{affblok}
<div class="internal-links"><div class="il-title">Verder lezen &amp; tools</div><div class="il-links">{il_html}</div></div>
{faqblok}
<div class="cta-block"><h2>Weet wat een eerlijke prijs is</h2><p>Upload je offerte voor een gratis AI-check, of word lid voor €99 en bespaar gemiddeld €4.200 met kortingen bij 60+ merken.</p><a href="/#scan" class="cta-btn">Start gratis QuickScan →</a></div>
</article>
</div></main>{FOOTER}
</body></html>
"""
    return head(a['title_tag'],a['meta_description'],url)+body

def main():
    arts=laad()
    producten=laad_producten()
    if not arts:
        print('geen artikelen gevonden'); sys.exit(1)
    problemen=[]
    pages_meta=[]
    os.makedirs(os.path.join(SRC,'content'),exist_ok=True)
    for (cluster,slug),a in sorted(arts.items()):
        # zuster-referenties valideren
        for z in (a.get('links',{}).get('zusters') or []):
            c,s=resolve_zuster(z,cluster)
            if (c,s) not in arts: problemen.append(f'{cluster}--{slug}: zuster {z} bestaat niet')
        html=render(a,arts,producten)
        p=pad(cluster,slug)
        d=os.path.join(ROOT,p.strip('/'))
        os.makedirs(d,exist_ok=True)
        open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(html)
        # canonieke fragmenten (main-only) voor latere Next-route
        m=re.search(r'<main.*?</main>',html,re.S)
        open(os.path.join(SRC,'content',f'{cluster}--{slug}.html'),'w',encoding='utf-8').write(m.group(0))
        ldjson=re.findall(r'<script type="application/ld\+json">(.*?)</script>',html,re.S)
        pages_meta.append({"slug":f"{cluster}/{slug}","file":p.strip('/')+'/index.html',"path":p,
            "title":a['title_tag'],"description":a['meta_description'],"og_type":"article",
            "robots":"index, follow, max-snippet:-1, max-image-preview:large","ldjson":ldjson,"ldjson_sep":"\n"})
    json.dump(pages_meta,open(os.path.join(SRC,'pages.json'),'w',encoding='utf-8'),indent=2,ensure_ascii=False)
    # sitemap volledig hergenereren
    urls=[SITE+'/kennisbank/',SITE+'/kennisbank/kosten-besparen-nieuwbouw/']+[SITE+p['path'] for p in pages_meta]
    sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm+=''.join(f'<url><loc>{u}</loc><lastmod>{VANDAAG}</lastmod><priority>0.8</priority></url>\n' for u in urls)
    sm+='</urlset>\n'
    open(os.path.join(ROOT,'kennisbank-sitemap.xml'),'w').write(sm)
    print(f'gegenereerd: {len(pages_meta)} pagina\'s, sitemap {len(urls)} urls')
    if problemen:
        print('waarschuwingen:'); [print(' -',p) for p in problemen[:20]]

if __name__=='__main__':
    main()
