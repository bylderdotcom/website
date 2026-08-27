#!/usr/bin/env python3
# Nav-pijlers-pass (2026-08-27): vervangt de "journey"-nav (Nieuwbouw kopen ·
# Verbouwen · Inrichten · Verduurzamen · Kennisbank · Tools · Zakelijk ▼ ·
# Start gratis →), site-breed uitgerold door nav_uniform_pass.py (2026-07-24),
# door de huidige canonieke nav uit web/app/components/Nav.tsx (ontwerp Daniel,
# 26-08-2026): bovenbalk (Nieuwbouw/Bestaande bouw/Renovatie/Kennisbank) +
# hoofdrij met vier pijlers (Assortiment/Diensten/Kortingsvouchers/Zakelijk),
# Functies, Inloggen en de knop "Maak je stappenplan".
#
# Vervangt het HELE <nav>-element (open- t/m sluittag), niet alleen de
# binnenkant — de oude structuur (glass-nav met .nav-links/.nav-mobile, of
# inline-styled flex-nav) verschilt te veel per pagina om binnenin te
# patchen. Detectie op de openingstag: class bevat "glass-nav" OF
# aria-label="Hoofdnavigatie". Andere <nav>-elementen (Kruimelpad, Footer
# navigatie, Verder lezen, ...) blijven onaangeroerd.
#
# Mobiel menu zonder JavaScript: een verborgen checkbox + <label> voor de
# burger (CSS-only open/dicht), <details>/<summary> per pijler voor het
# accordeon — geen dubbele state, geen scripts nodig.
#
# Idempotent via de marker-klasse "byl-nav2026" op de nieuwe <nav>-tag.
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
EXCLUDE = ('/output/', '/bylder-seo-', '/en-us/', '/web/', '/node_modules/', '/.git/')
MARKER = 'byl-nav2026'

INKT = 'rgba(61,46,30,'

BOVENBALK = [
    ('/nieuwbouw-koper/', 'Nieuwbouw'),
    ('/bestaande-bouw/', 'Bestaande bouw'),
    ('/renovatie/', 'Renovatie'),
    ('/kennisbank/', 'Kennisbank'),
]

MENUS = [
    ('Assortiment', True, [
        ('/assortiment/', 'Zo werkt ons assortiment', 'Deels eigen aanbod, deels partners — bij elk aanbod staat wie levert', True),
        ('/kopen/vloeren/', 'Vloeren', None, False),
        ('/kopen/tegels/', 'Tegels', None, False),
        ('/kozijnloze-deuren/', 'Kozijnloze deuren', None, False),
        ('/kopen/binnendeuren/', 'Binnendeuren', None, False),
        ('/kopen/buitendeuren/', 'Buitendeuren', None, False),
        ('/kopen/keuken/', 'Keukens', None, False),
        ('/kopen/sanitair/', 'Badkamer &amp; sanitair', None, False),
        ('/kopen/slaap-en-bedden/', 'Bedden &amp; matrassen', None, False),
        ('/kopen/zitmeubelen/', 'Banken &amp; stoelen', None, False),
        ('/kopen/kasten/', 'Kasten', None, False),
        ('/kopen/raamdecoratie/', 'Raamdecoratie', None, False),
        ('/kopen/verlichting/', 'Verlichting', None, False),
        ('/kopen/elektronica/', 'Elektronica', None, False),
        ('/kopen/verf/', 'Verf', None, False),
        ('/kopen/wandafwerking/', 'Wandafwerking', None, False),
        ('/kopen/tuin/', 'Tuin', None, False),
        ('/kopen/dakkapellen/', 'Dakkapellen', None, False),
        ('/kopen/zonnepanelen/', 'Zonnepanelen', None, False),
        ('/kopen/isolatie/', 'Isolatie', None, False),
        ('/kopen/laadpalen/', 'Laadpalen', None, False),
    ]),
    ('Diensten', False, [
        ('/offerte-check/', 'Offerte-check', 'Betaal je een eerlijke prijs? Gratis gecheckt', True),
        ('/aannemer/', 'Vind een vakbedrijf', 'Aannemer, loodgieter, elektricien — met beoordelingen', True),
        ('/meerwerk/', 'Meerwerk controleren', 'Vóór je tekent, tegen marktprijzen', True),
        ('/eerlijke-prijzen/', 'Eerlijke prijzen per klus', None, False),
        ('/bouwvergunning/', 'Bouwvergunning', None, False),
        ('/oplevering-nieuwbouw/', 'Oplevering &amp; 5%-regeling', None, False),
        ('/ruimtes/', 'Keuzes per ruimte', None, False),
    ]),
    ('Kortingsvouchers', False, [
        ('/vouchers/', 'Ledenkorting bij 61 merken', 'Auping, Goossens, DRT en meer — met een gratis account', True),
        ('/vouchers/auping/', 'Auping: 10% + gratis leenbed', None, False),
        ('/kortingscode/', 'Kortingscodes per merk', None, False),
        ('/showroomsale/', 'Showroomsale', None, False),
    ]),
    ('Zakelijk', False, [
        ('/inkoopvoordeel/', 'Inkoopvoordeel voor vakbedrijven', 'Word verkooppunt van het gecureerde assortiment — op uitnodiging', True),
        ('/deelnemer-worden/', 'Deelnemer worden', 'Bereik kopers op het juiste koopmoment', True),
        ('/deelnemer-worden/commercieel-vastgoed/', 'Commercieel vastgoed', None, False),
        ('/voor-vakbedrijven/', 'Voor vakbedrijven', None, False),
        ('/zakelijk/', 'Alles over Bylder Zakelijk', None, False),
    ]),
]

