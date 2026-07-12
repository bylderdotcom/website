#!/usr/bin/env python3
"""
Content-hub rond de 3D-sfeerimpressie-tool (plattegrond → 3D-impressie in een stijl).
Genereert een pillar-hub + 6 stijl-spokes, volledig geoptimaliseerd (SEO/GEO/AEO/
schema/CRO/a11y/CWV). Funnel: gratis account → €99-lid ontgrendelt de tool.

Output: /3d-sfeerimpressie/index.html, /3d-sfeerimpressie/<stijl>/index.html,
        3d-sfeerimpressie-sitemap.xml

Gebruik: python3 generate_visualisatie.py
"""
import os, html, json

BASE = "https://www.bylder.com"
HUB = "/3d-sfeerimpressie"
SIGNUP = "https://app.bylder.com/registreer"
ROOT = os.path.dirname(os.path.abspath(__file__))

# ── Standaard-navigatie (1-op-1 met de homepage, maar inline-CSS i.p.v. Tailwind) ──
NAV_CSS = """
.glass-nav{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links>a{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-links>a:hover{color:#1A1208;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-login{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;transition:all .25s;white-space:nowrap;}
.nav-cta:hover{background:#4E7350;box-shadow:0 8px 30px rgba(61,90,62,0.3);transform:translateY(-1px);}
.nav-dd{position:relative;}
.nav-dd-btn{background:none;border:none;cursor:pointer;font-size:14px;color:rgba(61,46,30,0.5);font-family:inherit;padding:0;display:flex;align-items:center;gap:4px;}
.nav-dd-btn:hover{color:#1A1208;}
.nav-dd-menu{display:none;position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);padding:8px;min-width:248px;z-index:200;}
.nav-dd:hover .nav-dd-menu,.nav-dd:focus-within .nav-dd-menu{display:block;}
.nav-dd-menu a{display:block;padding:10px 14px;border-radius:10px;color:#3D2E1E;text-decoration:none;}
.nav-dd-menu a:hover{background:#F5F0E8;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
.nav-burger span{width:22px;height:2px;background:#1A1208;border-radius:2px;display:block;}
.nav-mobile{display:none;flex-direction:column;gap:2px;padding:10px 20px 18px;background:rgba(245,240,232,0.98);border-bottom:1px solid rgba(61,46,30,0.08);}
.nav-mobile.open{display:flex;}
.nav-mobile a{padding:11px 10px;color:rgba(61,46,30,0.72);text-decoration:none;font-size:15px;border-radius:8px;}
.nav-mobile a:hover{background:rgba(61,46,30,0.05);}
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
      <a href="/nieuwbouw-koper/">Nieuwbouw kopen</a>
      <a href="/verbouwen/">Verbouwen</a>
      <a href="/interieur-woning/">Inrichten</a>
      <a href="/woning-verduurzamen/">Verduurzamen</a>
      <a href="/kennisbank/">Kennisbank</a>
      <a href="/nieuwbouw-tools/">Tools</a>
      <a href="/zakelijk/">Zakelijk</a>
    </div>
    <div class="nav-right">
      <a href="https://app.bylder.com" class="nav-login">Inloggen</a>
      <a href="{SIGNUP}" class="nav-cta">Start gratis &#8594;</a>
      <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false" onclick="var m=document.getElementById('navMobile');this.setAttribute('aria-expanded',m.classList.toggle('open'));"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-mobile" id="navMobile">
      <a href="/nieuwbouw-koper/">Nieuwbouw kopen</a>
      <a href="/verbouwen/">Verbouwen</a>
      <a href="/interieur-woning/">Inrichten</a>
      <a href="/woning-verduurzamen/">Verduurzamen</a>
      <a href="/kennisbank/">Kennisbank</a>
      <a href="/nieuwbouw-tools/">Tools</a>
      <span style="display:block;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.4);font-weight:700;padding:12px 0 2px;">Zakelijk</span>
      <a class="zm" href="/deelnemer-worden/">Deelnemer worden</a>
      <a class="zm" href="/deelnemer-worden/commercieel-vastgoed/">Commercieel vastgoed</a>
    </div>
</nav>"""

