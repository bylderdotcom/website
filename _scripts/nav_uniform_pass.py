#!/usr/bin/env python3
# Nav-uniformerings-pass (2026-07-24): elke pagina toont exact hetzelfde
# hoofdmenu, gelijk aan de canonieke Next-nav (web/app/components/Nav.tsx):
#   Nieuwbouw kopen · Verbouwen · Inrichten · Verduurzamen · Kennisbank · Tools
#   · Zakelijk ▼ (Deelnemer worden / Commercieel vastgoed / Alles over Bylder
#   Zakelijk →) · Inloggen · Start gratis →
# Werkt op twee patronen, vervangt alleen de BINNENKANT van de linkcontainer
# (wrapper-div met klassen/media-queries blijft intact):
#   A) inline-styled journey-navs  (div met display:flex;align-items:center)
#   B) class="nav-links"-navs      (vakbedrijf-plaatspagina's e.a.)
# Idempotent via 'byl-zk'-guard. Draaien vanuit repo-root.
import os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
EXCLUDE = ('/output/', '/bylder-seo-', '/en-us/', '/web/', '/node_modules/', '/.git/')

LINKSTIJL = 'font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;'
DD_ITEM = 'display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:13.5px;font-weight:600;color:#1A1208;white-space:nowrap;'

DROPDOWN = (
 '<div class="byl-zk" style="position:relative;display:inline-block;">'
 '<style>.byl-zk-menu{display:none;}.byl-zk:hover .byl-zk-menu{display:block;}.byl-zk-menu a:hover{background:rgba(61,90,62,0.07);text-decoration:none;}</style>'
 f'<a href="/zakelijk/" style="{LINKSTIJL}display:inline-flex;align-items:center;gap:4px;">Zakelijk <span style="font-size:9px;">▼</span></a>'
 '<div class="byl-zk-menu" style="position:absolute;top:100%;left:-14px;padding-top:12px;z-index:70;">'
 '<div style="background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 18px 40px rgba(26,18,8,0.14);padding:8px;min-width:230px;">'
 f'<a href="/deelnemer-worden/" style="{DD_ITEM}">Deelnemer worden</a>'
 f'<a href="/deelnemer-worden/commercieel-vastgoed/" style="{DD_ITEM}">Commercieel vastgoed</a>'
 '<a href="/zakelijk/" style="display:block;padding:10px 14px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:700;color:#3D5A3E;border-top:1px solid rgba(61,46,30,0.07);white-space:nowrap;">Alles over Bylder Zakelijk →</a>'
 '</div></div></div>')

JOURNEY = [('/nieuwbouw-koper/', 'Nieuwbouw kopen'), ('/verbouwen/', 'Verbouwen'),
           ('/interieur-woning/', 'Inrichten'), ('/woning-verduurzamen/', 'Verduurzamen'),
           ('/kennisbank/', 'Kennisbank'), ('/nieuwbouw-tools/', 'Tools')]

CANON_INNER = ('\n      ' + '\n      '.join(f'<a href="{h}" style="{LINKSTIJL}">{t}</a>' for h, t in JOURNEY)
 + '\n      ' + DROPDOWN
 + f'\n      <a href="https://app.bylder.com" style="{LINKSTIJL}">Inloggen</a>'
 + '\n      <a href="https://app.bylder.com/registreer" style="background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap;">Start gratis →</a>\n    ')

BARE_INNER = ('\n      ' + '\n      '.join(f'<a href="{h}">{t}</a>' for h, t in JOURNEY)
 + '\n      ' + DROPDOWN + '\n    ')


def find_div_span(h, start):
    open_end = h.index('>', start) + 1
    depth, i = 1, open_end
    while depth and i < len(h):
        m = re.compile(r'<div\b|</div>').search(h, i)
        if not m: return None
        depth += 1 if m.group(0) != '</div>' else -1
        i = m.end()
    return (open_end, i - len('</div>'))


DIV_OPEN = re.compile(r'<div(?: [a-zA-Z-]+="[^"]*")* style="[^"]*display:flex;align-items:center;[^"]*"[^>]*>')
NAVLINKS_OPEN = re.compile(r'<div class="nav-links"[^>]*>')


def transform(h):
    changed = False
    for nav in list(re.finditer(r'<nav\b', h))[::-1]:
        navend = h.find('</nav>', nav.start())
        if navend < 0: continue
        # B: class="nav-links"
        m = NAVLINKS_OPEN.search(h, nav.start(), navend)
        if m:
            span = find_div_span(h, m.start())
            if span:
                oe, cs = span
                inner = h[oe:cs]
                if 'byl-zk' not in inner and 'href="/verbouwen/"' in inner:
                    h = h[:oe] + BARE_INNER + h[cs:]
                    changed = True
            # CTA in dezelfde nav normaliseren
            navend = h.find('</nav>', nav.start())
            seg = h[nav.start():navend]
            ns = seg.replace('href="/betalen/" class="btn-primary"', 'href="https://app.bylder.com/registreer" class="btn-primary"')
            if ns != seg:
                h = h[:nav.start()] + ns + h[navend:]
                changed = True
            continue
        # A: inline journey-container
        pos = nav.start()
        while True:
            m = DIV_OPEN.search(h, pos, h.find('</nav>', nav.start()))
            if not m: break
            span = find_div_span(h, m.start())
            if not span: break
            oe, cs = span
            inner = h[oe:cs]
            if ('byl-zk' not in inner and 'href="/verbouwen/"' in inner
                    and 'href="/nieuwbouw-koper/"' in inner and 'class="zm"' not in inner
                    and ('Start gratis' in inner or 'app.bylder.com' in inner)):
                opening = h[m.start():oe]
                opening_n = re.sub(r'gap:\d+px', 'gap:22px', opening)
                h = h[:m.start()] + opening_n + CANON_INNER + h[cs:]
                changed = True
                break
            pos = oe
    return h, changed


def run():
    files = []
    for dp, dns, fns in os.walk(ROOT):
        rel = dp.replace(ROOT, '') + '/'
        if any(x in rel for x in EXCLUDE):
            dns[:] = []
            continue
        for fn in fns:
            if fn == 'index.html':
                files.append(os.path.join(dp, fn))
    for g in ('generate_deelnemer.py', 'generate_kennisbank.py', 'generate_affiliate.py'):
        files.append(os.path.join(ROOT, '_scripts', g))
    done = 0
    for f in files:
        try:
            h = open(f, encoding='utf-8').read()
        except Exception:
            continue
        if '<nav' not in h:
            continue
        nh, ch = transform(h)
        if ch:
            open(f, 'w', encoding='utf-8').write(nh)
            done += 1
    print(f'aangepast: {done} bestanden')


if __name__ == '__main__':
    run()
