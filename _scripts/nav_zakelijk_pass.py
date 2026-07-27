#!/usr/bin/env python3
# Zakelijk-pass (2026-07-12): in alle navs wordt het menu-item 'Deelnemer worden'
# vervangen door 'Zakelijk' (→ /zakelijk/). In mobiele menu's (nav-mobile) komt
# een sectiekopje 'Zakelijk' met daaronder Deelnemer worden + Commercieel
# vastgoed. Daarnaast wordt de nav-CTA overal gelijkgetrokken naar
# 'Start gratis →' (app.bylder.com/registreer). Idempotent via /zakelijk/-guard.
import os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
EXCLUDE = ('/output/', '/bylder-seo-', '/en-us/', '/web/', '/node_modules/', '/.git/', '/kopen/', '/zakelijk/')

# desktop: plat 'Zakelijk'-item
DESK_FLAT = '<a href="/zakelijk/">Zakelijk</a>'
DESK_INLINE = '<a href="/zakelijk/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Zakelijk</a>'
DESK_CLS = '<a href="/zakelijk/" class="text-sm" style="color:rgba(61,46,30,0.72);text-decoration:none;">Zakelijk</a>'

# mobiel: kopje + 2 links (flat-stijl voor nav-mobile blokken)
MOB_BLOCK = ('<span style="display:block;font-size:11px;font-family:\'Space Mono\',monospace;'
             'text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.72);'
             'font-weight:700;padding:12px 0 2px;">Zakelijk</span>\n      '
             '<a class="zm" href="/deelnemer-worden/">Deelnemer worden</a>\n      '
             '<a class="zm" href="/deelnemer-worden/commercieel-vastgoed/">Commercieel vastgoed</a>')

CTA_NEW = '<a href="https://app.bylder.com/registreer" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>'

def find_div_span(h, start):
    open_end = h.index('>', start) + 1
    depth, i = 1, open_end
    while depth and i < len(h):
        m = re.compile(r'<div\b|</div>').search(h, i)
        if not m: return None
        depth += 1 if m.group(0) != '</div>' else -1
        i = m.end()
    return (open_end, i - len('</div>'))

DW = re.compile(r'<a href="/deelnemer-worden/"[^>]*>Deelnemer worden</a>')
CTA_OLD = re.compile(r'<a href="https://app\.bylder\.com/?"([^>]*style="[^"]*background:#3D5A3E[^"]*"[^>]*)>Start Project →</a>')

def transform(h):
    changed = False
    # 1. mobiele menu's: kopje + 2 links
    pos = 0
    while True:
        m = re.compile(r'<div class="nav-mobile"[^>]*>').search(h, pos)
        if not m: break
        span = find_div_span(h, m.start())
        if not span: break
        oe, cs = span
        inner = h[oe:cs]
        if '/zakelijk/' not in inner and 'Commercieel vastgoed' not in inner:
            ni = DW.sub(MOB_BLOCK, inner)
            if ni != inner:
                h = h[:oe] + ni + h[cs:]
                changed = True
        pos = cs + 1
    # 2. desktop-navs: Deelnemer worden → Zakelijk (alles wat nog over is)
    def desk(mt):
        a = mt.group(0)
        if 'class="text-sm"' in a: return DESK_CLS
        if 'style=' in a: return DESK_INLINE
        return DESK_FLAT
    nh = DW.sub(desk, h)
    if nh != h: h, changed = nh, True
    # 3. CTA gelijktrekken (alleen binnen <nav>)
    for nav in list(re.finditer(r'<nav\b', h)):
        navend = h.find('</nav>', nav.start())
        if navend < 0: continue
        seg = h[nav.start():navend]
        ns = CTA_OLD.sub(CTA_NEW, seg)
        if ns != seg:
            h = h[:nav.start()] + ns + h[navend:]
            changed = True
    return h, changed

def run():
    files = []
    for dp, dns, fns in os.walk(ROOT):
        rel = dp.replace(ROOT, '') + '/'
        if any(x in rel for x in EXCLUDE): dns[:] = []; continue
        for fn in fns:
            if fn == 'index.html': files.append(os.path.join(dp, fn))
    files += [os.path.join(ROOT, f) for f in os.listdir(ROOT) if f.startswith('generate') and f.endswith('.py')]
    files.append(os.path.join(ROOT, '_scripts', 'generate_deelnemer.py'))
    files.append(os.path.join(ROOT, '_scripts', 'nav_journey_pass.py'))
    done = 0
    for f in files:
        try: h = open(f, encoding='utf-8').read()
        except Exception: continue
        if '<nav' not in h and 'Deelnemer worden</a>' not in h: continue
        nh, ch = transform(h)
        if ch:
            open(f, 'w', encoding='utf-8').write(nh); done += 1
    print(f'aangepast: {done} bestanden')

if __name__ == '__main__':
    run()