# ── De 6 stijlen (1-op-1 met app/src/lib/renderStyles.ts) ────────────────────
STYLES = [
    {
        "key": "scandinavisch", "label": "Scandinavisch",
        "tagline": "Licht, luchtig en natuurlijk",
        "palette": ["#F4EFE7", "#D8C3A5", "#A9B7A0", "#2E2A24"],
        "materialen": "licht eikenhout, witte wanden, natuurlijk linnen en wol",
        "kleuren": "warm wit, zachte houttinten en gedempt saliegroen",
        "sfeer": "minimalistisch, luchtig en gevuld met zacht daglicht",
        "intro": "De Scandinavische stijl draait om rust, licht en functioneel comfort. Lichte houtsoorten, witte wanden en natuurlijke textiel maken elke ruimte luchtig en tijdloos — ideaal voor wie een kalme, opgeruimde nieuwbouwwoning voor ogen heeft.",
        "ruimtes": {
            "Woonkamer": "een lichte eiken vloer, een neutrale bank met linnen kussens en veel daglicht via grote raampartijen.",
            "Keuken": "matwitte fronten zonder grepen, houten accenten en een rustige, opgeruimde uitstraling.",
            "Slaapkamer": "zachte aardetinten, natuurlijk linnen beddengoed en warme, indirecte verlichting.",
        },
    },
    {
        "key": "japandi", "label": "Japandi",
        "tagline": "Warm minimalisme met rust",
        "palette": ["#EDE6DA", "#C9A88B", "#8A7B6B", "#3B342B"],
        "materialen": "natuurlijk hout, keramiek, papier en handgemaakte textiel",
        "kleuren": "gedempte aardetinten, taupe en zachte zwart-accenten",
        "sfeer": "kalm, serene en bewust minimalistisch met lage meubels",
        "intro": "Japandi versmelt Japanse soberheid met Scandinavische warmte. Lage, eerlijke meubels, natuurlijke materialen en gedempte tinten geven een diepe rust — perfect voor wie een woning wil die voelt als een adempauze.",
        "ruimtes": {
            "Woonkamer": "lage houten meubels, een neutrale vloerlamp en een bewust lege, rustige vloer.",
            "Keuken": "natuurlijke houtnerven, mat keramiek en een opgeruimd aanrecht zonder visuele ruis.",
            "Slaapkamer": "een lage bedstee, aardetinten en zacht filterend daglicht.",
        },
    },
    {
        "key": "industrieel", "label": "Industrieel",
        "tagline": "Stoer met warme accenten",
        "palette": ["#CDC4BA", "#8A8178", "#B5653F", "#2A2723"],
        "materialen": "zichtbaar metselwerk, zwart staal, beton en warm hout",
        "kleuren": "betongrijs, baksteenrood, mat zwart en warme houttinten",
        "sfeer": "stoer en ruimtelijk, verzacht door hout en warme verlichting",
        "intro": "De industriële stijl combineert robuuste materialen met warmte. Stalen kozijnen, een betonlook-vloer en zichtbaar metselwerk krijgen karakter door houtaccenten en sfeervolle verlichting — krachtig zonder kil te worden.",
        "ruimtes": {
            "Woonkamer": "zwartstalen taatsdeuren, een betonlook-vloer en een leren bank met houten elementen.",
            "Keuken": "een mat-zwart keukenblok, open stellingen van staal en hout, en een stoer werkblad.",
            "Slaapkamer": "een bakstenen accentwand, warm hout en gedempte verlichting voor balans.",
        },
    },
    {
        "key": "modern-warm", "label": "Modern warm",
        "tagline": "Zacht, rond en sfeervol",
        "palette": ["#EFE7DC", "#D9B98C", "#B98A5E", "#2E261F"],
        "materialen": "zachte stoffen, gebogen meubels en messing accenten",
        "kleuren": "zachte neutralen, warm zand en subtiel messing",
        "sfeer": "knus en eigentijds met warme sfeerverlichting",
        "intro": "Modern warm verzacht het strakke moderne interieur met ronde vormen, warme neutralen en messing details. Het resultaat voelt eigentijds én uitnodigend — een woning die er gelikt uitziet maar waar je je meteen thuis voelt.",
        "ruimtes": {
            "Woonkamer": "een gebogen bank in een warme zandtint, messing verlichting en zachte texturen.",
            "Keuken": "warme greeploze fronten, een natuursteen-look blad en subtiele messing details.",
            "Slaapkamer": "een gestoffeerd hoofdbord, gelaagde verlichting en rustige neutrale tinten.",
        },
    },
    {
        "key": "klassiek", "label": "Klassiek",
        "tagline": "Tijdloos en verfijnd",
        "palette": ["#ECE4D6", "#C2B79C", "#6E6453", "#2B2823"],
        "materialen": "paneelwanden, verfijnd meubilair en edele stoffen",
        "kleuren": "warm crème, salie, taupe en gedempt goud",
        "sfeer": "elegant, symmetrisch en warm verlicht",
        "intro": "De klassieke stijl staat voor tijdloze elegantie: paneelwanden, verfijnde meubels en warme sfeerverlichting. Een interieur dat nooit gedateerd raakt en je woning een gevoel van blijvende kwaliteit geeft.",
        "ruimtes": {
            "Woonkamer": "paneelwanden, een statige bank en symmetrisch geplaatste verlichting.",
            "Keuken": "een keuken met kaderfronten, een klassiek werkblad en warme accenten.",
            "Slaapkamer": "rustige crèmetinten, verfijnde textiel en een tijdloze indeling.",
        },
    },
    {
        "key": "botanisch", "label": "Botanisch",
        "tagline": "Groen, fris en organisch",
        "palette": ["#E9E9DC", "#9FB089", "#5E7A4F", "#2C3327"],
        "materialen": "rotan en riet, veel planten en organische texturen",
        "kleuren": "frisse groenen, natuurlijk wit en warme natuurtinten",
        "sfeer": "fris en levendig met veel natuurlijk licht",
        "intro": "De botanische stijl brengt de natuur naar binnen: weelderige planten, rotan en riet en frisse groenen maken je woning levendig en ontspannen. Ideaal voor wie energie en buitengevoel in huis wil halen.",
        "ruimtes": {
            "Woonkamer": "een groene accentwand, rotan meubels en groepen planten bij het raam.",
            "Keuken": "frisse groene fronten, natuurlijke materialen en kruiden op het aanrecht.",
            "Slaapkamer": "zachte groenen, natuurlijk licht en rustgevende, organische texturen.",
        },
    },
]
STYLE_BY_KEY = {s["key"]: s for s in STYLES}

