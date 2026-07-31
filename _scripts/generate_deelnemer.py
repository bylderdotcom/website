#!/usr/bin/env python3
# Genereert de "Deelnemer worden"-hub + segmentpagina's (statische root-HTML,
# huisstijl = kennisbank-template). Draaien vanuit repo-root:
#   python3 _scripts/generate_deelnemer.py
# Bron van waarheid voor deze pagina's — wijzig hier, niet in de HTML.
import json, os, html

ROOT = os.path.join(os.path.dirname(__file__), '..')
SITE = 'https://www.bylder.com'
MAIL = 'info@bylder.com'

CSS = """*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.75;}
h1,h2,h3,h4{letter-spacing:-0.02em;color:#1A1208;line-height:1.2;}
a{color:#3D5A3E;text-decoration:none;}a:hover{text-decoration:underline;}
.container{max-width:1280px;margin:0 auto;padding:0 48px;}
@media(max-width:768px){.container{padding:0 20px;}}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:24px;}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:48px 0;}
.stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0;}
@media(max-width:768px){.stat-row{grid-template-columns:1fr;}}
.stat-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:24px;text-align:center;}
.stat-val{font-size:2.2rem;font-weight:800;letter-spacing:-0.04em;color:#3D5A3E;}
.stat-lbl{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.06em;color:rgba(61,46,30,0.72);margin-top:4px;}
.step-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin:24px 0;}
@media(max-width:768px){.step-grid{grid-template-columns:1fr;}}
.step-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:24px;}
.step-title{font-size:16px;font-weight:700;color:#1A1208;margin-bottom:8px;}
.step-desc{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.65;}
.price-block{background:#fff;border:2px solid rgba(61,90,62,0.25);border-radius:20px;padding:36px;margin:40px 0;text-align:center;}
.price-val{font-size:2.6rem;font-weight:800;color:#3D5A3E;letter-spacing:-0.04em;}
.price-note{font-size:13px;color:rgba(61,46,30,0.72);margin-top:6px;}
.faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:22px 0;}
.faq-item:last-child{border-bottom:none;}
.faq-q{font-size:16px;font-weight:700;color:#1A1208;margin-bottom:10px;}
.faq-a{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.75;}
.cta-block{background:linear-gradient(135deg,#3D5A3E 0%,#4E7350 100%);border-radius:24px;padding:56px 48px;text-align:center;margin:48px 0;}
.cta-block h2{font-size:2rem;font-weight:800;color:#F5F0E8;margin-bottom:14px;}
.cta-block p{color:rgba(245,240,232,0.7);font-size:16px;max-width:520px;margin:0 auto 32px;}
.cta-btn{display:inline-flex;align-items:center;gap:8px;background:#F5F0E8;color:#3D5A3E;padding:16px 32px;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;}
.cta-btn:hover{background:#EDE6D8;}
.internal-links{background:rgba(61,46,30,0.03);border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:20px 24px;margin:32px 0;}
.il-title{font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.72);margin-bottom:12px;}
.il-links{display:flex;flex-wrap:wrap;gap:10px;}
.il-link{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:#fff;border:1px solid rgba(61,90,62,0.2);border-radius:999px;font-size:13px;color:#3D5A3E;text-decoration:none;font-weight:600;}
.seg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:32px 0;}
@media(max-width:900px){.seg-grid{grid-template-columns:1fr;}}
.seg-card{background:#fff;border:1px solid rgba(61,46,30,0.09);border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:10px;text-decoration:none;transition:all .15s;}
.seg-card:hover{border-color:rgba(61,90,62,0.35);text-decoration:none;transform:translateY(-1px);}
.seg-title{font-size:17px;font-weight:800;color:#1A1208;}
.seg-desc{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.65;flex:1;}
.seg-price{font-size:12px;font-family:'Space Mono',monospace;color:#3D5A3E;}"""

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