SLUGS = ['as', 'di', 'kv', 'zk']


def dd_item(href, title, sub, primair):
    if primair:
        subhtml = f'<span style="font-size:11.5px;color:{INKT}0.72)">{sub}</span>' if sub else ''
        return (f'<a href="{href}" style="display:block;padding:12px 14px;border-radius:10px;'
                f'text-decoration:none;background:#EBF0E8;margin-bottom:4px;">'
                f'<strong style="display:block;font-size:13.5px;font-weight:800;color:#1A1208;">{title}</strong>{subhtml}</a>')
    return (f'<a href="{href}" style="display:block;padding:8px 14px;border-radius:8px;'
            f'text-decoration:none;font-size:13px;font-weight:600;color:{INKT}0.82)">{title}</a>')


def build_nav():
    style = (
        f'.{MARKER}-top{{display:block}}.{MARKER}-desk{{display:flex;align-items:center;gap:24px}}'
        f'.{MARKER}-deskl{{display:inline}}.{MARKER}-burger{{display:none}}'
        f'@media(max-width:1020px){{.{MARKER}-top{{display:none}}.{MARKER}-desk{{display:none}}'
        f'.{MARKER}-deskl{{display:none}}.{MARKER}-burger{{display:flex}}}}'
        f'@media(min-width:1021px){{.{MARKER}-sheet{{display:none!important}}}}'
        + ''.join(f'.{MARKER}-m{slug}:hover .{MARKER}-dd{slug}{{display:block!important}}' for slug in SLUGS)
        + f'.{MARKER}-dd a:hover{{background:rgba(61,90,62,0.06)}}'
        f'.{MARKER}-cb{{position:absolute;opacity:0;pointer-events:none}}'
        f'@media(max-width:1020px){{.{MARKER}-cb:checked~.{MARKER}-sheet{{display:flex!important}}}}'
        f'/*a11y-focus*/:focus-visible{{outline:3px solid #3D5A3E!important;outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}}'
        f'@media (prefers-reduced-motion:reduce){{*{{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}}}'
    )

    bovenbalk_html = ''.join(
        f'<a href="{h}" style="font-size:12.5px;color:{INKT}0.66);text-decoration:none;white-space:nowrap;">{t}</a>'
        for h, t in BOVENBALK)

    logo = ('<a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;">'
            '<span style="width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:inline-flex;'
            'align-items:center;justify-content:center;color:#F5F0E8;font-size:13px;font-weight:800;'
            'font-family:monospace;">B.</span>'
            '<span style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208;">'
            'Bylder<span style="color:#3D5A3E;">.com</span></span></a>')

    desk_menus = []
    for (label, breed, items), slug in zip(MENUS, SLUGS):
        primair_items = ''.join(dd_item(*i) for i in items if i[3])
        secundair_items = [i for i in items if not i[3]]
        sep = f'<div style="height:1px;background:{INKT}0.08);margin:6px 8px;"></div>' if primair_items and secundair_items else ''
        sec_wrap_open = f'<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:4px;">' if breed else ''
        sec_wrap_close = '</div>' if breed else ''
        sec_html = ''.join(dd_item(*i) for i in secundair_items)
        dd_width = 520 if breed else 300
        dd_pos = 'right:-160px;left:auto;' if breed else 'left:0;'
        desk_menus.append(
            f'<div class="{MARKER}-m{slug}" style="position:relative;">'
            f'<button type="button" style="font-size:0.875rem;font-weight:600;color:{INKT}0.8);background:none;'
            f'border:none;cursor:pointer;font-family:inherit;padding:0;display:inline-flex;align-items:center;gap:5px;">'
            f'{label}<svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" style="flex:none;">'
            f'<path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>'
            f'<div class="{MARKER}-dd{slug}" style="display:none;position:absolute;top:calc(100% + 14px);{dd_pos}'
            f'background:#fff;border:1px solid {INKT}0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);'
            f'padding:8px;min-width:{dd_width}px;z-index:200;">'
            f'{primair_items}{sep}{sec_wrap_open}{sec_html}{sec_wrap_close}</div></div>'
        )

    mobile_sections = []
    for label, breed, items in MENUS:
        rows = ''.join(
            f'<a href="{h}" style="display:block;padding:8px 0 8px 8px;font-size:14px;text-decoration:none;'
            f'font-weight:{"700" if primair else "400"};color:{"#3D5A3E" if primair else INKT + "0.75)"};">{t}</a>'
            for h, t, sub, primair in items
        )
        mobile_sections.append(
            f'<details style="border-bottom:1px solid {INKT}0.08);"><summary style="padding:14px 0;'
            f'font-size:15px;font-weight:700;color:#1A1208;cursor:pointer;">{label}</summary>'
            f'<div style="padding-bottom:10px;">{rows}</div></details>'
        )
    meer_rows = ''.join(
        f'<a href="{h}" style="display:block;padding:8px 0 8px 8px;font-size:14px;text-decoration:none;color:{INKT}0.75);">{t}</a>'
        for h, t in BOVENBALK
    ) + f'<a href="/functies/" style="display:block;padding:8px 0 8px 8px;font-size:14px;text-decoration:none;color:{INKT}0.75);">Functies</a>'
    mobile_sections.append(
        f'<details style="border-bottom:1px solid {INKT}0.08);"><summary style="padding:14px 0;'
        f'font-size:15px;font-weight:700;color:#1A1208;cursor:pointer;">Meer</summary>'
        f'<div style="padding-bottom:10px;">{meer_rows}</div></details>'
    )

    # Veel pSEO-templates hebben een eigen kale tag-selector "nav{display:flex;
    # height:64px;position:fixed;...}" voor hun ÉÉN-laags oude nav. Zo'n regel
    # lekt door op alles wat wij hier niet zelf inline dichtzetten (inline
    # wint per eigenschap van elke los-staande selector, ook zonder
    # !important — maar alleen voor eigenschappen die we ook echt zetten).
    # Vandaar expliciet display/height/padding/overflow/margin hieronder,
    # ook al zijn dat voor een normale <nav> de brower-default-waarden.
    nav = (
        f'<nav aria-label="Hoofdnavigatie" class="{MARKER}" style="display:block;position:sticky;'
        f'top:0;z-index:50;height:auto;min-height:0;margin:0;padding:0;overflow:visible;'
        f'background:rgba(245,240,232,0.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);'
        f'border-bottom:1px solid {INKT}0.07);"><style>{style}</style>'
        f'<input type="checkbox" id="{MARKER}-cb" class="{MARKER}-cb">'
        f'<div class="{MARKER}-top" style="border-bottom:1px solid {INKT}0.06);background:#EDE6D8;">'
        f'<div style="max-width:1200px;margin:0 auto;padding:7px 24px;display:flex;align-items:center;'
        f'justify-content:space-between;gap:16px;"><span style="font-size:12px;color:{INKT}0.6)">Gratis voor bewoners</span>'
        f'<div style="display:flex;gap:18px;">{bovenbalk_html}</div></div></div>'
        f'<div style="max-width:1200px;margin:0 auto;padding:13px 24px;display:flex;align-items:center;'
        f'justify-content:space-between;gap:16px;">{logo}'
        f'<div class="{MARKER}-desk">{"".join(desk_menus)}</div>'
        f'<div style="display:flex;align-items:center;gap:14px;">'
        f'<a href="/functies/" class="{MARKER}-deskl" style="font-size:0.8rem;color:{INKT}0.72);text-decoration:none;">Functies</a>'
        f'<a href="https://app.bylder.com" class="{MARKER}-deskl" style="font-size:0.875rem;color:{INKT}0.72);text-decoration:none;">Inloggen</a>'
        f'<a href="https://app.bylder.com/woningscan" style="background:#3D5A3E;color:#F5F0E8;font-size:0.875rem;'
        f'font-weight:700;padding:9px 18px;border-radius:9px;text-decoration:none;white-space:nowrap;">Maak je stappenplan</a>'
        f'<label for="{MARKER}-cb" class="{MARKER}-burger" style="cursor:pointer;padding:6px;flex-direction:column;gap:4px;">'
        + ''.join('<span style="width:20px;height:2px;background:#1A1208;border-radius:2px;display:block;"></span>' for _ in range(3))
        + '</label></div></div>'
        f'<div class="{MARKER}-sheet" style="display:none;border-top:1px solid {INKT}0.07);background:#F5F0E8;'
        f'padding:4px 24px 20px;flex-direction:column;max-height:78vh;overflow-y:auto;">'
        f'{"".join(mobile_sections)}'
        f'<a href="https://app.bylder.com" style="display:block;padding:14px 0 0;font-size:0.875rem;color:{INKT}0.72);text-decoration:none;">Inloggen</a>'
        f'</div></nav>'
    )
    return nav


CANON_NAV = build_nav()


def transform(h):
    out = []
    pos = 0
    changed = False
    while True:
        i = h.find('<nav', pos)
        if i < 0:
            out.append(h[pos:])
            break
        tag_end = h.find('>', i)
        opening = h[i:tag_end + 1]
        if MARKER in opening:
            out.append(h[pos:tag_end + 1])
            pos = tag_end + 1
            continue
        if 'glass-nav' not in opening and 'Hoofdnavigatie' not in opening:
            out.append(h[pos:tag_end + 1])
            pos = tag_end + 1
            continue
        close = h.find('</nav>', tag_end)
        if close < 0:
            out.append(h[pos:tag_end + 1])
            pos = tag_end + 1
            continue
        out.append(h[pos:i])
        out.append(CANON_NAV)
        pos = close + len('</nav>')
        changed = True
    return ''.join(out), changed


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
