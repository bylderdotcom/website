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
# /data/ niet aanraken: dat zijn bronfragmenten die de Next-clusters inlezen.
# Een menu daarin wordt bij het inlezen weggeknipt (web/lib/oud-kopstuk.ts) —
# de layout levert het echte. Toen deze pass die fragmenten wél herschreef,
# herkende het knipwerk het nieuwe menu niet en stond het op /kopen/ en
# /project/ dubbel (27-08 t/m 11-09-2026).
# /.claude/ evenmin: daar staan de worktrees van andere sessies, elk met een
# eigen kopie van de hele site. Zonder deze regel liep een veegronde in de ene
# checkout de 8.361 pagina's van een ándere sessie binnen en zette daar een menu
# neer dat op die tak niet bestond (12-09-2026).
EXCLUDE = ('/output/', '/bylder-seo-', '/en-us/', '/web/', '/node_modules/', '/.git/',
           '/data/', '/.claude/')

# Mappen waarvan Next de pagina's genereert. web/build.sh kopieert de statische
# site met `cp -a -n`, dus waar Next al een bestand schreef wint Next en wordt
# het statische bestand nooit uitgeleverd. 27.900 van de 36.554 statische
# pagina's vallen hieronder — die herschrijven kost schijfruimte in de bouw
# zonder dat een bezoeker het ooit ziet. Dat was een groot deel van waarom de
# vorige veegronde de build op ENOSPC liet stuklopen (27-08-2026).
#
# Bijwerken zodra er een route naar web/app/ verhuist: de lijst komt uit de
# "Route (app)"-tabel onderaan de Vercel-bouwlog.
NEXT_ROUTES = (
    '3d-sfeerimpressie', 'aannemer', 'assortiment', 'badkamer', 'bouwvergunning',
    'dakkapel', 'eerlijke-prijzen', 'elektricien', 'functies', 'gereedschap-lenen',
    'gietvloer', 'hoe-het-werkt', 'inkoopvoordeel', 'kopen', 'kortingscode',
    'kozijnloze-deuren', 'loodgieter', 'nieuwbouw-project', 'prijzen', 'project',
    'ruimtes', 'schilder', 'slaapkamer', 'stukadoor', 'vouchers', 'wonen-in',
)
MARKER = 'byl-nav2026'

INKT = 'rgba(61,46,30,'

BOVENBALK = [
    ('/nieuwbouw-koper/', 'Nieuwbouw'),
    ('/bestaande-bouw/', 'Bestaande bouw'),
    ('/renovatie/', 'Renovatie'),
    ('/kennisbank/', 'Kennisbank'),
]