FOOTER = """<footer style="background:#1A1208;padding:64px 0 40px;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;flex-wrap:wrap;gap:48px;justify-content:space-between;margin-bottom:40px;">
      <div style="max-width:260px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
          <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
          <span style="font-weight:700;font-size:17px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
        </div>
        <p style="font-size:13px;color:rgba(245,240,232,0.55);line-height:1.7;">AI-gestuurd platform voor nieuwbouwkopers en verbouwers in Nederland.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,160px);gap:40px;">
        <div>
          <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.55);margin-bottom:14px;">Diensten</p>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
            <li><a href="/#scan" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">AI QuickScan</a></li>
            <li><a href="/ai-offerte-check-aannemer/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Offerte check</a></li>
            <li><a href="/#vouchers" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Vouchers</a></li>
          </ul>
        </div>
        <div>
          <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.55);margin-bottom:14px;">Zakelijk</p>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
            <li><a href="/zakelijk/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Zakelijk</a></li>
            <li><a href="/deelnemer-worden/woonwinkels-merken/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Woonwinkels &amp; merken</a></li>
            <li><a href="/voor-vakbedrijven/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Vakbedrijven</a></li>
            <li><a href="/deelnemer-worden/commercieel-vastgoed/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Commercieel vastgoed</a></li>
          </ul>
        </div>
        <div>
          <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.55);margin-bottom:14px;">Bedrijf</p>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
            <li><a href="/over-ons/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Over ons</a></li>
            <li><a href="/kennisbank/" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Kennisbank</a></li>
            <li><a href="mailto:team@bylder.com" style="font-size:14px;color:rgba(245,240,232,0.55);text-decoration:none;">Werken bij</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(245,240,232,0.08);padding-top:28px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.55);">© 2026 Bylder Nederland B.V. — KvK 65020006</p>
      <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.55);">Privacy · Voorwaarden · Cookies</p>
    </div>
  </div>
</footer>"""

HEAD = """<!DOCTYPE html>
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
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css">
<style>{css}/*a11y-focus*/:focus-visible{outline:3px solid #3D5A3E!important;outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}</style>
</head>
<body>"""

