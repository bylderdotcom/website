#!/usr/bin/env python3
"""
Content-hub rondom meerwerk (nieuwbouw). Pillar + post-spokes (per meerwerk-item) +
proces-spokes, volledig geoptimaliseerd (SEO/GEO/AEO/schema/CRO/a11y/CWV). Funnel:
gratis meerwerklijst-check → Meerwerk-tracker (lid). Standaard Bylder-nav (inline-CSS).

Prijzen zijn INDICATIEF en verschillen sterk per project/aannemer/regio — overal gehedged.
Informatief, geen prijsgarantie.

Gebruik: python3 generate_meerwerk.py
"""
import os, html, json

BASE = "https://www.bylder.com"
HUB = "/meerwerk"
SIGNUP = "https://app.bylder.com/registreer"
ROOT = os.path.dirname(os.path.abspath(__file__))

PRIJS_CAVEAT = ("Let op: meerwerkprijzen zijn indicatief en verschillen sterk per project, aannemer en regio. "
                "Vraag altijd de specificatie per post op en vergelijk met marktprijzen voordat je tekent.")

# ── Post-spokes: "wat kost [X] aan meerwerk?" ─────────────────────────────────
POSTEN = [
    {"key": "stopcontacten", "label": "Extra stopcontacten", "prijs": "Reken indicatief op €70–€150 per (dubbel) wandcontactdoos via de aannemer; een loze leiding is goedkoper.",
     "intro": "Standaard levert een nieuwbouwwoning vaak te weinig stopcontacten. Extra punten zijn een van de meest gekozen — en meest overgeprijsde — meerwerkposten.",
     "aannemer": "Via de aannemer vóór de ruwbouw is netjes weggewerkt en het goedkoopst qua arbeid.",
     "achteraf": "Achteraf bijplaatsen kan, maar betekent hak- en breekwerk en zichtbare leidingen of opbouwdozen.",
     "tip": "Bepaal per ruimte hoeveel je er echt wilt (keuken en woonkamer vragen er vaak meer dan je denkt) en vergelijk de prijs per punt — bij meer dan ~30% boven marktprijs is er ruimte om te onderhandelen.",
     "qa": [("Hoeveel kost een extra stopcontact bij nieuwbouw?", "Indicatief €70–€150 per punt via de aannemer, afhankelijk van type en locatie. Vraag de prijs per punt op en vergelijk."),
            ("Is een loze leiding goedkoper?", "Ja. Een loze leiding (lege buis) is goedkoper en houdt de optie open om er later bekabeling door te trekken.")]},
    {"key": "lichtpunten", "label": "Lichtpunten & inbouwspots", "prijs": "Indicatief €60–€150 per lichtpunt; dimbare of inbouwspots liggen hoger.",
     "intro": "Lichtpunten en aansluitingen liggen vast in het lichtplan. Wijzigen ná het storten van de vloer is duur, dus dit is bij uitstek meerwerk dat je vooraf goed regelt.",
     "aannemer": "Via de aannemer in het lichtplan: alles netjes weggewerkt, vóór de ruwbouwfase.",
     "achteraf": "Achteraf is lastig en zichtbaar; opbouwspots of rails zijn dan vaak het alternatief.",
     "tip": "Maak een lichtplan per ruimte (algemeen, sfeer, accent) en bepaal waar je dimmers wilt. Loze leidingen op strategische plekken houden je flexibel.",
     "qa": [("Wanneer moet mijn lichtplan klaar zijn?", "Doorgaans vóór de start van de ruwbouw — na het storten van de betonvloer is bijsturen kostbaar."),
            ("Wat kost een extra lichtpunt?", "Indicatief €60–€150 per punt; dimbaar of inbouw hoger. Vraag de specificatie op.")]},
    {"key": "loze-leidingen", "label": "Loze leidingen & data", "prijs": "Indicatief €40–€90 per loze leiding; netwerk/data-bekabeling iets hoger.",
     "intro": "Loze leidingen (lege buizen) en data-aansluitingen zijn goedkoop meerwerk dat je veel flexibiliteit geeft voor later — internet, speakers, een extra schakelaar.",
     "aannemer": "Standaard meegenomen in de ruwbouw; relatief goedkoop omdat er nog geen afwerking is.",
     "achteraf": "Achteraf vraagt het hak- en breekwerk; vooraf is vrijwel altijd voordeliger.",
     "tip": "Plaats loze leidingen naar plekken waar je twijfelt (tv-wand, bureau, buiten). Ze kosten weinig en voorkomen dure ingrepen later.",
     "qa": [("Wat is een loze leiding?", "Een lege buis in de wand of vloer waar je later bekabeling doorheen kunt trekken, zonder opnieuw te hakken."),
            ("Zijn data-aansluitingen meerwerk?", "Vaak wel. Netwerkbekabeling (UTP) naar werkplek of tv-wand is een veelgekozen, betaalbare meerwerkpost.")]},
    {"key": "vloerverwarming", "label": "Vloerverwarming", "prijs": "Indicatief €45–€85 per m² inclusief installatie; volledige woning loopt op.",
     "intro": "Vloerverwarming is comfortabel en past goed bij de lage aanvoertemperatuur van een warmtepomp. Als meerwerkpost is het fors, dus prijs en uitvoering checken loont.",
     "aannemer": "Via de aannemer in de dekvloer meegenomen — de logische en nette route bij nieuwbouw.",
     "achteraf": "Achteraf (infrees of opbouw) kan, maar is rommeliger en niet altijd goedkoper.",
     "tip": "Vergelijk de prijs per m² met de markt en kijk of het hele huis nodig is of alleen de leefruimtes. Combineer met je isolatie- en warmtepompkeuze.",
     "qa": [("Wat kost vloerverwarming per m²?", "Indicatief €45–€85 per m² inclusief installatie; sterk afhankelijk van systeem en oppervlak. Vraag de offerte per m² op."),
            ("Is vloerverwarming verstandig bij een warmtepomp?", "Ja, vloerverwarming werkt efficiënt op lage temperatuur en past daardoor goed bij een warmtepomp.")]},
    {"key": "schuifpui", "label": "Schuifpui of openslaande deuren", "prijs": "Indicatief €3.000–€8.000+ afhankelijk van maat, type en glas.",
     "intro": "Een grotere of schuivende pui naar de tuin is een populaire upgrade. Als meerwerk verandert het de gevel, dus het zit vast in de bouwtekening.",
     "aannemer": "Via de aannemer meegenomen in de gevel; achteraf wijzigen is constructief en duur.",
     "achteraf": "Vrijwel altijd onpraktisch achteraf — dit regel je vóór de bouw.",
     "tip": "Let op het verschil tussen hef-schuif, vouwwand en openslaande deuren; de prijs en het comfort verschillen sterk. Vraag U-waarde/glas mee.",
     "qa": [("Wat kost een schuifpui als meerwerk?", "Indicatief €3.000–€8.000 of meer, afhankelijk van breedte, type (hef-schuif/vouwwand) en glas."),
            ("Kan ik de pui later vergroten?", "Dat is constructief en kostbaar. Een grotere pui regel je het best als meerwerk vóór de bouw.")]},
    {"key": "uitbouw", "label": "Uitbouw of erker", "prijs": "Indicatief €15.000–€40.000+ afhankelijk van grootte en afwerking.",
     "intro": "Een uitbouw of erker vergroot je leefruimte en woningwaarde. Bij nieuwbouw wordt dit als meerwerk in het ontwerp meegenomen.",
     "aannemer": "Via de aannemer en de ontwikkelaar; check ook of het binnen het bouwplan/vergunning past.",
     "achteraf": "Achteraf kan ook (en is dan een aparte verbouwing met eigen vergunningvraag), maar meenemen in de bouw is doorgaans efficiënter.",
     "tip": "Een uitbouw verhoogt vaak de woningwaarde — laat de meerwerkprijs checken en weeg 'm tegen de waardevermeerdering.",
     "qa": [("Verhoogt een uitbouw mijn woningwaarde?", "Doorgaans wel: extra woonoppervlak telt mee. Weeg de meerwerkkosten tegen de waardevermeerdering."),
            ("Heb ik een vergunning nodig voor een uitbouw?", "Bij nieuwbouw zit het in het bouwplan. Doe je het later zelf, check dan de vergunning via onze bouwvergunning-hub.")]},
    {"key": "dakkapel", "label": "Dakkapel", "prijs": "Indicatief €7.000–€15.000 afhankelijk van maat en uitvoering.",
     "intro": "Een dakkapel geeft de zolder hoofdruimte en daglicht. Bij nieuwbouw kun je 'm als meerwerk laten meebouwen.",
     "aannemer": "Meegebouwd door de aannemer is netjes weggewerkt en vaak voordeliger dan achteraf.",
     "achteraf": "Kan later ook (zie onze bouwvergunning-hub voor de regels), maar meebouwen scheelt steiger- en herstelwerk.",
     "tip": "Bepaal vooraf de breedte (meer breedte = meer ruimte en licht) en vergelijk de meerwerkprijs met losse dakkapel-leveranciers.",
     "qa": [("Wat kost een dakkapel als meerwerk?", "Indicatief €7.000–€15.000, afhankelijk van breedte en afwerking. Vergelijk met losse leveranciers."),
            ("Beter meebouwen of achteraf?", "Meebouwen voorkomt later steiger- en herstelwerk en is meestal voordeliger.")]},
    {"key": "buitenkraan", "label": "Buitenkraan", "prijs": "Indicatief €150–€350 inclusief leiding en (vorstvrije) kraan.",
     "intro": "Een buitenkraan is goedkoop, handig meerwerk dat je achteraf liever niet alsnog laat aanleggen.",
     "aannemer": "Vóór de bouw netjes meegenomen met een vorstvrije kraan.",
     "achteraf": "Achteraf vraagt het doorvoeren en hak/breekwerk — vooraf is eenvoudiger.",
     "tip": "Kies een vorstvrije buitenkraan en bepaal de handigste plek (bij de achterdeur of berging).",
     "qa": [("Wat kost een buitenkraan bij nieuwbouw?", "Indicatief €150–€350 inclusief leiding. Een vorstvrije variant is aan te raden."),
            ("Is een buitenkraan meerwerk?", "Meestal wel; het is een veelgekozen, betaalbare post die je vooraf regelt.")]},
    {"key": "krachtstroom", "label": "Krachtstroom / perilex", "prijs": "Indicatief €150–€400 per aansluiting.",
     "intro": "Een perilex- of krachtstroomaansluiting heb je nodig voor sommige kookplaten en steeds vaker voor een laadpunt of zware apparatuur.",
     "aannemer": "Via de aannemer in de meterkast en bekabeling meegenomen.",
     "achteraf": "Achteraf bijtrekken kan, maar vraagt extra groepen en bekabeling.",
     "tip": "Denk vooruit: een extra groep of leiding richting de oprit (laadpaal) of garage is goedkoop meerwerk dat je later veel werk bespaart.",
     "qa": [("Wat kost een krachtstroomaansluiting?", "Indicatief €150–€400 per aansluiting, afhankelijk van afstand en groepen."),
            ("Moet ik nu al rekening houden met een laadpaal?", "Een loze leiding of extra groep richting de oprit is goedkoop vooraf en bespaart later veel werk.")]},
    {"key": "ventilatie", "label": "Ventilatie / WTW-upgrade", "prijs": "Indicatief €1.500–€4.000 voor een upgrade naar balansventilatie met WTW.",
     "intro": "Goede ventilatie bepaalt comfort en gezondheid. Een upgrade van mechanische afzuiging naar balansventilatie met warmteterugwinning (WTW) is een veelgekozen meerwerkpost.",
     "aannemer": "Via de aannemer meegenomen in het installatieontwerp.",
     "achteraf": "Een heel systeem achteraf vervangen is ingrijpend; vooraf kiezen is verstandig.",
     "tip": "Vraag naar de geluidsproductie en het onderhoud (filters). WTW bespaart energie maar vraagt periodiek filteronderhoud.",
     "qa": [("Wat is WTW-ventilatie?", "Balansventilatie met warmteterugwinning: verse lucht wordt voorverwarmd met de warmte van de afgevoerde lucht — energiezuinig."),
            ("Is een ventilatie-upgrade het waard?", "Voor comfort en energie vaak wel; weeg de meerprijs tegen het langetermijnvoordeel en het onderhoud.")]},
]

