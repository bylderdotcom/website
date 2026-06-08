#!/usr/bin/env python3
# gen_showroomsale.py — publieke SEO-pagina's voor showroomsale-items (uit Supabase).
# Structuur: /showroomsale/ (hub) -> /showroomsale/<merk>/ -> /showroomsale/<merk>/<winkel>/ (echte items).
# Leest 'approved' items via de Supabase REST API (public-read RLS).
# Gebruik:
#   python3 _scripts/gen_showroomsale.py            # uit de DB
#   python3 _scripts/gen_showroomsale.py --sample   # met voorbeelddata (valideren, schrijft naar /tmp)

import os, re, sys, json, subprocess
from collections import defaultdict

ROOT = '/Users/danielpaaij/Documents/GitHub/website'
BASE = 'https://www.bylder.com'
APP_ENV = '/Users/danielpaaij/Documents/GitHub/app/.env.local'

GA = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>"""

def slug(s): return re.sub(r'[^a-z0-9]+', '-', (s or '').lower()).strip('-')
def euro(n):
    try: return "€" + format(int(round(float(n))), ",").replace(",", ".")
    except: return ""

def env(key):
    if key in os.environ: return os.environ[key]
    if os.path.exists(APP_ENV):
        for line in open(APP_ENV):
            if line.startswith(key + '='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return None

def fetch_items():
    url = env('NEXT_PUBLIC_SUPABASE_URL'); anon = env('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if not url or not anon:
        print("Geen Supabase-URL/anon-key gevonden (env of app/.env.local). Gebruik --sample of zet de env.")
        sys.exit(1)
    endpoint = f"{url}/rest/v1/showroom_items?status=eq.approved&select=*&order=created_at.desc"
    out = subprocess.run(['curl', '-s', '--max-time', '30', endpoint,
                          '-H', f'apikey: {anon}', '-H', f'Authorization: Bearer {anon}'],
                         capture_output=True).stdout.decode('utf-8', 'ignore')
    try: return json.loads(out)
    except Exception:
        print("Kon Supabase-respons niet parsen:", out[:200]); sys.exit(1)

def sample_items():
    return [
        {"brand":"Auping","store_name":"Auping Plaza Rotterdam","city":"Rotterdam","title":"Auping Essential boxspring 180×200","description":"Showroommodel, uitstekende staat, incl. matras.","category":"Beds & boxsprings","advies_prijs":2499,"sale_prijs":1499,"image_url":"","valid_until":"2026-07-31"},
        {"brand":"Auping","store_name":"Auping Plaza Rotterdam","city":"Rotterdam","title":"Auping Original ledikant 160×200","description":"Demomodel met Auronde-frame.","category":"Beds & boxsprings","advies_prijs":1899,"sale_prijs":1199,"image_url":"","valid_until":"2026-07-31"},
        {"brand":"Auping","store_name":"Auping Store Den Bosch","city":"Den Bosch","title":"Auping Cloud matras 180×200","description":"Showroommatras, hygiënisch gereinigd.","category":"Mattresses","advies_prijs":1299,"sale_prijs":799,"image_url":"","valid_until":"2026-07-31"},
    ]

HEAD = """<!DOCTYPE html>
<html lang="nl-NL">
<head>
{ga}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canonical}">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6}}
.container{{max-width:900px;margin:0 auto;padding:0 22px}}
a{{color:#3D5A3E}}
.nav{{background:rgba(245,240,232,.92);border-bottom:1px solid rgba(61,46,30,.08)}}
.nav-in{{display:flex;align-items:center;justify-content:space-between;max-width:900px;margin:0 auto;padding:13px 22px}}
.logo{{display:flex;align-items:center;gap:9px;font-weight:800;color:#1A1208;text-decoration:none;letter-spacing:-.02em}}
.logo i{{width:30px;height:30px;border-radius:8px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px}}
.btn{{display:inline-flex;align-items:center;gap:7px;background:#3D5A3E;color:#F5F0E8;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700;font-size:14px}}
.crumb{{font-size:12px;color:rgba(61,46,30,.5);padding:16px 0 0}}
.crumb a{{text-decoration:none}}
h1{{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:800;color:#1A1208;letter-spacing:-.02em;line-height:1.12;margin:10px 0 6px}}
h2{{font-size:1.25rem;font-weight:800;color:#1A1208;margin:30px 0 10px}}
p{{margin:10px 0;color:rgba(61,46,30,.8)}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0}}
@media(max-width:680px){{.grid{{grid-template-columns:1fr}}}}
.card{{background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}}
.card .ph{{height:150px;background:rgba(61,46,30,.05);display:flex;align-items:center;justify-content:center;font-size:34px}}
.card img{{width:100%;height:150px;object-fit:cover;display:block}}
.card .b{{padding:14px 16px}}
.card h3{{font-size:15px;font-weight:800;color:#1A1208;margin-bottom:4px}}
.card .cat{{font-size:12px;color:rgba(61,46,30,.45);margin-bottom:8px}}
.prices{{display:flex;align-items:baseline;gap:8px}}
.sale{{font-size:1.3rem;font-weight:800;color:#3D5A3E;letter-spacing:-.02em}}
.adv{{font-size:13px;color:rgba(61,46,30,.4);text-decoration:line-through}}
.tag{{display:inline-block;font-size:11px;font-weight:700;color:#B85C38;background:rgba(184,92,56,.1);padding:3px 9px;border-radius:999px;margin-top:8px}}
.links{{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}}
.links a{{background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:999px;padding:8px 14px;font-size:13px;text-decoration:none;color:#3D2E1E;font-weight:600}}
.cta{{background:rgba(61,90,62,.07);border:1px solid rgba(61,90,62,.22);border-radius:16px;padding:20px;margin:24px 0}}
footer{{padding:34px 0;color:rgba(61,46,30,.45);font-size:13px;text-align:center;border-top:1px solid rgba(61,46,30,.08);margin-top:30px}}
</style>
{schema}
</head>
<body>
<nav class="nav"><div class="nav-in"><a href="/" class="logo"><i>B.</i>Bylder<span style="color:#3D5A3E">.com</span></a><a href="/vouchers/" class="btn">Kortingsvouchers</a></div></nav>
<div class="container">
"""
FOOT = """</div>
<footer><div class="container">Bylder.com · Showroomsale bij geselecteerde woonwinkels · <a href="/vouchers/">Kortingsvouchers</a></div></footer>
</body></html>"""

def write(path, html):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(html)

def item_card(it):
    img = f'<img src="{it["image_url"]}" alt="{it["title"]}" loading="lazy">' if it.get('image_url') else '<div class="ph">🛋️</div>'
    adv = f'<span class="adv">{euro(it["advies_prijs"])}</span>' if it.get('advies_prijs') else ''
    return (f'<div class="card">{img}<div class="b"><h3>{it["title"]}</h3>'
            f'<div class="cat">{it.get("category","")}</div>'
            f'<div class="prices"><span class="sale">{euro(it["sale_prijs"])}</span>{adv}</div>'
            f'<span class="tag">Showroomsale</span></div></div>')

def store_page(brand, store, items, outroot):
    bslug, sslug = slug(brand), slug(store)
    city = items[0].get('city') or ''
    canonical = f"{BASE}/showroomsale/{bslug}/{sslug}/"
    title = f"{brand} showroomsale — {store} | Bylder"
    desc = f"{len(items)} {brand}-showroommodellen in de sale bij {store}{(' ('+city+')') if city else ''}. Echte showroomstukken met flinke korting — reserveer of bekijk in de winkel."
    products = ",".join(
        '{"@type":"Product","name":"%s","category":"%s","offers":{"@type":"Offer","price":"%s","priceCurrency":"EUR","availability":"https://schema.org/InStock"}}'
        % (it["title"].replace('"', "'"), (it.get("category") or "").replace('"', "'"), int(round(float(it["sale_prijs"]))))
        for it in items)
    schema = ('<script type="application/ld+json">{"@context":"https://schema.org","@graph":['
              '{"@type":"BreadcrumbList","itemListElement":['
              '{"@type":"ListItem","position":1,"name":"Showroomsale","item":"%s/showroomsale/"},'
              '{"@type":"ListItem","position":2,"name":"%s","item":"%s/showroomsale/%s/"},'
              '{"@type":"ListItem","position":3,"name":"%s"}]},'
              '{"@type":"ItemList","itemListElement":[%s]}]}</script>') % (BASE, brand, BASE, bslug, store, products)
    body = f"""<div class="crumb"><a href="/showroomsale/">Showroomsale</a> › <a href="/showroomsale/{bslug}/">{brand}</a> › {store}</div>
<h1>{brand} showroomsale — {store}</h1>
<p>Echte showroommodellen van {brand} bij <strong>{store}</strong>{(' in '+city) if city else ''}, met flinke korting t.o.v. de adviesprijs. Op = op.</p>
<div class="grid">{''.join(item_card(it) for it in items)}</div>
<div class="cta"><p style="font-weight:700;color:#1A1208;margin:0 0 6px;">Interesse in een showroomstuk?</p><p style="margin:0;font-size:14px;">Reserveer 4 dagen om het in de winkel te bekijken, of leg het vast met een aanbetaling. <a href="/vouchers/">Word Bylder lid</a> voor exclusieve kortingen bij 40+ woonmerken.</p></div>"""
    write(f"{outroot}/showroomsale/{bslug}/{sslug}/index.html",
          HEAD.format(ga=GA, title=title, desc=desc, robots="index, follow", canonical=canonical, schema=schema) + body + FOOT)
    return canonical

def brand_hub(brand, stores, outroot):
    bslug = slug(brand)
    canonical = f"{BASE}/showroomsale/{bslug}/"
    title = f"{brand} showroomsale — alle winkels | Bylder"
    desc = f"{brand} showroommodellen in de sale bij {len(stores)} winkel(s). Bekijk de actuele showroomstukken per locatie."
    cards = "".join(f'<a href="/showroomsale/{bslug}/{slug(s)}/">{s} ({len(items)})</a>' for s, items in stores.items())
    schema = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
              '{"@type":"ListItem","position":1,"name":"Showroomsale","item":"%s/showroomsale/"},'
              '{"@type":"ListItem","position":2,"name":"%s"}]}</script>') % (BASE, brand)
    body = f"""<div class="crumb"><a href="/showroomsale/">Showroomsale</a> › {brand}</div>
<h1>{brand} showroomsale</h1>
<p>Kies een winkel voor de actuele {brand}-showroommodellen in de sale.</p>
<div class="links">{cards}</div>"""
    write(f"{outroot}/showroomsale/{bslug}/index.html",
          HEAD.format(ga=GA, title=title, desc=desc, robots="index, follow", canonical=canonical, schema=schema) + body + FOOT)
    return canonical

def main_hub(brands, outroot):
    canonical = f"{BASE}/showroomsale/"
    title = "Showroomsale — woonmerken & meubels met korting | Bylder"
    desc = "Echte showroommodellen in de sale bij geselecteerde woonwinkels. Bekijk de actuele showroomstukken per merk en winkel."
    cards = "".join(f'<a href="/showroomsale/{slug(b)}/">{b}</a>' for b in brands)
    body = f"""<div class="crumb">Showroomsale</div>
<h1>Showroomsale</h1>
<p>Echte showroommodellen met flinke korting bij geselecteerde woonwinkels. Kies een merk voor de actuele showroomstukken.</p>
<div class="links">{cards}</div>"""
    write(f"{outroot}/showroomsale/index.html",
          HEAD.format(ga=GA, title=title, desc=desc, robots="index, follow", canonical=canonical,
                      schema='<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Showroomsale"}]}</script>') + body + FOOT)
    return canonical

def main():
    sample = '--sample' in sys.argv
    outroot = '/tmp/showroomsale_preview' if sample else ROOT
    items = sample_items() if sample else fetch_items()
    if not items:
        print("Geen approved showroom-items gevonden → geen pagina's gegenereerd.")
        return
    # groepeer: merk -> winkel -> items
    by_brand = defaultdict(lambda: defaultdict(list))
    for it in items:
        by_brand[it['brand']][it['store_name']].append(it)
    urls = [main_hub(sorted(by_brand), outroot)]
    for brand, stores in by_brand.items():
        urls.append(brand_hub(brand, stores, outroot))
        for store, sitems in stores.items():
            urls.append(store_page(brand, store, sitems, outroot))
    # sitemap
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in urls: sm += f'<url><loc>{u}</loc></url>\n'
    sm += '</urlset>\n'
    write(f"{outroot}/showroomsale-sitemap.xml", sm)
    print(f"Gegenereerd: {len(urls)} pagina's ({len(by_brand)} merken). Output: {outroot}")
    print("Sitemap: showroomsale-sitemap.xml")

if __name__ == '__main__':
    main()