SEGMENTS = [
 dict(slug='woonwinkels-merken', naam='Woonwinkels & merken',
  title='Woonwinkels & merken — deelnemer worden | Bylder',
  desc='Bereik kopers van nieuwbouw- en verbouwwoningen op het juiste koopmoment: kortingsvouchers, Showroomsale en productplaatsing in de Bylder-ontwerptools. Gratis instap.',
  intro=["Als deelnemende woonwinkel of woonmerk sta je precies op het moment dat de koper budget en een koopreden heeft: bij oplevering, verbouwing of inrichting. Bylder toont jouw kortingsvoucher, Showroomsale of product op het juiste koopmoment in de klantreis — en in onze 3D-ontwerptools, waar kopers hun woning inrichten met échte producten.",
   "Zo krijg jij als lokale winkel weer zichtbaarheid bij koopklare kopers — juist op het moment dat het geld anders naar de grote e-commercepartijen zou vloeien. Kwalitatieve leads in plaats van de anonieme massamarkt, en je kortingsvouchers werken voor zowel je fysieke winkel als je webshop.",
   "Voor keuken- en badkamerspeciaalzaken is er een aparte showroom-propositie: koppel je design center aan kopers die net hun casco-keuzes maken."],
  stats=[('61','deelnemende merken'), ('€4.200','gem. besparing per koper'), ('10%','standaard kortingsniveau')],
  cards=[('Jouw hele catalogus, automatisch in de journey','Koppel je webshop-feed (bijv. je Google Shopping-feed) en je producten stromen automatisch het platform in — door de AI getagd op ruimte, stijl en koopmoment, en aanbevolen aan de koper precies wanneer het past.'),
         ('Voucher voor je winkel én webshop','Jouw korting verschijnt wanneer de koper aan jouw categorie toe is — inzetbaar in je fysieke winkel én je webshop. Geen strooibudget, wel timing.'),
         ('Zichtbaar naast de grote spelers','Koopklare, kwalitatieve leads komen bij jou terecht in plaats van bij de grote e-commerce. Lokaal ondernemerschap, precies waar de koper naar op zoek is.'),
         ('Productplaatsing in ontwerptools','Kopers richten hun plattegrond in met jouw producten in de 3D-sfeerimpressie en room planner.'),
         ('Showroomsale','Plan een exclusieve sale voor Bylder-leden en vul rustige showroomdagen.'),
         ('Koopmoment-data','Zie wat kopers zoeken en wanneer: inzichten per categorie en regio.')],
  price=('Gratis instap', 'Voucher- en Showroomsale-plaatsing kosten niets. Plus-plaatsing in de ontwerptools + koopmoment-data: €149 per maand, maandelijks opzegbaar. Verkopen we een product voor je? Dan rekenen we slechts 5% commissie — waarschijnlijk het laagste tarief van alle netwerken.'),
  cta=('Maak een merchant-account aan','https://app.bylder.com'),
  faq=[('Wat kost deelnemen als merk of winkel?','De basisplaatsing (kortingsvoucher, Showroomsale) is gratis. De Plus-laag — productplaatsing in de ontwerptools en koopmoment-data — kost €149 per maand en is maandelijks opzegbaar.'),
       ('Hoe komt mijn product in de ontwerptools terecht?','Je levert productdata (afbeeldingen, maten, prijzen) aan via je merchant-account. Wij plaatsen je producten in de 3D-sfeerimpressie en room planner waar ze passen bij stijl en ruimte.'),
       ('Voor wie is de showroom-propositie?','Keuken- en badkamerspeciaalzaken met een fysieke showroom of design center. Bylder stuurt kopers die hun casco-keuzes maken gericht jouw kant op.'),
       ('Hoe krijg ik mijn hele assortiment in Bylder?','Je koppelt eenvoudig je webshop-productfeed (bijvoorbeeld je Google Shopping-feed) of uploadt een productbestand. Onze AI leest, normaliseert en tagt elk product automatisch op ruimte, stijl en categorie, zodat het op het juiste koopmoment wordt aanbevolen. Het aansluiten en de plaatsing zitten bij je deelname inbegrepen; je betaalt alleen 5% commissie op wat we daadwerkelijk voor je verkopen — vermoedelijk het laagste tarief van alle affiliate-netwerken.')],
  links=[('/affiliate/','Ons affiliate-netwerk'),('/showroomsale/','Showroomsale'),('/3d-sfeerimpressie/','3D-ontwerptool'),('/kennisbank/','Kennisbank')]),

 dict(slug='prefab-productie', naam='Prefab-productiebedrijven',
  title='Prefab-productiebedrijven — deelnemer worden | Bylder',
  desc='Prefab-producenten van aanbouwen, dakopbouwen en bijgebouwen: bereik kopers via de Bylder-contenthubs en vind lokale installatiepartners voor plaatsing. Gratis aanmelden.',
  intro=["Bylder verbindt prefab-producenten met twee kanten van de markt tegelijk: de vraagzijde (woningeigenaren die zich op onze aanbouw-, dakopbouw- en bijgebouw-hubs oriënteren) en de uitvoeringszijde (lokale vakbedrijven die jouw product plaatsen).",
   "Zo verkoop je niet alleen een prefab-element, maar een compleet geplaatst product — zonder eigen montagenetwerk te hoeven opbouwen."],
  stats=[('3','contenthubs (aanbouw, dakopbouw, bijgebouw)'), ('2.100+','vakbedrijf-plaatspagina\'s'), ('€149','per gerealiseerde match')],
  cards=[('Vraag uit de contenthubs','Woningeigenaren vergelijken prefab-oplossingen op onze hubs — jouw product staat er tussen.'),
         ('Installatiepartner-netwerk','Gekoppelde lokale bouwbedrijven plaatsen jouw element; jij houdt regie op kwaliteit.'),
         ('Offerte-flow','Kopers vragen via Bylder een prijs op; jij ontvangt gekwalificeerde aanvragen, geen leadveiling.'),
         ('Visualisatie','Kopers zien jouw aanbouw of dakopbouw in 3D op hun eigen woning vóór ze beslissen.')],
  price=('Gratis aanmelden', 'Je betaalt €149 per gerealiseerde match (getekende opdracht via Bylder). Geen abonnement, geen kosten per lead.'),
  cta=('Meld je productiebedrijf aan','mailto:info@bylder.com?subject=Deelnemen%20prefab-productie'),
  faq=[('Wat telt als een gerealiseerde match?','Een getekende opdracht tussen jou (of jouw installatiepartner) en een koper die via Bylder binnenkwam. Aanvragen en offertes zijn gratis.'),
       ('Hoe vind ik installatiepartners?','Bylder koppelt je aan aangesloten lokale bouwbedrijven die zich als installatiepartner hebben aangemeld. Jij bepaalt met wie je werkt.'),
       ('Kan mijn product in de 3D-tools?','Ja — lever maatvoering en beeldmateriaal aan, dan kunnen kopers jouw element op hun eigen woning visualiseren.')],
  links=[('/tools/prefab-configurator/','De prefab-configurator'),('/deelnemer-worden/prefab-netwerk/','Het prefab-netwerk'),('/aanbouw/','Aanbouw-hub'),('/installatiepartner-worden/','Installatiepartner worden')]),

 dict(slug='interieurbouw', naam='Interieurbouw',
  title='Interieurbouwers & maatwerk-meubelmakers — deelnemer worden | Bylder',
  desc='Interieurbouwers en maatwerk-meubelmakers: sta in de op-maat-gids van Bylder en ontvang opdrachten van kopers die hun nieuwbouw- of verbouwwoning inrichten. €79 eenmalig.',
  intro=["Kopers die net een woning hebben gekocht of verbouwd, zoeken maatwerk: kasten, keukens, trapkasten, werkplekken. Bylder's op-maat-gids en ontwerptools brengen die vraag bij jou — op het moment dat het budget er nog is.",
   "Je profiel toont je specialisaties en portfolio, en kopers kunnen hun AI-schets uit onze ontwerptools direct als startpunt naar jou doorsturen."],
  stats=[('12','op-maat-categorieën'), ('€79','eenmalige activatie'), ('0','kosten per lead')],
  cards=[('Plaatsing in de op-maat-gids','Jouw bedrijf bij de categorieën die je maakt: kasten, keukens, badkamermeubels, trap en meer.'),
         ('Van AI-schets naar opdracht','Kopers ontwerpen in onze tools en sturen hun schets naar jou door voor het echte werk.'),
         ('Portfolio-profiel','Laat je mooiste projecten zien; kopers kiezen op stijl en specialisatie.'),
         ('Geen leadveiling','Aanvragen komen rechtstreeks bij jou — je concurreert op werk, niet op reactiesnelheid.')],
  price=('€79 eenmalig', 'Activeer je profiel eenmalig. Geen abonnement, geen kosten per aanvraag — hetzelfde model als voor vakbedrijven.'),
  cta=('Activeer je profiel','mailto:info@bylder.com?subject=Deelnemen%20interieurbouw'),
  faq=[('Wat krijg ik voor €79?','Een permanent profiel in de op-maat-gids met portfolio, specialisaties en contactmogelijkheid, plus doorverwijzingen vanuit de ontwerptools. Eenmalig, geen verlengingskosten.'),
       ('Hoe komen aanvragen binnen?','Rechtstreeks per e-mail of telefoon — Bylder zit er niet tussen en rekent geen commissie per opdracht.'),
       ('Voor wie is dit segment?','Interieurbouwers, maatwerk-meubelmakers en gespecialiseerde timmerbedrijven die voor particulieren werken.')],
  links=[('/op-maat/','Op-maat-gids'),('/ai-interieurontwerp-room-planner/','Room planner'),('/maatwerk-meubels-tafels-korting/','Maatwerk-vouchers')]),

 dict(slug='interieurontwerp-architecten', naam='Interieurontwerp & architecten',
  title='Interieurontwerpers & architecten — deelnemer worden | Bylder',
  desc='Interieurontwerpers en architecten: ontvang klanten op het ontwerpmoment. Kopers starten met AI-tools en schakelen door naar een professional. €79 eenmalig.',
  intro=["Duizenden kopers beginnen hun ontwerp bij Bylder's AI-tools: een 3D-sfeerimpressie, een plattegrond-indeling, een aanbouwschets. Een deel wil daarna een professional die het écht goed maakt — en dat ben jij.",
   "Voor architecten geldt hetzelfde bij verbouw en aanbouw: de koper heeft al een schets en een budgetindicatie, jij maakt er een uitvoerbaar ontwerp van."],
  stats=[('8','AI-ontwerptools als lead-in'), ('€79','eenmalige activatie'), ('0','commissie per opdracht')],
  cards=[('Instromen op ontwerpmoment','Kopers die hun AI-schets willen professionaliseren, zien jouw profiel als logische volgende stap.'),
         ('Portfolio op stijl','Kopers kiezen in de tools een stijl (japandi, industrieel, klassiek) — jij wordt getoond bij jouw stijlen.'),
         ('Verbouw & aanbouw','Architect-profielen worden gekoppeld aan de bouwvergunning- en aanbouw-hubs.'),
         ('Warme aanvragen','De koper komt met schets, wensen en budget — geen koude intake.')],
  price=('€79 eenmalig', 'Activeer je profiel eenmalig. Geen abonnement, geen commissie over je honorarium.'),
  cta=('Activeer je profiel','mailto:info@bylder.com?subject=Deelnemen%20interieurontwerp%20of%20architectuur'),
  faq=[('Voor wie is dit segment?','Interieurontwerpers, interieurarchitecten en (verbouw)architecten die voor particulieren werken.'),
       ('Hoe werkt de koppeling met de AI-tools?','Kopers maken in de tools een eerste schets. Bij het resultaat tonen we ontwerpers die bij hun stijl en regio passen, met de schets als bijlage bij de aanvraag.'),
       ('Rekent Bylder commissie?','Nee. Je betaalt eenmalig €79 voor je profiel; wat je met de klant afspreekt is aan jou.')],
  links=[('/3d-sfeerimpressie/','3D-sfeerimpressie'),('/ai-plattegrond-maken-3d/','Plattegrond-tool'),('/bouwvergunning/','Bouwvergunning-hub')]),

 dict(slug='ontwikkelaars-bouwers', naam='Ontwikkelaars & bouwers',
  title='Projectontwikkelaars & bouwers — Bylder als kopersservice | Bylder',
  desc='Bied Bylder aan als kopersservice bij je nieuwbouwproject: digitale kopersbegeleiding, meerwerk-flow, opleverondersteuning en 3D/BIM-koppeling. Vanaf €49 per woning.',
  intro=["Eén deal, honderden begeleide kopers. Als ontwikkelaar of bouwer geef je kopers Bylder mee als projectservice: digitale kopersbegeleiding van contract tot oplevering, een transparante meerwerk-flow en opleverondersteuning — minder vragen aan jouw kopersbegeleiders, hogere kopertevredenheid.",
   "Werk je met BIM of een woningconfigurator? Bylder koppelt daarop aan: kopers zien hun keuzes in 3D en begrijpen wat ze kopen."],
  stats=[('1','deal = alle kopers van je project'), ('€49','per woning (vanaf)'), ('3D/BIM','koppeling beschikbaar')],
  cards=[('Digitale kopersbegeleiding','Elke koper krijgt de volledige Bylder-begeleiding: tijdlijn, meerwerk-analyse, checklists, oplevering.'),
         ('Transparante meerwerk-flow','Kopers begrijpen hun meerwerklijst en maken snellere keuzes — minder discussie, kortere doorlooptijd.'),
         ('Opleverondersteuning','Voorschouw- en opleverchecklists verlagen het aantal opleverpunten en nazorgtickets.'),
         ('3D/BIM-koppeling','Sluit aan op je BIM-model of configurator; kopers zien hun woning en keuzes in 3D.')],
  price=('Vanaf €49 per woning', 'Per project, afhankelijk van omvang en gewenste modules. Pilotproject? Plan een gesprek — het eerste project doen we tegen instaptarief.'),
  cta=('Plan een projectgesprek','mailto:info@bylder.com?subject=Bylder%20als%20kopersservice%20-%20projectgesprek'),
  faq=[('Wat kost Bylder als kopersservice?','Vanaf €49 per woning per project, afhankelijk van omvang en modules (begeleiding, meerwerk-flow, oplevering, BIM-koppeling). Voor een pilotproject geldt een instaptarief.'),
       ('Vervangt dit onze eigen kopersbegeleiding?','Nee, het ontlast haar. Bylder vangt de standaardvragen en keuzestress af; jouw team houdt de projectspecifieke begeleiding.'),
       ('Voor wie is dit?','Projectontwikkelaars, bouwbedrijven met eigen projecten en woningcorporaties met koop- of renovatieprogramma\'s.')],
  links=[('/kennisbank/','Kennisbank'),('/meerwerk/','Meerwerk-hub'),('/oplevering-nieuwbouw/','Oplevering-hub')]),

 dict(slug='commercieel-vastgoed', naam='Commercieel vastgoed',
  title='Commercieel vastgoed — offerte-check, benchmarks & fit-out | Bylder Zakelijk',
  desc='Bylder voor commercieel vastgoed: AI offerte- en tender-check, kostenbenchmarks per m², fit-out-visualisatie en gekwalificeerde uitvoerende partijen. €299 per dossier.',
  intro=["Bylder Zakelijk brengt de diensten waarmee we particuliere kopers gemiddeld €4.200 laten besparen naar commercieel vastgoed: een AI-check op offertes en tenders, kostenbenchmarks per m² en visualisatie van je fit-out — vóór je tekent.",
   "Voor vastgoedbeleggers en -eigenaren, VvE-beheerders, retail- en horecaketens en kantoor/hospitality fit-out. Eén dossier of een portefeuille: de analyse is dezelfde, de schaal niet."],
  stats=[('€299','per dossier'), ('m²','benchmarks per werksoort'), ('AI','tender- & offerte-analyse')],
  cards=[('Offerte- & tender-check','Upload offertes of tenderstukken; de AI vergelijkt posten met marktprijzen en signaleert afwijkingen en risico\'s.'),
         ('Kostenbenchmarks per m²','Zakelijke varianten van onze marktprijzen: afbouw, installaties, sanitair, vloeren — per werksoort en regio.'),
         ('Fit-out-visualisatie','Zie de inrichting van winkel, kantoor of horecazaak in 3D voordat de aannemer start.'),
         ('Uitvoerende partijen','Toegang tot gekwalificeerde vakbedrijven en interieurbouwers uit het Bylder-netwerk.')],
  price=('€299 per dossier', 'Eén prijs per offerte-/tender-dossier inclusief benchmark-rapport. Portefeuille of doorlopende samenwerking? Enterprise op aanvraag.'),
  cta=('Start een zakelijk dossier','mailto:info@bylder.com?subject=Bylder%20Zakelijk%20-%20commercieel%20vastgoed'),
  faq=[('Voor wie is Bylder Zakelijk?','Vastgoedbeleggers en -eigenaren, VvE-beheerders, retail- en horecaketens en partijen die kantoren of hospitality inrichten. Alles waar een offerte, tender of verbouwing aan te pas komt.'),
       ('Wat krijg ik voor €299?','Een volledige AI-analyse van één offerte- of tenderdossier: postgewijze vergelijking met marktprijzen, risicosignalering en een benchmark-rapport dat je in onderhandeling kunt gebruiken.'),
       ('Werkt dit ook voor VvE\'s?','Ja — juist. VvE-beheerders gebruiken de check voor groot onderhoud en verduurzamingsoffertes; het rapport is direct bruikbaar richting de ledenvergadering.')],
  links=[('/vve-appartement/','VvE-kennis'),('/eerlijke-prijzen/','Marktprijzen per m²'),('/ai-offerte-check-aannemer/','AI offerte-check')]),

 dict(slug='prefab-netwerk', naam='Prefab-netwerk: produceren, plaatsen of bestellen',
  title='Prefab-netwerk voor producenten & vakbedrijven | Bylder',
  desc='Sluit aan op de onafhankelijke prefab-configurator van Bylder: lever als producent, plaats als vakbedrijf, of bestel prefab-elementen voor je eigen klant tegen inkoopcondities.',
  intro=["Het Bylder prefab-netwerk verbindt drie rollen rond \u00e9\u00e9n configurator: producenten die aanbouwen, dakopbouwen en dakkapellen leveren, vakbedrijven die plaatsen, en vakbedrijven die een prefab-element voor hun eigen klant bestellen \u2014 tegen inkoopcondities, met behoud van de klantrelatie.",
   "Consumenten configureren op Bylder \u00e9\u00e9n keer en vragen prijzen aan; jij kiest de rol die bij je bedrijf past. Combineren mag: veel bouwbedrijven plaatsen \u00e9n bestellen."],
  stats=[('3','rollen in \u00e9\u00e9n netwerk'), ('0','kosten voor bestellen als vakbedrijf'), ('\u20ac149','match-fee producent per opdracht')],
  cards=[('Produceren','Lever je elementen via de configurator: gekwalificeerde aanvragen met complete configuratie, geen leadveiling. \u20ac149 per gerealiseerde match.'),
         ('Plaatsen','Word installatiepartner en plaats prefab-elementen van aangesloten producenten bij jou in de regio.'),
         ('Bestellen voor je klant','Bouw- en klusbedrijven configureren en bestellen rechtstreeks voor hun eigen klant \u2014 tegen inkoopcondities, jij houdt de marge op plaatsing en de klantrelatie.'),
         ('E\u00e9n configuratie-standaard','Alle aanvragen komen binnen in hetzelfde formaat: maten, afwerking, opties en situatie \u2014 direct calculeerbaar.')],
  price=('Gratis aanmelden', 'Bestellen als vakbedrijf is kosteloos. Producenten betalen \u20ac149 per gerealiseerde match \u2014 geen abonnement, geen kosten per lead.'),
  cta=('Meld je bedrijf aan','mailto:info@bylder.com?subject=Prefab-netwerk%20aanmelding'),
  faq=[('Ik plaats zelf \u00e9n wil kunnen bestellen \u2014 kan dat?','Ja, dat is juist de bedoeling. Je meldt je \u00e9\u00e9n keer aan en geeft aan welke rollen je vervult: plaatsen, bestellen of allebei. Producenten zien alleen wat relevant is voor de opdracht.'),
       ('Wat zijn de inkoopcondities voor vakbedrijven?','Je bestelt rechtstreeks bij de aangesloten producent tegen diens zakelijke staffel. Bylder rekent het vakbedrijf niets; de producent betaalt de match-fee.'),
       ('Hoe komt mijn bedrijf aan aanvragen?','Consumenten configureren hun element op Bylder en vragen prijzen aan. Producenten ontvangen de aanvraag; plaatsende vakbedrijven worden per regio gekoppeld.')],
  links=[('/tools/prefab-configurator/','Bekijk de configurator'),('/deelnemer-worden/prefab-productie/','Segment: prefab-productie'),('/installatiepartner-worden/','Installatiepartner worden')]),
]