# ── Fase 2: ruimtes, woningtypes en gidsen ───────────────────────────────────
# Elk item: key, label, tagline, intro, punten[(titel,tekst)], tool_tie, qa[(v,a)],
# optioneel steps[(titel,tekst)] → HowTo-schema.
ROOMS = [
    {"key": "woonkamer", "label": "Woonkamer", "tagline": "Het hart van je huis",
     "intro": "De woonkamer is waar je het meeste tijd doorbrengt — vloer, licht en indeling bepalen samen de sfeer. Juist hier is vanaf een platte plattegrond moeilijk te voorzien hoe ruimte, looplijnen en lichtinval echt uitpakken.",
     "punten": [("Vloer & wandafwerking", "Een gietvloer oogt totaal anders dan eiken parket — visualiseer beide vóór je kiest."),
                ("Looplijnen & opstelling", "Zie of bank, eettafel en doorloop logisch samenkomen in jouw indeling."),
                ("Lichtinval", "Beoordeel hoe het daglicht door je raampartijen valt en de ruimte kleurt.")],
     "tool_tie": "Upload je plattegrond, kies een stijl en zie je woonkamer in 3D — ideaal om vloer, kleur en opstelling te testen vóór je bestelt of meerwerk aanvraagt.",
     "qa": [("Kan ik mijn eigen indeling zien?", "Ja — de impressie is gebaseerd op jouw geüploade plattegrond, dus je ziet jouw kamerverhoudingen, niet een standaardvoorbeeld."),
            ("Welke stijl past bij een woonkamer?", "Dat hangt af van je smaak. Scandinavisch en modern warm zijn populair voor de woonkamer; je kunt meerdere stijlen naast elkaar vergelijken.")]},
    {"key": "keuken", "label": "Keuken", "tagline": "Functie én sfeer",
     "intro": "De keuken is een van de duurste keuzes in je woning. Fronten, werkblad en indeling vastleggen op basis van een plattegrond is lastig — een 3D-impressie laat zien hoe materialen en kleuren samenkomen.",
     "punten": [("Fronten & werkblad", "Zie hoe matte fronten of een natuursteen-look uitpakken in jouw ruimte."),
                ("Indeling & kookeiland", "Beoordeel of een kookeiland of greeploze kast bij je looplijnen past."),
                ("Aansluiting op de woonkamer", "Bij een open keuken bepaalt de samenhang met de woonkamer de sfeer.")],
     "tool_tie": "Visualiseer je keuken in jouw stijl vóór je tekent bij de keukenleverancier — en koppel er direct kortingen aan bij Bylder-partnermerken.",
     "qa": [("Helpt dit bij een keukengesprek?", "Zeker. Een 3D-beeld maakt het makkelijker om met je keukenleverancier af te stemmen wat je voor ogen hebt."),
            ("Zijn de maten exact?", "Nee, een sfeerimpressie toont sfeer en materiaalrichting, geen exacte maatvoering. Voor maatwerk blijft de leverancierstekening leidend.")]},
    {"key": "slaapkamer", "label": "Slaapkamer", "tagline": "Rust en comfort",
     "intro": "Een slaapkamer draait om rust. Kleur, textiel en verlichting bepalen of een ruimte kalmeert — moeilijk in te schatten op een tekening, makkelijk te ervaren in 3D.",
     "punten": [("Kleur & sfeer", "Test gedempte tinten en warme verlichting vóór je verft."),
                ("Indeling & kastruimte", "Zie hoe bed, kasten en looppad samenkomen."),
                ("Lichtinval", "Beoordeel ochtend- en avondlicht voor de juiste sfeer.")],
     "tool_tie": "Zie je slaapkamer in jouw stijl en kies bewust kleur, textiel en verlichting — vóór je iets aanschaft.",
     "qa": [("Kan ik meerdere sferen vergelijken?", "Ja, met een lidmaatschap maak je tot tien impressies per maand en zet je rustige en warmere varianten naast elkaar."),
            ("Werkt dit ook voor een kleine slaapkamer?", "Ja — de impressie volgt jouw plattegrond, dus ook compacte ruimtes worden realistisch weergegeven.")]},
    {"key": "badkamer", "label": "Badkamer", "tagline": "Tegels, sanitair en sfeer",
     "intro": "Tegels, sanitair en verlichting maken of breken een badkamer — en zijn duur om achteraf te wijzigen. Een 3D-impressie laat de combinatie zien vóór je kiest.",
     "punten": [("Tegels & materialen", "Zie hoe wand- en vloertegels samen uitpakken."),
                ("Sanitair & indeling", "Beoordeel of douche, bad en meubel logisch passen."),
                ("Verlichting & sfeer", "Test warme versus heldere verlichting.")],
     "tool_tie": "Visualiseer je badkamer in jouw stijl en stem materialen af vóór je bestelt — met directe koppeling naar tegel- en sanitairpartners.",
     "qa": [("Kan ik tegelkleuren vergelijken?", "Je vergelijkt sferen en materiaalrichtingen tussen stijlen; voor exacte tegelkeuze blijf je bij stalen van de leverancier."),
            ("Is dit een vervanging voor een badkamerontwerp?", "Nee, het is een snelle verkenning. Voor een definitief ontwerp en maatvoering schakel je een specialist in.")]},
    {"key": "kinderkamer", "label": "Kinderkamer", "tagline": "Veilig, fris en flexibel",
     "intro": "Een kinderkamer verandert mee met de leeftijd. Een 3D-impressie helpt je een basis te kiezen die fris en flexibel is — en die je later makkelijk aanpast.",
     "punten": [("Kleur & sfeer", "Test frisse, rustige tinten die niet snel vervelen."),
                ("Indeling & opbergruimte", "Zie hoe bed, speelhoek en kasten samenkomen."),
                ("Meegroeien", "Kies een basis die met je kind meegroeit.")],
     "tool_tie": "Zie de kinderkamer in jouw stijl en kies een tijdloze basis vóór je inricht.",
     "qa": [("Kan ik thema's uitproberen?", "Je verkent sfeer en kleurrichting per stijl; specifieke thema's voeg je zelf toe bij de inrichting."),
            ("Werkt dit voor een babykamer én tienerkamer?", "Ja — de impressie toont de ruimte en sfeer, die je per levensfase anders inricht.")]},
    {"key": "thuiswerkplek", "label": "Thuiswerkplek", "tagline": "Geconcentreerd en comfortabel",
     "intro": "Een goede werkplek thuis vraagt om licht, rust en een doordachte indeling. Visualiseer hoe een kantoorhoek of aparte kamer in jouw woning uitpakt.",
     "punten": [("Licht & positie", "Zie waar daglicht het werk ondersteunt zonder schittering."),
                ("Indeling & focus", "Beoordeel of een aparte hoek of kamer beter werkt."),
                ("Sfeer & rust", "Kies een stijl die concentratie ondersteunt.")],
     "tool_tie": "Visualiseer je thuiswerkplek in jouw stijl en kies een indeling die comfortabel én productief is.",
     "qa": [("Kan ik een hoek in de woonkamer visualiseren?", "Ja, upload de plattegrond van de ruimte; de impressie laat zien hoe een werkhoek erin past."),
            ("Welke stijl werkt voor focus?", "Rustige stijlen als Japandi en Scandinavisch geven een opgeruimde, kalme werkomgeving.")]},
    {"key": "hal-entree", "label": "Hal & entree", "tagline": "De eerste indruk",
     "intro": "De hal zet de toon voor je hele woning, maar wordt vaak vergeten. Een 3D-impressie laat zien hoe vloer, licht en kleur de entree bepalen.",
     "punten": [("Vloer & doorloop", "Zie hoe de vloer doorloopt naar de woonkamer."),
                ("Licht", "Beoordeel verlichting in een vaak donkere ruimte."),
                ("Eerste indruk", "Kies een afwerking die meteen klopt.")],
     "tool_tie": "Visualiseer je hal in jouw stijl zodat de eerste indruk klopt vóór je afwerkt.",
     "qa": [("Telt de hal echt mee?", "Ja — de entree bepaalt de eerste indruk en de aansluiting op de rest van je woning."),
            ("Kan ik vloerdoorloop zien?", "De impressie toont de sfeer en materiaalrichting van de vloer in de hal en aangrenzende ruimtes.")]},
    {"key": "eetkamer", "label": "Eetkamer", "tagline": "Samenkomen aan tafel",
     "intro": "De eethoek is waar je samenkomt. Tafel, verlichting en de relatie met keuken en woonkamer bepalen de sfeer — goed te ervaren in 3D.",
     "punten": [("Tafel & opstelling", "Zie of je tafel en stoelen comfortabel passen."),
                ("Verlichting", "Beoordeel een hanglamp boven de tafel in jouw ruimte."),
                ("Samenhang", "Stem de eethoek af op keuken en woonkamer.")],
     "tool_tie": "Visualiseer je eethoek in jouw stijl en stem 'm af op de rest van je leefruimte.",
     "qa": [("Open of aparte eetkamer?", "Beide kun je visualiseren — upload de betreffende plattegrond en vergelijk de sfeer."),
            ("Past mijn tafel?", "De impressie geeft een goed ruimtelijk gevoel; voor exacte maten meet je na in je plattegrond.")]},
]

