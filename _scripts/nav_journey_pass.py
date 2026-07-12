#!/usr/bin/env python3
# Stap C — sitewide nav-pass: vervangt de oude nav-varianten door de journey-nav
# (Nieuwbouw kopen · Verbouwen · Inrichten · Verduurzamen · Kennisbank · Tools ·
# Deelnemer worden). Werkt op statische index.html-bestanden én op de
# generator-bronnen (generate_*.py, template strings met dezelfde markup).
# Patronen:
#   1. <div class="nav-links">…</div>   → flatte journey-links (dropdown vervalt)
#   2. <div class="nav-mobile"…>…</div> → zelfde links (mobiel menu)
#   3. inline-stijl container <div style="display:flex;align-items:center;gap:NNpx;">
#      binnen <nav> → journey-links + behoud van de bestaande CTA-knop
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
EXCLUDE = ('/output/', '/bylder-seo-', '/en-us/', '/web/', '/node_modules/', '/.git/', '/deelnemer-worden/', '/verbouwen/', '/kopen/')  # /kopen/: statische kopieën zijn geschaduwd door de Next-route

JOURNEY = [('/nieuwbouw-koper/','Nieuwbouw kopen'),('/verbouwen/','Verbouwen'),
           ('/interieur-woning/','Inrichten'),('/woning-verduurzamen/','Verduurzamen'),
           ('/kennisbank/','Kennisbank'),('/nieuwbouw-tools/','Tools'),
           ('/deelnemer-worden/','Deelnemer worden')]

FLAT = '\n      ' + '\n      '.join(f'<a href="{h}">{t}</a>' for h,t in JOURNEY) + '\n    '
INLINE = ''.join(f'<a href="{h}" style="font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;">{t}</a>\n      ' for h,t in JOURNEY)
DEFAULT_CTA = '<a href="https://mijn.bylder.com" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start Project →</a>'

def find_div_span(h, start):
    """start wijst naar '<div'; geef (open_end, close_start) van het gebalanceerde blok."""
    open_end = h.index('>', start) + 1
    depth, i = 1, open_end
    while depth and i < len(h):
        m = re.compile(r'<div\b|</div>').search(h, i)
        if not m: return None
        depth += 1 if m.group(0) != '</div>' else -1
        i = m.end()
    return (open_end, i - len('</div>'))

def transform(h):
    changed = False
    # patroon 1 + 2: class-based
    for cls, repl in (('nav-links', FLAT), ('nav-mobile', FLAT)):
        pos = 0
        while True:
            m = re.compile(r'<div class="'+cls+r'"[^>]*>').search(h, pos)
            if not m: break
            span = find_div_span(h, m.start())
            if not span: break
            oe, cs = span
            h = h[:oe] + repl + h[cs:]
            pos = oe + len(repl)
            changed = True
    # patroon 4: class-based flex container (homepage-stijl: "hidden md:flex items-center gap-6")
    CLSLNK = ''.join(f'<a href="{h2}" class="text-sm" style="color:rgba(61,46,30,0.5);text-decoration:none;">{t}</a>\n      ' for h2,t in JOURNEY)
    for nav in list(re.finditer(r'<nav\b', h)):
        navend = h.find('</nav>', nav.start())
        if navend < 0: continue
        m = re.compile(r'<div class="[^"]*flex items-center gap-\d[^"]*">').search(h, nav.start(), navend)
        if not m: continue
        span = find_div_span(h, m.start())
        if not span: continue
        oe, cs = span
        inner = h[oe:cs]
        if '/verbouwen/' in inner: continue
        cta = None
        for a in re.finditer(r'<a href="[^"]*"[^>]*>.*?</a>', inner, re.S):
            if 'background:#3D5A3E' in a.group(0) or 'btn' in a.group(0)[:120]: cta = a.group(0)
        h = h[:oe] + '\n      ' + CLSLNK + (cta or '') + '\n    ' + h[cs:]
        changed = True
    # patroon 3: inline container binnen <nav>
    for nav in list(re.finditer(r'<nav\b', h)):
        navend = h.find('</nav>', nav.start())
        if navend < 0: continue
        span = None
        for m in re.compile(r'<div(?: [a-zA-Z-]+="[^"]*")* style="display:flex;align-items:center;gap:\d+px;[^"]*"(?: [a-zA-Z-]+="[^"]*")*>').finditer(h, nav.start(), navend):
            cand = find_div_span(h, m.start())
            if not cand: continue
            inner = h[cand[0]:cand[1]]
            if 'nav-links' in inner or '/verbouwen/' in inner: continue
            if 'width:32px' in inner or '>B.<' in inner: continue  # logo-container
            if inner.count('<a ') < 2: continue                     # geen menu
            span = cand; break
        if not span: continue
        oe, cs = span
        inner = h[oe:cs]
        # bestaande CTA behouden (knop met background in style)
        cta = None
        for a in re.finditer(r'<a href="[^"]*"[^>]*style="[^"]*background:#3D5A3E[^"]*"[^>]*>.*?</a>', inner, re.S):
            cta = a.group(0)
        h = h[:oe] + '\n      ' + INLINE + (cta or DEFAULT_CTA) + '\n    ' + h[cs:]
        changed = True
    return h, changed

def run():
    files, done, skipped = [], 0, []
    for dp, dns, fns in os.walk(ROOT):
        rel = dp.replace(ROOT, '') + '/'
        if any(x in rel for x in EXCLUDE): dns[:] = []; continue
        for fn in fns:
            if fn == 'index.html': files.append(os.path.join(dp, fn))
    # generator-bronnen ook meenemen
    files += [os.path.join(ROOT, f) for f in os.listdir(ROOT) if f.startswith('generate') and f.endswith('.py')]
    for f in files:
        try: h = open(f, encoding='utf-8').read()
        except Exception: continue
        if '<nav' not in h: continue
        nh, ch = transform(h)
        if ch:
            open(f, 'w', encoding='utf-8').write(nh); done += 1
        else:
            skipped.append(f)
    print(f'aangepast: {done} bestanden')
    print(f'nav gevonden maar patroon onbekend: {len(skipped)}')
    for s in skipped[:15]: print('  ?', s.replace(ROOT, ''))

if __name__ == '__main__':
    run()