def ld(obj): return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False)+'</script>'

def breadcrumb(items):
    return ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":i+1,"name":n,"item":u} for i,(n,u) in enumerate(items)]})

def strip(s): return s.replace('&','&').strip()

def render_segment(s):
    url=f"{SITE}/deelnemer-worden/{s['slug']}/"
    faq_ld=ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in s['faq']]})
    service_ld=ld({"@context":"https://schema.org","@type":"Service","name":f"Bylder deelname — {s['naam']}",
        "description":s['desc'],"url":url,
        "provider":{"@type":"Organization","name":"Bylder Nederland B.V.","url":SITE+"/"},
        "areaServed":{"@type":"Country","name":"Nederland"}})
    bc=breadcrumb([("Bylder.com",SITE+"/"),("Deelnemer worden",SITE+"/deelnemer-worden/"),(s['naam'],url)])
    stats=''.join(f'<div class="stat-card"><div class="stat-val">{v}</div><div class="stat-lbl">{l}</div></div>' for v,l in s['stats'])
    cards=''.join(f'<div class="step-card"><div class="step-title">{t}</div><div class="step-desc">{d}</div></div>' for t,d in s['cards'])
    faq=''.join(f'<div class="faq-item"><div class="faq-q">{q}</div><div class="faq-a">{a}</div></div>' for q,a in s['faq'])
    links=''.join(f'<a href="{h}" class="il-link">→ {t}</a>' for h,t in s['links'])
    intro=''.join(f'<p style="font-size:1.1rem;color:rgba(61,46,30,0.7);line-height:1.85;margin-bottom:16px;max-width:760px;">{p}</p>' for p in s['intro'])
    label,href=s['cta']
    pname,pnote=s['price']
    return (HEAD.format(title=s['title'],desc=s['desc'],url=url,css=CSS)
      + faq_ld + service_ld + bc + NAV
      + f'''<main style="padding:72px 0 80px;"><div class="container">
<p style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.72);">Bylder.com</a> → <a href="/zakelijk/" style="font-size:14px;color:rgba(61,46,30,0.72);text-decoration:none;">Zakelijk</a> → <span style="color:rgba(61,46,30,0.72);">{s['naam']}</span></p>
<div class="badge">Deelnemer worden</div>
<h1 style="font-size:2.6rem;font-weight:800;margin-bottom:20px;line-height:1.1;max-width:820px;">{s['naam']}: sta waar de klant al is</h1>
{intro}
<div class="stat-row">{stats}</div>
<div class="divider"></div>
<h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 24px;">Wat je krijgt</h2>
<div class="step-grid">{cards}</div>
<div class="price-block"><div class="price-val">{pname}</div><p class="price-note">{pnote}</p>
<a href="{href}" class="cta-btn" style="margin-top:20px;">{label} →</a></div>
<div class="internal-links"><div class="il-title">Relevant op Bylder</div><div class="il-links">{links}</div></div>
<div class="divider"></div>
<h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 8px;">Veelgestelde vragen</h2>{faq}
<div class="cta-block"><h2>Deelnemer worden?</h2><p>Sluit aan bij het platform waar kopers van nieuwbouw- en verbouwwoningen hun keuzes maken.</p>
<a href="{href}" class="cta-btn">{label} →</a></div>
</div></main>''' + FOOTER + '\n</body></html>\n')