WONINGTYPES = [
    {"key": "nieuwbouw", "label": "Nieuwbouwwoning", "tagline": "Kies vóór de bouw klaar is",
     "intro": "Bij nieuwbouw maak je grote keuzes — vloeren, keuken, meerwerk — terwijl er nog niets staat. Je beslist op basis van een plattegrond en een verkoopbrochure. Een 3D-sfeerimpressie maakt die plattegrond tastbaar.",
     "punten": [("Meerwerk-keuzes", "Zie het effect van een keuze vóór de meerwerkdeadline."),
                ("Afwerking", "Test vloeren, kleuren en stijl op je eigen plattegrond."),
                ("Minder verrassingen", "Voorkom dat iets pas op de bouwplaats duidelijk wordt.")],
     "tool_tie": "Upload je verkooptekening of plattegrond, kies een stijl en zie je nieuwbouwwoning afgewerkt — precies wanneer je de keuzes maakt.",
     "qa": [("Heb ik al een definitieve tekening nodig?", "Nee, een verkoop- of conceptplattegrond volstaat om een sfeerimpressie te maken."),
            ("Helpt dit bij meerwerk?", "Ja — door opties te visualiseren kies je bewuster en voorkom je dure spijt achteraf.")]},
    {"key": "bestaande-bouw", "label": "Bestaande woning", "tagline": "Zie het potentieel",
     "intro": "Bij een bestaande woning wil je zien wat mogelijk is. Een 3D-impressie helpt je het potentieel van een ruimte te zien los van de huidige inrichting.",
     "punten": [("Potentieel zien", "Kijk voorbij de huidige afwerking naar wat kan."),
                ("Stijl verkennen", "Test welke stijl bij het huis past."),
                ("Plan maken", "Gebruik de beelden om je aanpak te bepalen.")],
     "tool_tie": "Upload de plattegrond van je bestaande woning en zie hoe ruimtes eruit kunnen zien in een nieuwe stijl.",
     "qa": [("Werkt dit met een oude plattegrond?", "Ja, zolang de plattegrond leesbaar is. Een recente tekening of nette schets werkt het best."),
            ("Kan ik voor/na vergelijken?", "Je maakt impressies in verschillende stijlen zodat je richtingen kunt vergelijken.")]},
    {"key": "renovatie", "label": "Renovatie & verbouwing", "tagline": "Zie het eindresultaat vooraf",
     "intro": "Bij een verbouwing investeer je fors zonder het eindresultaat te zien. Een 3D-impressie van je verbouwtekening laat zien waar je naartoe werkt.",
     "punten": [("Eindbeeld", "Zie het resultaat vóór de eerste muur valt."),
                ("Afstemmen met de aannemer", "Eén beeld communiceert sneller dan tien gesprekken."),
                ("Keuzes onderbouwen", "Kies materialen en stijl met vertrouwen.")],
     "tool_tie": "Upload je verbouwtekening, kies een stijl en zie het eindresultaat — handig om af te stemmen met je aannemer.",
     "qa": [("Kan ik mijn verbouwtekening gebruiken?", "Ja, upload de (verbouw)tekening of plattegrond van de nieuwe situatie."),
            ("Vervangt dit een architect?", "Nee, het is een verkenningstool. Voor het definitieve ontwerp en de uitvoering blijf je bij je architect of aannemer.")]},
    {"key": "appartement", "label": "Appartement", "tagline": "Slim met ruimte en licht",
     "intro": "In een appartement telt elke vierkante meter en is lichtinval bepalend. Een 3D-impressie helpt je ruimte en licht optimaal te benutten.",
     "punten": [("Ruimte benutten", "Zie hoe een compacte indeling ruim aanvoelt."),
                ("Licht", "Beoordeel daglicht bij vaak één raamzijde."),
                ("Stijl op maat", "Kies een stijl die ruimte ademt.")],
     "tool_tie": "Upload je appartementsplattegrond en zie hoe slim ruimtegebruik en de juiste stijl samenkomen.",
     "qa": [("Werkt dit voor kleine ruimtes?", "Juist dan is het waardevol — je ziet hoe een indeling en stijl een compacte ruimte ruim laten ogen."),
            ("Kan ik een open indeling visualiseren?", "Ja, zolang je plattegrond de open ruimte toont, geeft de impressie een goed beeld.")]},
    {"key": "tussenwoning", "label": "Tussenwoning", "tagline": "Maximale sfeer in een vertrouwd format",
     "intro": "De tussenwoning is het meest voorkomende huis van Nederland — vaak met een vergelijkbare indeling. Een 3D-impressie laat zien hoe je er met afwerking en stijl jouw thuis van maakt.",
     "punten": [("Standaardindeling, eigen sfeer", "Zie hoe stijl het verschil maakt."),
                ("Licht voor/achter", "Beoordeel de doorzon-lichtinval."),
                ("Tuingerichte ruimtes", "Stem de woonkamer af op het zicht naar buiten.")],
     "tool_tie": "Upload je plattegrond en zie hoe je tussenwoning met de juiste stijl en afwerking persoonlijk wordt.",
     "qa": [("Mijn buren hebben dezelfde indeling — heeft dit zin?", "Juist daarom: afwerking en stijl maken het verschil, en die visualiseer je hier."),
            ("Werkt het voor een doorzonwoning?", "Ja, de impressie laat de lichtdoorval en sfeer van voor naar achter goed zien.")]},
    {"key": "vrijstaand", "label": "Vrijstaande woning", "tagline": "Ruimte om te ontwerpen",
     "intro": "Een vrijstaande woning geeft vrijheid in indeling en stijl. Een 3D-impressie helpt je die vrijheid te benutten zonder de samenhang te verliezen.",
     "punten": [("Samenhang", "Houd één stijllijn door de hele woning."),
                ("Ruime indeling", "Zie hoe grote ruimtes gevuld en warm aanvoelen."),
                ("Licht van alle kanten", "Benut daglicht uit meerdere richtingen.")],
     "tool_tie": "Upload je plattegrond en zie hoe je vrijstaande woning als geheel samenkomt in jouw stijl.",
     "qa": [("Kan ik meerdere ruimtes op elkaar afstemmen?", "Ja, maak per ruimte een impressie in dezelfde stijl voor een samenhangend geheel."),
            ("Werkt dit voor een groot huis?", "Ja — visualiseer per ruimte; samen geven ze een beeld van het geheel.")]},
]