# ── Proces-spokes ─────────────────────────────────────────────────────────────
TOPICS = [
    {"key": "wat-is-meerwerk", "label": "Wat is meerwerk?", "tagline": "Uitleg in het kort",
     "intro": "Meerwerk is alles wat je bij nieuwbouw extra laat doen bovenop de standaard uit het koop-/aannemingscontract: van extra stopcontacten tot een uitbouw. Minderwerk is het tegenovergestelde — opties laten vervallen.",
     "punten": [("Bovenop de standaard", "Alles wat afwijkt van wat in de basis is opgenomen."),
                ("Vast in de tekening", "Veel meerwerk verandert de technische tekening; soms meerdere rondes."),
                ("Deadlines tellen", "Per fase gelden uiterste data; te laat = niet meer mogelijk of duur."),
                ("Prijs varieert sterk", "Per aannemer en post; vergelijken met marktprijzen loont.")],
     "qa": [("Wat is het verschil tussen meerwerk en minderwerk?", "Meerwerk is extra werk bovenop de standaard; minderwerk is het laten vervallen van opgenomen onderdelen, vaak met een (gedeeltelijke) verrekening."),
            ("Is meerwerk verplicht via de aannemer?", "Voor zaken die in de bouw moeten worden meegenomen meestal wel; andere afwerking kun je soms goedkoper zelf achteraf doen.")]},
    {"key": "meerwerklijst", "label": "De meerwerklijst", "tagline": "Wat staat erop en hoe lees je 'm",
     "intro": "De meerwerklijst is de offerte van de aannemer voor alle extra opties. Gemiddeld staan er tientallen posten op — en uit Bylder-data blijkt dat bijna iedereen minstens één post betaalt die fors boven de marktprijs ligt.",
     "punten": [("Post voor post", "Elke optie met een eenheidsprijs of stelpost."),
                ("Let op stelposten", "Een stelpost is een schatting — vraag een vaste prijs waar het kan."),
                ("Eenheidsprijzen vergelijken", "Prijs per stopcontact, per m² vloerverwarming, enz."),
                ("Laat 'm checken", "Bylder's AI vergelijkt elke post met actuele marktdata.")],
     "qa": [("Hoe controleer ik of mijn meerwerklijst eerlijk is?", "Vergelijk de eenheidsprijzen met de markt. Bylder's AI doet dit per post (groen/oranje/rood) — gemiddeld €1.840 besparing."),
            ("Wat is een stelpost?", "Een geschat bedrag voor werk dat nog niet exact bekend is. Vraag waar mogelijk om een vaste prijs om verrassingen te voorkomen.")]},
    {"key": "kosten", "label": "Wat kost meerwerk gemiddeld?", "tagline": "Budget en bandbreedtes",
     "intro": "Hoeveel je aan meerwerk uitgeeft hangt af van je wensen, maar kopers besteden er al snel duizenden tot tienduizenden euro's aan. Een realistisch budget en een eerlijke prijscheck voorkomen verrassingen.",
     "punten": [("Reserveer bewust", "Bepaal vooraf een meerwerkbudget met buffer."),
                ("Grote posten eerst", "Uitbouw, pui en vloerverwarming wegen het zwaarst."),
                ("Kleine posten tellen op", "Stopcontacten, lichtpunten en leidingen lopen samen op."),
                ("Check de prijzen", "Te dure posten zijn de snelste besparing.")],
     "qa": [("Hoeveel meerwerk is normaal bij nieuwbouw?", "Dat verschilt enorm, maar enkele duizenden tot tienduizenden euro's is gangbaar. Stel een budget met buffer op."),
            ("Waar bespaar ik het makkelijkst?", "Op overgeprijsde posten (laten checken) en door af te wegen wat je via de aannemer doet versus zelf achteraf.")]},
    {"key": "deadline", "label": "Meerwerk-deadline", "tagline": "Wanneer moet je kiezen?",
     "intro": "Meerwerk kent harde deadlines per bouwfase. Mis je een datum, dan kan een optie vervallen of alleen tegen hoge kosten alsnog. Vooral elektra en leidingwerk moeten vroeg vast.",
     "punten": [("Per fase een uiterste datum", "Ruwbouw, installatie en afbouw hebben elk hun moment."),
                ("Elektra het vroegst", "Stopcontacten en lichtpunten vóór de betonvloer."),
                ("Plan vooruit", "Beslis op tijd; overhaaste keuzes kosten geld."),
                ("Reminders helpen", "Bylder bewaakt je deadlines op basis van je opleverdatum.")],
     "qa": [("Wanneer moet ik mijn meerwerk indienen?", "Per fase verschillend; elektra en leidingwerk vaak 8–14 weken na tekenen, vóór de ruwbouw. Houd de data van je aannemer aan."),
            ("Wat als ik te laat ben?", "Dan vervalt de optie of kan het alleen tegen meerkosten achteraf. Plan daarom vooruit.")]},
    {"key": "onderhandelen", "label": "Kun je over meerwerk onderhandelen?", "tagline": "Ja — met onderbouwing",
     "intro": "Meerwerkprijzen liggen niet in beton. Met marktdata in de hand kun je over te dure posten onderhandelen of ze schrappen en zelf (laten) doen.",
     "punten": [("Onderbouw met marktprijzen", "Een eerlijke vergelijking is je sterkste argument."),
                ("Bundel je verzoek", "Meerdere posten tegelijk geeft meer ruimte."),
                ("Of: doe het achteraf", "Bij grote afwijking kun je de post schrappen en zelf regelen."),
                ("Wees op tijd", "Onderhandelen vóór de deadline van die fase.")],
     "qa": [("Kan ik echt onderhandelen met de aannemer?", "Ja, zeker bij posten die fors boven marktprijs liggen. Onderbouw met marktdata of schrap de post en doe 'm achteraf."),
            ("Hoe weet ik of een post te duur is?", "Vergelijk de eenheidsprijs met de markt. Bylder's AI markeert per post groen/oranje/rood met onderhandelingsadvies.")]},
    {"key": "of-achteraf", "label": "Via de aannemer of zelf achteraf?", "tagline": "De juiste afweging per post",
     "intro": "Niet alles hoeft via de aannemer. Sommige posten (elektra, leidingwerk, constructie) regel je het best vooraf; afwerking (verf, vloer, kasten) is achteraf vaak goedkoper.",
     "punten": [("Vooraf: weggewerkt & constructief", "Elektra, leidingen, pui, uitbouw — vóór de bouw."),
                ("Achteraf: afwerking", "Vloeren, schilderwerk, kasten — vaak voordeliger zelf."),
                ("Reken het door", "Meerwerkprijs vs. zelf (laten) doen, incl. gedoe."),
                ("Houd garantie in gedachten", "Zelf doen kan invloed hebben op garanties.")],
     "qa": [("Wat kan ik beter zelf achteraf doen?", "Afwerking zoals vloeren, schilderwerk en kasten is achteraf vaak goedkoper. Elektra en leidingwerk juist vooraf."),
            ("Verlies ik garantie als ik iets zelf doe?", "Dat kan; check de voorwaarden. Werk dat de constructie of installatie raakt, laat je beter via de aannemer doen.")]},
    {"key": "minderwerk", "label": "Minderwerk", "tagline": "Opties laten vervallen",
     "intro": "Minderwerk is het schrappen van standaard opgenomen onderdelen — bijvoorbeeld geen tegelwerk of geen keuken — vaak omdat je het zelf (goedkoper) wilt regelen.",
     "punten": [("Niet alles is verrekenbaar", "Soms krijg je maar een deel terug."),
                ("Vraag de verrekenprijs", "Wat krijg je terug als je het laat vervallen?"),
                ("Zelf doen = eigen regie", "Maar ook eigen planning en risico."),
                ("Weeg het tegen gemak", "Goedkoper zelf doen kost tijd en coördinatie.")],
     "qa": [("Krijg ik geld terug bij minderwerk?", "Vaak deels: de aannemer verrekent een (lager) bedrag dan de meerprijs zou zijn. Vraag de verrekenprijs vooraf op."),
            ("Loont het om de keuken te laten vervallen?", "Soms wel — zelf een keuken kopen kan goedkoper, maar reken de verrekenprijs en je eigen inkoop goed door.")]},
]

