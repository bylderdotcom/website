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
import sys

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



# Korte klasse-prefix voor alles binnen de nav. De marker-klasse zelf blijft
# 'byl-nav2026' (daar herkent transform() de nav aan); de kinderen krijgen 'bn2',
# want elk bespaard teken telt 104.000 keer mee.
P = 'bn2'


def dd_item(href, title, sub, primair):
    if primair:
        subhtml = f'<span>{sub}</span>' if sub else ''
        return f'<a href="{href}" class="{P}-p"><strong>{title}</strong>{subhtml}</a>'
    return f'<a href="{href}" class="{P}-s">{title}</a>'


# Alle vormgeving één keer, als klassen. Stond tot 27-08-2026 als 153 losse
# inline style=""-attributen in de nav, en die nav staat op ~104.000 pagina's
# (36k statisch + 67.710 Next-routes). Dat was 24 kB per pagina — 57% van een
# gemiddelde pagina — en liet de Vercel-build op schijfruimte stuklopen
# (ENOSPC, 6.304 MB output). Als klassen is dezelfde nav ~4 kB.
CSS = (
    # De nav brengt zijn eigen box-sizing mee. Zonder dit hangt de breedte af van
    # of de pagina toevallig een globale reset meelevert; op content-box telt de
    # 24px padding bij de max-width op en wordt de balk 1248 in plaats van 1200
    # breed — zichtbaar als een menu dat per pagina 24px dichter op de rand staat.
    f'.{MARKER},.{MARKER} *,.{MARKER} *::before,.{MARKER} *::after{{box-sizing:border-box}}'
    # display/height/padding/overflow expliciet: veel pSEO-templates hebben een
    # eigen kale tag-selector nav{display:flex;height:64px;position:fixed} voor
    # hun oude nav, die anders doorlekt.
    f'.{MARKER}{{display:block;position:sticky;top:0;z-index:50;height:auto;min-height:0;'
    f'margin:0;padding:0;overflow:visible;background:rgba(245,240,232,0.92);'
    f'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);'
    f'border-bottom:1px solid {INKT}0.07)}}'
    f'.{P}-top{{display:block;border-bottom:1px solid {INKT}0.06);background:#EDE6D8}}'
    f'.{P}-w{{max-width:1200px;margin:0 auto;display:flex;align-items:center;'
    f'justify-content:space-between;gap:16px}}'
    f'.{P}-tw{{padding:7px 24px}}.{P}-mw{{padding:13px 24px}}'
    f'.{P}-free{{font-size:12px;color:{INKT}0.6)}}'
    f'.{P}-tls{{display:flex;gap:18px}}'
    f'.{P}-tl{{font-size:12.5px;color:{INKT}0.66);text-decoration:none;white-space:nowrap}}'
    f'.{P}-logo{{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}}'
    f'.{P}-lm{{width:32px;height:32px;border-radius:8px;background:#3D5A3E;display:inline-flex;'
    f'align-items:center;justify-content:center;color:#F5F0E8;font-size:13px;font-weight:800;'
    f'font-family:monospace}}'
    f'.{P}-lt{{font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#1A1208}}'
    f'.{P}-lg{{color:#3D5A3E}}'
    f'.{P}-desk{{display:flex;align-items:center;gap:24px}}'
    f'.{P}-m{{position:relative}}'
    f'.{P}-btn{{font-size:0.875rem;font-weight:600;color:{INKT}0.8);background:none;border:none;'
    f'cursor:pointer;font-family:inherit;padding:0;display:inline-flex;align-items:center;gap:5px}}'
    f'.{P}-dd{{display:none;position:absolute;top:calc(100% + 14px);left:0;background:#fff;'
    f'border:1px solid {INKT}0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);'
    f'padding:8px;min-width:300px;z-index:200}}'
    f'.{P}-dd.w{{left:auto;right:-160px;min-width:520px}}'
    # Hogere specificiteit dan de display:none hierboven, dus geen !important nodig.
    f'.{P}-m:hover .{P}-dd{{display:block}}'
    f'.{P}-dd a:hover{{background:rgba(61,90,62,0.06)}}'
    f'.{P}-p{{display:block;padding:12px 14px;border-radius:10px;text-decoration:none;'
    f'background:#EBF0E8;margin-bottom:4px}}'
    f'.{P}-p strong{{display:block;font-size:13.5px;font-weight:800;color:#1A1208}}'
    f'.{P}-p span{{font-size:11.5px;color:{INKT}0.72)}}'
    f'.{P}-s{{display:block;padding:8px 14px;border-radius:8px;text-decoration:none;'
    f'font-size:13px;font-weight:600;color:{INKT}0.82)}}'
    f'.{P}-sep{{height:1px;background:{INKT}0.08);margin:6px 8px}}'
    f'.{P}-g{{display:grid;grid-template-columns:1fr 1fr;column-gap:4px}}'
    f'.{P}-r{{display:flex;align-items:center;gap:14px}}'
    f'.{P}-lnk{{font-size:0.875rem;color:{INKT}0.72);text-decoration:none}}'
    f'.{P}-lnk.sm{{font-size:0.8rem}}'
    f'.{P}-cta{{background:#3D5A3E;color:#F5F0E8;font-size:0.875rem;font-weight:700;'
    f'padding:9px 18px;border-radius:9px;text-decoration:none;white-space:nowrap}}'
    f'.{P}-bg{{display:none;cursor:pointer;padding:6px;flex-direction:column;gap:4px}}'
    f'.{P}-bg i{{width:20px;height:2px;background:#1A1208;border-radius:2px;display:block}}'
    f'.{P}-cb{{position:absolute;opacity:0;pointer-events:none}}'
    f'.{P}-sheet{{display:none;border-top:1px solid {INKT}0.07);background:#F5F0E8;'
    f'padding:4px 24px 20px;flex-direction:column;max-height:78vh;overflow-y:auto}}'
    f'.{P}-det{{border-bottom:1px solid {INKT}0.08)}}'
    f'.{P}-sum{{padding:14px 0;font-size:15px;font-weight:700;color:#1A1208;cursor:pointer}}'
    # Knop-variant van hetzelfde kopje, voor de React-nav (daar is het een
    # <button> in plaats van een <summary>).
    f'.{P}-sumb{{display:flex;align-items:center;justify-content:space-between;width:100%;'
    f'background:none;border:none;font-family:inherit;text-align:left;'
    f'padding:14px 0;font-size:15px;font-weight:700;color:#1A1208;cursor:pointer}}'
    f'.{P}-mi{{display:block;padding:8px 0 8px 8px;font-size:14px;text-decoration:none;'
    f'font-weight:400;color:{INKT}0.75)}}'
    f'.{P}-mi.p{{font-weight:700;color:#3D5A3E}}'
    f'.{P}-ml{{display:block;padding:14px 0 0;font-size:0.875rem;color:{INKT}0.72);'
    f'text-decoration:none}}'
    # Mobiel: bovenbalk en desktopmenu weg, burger erbij. Het paneel opent via de
    # verborgen checkbox — geen JavaScript. De checked-regel staat binnen deze
    # media query, dus op desktop blijft het paneel dicht.
    f'@media(max-width:1020px){{.{P}-top{{display:none}}.{P}-desk{{display:none}}'
    f'.{P}-lnk{{display:none}}.{P}-bg{{display:flex}}'
    # .o is de React-variant (state), :checked de CSS-only variant. Beide staan
    # binnen deze media query, dus op desktop blijft het paneel altijd dicht.
    f'.{P}-cb:checked~.{P}-sheet,.{P}-sheet.o{{display:flex}}}}'
    f'/*a11y-focus*/:focus-visible{{outline:3px solid #3D5A3E!important;outline-offset:2px;'
    f'box-shadow:0 0 0 8px rgba(245,240,232,.85)}}'
    f'@media (prefers-reduced-motion:reduce){{*{{animation-duration:.01ms!important;'
    f'transition-duration:.01ms!important;scroll-behavior:auto!important}}}}'
)