GIDSEN = [
    {"key": "plattegrond-naar-3d", "label": "Plattegrond naar 3D", "tagline": "Hoe werkt het?",
     "intro": "Een plattegrond is een platte, top-down tekening. Hem omzetten naar een 3D-beeld maakt in één oogopslag duidelijk hoe een ruimte aanvoelt. Zo werkt het bij Bylder.",
     "punten": [("Upload", "Je plattegrond of bouwtekening als PDF of foto."),
                ("Stijl", "Kies uit zes interieurstijlen."),
                ("Resultaat", "Binnen enkele minuten een 3D-sfeerimpressie van je ruimte.")],
     "steps": [("Upload je plattegrond", "Zet je bouwtekening of plattegrond (PDF of afbeelding) in je Bylder-dashboard."),
               ("Kies een stijl", "Selecteer een van de zes interieurstijlen."),
               ("Genereer", "De AI maakt binnen enkele minuten een 3D-sfeerimpressie."),
               ("Vergelijk", "Zet stijlen naast elkaar en kies bewust.")],
     "tool_tie": "Plattegrond naar 3D doe je in je Bylder-dashboard — gratis account, lidmaatschap ontgrendelt de impressies.",
     "qa": [("Welk bestand heb ik nodig?", "Een PDF of duidelijke foto van je plattegrond of bouwtekening."),
            ("Hoe lang duurt het?", "Doorgaans enkele minuten per impressie.")]},
    {"key": "bouwtekening-lezen", "label": "Bouwtekening lezen", "tagline": "Begrijp je tekening",
     "intro": "Een bouwtekening zit vol symbolen en maatlijnen. Begrijpen wat je ziet helpt je betere keuzes maken — en een 3D-impressie maakt het pas echt tastbaar.",
     "punten": [("Symbolen", "Deuren, ramen, leidingen en meubels hebben vaste symbolen."),
                ("Maatvoering", "Maatlijnen geven afmetingen in millimeters of centimeters."),
                ("Schaal", "Let op de schaal (bv. 1:100) om verhoudingen te begrijpen.")],
     "tool_tie": "Snap je je tekening, maar mis je het gevoel? Zet 'm om in een 3D-sfeerimpressie en zie hoe het wordt.",
     "qa": [("Wat betekent 1:100?", "Eén centimeter op de tekening is honderd centimeter in werkelijkheid."),
            ("Heb ik tekenervaring nodig voor de tool?", "Nee — je uploadt de tekening en de AI doet de rest.")]},
    {"key": "2d-naar-3d-plattegrond", "label": "Van 2D naar 3D", "tagline": "Het verschil en de winst",
     "intro": "Een 2D-plattegrond toont de indeling van bovenaf; een 3D-weergave laat hoogte, materiaal en sfeer zien. Voor het kiezen van afwerking en inrichting is dat verschil groot.",
     "punten": [("2D = indeling", "Goed voor maten en looplijnen."),
                ("3D = beleving", "Laat zien hoe een ruimte echt aanvoelt."),
                ("Samen sterk", "Gebruik 2D voor maten, 3D voor keuzes.")],
     "tool_tie": "Bylder zet je 2D-plattegrond om naar een 3D-sfeerimpressie, zodat je niet alleen de maten maar ook de sfeer ziet.",
     "qa": [("Vervangt 3D mijn plattegrond?", "Nee, ze vullen elkaar aan: 2D voor maatvoering, 3D voor beleving en keuzes."),
            ("Is een 3D-impressie maatvast?", "Nee, het toont sfeer en materiaalrichting, geen exacte maten.")]},
    {"key": "interieur-visualiseren-ai", "label": "Interieur visualiseren met AI", "tagline": "Wat kan het wel en niet",
     "intro": "AI maakt interieurvisualisatie toegankelijk: in minuten zie je richtingen die vroeger dagen werk kostten. Belangrijk is te weten waar de kracht én de grens ligt.",
     "punten": [("Snel verkennen", "Vergelijk in minuten meerdere stijlen."),
                ("Inspiratie + richting", "Ontdek wat bij je past vóór je kiest."),
                ("Geen exact ontwerp", "Voor maatwerk blijf je bij een professional.")],
     "tool_tie": "Bylder's AI-visualisatie maakt een 3D-sfeerimpressie van jóuw plattegrond — sneller en goedkoper dan een handmatige render.",
     "qa": [("Is AI-visualisatie betrouwbaar?", "Voor sfeer en richting heel bruikbaar; voor exacte maatvoering en techniek niet bedoeld."),
            ("Vervangt AI een interieurontwerper?", "Nee — het is een snelle verkenning. Een ontwerper voegt maatwerk en advies toe.")]},
    {"key": "wat-kost-3d-impressie", "label": "Wat kost een 3D-impressie?", "tagline": "Prijzen en wat je krijgt",
     "intro": "Een professionele 3D-render laten maken kost al snel honderden euro's per beeld. Met Bylder zit het in je lidmaatschap, waarmee je tot tien impressies per maand maakt.",
     "punten": [("Losse render (markt)", "Vaak €150–€500+ per beeld bij een bureau."),
                ("Bylder-lidmaatschap", "Eenmalig €99, tot 10 impressies per maand."),
                ("Extra waarde", "Plus kortingen bij 60+ woonmerken.")],
     "tool_tie": "Voor de prijs van één marktrender maak je bij Bylder maandenlang impressies én bespaar je op je inrichting.",
     "qa": [("Zijn er kosten per impressie?", "Nee, binnen je lidmaatschap maak je tot tien impressies per maand zonder bijbetaling."),
            ("Is uploaden gratis?", "Ja, een account aanmaken en je plattegrond uploaden is gratis.")]},
    {"key": "3d-impressie-vs-render-maquette", "label": "3D-impressie vs. render vs. maquette", "tagline": "Welke kies je wanneer",
     "intro": "Sfeerimpressie, fotorealistische render en maquette dienen elk een doel. Voor snel kiezen tijdens je woontraject is een sfeerimpressie meestal de slimste eerste stap.",
     "punten": [("Sfeerimpressie", "Snel, goedkoop, ideaal om te verkennen en kiezen."),
                ("Fotorealistische render", "Duur en traag, voor een definitieve presentatie."),
                ("Maquette", "Fysiek model, vooral voor architectuur en massa.")],
     "tool_tie": "Begin met een Bylder-sfeerimpressie om snel te kiezen; een dure render bewaar je voor het allerlaatste ontwerp.",
     "qa": [("Wanneer is een sfeerimpressie genoeg?", "Voor het kiezen van stijl, kleur en afwerking tijdens je woontraject is een sfeerimpressie ideaal."),
            ("Wanneer heb ik een echte render nodig?", "Pas als alles vaststaat en je een fotorealistische eindpresentatie wilt.")]},
    {"key": "sfeerimpressie-maken", "label": "Sfeerimpressie maken", "tagline": "Stappenplan",
     "intro": "Een sfeerimpressie maken van je eigen woning is eenvoudiger dan je denkt. In vier stappen zie je je ruimte in de stijl die je voor ogen hebt.",
     "punten": [("Verzamel je plattegrond", "PDF of foto van je bouwtekening."),
                ("Kies een stijl", "Bepaal de richting die bij je past."),
                ("Genereer & vergelijk", "Maak meerdere varianten en kies.")],
     "steps": [("Maak een gratis account", "Registreer bij Bylder."),
               ("Upload je plattegrond", "PDF of foto in je dashboard."),
               ("Kies een stijl", "Een van de zes interieurstijlen."),
               ("Genereer je impressie", "Binnen enkele minuten klaar.")],
     "tool_tie": "Volg deze stappen in je Bylder-dashboard en maak je eerste 3D-sfeerimpressie.",
     "qa": [("Heb ik ontwerpkennis nodig?", "Nee, je kiest alleen een stijl; de AI doet de rest."),
            ("Kan ik later van stijl wisselen?", "Ja, met je lidmaatschap maak je meerdere impressies in verschillende stijlen.")]},
]

CATS = {
    "ruimte": {"items": ROOMS, "noun": "ruimte", "badge_pre": "Ruimte", "seclabel": "Per ruimte"},
    "woningtype": {"items": WONINGTYPES, "noun": "woningtype", "badge_pre": "Woningtype", "seclabel": "Per woningtype"},
    "gids": {"items": GIDSEN, "noun": "gids", "badge_pre": "Gids", "seclabel": "Gidsen"},
}

