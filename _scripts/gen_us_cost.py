#!/usr/bin/env python3
# gen_us_cost.py — US pSEO cost-guide cluster for the /us MVP wedge.
# Generates: /us/cost/ (hub) -> /us/cost/<project>/ (project hub) -> /us/cost/<project>/<city>/ (detail)
# Each detail page: localized cost range (national range x metro cost-index), breakdown table,
# local factors, FAQ (+FAQPage schema), breadcrumbs (+BreadcrumbList schema), and the quote-check CTA.
# Usage: python3 _scripts/gen_us_cost.py [--sample]

import os, sys, re

ROOT = '/Users/danielpaaij/Documents/GitHub/website'
BASE = 'https://www.bylder.com'
GA = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>"""

# National cost ranges (USD): low, typical, high + component breakdown (share of typical low/high)
PROJECTS = [
  {"slug":"kitchen-remodel","name":"Kitchen Remodel","low":15000,"typ":40000,"high":80000,
   "components":[("Cabinets",0.30,0.35),("Countertops",0.10,0.14),("Appliances",0.12,0.16),("Labor & install",0.20,0.25),("Plumbing & electrical",0.08,0.12)]},
  {"slug":"bathroom-remodel","name":"Bathroom Remodel","low":8000,"typ":18000,"high":35000,
   "components":[("Fixtures & fittings",0.18,0.22),("Tile & flooring",0.15,0.20),("Vanity & countertop",0.10,0.14),("Labor & install",0.30,0.35),("Plumbing & electrical",0.12,0.16)]},
  {"slug":"flooring-installation","name":"Flooring Installation","low":3000,"typ":8000,"high":20000,
   "components":[("Materials",0.45,0.55),("Removal & prep",0.10,0.15),("Labor & install",0.30,0.40)]},
  {"slug":"interior-painting","name":"Interior Painting","low":2000,"typ":4500,"high":9000,
   "components":[("Paint & materials",0.15,0.22),("Prep & priming",0.18,0.25),("Labor",0.55,0.65)]},
  {"slug":"roof-replacement","name":"Roof Replacement","low":6000,"typ":12000,"high":30000,
   "components":[("Materials (shingles)",0.35,0.45),("Tear-off & disposal",0.10,0.15),("Labor",0.35,0.45)]},
  {"slug":"hvac-replacement","name":"HVAC Replacement","low":5000,"typ":10000,"high":18000,
   "components":[("Equipment",0.45,0.55),("Ductwork",0.10,0.18),("Labor & install",0.28,0.35)]},
  {"slug":"window-replacement","name":"Window Replacement","low":5000,"typ":12000,"high":25000,
   "components":[("Windows",0.50,0.60),("Labor & install",0.30,0.40),("Trim & disposal",0.06,0.10)]},
  {"slug":"deck-building","name":"Deck Building","low":4000,"typ":10000,"high":25000,
   "components":[("Decking materials",0.35,0.45),("Framing & footings",0.18,0.25),("Labor",0.30,0.40)]},
  {"slug":"siding-replacement","name":"Siding Replacement","low":7000,"typ":15000,"high":35000,
   "components":[("Siding materials",0.40,0.50),("Tear-off",0.08,0.12),("Labor",0.35,0.45)]},
  {"slug":"basement-finishing","name":"Basement Finishing","low":15000,"typ":35000,"high":75000,
   "components":[("Framing & drywall",0.20,0.28),("Flooring",0.10,0.15),("Electrical & HVAC",0.15,0.22),("Labor",0.30,0.38)]},
  {"slug":"countertop-installation","name":"Countertop Installation","low":2000,"typ":4500,"high":10000,
   "components":[("Material (slab)",0.55,0.65),("Fabrication",0.15,0.22),("Install",0.15,0.22)]},
  {"slug":"home-addition","name":"Home Addition","low":25000,"typ":60000,"high":150000,
   "components":[("Foundation & framing",0.22,0.28),("Roofing & exterior",0.15,0.20),("Interior finish",0.20,0.26),("MEP & permits",0.15,0.22)]},
]

# Top US metros + cost-of-living/construction index (national typical = 1.00)
METROS = [
  ("san-francisco-ca","San Francisco","CA",1.45),("san-jose-ca","San Jose","CA",1.40),
  ("new-york-ny","New York","NY",1.35),("los-angeles-ca","Los Angeles","CA",1.25),
  ("boston-ma","Boston","MA",1.25),("seattle-wa","Seattle","WA",1.20),
  ("san-diego-ca","San Diego","CA",1.20),("washington-dc","Washington","DC",1.15),
  ("denver-co","Denver","CO",1.10),("portland-or","Portland","OR",1.10),
  ("miami-fl","Miami","FL",1.08),("sacramento-ca","Sacramento","CA",1.05),
  ("chicago-il","Chicago","IL",1.05),("philadelphia-pa","Philadelphia","PA",1.00),
  ("minneapolis-mn","Minneapolis","MN",1.00),("austin-tx","Austin","TX",1.00),
  ("phoenix-az","Phoenix","AZ",0.98),("las-vegas-nv","Las Vegas","NV",0.97),
  ("nashville-tn","Nashville","TN",0.96),("atlanta-ga","Atlanta","GA",0.95),
  ("dallas-tx","Dallas","TX",0.95),("tampa-fl","Tampa","FL",0.95),
  ("orlando-fl","Orlando","FL",0.94),("raleigh-nc","Raleigh","NC",0.94),
  ("charlotte-nc","Charlotte","NC",0.93),("houston-tx","Houston","TX",0.93),
  ("columbus-oh","Columbus","OH",0.92),("kansas-city-mo","Kansas City","MO",0.90),
  ("san-antonio-tx","San Antonio","TX",0.90),("indianapolis-in","Indianapolis","IN",0.90),
]

def money(n):
    return "$" + format(int(round(n/100.0)*100), ",")

def cost_level(mult):
    if mult >= 1.15: return "well above"
    if mult >= 1.03: return "above"
    if mult <= 0.93: return "below"
    return "close to"

HEAD = """<!DOCTYPE html>
<html lang="en-US">
<head>
{ga}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{canonical}">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.65}}
.container{{max-width:820px;margin:0 auto;padding:0 22px}}
a{{color:#3D5A3E}}
.nav{{background:rgba(245,240,232,.92);border-bottom:1px solid rgba(61,46,30,.08)}}
.nav-in{{display:flex;align-items:center;justify-content:space-between;max-width:820px;margin:0 auto;padding:13px 22px}}
.logo{{display:flex;align-items:center;gap:9px;font-weight:800;color:#1A1208;text-decoration:none;letter-spacing:-.02em}}
.logo i{{width:30px;height:30px;border-radius:8px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px}}
.btn{{display:inline-flex;align-items:center;gap:7px;background:#3D5A3E;color:#F5F0E8;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:700;font-size:14px}}
.crumb{{font-size:12px;color:rgba(61,46,30,.5);padding:16px 0 0}}
.crumb a{{text-decoration:none}}
h1{{font-size:clamp(1.6rem,4vw,2.3rem);font-weight:800;color:#1A1208;letter-spacing:-.02em;line-height:1.12;margin:10px 0 6px}}
h2{{font-size:1.25rem;font-weight:800;color:#1A1208;margin:30px 0 10px;letter-spacing:-.01em}}
p{{margin:10px 0;color:rgba(61,46,30,.8)}}
.range{{background:#fff;border:1px solid rgba(61,90,62,.25);border-radius:16px;padding:22px;margin:18px 0;text-align:center}}
.range .big{{font-size:2.2rem;font-weight:800;color:#3D5A3E;letter-spacing:-.03em}}
.range .sm{{font-size:13px;color:rgba(61,46,30,.55)}}
table{{width:100%;border-collapse:collapse;margin:12px 0;background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:12px;overflow:hidden}}
th,td{{text-align:left;padding:11px 14px;font-size:14px;border-bottom:1px solid rgba(61,46,30,.07)}}
th{{background:rgba(61,46,30,.04);font-weight:700;color:#1A1208}}
td.r{{text-align:right;font-weight:700;color:#1A1208;white-space:nowrap}}
.cta{{background:rgba(61,90,62,.07);border:1px solid rgba(61,90,62,.22);border-radius:16px;padding:22px;margin:26px 0;text-align:center}}
.faq{{background:#fff;border:1px solid rgba(61,46,30,.08);border-radius:12px;padding:6px 18px;margin:10px 0}}
.faq summary{{font-weight:700;color:#1A1208;cursor:pointer;padding:12px 0;font-size:15px}}
.faq p{{padding-bottom:12px;margin:0}}
.links{{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}}
.links a{{background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:999px;padding:6px 13px;font-size:13px;text-decoration:none;color:#3D2E1E}}
footer{{padding:34px 0;color:rgba(61,46,30,.45);font-size:13px;text-align:center;border-top:1px solid rgba(61,46,30,.08);margin-top:30px}}
.disc{{font-size:12px;color:rgba(61,46,30,.4);margin-top:8px}}
</style>
{schema}
</head>
<body>
<nav class="nav"><div class="nav-in"><a href="/us/" class="logo"><i>B.</i>Bylder</a><a href="/us/" class="btn">Check a quote — free</a></div></nav>
<div class="container">
"""

FOOT = """</div>
<footer><div class="container">Bylder · AI quote &amp; upgrade checks for U.S. homeowners · <a href="/us/">Check your quote free</a><div class="disc">Cost figures are estimates based on national averages adjusted for local cost levels and are for guidance only. Always get itemized quotes.</div></div></footer>
</body></html>"""

def write(path, html):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(html)

def detail_page(proj, metro):
    mslug, city, st, mult = metro
    lo, ty, hi = proj["low"]*mult, proj["typ"]*mult, proj["high"]*mult
    name = proj["name"]; nl = name.lower()
    title = f"{name} Cost in {city}, {st} (2026 Prices) | Bylder"
    desc = f"How much does a {nl} cost in {city}, {st}? Typical range {money(lo)}–{money(hi)} (avg {money(ty)}). See the cost breakdown, what drives price locally, and check your own quote free."
    canonical = f"{BASE}/us/cost/{proj['slug']}/{mslug}/"
    rows = ""
    for cname, clo, chi in proj["components"]:
        rows += f"<tr><td>{cname}</td><td class='r'>{money(ty*clo)} – {money(ty*chi)}</td></tr>"
    faqs = [
      (f"How much does a {nl} cost in {city}?",
       f"Most {nl} projects in {city}, {st} run between {money(lo)} and {money(hi)}, with a typical project around {money(ty)}. Your final price depends on size, materials and the contractor."),
      (f"Why is a {nl} more expensive in {city} than the national average?",
       f"Construction labor and materials in {city} are {cost_level(mult)} the U.S. average, which is why local prices sit {'higher' if mult>1 else 'lower' if mult<1 else 'in line with'} than the national typical of {money(proj['typ'])}."),
      ("How do I know if my quote is fair?",
       f"Compare each line item to the breakdown above, and get at least three itemized bids. You can also upload your quote to Bylder's free AI checker to instantly flag overpriced items."),
    ]
    faq_html = "".join(f"<details class='faq'><summary>{q}</summary><p>{a}</p></details>" for q,a in faqs)
    faq_ld = ",".join('{"@type":"Question","name":"%s","acceptedAnswer":{"@type":"Answer","text":"%s"}}' % (q.replace('"',"'"), a.replace('"',"'")) for q,a in faqs)
    schema = ('<script type="application/ld+json">{"@context":"https://schema.org","@graph":['
      '{"@type":"BreadcrumbList","itemListElement":['
      '{"@type":"ListItem","position":1,"name":"Cost guides","item":"%s/us/cost/"},'
      '{"@type":"ListItem","position":2,"name":"%s","item":"%s/us/cost/%s/"},'
      '{"@type":"ListItem","position":3,"name":"%s, %s"}]},'
      '{"@type":"FAQPage","mainEntity":[%s]}]}</script>') % (BASE, name, BASE, proj['slug'], city, st, faq_ld)
    # related cities (same project) + other projects (same city)
    rel_cities = "".join(f"<a href='/us/cost/{proj['slug']}/{m[0]}/'>{m[1]}, {m[2]}</a>" for m in METROS if m[0]!=mslug)[:0] or \
                 "".join(f"<a href='/us/cost/{proj['slug']}/{m[0]}/'>{m[1]}</a>" for m in METROS[:8] if m[0]!=mslug)
    other_proj = "".join(f"<a href='/us/cost/{p['slug']}/{mslug}/'>{p['name']}</a>" for p in PROJECTS[:8] if p['slug']!=proj['slug'])
    body = f"""<div class="crumb"><a href="/us/">Home</a> › <a href="/us/cost/">Cost guides</a> › <a href="/us/cost/{proj['slug']}/">{name}</a> › {city}, {st}</div>
<h1>How much does a {nl} cost in {city}, {st}?</h1>
<p>A {nl} in {city} typically costs between <strong>{money(lo)}</strong> and <strong>{money(hi)}</strong>, with most homeowners paying around <strong>{money(ty)}</strong>. Local construction costs in {city} run {cost_level(mult)} the national average, so prices here differ from the U.S. typical of {money(proj['typ'])}.</p>
<div class="range"><div class="big">{money(lo)} – {money(hi)}</div><div class="sm">Typical {nl} in {city}, {st} · average ~{money(ty)}</div></div>
<h2>Cost breakdown</h2>
<p>Here's roughly how a typical {money(ty)} {nl} in {city} breaks down by component:</p>
<table><tr><th>Component</th><th class="r">Typical range</th></tr>{rows}</table>
<h2>What drives {nl} cost in {city}</h2>
<p>The biggest factors are project size and scope, the materials and finishes you choose, structural or permit work, and your contractor's rates. Because labor and materials in {city}, {st} are {cost_level(mult)} the national average, the same project can cost noticeably more or less than in other metros.</p>
<div class="cta"><p style="font-weight:700;color:#1A1208;margin:0 0 4px;">Already have a quote for your {nl}?</p><p style="margin:0 0 14px;font-size:14px;">Upload it and our AI flags what's overpriced and what to negotiate — free, no account.</p><a href="/us/" class="btn">⚡ Check my quote free</a></div>
<h2>Frequently asked questions</h2>
{faq_html}
<h2>{name} cost in other cities</h2>
<div class="links">{rel_cities}</div>
<h2>Other project costs in {city}</h2>
<div class="links">{other_proj}</div>"""
    html = HEAD.format(ga=GA, title=title, desc=desc, canonical=canonical, schema=schema) + body + FOOT
    return canonical, html

def project_hub(proj):
    name=proj["name"]; nl=name.lower()
    title=f"{name} Cost by City (2026) | Bylder"
    desc=f"Compare {nl} costs across major U.S. cities. National typical {money(proj['typ'])}. Pick your city for local prices and a free quote check."
    canonical=f"{BASE}/us/cost/{proj['slug']}/"
    cities="".join(f"<a href='/us/cost/{proj['slug']}/{m[0]}/'>{m[1]}, {m[2]}</a>" for m in METROS)
    schema=('<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
      '{"@type":"ListItem","position":1,"name":"Cost guides","item":"%s/us/cost/"},'
      '{"@type":"ListItem","position":2,"name":"%s"}]}</script>')%(BASE,name)
    body=f"""<div class="crumb"><a href="/us/">Home</a> › <a href="/us/cost/">Cost guides</a> › {name}</div>
<h1>{name} cost by city</h1>
<p>The national typical {nl} runs about <strong>{money(proj['typ'])}</strong> (range {money(proj['low'])}–{money(proj['high'])}), but local prices vary a lot. Choose your city for a localized estimate and a free quote check.</p>
<h2>Select your city</h2><div class="links">{cities}</div>
<div class="cta"><p style="font-weight:700;color:#1A1208;margin:0 0 14px;">Got a {nl} quote already?</p><a href="/us/" class="btn">⚡ Check my quote free</a></div>"""
    return canonical, HEAD.format(ga=GA,title=title,desc=desc,canonical=canonical,schema=schema)+body+FOOT

def main_hub():
    title="Home Project Cost Guides by City (2026) | Bylder"
    desc="Real cost ranges for kitchen remodels, bathrooms, roofing, HVAC and more across U.S. cities — plus a free AI tool to check if your contractor quote is fair."
    canonical=f"{BASE}/us/cost/"
    projs="".join(f"<a href='/us/cost/{p['slug']}/'>{p['name']}</a>" for p in PROJECTS)
    body=f"""<div class="crumb"><a href="/us/">Home</a> › Cost guides</div>
<h1>Home project cost guides</h1>
<p>Browse realistic U.S. cost ranges by project and city, then upload your own contractor bid or builder upgrade list for a <a href="/us/">free AI quote check</a>.</p>
<h2>Projects</h2><div class="links">{projs}</div>
<div class="cta"><p style="font-weight:700;color:#1A1208;margin:0 0 14px;">Have a quote to check?</p><a href="/us/" class="btn">⚡ Check my quote free</a></div>"""
    schema=('<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
      '{"@type":"ListItem","position":1,"name":"Cost guides"}]}</script>')
    return canonical, HEAD.format(ga=GA,title=title,desc=desc,canonical=canonical,schema=schema)+body+FOOT

def main():
    sample = '--sample' in sys.argv
    urls=[]
    if sample:
        u,h=detail_page(PROJECTS[0], METROS[15])  # kitchen-remodel / austin
        write('/tmp/sample_us_cost.html', h)
        print("Sample geschreven: /tmp/sample_us_cost.html"); print("URL:", u); return
    # main hub
    u,h=main_hub(); write(f"{ROOT}/us/cost/index.html", h); urls.append(u)
    for p in PROJECTS:
        u,h=project_hub(p); write(f"{ROOT}/us/cost/{p['slug']}/index.html", h); urls.append(u)
        for m in METROS:
            u,h=detail_page(p,m); write(f"{ROOT}/us/cost/{p['slug']}/{m[0]}/index.html", h); urls.append(u)
    # sitemap
    sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm+=f'<url><loc>{BASE}/us/</loc><priority>0.9</priority></url>\n'
    for u in urls: sm+=f'<url><loc>{u}</loc></url>\n'
    sm+='</urlset>\n'
    write(f"{ROOT}/us-sitemap.xml", sm)
    print(f"Gegenereerd: {len(urls)} pagina's ({len(PROJECTS)} projecten x {len(METROS)} steden + hubs)")
    print(f"Sitemap: us-sitemap.xml ({len(urls)+1} urls)")

if __name__=='__main__':
    main()