PIJL = ('<svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true">'
        '<path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" '
        'stroke-linecap="round"/></svg>')


def build_nav():
    bovenbalk_html = ''.join(f'<a href="{h}" class="{P}-tl">{t}</a>' for h, t in BOVENBALK)

    logo = (f'<a href="/" class="{P}-logo"><span class="{P}-lm">B.</span>'
            f'<span class="{P}-lt">Bylder<span class="{P}-lg">.com</span></span></a>')

    desk_menus = []
    for label, breed, items in MENUS:
        primair = ''.join(dd_item(*i) for i in items if i[3])
        secundair = [i for i in items if not i[3]]
        sep = f'<div class="{P}-sep"></div>' if primair and secundair else ''
        sec = ''.join(dd_item(*i) for i in secundair)
        if breed:
            sec = f'<div class="{P}-g">{sec}</div>'
        desk_menus.append(
            f'<div class="{P}-m"><button type="button" class="{P}-btn">{label}{PIJL}</button>'
            f'<div class="{P}-dd{" w" if breed else ""}">{primair}{sep}{sec}</div></div>')

    mobiel = []
    for label, breed, items in MENUS:
        rows = ''.join(
            f'<a href="{h}" class="{P}-mi{" p" if pr else ""}">{t}</a>'
            for h, t, sub, pr in items)
        mobiel.append(f'<details class="{P}-det"><summary class="{P}-sum">{label}</summary>'
                      f'<div>{rows}</div></details>')
    meer = ''.join(f'<a href="{h}" class="{P}-mi">{t}</a>' for h, t in BOVENBALK)
    meer += f'<a href="/functies/" class="{P}-mi">Functies</a>'
    mobiel.append(f'<details class="{P}-det"><summary class="{P}-sum">Meer</summary>'
                  f'<div>{meer}</div></details>')

    return (
        f'<nav aria-label="Hoofdnavigatie" class="{MARKER}"><style>{CSS}</style>'
        f'<input type="checkbox" id="{P}-cb" class="{P}-cb">'
        f'<div class="{P}-top"><div class="{P}-w {P}-tw">'
        f'<span class="{P}-free">Gratis voor bewoners</span>'
        f'<div class="{P}-tls">{bovenbalk_html}</div></div></div>'
        f'<div class="{P}-w {P}-mw">{logo}'
        f'<div class="{P}-desk">{"".join(desk_menus)}</div>'
        f'<div class="{P}-r">'
        f'<a href="/functies/" class="{P}-lnk sm">Functies</a>'
        f'<a href="https://app.bylder.com" class="{P}-lnk">Inloggen</a>'
        f'<a href="https://app.bylder.com/woningscan" class="{P}-cta">Maak je stappenplan</a>'
        f'<label for="{P}-cb" class="{P}-bg" aria-label="Menu"><i></i><i></i><i></i></label>'
        f'</div></div>'
        f'<div class="{P}-sheet">{"".join(mobiel)}'
        f'<a href="https://app.bylder.com" class="{P}-ml">Inloggen</a></div></nav>'
    )