# ── Chrome ───────────────────────────────────────────────────────────────────
def head(title, desc, canonical, schema_blocks):
    schema = "\n".join(
        f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>'
        for b in schema_blocks
    )
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
<meta property="og:type" content="website">
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
.container{{max-width:1280px;margin:0 auto;padding:0 48px;}}
.badge{{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}}
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}}
.grid-2{{display:grid;grid-template-columns:1fr 1fr;gap:16px;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:10px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:20px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.swatches{{display:flex;gap:0;border-radius:10px;overflow:hidden;height:64px;margin-bottom:16px;border:1px solid rgba(61,46,30,0.1);}}
.swatches span{{flex:1;}}
.style-tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:18px;transition:border-color .15s;}}
.style-tile:hover{{border-color:rgba(61,90,62,0.4);}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-2,.grid-3{{grid-template-columns:1fr;}}.hero-grid{{grid-template-columns:1fr!important;gap:32px!important;}}aside{{position:static!important;}}}}
{NAV_CSS}
</style>
</head>
<body>{NAV_HTML}"""

FOOTER = """<footer style="background:#1A1208;padding:64px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:flex;flex-wrap:wrap;gap:48px;justify-content:space-between;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <div style="width:32px;height:32px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:13px;">B.</div>
        <span style="font-weight:700;font-size:17px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
      </div>
      <p style="font-size:13px;color:rgba(245,240,232,0.4);max-width:240px;line-height:1.6;">AI-gestuurd platform voor kopers van een nieuwbouw- of verbouwwoning.</p>
    </div>
    <div>
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.25);margin-bottom:16px;">3D-sfeerimpressie</p>
      <div style="display:flex;flex-direction:column;gap:8px;">__FOOTER_LINKS__</div>
    </div>
  </div>
  <div style="max-width:1280px;margin:32px auto 0;padding:24px 48px 0;border-top:1px solid rgba(245,240,232,0.08);">
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer><script src="/auping-popup.js"></script>
</body></html>"""

def footer():
    links = "".join(
        f'<a href="{HUB}/{s["key"]}/" style="font-size:14px;color:rgba(245,240,232,0.45);text-decoration:none;">{s["label"]}</a>'
        for s in STYLES
    )
    links = f'<a href="{HUB}/" style="font-size:14px;color:rgba(245,240,232,0.45);text-decoration:none;">Overzicht</a>' + links
    return FOOTER.replace("__FOOTER_LINKS__", links)

def swatches(palette):
    return '<div class="swatches" aria-hidden="true">' + "".join(f'<span style="background:{c};"></span>' for c in palette) + "</div>"

def cta_block():
    return f"""<div style="background:#3D5A3E;border-radius:20px;padding:48px;text-align:center;margin:48px 0;">
  <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">Gratis account · €99 ontgrendelt de tool</p>
  <h2 style="font-size:1.8rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Zie je nieuwe woning vóór je een euro uitgeeft</h2>
  <p style="color:rgba(245,240,232,0.7);margin-bottom:28px;max-width:520px;margin-left:auto;margin-right:auto;font-size:15px;">Maak gratis een account aan en upload je plattegrond. Met Bylder-lidmaatschap (eenmalig €99) genereer je tot {10} 3D-sfeerimpressies per maand in elke stijl — en activeer je kortingen bij 60+ woonmerken.</p>
  <a href="{SIGNUP}" class="cta-primary">Start gratis →</a>