def aantal_merken():
    """Aantal merken, uit data/deelnemers.json — dezelfde telling als
    web/lib/merken.ts, zodat statische pagina's en Next-routes hetzelfde getal
    tonen. Stond hier tot 11-09-2026 hard als '61': het aantal vouchers uit de
    legacy-import, niet het aantal merken."""
    import json
    with open(os.path.join(ROOT, 'data', 'deelnemers.json'), encoding='utf-8') as fh:
        d = json.load(fh)
    lijst = d if isinstance(d, list) else d.get('deelnemers', [])
    return len({x['naam'] for x in lijst if x.get('naam')})


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
        ('/vouchers/', f'Ledenkorting bij {aantal_merken()} merken', 'Auping, Goossens, DRT en meer — met een gratis account', True),
        ('/vouchers/auping/', 'Auping: 10% + gratis leenbed', None, False),
        ('/kortingscode/', 'Kortingscodes per merk', None, False),
        ('/showroomsale/', 'Showroomsale', None, False),
    ]),
    # Tot 11-09-2026 stond hier 'Word verkooppunt van het gecureerde
    # assortiment — op uitnodiging'. Dat klopt niet meer: het lidmaatschap van
    # €79 staat open voor elk vakbedrijf. Zelfde tekst als in Nav.tsx, zodat
    # statische pagina's en Next-routes hetzelfde beloven.
    # Volgorde gelijk aan Nav.tsx: Kortingsvouchers vóór Advies (besluit Daniel,
    # 11-09-2026). Tot die dag stond Advies hier ervóór.
    #
    # Advies stond tot 11-09-2026 niet in dit script: nav_advies_pass.py voegde
    # het er op 29-08 achteraf aan toe. Daardoor was het 'canonieke' menu hier
    # verouderd, en een run van dit script haalde Advies weer weg van 8.271
    # pagina's. Nu staat het er zelf in; de Advies-pass is daarmee overbodig.
    ('Advies', False, [
        ('/kopersbegeleiding-nieuwbouw/', 'Woningregisseur', 'E&eacute;n plan voor verbouwen, afwerken en inrichten &mdash; gratis', True),
        ('/kopersbegeleiding-nieuwbouw/#ai-kopersbegeleider', 'AI Kopersbegeleider', 'Direct antwoord op je meerwerk- en keuzevragen, 24/7', True),
        ('/kopersbegeleiding/meerwerklijst-nieuwbouw-controleren/', 'Meerwerklijst controleren', None, False),
        ('/kopersbegeleiding/sluitingsdata-meerwerk-deadlines/', 'Sluitingsdata &amp; deadlines', None, False),
        ('/kopersbegeleiding/bouwkundig-meerwerk-indeling/', 'Bouwkundig &amp; indeling', None, False),
        ('/kopersbegeleiding/elektra-lichtplan-nieuwbouw/', 'Elektra &amp; lichtplan', None, False),
        ('/kopersbegeleiding/keuken-badkamer-casco-opleveren/', 'Keuken &amp; badkamer casco', None, False),
        ('/kopersbegeleiding/klimaat-vloerkoeling-nieuwbouw/', 'Klimaat &amp; vloerkoeling', None, False),
        ('/kopersbegeleiding/onafhankelijke-kopersbegeleider-bouwkundig/', 'Onafhankelijke kopersbegeleider', None, False),
    ]),
    ('Zakelijk', False, [
        ('/inkoopvoordeel/', 'Inkoopvoordeel voor vakbedrijven', 'Inkoopkorting én verdienen aan wat je klant koopt — €79 per jaar', True),
        # Stond al in Nav.tsx (de Next-routes), ontbrak hier tot 11-09-2026.
        ('/zakelijk/hoe-een-order-verloopt/', 'Hoe een order verloopt', 'Van doorverwijzing tot uitbetaling, in gewone taal', True),
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
# Vangnet-CSS voor smalle schermen. Hoort hier en niet los onder in bn2.css:
# dat bestand is gegenereerd, en `--css` schreef handmatige toevoegingen zonder
# waarschuwing weg. Alles wat op /bn2.css hoort te staan, staat dus in dit
# script. Regenereren: python3 _scripts/nav_pijlers_pass.py --css
MOBIEL_VANGNET = '''
/* Mobiele balk past binnen het scherm (fix 10-09-2026). Logo + CTA + hamburger
   waren samen breder dan 375px: de hamburger viel buiten beeld en de hele site
   kon horizontaal scrollen. Drie trappen: compacter vanaf de mobiele nav,
   kleinere CTA onder 420px, en krappe marges onder 360px. */
@media(max-width:1020px){.bn2-mw{padding:13px 16px;gap:10px}.bn2-r{gap:10px}.bn2-cta{font-size:0.8125rem;padding:9px 14px}.bn2-bg{padding:6px 2px}}
@media(max-width:420px){.bn2-mw{padding:12px 14px;gap:8px}.bn2-logo{gap:8px}.bn2-lt{font-size:16px}.bn2-r{gap:8px}.bn2-cta{font-size:0.75rem;padding:8px 12px}}
@media(max-width:359px){.bn2-mw{padding:12px 10px}.bn2-logo{gap:6px}.bn2-lt{font-size:15px}.bn2-cta{padding:8px 10px}}

/* ── Mobiel vangnet (10-09-2026) ────────────────────────────────────────────
   Bijna de helft van de pagina's schoof op een telefoon horizontaal mee:
   kaartenrijen die hard op twee of drie kolommen staan, brede tabellen en
   blokken die niet mochten krimpen. De pagina's komen uit een reeks
   generatoren en dragen hun opmaak in de tag zelf, dus dit staat hier
   centraal in plaats van in duizenden bestanden.

   Twee gewichten, met opzet. De regels voor opmaak-in-de-tag hebben
   !important nodig, want anders wint het style-attribuut. De regels op
   klassenamen hebben dat níét: bn2.css staat als laatste in de <head>, dus
   die winnen vanzelf van de paginastijl — maar een pagina die zélf al een
   mobiele indeling meebrengt (bv. twee kolommen onder 768px) houdt de zijne.
   Alles alleen onder 720px; daarboven verandert er niets. */
@media(max-width:720px){
  [style*="grid-template-columns:1fr "],
  [style*="grid-template-columns: 1fr "],
  [style*="grid-template-columns:1.6fr"],
  [style*="grid-template-columns:2fr 1fr"],
  [style*="grid-template-columns:repeat(2,"],
  [style*="grid-template-columns:repeat(3,"],
  [style*="grid-template-columns:repeat(4,"],
  [style*="grid-template-columns:repeat(5,"],
  [style*="grid-template-columns: repeat(2,"],
  [style*="grid-template-columns: repeat(3,"],
  [style*="grid-template-columns: repeat(4,"]{grid-template-columns:1fr!important}

  .grid,.grid-2,.grid-3,.grid-4,.grid-5,.stat-row,.art-grid,.aff-grid,
  .hero-grid,.step-grid,.two-col,.kv,.kv-grid,.seg-grid,.tile-grid,.layout,
  .further-grid,.verder-grid,.verder-lezen-grid,.read-more-grid,.cluster-grid,
  .keuze-grid,.compare-grid,.price-grid,.name-row,.vent-grid,.footer-inner,
  .footer-grid{grid-template-columns:1fr}

  /* Een raster- of flexkind mag standaard niet kleiner dan zijn langste woord;
     daardoor duwde één lange kop de hele pagina breder. */
  *{min-width:0}
  /* Een kaart met min-width:280px past niet op een scherm van 320px. */
  [style*="min-width:2"],[style*="min-width:3"],[style*="min-width:4"],
  [style*="min-width:5"],[style*="min-width:6"],[style*="min-width:7"],
  [style*="min-width:8"],[style*="min-width:9"],
  [style*="min-width: 2"],[style*="min-width: 3"],[style*="min-width: 4"],
  [style*="min-width: 5"],[style*="min-width: 6"]{min-width:0!important}
  /* Een kop van 40px met een woord als 'verbouwingskosten' is breder dan een
     telefoon. Nederlands breekt netjes af zolang de pagina lang=nl heeft. */
  h1,h2,h3{-webkit-hyphens:auto;hyphens:auto}
  body{overflow-wrap:break-word}
  /* Brede prijstabellen schuiven binnen hun eigen kader, niet de pagina. */
  table,table[class],table[style]{display:block;max-width:100%;overflow-x:auto}
  table[style*="min-width"],table[style*="min-width"] *{min-width:0!important}
}

/* ── Oude navigatie op smalle telefoons (11-09-2026) ────────────────────────
   87 pagina's dragen nog de navigatie van vóór het huidige menu (.glass-nav).
   Die balk was 343px breed op een scherm van 320px: logo, de knop en het
   menu-knopje pasten niet naast elkaar. Zelfde aanpak als bij de nieuwe balk:
   compacter vanaf 420px, krapper vanaf 360px. Logo en woordmerk dragen hun
   maten in de tag, vandaar !important. */
@media(max-width:420px){
  .nav-inner{padding:12px 14px!important}
  .nav-inner>a{gap:8px!important}
  .nav-inner>a>span{font-size:16px!important}
  .nav-right{gap:8px!important}
  .nav-cta{font-size:0.75rem!important;padding:8px 12px!important}
  .nav-burger{padding:6px 2px!important}
}
@media(max-width:359px){
  .nav-inner{padding:12px 10px!important}
  .nav-inner>a{gap:6px!important}
  .nav-inner>a>span{font-size:15px!important}
  .nav-cta{padding:8px 10px!important}
}

/* Een knop met een hele zin erin ('Activeer mijn Auping voucher →') stond op
   nowrap en was daardoor 320px breed op een scherm van 320px. Op een telefoon
   mag zo'n knop over twee regels. De balk-knop blijft wél op één regel. */
@media(max-width:480px){
  .btn-primary,.btn-secondary,.btn,.button{white-space:normal!important;max-width:100%}
}
'''

# Meescrollende blokken (sticky zijbalken, prijskaarten) stonden op 80–100px van
# de bovenkant. Dat paste onder het oude menu van ~64px, maar het huidige menu is
# op desktop 104px hoog en blijft zelf ook staan — de bovenkant van zo'n kaart
# gleed er 5–25px onder. Gemeten 11-09-2026: 554 pagina's met de waarde in de
# tag, 20 via .sidebar-card (die klasse is overal sticky). Alleen boven 1020px:
# daaronder is het menu 61px en past het ruim.
# De drie grote statische families — aannemer-matching (2.821),
# renovatiekosten (2.257) en offerte-check (2.257), samen 7.335 pagina's —
# gebruiken allemaal dezelfde container: div.c met 1060px, 5% marge,
# gecentreerd. Op 1440px begon de tekst daardoor 118px rechts van het logo.
# Nu het menuraster, met de inhoud op de breedte die ze had (916px), links.
# Alleen div.c: één pagina gebruikt "c" ook als klasse op een energielabel-chip
# (een span), en die moet blijven zoals hij is.
RASTER_DRIE_FAMILIES = """
/* aannemer-matching, renovatiekosten en offerte-check op het menuraster (12-09-2026). */
div.c{max-width:1200px!important;margin:0 auto;padding-left:24px!important;padding-right:24px!important;box-sizing:border-box}
div.c>*{max-width:916px}
@media(max-width:1020px){div.c{padding-left:16px!important;padding-right:16px!important}}
@media(max-width:420px){div.c{padding-left:14px!important;padding-right:14px!important}}
@media(max-width:359px){div.c{padding-left:10px!important;padding-right:10px!important}}
"""

STICKY_ONDER_MENU = """
/* Net boven 1020px (iPad liggend: 1024) paste het volledige menu niet: het
   stak 18px buiten beeld en de pagina schoof mee. Tot 1180px wat minder ruimte
   tussen de items; er verdwijnt niets uit het menu. */
@media(min-width:1021px) and (max-width:1180px){.bn2-desk{gap:16px}.bn2-r{gap:10px}}

/* De /nieuwbouw/-pagina's (396) zetten de standaardmarge van de browser niet op
   nul: balk en menu stonden 8px van de rand. Elke andere pagina met dit menu
   heeft al margin:0 (gemeten 11-09-2026), dus dit raakt alleen die 396. */
body{margin:0}

/* Meescrollende blokken onder het menu houden (11-09-2026). */
@media(min-width:1021px){
  [style*="position:sticky;top:80px"],[style*="position:sticky;top:84px"],
  [style*="position:sticky;top:90px"],[style*="position:sticky;top:96px"],
  [style*="position:sticky;top:100px"],
  .sidebar-card{top:120px!important}
}
"""

CSS = (
    # De nav brengt zijn eigen box-sizing mee. Zonder dit hangt de breedte af van
    # of de pagina toevallig een globale reset meelevert; op content-box telt de
    # 24px padding bij de max-width op en wordt de balk 1248 in plaats van 1200
    # breed — zichtbaar als een menu dat per pagina 24px dichter op de rand staat.
    f'.{MARKER},.{MARKER} *,.{MARKER} *::before,.{MARKER} *::after{{box-sizing:border-box}}'
    # display/height/padding/overflow expliciet: veel pSEO-templates hebben een
    # eigen kale tag-selector nav{display:flex;height:64px;position:fixed} voor
    # hun oude nav, die anders doorlekt.
    #
    # line-height ook: zonder eigen regelhoogte erfde het menu die van de pagina,
    # en was het 94 tot 108px hoog afhankelijk van waar je stond (gemeten
    # 11-09-2026 op 188 pagina's; de nieuwbouw-gemeentepagina's hebben
    # line-height:normal en kwamen op 94px). 1.7 is wat de meeste pagina's
    # hebben: het menu is nu overal 105px.
    f'.{MARKER}{{display:block;position:sticky;top:0;z-index:50;height:auto;min-height:0;'
    f'margin:0;padding:0;overflow:visible;line-height:1.7;background:rgba(245,240,232,0.92);'
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
    f'.{P}-cb{{position:absolute;opacity:0;pointer-events:none;margin:0}}'
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
    + MOBIEL_VANGNET
    + STICKY_ONDER_MENU
    + RASTER_DRIE_FAMILIES
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
        f'<nav aria-label="Hoofdnavigatie" class="{MARKER}">'
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


LINKTAG = '<link rel="stylesheet" href="/bn2.css">'


def zet_stylesheet_link(h):
    """Zet de stylesheet-link in de head. Render-blocking en dus zonder
    flits van ongestileerde nav. Idempotent op de href."""
    if '/bn2.css' in h:
        return h, False
    i = h.lower().find('</head>')
    if i < 0:
        return h, False
    return h[:i] + LINKTAG + h[i:], True


GATEN_BESTAND = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nav_gaten.txt')


def lees_gaten():
    """Pagina's in een Next-map die Next zélf NIET wegschrijft.

    Een map uit NEXT_ROUTES overslaan was te grof. Next rendert lang niet elk
    pad in zo'n map: waar generateStaticParams niets oplevert, blijft het
    statische bestand staan en krijgt de bezoeker dát te zien. Zo stonden 86
    pagina's — bijna alle overgebleven vakbedrijfprofielen — maanden live met
    het menu van vóór 26-08-2026, terwijl de veegronde ze overal elders had
    vervangen (gevonden 11-09-2026).

    De lijst komt van de live site: `--scan-gaten`. Hem met de hand bijwerken
    heeft geen zin; opnieuw scannen wel, en _scripts/nav_bewaker.py meldt het
    als hij scheef staat.
    """
    if not os.path.exists(GATEN_BESTAND):
        return set()
    with open(GATEN_BESTAND, encoding='utf-8') as fh:
        return {r.strip() for r in fh if r.strip() and not r.startswith('#')}


def scan_gaten(basis='https://www.bylder.com'):
    """Schrijft nav_gaten.txt: welke statische pagina's in een Next-map worden
    echt uitgeleverd?

    Gemeten op de live site, niet op een lokale build. Een volledige
    `next build` schrijft ~68.000 pagina's en ~30 GB weg; op 11-09-2026 liep
    daarmee de schijf van de Mac vol. De vraag is ook veel kleiner: alleen de
    statische bestanden in een Next-map doen ertoe (een paar honderd hooguit),
    en voor elk ervan zegt de live pagina het meteen — draagt hij Next's
    /_next/static-bundels, dan rendert Next hem; zo niet, dan krijgt de bezoeker
    het statische bestand.
    """
    import subprocess
    from concurrent.futures import ThreadPoolExecutor
    kandidaten = []
    for top in NEXT_ROUTES:
        pad0 = os.path.join(ROOT, top)
        if not os.path.isdir(pad0):
            continue
        for dp, _dns, fns in os.walk(pad0):
            if 'index.html' in fns:
                kandidaten.append(os.path.relpath(os.path.join(dp, 'index.html'), ROOT))

    def meet(pad):
        url = basis.rstrip('/') + '/' + pad[:-len('index.html')]
        html = subprocess.run(['curl', '-s', '-L', '--max-time', '25', url],
                              capture_output=True, text=True).stdout
        if not html:
            return pad, 'onbereikbaar'
        return pad, ('next' if '/_next/static' in html else 'statisch')

    with ThreadPoolExecutor(8) as ex:
        uitslag = list(ex.map(meet, kandidaten))
    gaten = sorted(p for p, s in uitslag if s == 'statisch')
    onbereikbaar = [p for p, s in uitslag if s == 'onbereikbaar']
    with open(GATEN_BESTAND, 'w', encoding='utf-8') as fh:
        fh.write('# Statische pagina\'s in een Next-map die Next NIET rendert, en die dus\n'
                 '# gewoon worden uitgeleverd. Gemeten op de live site met:\n'
                 '#   python3 _scripts/nav_pijlers_pass.py --scan-gaten\n')
        fh.write('\n'.join(gaten) + '\n')
    print(f'nav_gaten.txt: {len(gaten)} van {len(kandidaten)} statische pagina\'s '
          f'in Next-mappen worden echt uitgeleverd')
    if onbereikbaar:
        print(f'  let op: {len(onbereikbaar)} niet bereikbaar, niet meegeteld:',
              ', '.join(onbereikbaar[:5]))
    return gaten


def run(scope=None):
    root = os.path.join(ROOT, scope) if scope else ROOT
    gaten = lees_gaten()
    files = []
    for dp, dns, fns in os.walk(root):
        rel = dp.replace(ROOT, '') + '/'
        if any(x in rel for x in EXCLUDE):
            dns[:] = []
            continue
        top = rel.strip('/').split('/')[0]
        for fn in fns:
            if fn != 'index.html':
                continue
            pad = os.path.relpath(os.path.join(dp, fn), ROOT)
            # Next-mappen overslaan, behalve de paden die Next niet rendert.
            if top in NEXT_ROUTES and pad not in gaten:
                continue
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
        nh, ch2 = zet_stylesheet_link(nh)
        if ch or ch2:
            open(f, 'w', encoding='utf-8').write(nh)
            done += 1
    print(f'aangepast: {done} bestanden')


if __name__ == '__main__':
    # --emit-css: schrijft de CSS als TS-constante naar stdout, zodat Nav.tsx
    # (de Next-routes) exact dezelfde vormgeving gebruikt als de statische
    # pagina's. Zie web/app/components/navCss.ts.
    if '--scan-gaten' in sys.argv:
        scan_gaten()
    elif '--emit-css' in sys.argv:
        import json
        print("// GEGENEREERD uit _scripts/nav_pijlers_pass.py (CSS-constante) — niet met de hand")
        print("// bijwerken. De statische pagina's en de Next-routes moeten letterlijk dezelfde")
        print("// nav-vormgeving hebben; één bron voorkomt dat ze uit elkaar lopen.")
        print("//")
        print("// Regenereren:")
        print("//   python3 _scripts/nav_pijlers_pass.py --emit-css > web/app/components/navCss.ts")
        print('export const NAV_CSS = ' + json.dumps(CSS))
    elif '--css' in sys.argv:
        # Schrijft de gedeelde stylesheet naar de repo-root. Die map wordt
        # door web/build.sh naar web/out gekopieerd, dus hij komt op /bn2.css
        # te staan voor zowel de statische pagina's als de Next-routes.
        open(os.path.join(ROOT, 'bn2.css'), 'w', encoding='utf-8').write(CSS)
        print('bn2.css geschreven:', len(CSS), 'bytes')
    else:
        # --dir <map>: beperk de pass tot één cluster. Na de bouwproblemen van
        # 27-08 gaat dit stap voor stap: één cluster, bouwen, groen afwachten,
        # dan pas het volgende.
        scope = None
        if '--dir' in sys.argv:
            scope = sys.argv[sys.argv.index('--dir') + 1]
        run(scope)