CANON_NAV = build_nav()


def transform(h):
    """Synchroniseer elke hoofdnav met de canonieke versie.

    Ook een nav die deze pass eerder al schreef (marker-klasse) wordt opnieuw
    opgebouwd — anders blijven 36k pagina's op een oude versie staan zodra de
    canonieke nav verandert. 'changed' komt uit een vergelijking met de invoer,
    dus een tweede run over ongewijzigde bestanden meldt nog steeds niets.
    """
    out = []
    pos = 0
    while True:
        i = h.find('<nav', pos)
        if i < 0:
            out.append(h[pos:])
            break
        tag_end = h.find('>', i)
        opening = h[i:tag_end + 1]
        is_hoofdnav = (MARKER in opening
                       or 'glass-nav' in opening
                       or 'Hoofdnavigatie' in opening)
        close = h.find('</nav>', tag_end) if is_hoofdnav else -1
        if not is_hoofdnav or close < 0:
            out.append(h[pos:tag_end + 1])
            pos = tag_end + 1
            continue
        out.append(h[pos:i])
        out.append(CANON_NAV)
        pos = close + len('</nav>')
    nh = ''.join(out)
    return nh, nh != h


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
    # --emit-css: schrijft de CSS als TS-constante naar stdout, zodat Nav.tsx
    # (de Next-routes) exact dezelfde vormgeving gebruikt als de statische
    # pagina's. Zie web/app/components/navCss.ts.
    if '--emit-css' in sys.argv:
        import json
        print("// GEGENEREERD uit _scripts/nav_pijlers_pass.py (CSS-constante) — niet met de hand")
        print("// bijwerken. De statische pagina's en de Next-routes moeten letterlijk dezelfde")
        print("// nav-vormgeving hebben; één bron voorkomt dat ze uit elkaar lopen.")
        print("//")
        print("// Regenereren:")
        print("//   python3 _scripts/nav_pijlers_pass.py --emit-css > web/app/components/navCss.ts")
        print('export const NAV_CSS = ' + json.dumps(CSS))
    else:
        run()