</div>"""

def faq_schema(qa):
    return {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in qa
        ],
    }

def breadcrumb(items):
    return {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
            for i, (n, u) in enumerate(items)
        ],
    }

def faq_html(qa):
    items = "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{html.escape(a)}</p></div>' for q, a in qa)
    return f'<h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Veelgestelde vragen</h2>{items}'

# ── Hub ──────────────────────────────────────────────────────────────────────
def build_hub():
    title = "3D-sfeerimpressie maken van je plattegrond | Bylder.com"
    desc = "Upload je plattegrond en zie je nieuwe woning in 3D, in 6 interieurstijlen. Zo kies je vol vertrouwen je afwerking en inrichting — vóór je duizenden euro's uitgeeft."
    canonical = f"{BASE}{HUB}/"

    howto = {
        "@context": "https://schema.org", "@type": "HowTo",
        "name": "Een 3D-sfeerimpressie van je plattegrond maken",
        "step": [
            {"@type": "HowToStep", "name": "Upload je plattegrond", "text": "Upload je bouwtekening of plattegrond (PDF of afbeelding) in je Bylder-dashboard."},
            {"@type": "HowToStep", "name": "Kies een stijl", "text": "Kies uit zes interieurstijlen: Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch."},
            {"@type": "HowToStep", "name": "Genereer de impressie", "text": "Bylder's AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte in de gekozen stijl."},
            {"@type": "HowToStep", "name": "Vergelijk en beslis", "text": "Vergelijk stijlen, deel ze en gebruik ze om je afwerking, inrichting en meerwerk te kiezen."},
        ],
    }
    software = {
        "@context": "https://schema.org", "@type": "SoftwareApplication",
        "name": "Bylder 3D-sfeerimpressie", "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "offers": {"@type": "Offer", "price": "99", "priceCurrency": "EUR", "description": "Eenmalig Bylder-lidmaatschap"},
        "description": desc,
    }
    qa = [
        ("Wat is een 3D-sfeerimpressie?", "Een 3D-sfeerimpressie is een realistische weergave van hoe een ruimte eruit kan zien, gegenereerd uit je plattegrond. Het laat materialen, kleuren en sfeer zien, zodat je je nieuwe woning kunt ervaren vóór de afwerking en inrichting vaststaan."),
        ("Hoe maakt Bylder de impressie?", "Je uploadt je plattegrond of bouwtekening in je Bylder-dashboard en kiest een van de zes interieurstijlen. De AI genereert binnen enkele minuten een sfeerimpressie van je ruimte in die stijl."),
        ("Is het gratis?", "Een account aanmaken en je plattegrond uploaden is gratis. Het genereren van 3D-sfeerimpressies zit in het Bylder-lidmaatschap (eenmalig €99), waarmee je tot tien impressies per maand maakt en kortingen bij 60+ woonmerken activeert."),
        ("Vervangt dit een interieurontwerper of bouwtekening?", "Nee. Een sfeerimpressie is bedoeld om snel te verkennen, keuzes te maken en te communiceren. Voor een definitief ontwerp of een bouwvergunning blijven een interieurontwerper en gecertificeerde tekeningen nodig."),
        ("Voor welke woningen werkt het?", "Voor nieuwbouw, bestaande bouw én renovatie. De tool is woningtype-bewust, zodat de impressie aansluit op jouw situatie."),
    ]
    schema = [howto, software, faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("3D-sfeerimpressie", canonical)])]

    tiles = "".join(f"""<a href="{HUB}/{s['key']}/" class="style-tile">
      {swatches(s['palette'])}
      <div style="font-weight:700;font-size:16px;color:#1A1208;margin-bottom:2px;">{s['label']}</div>
      <div style="font-size:13px;color:rgba(61,46,30,0.55);">{s['tagline']}</div>
    </a>""" for s in STYLES)

    body = f"""<main style="padding:64px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:64px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <span style="color:rgba(61,46,30,0.6);">3D-sfeerimpressie</span></p>
        <div class="badge">AI-visualisatie</div>
        <h1 style="font-size:2.6rem;font-weight:800;margin-bottom:8px;line-height:1.15;">3D-sfeerimpressie van je plattegrond</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);margin-bottom:8px;font-style:italic;">Zie hoe je nieuwe woning wordt — vóór je kiest, koopt en afwerkt</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:16px;line-height:1.8;">Een nieuwbouw- of verbouwwoning koop je op basis van een plattegrond — een platte tekening waarop moeilijk te zien is hoe het écht wordt. Toch maak je juist dán keuzes van tienduizenden euro's: vloeren, keuken, kleuren, inrichting. Bylder zet je plattegrond om in een realistische <strong>3D-sfeerimpressie</strong>, zodat je je woning kunt ervaren en met vertrouwen beslist.</p>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:8px;line-height:1.8;">Je kiest uit zes interieurstijlen en ziet binnen enkele minuten hoe je ruimte eruit kan zien. Vergelijk stijlen naast elkaar, ontdek wat bij je past en gebruik de beelden om af te stemmen met je partner, aannemer of leverancier.</p>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Kies je stijl</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.65);margin-bottom:18px;">Elke stijl heeft een eigen materiaal- en kleurenpalet. Bekijk per stijl hoe je woonkamer, keuken en slaapkamer eruit kunnen zien.</p>
        <div class="grid-3" style="margin-bottom:8px;">{tiles}</div>

        {cards_section("Per ruimte", ROOMS)}
        {cards_section("Per woningtype", WONINGTYPES)}
        {cards_section("Gidsen & uitleg", GIDSEN)}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Zo werkt het — in 4 stappen</h2>
        <ol style="list-style:decimal;padding-left:24px;display:flex;flex-direction:column;gap:12px;font-size:15px;">
          <li><strong>Upload je plattegrond.</strong> Een bouwtekening of plattegrond als PDF of foto, direct in je Bylder-dashboard.</li>
          <li><strong>Kies een stijl.</strong> Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch.</li>
          <li><strong>Genereer de impressie.</strong> De AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte.</li>
          <li><strong>Vergelijk en beslis.</strong> Zet stijlen naast elkaar en gebruik ze voor je afwerking, inrichting en meerwerkkeuzes.</li>
        </ol>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Wat je ermee wint</h2>
        <ul class="check-list">
          <li><strong>Betere keuzes.</strong> Zie het effect van een vloer, kleur of stijl vóórdat je tekent bij de leverancier.</li>
          <li><strong>Minder spijt en meerwerk.</strong> Twijfel je tussen opties? Visualiseer beide en kies bewust.</li>
          <li><strong>Makkelijker afstemmen.</strong> Eén beeld zegt meer dan tien gesprekken met je partner of aannemer.</li>
          <li><strong>Direct gekoppeld aan voordeel.</strong> Vanuit je impressie activeer je kortingen bij 60+ woonmerken.</li>
        </ul>

        <div class="highlight"><strong>Voor nieuwbouw, bestaande bouw én renovatie.</strong> De tool is woningtype-bewust: of je nu een nieuwbouwwoning afwerkt of een bestaande woning verbouwt, de impressie sluit aan op jouw situatie.</div>

        {cta_block()}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Eerlijk over wat het wél en niet is</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.7);line-height:1.8;margin-bottom:8px;">Een 3D-sfeerimpressie is een <em>verkenningstool</em>: hij laat sfeer, materialen en kleurrichting zien en helpt je sneller en bewuster kiezen. Het is geen exacte maatvoering en vervangt geen interieurontwerper of gecertificeerde bouwtekening. Voor een definitief ontwerp of een vergunning blijf je bij een professional. De kracht zit in het verkennen: in minuten zie je richtingen die anders pas op de bouwplaats duidelijk worden.</p>

        {faq_html(qa)}

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder lezen: <a href="/ai-plattegrond-maken-3d/">plattegrond maken (2D naar 3D)</a> · <a href="/nieuwbouw-tools/">gratis nieuwbouw-tools</a> · <a href="/functies/">alle functies van Bylder</a></p>
      </article>

      <aside style="position:sticky;top:100px;">
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Probeer de tool</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Maak gratis een account en upload je plattegrond. Met lidmaatschap genereer je tot 10 impressies per maand.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
        </div>
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:12px;">De 6 stijlen</p>
          <div style="display:flex;flex-direction:column;gap:8px;">{"".join(f'<a href="{HUB}/{s["key"]}/" style="font-size:13px;color:#3D5A3E;text-decoration:none;">{s["label"]} — {s["tagline"].lower()}</a>' for s in STYLES)}</div>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">10% korting bij 60+ merken</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Auping, Goossens en meer — gekoppeld aan je woning.</p>
          <a href="/#vouchers" style="display:block;text-align:center;background:#F5F0E8;color:#3D5A3E;border:1.5px solid rgba(61,90,62,0.3);padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Vouchers bekijken →</a>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Spoke per stijl ──────────────────────────────────────────────────────────