# ── Chrome (standaard Bylder-nav, inline-CSS) ────────────────────────────────
NAV_CSS = """
.glass-nav{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links>a{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-links>a:hover{color:#1A1208;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-login{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;}
.nav-dd{position:relative;}
.nav-dd-btn{background:none;border:none;cursor:pointer;font-size:14px;color:rgba(61,46,30,0.5);font-family:inherit;padding:0;display:flex;align-items:center;gap:4px;}
.nav-dd-menu{display:none;position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);padding:8px;min-width:248px;z-index:200;}
.nav-dd:hover .nav-dd-menu,.nav-dd:focus-within .nav-dd-menu{display:block;}
.nav-dd-menu a{display:block;padding:10px 14px;border-radius:10px;color:#3D2E1E;text-decoration:none;}
.nav-dd-menu a:hover{background:#F5F0E8;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
.nav-burger span{width:22px;height:2px;background:#1A1208;border-radius:2px;display:block;}
.nav-mobile{display:none;flex-direction:column;gap:2px;padding:10px 20px 18px;background:rgba(245,240,232,0.98);border-bottom:1px solid rgba(61,46,30,0.08);}
.nav-mobile.open{display:flex;}
.nav-mobile a{padding:11px 10px;color:rgba(61,46,30,0.72);text-decoration:none;font-size:15px;border-radius:8px;}
.nav-mobile .m-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;text-align:center;margin-top:8px;}
@media(max-width:860px){.nav-links,.nav-login{display:none;}.nav-burger{display:flex;}.nav-inner{padding:14px 20px;}}
"""