def render_hub():
    url=f"{SITE}/deelnemer-worden/"
    bc=breadcrumb([("Bylder.com",SITE+"/"),("Deelnemer worden",url)])
    coll=ld({"@context":"https://schema.org","@type":"CollectionPage","name":"Deelnemer worden bij Bylder",
      "description":"Zakelijk aansluiten bij Bylder: woonwinkels & merken, vakbedrijven, prefab-productie, interieurbouw, interieurontwerp & architecten, ontwikkelaars & bouwers en commercieel vastgoed.",
      "url":url,"inLanguage":"nl-NL",
      "publisher":{"@type":"Organization","name":"Bylder Nederland B.V.","url":SITE+"/","logo":{"@type":"ImageObject","url":SITE+"/android-chrome-512x512.png"}}})
    segs=[("/deelnemer-worden/woonwinkels-merken/","Woonwinkels & merken","Vouchers, Showroomsale en productplaatsing in de ontwerptools — op het juiste koopmoment.","Gratis instap"),
          ("/voor-vakbedrijven/","Vakbedrijven","Sta in de directory waar kopers je zoeken. Geen abonnement, geen leadveiling.","€79 eenmalig"),
          ("/deelnemer-worden/prefab-productie/","Prefab-productiebedrijven","Vraag uit de contenthubs plus een netwerk van installatiepartners.","€149 per match"),
          ("/deelnemer-worden/interieurbouw/","Interieurbouw","Maatwerk-opdrachten uit de op-maat-gids en de ontwerptools.","€79 eenmalig"),
          ("/deelnemer-worden/interieurontwerp-architecten/","Interieurontwerp & architecten","Warme aanvragen op het ontwerpmoment, met AI-schets als startpunt.","€79 eenmalig"),
          ("/deelnemer-worden/ontwikkelaars-bouwers/","Ontwikkelaars & bouwers","Bylder als kopersservice bij je project: begeleiding, meerwerk-flow, 3D/BIM.","vanaf €49 per woning"),
          ("/deelnemer-worden/commercieel-vastgoed/","Commercieel vastgoed","Offerte- & tender-check, m²-benchmarks en fit-out-visualisatie, zakelijk.","€299 per dossier"),
          ("/deelnemer-worden/prefab-netwerk/","Prefab-netwerk","Produceren, plaatsen of bestellen voor je klant — rond één configurator.","gratis aanmelden")]
    cards=''.join(f'<a href="{h}" class="seg-card"><div class="seg-title">{t}</div><div class="seg-desc">{d}</div><div class="seg-price">{p}</div></a>' for h,t,d,p in segs)
    return (HEAD.format(title='Deelnemer worden — zakelijk aansluiten bij Bylder | Bylder.com',
      desc='Word deelnemer van Bylder: bereik kopers van nieuwbouw- en verbouwwoningen op het juiste koopmoment. Voor woonwinkels & merken, vakbedrijven, prefab, interieurbouw, ontwerpers, ontwikkelaars en commercieel vastgoed.',
      url=url,css=CSS) + coll + bc + NAV
      + f'''<main style="padding:72px 0 80px;"><div class="container">
<p style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.72);">Bylder.com</a> → <span style="color:rgba(61,46,30,0.72);">Deelnemer worden</span></p>
<div class="badge">Deelnemer worden</div>
<h1 style="font-size:2.8rem;font-weight:800;margin-bottom:20px;line-height:1.1;max-width:820px;">Sta waar kopers van nieuwbouw- en verbouwwoningen hun keuzes maken</h1>
<p style="font-size:1.1rem;color:rgba(61,46,30,0.7);line-height:1.85;margin-bottom:16px;max-width:760px;">Bylder begeleidt kopers van contract tot inrichting — en op elk beslismoment in die reis is er ruimte voor de juiste deelnemer: een merk, een vakbedrijf, een ontwerper of een producent. Kies hieronder je segment.</p>
<p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:16px;max-width:760px;">Waarom dit werkt: Bylder is een <strong style="color:#1A1208;">verticaal geïntegreerd platform</strong>. Advies, ontwerp, inkoop en uitvoering zitten in één woningdossier in plaats van verdeeld over losse portalen en leadveilingen. Jij komt daardoor niet binnen als koude lead, maar op het exacte moment dat de koper in jouw stap van het dossier zit — met budget, context en koopreden al aanwezig.</p>
<div class="stat-row"><div class="stat-card"><div class="stat-val">61</div><div class="stat-lbl">deelnemende merken</div></div><div class="stat-card"><div class="stat-val">2.100+</div><div class="stat-lbl">vakbedrijf-plaatspagina's</div></div><div class="stat-card"><div class="stat-val">€4.200</div><div class="stat-lbl">gem. besparing per koper</div></div></div>
<div class="divider"></div>
<h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 24px;">Kies je segment</h2>
<div class="seg-grid">{cards}</div>
<div class="card" style="margin:40px 0;padding:32px;">
<h2 style="font-size:1.3rem;font-weight:800;margin-bottom:10px;">Verwijzers: makelaars &amp; hypotheekadviseurs</h2>
<p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.75;margin-bottom:16px;">Jij spreekt kopers op hét moment. Verwijs ze naar Bylder en ontvang €25 per geactiveerde koper — je klant bespaart gemiddeld €4.200, jij verdient aan advies dat je toch al gaf.</p>
<a href="mailto:info@bylder.com?subject=Verwijzer%20worden" class="il-link">→ Word verwijzer</a></div>
<div class="cta-block"><h2>Twijfel je welk segment past?</h2><p>Mail ons kort wat je doet; we denken mee over de beste plek op het platform.</p>
<a href="mailto:info@bylder.com?subject=Deelnemer%20worden" class="cta-btn">Mail info@bylder.com →</a></div>
</div></main>''' + FOOTER + '\n</body></html>\n')

os.makedirs(os.path.join(ROOT,'deelnemer-worden'),exist_ok=True)
open(os.path.join(ROOT,'deelnemer-worden','index.html'),'w').write(render_hub())
for s in SEGMENTS:
    d=os.path.join(ROOT,'deelnemer-worden',s['slug']); os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w').write(render_segment(s))
print('gegenereerd: hub + '+str(len(SEGMENTS))+' segmentpagina\'s')