def build_style(s):
    others = [o for o in STYLES if o["key"] != s["key"]]
    title = f"{s['label']} interieur — 3D-sfeerimpressie van je woning | Bylder.com"
    desc = f"Zie je nieuwe woning in {s['label'].lower()}e stijl: {s['materialen']}. Upload je plattegrond en maak met Bylder een 3D-sfeerimpressie in deze stijl."
    canonical = f"{BASE}{HUB}/{s['key']}/"

    qa = [
        (f"Wat kenmerkt een {s['label'].lower()} interieur?", f"Een {s['label'].lower()} interieur draait om {s['materialen']}, met {s['kleuren']}. De sfeer is {s['sfeer']}."),
        (f"Hoe zie ik mijn woning in {s['label'].lower()}e stijl?", f"Upload je plattegrond in je Bylder-dashboard en kies de stijl {s['label']}. De AI genereert binnen enkele minuten een 3D-sfeerimpressie van je ruimte in deze stijl."),
        ("Kan ik stijlen vergelijken?", "Ja. Met een Bylder-lidmaatschap maak je tot tien impressies per maand, zodat je meerdere stijlen naast elkaar kunt zetten en bewust kunt kiezen."),
    ]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("3D-sfeerimpressie", f"{BASE}{HUB}/"), (s["label"], canonical)]),
        {"@context": "https://schema.org", "@type": "Article", "headline": f"{s['label']} interieur — 3D-sfeerimpressie", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}},
    ]

    ruimtes = "".join(f"""<div class="card" style="margin-bottom:12px;">
      <div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:4px;">{r}</div>
      <p style="font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;">{html.escape(txt)}</p>
    </div>""" for r, txt in s["ruimtes"].items())

    other_tiles = "".join(f"""<a href="{HUB}/{o['key']}/" class="style-tile">
      {swatches(o['palette'])}
      <div style="font-weight:700;font-size:15px;color:#1A1208;">{o['label']}</div>
      <div style="font-size:12px;color:rgba(61,46,30,0.55);">{o['tagline']}</div>
    </a>""" for o in others)

    body = f"""<main style="padding:64px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:64px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">3D-sfeerimpressie</a> → <span style="color:rgba(61,46,30,0.6);">{s['label']}</span></p>
        <div class="badge">{s['label']} · {s['tagline']}</div>
        <h1 style="font-size:2.4rem;font-weight:800;margin-bottom:8px;line-height:1.15;">{s['label']} interieur in 3D</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);margin-bottom:8px;font-style:italic;">{s['tagline']} — zie je woning in deze stijl vóór je kiest</p>
        {swatches(s['palette'])}
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:16px;line-height:1.8;">{html.escape(s['intro'])}</p>
        <div class="highlight"><strong>Kenmerkend:</strong> {s['materialen']}, met {s['kleuren']}. De sfeer is {s['sfeer']}.</div>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">{s['label']} per ruimte</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.65);margin-bottom:18px;">Zo kan {s['label'].lower()} uitpakken in de belangrijkste ruimtes van je woning:</p>
        {ruimtes}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Zie het op jouw plattegrond</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.7);line-height:1.8;">Inspiratiebeelden zijn mooi, maar jouw woning heeft jouw indeling. Upload je plattegrond in Bylder, kies <strong>{s['label']}</strong> en de AI maakt een 3D-sfeerimpressie van jóuw ruimtes in deze stijl — zodat je ziet of het bij je huis en je leven past.</p>

        {cta_block()}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Andere stijlen</h2>
        <div class="grid-3">{other_tiles}</div>

        {faq_html(qa)}

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">overzicht 3D-sfeerimpressie</a> · <a href="/nieuwbouw-tools/">gratis nieuwbouw-tools</a></p>
      </article>

      <aside style="position:sticky;top:100px;">
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Maak je impressie in {s['label']}</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Gratis account, upload je plattegrond, kies deze stijl.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:12px;">Alle stijlen</p>
          <div style="display:flex;flex-direction:column;gap:8px;">{"".join(f'<a href="{HUB}/{o["key"]}/" style="font-size:13px;color:#3D5A3E;text-decoration:none;">{o["label"]}</a>' for o in STYLES)}</div>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Content-pagina (ruimte / woningtype / gids) ──────────────────────────────
def build_content(item, cat):
    meta = CATS[cat]
    label = item["label"]
    title = f"{label} in 3D zien — sfeerimpressie van je woning | Bylder.com" if cat != "gids" else f"{label} — {item['tagline']} | Bylder.com"
    desc = item["intro"][:155]
    canonical = f"{BASE}{HUB}/{item['key']}/"

    qa = item["qa"]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), ("3D-sfeerimpressie", f"{BASE}{HUB}/"), (label, canonical)]),
    ]
    if item.get("steps"):
        schema.append({
            "@context": "https://schema.org", "@type": "HowTo", "name": f"{label}",
            "step": [{"@type": "HowToStep", "name": n, "text": t} for n, t in item["steps"]],
        })
    else:
        schema.append({"@context": "https://schema.org", "@type": "Article", "headline": label, "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}})

    punten = "".join(f'<li><strong>{html.escape(t)}.</strong> {html.escape(x)}</li>' for t, x in item["punten"])
    steps_html = ""
    if item.get("steps"):
        steps_html = '<h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Stap voor stap</h2><ol style="list-style:decimal;padding-left:24px;display:flex;flex-direction:column;gap:12px;font-size:15px;">' + "".join(f'<li><strong>{html.escape(n)}.</strong> {html.escape(t)}</li>' for n, t in item["steps"]) + "</ol>"

    # Gerelateerde pagina's in dezelfde categorie
    siblings = [o for o in meta["items"] if o["key"] != item["key"]][:6]
    sib_tiles = "".join(f'<a href="{HUB}/{o["key"]}/" class="style-tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{o["label"]}</div><div style="font-size:12px;color:rgba(61,46,30,0.55);">{o["tagline"]}</div></a>' for o in siblings)
    style_links = "".join(f'<a href="{HUB}/{s["key"]}/" style="font-size:13px;color:#3D5A3E;text-decoration:none;">{s["label"]}</a>' for s in STYLES)

    body = f"""<main style="padding:64px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:64px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:32px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">3D-sfeerimpressie</a> → <span style="color:rgba(61,46,30,0.6);">{label}</span></p>
        <div class="badge">{meta['badge_pre']} · {item['tagline']}</div>
        <h1 style="font-size:2.4rem;font-weight:800;margin-bottom:8px;line-height:1.15;">{label}{' in 3D' if cat != 'gids' else ''}</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);margin-bottom:8px;font-style:italic;">{item['tagline']}</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.7);margin-bottom:16px;line-height:1.8;">{html.escape(item['intro'])}</p>

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">Waar het op aankomt</h2>
        <ul class="check-list">{punten}</ul>

        {steps_html}

        <div class="highlight">{html.escape(item['tool_tie'])}</div>

        {cta_block()}

        <h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">{meta['seclabel']} — meer bekijken</h2>
        <div class="grid-3">{sib_tiles}</div>

        {faq_html(qa)}

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">overzicht 3D-sfeerimpressie</a> · ook per stijl: {" · ".join(f'<a href="{HUB}/{s["key"]}/">{s["label"]}</a>' for s in STYLES[:3])}</p>
      </article>

      <aside style="position:sticky;top:100px;">
        <div class="card" style="margin-bottom:20px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Maak je 3D-sfeerimpressie</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:16px;line-height:1.6;">Gratis account, upload je plattegrond, kies een stijl.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis →</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:12px;">Stijlen</p>
          <div style="display:flex;flex-direction:column;gap:8px;">{style_links}</div>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

def cards_section(seclabel, items):
    tiles = "".join(f"""<a href="{HUB}/{i['key']}/" class="style-tile">
      <div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:2px;">{i['label']}</div>
      <div style="font-size:13px;color:rgba(61,46,30,0.55);">{i['tagline']}</div>
    </a>""" for i in items)
    return f'<h2 style="font-size:1.4rem;font-weight:700;margin:40px 0 14px;">{seclabel}</h2><div class="grid-3">{tiles}</div>'

# ── Sitemap ──────────────────────────────────────────────────────────────────
def build_sitemap():
    urls = [f"{BASE}{HUB}/"]
    urls += [f"{BASE}{HUB}/{s['key']}/" for s in STYLES]
    for cat in CATS.values():
        urls += [f"{BASE}{HUB}/{i['key']}/" for i in cat["items"]]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓", path)

if __name__ == "__main__":
    print("3D-sfeerimpressie content-hub genereren…")
    write("3d-sfeerimpressie/index.html", build_hub())
    for s in STYLES:
        write(f"3d-sfeerimpressie/{s['key']}/index.html", build_style(s))
    n = 0
    for cat_key, cat in CATS.items():
        for item in cat["items"]:
            write(f"3d-sfeerimpressie/{item['key']}/index.html", build_content(item, cat_key))
            n += 1
    write("3d-sfeerimpressie-sitemap.xml", build_sitemap())
    total = 1 + len(STYLES) + n
    print(f"Klaar: 1 hub + {len(STYLES)} stijlen + {n} content-pagina's = {total} pagina's + sitemap.")