NAV_HTML = f"""<nav class="glass-nav">
  <div class="nav-inner">
    <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
      <span style="font-weight:700;font-size:18px;color:#1A1208;letter-spacing:-0.02em;">Bylder<span style="color:#3D5A3E;">.com</span></span>
    </a>
    <div class="nav-links">
      <a href="/#features">Voordelen</a>
      <a href="/vouchers/">Vouchers</a>
      <a href="/functies/">Functies</a>
      <div class="nav-dd">
        <button class="nav-dd-btn" type="button">Voor wie? <span style="font-size:10px;">&#9660;</span></button>
        <div class="nav-dd-menu">
          <a href="/nieuwbouw-koper/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Nieuwbouwkoper</strong><span style="font-size:11px;color:rgba(61,46,30,0.5);">Meerwerklijst, vouchers, planning</span></a>
          <a href="/bestaande-bouw/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Bestaande bouw koper</strong><span style="font-size:11px;color:rgba(61,46,30,0.5);">Offerte-check, aannemer matching</span></a>
          <a href="/renovatie/"><strong style="display:block;font-size:13px;font-weight:700;color:#1A1208;">Renovatiewoning</strong><span style="font-size:11px;color:rgba(61,46,30,0.5);">Budgettool, subsidies, planning</span></a>
        </div>
      </div>
      <a href="/prijzen/">Prijzen</a>
    </div>
    <div class="nav-right">
      <a href="https://app.bylder.com" class="nav-login">Inloggen</a>
      <a href="{SIGNUP}" class="nav-cta">Start gratis &#8594;</a>
      <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false" onclick="var m=document.getElementById('navMobile');this.setAttribute('aria-expanded',m.classList.toggle('open'));"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-mobile" id="navMobile">
    <a href="/#features">Voordelen</a>
    <a href="/vouchers/">Vouchers</a>
    <a href="/functies/">Functies</a>
    <a href="{HUB}/">Meerwerk</a>
    <a href="/prijzen/">Prijzen</a>
    <a href="https://app.bylder.com">Inloggen</a>
    <a href="{SIGNUP}" class="m-cta">Start gratis &#8594;</a>
  </div>
</nav>"""

def head(title, desc, canonical, schema_blocks):
    schema = "\n".join(f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>' for b in schema_blocks)
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canonical}">
<meta name="robots" content="index,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
{schema}
<style>
*{{box-sizing:border-box;margin:0;padding:0;}}
body{{background:#F5F0E8;color:#3D2E1E;font-family:'Plus Jakarta Sans',sans-serif;line-height:1.7;}}
h1,h2,h3{{letter-spacing:-0.02em;color:#1A1208;}}
a{{color:#3D5A3E;}}
.container{{max-width:1180px;margin:0 auto;padding:0 48px;}}
.badge{{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}}
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:22px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:36px 0;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;font-size:14px;color:rgba(61,46,30,0.75);line-height:1.7;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;padding:16px 18px;transition:border-color .15s;}}
.tile:hover{{border-color:rgba(61,90,62,0.4);}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-3{{grid-template-columns:1fr;}}.hero-grid{{grid-template-columns:1fr!important;gap:32px!important;}}aside{{position:static!important;}}}}
{NAV_CSS}
</style>
</head>
<body>{NAV_HTML}"""

FOOTER = """<footer style="background:#1A1208;padding:56px 0;">
  <div style="max-width:1180px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:30px;height:30px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:12px;">B.</div>
      <span style="font-weight:700;font-size:16px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.4);max-width:560px;line-height:1.6;">Prijzen zijn indicatief en verschillen per project, aannemer en regio. Laat je meerwerklijst checken in de Bylder-app voor een eerlijke vergelijking per post.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer>
</body></html>"""

def faq_schema(qa):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}

def breadcrumb(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def faq_html(qa):
    items = "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{html.escape(a)}</p></div>' for q, a in qa)
    return f'<h2 style="font-size:1.4rem;font-weight:700;margin:36px 0 12px;">Veelgestelde vragen</h2>{items}'

def cta_block():
    return f"""<div style="background:#3D5A3E;border-radius:20px;padding:44px;text-align:center;margin:40px 0;">
  <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">De Meerwerk-tracker van Bylder</p>
  <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Betaal je niet te veel meerwerk?</h2>
  <p style="color:rgba(245,240,232,0.72);margin-bottom:26px;max-width:560px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.65;">Upload je meerwerklijst &mdash; Bylder's AI checkt elke post op een eerlijke prijs (gemiddeld &euro;1.840 bespaard). Verandert je tekening door meerwerk? De tracker bewaart elke versie en laat per ronde zien wat er wijzigt. Eerste check gratis.</p>
  <a href="{SIGNUP}" class="cta-primary">Start gratis &#8594;</a>
</div>"""

def prijs_note():
    return f'<div class="highlight">{html.escape(PRIJS_CAVEAT)}</div>'

# ── Hub ──────────────────────────────────────────────────────────────────────
def build_hub():
    title = "Meerwerk bij nieuwbouw: kosten per post, lijst & tips | Bylder.com"
    desc = "Alles over meerwerk bij nieuwbouw: wat kost het per post (stopcontacten, vloerverwarming, schuifpui), hoe lees je de meerwerklijst, deadlines, onderhandelen en zelf-doen. Laat je lijst gratis checken."
    canonical = f"{BASE}{HUB}/"
    qa = [
        ("Wat is meerwerk bij nieuwbouw?", "Meerwerk is alles wat je extra laat doen bovenop de standaard uit je contract — van extra stopcontacten tot een uitbouw. Het verandert vaak de technische tekening."),
        ("Wat kost meerwerk gemiddeld?", "Dat verschilt sterk per project; van enkele duizenden tot tienduizenden euro's. Grote posten (uitbouw, pui, vloerverwarming) wegen het zwaarst."),
        ("Hoe weet ik of mijn meerwerk te duur is?", "Vergelijk de eenheidsprijs per post met de markt. Bylder's AI markeert elke post groen/oranje/rood — gemiddeld €1.840 besparing."),
        ("Kan ik over meerwerk onderhandelen?", "Ja, zeker bij posten die fors boven marktprijs liggen. Onderbouw met marktdata of schrap de post en doe 'm achteraf."),
    ]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Meerwerk", canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": "Meerwerk bij nieuwbouw: kosten, lijst & tips", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}}]

    post_tiles = "".join(f'<a href="{HUB}/{p["key"]}/" class="tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{p["label"]}</div><div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">Kosten &amp; tips</div></a>' for p in POSTEN)
    topic_tiles = "".join(f'<a href="{HUB}/{t["key"]}/" class="tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{t["label"]}</div><div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">{t["tagline"]}</div></a>' for t in TOPICS)

    body = f"""<main style="padding:60px 0;">
  <div class="container">
    <div style="max-width:760px;">
      <div class="badge">Nieuwbouw &middot; meerwerk</div>
      <h1 style="font-size:2.6rem;font-weight:800;line-height:1.14;margin-bottom:14px;">Meerwerk bij nieuwbouw — wat kost het, en wat is eerlijk?</h1>
      <p style="font-size:1.12rem;color:rgba(61,46,30,0.65);line-height:1.7;margin-bottom:18px;">Extra stopcontacten, vloerverwarming, een schuifpui of een uitbouw: meerwerk maakt je woning af, maar de prijzen lopen sterk uiteen. <strong>96% van de kopers betaalt minstens één post te duur.</strong> Hieronder per post wat het kost en hoe je grip houdt — plus hoe je je lijst gratis laat checken.</p>
      <a href="{SIGNUP}" style="display:inline-block;background:#3D5A3E;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Laat je meerwerklijst checken &#8594;</a>
    </div>

    <h2 style="font-size:1.5rem;font-weight:800;margin:44px 0 8px;">Wat kost meerwerk per post?</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">Indicatieve prijzen en tips voor de meestgekozen meerwerkposten.</p>
    <div class="grid-3">{post_tiles}</div>

    <h2 style="font-size:1.5rem;font-weight:800;margin:44px 0 8px;">Meerwerk slim aanpakken</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">De meerwerklijst, kosten, deadlines, onderhandelen en de afweging via de aannemer of zelf.</p>
    <div class="grid-3">{topic_tiles}</div>

    {cta_block()}

    {prijs_note()}

    {faq_html(qa)}

    <div class="divider"></div>
    <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder: <a href="/nieuwbouw-koper/">nieuwbouw kopen</a> · <a href="/bouwvergunning/">bouwvergunning nodig?</a> · <a href="/functies/">alle functies van Bylder</a></p>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

def footer():
    return FOOTER

# ── Post-pagina ──────────────────────────────────────────────────────────────
def build_post(p):
    label = p["label"]
    title = f"{label} als meerwerk: wat kost het bij nieuwbouw? | Bylder.com"
    desc = f"{label} als meerwerk bij nieuwbouw: indicatieve kosten, via de aannemer of zelf achteraf, en hoe je checkt of de prijs eerlijk is."
    canonical = f"{BASE}{HUB}/{p['key']}/"
    qa = p["qa"]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Meerwerk", f"{BASE}{HUB}/"), (label, canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": f"{label} als meerwerk", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}}]
    others = [o for o in POSTEN if o["key"] != p["key"]][:6]
    other_tiles = "".join(f'<a href="{HUB}/{o["key"]}/" class="tile"><div style="font-weight:700;font-size:14px;color:#1A1208;">{o["label"]}</div></a>' for o in others)

    body = f"""<main style="padding:56px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:28px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Meerwerk</a> → <span style="color:rgba(61,46,30,0.6);">{label}</span></p>
        <div class="badge">Meerwerk</div>
        <h1 style="font-size:2.3rem;font-weight:800;line-height:1.15;margin-bottom:8px;">{label}: wat kost het als meerwerk?</h1>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:18px;">{html.escape(p['intro'])}</p>

        <div class="highlight"><strong>Indicatieve prijs:</strong> {html.escape(p['prijs'])}</div>

        <h2 style="font-size:1.35rem;font-weight:700;margin:30px 0 10px;">Via de aannemer of zelf achteraf?</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:8px;"><strong>Via de aannemer:</strong> {html.escape(p['aannemer'])}</p>
        <p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.8;">  <strong>Zelf achteraf:</strong> {html.escape(p['achteraf'])}</p>

        <h2 style="font-size:1.35rem;font-weight:700;margin:30px 0 10px;">Tip</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.8;">{html.escape(p['tip'])}</p>

        {cta_block()}

        {faq_html(qa)}

        <h2 style="font-size:1.35rem;font-weight:700;margin:36px 0 12px;">Andere meerwerkposten</h2>
        <div class="grid-3">{other_tiles}</div>

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">meerwerk-overzicht</a> · <a href="{HUB}/meerwerklijst/">de meerwerklijst</a> · <a href="{HUB}/onderhandelen/">onderhandelen</a></p>
      </article>

      <aside style="position:sticky;top:96px;">
        <div class="card" style="margin-bottom:18px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Betaal je niet te veel?</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Laat je meerwerklijst checken: per post groen/oranje/rood. Eerste check gratis.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis &#8594;</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Meerwerk-tracker</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);line-height:1.6;">Verandert je tekening door meerwerk? Bylder bewaart elke versie en toont per ronde wat er wijzigt.</p>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Proces-pagina ────────────────────────────────────────────────────────────
def build_topic(t):
    label = t["label"]
    title = f"{label} — {t['tagline']} (nieuwbouw meerwerk) | Bylder.com"
    desc = t["intro"][:155]
    canonical = f"{BASE}{HUB}/{t['key']}/"
    qa = t["qa"]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Meerwerk", f"{BASE}{HUB}/"), (label, canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": label, "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}}]
    punten = "".join(f'<li style="display:flex;gap:10px;font-size:15px;line-height:1.55;"><span style="color:#3D5A3E;font-weight:700;flex-shrink:0;">&#10003;</span><span><strong>{html.escape(n)}.</strong> {html.escape(x)}</span></li>' for n, x in t["punten"])
    topic_links = "".join(f'<a href="{HUB}/{o["key"]}/" class="tile"><div style="font-weight:700;font-size:14px;color:#1A1208;">{o["label"]}</div></a>' for o in TOPICS if o["key"] != t["key"])

    body = f"""<main style="padding:56px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:28px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Meerwerk</a> → <span style="color:rgba(61,46,30,0.6);">{label}</span></p>
        <div class="badge">Meerwerk</div>
        <h1 style="font-size:2.2rem;font-weight:800;line-height:1.15;margin-bottom:8px;">{label}</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);font-style:italic;margin-bottom:8px;">{t['tagline']}</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:20px;">{html.escape(t['intro'])}</p>

        <h2 style="font-size:1.35rem;font-weight:700;margin:30px 0 12px;">Het belangrijkste op een rij</h2>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;padding:0;">{punten}</ul>

        {cta_block()}

        {faq_html(qa)}

        <h2 style="font-size:1.35rem;font-weight:700;margin:36px 0 12px;">Meer over meerwerk</h2>
        <div class="grid-3">{topic_links}</div>

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">meerwerk-overzicht</a></p>
      </article>

      <aside style="position:sticky;top:96px;">
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Laat je meerwerklijst checken</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Per post groen/oranje/rood met onderhandelingsadvies. Gemiddeld €1.840 bespaard.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis &#8594;</a>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Sitemap ──────────────────────────────────────────────────────────────────
def build_sitemap():
    urls = [f"{BASE}{HUB}/"] + [f"{BASE}{HUB}/{p['key']}/" for p in POSTEN] + [f"{BASE}{HUB}/{t['key']}/" for t in TOPICS]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓", path)

if __name__ == "__main__":
    print("Meerwerk content-hub genereren…")
    write("meerwerk/index.html", build_hub())
    for p in POSTEN:
        write(f"meerwerk/{p['key']}/index.html", build_post(p))
    for t in TOPICS:
        write(f"meerwerk/{t['key']}/index.html", build_topic(t))
    write("meerwerk-sitemap.xml", build_sitemap())
    total = 1 + len(POSTEN) + len(TOPICS)
    print(f"Klaar: 1 hub + {len(POSTEN)} posten + {len(TOPICS)} proces-pagina's = {total} pagina's + sitemap.")
