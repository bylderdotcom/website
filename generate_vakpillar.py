#!/usr/bin/env python3
"""
Generieke vakbedrijven-generator: pillar /[vak]/ + stad-pagina's /[vak]/[stad]/
+ per-vak sitemap, voor élk vak in VAKKEN. Plus de gedeelde /voor-vakbedrijven/.
Data-gedreven → een nieuw vak = een config-entry (geen nieuwe code).

Volledig SEO/GEO/AEO/schema/CRO geoptimaliseerd. Prijzen INDICATIEF (NL 2026).
Gebruik: python3 generate_vakpillar.py            (alle vakken in VAKKEN)
         python3 generate_vakpillar.py schilder   (één vak)
"""
import os, html, json, re, unicodedata, sys, urllib.parse

BASE = "https://www.bylder.com"
SIGNUP = "https://app.bylder.com/registreer"
VOORDELEN = "/voor-vakbedrijven"
INTAKE = "mailto:info@bylder.com?subject=Mijn%20bedrijf%20aanmelden%20op%20Bylder&body=Bedrijfsnaam%3A%0APlaats%3A%0AGoogle-%2FWerkspot-%2Fwebsite-link%3A%0A"
OFFERTE_HUB = "/offerte-check"
ROOT = os.path.dirname(os.path.abspath(__file__))
MIN_PER_STAD = 3

def euro(n): return "€" + format(n, ",d").replace(",", ".")

# Het '{vak}sbedrijven'-woord; configureerbaar voor vakken waar dat niet natuurlijk loopt
# (bv. badkamer → 'badkamerbedrijven' i.p.v. 'badkamerspecialistsbedrijven').
def bedrijf_plur(vak): return vak.get("bedrijf_plur") or f'{vak["sing"]}sbedrijven'
def bedrijf_sing(vak): return vak.get("bedrijf_sing") or f'{vak["sing"]}sbedrijf'

# ───────────────────────── VAK-CONFIGS ─────────────────────────
VAKKEN = {
    "stukadoor": {
        "sing": "stukadoor", "plur": "stukadoors", "werk": "stucwerk", "branche": "afbouwsector",
        "ep_link": "/eerlijke-prijzen/stucwerk/",
        "pillar_h1": "Een stukadoor met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Stucwerk is een van de posten waar offertes het sterkst uiteenlopen. Bylder laat je zien wat een eerlijke prijs per m&sup2; is, controleert je offerte per post, en toont stukadoors <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je stucwerk-offerte gratis",
        "prijs_band": "Marktprijs stucwerk (2026): spuitwerk &euro;8&ndash;&euro;14/m&sup2;, behangklaar &euro;14&ndash;&euro;22/m&sup2;, glad sausklaar &euro;18&ndash;&euro;38/m&sup2;.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;8&ndash;&euro;14/m&sup2; voor spuitwerk, &euro;14&ndash;&euro;22/m&sup2; voor behangklaar en &euro;18&ndash;&euro;38/m&sup2; voor glad sausklaar. De prijs hangt af van de ondergrond, het afwerkniveau en het oppervlak.",
        "werksoorten": [
            {"naam": "Spuitwerk / spackspuiten (plafond & wand)", "low": 8, "high": 14, "uitleg": "Machinaal spuitpleister op plafonds en wanden — de snelste en goedkoopste afwerking, sausklaar."},
            {"naam": "Wanden behangklaar pleisteren", "low": 14, "high": 22, "uitleg": "Wanden vlak en strak voor behang; iets minder voorwerk dan sausklaar glad."},
            {"naam": "Wanden glad pleisteren (sausklaar)", "low": 18, "high": 38, "uitleg": "Glad pleisterwerk dat direct schilderbaar is — meer handwerk, hoogste kwaliteit binnenwerk."},
            {"naam": "Sierpleister / decoratief (kalk, betonlook, Marokkaans)", "low": 40, "high": 95, "uitleg": "Ambachtelijk decoratief pleisterwerk; sterk afhankelijk van techniek en materiaal."},
            {"naam": "Buitenstucwerk / gevelpleister", "low": 45, "high": 90, "uitleg": "Gevelafwerking; in combinatie met gevelisolatie (na-isolatie) loopt de prijs verder op."},
        ],
        "factoren": [
            "Werksoort en afwerkniveau — spuitwerk is goedkoper dan glad sausklaar handwerk.",
            "Staat van de ondergrond — voorstrijken, uitvlakken en herstel kosten extra arbeid.",
            "Oppervlak en bereikbaarheid — grotere vlakken hebben een lagere prijs per m²; hoge plafonds en trapgaten juist hoger.",
            "Regio en drukte — in de Randstad en bij lange wachttijden liggen de tarieven doorgaans hoger.",
            "Materiaalkeuze — duurzame kalk- en leempleisters of speciale sierpleisters zijn duurder dan standaard gips.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "De afbouwsector kampt structureel met een tekort aan vakmensen. Goede stukadoors zijn weken tot maanden vooruit volgeboekt — wie op tijd plant en vergelijkt, betaalt minder en wacht korter."),
            ("Machinaal spuiten wint terrein", "Spuitpleister (machinaal) verdringt voor standaardwerk steeds vaker het handmatige glad pleisteren: sneller, gelijkmatiger en goedkoper per m². Voor strak design-werk blijft handwerk de norm."),
            ("Duurzame pleisters in opmars", "Kalk- en leempleisters worden populairder vanwege vochtregulatie en een gezonder binnenklimaat — een hoger tarief, maar gevraagd in bewuste nieuwbouw en renovatie."),
            ("Gevelisolatie met stucafwerking", "Buitenstucwerk groeit door na-isolatie van gevels. In combinatie met isolatie zijn er soms subsidies — wat de terugverdientijd verkort."),
            ("Stijgende loon- en materiaalkosten", "Tarieven zijn de afgelopen jaren gestegen door hogere loon- en gipskosten. Daardoor lopen offertes voor hetzelfde werk sterker uiteen — vergelijken loont meer dan ooit."),
        ],
        "faq": [
            ("Wat kost een stukadoor per m² in 2026?", "Indicatief reken je in 2026 op &euro;8&ndash;&euro;14/m&sup2; voor spuitwerk (sausklaar plafond en wand), &euro;14&ndash;&euro;22/m&sup2; voor behangklaar en &euro;18&ndash;&euro;38/m&sup2; voor glad sausklaar handwerk. Sierpleister en buitenstucwerk liggen hoger (&euro;40&ndash;&euro;95/m&sup2;)."),
            ("Hoe weet ik of mijn stukadoor-offerte eerlijk is?", "Vergelijk de prijs per m&sup2; per werksoort met de marktbandbreedte. Bylder controleert je offerte per post met actuele marktdata en zegt of die marktconform (groen), twijfelachtig (oranje) of te hoog (rood) is &mdash; met een concreet onderhandelpunt."),
            ("Wat is het verschil tussen spuitwerk en glad pleisteren?", "Spuitwerk (spackspuiten) wordt machinaal aangebracht en is sneller en goedkoper, met een licht korrelige sausklare afwerking. Glad pleisteren is handwerk dat een volledig vlakke, direct schilderbare wand oplevert &mdash; arbeidsintensiever en duurder per m&sup2;."),
            ("Is Bylder een stukadoorsbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen stucwerk en zijn geen leadverkoper. We tonen stukadoors neutraal &mdash; met beoordelingsscores van verschillende externe bronnen naast elkaar."),
            ("Ik ben stukadoor &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan kopers-projecten &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "schilder": {
        "sing": "schilder", "plur": "schilders", "werk": "schilderwerk", "branche": "schildersbranche",
        "ep_link": "/eerlijke-prijzen/schilderwerk/",
        "pillar_h1": "Een schilder met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Schilderwerk is een post waar offertes flink uiteenlopen &mdash; vooral door verschil in voorwerk en aantal lagen. Bylder laat je zien wat een eerlijke prijs per m&sup2; is, controleert je offerte per post, en toont schilders <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je schilder-offerte gratis",
        "prijs_band": "Marktprijs schilderwerk (2026): binnen &euro;12&ndash;&euro;28/m&sup2;, latex spuiten &euro;8&ndash;&euro;16/m&sup2;, buiten &euro;25&ndash;&euro;55/m&sup2;.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;12&ndash;&euro;28/m&sup2; voor binnenschilderwerk en &euro;25&ndash;&euro;55/m&sup2; voor buitenwerk. De prijs hangt af van het voorwerk, het aantal lagen en of het wanden of houtwerk betreft.",
        "werksoorten": [
            {"naam": "Binnenschilderwerk wanden & plafonds", "low": 12, "high": 28, "uitleg": "Sausen of latexen van wanden en plafonds; prijs hangt af van voorwerk en aantal lagen."},
            {"naam": "Latex spuiten (wanden & plafonds)", "low": 8, "high": 16, "uitleg": "Machinaal spuiten — sneller en strakker dan rollen, gunstig bij grotere oppervlakken."},
            {"naam": "Binnen houtwerk & kozijnen", "low": 18, "high": 40, "uitleg": "Deuren, kozijnen en trappen; arbeidsintensief door schuren, plamuren en meerdere lagen."},
            {"naam": "Buitenschilderwerk (kozijnen & gevel)", "low": 25, "high": 55, "uitleg": "Buitenwerk vraagt grondig voorwerk en weerbestendige verf; een steiger kan extra kosten."},
            {"naam": "Behangen", "low": 8, "high": 18, "uitleg": "Voorbehandelen en behangen; prijs varieert met behangsoort en de staat van de wand."},
        ],
        "factoren": [
            "Voorwerk — schuren, plamuren en gronden bepalen een groot deel van de prijs, zeker bij oud of beschadigd werk.",
            "Aantal lagen & verfkwaliteit — dekkende kleuren en duurzame verf vragen meer lagen en duurder materiaal.",
            "Wanden vs. houtwerk — kozijnen, deuren en trappen zijn arbeidsintensiever dan vlakke wanden.",
            "Binnen vs. buiten — buitenwerk vraagt weerbestendige verf, meer voorbereiding en soms een steiger.",
            "Hoogte & bereikbaarheid — hoge ruimtes, trapgaten en gevels vergen een steiger of hoogwerker.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "Goede schilders zijn vaak weken tot maanden vooruit volgeboekt. Op tijd plannen en vergelijken scheelt geld en wachttijd."),
            ("Duurzame & biobased verf", "Watergedragen, biobased en VOS-arme verven winnen terrein vanwege gezondheid en milieu — soms iets duurder, maar steeds vaker gevraagd."),
            ("Machinaal spuiten", "Latex spuiten verdringt voor grote vlakken het rollen: sneller, gelijkmatiger en gunstiger per m²."),
            ("Kleur- en interieuradvies", "Schilders bieden vaker kleuradvies aan; de juiste kleurkeuze voorkomt dure overschilderbeurten."),
            ("Stijgende loon- en materiaalkosten", "Tarieven zijn gestegen door hogere loon- en verfkosten, waardoor offertes voor hetzelfde werk sterker uiteenlopen — vergelijken loont."),
        ],
        "faq": [
            ("Wat kost een schilder per m² in 2026?", "Indicatief: binnenschilderwerk &euro;12&ndash;&euro;28/m&sup2;, latex spuiten &euro;8&ndash;&euro;16/m&sup2;, houtwerk/kozijnen &euro;18&ndash;&euro;40/m&sup2; en buitenwerk &euro;25&ndash;&euro;55/m&sup2;. De prijs hangt vooral af van het voorwerk, het aantal lagen en of het wanden of houtwerk betreft."),
            ("Hoe weet ik of mijn schilder-offerte eerlijk is?", "Vergelijk de prijs per m&sup2; per werksoort met de marktbandbreedte. Bylder controleert je offerte per post met actuele marktdata en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Wat bepaalt de prijs van schilderwerk?", "Het voorwerk (schuren, plamuren, gronden), het aantal lagen en de verfkwaliteit, en of het wanden of houtwerk/kozijnen betreft. Houtwerk en buitenwerk zijn arbeidsintensiever."),
            ("Is Bylder een schildersbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen schilderwerk en zijn geen leadverkoper &mdash; we tonen schilders neutraal en helpen je een eerlijke prijs te betalen."),
            ("Ik ben schilder &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan kopers-projecten &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "loodgieter": {
        "sing": "loodgieter", "plur": "loodgieters", "werk": "loodgieterswerk", "branche": "installatiebranche",
        "ep_link": "/eerlijke-prijzen/", "eenheid": "klus", "calc_mode": "klus",
        "pillar_h1": "Een loodgieter met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Loodgieterswerk wordt vaak per klus of per uur geoffreerd &mdash; en juist daardoor lopen prijzen sterk uiteen. Bylder laat je zien wat een eerlijke prijs is, controleert je offerte per post, en toont loodgieters <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je loodgieter-offerte gratis",
        "prijs_band": "Marktprijs loodgieter (2026): uurtarief &euro;45&ndash;&euro;75 + &euro;25&ndash;&euro;50 voorrijkosten; kraan vervangen &euro;90&ndash;&euro;180, cv-ketel vervangen &euro;1.800&ndash;&euro;3.500.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;45&ndash;&euro;75 per uur plus &euro;25&ndash;&euro;50 voorrijkosten. Losse klussen (kraan, toilet, lekkage) worden meestal per klus geoffreerd; een cv-ketel vervangen kost &euro;1.800&ndash;&euro;3.500.",
        "werksoorten": [
            {"naam": "Kraan of mengkraan vervangen", "low": 90, "high": 180, "uitleg": "Vervangen van een keuken- of badkamerkraan, inclusief arbeid en kleine materialen."},
            {"naam": "Lekkage opsporen en verhelpen", "low": 90, "high": 350, "uitleg": "Lokaliseren en repareren; prijs hangt af van bereikbaarheid en de oorzaak van de lekkage."},
            {"naam": "Toilet vervangen (staand of hangend)", "low": 150, "high": 600, "uitleg": "Demontage oud en plaatsen nieuw toilet; een hangend toilet met inbouwreservoir is arbeidsintensiever."},
            {"naam": "Radiator plaatsen of vervangen (per stuk)", "low": 150, "high": 450, "uitleg": "Per radiator, inclusief aansluiten op de bestaande cv-leidingen."},
            {"naam": "Cv-ketel vervangen (incl. installatie)", "low": 1800, "high": 3500, "uitleg": "Nieuwe hr-combiketel inclusief montage; merk, vermogen en aansluitwerk bepalen de prijs."},
            {"naam": "Afvoer of riool ontstoppen", "low": 90, "high": 250, "uitleg": "Ontstoppen van een afvoer of riolering; bij graafwerk of een hardnekkige verstopping loopt het op."},
        ],
        "factoren": [
            "Uurtarief en voorrijkosten — reken op &euro;45&ndash;&euro;75 per uur plus &euro;25&ndash;&euro;50 voorrijkosten, sterk regio-afhankelijk.",
            "Spoed versus ingepland — spoed-, avond- en weekendwerk kent een toeslag.",
            "Bereikbaarheid van leidingen — ingebouwde of slecht bereikbare leidingen kosten meer arbeid.",
            "Materiaal- en merkkeuze — een A-merk kraan of ketel is duurder dan een basismodel.",
            "Omvang van de klus — een los klusje versus een complete installatie scheelt sterk in efficiëntie per uur.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "De installatiebranche kampt met een groot tekort aan vakmensen. Goede loodgieters zijn vaak weken vooruit volgeboekt — op tijd plannen en vergelijken scheelt geld en wachttijd."),
            ("Van cv-ketel naar warmtepomp", "De overstap naar (hybride) warmtepompen groeit hard; installateurs verschuiven mee, vaak met ISDE-subsidie die de terugverdientijd verkort."),
            ("Waterkwaliteit & legionella", "Strengere eisen rond drinkwater en legionellapreventie maken een correcte aanleg en periodieke controle belangrijker."),
            ("Stijgende materiaalkosten", "Koper, leidingmateriaal en ketels zijn duurder geworden, waardoor offertes voor hetzelfde werk sterker uiteenlopen — vergelijken loont."),
            ("Inbouw- & designsanitair", "Hangende toiletten, inbouwkranen en regendouches vragen meer montagetijd en precisie, en drijven de prijs op."),
        ],
        "faq": [
            ("Wat kost een loodgieter per uur in 2026?", "Indicatief &euro;45&ndash;&euro;75 per uur, plus &euro;25&ndash;&euro;50 voorrijkosten &mdash; regio- en spoedafhankelijk. Veel klussen worden per klus geoffreerd; check je offerte gratis tegen de markt op Bylder."),
            ("Wat kost het vervangen van een cv-ketel?", "Een nieuwe hr-combiketel inclusief installatie kost indicatief &euro;1.800&ndash;&euro;3.500, afhankelijk van merk, vermogen en aansluitwerk."),
            ("Hoe weet ik of mijn loodgieter-offerte eerlijk is?", "Vergelijk per post (arbeid, materiaal, voorrijkosten) met de marktbandbreedte. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een loodgietersbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen loodgieterswerk en zijn geen leadverkoper &mdash; we tonen loodgieters neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben loodgieter &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan kopers-projecten &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "elektricien": {
        "sing": "elektricien", "plur": "elektriciens", "werk": "elektrawerk", "branche": "installatiebranche",
        "ep_link": "/eerlijke-prijzen/", "eenheid": "klus", "calc_mode": "klus",
        "pillar_h1": "Een elektricien met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Elektrawerk wordt meestal per klus of per uur geoffreerd, en de prijzen lopen sterk uiteen &mdash; door verschil in het aantal punten, de staat van de installatie en hak- en freeswerk. Bylder laat je zien wat een eerlijke prijs is, controleert je offerte per post, en toont elektriciens <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je elektricien-offerte gratis",
        "prijs_band": "Marktprijs elektricien (2026): uurtarief &euro;45&ndash;&euro;70 + &euro;25&ndash;&euro;50 voorrijkosten; stopcontact bijplaatsen &euro;80&ndash;&euro;180, groepenkast vervangen &euro;600&ndash;&euro;1.500, laadpaal &euro;500&ndash;&euro;1.500.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;45&ndash;&euro;70 per uur plus &euro;25&ndash;&euro;50 voorrijkosten. Losse klussen (stopcontact, verlichting, storing) worden per klus geoffreerd; een groepenkast vervangen kost &euro;600&ndash;&euro;1.500 en een laadpaal &euro;500&ndash;&euro;1.500.",
        "werksoorten": [
            {"naam": "Stopcontact of schakelaar bijplaatsen (per punt)", "low": 80, "high": 180, "uitleg": "Per punt, inclusief bedrading vanaf de groepenkast; meerdere punten tegelijk is voordeliger."},
            {"naam": "Verlichting of inbouwspots aanleggen", "low": 90, "high": 350, "uitleg": "Aanleg van lichtpunten of inbouwspots inclusief bedrading en schakelaar."},
            {"naam": "Storing opsporen of aardlekschakelaar vervangen", "low": 90, "high": 250, "uitleg": "Lokaliseren en verhelpen van een storing of vervangen van een aardlekautomaat."},
            {"naam": "Laadpaal (thuislader) installeren", "low": 500, "high": 1500, "uitleg": "Installatie van een thuislaadpunt inclusief bekabeling en zekering; de afstand tot de meterkast bepaalt de prijs."},
            {"naam": "Groepenkast vervangen of uitbreiden", "low": 600, "high": 1500, "uitleg": "Vervangen of uitbreiden van de meterkast inclusief aardlekautomaten, afhankelijk van het aantal groepen."},
            {"naam": "Woning of verdieping volledig herbedraden", "low": 1500, "high": 6000, "uitleg": "Volledig vernieuwen van de elektra; sterk afhankelijk van het oppervlak en het aantal punten."},
        ],
        "factoren": [
            "Uurtarief en voorrijkosten — reken op &euro;45&ndash;&euro;70 per uur plus &euro;25&ndash;&euro;50 voorrijkosten, regio-afhankelijk.",
            "Aantal punten en groepen — meer stopcontacten, lichtpunten en groepen betekent meer materiaal en arbeid.",
            "Staat van de bestaande installatie — oude bedrading, ontbrekende aarde of te weinig groepen vraagt extra werk.",
            "Hak- en freeswerk — leidingen wegwerken in wanden kost meer dan opbouwmontage.",
            "Spoed versus ingepland — spoed-, avond- en weekendwerk kent een toeslag.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "De installatiebranche kampt met een groot tekort aan vakmensen. Goede elektriciens zijn vaak weken vooruit volgeboekt — op tijd plannen en vergelijken scheelt geld en wachttijd."),
            ("Verzwaring & laadpalen", "Door elektrificatie (EV, warmtepomp, inductie) verzwaren steeds meer huishoudens hun aansluiting; de installatie van laadpalen groeit hard."),
            ("Zonnepanelen & thuisbatterij", "Omvormers, de afbouw van de salderingsregeling en thuisbatterijen vragen meer elektrawerk en slimme sturing."),
            ("Slimme woning & domotica", "Slimme schakelaars, netwerk-/databekabeling en domotica worden steeds vaker meegenomen bij een verbouwing."),
            ("Stijgende materiaalkosten", "Koper, kabel en componenten zijn duurder geworden, waardoor offertes voor hetzelfde werk sterker uiteenlopen — vergelijken loont."),
        ],
        "faq": [
            ("Wat kost een elektricien per uur in 2026?", "Indicatief &euro;45&ndash;&euro;70 per uur, plus &euro;25&ndash;&euro;50 voorrijkosten &mdash; regio- en spoedafhankelijk. Veel klussen worden per klus geoffreerd; check je offerte gratis tegen de markt op Bylder."),
            ("Wat kost het vervangen van de groepenkast of een laadpaal?", "Een groepenkast vervangen of uitbreiden kost indicatief &euro;600&ndash;&euro;1.500; een thuislaadpaal installeren &euro;500&ndash;&euro;1.500, afhankelijk van het aantal groepen en de afstand tot de meterkast."),
            ("Hoe weet ik of mijn elektricien-offerte eerlijk is?", "Vergelijk per post (arbeid, materiaal, voorrijkosten) met de marktbandbreedte. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een elektricien of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen elektrawerk en zijn geen leadverkoper &mdash; we tonen elektriciens neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben elektricien &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan kopers-projecten &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "aannemer": {
        "sing": "aannemer", "plur": "aannemers", "werk": "bouw- en verbouwwerk", "branche": "bouwsector",
        "ep_link": "/eerlijke-prijzen/", "eenheid": "project", "calc_mode": "klus",
        "pillar_h1": "Een aannemer met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Aannemerswerk is sterk projectafhankelijk en juist daarom lopen offertes enorm uiteen &mdash; door verschil in omvang, afwerkingsniveau en constructief werk. Bylder laat je zien wat een eerlijke prijs is, controleert je offerte per post, en toont aannemers <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je aannemer-offerte gratis",
        "prijs_band": "Marktprijs aannemer (2026): aanbouw/uitbouw &euro;15.000&ndash;&euro;60.000, dakkapel &euro;7.000&ndash;&euro;18.000, verbouwing &euro;10.000&ndash;&euro;80.000 &mdash; sterk projectafhankelijk.",
        "stad_kost": "Aannemerswerk is sterk projectafhankelijk. Indicatief (2026): een aanbouw of uitbouw &euro;15.000&ndash;&euro;60.000, een dakkapel &euro;7.000&ndash;&euro;18.000 en een verbouwing &euro;10.000&ndash;&euro;80.000, afhankelijk van omvang en afwerking.",
        "werksoorten": [
            {"naam": "Aanbouw of uitbouw", "low": 15000, "high": 60000, "uitleg": "Uitbreiding van de woning; prijs hangt sterk af van oppervlak, afwerking en fundering."},
            {"naam": "Verbouwing of renovatie", "low": 10000, "high": 80000, "uitleg": "Van één kamer tot een complete woning; sterk afhankelijk van omvang en afwerkingsniveau."},
            {"naam": "Dakkapel plaatsen", "low": 7000, "high": 18000, "uitleg": "Inclusief plaatsing en afwerking; breedte en materiaal bepalen de prijs."},
            {"naam": "Draagmuur verwijderen (incl. stalen ligger)", "low": 1500, "high": 5000, "uitleg": "Inclusief constructieberekening en stalen ligger; afhankelijk van de overspanning."},
            {"naam": "Fundering of grondwerk", "low": 5000, "high": 25000, "uitleg": "Funderingsherstel of het uitgraven van een kelder/souterrain; sterk projectafhankelijk."},
        ],
        "factoren": [
            "Omvang en complexiteit — één kamer verbouwen versus een complete woning maakt een groot verschil.",
            "Afwerkingsniveau — standaard versus high-end materialen en maatwerk.",
            "Constructief werk — draagmuren, fundering en staal vragen berekeningen en soms vergunningen.",
            "Vergunningen & begeleiding — omgevingsvergunning, constructeur en bouwbegeleiding tellen mee.",
            "Regio en planning — in de Randstad en bij krappe planning liggen de tarieven hoger.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "De bouwsector kampt met een groot tekort aan vakmensen; goede aannemers zijn vaak maanden vooruit volgeboekt. Op tijd plannen en vergelijken loont."),
            ("Verbouwen in plaats van verhuizen", "Door de krappe woningmarkt kiezen meer huiseigenaren voor een aanbouw, uitbouw of dakkapel in plaats van verhuizen."),
            ("Verduurzaming bij verbouwing", "Isolatie, warmtepompen en zonnepanelen worden steeds vaker in één keer meegenomen — vaak met subsidie die de terugverdientijd verkort."),
            ("Stijgende bouwkosten", "Materiaal- en loonkosten zijn de afgelopen jaren gestegen, waardoor offertes voor hetzelfde werk sterker uiteenlopen — vergelijken loont meer dan ooit."),
            ("Circulair & hergebruik", "Hergebruik van materialen en circulair bouwen winnen terrein, zowel uit milieu- als kostenoogpunt."),
        ],
        "faq": [
            ("Wat kost een aanbouw of uitbouw in 2026?", "Indicatief &euro;15.000&ndash;&euro;60.000, sterk afhankelijk van oppervlak, afwerking en fundering. Vraag een gespecificeerde offerte en check gratis op Bylder of die marktconform is."),
            ("Wat kost een verbouwing?", "Van &euro;10.000 voor een enkele kamer tot &euro;80.000+ voor een complete woning &mdash; het hangt af van omvang, constructief werk en afwerkingsniveau."),
            ("Hoe weet ik of mijn aannemer-offerte eerlijk is?", "Vergelijk per post (arbeid, materiaal, onderaanneming, staartkosten) met de marktbandbreedte. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een aannemer of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij voeren zelf geen bouwwerk uit en zijn geen leadverkoper &mdash; we tonen aannemers neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben aannemer &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan nieuwbouw- en verbouwkopers &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "badkamer": {
        "sing": "badkamerspecialist", "plur": "badkamerspecialisten", "werk": "badkamerrenovatie", "branche": "badkamerbranche",
        "bedrijf_plur": "badkamerbedrijven", "bedrijf_sing": "badkamerbedrijf",
        "ep_link": "/eerlijke-prijzen/badkamer/", "eenheid": "project", "calc_mode": "klus",
        "pillar_h1": "Een badkamerspecialist met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Een badkamer renoveren is een van de grootste verbouwposten &mdash; en offertes lopen sterk uiteen door verschil in afmeting, sanitair- en tegelkeuze en leidingwerk. Bylder laat je zien wat een eerlijke prijs is, controleert je offerte per post, en toont badkamerspecialisten <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je badkamer-offerte gratis",
        "prijs_band": "Marktprijs badkamerrenovatie (2026): basis &euro;5.000&ndash;&euro;10.000, gemiddeld &euro;8.000&ndash;&euro;20.000, luxe maatwerk &euro;20.000&ndash;&euro;40.000.",
        "stad_kost": "Een badkamerrenovatie kost indicatief (2026) &euro;5.000&ndash;&euro;10.000 voor een basisbadkamer, &euro;8.000&ndash;&euro;20.000 gemiddeld en &euro;20.000&ndash;&euro;40.000 voor luxe maatwerk &mdash; afhankelijk van afmeting, sanitair en tegelwerk.",
        "werksoorten": [
            {"naam": "Complete badkamer renoveren (gemiddeld)", "low": 8000, "high": 20000, "uitleg": "Een complete renovatie inclusief tegelwerk, sanitair en installatie; afmeting en luxe bepalen de prijs."},
            {"naam": "Basis-/budgetbadkamer", "low": 5000, "high": 10000, "uitleg": "Een kleinere of basale badkamer met eenvoudige afwerking en standaard sanitair."},
            {"naam": "Luxe badkamer (maatwerk)", "low": 20000, "high": 40000, "uitleg": "Hoogwaardig maatwerk met design-sanitair, grootformaat- of natuursteentegels en inbouw."},
            {"naam": "Inloopdouche plaatsen", "low": 1500, "high": 4000, "uitleg": "Inclusief tegelwerk, afvoer en glaswand; losse ingreep binnen een bestaande badkamer."},
            {"naam": "Apart toilet (wc) renoveren", "low": 1500, "high": 4000, "uitleg": "Een aparte wc-ruimte vernieuwen, inclusief tegelwerk en sanitair."},
        ],
        "factoren": [
            "Afmeting van de badkamer — meer m&sup2; betekent meer tegelwerk, sanitair en arbeid.",
            "Sanitair- en tegelkeuze — designmerken en grootformaat- of natuursteentegels zijn fors duurder.",
            "Leidingwerk verleggen — afvoer en watertoevoer verplaatsen vraagt hak- en installatiewerk.",
            "Vloerverwarming & ventilatie — elektrische vloerverwarming en een WTW-aansluiting tellen mee.",
            "Maatwerk & inbouw — inbouwkranen, nissen en op maat gemaakte meubels verhogen de prijs.",
        ],
        "trends": [
            ("Personeelstekort & wachttijden", "Een badkamer vraagt meerdere disciplines (tegelzetter, loodgieter, elektricien); goede badkamerbedrijven zijn vaak weken tot maanden vooruit volgeboekt."),
            ("Inloopdouche & wellness", "Inloopdouches, regendouches en wellness-elementen zijn de norm geworden &mdash; comfortabel, maar prijsverhogend."),
            ("Grootformaat tegels & natuurlijke materialen", "Grote tegels en natuurlijke looks (beton, natuursteen) winnen terrein; ze vragen meer vakmanschap bij het leggen."),
            ("Levensloopbestendig wonen", "Drempelloze douches, beugels en comforthoogtes nemen toe door de vergrijzing en langer thuis wonen."),
            ("Stijgende materiaalkosten", "Tegels en sanitair zijn duurder geworden, waardoor offertes voor een vergelijkbare badkamer sterker uiteenlopen &mdash; vergelijken loont."),
        ],
        "faq": [
            ("Wat kost een complete badkamer in 2026?", "Indicatief &euro;8.000&ndash;&euro;20.000 voor een gemiddelde badkamer; een basisbadkamer vanaf &euro;5.000 en luxe maatwerk &euro;20.000&ndash;&euro;40.000. Check je offerte gratis tegen de markt op Bylder."),
            ("Wat bepaalt de prijs van een badkamerrenovatie?", "Vooral de afmeting, de sanitair- en tegelkeuze en of er leidingwerk verlegd moet worden. Vloerverwarming, ventilatie en maatwerk verhogen de prijs verder."),
            ("Hoe weet ik of mijn badkamer-offerte eerlijk is?", "Vergelijk per post (tegelwerk, sanitair, installatie, arbeid) met de marktbandbreedte. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een badkamerbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij verkopen geen badkamers en zijn geen leadverkoper &mdash; we tonen badkamerspecialisten neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben badkamerspecialist &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan nieuwbouw- en verbouwkopers &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "dakkapel": {
        "sing": "dakkapelspecialist", "plur": "dakkapelspecialisten", "werk": "dakkapel", "branche": "dakkapelbranche",
        "bedrijf_plur": "dakkapelbedrijven", "bedrijf_sing": "dakkapelbedrijf",
        "ep_link": "/eerlijke-prijzen/", "eenheid": "dakkapel", "calc_mode": "klus",
        "pillar_h1": "Een dakkapelspecialist met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Een dakkapel levert ruimte en licht op zolder &mdash; maar offertes lopen sterk uiteen door verschil in breedte, materiaal en plaatsingsmethode. Bylder laat je zien wat een eerlijke prijs is, controleert je offerte per post, en toont dakkapelspecialisten <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je dakkapel-offerte gratis",
        "prijs_band": "Marktprijs dakkapel (2026): kunststof standaard &euro;7.000&ndash;&euro;12.000, hout/traditioneel &euro;9.000&ndash;&euro;16.000, breed of op maat &euro;14.000&ndash;&euro;35.000.",
        "stad_kost": "Een dakkapel kost indicatief (2026) &euro;7.000&ndash;&euro;12.000 voor een standaard kunststof model, &euro;9.000&ndash;&euro;16.000 in hout, en &euro;14.000&ndash;&euro;35.000 voor een brede of op maat gemaakte dakkapel &mdash; afhankelijk van breedte, materiaal en afwerking.",
        "werksoorten": [
            {"naam": "Kunststof dakkapel (standaard, ~2,5 m breed)", "low": 7000, "high": 12000, "uitleg": "Geprefabriceerde kunststof dakkapel in een dag geplaatst; onderhoudsarm en het meest gekozen."},
            {"naam": "Houten / traditionele dakkapel", "low": 9000, "high": 16000, "uitleg": "Traditioneel gebouwd in hout; meer maatwerk en afwerkingsmogelijkheden."},
            {"naam": "Brede dakkapel (4&ndash;5 m) of meerdere", "low": 14000, "high": 25000, "uitleg": "Een brede of dubbele dakkapel; meer materiaal, constructie en plaatsingstijd."},
            {"naam": "Dakkapel met nokverhoging of op maat", "low": 18000, "high": 35000, "uitleg": "Combinatie met nokverhoging of volledig maatwerk; sterk afhankelijk van de constructie."},
            {"naam": "Bestaande dakkapel renoveren of vervangen", "low": 4000, "high": 10000, "uitleg": "Vervangen of opknappen van een bestaande dakkapel; afhankelijk van de staat."},
        ],
        "factoren": [
            "Breedte en aantal — een bredere of dubbele dakkapel kost meer materiaal en plaatsingstijd.",
            "Materiaal — een geprefabriceerd kunststof element is voordeliger dan traditioneel houtwerk.",
            "Bereikbaarheid & dakhelling — een hoog of slecht bereikbaar dak vraagt een kraan of steiger.",
            "Afwerking & isolatie — hoogwaardig isolatieglas, ventilatie en binnenafwerking tellen mee.",
            "Vergunning — bij een dakkapel aan de voorkant is vaak een omgevingsvergunning nodig.",
        ],
        "trends": [
            ("Prefab in één dag", "Geprefabriceerde kunststof dakkapellen worden vaak in één dag geplaatst &mdash; sneller, met minder overlast en een scherpere prijs."),
            ("Verbouwen in plaats van verhuizen", "Door de krappe woningmarkt kiezen meer huiseigenaren voor extra ruimte op zolder via een dakkapel in plaats van verhuizen."),
            ("Betere isolatie & ventilatie", "Hoogwaardig isolatieglas en goede ventilatie (WTW) worden vaker standaard meegenomen, wat comfort en energielabel verbetert."),
            ("Personeelstekort & wachttijden", "Goede dakkapelspecialisten zijn in het hoogseizoen weken vooruit volgeboekt; op tijd plannen en vergelijken loont."),
            ("Stijgende materiaalkosten", "Kunststof, hout en glas zijn duurder geworden, waardoor offertes voor een vergelijkbare dakkapel sterker uiteenlopen."),
        ],
        "faq": [
            ("Wat kost een dakkapel in 2026?", "Indicatief &euro;7.000&ndash;&euro;12.000 voor een standaard kunststof dakkapel, &euro;9.000&ndash;&euro;16.000 in hout en &euro;14.000&ndash;&euro;35.000 voor een brede of op maat gemaakte dakkapel. Check je offerte gratis tegen de markt op Bylder."),
            ("Heb ik een vergunning nodig voor een dakkapel?", "Voor een dakkapel aan de achterkant is vaak geen vergunning nodig (vergunningsvrij), aan de voorkant meestal wel. Een goede specialist regelt of controleert dit voor je."),
            ("Hoe weet ik of mijn dakkapel-offerte eerlijk is?", "Vergelijk per post (element, plaatsing, afwerking, kraan/steiger) met de marktbandbreedte. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een dakkapelbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij plaatsen zelf geen dakkapellen en zijn geen leadverkoper &mdash; we tonen dakkapelspecialisten neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben dakkapelspecialist &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan nieuwbouw- en verbouwkopers &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "gietvloer": {
        "sing": "gietvloer-specialist", "plur": "gietvloer-specialisten", "werk": "gietvloer", "branche": "vloerenbranche",
        "bedrijf_plur": "gietvloerbedrijven", "bedrijf_sing": "gietvloerbedrijf",
        "ep_link": "/eerlijke-prijzen/gietvloer/", "eenheid": "m²", "calc_mode": "oppervlak",
        "pillar_h1": "Een gietvloer-specialist met een eerlijke prijs &mdash; en een eerlijk oordeel",
        "pillar_intro": "Een gietvloer is naadloos en strak, maar de prijs per m&sup2; loopt sterk uiteen door verschil in vloersoort, ondervloer en voorbereiding. Bylder laat je zien wat een eerlijke prijs per m&sup2; is, controleert je offerte per post, en toont gietvloer-specialisten <strong>neutraal</strong> &mdash; met beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n gekleurd platform.",
        "hero_cta": "Check je gietvloer-offerte gratis",
        "prijs_band": "Marktprijs gietvloer (2026): epoxy &euro;50&ndash;&euro;90/m&sup2;, PU-woonvloer &euro;80&ndash;&euro;130/m&sup2;, betonlook/microcement &euro;100&ndash;&euro;150/m&sup2;.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;50&ndash;&euro;90/m&sup2; voor een epoxyvloer, &euro;80&ndash;&euro;130/m&sup2; voor een PU-gietvloer in huis en &euro;100&ndash;&euro;150/m&sup2; voor betonlook/microcement. De prijs hangt af van de vloersoort, de ondervloer en het voorwerk.",
        "werksoorten": [
            {"naam": "PU-gietvloer (woonhuis)", "low": 80, "high": 130, "uitleg": "Polyurethaan gietvloer: flexibel, warm en naadloos &mdash; de populairste keuze voor woonhuizen."},
            {"naam": "Epoxy-gietvloer", "low": 50, "high": 90, "uitleg": "Harder en industriëler; vaak in garages, bergingen en bedrijfsruimtes."},
            {"naam": "Betonlook / microcement", "low": 100, "high": 150, "uitleg": "Strakke betonlook; ambachtelijker werk en daardoor het duurst per m&sup2;."},
            {"naam": "Gietvloer inclusief vloerverwarming", "low": 95, "high": 150, "uitleg": "Gietvloer op een vloer met vloerverwarming, inclusief egaliseren en de juiste opbouw."},
            {"naam": "Ondervloer egaliseren (voorbereiding)", "low": 15, "high": 35, "uitleg": "Voorbereidend egaliseren van de ondervloer; vaak nodig vóór de gietvloer wordt aangebracht."},
        ],
        "factoren": [
            "Vloersoort — epoxy is voordeliger dan een PU-woonvloer; betonlook/microcement is het duurst.",
            "Staat van de ondervloer — egaliseren, scheuren herstellen en voorbehandelen kost extra arbeid.",
            "Oppervlak — grotere vlakken hebben een lagere prijs per m&sup2;; kleine ruimtes juist hoger.",
            "Vloerverwarming — de juiste opbouw en egalisatie boven vloerverwarming vraagt meer voorwerk.",
            "Afwerking & coating — matte, glanzende of extra slijtvaste toplagen verschillen in prijs.",
        ],
        "trends": [
            ("Naadloos & onderhoudsarm", "Gietvloeren winnen terrein in woonhuizen vanwege de naadloze, strakke en onderhoudsarme uitstraling."),
            ("Betonlook & microcement", "Microcement en betonlook zijn populair voor een industriële, minimalistische stijl &mdash; ook op wanden en in badkamers."),
            ("Combinatie met vloerverwarming", "Gietvloeren geleiden warmte goed en worden vaak gecombineerd met vloerverwarming in nieuwbouw en renovatie."),
            ("Duurzame & emissiearme vloeren", "Watergedragen en emissiearme gietvloeren winnen terrein vanwege een gezonder binnenklimaat."),
            ("Stijgende materiaalkosten", "Hars en grondstoffen zijn duurder geworden, waardoor offertes voor dezelfde vloer sterker uiteenlopen &mdash; vergelijken loont."),
        ],
        "faq": [
            ("Wat kost een gietvloer per m² in 2026?", "Indicatief &euro;50&ndash;&euro;90/m&sup2; voor epoxy, &euro;80&ndash;&euro;130/m&sup2; voor een PU-woonvloer en &euro;100&ndash;&euro;150/m&sup2; voor betonlook/microcement. De ondervloer en het voorwerk bepalen een groot deel van de prijs."),
            ("Wat is het verschil tussen een PU- en een epoxy-gietvloer?", "Een PU-gietvloer is flexibeler, warmer en comfortabeler &mdash; ideaal voor woonhuizen. Epoxy is harder en slijtvaster, maar koeler en gevoeliger voor scheurvorming; vaker in garages en bedrijfsruimtes."),
            ("Hoe weet ik of mijn gietvloer-offerte eerlijk is?", "Vergelijk de prijs per m&sup2; per vloersoort met de marktbandbreedte, inclusief egaliseren en voorwerk. Bylder controleert je offerte en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Is Bylder een gietvloerbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij leggen zelf geen gietvloeren en zijn geen leadverkoper &mdash; we tonen gietvloer-specialisten neutraal, met beoordelingen uit meerdere bronnen naast elkaar."),
            ("Ik ben gietvloer-specialist &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan nieuwbouw- en verbouwkopers &mdash; kost eenmalig &euro;79 (geen abonnement). Geen terugkerende leadkosten."),
        ],
    },
    "isolatiebedrijf": {
        "sing": "isolatiebedrijf", "plur": "isolatiebedrijven", "werk": "isolatiewerk", "branche": "isolatiesector",
        "bedrijf_plur": "isolatiebedrijven", "bedrijf_sing": "isolatiebedrijf",
        "ep_link": None,
        "pillar_h1": "Een isolatiebedrijf vinden met een eerlijke offerte &mdash; ISDE-erkend",
        "pillar_intro": "Voor spouwmuurisolatie, dakisolatie en vloerisolatie heb je een erkend bedrijf nodig &mdash; alleen dan krijg je ISDE-subsidie. Bylder laat je zien wat een eerlijke prijs per m&sup2; is, controleert je offerte per post en toont isolatiebedrijven <strong>neutraal</strong>, zonder verborgen commerci&euml;le belangen.",
        "hero_cta": "Check je isolatie-offerte gratis",
        "prijs_band": "Marktprijs isolatie (2026): spouwmuur &euro;15&ndash;&euro;35/m&sup2;, dakisolatie &euro;30&ndash;&euro;80/m&sup2;, kruipruimte/vloer &euro;20&ndash;&euro;45/m&sup2;.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;15&ndash;&euro;35/m&sup2; voor spouwmuurisolatie, &euro;30&ndash;&euro;80/m&sup2; voor dakisolatie en &euro;20&ndash;&euro;45/m&sup2; voor vloer- of kruipruimte-isolatie. De prijs hangt af van de isolatiemethode, de bereikbaarheid en het isolatiemateriaal.",
        "werksoorten": [
            {"naam": "Spouwmuurisolatie (inblazen)", "low": 15, "high": 35, "uitleg": "Isolatiemateriaal (EPS-parels of mineraalwol) wordt via boorgaten in de spouw geblazen &mdash; snel, weinig overlast, ISDE &euro;5,25/m&sup2;."},
            {"naam": "Dakisolatie (onbenutte zolder)", "low": 30, "high": 55, "uitleg": "Isolatiedekens of platen op de zoldervloer &mdash; meest betaalbaar, geen verbouwing nodig."},
            {"naam": "Dakisolatie (schuine kap, aan dakbeschot)", "low": 45, "high": 80, "uitleg": "Dakisolatie aan de binnenzijde van een schuine kap, geschikt als de zolderruimte wordt benut."},
            {"naam": "Vloerisolatie / kruipruimte", "low": 20, "high": 45, "uitleg": "Folie, platen of gespoten PUR in de kruipruimte of direct op de vloer &mdash; in &eacute;&eacute;n dag klaar bij toegankelijke kruipruimte."},
            {"naam": "Buitengevelisolatie (na-isolatie)", "low": 80, "high": 150, "uitleg": "Isolatieplaten op de gevel, afgewerkt met stucwerk of gevelbekleding &mdash; grotere ingreep, hoge isolatiewaarde."},
        ],
        "factoren": [
            "Isolatiemethode &mdash; inblazen is goedkoper dan platen aanbrengen; buitengevel is de duurste optie.",
            "Bereikbaarheid &mdash; moeilijk bereikbare spouwen, lage kruipruimtes en hoge daken kosten extra arbeid.",
            "Isolatiemateriaal &mdash; mineraalwol, EPS, PUR of cellulose verschillen in prijs en Rc-waarde.",
            "Erkend bedrijf vereist &mdash; alleen een BRL-gecertificeerd bedrijf geeft recht op ISDE-subsidie.",
            "Combinatiebonus ISDE &mdash; het subsidiebedrag per m&sup2; verdubbelt bij twee of meer maatregelen binnen 24 maanden.",
        ],
        "trends": [
            ("ISDE-subsidie stimuleert vraag", "De ISDE-subsidie voor isolatie is de afgelopen jaren verhoogd en aantrekkelijker geworden &mdash; zeker bij de combinatie van twee of meer maatregelen, waarbij het bedrag per m&sup2; verdubbelt."),
            ("Erkende bedrijven schaars", "Door de subsidievraag zijn gecertificeerde isolatiebedrijven vol volgeboekt. Vroeg plannen en meerdere offertes opvragen loont."),
            ("Combinatie-aanpak wint", "Steeds meer woningbezitters pakken meerdere maatregelen tegelijk aan (spouwmuur + dak + vloer) om de ISDE-combinatiebonus te verzilveren en minimaal &eacute;&eacute;n verbouwingsronde te plannen."),
            ("Buitengevelisolatie in opmars", "In stedelijk gebied zonder spouwmuren (voor-oorlogse bouw) groeit de vraag naar na-isolatie van de buitengevel, mede door stijgende energie- en subsidie-regels."),
            ("Offertes lopen sterk uiteen", "Door personeelstekort en materiaalkosten lopen offertes voor gelijke werkzaamheden sterker uiteen dan voorheen &mdash; vergelijken kan honderden euro's schelen."),
        ],
        "faq": [
            ("Wat kost een isolatiebedrijf inhuren in 2026?", "Dat hangt af van de maatregel: spouwmuurisolatie kost indicatief &euro;15&ndash;&euro;35/m&sup2;, dakisolatie &euro;30&ndash;&euro;80/m&sup2; en vloer-/kruipruimte-isolatie &euro;20&ndash;&euro;45/m&sup2;. Na ISDE-subsidie liggen de netto-kosten aanzienlijk lager &mdash; check de actuele bedragen bij RVO."),
            ("Moet het een erkend isolatiebedrijf zijn voor ISDE?", "Ja. Voor ISDE-subsidie moet het werk worden uitgevoerd door een erkend bedrijf met BRL-certificering (bv. BRL 1303, 1304 of 2010). Vraag altijd om het certificaat v&oacute;&oacute;r ondertekening."),
            ("Hoe weet ik of mijn isolatie-offerte eerlijk is?", "Vergelijk de prijs per m&sup2; per maatregel met de marktbandbreedte. Bylder controleert je offerte per post en zegt of die marktconform, twijfelachtig of te hoog is &mdash; met een concreet onderhandelpunt."),
            ("Verdubbelt de ISDE-subsidie bij meerdere maatregelen?", "Ja. Bij twee of meer isolatiemaatregelen binnen 24 maanden verdubbelt het ISDE-bedrag per m&sup2; voor de isolatieposten. Check actuele bedragen en voorwaarden bij RVO.nl."),
            ("Ik ben isolatiebedrijf &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan woningkopers die isoleren &mdash; kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
    "kozijnbedrijf": {
        "sing": "kozijnbedrijf", "plur": "kozijnbedrijven", "werk": "kozijnen & glas", "branche": "kozijn- en glassector",
        "bedrijf_plur": "kozijnbedrijven", "bedrijf_sing": "kozijnbedrijf",
        "ep_link": None,
        "pillar_h1": "Een kozijnbedrijf voor HR++-glas of nieuwe kozijnen &mdash; met een eerlijke offerte",
        "pillar_intro": "Via ramen en kozijnen verlies je tot 30% van je warmte. HR++-glas in bestaande kozijnen (ISDE &euro;25/m&sup2;) is de snelste stap; nieuwe kozijnen met triple glas zijn duurder maar leveren meer op (ISDE &euro;111/m&sup2;). Bylder controleert je offerte en toont kozijnbedrijven <strong>neutraal</strong>.",
        "hero_cta": "Check je kozijnen-offerte gratis",
        "prijs_band": "Marktprijs (2026): HR++ glas in bestaand kozijn &euro;80&ndash;&euro;150/m&sup2; inclusief arbeid. Nieuwe kozijnen met triple glas &euro;350&ndash;&euro;700 per kozijn afhankelijk van afmeting en materiaal.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;80&ndash;&euro;150/m&sup2; voor HR++-glas in bestaande kozijnen en &euro;350&ndash;&euro;700 per kozijn voor vervanging met triple glas. De prijs hangt af van het materiaal (kunststof, hout, aluminium), de glassoort en de afmeting.",
        "werksoorten": [
            {"naam": "HR++-glas in bestaand kozijn (maat glas)", "low": 80, "high": 150, "uitleg": "Enkel of oud dubbelglas vervangen door HR++-glas &mdash; kozijn blijft; ISDE &euro;25/m&sup2;."},
            {"naam": "Kozijnvervanging kunststof + triple glas", "low": 350, "high": 550, "uitleg": "Volledig nieuw kunststof kozijn met triple glas per stuk; ISDE &euro;111/m&sup2; nieuw glas."},
            {"naam": "Kozijnvervanging hout + HR++", "low": 400, "high": 650, "uitleg": "Houten kozijn (geschilderd of gegrond) met HR++-glas; onderhoudsintensief maar duurzaam."},
            {"naam": "Kozijnvervanging aluminium + HR++", "low": 450, "high": 700, "uitleg": "Aluminium kozijn: onderhoudsluw en strak, hogere aanschafprijs maar lange levensduur."},
            {"naam": "Beglazing dakraam / dakkapel", "low": 200, "high": 600, "uitleg": "Vervanging van dakraamglazing (bv. Velux), prijs sterk afhankelijk van merk en maat."},
        ],
        "factoren": [
            "Glassoort &mdash; HR++ in bestaand kozijn is goedkoper dan triple glas; vacuu&uuml;mglas is de duurste optie.",
            "Kozijnmateriaal &mdash; kunststof is het voordeligst, hout het meest onderhoudsgevoelig, aluminium duurzaam maar duur.",
            "Afmeting &mdash; grotere kozijnen hebben een hogere totaalprijs; kleine kozijnen een hogere prijs per m&sup2;.",
            "Bouwlaag &mdash; hogere verdiepingen vereisen steigers of lift, wat de arbeid significant duurder maakt.",
            "Aantal kozijnen &mdash; bij meerdere kozijnen tegelijk daalt de arbeidsprijs per stuk door efficiency.",
        ],
        "trends": [
            ("ISDE maakt glazing aantrekkelijker", "De ISDE-subsidie voor glas maakt HR++-vervanging in bestaande kozijnen financieel aantrekkelijk; bij kozijnvervanging met triple glas is de subsidie per m&sup2; nog hoger."),
            ("Kunststof wint op duurzaamheid", "Kunststof kozijnen zijn 100% recyclebaar en onderhoudsvrij; in nieuwbouw en renovatie de meest gekozen optie."),
            ("Vacuu&uuml;mglas als alternatief voor monumenten", "Vacuu&uuml;mglas (&eacute;&eacute;n glasblad met microscopisch vacuu&uuml;m) is dunner dan triple glas en past in bestaande kozijnen; populair bij monumentale woningen."),
            ("Combinatie kozijn + isolatie loont", "Wie nieuwe kozijnen plaatst, combineert dat steeds vaker met spouwmuur- of gevelisolatie &mdash; &eacute;&eacute;n bouwstop, meer ISDE-subsidie door combinatiebonus."),
            ("Wachttijden door personeelstekort", "Goede kozijnbedrijven zijn maanden vooruit volgeboekt; vroeg plannen en meerdere offertes opvragen is noodzakelijk."),
        ],
        "faq": [
            ("Wat kost HR++-glas vervangen in 2026?", "Indicatief &euro;80&ndash;&euro;150/m&sup2; voor HR++-glas in een bestaand kozijn (inclusief arbeid). Na ISDE-subsidie van &euro;25/m&sup2; liggen de netto-kosten lager. Vraag altijd meerdere offertes op."),
            ("Wanneer moet ik kozijnen vervangen in plaats van alleen het glas?", "Vervang kozijnen als ze rottend, krom of slecht isolerend zijn (enkelvoudig kozijnprofiel), als de afdichting faalt of als je wilt upgraden naar triple glas &mdash; dat vereist diepere sponningmaten dan HR++."),
            ("Wat is het ISDE-subsidiebedrag voor glas?", "HR++-glas in bestaande kozijnen: ISDE &euro;25/m&sup2;. Triple of vacuu&uuml;mglas in nieuwe kozijnen: ISDE &euro;111/m&sup2;. Bedragen veranderen &mdash; check de actuele stand bij RVO.nl."),
            ("Hoe weet ik of mijn kozijnen-offerte eerlijk is?", "Vergelijk de prijs per kozijn of per m&sup2; glas met de marktbandbreedte per glassoort en materiaal. Bylder controleert je offerte per post en signaleert te hoge of ontbrekende posten."),
            ("Ik ben kozijnbedrijf &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan woningkopers die verduurzamen &mdash; kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
    "warmtepompinstallateur": {
        "sing": "warmtepompinstallateur", "plur": "warmtepompinstallateurs", "werk": "warmtepompinstallatie", "branche": "installatiesector",
        "bedrijf_plur": "warmtepompinstallateurs", "bedrijf_sing": "warmtepompinstallateur",
        "ep_link": None,
        "pillar_h1": "Een warmtepompinstallateur vinden &mdash; eerlijke prijs, ISDE-erkend",
        "pillar_intro": "Een warmtepomp installeren vraagt om een gecertificeerd bedrijf &mdash; alleen dan heb je recht op ISDE-subsidie. De offerte telt veel posten: warmtepomp zelf, boiler, afgiftesysteem, elektra en installatie. Bylder controleert die offerte per post en toont installateurs <strong>neutraal</strong>.",
        "hero_cta": "Check je warmtepomp-offerte gratis",
        "prijs_band": "Marktprijs warmtepomp (2026): hybride warmtepomp &euro;4.000&ndash;&euro;8.000 inclusief installatie; volledig elektrisch (lucht-water) &euro;8.000&ndash;&euro;15.000 afhankelijk van vermogen en afgiftesysteem.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;4.000&ndash;&euro;8.000 voor een hybride warmtepomp (gecombineerd met bestaande cv-ketel) en &euro;8.000&ndash;&euro;15.000 voor een volledig elektrische lucht-water warmtepomp inclusief installatie. De ISDE-subsidie bestaat uit een startbedrag plus een bedrag per kW en een labelbonus &mdash; check de actuele stand bij RVO.",
        "werksoorten": [
            {"naam": "Hybride warmtepomp (lucht-water, hybride)", "low": 4000, "high": 8000, "uitleg": "Combineert warmtepomp met bestaande cv-ketel; lagere aanschaf, sneller terugverdiend. Vraag subsidie op via RVO."},
            {"naam": "Volledig elektrische warmtepomp (lucht-water)", "low": 8000, "high": 15000, "uitleg": "Vervangt de cv-ketel volledig; geschikt voor goed ge&iuml;soleerde woningen met laagtemperatuurafgifte."},
            {"naam": "Bodem-water warmtepomp", "low": 12000, "high": 22000, "uitleg": "Haalt warmte uit de bodem via een gesloten grondlus; hogere aanschafkosten, hogere effici&euml;ntie."},
            {"naam": "Aanvullend: vloerverwarming aanleggen", "low": 50, "high": 100, "uitleg": "Per m&sup2; vloeroppervlak; noodzakelijk als de woning geen laagtemperatuurafgiftesysteem heeft."},
            {"naam": "Aanvullend: boiler voor warm tapwater", "low": 600, "high": 1400, "uitleg": "Warmwater-boiler (150&ndash;200L) voor tapwater; vaak meegenomen in de warmtepomp-offerte."},
        ],
        "factoren": [
            "Isolatieniveau van de woning &mdash; een warmtepomp werkt pas optimaal als de woning goed ge&iuml;soleerd is.",
            "Afgiftesysteem &mdash; vloerverwarming of grote radiatoren zijn noodzakelijk voor laagtemperatuurafgifte.",
            "Vermogen (kW) &mdash; het benodigde vermogen hangt af van het warmteverlies van de woning.",
            "Merk en type &mdash; leidende merken (Vaillant, Daikin, Samsung, Mitsubishi) verschillen in efficiency, geluidsniveau en garantie.",
            "Installatiekosten &mdash; ombouw van elektra, aanpassen leidingen en buitenunit plaatsen tellen zwaar mee in de offerte.",
        ],
        "trends": [
            ("ISDE-subsidie stimuleert", "De ISDE-subsidie voor warmtepompen (startbedrag + per kW + labelbonus) maakt de investering aanzienlijk lager; check actuele bedragen bij RVO."),
            ("Erkende installateurs schaars", "F-gassen-gecertificeerde installateurs zijn schaars door de sterke vraagstijging. Wachttijden van 3&ndash;9 maanden zijn normaal; vroeg plannen is noodzakelijk."),
            ("Hybride als transitiestap", "Veel woningeigenaren kiezen eerst een hybride warmtepomp (met cv-ketel als back-up) en stappen later over op volledig elektrisch bij een volgend renovatiemoment."),
            ("Laagtemperatuur-afgifte cruciaal", "Warmtepompen renderen pas goed bij een aanvoertemperatuur onder 45°C. Woningen zonder vloerverwarming of grote radiatoren moeten het afgiftesysteem eerst aanpassen."),
            ("Warmtepomp + zonnepanelen", "De combinatie warmtepomp en zonnepanelen is populair: eigen stroom aandrijven van de warmtepomp verlaagt de variabele kosten significant."),
        ],
        "faq": [
            ("Wat kost een warmtepomp inclusief installatie in 2026?", "Indicatief &euro;4.000&ndash;&euro;8.000 voor een hybride warmtepomp en &euro;8.000&ndash;&euro;15.000 voor een volledige lucht-water warmtepomp. Na ISDE-subsidie liggen de netto-kosten aanzienlijk lager &mdash; check de actuele bedragen bij RVO.nl."),
            ("Heb ik een erkend installateur nodig voor ISDE?", "Ja. Voor ISDE-subsidie moet de installateur F-gassen-gecertificeerd zijn en werken met erkende apparatuur. Vraag altijd het certificaat en de productlijst op v&oacute;&oacute;r opdracht."),
            ("Moet ik eerst isoleren voordat ik een warmtepomp neem?", "Sterk aanbevolen. Een warmtepomp is het meest effici&euml;nt in een goed ge&iuml;soleerde woning met laagtemperatuurafgifte (vloerverwarming of grote radiatoren). Isoleer eerst; dan volstaat een kleinere, goedkopere pomp."),
            ("Hoe weet ik of mijn warmtepomp-offerte eerlijk is?", "Een warmtepomp-offerte telt veel posten: apparaat, boiler, installatiearbeid, elektra, leidingwerk en evt. vloerverwarming. Bylder controleert elke post afzonderlijk op marktconformiteit."),
            ("Ik ben warmtepompinstallateur &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd, beter vindbaar en gekoppeld aan woningkopers die verduurzamen &mdash; kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
    "dakdekker": {
        "sing": "dakdekker", "plur": "dakdekkers", "werk": "dakwerk", "branche": "dakdekkersbranche",
        "bedrijf_plur": "dakdekkerbedrijven", "bedrijf_sing": "dakdekkerbedrijf",
        "ep_link": None,
        "pillar_h1": "Een dakdekker met een eerlijke offerte &mdash; dakbedekking, isolatie en pannen",
        "pillar_intro": "Dakwerk loopt sterk uiteen in prijs: van een lekke dakbedekking tot dakisolatie of zonnepanelen-montage. Bylder laat je zien wat een eerlijk tarief is, controleert je offerte per post en toont dakdekkers <strong>neutraal</strong> &mdash; geen verborgen leadverkoop.",
        "hero_cta": "Check je dakdekker-offerte gratis",
        "prijs_band": "Marktprijs dakwerk (2026): plat dak bitumen vervangen &euro;40&ndash;&euro;90/m&sup2;, dakpannen vervangen &euro;35&ndash;&euro;75/m&sup2;, dakisolatie plat dak &euro;80&ndash;&euro;150/m&sup2; inclusief nieuwe bedekking.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;40&ndash;&euro;90/m&sup2; voor een nieuw plat dak (bitumen), &euro;35&ndash;&euro;75/m&sup2; voor dakpannen vervangen en &euro;80&ndash;&euro;150/m&sup2; voor dakisolatie inclusief nieuwe bedekking. Sterk afhankelijk van daktype, oppervlak en bereikbaarheid.",
        "werksoorten": [
            {"naam": "Plat dak bitumen/EPDM vervangen", "low": 40, "high": 90, "uitleg": "Volledig nieuwe dakbedekking op een plat dak; bitumen of EPDM rubber, inclusief dakrand."},
            {"naam": "Dakpannen vervangen (schuine kap)", "low": 35, "high": 75, "uitleg": "Gedeeltelijke of volledige vervanging van keramische of betonnen dakpannen inclusief onderdak."},
            {"naam": "Plat dak met dakisolatie (nieuw)", "low": 80, "high": 150, "uitleg": "Combinatie dakisolatie + nieuwe bedekking; ISDE-subsidie mogelijk als onderdeel van isolatiepakket."},
            {"naam": "Gootwerk / dakrand / dakflashing", "low": 50, "high": 120, "uitleg": "Zinken of aluminium goten, regenpijpen en dakafdichtingen; vaak meegenomen bij dakvervanging."},
            {"naam": "Noodreparatie lekkage", "low": 200, "high": 800, "uitleg": "Spoedinterventie bij daklekkage; prijs sterk afhankelijk van oorzaak en omvang."},
        ],
        "factoren": [
            "Daktype en oppervlak &mdash; plat dak, schuine kap en mansardedak verschillen sterk in arbeid en materiaal.",
            "Hoogte en bereikbaarheid &mdash; hogere of moeilijk bereikbare daken vereisen extra steigers of hoogwerker.",
            "Materiaalsoort &mdash; EPDM, bitumen, keramisch of beton dakpannen &mdash; elk met eigen prijs en levensduur.",
            "Isolatie combineren &mdash; dakisolatie bij een nieuw plat dak is goedkoper dan een aparte ingreep later.",
            "Lood- en zinkwerk &mdash; schouwen, dakdoorvoeren en flashing tellen mee in de totaalofferte.",
        ],
        "trends": [
            ("Platte daken in opmars", "Dakkapellen, uitbouwen en moderne woningen hebben vaak een plat dak &mdash; meer vraag naar EPDM en bitumen vervanging."),
            ("Dakisolatie gecombineerd met dakvernieuwing", "Woningeigenaars pakken dakisolatie steeds vaker mee bij toch al noodzakelijke dakvervanging, ook voor ISDE-subsidie."),
            ("Zonnepanelen op het dak", "Dakdekkers worden vaker ingeschakeld voor voorbereidend werk (dakcheck, versteviging) voordat zonnepanelen worden gemonteerd."),
            ("Personeelstekort", "De dakdekkersbranche kampt structureel met een tekort aan vakmensen; goede bedrijven zijn maanden vooruit volgeboekt."),
            ("Stijgende materiaalkosten", "Bitumen, EPDM en zink zijn duurder geworden; offertes lopen daardoor sterker uiteen dan voorheen."),
        ],
        "faq": [
            ("Wat kost een dakdekker in 2026?", "Indicatief &euro;40&ndash;&euro;90/m&sup2; voor een nieuw plat dak en &euro;35&ndash;&euro;75/m&sup2; voor dakpannen vervangen. Dakisolatie inclusief nieuwe bedekking kost &euro;80&ndash;&euro;150/m&sup2;. Vraag altijd meerdere offertes op."),
            ("Kan ik bij het vervangen van mijn dak meteen isoleren?", "Ja, en dat loont: dakisolatie meenemen bij een toch al geplande dakvervanging is goedkoper dan later een aparte ingreep. Je kunt ook ISDE-subsidie aanvragen als de isolatiewaarde voldoet aan de eisen."),
            ("Hoe weet ik of mijn dakdekker-offerte eerlijk is?", "Controleer de prijs per m&sup2; per type werk, materiaalkosten en arbeid afzonderlijk. Bylder controleert je offerte per post en signaleert te hoge of ontbrekende posten."),
            ("Is Bylder een dakdekkerbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform voor woningkopers. Wij werken niet op commissie van dakdekkers en zijn geen leadverkoper."),
            ("Ik ben dakdekker &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren &mdash; geverifieerd en beter vindbaar bij woningkopers &mdash; kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
    "ventilatiebedrijf": {
        "sing": "ventilatiebedrijf", "plur": "ventilatiebedrijven", "werk": "ventilatiewerk", "branche": "installatiesector",
        "bedrijf_plur": "ventilatiebedrijven", "bedrijf_sing": "ventilatiebedrijf",
        "ep_link": None,
        "pillar_h1": "Een ventilatiebedrijf voor WTW of mechanische afzuiging &mdash; ISDE 2026",
        "pillar_intro": "Goed isoleren en goed ventileren horen samen. Nieuw in 2026: ISDE-subsidie van &euro;400 voor een ventilatieunit, mits gecombineerd met een isolatiemaatregel. Bylder controleert je offerte en toont ventilatiebedrijven <strong>neutraal</strong>.",
        "hero_cta": "Check je ventilatie-offerte gratis",
        "prijs_band": "Marktprijs (2026): systeem C mechanische afzuiging &euro;1.500&ndash;&euro;3.000 inclusief installatie; systeem D WTW/balansventilatie &euro;3.000&ndash;&euro;6.000 inclusief installatie. ISDE 2026: &euro;400 per unit mits gecombineerd met isolatiemaatregel.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;1.500&ndash;&euro;3.000 voor mechanische afzuiging (systeem C) en &euro;3.000&ndash;&euro;6.000 voor een WTW-systeem (systeem D) inclusief installatie. Na ISDE-subsidie van &euro;400 (bij combinatie met isolatie) zijn de netto-kosten lager. Prijs hangt af van woning, leidingwerk en merk.",
        "werksoorten": [
            {"naam": "Systeem C (mechanische afzuiging)", "low": 1500, "high": 3000, "uitleg": "Ventilator zuigt lucht af uit natte ruimtes; verse lucht komt via roosters naar binnen. Betaalbaar, minder effici&euml;nt dan WTW."},
            {"naam": "Systeem D WTW (gebalanceerde ventilatie)", "low": 3000, "high": 6000, "uitleg": "Balansventilatie met warmteterugwinning: terugwint 80&ndash;95% van de warmte uit de afvoerlucht. Hoge kwaliteit, hogere aanschaf."},
            {"naam": "Onderhoud / reiniging ventilatiesysteem", "low": 150, "high": 400, "uitleg": "Jaarlijks of tweejaarlijks onderhoud: filters, kanalen en unit reinigen voor optimale werking."},
            {"naam": "Aanpassen / upgraden systeem C naar D", "low": 2000, "high": 5000, "uitleg": "Ombouw van mechanische afzuiging naar gebalanceerde ventilatie; inclusief leidingwerk."},
        ],
        "factoren": [
            "Type ventilatie &mdash; systeem D (WTW) is effici&euml;nter dan systeem C maar aanzienlijk duurder in aanschaf.",
            "Woningtype en leidingwerk &mdash; een woning zonder bestaand leidingwerk kost meer arbeid voor installatie.",
            "Merk en vermogen &mdash; kwaliteitsverschillen in filters, geluidsniveau en warmteterugwinrendement bepalen de keuze.",
            "ISDE-combinatievoorwaarde &mdash; subsidie van &euro;400 is alleen beschikbaar bij combinatie met een isolatiemaatregel.",
            "Onderhoud &mdash; WTW-systemen vereisen periodieke filtervervanging; rekening houden met jaarlijkse onderhoudskosten.",
        ],
        "trends": [
            ("ISDE 2026 stimuleert ventilatie-upgrade", "De nieuwe ISDE-subsidie van &euro;400 voor ventilatie (gecombineerd met isolatie) stimuleert de combinatie-aanpak, die ook vanuit bouwkundig oogpunt de enige juiste is."),
            ("WTW groeit snel", "Gebalanceerde ventilatie met warmteterugwinning (WTW) groeit sterk in renovatie en nieuwbouw vanwege comfortvoordeel en energiebesparing."),
            ("Luchtdichtheid en ventilatie als pakket", "Steeds meer installateurs pakken luchtdichtheid (kierdichten) en ventilatie samen aan, wat de effectiviteit van beide maatregelen vergroot."),
            ("CO2- en vochtproblemen drijven vraag", "Slechte luchtkwaliteit en vochtproblemen na isoleren zonder goede ventilatie drijven de vraag naar professionele ventilatie-upgrades."),
            ("Onderhoud ventilatie onderbenut", "Veel huishoudens onderhouden hun ventilatiesysteem niet; een slecht onderhouden systeem presteert 30&ndash;60% slechter. Meer bewustzijn vergroot de onderhoudsvraag."),
        ],
        "faq": [
            ("Wat kost een ventilatiebedrijf inhuren in 2026?", "Indicatief &euro;1.500&ndash;&euro;3.000 voor mechanische afzuiging (systeem C) en &euro;3.000&ndash;&euro;6.000 voor WTW/gebalanceerde ventilatie (systeem D), inclusief installatie. Na ISDE-subsidie (&euro;400, mits gecombineerd met isolatie) zijn de netto-kosten lager."),
            ("Wanneer heb ik een ventilatiebedrijf nodig?", "Na het isoleren van je woning: een luchtdichtere woning heeft meer gecontroleerde ventilatie nodig. Ook bij vochtige ruimtes, CO2-problemen of als je overschakelt op een warmtepomp."),
            ("Wat is het verschil tussen systeem C en systeem D?", "Systeem C (mechanische afzuiging) zuigt vochtige lucht af; verse lucht komt passief via roosters binnen. Systeem D (WTW) gebalanceerde ventilatie brengt verse lucht actief in en wint warmte terug uit afvoerlucht."),
            ("Hoe weet ik of mijn ventilatie-offerte eerlijk is?", "Een ventilatie-offerte omvat unit, leidingwerk, roosters en arbeid. Bylder controleert je offerte per post en signaleert te hoge posten of ontbrekende componenten."),
            ("Ik ben ventilatiebedrijf &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
    "timmerman": {
        "sing": "timmerman", "plur": "timmerlieden", "werk": "timmerwerk", "branche": "bouwsector",
        "bedrijf_plur": "timmerbedrijven", "bedrijf_sing": "timmerbedrijf",
        "ep_link": None,
        "pillar_h1": "Een timmerman met een eerlijke offerte &mdash; kozijnen, vloeren en maatwerk",
        "pillar_intro": "Timmerwerk loopt van kozijnen plaatsen en vloeren leggen tot maatwerk-kasten en dakkapellen afbouwen. Bylder laat je zien wat een eerlijke prijs per post is, controleert je offerte en toont timmerlieden <strong>neutraal</strong> &mdash; zonder verborgen commissies.",
        "hero_cta": "Check je timmerwerk-offerte gratis",
        "prijs_band": "Marktprijs timmerwerk (2026): kozijnen plaatsen &euro;150&ndash;&euro;350 per kozijn, vloer leggen (laminaat/parket) &euro;15&ndash;&euro;35/m&sup2;, maatwerk-kast &euro;500&ndash;&euro;3.000 afhankelijk van formaat.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;150&ndash;&euro;350 per kozijn (plaatsen), &euro;15&ndash;&euro;35/m&sup2; voor een vloer (laminaat of parket, exclusief materiaal) en &euro;50&ndash;&euro;80 per uur voor losse kluswerkzaamheden. Maatwerk ligt aanzienlijk hoger.",
        "werksoorten": [
            {"naam": "Kozijnen plaatsen (inclusief dorpel, negge)", "low": 150, "high": 350, "uitleg": "Kunststof, hout of aluminium kozijn in bestaande muurdam &mdash; arbeid per kozijn exclusief kozijn zelf."},
            {"naam": "Vloer leggen (laminaat of parket)", "low": 15, "high": 35, "uitleg": "Arbeid per m&sup2; exclusief materiaal; inclusief uitwerken, ondervloer leggen en plinten."},
            {"naam": "Maatwerk-kast of keukenblok", "low": 500, "high": 3000, "uitleg": "Inbouwkast, garderobekast of kastenwand op maat in hout of MDF &mdash; sterk afhankelijk van formaat en afwerking."},
            {"naam": "Dakkapel afbouwen / binnenzijde", "low": 800, "high": 2500, "uitleg": "Afbouw binnenzijde dakkapel: stuc-klaar maken, vensterbank, kozijn afwerken."},
            {"naam": "Losse klussen (deuren, drempels, herstel)", "low": 50, "high": 80, "uitleg": "Uurprijs voor losse timmerklussen zoals deurhangen, drempels, kozijnherstel."},
        ],
        "factoren": [
            "Type werk &mdash; kozijnen plaatsen vraagt meer vakwerk dan vloer leggen; maatwerk is arbeidsintensiever.",
            "Materiaal &mdash; hout, MDF, multiplex of kunststof verschillen in prijs en bewerkbaarheid.",
            "Bereikbaarheid &mdash; hoge ruimtes, smalle trappenhuizen en buitenwerk vragen extra tijd.",
            "Afwerkniveau &mdash; ruw, geschilderd of gelaagd afwerken telt mee in de offerte.",
            "Regio &mdash; in de Randstad liggen uurtarieven hoger dan in landelijke gebieden.",
        ],
        "trends": [
            ("Kozijnvervanging groeit", "Steeds meer woningeigenaars vervangen kozijnen bij een verduurzamingsbeurt; timmerlieden en kozijnbedrijven werken daarbij nauw samen."),
            ("Maatwerk-kasten populair", "Inbouwkasten op maat worden in nieuwbouw en renovatie steeds vaker gevraagd als alternatief voor kast-uit-de-winkel."),
            ("Parket en massief hout in opmars", "Bij renovatie- en nieuwbouwwoningen groeit de vraag naar massief houten vloeren en hergebruikt parket vanwege de duurzame uitstraling."),
            ("Personeelstekort", "Goede timmerlieden zijn schaars; wachttijden van weken zijn gebruikelijk. Vroeg plannen loont."),
            ("Stijgende houtprijzen", "Houten materialen zijn de afgelopen jaren duurder geworden; offertes voor gelijk werk lopen daardoor meer uiteen."),
        ],
        "faq": [
            ("Wat kost een timmerman in 2026?", "Indicatief &euro;50&ndash;&euro;80 per uur voor losse klussen. Kozijnen plaatsen kost &euro;150&ndash;&euro;350 per kozijn; vloer leggen &euro;15&ndash;&euro;35/m&sup2; exclusief materiaal. Maatwerk is sterk afhankelijk van omvang."),
            ("Wat is het verschil tussen een timmerman en een kozijnbedrijf?", "Een kozijnbedrijf levert en plaatst kozijnen inclusief glas; een timmerman plaatst de kozijnen maar levert het kozijn niet altijd zelf. Bij kozijnvervanging kun je beide inschakelen."),
            ("Hoe weet ik of mijn timmerwerk-offerte eerlijk is?", "Controleer het uurtarief, de geschatte uren en materiaalkosten afzonderlijk. Bylder controleert je offerte per post en signaleert te hoge posten."),
            ("Is Bylder een timmerbedrijf of bemiddelaar?", "Nee. Bylder is een onafhankelijk platform &mdash; geen timmerbedrijf en geen leadverkoper. We tonen timmerlieden neutraal, met beoordelingen uit meerdere bronnen."),
            ("Ik ben timmerman &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren kost eenmalig &euro;79 (geen abonnement). Beter vindbaar bij woningkopers die verbouwen of verduurzamen."),
        ],
    },
    "energieadviseur": {
        "sing": "energieadviseur", "plur": "energieadviseurs", "werk": "energieadvies", "branche": "adviesbranche",
        "bedrijf_plur": "energieadviesbedrijven", "bedrijf_sing": "energieadviesbedrijf",
        "ep_link": None,
        "pillar_h1": "Een energieadviseur voor je energielabel of maatwerkadvies &mdash; wat kost het?",
        "pillar_intro": "Een energieadviseur (EPA-adviseur) stelt het energielabel vast &mdash; verplicht bij verkoop of nieuwe verhuur. Een maatwerkadvies (EPA-maatwerkadvies) laat zien welke verduurzamingsmaatregelen jouw woning het meest opleveren. Bylder controleert je offerte en toont energieadviseurs <strong>neutraal</strong>.",
        "hero_cta": "Check je energieadvies-offerte gratis",
        "prijs_band": "Marktprijs energieadvies (2026): energielabel aanvragen &euro;100&ndash;&euro;200, EPA-maatwerkadvies &euro;250&ndash;&euro;600 afhankelijk van woningtype en diepgang.",
        "stad_kost": "Indicatief reken je in 2026 op &euro;100&ndash;&euro;200 voor een geldig energielabel (EPA-opname door gecertificeerd adviseur) en &euro;250&ndash;&euro;600 voor een EPA-maatwerkadvies inclusief maatregelenrapport. Prijzen verschillen per adviseur, woningtype en regio.",
        "werksoorten": [
            {"naam": "Energielabel aanvragen (EPA-opname)", "low": 100, "high": 200, "uitleg": "Gecertificeerde EPA-adviseur inspecteert de woning en registreert het label in EP-online; 10 jaar geldig."},
            {"naam": "EPA-maatwerkadvies woning", "low": 250, "high": 500, "uitleg": "Persoonlijk adviesrapport met maatregelen, volgorde, kosten en besparingspotentieel &mdash; gebaseerd op opname."},
            {"naam": "EPA-maatwerkadvies uitgebreid (incl. berekeningen)", "low": 350, "high": 600, "uitleg": "Uitgebreid rapport inclusief energieberekeningen en subsidie-overzicht; geschikt voor grotere renovaties."},
            {"naam": "Maatwerkadvies gecombineerd met energielabel", "low": 300, "high": 650, "uitleg": "Gecombineerde opname voor zowel label als maatwerkrapport; goedkoper dan twee aparte bezoeken."},
        ],
        "factoren": [
            "Woningtype &mdash; een rij- of hoekwoning is sneller opgenomen dan een vrijstaande woning of appartement.",
            "Diepgang rapport &mdash; een simpel energielabel is goedkoper dan een uitgebreid maatwerkadvies met berekeningen.",
            "Regio &mdash; in de Randstad liggen de tarieven doorgaans iets hoger.",
            "Gecertificeerd adviseur vereist &mdash; alleen een BRL 9500-gecertificeerd adviseur kan een rechtsgeldig energielabel afgeven.",
            "Spoedeisendheid &mdash; bij een aanstaande verkoop rekent een adviseur soms een urgentietoeslag.",
        ],
        "trends": [
            ("Energielabel verplicht bij verkoop", "Sinds eind 2024 geldt een boete van &euro;515 bij verkoop zonder geldig energielabel (ILT-handhaving). Dit drijft de vraag naar EPA-opnames fors op."),
            ("Maatwerkadvies als verduurzamingsstart", "Steeds meer woningeigenaars laten eerst een maatwerkadvies opstellen v&oacute;&oacute;r ze verduurzamen &mdash; om de volgorde en subsidies te optimaliseren."),
            ("Wachttijden door reguleringsdruk", "Door de combinatie van verplicht energielabel + subsidie-aanvragen zijn gecertificeerde adviseurs drukker dan ooit; vroeg plannen bij verkoop is noodzakelijk."),
            ("EPA+ en diepere labels", "Aanvullende label-niveaus (A+ t/m A++++, bijna-energieneutraal) worden relevanter voor nieuwbouw en diepgaande renovatie."),
            ("Koppeling met verduurzamingssubsidies", "Een EPA-maatwerkadvies is voorwaarde voor de Energiebespaarlening (Nationaal Warmtefonds) en aanvullende subsidies; meer vraag door bewustzijn hierover."),
        ],
        "faq": [
            ("Wat kost een energieadviseur in 2026?", "Indicatief &euro;100&ndash;&euro;200 voor een energielabel-opname en &euro;250&ndash;&euro;600 voor een EPA-maatwerkadvies. Combineer beide voor een voordeligste totaalprijs."),
            ("Is een energielabel verplicht bij de verkoop van mijn woning?", "Ja. Bij verkoop of nieuwe verhuur van een bestaande woning is een geldig energielabel wettelijk verplicht. Ontbreekt het bij verkoop, dan is er een boete van &euro;515. Het label is 10 jaar geldig."),
            ("Wat is een EPA-maatwerkadvies?", "Een persoonlijk rapport van een gecertificeerde adviseur met een overzicht van welke verduurzamingsmaatregelen jouw woning het meest opleveren, in welke volgorde, wat ze kosten en welke subsidies er gelden."),
            ("Hoe weet ik of mijn energieadvies-offerte eerlijk is?", "Vergelijk de prijs voor label-opname en maatwerkadvies met de marktbandbreedte. Let op: een adviseur die te lage aanbiedingen doet, kan aangestuurd zijn op snelle doorverwijzing naar installateurs."),
            ("Ik ben EPA-adviseur &mdash; wat kost een profiel op Bylder?", "Vermelding is gratis. Je profiel activeren kost eenmalig &euro;79 (geen abonnement)."),
        ],
    },
}

# ───────────────────────── CHROME (gedeeld) ─────────────────────────
NAV_CSS = """
.glass-nav{background:rgba(245,240,232,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(61,46,30,0.08);position:sticky;top:0;z-index:50;}
.nav-inner{max-width:1280px;margin:0 auto;padding:14px 48px;display:flex;align-items:center;justify-content:space-between;}
.nav-links{display:flex;align-items:center;gap:24px;}
.nav-links>a{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-links>a:hover{color:#1A1208;}
.nav-right{display:flex;align-items:center;gap:16px;}
.nav-login{font-size:14px;color:rgba(61,46,30,0.5);text-decoration:none;}
.nav-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;}
.nav-burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px;}
.nav-burger span{width:22px;height:2px;background:#1A1208;border-radius:2px;display:block;}
.nav-mobile{display:none;flex-direction:column;gap:2px;padding:10px 20px 18px;background:rgba(245,240,232,0.98);border-bottom:1px solid rgba(61,46,30,0.08);}
.nav-mobile.open{display:flex;}
.nav-mobile a{padding:11px 10px;color:rgba(61,46,30,0.72);text-decoration:none;font-size:15px;border-radius:8px;}
.nav-mobile .m-cta{background:#3D5A3E;color:#F5F0E8;font-weight:700;text-align:center;margin-top:8px;}
.nav-dd{position:relative;}
.nav-dd-btn{background:none;border:none;cursor:pointer;font-size:14px;color:rgba(61,46,30,0.5);font-family:inherit;padding:0;display:flex;align-items:center;gap:4px;}
.nav-dd-menu{display:none;position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;box-shadow:0 12px 40px rgba(61,46,30,0.12);padding:8px;min-width:248px;z-index:200;}
.nav-dd:hover .nav-dd-menu,.nav-dd:focus-within .nav-dd-menu{display:block;}
.nav-dd-menu a{display:block;padding:10px 14px;border-radius:10px;color:#3D2E1E;text-decoration:none;}
.nav-dd-menu a:hover{background:#F5F0E8;}
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

def head(title, desc, canonical, schema_blocks, robots="index,follow"):
    schema = "\n".join(f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>' for b in schema_blocks)
    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LZYCRP1169"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-LZYCRP1169');</script>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canonical}">
<meta name="author" content="Bylder Nederland B.V.">
<meta property="og:type" content="article"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{canonical}">
<meta name="robots" content="{robots}">
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
.card{{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}}
.divider{{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}}
.grid-2{{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}}
.grid-3{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;font-size:14px;color:rgba(61,46,30,0.78);line-height:1.7;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:11px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:12px;padding:13px 16px;transition:border-color .15s;font-size:14px;font-weight:600;}}
.tile:hover{{border-color:rgba(61,90,62,0.4);}}
.ptable{{width:100%;border-collapse:collapse;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;overflow:hidden;font-size:14.5px;}}
.ptable th{{text-align:left;background:rgba(61,90,62,0.07);padding:13px 16px;font-size:12px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.05em;color:rgba(61,46,30,0.6);}}
.ptable td{{padding:13px 16px;border-top:1px solid rgba(61,46,30,0.07);vertical-align:top;}}
.ptable td.price{{font-weight:800;color:#1A1208;white-space:nowrap;}}
.reviewbar{{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0;}}
.reviewbar span{{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid rgba(61,46,30,0.12);border-radius:999px;padding:7px 14px;font-size:13px;font-weight:700;color:#1A1208;}}
.reviewbar small{{color:rgba(61,46,30,0.5);font-weight:400;}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-2,.grid-3{{grid-template-columns:1fr;}}}}
{NAV_CSS}
</style></head>
<body>{NAV_HTML}"""

def FOOTER(vak):
    return f"""<footer style="background:#1A1208;padding:56px 0;">
  <div style="max-width:1180px;margin:0 auto;padding:0 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:30px;height:30px;background:#3D5A3E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:800;color:#F5F0E8;font-size:12px;">B.</div>
      <span style="font-weight:700;font-size:16px;color:#F5F0E8;">Bylder<span style="color:#8AAE8B;">.com</span></span>
    </div>
    <p style="font-size:12px;color:rgba(245,240,232,0.4);max-width:620px;line-height:1.6;">Prijzen zijn indicatieve marktbandbreedtes (NL 2026) en verschillen per project, regio en afwerking. Reviewscores zijn afkomstig van de genoemde externe platforms; bekijk de volledige beoordelingen bij de bron. Bylder is een onafhankelijk platform en geen {html.escape(bedrijf_sing(vak))}.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer></body></html>"""

def faq_schema(qa): return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
def breadcrumb(items): return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}
def faq_html(vak, qa): return f'<h2 style="font-size:1.5rem;font-weight:800;margin:8px 0 12px;">Veelgestelde vragen over {html.escape(vak["plur"])}</h2>' + "".join(f'<div class="faq-item"><h3>{html.escape(q)}</h3><p>{a}</p></div>' for q, a in qa)


# Namen die geen lokale vakman zijn maar een platform/opleiding/uitzender → uit de pagina's.
# Conservatief: alleen ondubbelzinnige niet-vakmannen (geen marketing-namen van echte bedrijven).
UITGESLOTEN = ("banenplatform", "platform van nederland", "vacature", "uitzend", "detachering",
               "werving", "werktalent", "vakopleiding", "academie", "opleidingscentrum", "vergelijk offertes")

def is_uitgesloten(naam):
    n = (naam or "").lower()
    return any(k in n for k in UITGESLOTEN)

def schoon_stad(s):
    """Strip een meegelekte NL-postcode uit de plaatsnaam ('7328 Apeldoorn' → 'Apeldoorn',
    '1234 AB Plaats' → 'Plaats'). Pure-postcode-rest ('6678 MB') = onbruikbaar → None."""
    if not s: return s
    s = s.strip()
    m = re.match(r"^\d+\s+(?:[A-Za-z]{2}\s+)?(.+)$", s)
    if m: s = m.group(1).strip()
    if not s or re.fullmatch(r"[A-Za-z]{1,2}", s): return None
    return s


def load_vakbedrijven(vak_slug):
    path = os.path.join(ROOT, "data", "vakbedrijven.json")
    if not os.path.exists(path): return []
    rows = []
    for b in json.load(open(path, encoding="utf-8")).get("vakbedrijven", []):
        if b.get("vak") != vak_slug or b.get("opt_out") or not b.get("naam"): continue
        if is_uitgesloten(b["naam"]): continue
        b["stad"] = schoon_stad(b.get("stad"))
        rows.append(b)
    rows.sort(key=lambda b: ((b.get("stad") or "zzz"), b.get("naam") or ""))
    return rows


def _slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")

def _prominentie(b): return (-(b.get("google_reviews") or 0), -(b.get("google_rating") or 0))

def maps_url(b):
    """Deeplink naar de Google-vermelding. Gebruikt maps_uri indien aanwezig, anders
    construeert uit google_place_id via Google's officiële Maps-URL (gratis, geen API-call).
    priceLevel/editorialSummary zijn voor vakbedrijven structureel leeg → niet nagejaagd."""
    if b.get("maps_uri"): return b["maps_uri"]
    pid = b.get("google_place_id")
    if pid:
        return f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(b.get('naam') or '')}&query_place_id={pid}"
    return None

def per_stad(bedrijven):
    groepen = {}
    for b in bedrijven:
        stad = (b.get("stad") or "").strip()
        if stad: groepen.setdefault(stad, []).append(b)
    return {s: sorted(l, key=_prominentie) for s, l in groepen.items()}


def _socials(b):
    out = ""
    for k, lbl in [("instagram", "Instagram"), ("facebook", "Facebook"), ("linkedin", "LinkedIn")]:
        u = (b.get("socials") or {}).get(k)
        if u: out += f'<a href="{html.escape(u)}" target="_blank" rel="nofollow noopener" style="font-size:11px;color:#3D5A3E;font-weight:600;margin-right:9px;">{lbl}</a>'
    return out

def bedrijf_card(b):
    naam = html.escape(b["naam"]); stad = html.escape(b.get("stad") or "Nederland")
    site = b.get("website"); rating = b.get("google_rating"); reviews = b.get("google_reviews") or 0
    lid = b.get("status") == "lid"
    prijs = b.get("price_level"); summary = (b.get("google_summary") or "").strip(); maps = maps_url(b)
    score = (f'<span style="font-size:12px;color:#3D5A3E;font-weight:700;white-space:nowrap;">Google &#9733; {rating} '
             f'<span style="color:rgba(61,46,30,0.45);font-weight:400;">({reviews})</span></span>') if rating else ""
    prijs_chip = f'<span title="Prijsniveau volgens Google" style="font-size:11px;font-weight:700;color:rgba(61,46,30,0.6);background:#F5F0E8;padding:1px 8px;border-radius:6px;white-space:nowrap;">{prijs}</span>' if prijs else ""
    rechts = f'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0;">{score}{prijs_chip}</div>' if (score or prijs_chip) else ""
    badge = '<span style="font-size:10px;font-weight:800;color:#3D5A3E;background:rgba(61,90,62,0.12);padding:2px 8px;border-radius:999px;white-space:nowrap;">&#10003; Geverifieerd</span>' if lid else ""
    summary_html = f'<div style="font-size:12.5px;color:rgba(61,46,30,0.6);line-height:1.5;margin-top:7px;">{html.escape(summary[:140])}</div>' if summary else ""
    diensten = b.get("diensten") or []
    chips = "".join(f'<span style="font-size:11px;color:rgba(61,46,30,0.6);background:#F5F0E8;padding:2px 8px;border-radius:6px;">{html.escape(str(x))}</span>' for x in diensten[:3])
    chips_html = f'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">{chips}</div>' if chips else ""
    socials = _socials(b)
    socials_html = f'<div style="margin-top:8px;">{socials}</div>' if socials else ""
    purl = b.get("_profiel_url")
    naam_html = f'<a href="{purl}" style="color:#1A1208;text-decoration:none;">{naam}</a>' if purl else naam
    primary = (f'<a href="{purl}" style="font-size:13px;font-weight:700;">Bekijk profiel &#8594;</a>' if purl
               else (f'<a href="{html.escape(site)}" target="_blank" rel="nofollow noopener" style="font-size:13px;font-weight:700;">Website &#8594;</a>'
                     if site else '<span style="font-size:12px;color:rgba(61,46,30,0.4);">Nog geen website bekend</span>'))
    maps_link = f'<a href="{html.escape(maps)}" target="_blank" rel="nofollow noopener" style="font-size:12px;color:rgba(61,46,30,0.5);margin-left:10px;">Maps &#8594;</a>' if maps else ""
    return (f'<div class="card vb-card" data-rating="{rating or 0}" data-reviews="{reviews}" data-lid="{1 if lid else 0}" style="padding:16px 18px;">'
            f'<div style="display:flex;justify-content:space-between;gap:10px;align-items:start;">'
            f'<div><div style="font-weight:700;font-size:15px;color:#1A1208;display:flex;align-items:center;gap:7px;flex-wrap:wrap;">{naam_html}{badge}</div>'
            f'<div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">{stad}</div></div>{rechts}</div>'
            f'{summary_html}{chips_html}{socials_html}'
            f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap;"><span>{primary}{maps_link}</span>'
            f'<a href="https://app.bylder.com/vakbedrijf/claim/{b["slug"]}" style="font-size:11.5px;color:rgba(61,46,30,0.45);text-decoration:underline;">Is dit jouw bedrijf? Claim &#8594;</a></div>'
            f'</div>')

def bedrijven_grid(lijst): return f'<div class="grid-3">{"".join(bedrijf_card(b) for b in lijst)}</div>'


def klus_calculator(vak):
    """Inline 'wat kost mijn klus?'-widget. Twee modi:
    - 'oppervlak' (m²/meter): hoeveelheid × bandbreedte (stukadoor, schilder, gietvloer).
    - 'klus' (per klus/stuk/project): kies werk → toon bandbreedte (loodgieter, elektricien, badkamer)."""
    ws = vak["werksoorten"]
    eenheid = vak.get("eenheid", "m²")
    mode = vak.get("calc_mode", "oppervlak")
    data = json.dumps([{"low": w["low"], "high": w["high"]} for w in ws])
    opts = "".join(f'<option value="{i}">{html.escape(w["naam"])}</option>' for i, w in enumerate(ws))
    wrap_open = '<div style="background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:22px;margin:24px 0;"><div style="font-weight:800;font-size:1.05rem;color:#1A1208;margin-bottom:4px;">Wat kost jouw klus?</div>'
    cta = '<a href="' + SIGNUP + '" style="display:inline-block;margin-top:8px;background:#3D5A3E;color:#F5F0E8;padding:11px 22px;border-radius:9px;font-weight:700;font-size:14px;text-decoration:none;">Check je échte offerte gratis &#8594;</a></div>'
    sel = '<select id="kc-werk" style="padding:11px;border:1.5px solid rgba(61,46,30,0.14);border-radius:10px;font-size:14px;background:#fff;color:#1A1208;font-family:inherit;width:100%;">' + opts + '</select>'
    out = '<div id="kc-out" style="font-size:15px;color:#1A1208;margin-top:12px;min-height:22px;"></div>'
    if mode == "klus":
        h = (wrap_open
             + '<div style="font-size:13px;color:rgba(61,46,30,0.6);margin-bottom:14px;">Kies het type werk voor een directe prijsindicatie (NL 2026).</div>'
             + sel + out + cta)
        js = ('<script>(function(){var W=' + data + ';var EH=' + json.dumps(eenheid) + ';var s=document.getElementById("kc-werk"),o=document.getElementById("kc-out");'
              'function f(n){return n.toLocaleString("nl-NL");}function c(){var w=W[s.value];if(!w){o.innerHTML="";return;}'
              'o.innerHTML="Indicatie: <strong>\\u20ac"+f(w.low)+" \\u2013 \\u20ac"+f(w.high)+"</strong> '
              '<span style=\\"color:rgba(61,46,30,0.5);font-size:13px;\\">(indicatief, per "+EH+", excl. btw)</span>";}'
              's.addEventListener("change",c);c();})();</script>')
        return h + js
    # oppervlak-modus
    eh = html.escape(eenheid)
    h = (wrap_open
         + '<div style="font-size:13px;color:rgba(61,46,30,0.6);margin-bottom:14px;">Kies je werksoort en vul je hoeveelheid in voor een directe indicatie (NL 2026).</div>'
         + '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:10px;">' + sel
         + f'<input id="kc-m2" inputmode="decimal" placeholder="aantal {eh}" style="padding:11px;border:1.5px solid rgba(61,46,30,0.14);border-radius:10px;font-size:14px;color:#1A1208;font-family:inherit;" /></div>'
         + out + cta)
    js = ('<script>(function(){var W=' + data + ';var EH=' + json.dumps(eenheid) + ';var s=document.getElementById("kc-werk"),m=document.getElementById("kc-m2"),o=document.getElementById("kc-out");'
          'function f(n){return n.toLocaleString("nl-NL");}function c(){var w=W[s.value],a=parseFloat((m.value||"").replace(",","."));'
          'if(!w||!(a>0)){o.innerHTML="";return;}o.innerHTML="Indicatie voor jouw klus: <strong>\\u20ac"+f(Math.round(w.low*a))+" \\u2013 \\u20ac"+f(Math.round(w.high*a))'
          '+"</strong> <span style=\\"color:rgba(61,46,30,0.5);font-size:13px;\\">("+w.low+"\\u2013"+w.high+" \\u20ac/"+EH+", indicatief)</span>";}'
          's.addEventListener("change",c);m.addEventListener("input",c);})();</script>')
    return h + js


def aanbesteding_block(vak, stad=None):
    waar = f" in {html.escape(stad)}" if stad else " bij jou in de buurt"
    return ('<div style="background:#3D5A3E;border-radius:18px;padding:34px;text-align:center;margin:32px 0;">'
            '<p style="font-size:11px;font-family:\'Space Mono\',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.55);margin-bottom:8px;">In &eacute;&eacute;n keer geregeld</p>'
            f'<h2 style="font-size:1.5rem;font-weight:800;color:#F5F0E8;margin-bottom:10px;">Krijg voorstellen van {html.escape(vak["plur"])}{waar}</h2>'
            f'<p style="color:rgba(245,240,232,0.78);margin-bottom:22px;max-width:560px;margin-left:auto;margin-right:auto;font-size:14.5px;line-height:1.6;">Beschrijf je klus &eacute;&eacute;n keer &mdash; lokale {html.escape(vak["plur"])} reageren met een prijs. Bylder zet de marktprijs ernaast, zodat je weet wat eerlijk is.</p>'
            f'<a href="{SIGNUP}" class="cta-primary">Vraag gratis voorstellen aan &#8594;</a></div>')


def keuzehulp_block(vak):
    punten = [
        f"Vergelijk minstens 3 {vak['plur']} &mdash; pr&iuml;s &eacute;n aanpak verschillen sterk.",
        "Kijk naar beoordelingen uit meerdere bronnen, niet &eacute;&eacute;n platform.",
        "Vraag een gespecificeerde offerte per werksoort (m&sup2;, voorwerk, aantal lagen).",
        "Check of voorwerk en garantie in de prijs zitten.",
        "Leg de afspraken en planning schriftelijk vast.",
    ]
    lis = "".join(f"<li>{x}</li>" for x in punten)
    return (f'<h2 style="font-size:1.4rem;font-weight:800;margin:36px 0 12px;">Waar let je op bij het kiezen van een {html.escape(vak["sing"])}?</h2>'
            f'<ul class="check-list">{lis}</ul>')


def directory_sortable(vak, lijst):
    if not lijst: return ""
    ctrl = ('<div style="display:flex;align-items:center;gap:10px;margin:6px 0 14px;flex-wrap:wrap;">'
            '<span style="font-size:13px;color:rgba(61,46,30,0.55);">Sorteer:</span>'
            '<select id="dir-sort" style="padding:8px 11px;border:1.5px solid rgba(61,46,30,0.14);border-radius:9px;font-size:13px;background:#fff;color:#1A1208;font-family:inherit;">'
            '<option value="prom">Relevantie (beste eerst)</option><option value="rating">Best beoordeeld</option><option value="reviews">Meeste reviews</option><option value="lid">Geverifieerd eerst</option>'
            '</select></div>')
    grid = f'<div class="grid-3" id="dir-grid">{"".join(bedrijf_card(b) for b in lijst)}</div>'
    js = ('<script>(function(){var sel=document.getElementById("dir-sort"),g=document.getElementById("dir-grid");if(!sel||!g)return;'
          'var cards=[].slice.call(g.children);function k(c,a){return parseFloat(c.getAttribute(a))||0;}'
          'sel.addEventListener("change",function(){var m=sel.value,s=cards.slice();'
          'if(m==="reviews")s.sort(function(a,b){return k(b,"data-reviews")-k(a,"data-reviews");});'
          'else if(m==="rating")s.sort(function(a,b){return k(b,"data-rating")-k(a,"data-rating")||k(b,"data-reviews")-k(a,"data-reviews");});'
          'else if(m==="lid")s.sort(function(a,b){return k(b,"data-lid")-k(a,"data-lid")||k(b,"data-reviews")-k(a,"data-reviews");});'
          's.forEach(function(c){g.appendChild(c);});});})();</script>')
    return ctrl + grid + js

def claim_cta(vak, stad_label=None):
    waar = f" in {html.escape(stad_label)}" if stad_label else ""
    return (f'<div style="background:rgba(184,92,56,0.06);border:1px solid rgba(184,92,56,0.2);border-radius:14px;padding:18px 20px;margin:22px 0;">'
            f'<div style="font-weight:700;color:#1A1208;font-size:15px;margin-bottom:4px;">Ben jij {html.escape(vak["sing"])}{waar}? Sta erbij.</div>'
            f'<div style="font-size:13.5px;color:rgba(61,46,30,0.7);line-height:1.6;margin-bottom:12px;">Vermelding is gratis. Activeer je profiel eenmalig voor &euro;79 en word gekoppeld aan nieuwbouw- en verbouwkopers die n&uacute; een {html.escape(vak["sing"])} zoeken &mdash; geen terugkerende leadkosten.</div>'
            f'<a href="{VOORDELEN}/" style="display:inline-block;background:#B85C38;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Bekijk de voordelen &amp; meld je aan &#8594;</a></div>'
            f'<p style="font-size:11px;color:rgba(61,46,30,0.4);margin-top:8px;">Bedrijfsgegevens via Google &amp; OpenStreetMap (&copy; OpenStreetMap-bijdragers, ODbL). Reviewscores afkomstig van de genoemde bronnen. Klopt iets niet? Laat het ons weten.</p>')

def offerte_check_slug_bestaat(vak_slug, stad_slug):
    return os.path.isdir(os.path.join(ROOT, "offerte-check", vak_slug, stad_slug))


def build_city_page(vak, vak_slug, stad, lokaal):
    slug = _slug(stad); n = len(lokaal)
    base = f"/{vak_slug}"
    canonical = f"{BASE}{base}/{slug}/"
    title = f"{vak['sing'].capitalize()} in {stad} nodig? {n} bedrijven, reviews & prijzen (2026) | Bylder"
    desc = (f"Vind en vergelijk {n} {vak['plur']} in {stad}: reviews, websites en marktprijzen. "
            f"Check gratis of je offerte eerlijk is. Onafhankelijk overzicht van Bylder.")
    qa = [
        (f"Wat kost een {vak['sing']} in {stad}?", vak["stad_kost"] + " Check je offerte gratis tegen actuele marktdata."),
        (f"Hoe vind ik een goede {vak['sing']} in {stad}?",
         f"Vergelijk de {vak['plur']} in {stad} op beoordelingen uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n platform. "
         "Bylder toont ze neutraal en laat je je offerte per post controleren op een eerlijke prijs."),
        (f"Welke {vak['sing']} moet ik kiezen in {stad}?",
         f"Er is niet &eacute;&eacute;n beste {vak['sing']}; het hangt af van je klus en budget. Vergelijk er minstens drie op beoordelingen, een "
         f"gespecificeerde prijs per werksoort en hun aanpak. Via Bylder vraag je in &eacute;&eacute;n keer voorstellen aan en zet je de marktprijs ernaast."),
        (f"Hoe vraag ik offertes aan {vak['plur']} in {stad}?",
         f"Beschrijf je klus &eacute;&eacute;n keer op Bylder &mdash; lokale {vak['plur']} reageren met een voorstel. Je vergelijkt de prijzen naast de "
         "marktbandbreedte, zodat je direct ziet of een offerte eerlijk is."),
    ]
    schema = [
        faq_schema(qa),
        breadcrumb([("Bylder.com", BASE + "/"), (vak["sing"].capitalize(), f"{BASE}{base}/"), (stad, canonical)]),
        {"@context": "https://schema.org", "@type": "ItemList", "name": f"{vak['plur'].capitalize()} in {stad}",
         "itemListElement": [{"@type": "ListItem", "position": i + 1,
              "item": {k: v for k, v in {"@type": "LocalBusiness", "name": b["naam"], "url": b.get("website"),
                  "address": {"@type": "PostalAddress", "addressLocality": b.get("stad"), "addressCountry": "NL"}}.items() if v}}
             for i, b in enumerate(lokaal)]},
    ]
    oc = (f'<a href="{OFFERTE_HUB}/{vak_slug}/{slug}/">offerte-check voor {html.escape(stad)}</a>'
          if offerte_check_slug_bestaat(vak_slug, slug) else f'<a href="{OFFERTE_HUB}/">offerte-check</a>')
    body = f"""<main style="padding:48px 0 20px;"><div class="container" style="max-width:1000px;">
  <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:18px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> &rarr; <a href="{base}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">{vak['sing'].capitalize()}</a> &rarr; <span style="color:rgba(61,46,30,0.6);">{html.escape(stad)}</span></p>
  <div class="badge">{html.escape(vak['plur'].capitalize())} &middot; {html.escape(stad)}</div>
  <h1 style="font-size:2.3rem;font-weight:800;line-height:1.14;margin-bottom:12px;">{vak['plur'].capitalize()} in {html.escape(stad)}</h1>
  <p style="font-size:1.08rem;color:rgba(61,46,30,0.7);line-height:1.7;max-width:760px;margin-bottom:8px;">
    {n} {html.escape(bedrijf_plur(vak))} in en rond {html.escape(stad)}, met hun beoordelingen en websites naast elkaar. Bylder toont ze
    <strong>neutraal</strong> &mdash; en laat je gratis checken of je offerte een eerlijke prijs heeft.</p>
  <div class="highlight">{vak['prijs_band']} Bekijk de volledige <a href="{base}/">marktprijzen en werksoorten</a>.</div>

  {klus_calculator(vak)}

  {aanbesteding_block(vak, stad)}

  <h2 style="font-size:1.5rem;font-weight:800;margin:32px 0 8px;">{n} {vak['plur']} in {html.escape(stad)}</h2>
  <p style="font-size:13.5px;color:rgba(61,46,30,0.55);margin-bottom:6px;">Onafhankelijk overzicht, standaard op relevantie gesorteerd. Geverifieerde bedrijven hebben hun profiel geclaimd.</p>
  {directory_sortable(vak, lokaal)}
  {claim_cta(vak, stad)}

  {keuzehulp_block(vak)}

  <div class="divider"></div>
  {faq_html(vak, qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder: terug naar <a href="{base}/">{vak['plur']} &amp; marktprijzen</a> &middot; {oc} &middot; <a href="{vak['ep_link']}">wat kost {vak['werk']}</a></p>
  </div></main>"""
    robots = "index,follow" if n >= MIN_PER_STAD else "noindex,follow"
    return head(title, desc, canonical, schema, robots=robots) + body + FOOTER(vak)


def build_pillar(vak, vak_slug, bedrijven, steden_idx):
    base = f"/{vak_slug}"; canonical = f"{BASE}{base}/"
    s, p = vak["sing"], vak["plur"]
    title = f"{s.capitalize()} nodig? Marktprijzen, kosten & een eerlijke offerte (2026) | Bylder"
    desc = (f"Wat kost een {s} in 2026? Marktprijzen per werksoort, trends in de branche en hoe je via Bylder "
            f"een eerlijke offerte checkt. Plus: {p}, claim je gratis neutrale profiel.")
    top_landelijk = sorted([b for b in bedrijven if b.get("google_reviews")], key=_prominentie)[:9]
    qa = vak["faq"]
    schema = [
        faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), (s.capitalize(), canonical)]),
        {"@context": "https://schema.org", "@type": "Article", "headline": f"{s.capitalize()} nodig? Marktprijzen en een eerlijke offerte (2026)",
         "description": desc, "inLanguage": "nl-NL", "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder Nederland B.V."}},
        {"@context": "https://schema.org", "@type": "Service", "serviceType": f"{s.capitalize()} offerte-check en marktprijsvergelijking",
         "areaServed": {"@type": "Country", "name": "Nederland"}, "provider": {"@type": "Organization", "name": "Bylder.com", "url": BASE + "/"},
         "description": f"Onafhankelijke controle van {s}-offertes op marktconformiteit en een neutraal overzicht van {p}."},
    ]
    if top_landelijk:
        schema.append({"@context": "https://schema.org", "@type": "ItemList", "name": f"Hoogst beoordeelde {p} in Nederland",
                       "itemListElement": [{"@type": "ListItem", "position": i + 1,
                            "item": {k: v for k, v in {"@type": "LocalBusiness", "name": b["naam"], "url": b.get("website"),
                                "address": {"@type": "PostalAddress", "addressLocality": b.get("stad"), "addressCountry": "NL"} if b.get("stad") else None}.items() if v}}
                           for i, b in enumerate(top_landelijk)]})

    rows = "".join(
        f'<tr><td>{html.escape(w["naam"])}<div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:3px;">{html.escape(w["uitleg"])}</div></td>'
        f'<td class="price">{euro(w["low"])}&ndash;{euro(w["high"])}<div style="font-size:11px;font-weight:400;color:rgba(61,46,30,0.45);">per {html.escape(vak.get("eenheid", "m²"))}</div></td></tr>'
        for w in vak["werksoorten"])
    factoren = "".join(f"<li>{html.escape(x)}</li>" for x in vak["factoren"])
    trends = "".join(
        f'<div class="card"><div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:6px;">{html.escape(t)}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.68);line-height:1.65;">{html.escape(d)}</div></div>'
        for t, d in vak["trends"])
    stad_tiles = "".join(
        f'<a href="{base}/{_slug(st)}/" class="tile">{p.capitalize()} in {html.escape(st)} <span style="color:rgba(61,46,30,0.4);font-weight:400;">({len(l)})</span></a>'
        for st, l in steden_idx)
    highlight_grid = bedrijven_grid(top_landelijk) if top_landelijk else ""
    anchor = f"voor-{s}s"

    body = f"""<main style="padding:56px 0 20px;"><div class="container">
  <div style="max-width:820px;">
    <div class="badge">{p.capitalize()} &middot; Marktgids 2026</div>
    <h1 style="font-size:2.7rem;font-weight:800;line-height:1.12;margin-bottom:16px;">{vak['pillar_h1']}</h1>
    <p style="font-size:1.15rem;color:rgba(61,46,30,0.7);line-height:1.7;margin-bottom:22px;">{vak['pillar_intro']}</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <a href="{SIGNUP}" style="background:#3D5A3E;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">{vak['hero_cta']} &#8594;</a>
      <a href="#{anchor}" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Ik ben {html.escape(s)} &#8594;</a>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid-2">
    <div class="card">
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#3D5A3E;margin-bottom:10px;">Voor jou als koper</p>
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:12px;">Wat Bylder voor je doet</h2>
      <ul class="check-list">
        <li><strong>Offerte-check per post.</strong> Upload je {html.escape(s)}-offerte en zie per regel of de prijs marktconform is.</li>
        <li><strong>Prijs-benchmark.</strong> Vergelijk je prijs direct met actuele marktdata &mdash; niet met een gok.</li>
        <li><strong>Neutraal vergelijken.</strong> Beoordelingen van Werkspot, Google en Trustpilot naast elkaar.</li>
        <li><strong>Kortingsvouchers</strong> bij aangesloten bouw- en woonpartners.</li>
      </ul>
      <a href="{SIGNUP}" style="display:inline-block;margin-top:16px;background:#3D5A3E;color:#F5F0E8;padding:11px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Start gratis &#8594;</a>
    </div>
    <div class="card" id="{anchor}">
      <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#B85C38;margin-bottom:10px;">Voor {p}</p>
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:12px;">Claim je gratis profiel</h2>
      <ul class="check-list">
        <li><strong>Geen velden invullen.</strong> Deel je Werkspot-, Google- of websitelink en wij stellen je profiel samen.</li>
        <li><strong>Hoog-intentie kopers.</strong> Nieuwbouw- en verbouwkopers die n&uacute; {html.escape(vak['werk'])} plannen.</li>
        <li><strong>Geen vaste leadkosten.</strong> Geen veiling om dezelfde lead; je betaalt niet per klik.</li>
        <li><strong>Je reviews gebundeld.</strong> Je scores van alle platforms samen &mdash; eerlijk en transparant.</li>
      </ul>
      <a href="{VOORDELEN}/" style="display:inline-block;margin-top:16px;background:#B85C38;color:#F5F0E8;padding:11px 22px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">Voordelen voor {p} &#8594;</a>
    </div>
  </div>

  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 10px;">E&eacute;n {html.escape(s)}, alle beoordelingen op &eacute;&eacute;n plek</h2>
  <p style="font-size:15.5px;color:rgba(61,46,30,0.68);max-width:760px;margin-bottom:8px;">De meeste platforms tonen alleen hun eigen reviews. Bylder bundelt de beoordelingsscores van meerdere onafhankelijke bronnen, zodat je in &eacute;&eacute;n oogopslag ziet hoe een {html.escape(s)} er echt voor staat. Voor de volledige reviews linken we door naar de bron.</p>
  <div class="reviewbar" aria-label="Voorbeeld van gebundelde beoordelingsscores">
    <span>Werkspot &#9733; 4,7 <small>(213)</small></span><span>Google &#9733; 4,5 <small>(88)</small></span><span>Trustpilot &#9733; 4,6 <small>(40)</small></span>
    <small style="align-self:center;color:rgba(61,46,30,0.45);font-size:12px;">voorbeeldweergave</small>
  </div>
  <div class="highlight">Bylder verkoopt geen {html.escape(vak['werk'])} en is geen leadveiling. Daardoor kunnen we onafhankelijk vergelijken &mdash; in jouw belang als koper, en eerlijk voor de vakman.</div>

  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">Wat kost een {html.escape(s)} in 2026? Marktprijzen</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">Indicatieve bandbreedtes per werksoort (laag&ndash;hoog), NL 2026. Inclusief materiaal en arbeid, exclusief btw en voorrijkosten.</p>
  <table class="ptable"><thead><tr><th>Werksoort</th><th>Prijs</th></tr></thead><tbody>{rows}</tbody></table>
  <h3 style="font-size:1.2rem;font-weight:700;margin:28px 0 10px;">Wat bepaalt de prijs?</h3>
  <ul class="check-list">{factoren}</ul>

  {klus_calculator(vak)}

  <div style="background:#3D5A3E;border-radius:20px;padding:42px;text-align:center;margin:44px 0;">
    <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">Bylder Prijs-benchmark</p>
    <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Betaal jij een eerlijke prijs voor je {html.escape(vak['werk'])}?</h2>
    <p style="color:rgba(245,240,232,0.72);margin-bottom:24px;max-width:560px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.65;">Vul je geoffreerde prijs in en zie direct of die marktconform is. Met lidmaatschap controleert Bylder je hele offerte automatisch.</p>
    <a href="{SIGNUP}" class="cta-primary">Check je prijs gratis &#8594;</a>
  </div>

  <h2 style="font-size:1.6rem;font-weight:800;margin:8px 0 6px;">Trends in de {html.escape(vak['branche'])}</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;max-width:760px;">Wat er speelt &mdash; en wat het betekent voor jouw prijs en planning.</p>
  <div class="grid-2">{trends}</div>

  {aanbesteding_block(vak)}

  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">Hoogst beoordeelde {p} van Nederland</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;max-width:760px;">Een onafhankelijk, groeiend overzicht van {len(bedrijven)} {html.escape(bedrijf_plur(vak))} &mdash; hier de best beoordeelde. Bekijk je eigen plaats hieronder.</p>
  {highlight_grid}
  {claim_cta(vak)}

  <h2 style="font-size:1.6rem;font-weight:800;margin:48px 0 6px;">{p.capitalize()} per stad</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;">Bekijk de {p}, reviews en marktprijzen voor jouw plaats:</p>
  <div class="grid-3">{stad_tiles}</div>

  <div class="divider"></div>
  {faq_html(vak, qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder lezen: <a href="{vak['ep_link']}">wat kost {vak['werk']}</a> &middot; <a href="/functies/">alle functies van Bylder</a> &middot; <a href="/vouchers/">kortingsvouchers</a></p>
  </div></main>"""
    return head(title, desc, canonical, schema) + body + FOOTER(vak)


def build_voor_vakbedrijven(totaal, plaatsen):
    vak = {"sing": "vakbedrijf"}  # alleen voor FOOTER-tekst
    canonical = f"{BASE}{VOORDELEN}/"
    title = "Voor vakbedrijven: sta waar kopers je zoeken — eenmalig €79 | Bylder"
    desc = ("Stukadoors, schilders, installateurs en andere vakbedrijven: activeer je Bylder-profiel voor eenmalig €79. "
            "Geen abonnement, geen leadveiling. Gekoppeld aan nieuwbouw- en verbouwkopers op het juiste moment.")
    qa = [
        ("Wat kost een profiel op Bylder?", "Vermelding is gratis &mdash; veel bedrijven staan er al in. Je profiel <strong>activeren</strong> kost eenmalig &euro;79. Geen abonnement en geen terugkerende leadkosten."),
        ("Wat is het verschil met Werkspot of een leadplatform?", "Bij leadplatforms betaal je per lead of per maand en bied je mee op dezelfde aanvraag. Bij Bylder betaal je &eacute;&eacute;n keer &euro;79 voor een geactiveerd profiel &mdash; en wij tonen je neutraal, met je beoordelingen uit meerdere bronnen naast elkaar."),
        ("Hoe meld ik mijn bedrijf aan?", "Je deelt je Google-, Werkspot- of websitelink en wij stellen je profiel samen &mdash; geen formulieren. Daarna activeer je het en ben je vindbaar voor kopers in jouw plaats."),
        ("Voor welke vakbedrijven is dit?", "We starten met stukadoors en schilders en breiden uit naar tegelzetters, installateurs, dakdekkers en alle andere bouw- en afbouwvakken."),
        ("Krijg ik leads?", "Je wordt gekoppeld aan nieuwbouw- en verbouwkopers in jouw regio op het moment dat zij jouw vak plannen &mdash; via hun project in de Bylder-app. Geen koude leads, geen veiling."),
    ]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Voor vakbedrijven", canonical)]),
              {"@context": "https://schema.org", "@type": "Service", "serviceType": "Vakbedrijf-profiel en leadkoppeling",
               "areaServed": {"@type": "Country", "name": "Nederland"}, "provider": {"@type": "Organization", "name": "Bylder.com", "url": BASE + "/"},
               "offers": {"@type": "Offer", "price": "79", "priceCurrency": "EUR", "description": "Eenmalige activering van een vakbedrijf-profiel, geen abonnement."}}]
    voordelen = [
        ("Geverifieerd profiel + badge", "Een geclaimd, geverifieerd profiel valt op en wekt vertrouwen bij kopers."),
        ("Hoger in je plaats", "Geactiveerde bedrijven staan bovenaan op de stad-pagina van jouw plaats."),
        ("Beheer je eigen profiel", "Pas je gegevens, diensten en foto's zelf aan &mdash; altijd actueel."),
        ("Reviews gebundeld", "Je scores van Google, Werkspot en Trustpilot naast elkaar &mdash; eerlijk en compleet."),
        ("Gekoppeld aan kopers-projecten", "Word getoond aan kopers in jouw regio op het moment dat zij jouw vak plannen."),
        ("Geen terugkerende leadkosten", "Eenmalig &euro;79. Geen abonnement, geen veiling, geen kosten per lead."),
    ]
    vgrid = "".join(f'<div class="card"><div style="width:28px;height:4px;border-radius:2px;background:#3D5A3E;margin-bottom:12px;"></div>'
        f'<div style="font-weight:700;font-size:15px;color:#1A1208;margin-bottom:4px;">{t}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.66);line-height:1.6;">{d}</div></div>' for t, d in voordelen)
    stappen = [("1", "Deel je link", "Stuur je Google-, Werkspot- of websitelink &mdash; geen formulieren."),
               ("2", "Wij vullen je profiel", "Bylder stelt je profiel samen met je gegevens en gebundelde reviews."),
               ("3", "Activeer voor &euro;79", "Eenmalig betalen en je bent live, hoger vindbaar en gekoppeld aan kopers.")]
    sgrid = "".join(f'<div style="flex:1;min-width:220px;"><div style="width:38px;height:38px;border-radius:10px;background:#3D5A3E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;font-weight:800;font-family:\'Space Mono\',monospace;">{n}</div>'
        f'<div style="font-weight:700;font-size:15px;color:#1A1208;margin:12px 0 4px;">{t}</div>'
        f'<div style="font-size:13.5px;color:rgba(61,46,30,0.66);line-height:1.6;">{d}</div></div>' for n, t, d in stappen)
    body = f"""<main style="padding:56px 0 20px;"><div class="container" style="max-width:1000px;">
  <div style="max-width:760px;">
    <div class="badge">Voor vakbedrijven</div>
    <h1 style="font-size:2.6rem;font-weight:800;line-height:1.12;margin-bottom:14px;">Sta waar kopers je zoeken &mdash; voor eenmalig &euro;79</h1>
    <p style="font-size:1.15rem;color:rgba(61,46,30,0.7);line-height:1.7;margin-bottom:14px;">Bylder helpt nieuwbouw- en verbouwkopers een eerlijke prijs te betalen &mdash; en koppelt ze aan vakbedrijven in hun plaats. Je staat er waarschijnlijk al tussen: <strong>{format(totaal, ",d").replace(",", ".")} vakbedrijven over {plaatsen} plaatsen</strong>. Activeer je profiel en word geverifieerd, beter vindbaar en gekoppeld aan kopers.</p>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;">
      <a href="{INTAKE}" style="background:#B85C38;color:#F5F0E8;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Meld je bedrijf aan &#8594;</a>
      <a href="#hoe" style="background:#fff;border:1px solid rgba(61,46,30,0.15);color:#1A1208;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">Hoe werkt het?</a>
    </div>
  </div>
  <div class="divider"></div>
  <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:6px;">Wat je krijgt voor &euro;79</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:18px;">Eenmalig. Geen abonnement, geen leadkosten.</p>
  <div class="grid-3">{vgrid}</div>
  <h2 id="hoe" style="font-size:1.6rem;font-weight:800;margin:48px 0 18px;">Zo werkt het</h2>
  <div style="display:flex;flex-wrap:wrap;gap:28px;">{sgrid}</div>
  <div style="background:rgba(61,90,62,0.06);border:1px solid rgba(61,90,62,0.18);border-radius:16px;padding:26px;margin:44px 0;">
    <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:14px;">Bylder vs. een leadplatform</h2>
    <div class="grid-2" style="gap:16px;">
      <div><div style="font-weight:700;color:#3D5A3E;margin-bottom:6px;">Bylder</div><ul class="check-list"><li>Eenmalig &euro;79 &mdash; geen abonnement</li><li>Geen kosten per lead, geen veiling</li><li>Neutraal getoond, reviews uit meerdere bronnen</li><li>Gekoppeld aan het project van de koper</li></ul></div>
      <div><div style="font-weight:700;color:rgba(61,46,30,0.5);margin-bottom:6px;">Leadplatform</div><ul style="list-style:none;display:flex;flex-direction:column;gap:10px;font-size:15px;color:rgba(61,46,30,0.6);"><li>&times; Maandlasten of kosten per lead</li><li>&times; Meebieden op dezelfde aanvraag</li><li>&times; Alleen hun eigen reviews</li><li>&times; Koude leads</li></ul></div>
    </div>
  </div>
  <div style="background:#3D5A3E;border-radius:20px;padding:42px;text-align:center;margin:40px 0;">
    <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:10px;">Klaar om erbij te staan?</h2>
    <p style="color:rgba(245,240,232,0.72);margin-bottom:24px;max-width:520px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.6;">Deel je Google-, Werkspot- of websitelink. Wij stellen je profiel samen en je activeert het voor eenmalig &euro;79.</p>
    <a href="{INTAKE}" class="cta-primary">Meld je bedrijf aan &#8594;</a>
  </div>
  <div class="divider"></div>
  {faq_html({"plur": "vakbedrijven"}, qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Bekijk een voorbeeld: <a href="/stukadoor/">stukadoors</a> &middot; <a href="/schilder/">schilders</a>. Vragen? <a href="mailto:info@bylder.com">info@bylder.com</a></p>
  </div></main>"""
    return head(title, desc, canonical, schema) + body + FOOTER(vak)


def assign_profiel_slugs(vak_slug, bedrijven):
    """Geef elk bedrijf een nette, unieke profiel-URL onder /[vak]/bedrijf/[slug]/.
    De DB-slug bevat al een vak-prefix (en bij Places een pid-suffix) → die strippen
    we voor een schone URL; bij (zeldzame) botsing een teller eraan."""
    used = set()
    for b in bedrijven:
        raw = b.get("slug") or _slug(b.get("naam") or "")
        ps = re.sub(rf"^{re.escape(vak_slug)}-", "", raw) or _slug(b.get("naam") or "bedrijf")
        if ps in used:
            i = 2
            while f"{ps}-{i}" in used: i += 1
            ps = f"{ps}-{i}"
        used.add(ps)
        b["_profiel_slug"] = ps
        b["_profiel_url"] = f"/{vak_slug}/bedrijf/{ps}/"


def profiel_indexeerbaar(b):
    """Profielen mogen weer de index in. Poort: een rating met minstens 5 reviews.

    TERUGGEDRAAID OP 21 AUG 2026, EN WAAROM.
    Op 31 juli zette ik deze poort op "alleen geclaimde profielen", op grond van een
    meting die zei: 8 impressies en 0 klikken in een maand. Die meting was fout. Het
    script schreef nul van de 25.698 bedrijven een impressiecijfer toe — het leverde
    niets op, en ik las een lege uitvoer als een leeg resultaat.

    De Search Console-export van 21 augustus zegt over 20 mei t/m 19 augustus:

        bedrijfsprofielen   402 klikken   91.462 impressies   CTR 0,73%
        stad-pagina's       190 klikken   66.808 impressies   CTR 0,28%

    De profielen zijn 43% van al het siteverkeer en presteren twee keer beter dan de
    stadpagina's, met posities in de top tien. De noindex begon al te bijten: 150
    klikken in de week van 6 augustus, 110 in de week van 13 augustus.

    De duplicatie-theorie klopte dus niet. Zij voorspelde dat deze pagina's geen
    verkeer zouden krijgen; ze zijn de best presterende laag van de site, en terwijl
    ze geïndexeerd stonden vertienvoudigde het verkeer (week 30: 33 klikken, week 33:
    266).

    Wat blijft staan is de tekstkwaliteit — 67-70% duplicatie is echt gemeten. Dat is
    een reden om de profielen beter te maken, niet om ze te verbergen.
    """
    if b.get("status") == "lid":
        return True
    return bool(b.get("google_rating")) and (b.get("google_reviews") or 0) >= 5


def build_profile(vak, vak_slug, b, buren):
    s, p = vak["sing"], vak["plur"]
    naam = html.escape(b["naam"]); stad = b.get("stad") or "Nederland"; stad_e = html.escape(stad)
    base = f"/{vak_slug}"; canonical = f"{BASE}{base}/bedrijf/{b['_profiel_slug']}/"
    rating = b.get("google_rating"); reviews = b.get("google_reviews") or 0
    site = b.get("website"); tel = b.get("telefoon"); maps = maps_url(b)
    prijs = b.get("price_level"); summary = (b.get("google_summary") or "").strip(); lid = b.get("status") == "lid"
    has_stad = bool(b.get("stad"))

    title = f"{b['naam']} — {s} in {stad} | reviews, prijzen & offerte-check | Bylder"
    diensten = [str(x) for x in (b.get("diensten") or [])]
    keurmerken = [str(x) for x in (b.get("keurmerken") or [])]
    werkgebied = [str(x) for x in (b.get("werkgebied") or [])]
    opgericht = b.get("opgericht")

    desc = (f"{b['naam']}, {s} in {stad}. "
            + (f"Beoordeling {str(rating).replace('.', ',')}★ ({reviews} reviews). " if rating else "")
            + (f"Doet o.a. {' en '.join(d.lower().split(' / ')[0] for d in diensten[:2])}. " if diensten else "")
            + f"Bekijk gegevens en gebundelde reviews, en check gratis of je {vak['werk']}-offerte een eerlijke prijs heeft.")

    # LocalBusiness ZONDER aggregateRating: Google's structured-data-beleid staat geen
    # geaggregeerde reviewscores van een ánder platform toe als eigen rich-result.
    lb = {"@context": "https://schema.org", "@type": "LocalBusiness", "name": b["naam"],
          "address": {"@type": "PostalAddress", "addressLocality": stad, "addressCountry": "NL"}, "areaServed": stad}
    if site: lb["url"] = site
    if tel: lb["telephone"] = tel
    # Zelfgerapporteerd (eigen website van het bedrijf) — feitelijke velden, geen oordeel.
    if diensten: lb["knowsAbout"] = diensten
    if opgericht: lb["foundingDate"] = str(opgericht)
    if werkgebied: lb["areaServed"] = sorted({stad} | {w.title() for w in werkgebied})
    band = vak["prijs_band"].split(":", 1)[-1].strip() if ":" in vak["prijs_band"] else vak["prijs_band"]
    qa = [
        (f"Wat kost {b['naam']}?",
         f"Een exacte prijs hangt af van je klus en afwerking. Indicatief voor {vak['werk']} (NL 2026): {band} "
         f"Vraag {b['naam']} om een gespecificeerde offerte per werksoort en check gratis op Bylder of die marktconform is."),
        (f"Hoe vraag ik een offerte aan bij {b['naam']}?",
         (f"Neem rechtstreeks contact op via de website of telefoon. " if (site or tel) else "")
         + f"Of vraag via Bylder in &eacute;&eacute;n keer voorstellen van meerdere {p}{' in ' + stad_e if has_stad else ''} &mdash; je vergelijkt de prijzen direct naast de marktbandbreedte."),
        (f"Is {b['naam']} een goede {s}?",
         f"Bekijk de beoordelingen van {b['naam']} uit meerdere bronnen naast elkaar in plaats van &eacute;&eacute;n platform. "
         f"Bylder toont {p} neutraal en linkt door naar de volledige reviews bij de bron, zodat je zelf een eerlijk beeld vormt."),
    ]
    crumb = [("Bylder.com", BASE + "/"), (s.capitalize(), f"{BASE}{base}/")]
    if has_stad: crumb.append((stad, f"{BASE}{base}/{_slug(stad)}/"))
    crumb.append((b["naam"], canonical))
    schema = [lb, faq_schema(qa), breadcrumb(crumb)]

    # ── header ──
    badge = '<span style="font-size:11px;font-weight:800;color:#3D5A3E;background:rgba(61,90,62,0.12);padding:3px 10px;border-radius:999px;">&#10003; Geverifieerd</span>' if lid else ""
    rating_row = ""
    if rating:
        bron = f'<a href="{html.escape(maps)}" target="_blank" rel="nofollow noopener" style="color:#3D5A3E;font-weight:600;">bekijk op Google &#8594;</a>' if maps else "op Google"
        rating_row = (f'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;">'
                      f'<span style="font-size:15px;font-weight:800;color:#1A1208;">&#9733; {str(rating).replace(".", ",")}</span>'
                      f'<span style="font-size:13px;color:rgba(61,46,30,0.6);">{reviews} beoordelingen {bron}</span></div>')
    prijs_chip = f'<span style="font-size:12px;font-weight:700;color:rgba(61,46,30,0.6);background:#F5F0E8;padding:3px 10px;border-radius:6px;">Prijsniveau {prijs}</span>' if prijs else ""
    summary_html = (f'<p style="font-size:14px;color:rgba(61,46,30,0.7);line-height:1.65;margin-top:12px;max-width:640px;">'
                    f'{html.escape(summary[:180])} <span style="font-size:11px;color:rgba(61,46,30,0.4);">&mdash; bron: Google</span></p>') if summary else ""
    # ── eigen inhoud, van de eigen site van het bedrijf ──
    # Bewust met bronvermelding "volgens de eigen website": dit is wat het bedrijf
    # over zichzelf zegt, geen oordeel van Bylder. E-mail wordt hier NOOIT getoond
    # — die is voor de claim-flow, niet voor oogst door spammers.
    vr = []
    if diensten:
        chips = "".join(f'<span style="font-size:12px;font-weight:600;color:#3D5A3E;background:rgba(61,90,62,0.08);padding:4px 12px;border-radius:999px;">{html.escape(d)}</span>' for d in diensten[:6])
        vr.append(f'<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;">{chips}</div>')
    detail = []
    if keurmerken:
        detail.append("Vermeldt " + " en ".join(html.escape(k) for k in keurmerken[:3]))
    if opgericht:
        detail.append(f"actief sinds {opgericht}")
    if werkgebied:
        wg = ", ".join(html.escape(w.title()) for w in werkgebied[:6])
        detail.append(f"werkzaam in o.a. {wg}")
    if detail:
        zin = detail[0][0].upper() + detail[0][1:] + ("" if len(detail) == 1 else " &middot; " + " &middot; ".join(detail[1:]))
        vr.append(f'<p style="font-size:13px;color:rgba(61,46,30,0.6);margin-top:10px;">{zin} <span style="font-size:11px;color:rgba(61,46,30,0.4);">&mdash; volgens de eigen website</span></p>')
    verrijking_html = "".join(vr)

    contact = []
    if site: contact.append(f'<a href="{html.escape(site)}" target="_blank" rel="nofollow noopener" style="font-weight:700;">Website &#8594;</a>')
    if tel: contact.append(f'<a href="tel:{html.escape(re.sub(chr(92)+"s+", "", tel))}" style="font-weight:700;">{html.escape(tel)}</a>')
    if maps: contact.append(f'<a href="{html.escape(maps)}" target="_blank" rel="nofollow noopener" style="color:rgba(61,46,30,0.6);">Route &#8594;</a>')
    contact_html = f'<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:14px;font-size:14px;">{"".join(contact)}</div>' if contact else ""

    # ── buren (interne links) ──
    buren_html = ""
    if buren:
        tiles = "".join(
            f'<a href="{x["_profiel_url"]}" class="tile">{html.escape(x["naam"])}'
            + (f' <span style="color:rgba(61,46,30,0.4);font-weight:400;">&#9733; {str(x.get("google_rating")).replace(".", ",")}</span>' if x.get("google_rating") else "")
            + "</a>" for x in buren)
        buren_html = (f'<h2 style="font-size:1.4rem;font-weight:800;margin:40px 0 6px;">Andere {p} in {stad_e}</h2>'
                      f'<p style="font-size:14px;color:rgba(61,46,30,0.6);margin-bottom:14px;">Vergelijk gerust meerdere {p} &mdash; pr&iuml;s en aanpak verschillen sterk. '
                      f'<a href="{base}/{_slug(stad)}/">Bekijk alle {p} in {stad_e} &#8594;</a></p>'
                      f'<div class="grid-3">{tiles}</div>')

    breadcrumb_html = " &rarr; ".join(
        [f'<a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a>',
         f'<a href="{base}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">{s.capitalize()}</a>']
        + ([f'<a href="{base}/{_slug(stad)}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">{stad_e}</a>'] if has_stad else [])
        + [f'<span style="color:rgba(61,46,30,0.6);">{naam}</span>'])

    body = f"""<main style="padding:40px 0 20px;"><div class="container" style="max-width:920px;">
  <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:18px;">{breadcrumb_html}</p>
  <div class="card" style="padding:26px 28px;">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <h1 style="font-size:2rem;font-weight:800;line-height:1.15;">{naam}</h1>{badge}
    </div>
    <div style="font-size:15px;color:rgba(61,46,30,0.6);margin-top:6px;">{s.capitalize()} in {stad_e}</div>
    {rating_row}
    <div style="margin-top:10px;">{prijs_chip}</div>
    {summary_html}
    {verrijking_html}
    {contact_html}
  </div>

  <div class="highlight" style="margin-top:20px;">Bylder toont {p} <strong>neutraal</strong> en verkoopt zelf geen {vak['werk']}. We bundelen beoordelingsscores uit meerdere bronnen en linken door naar de volledige reviews bij de bron &mdash; zodat je een eerlijk beeld krijgt.</div>

  {claim_cta(vak, stad if has_stad else None)}

  <h2 style="font-size:1.5rem;font-weight:800;margin:36px 0 6px;">Wat kost een {s} zoals {naam}?</h2>
  <p style="font-size:15px;color:rgba(61,46,30,0.62);margin-bottom:4px;max-width:680px;">{vak['prijs_band']} Reken zelf een indicatie uit &mdash; en check daarna gratis of je échte offerte marktconform is.</p>
  {klus_calculator(vak)}

  {aanbesteding_block(vak, stad if has_stad else None)}

  {buren_html}

  <div class="divider"></div>
  {faq_html(vak, qa)}
  <div class="divider"></div>
  <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar <a href="{base}/">{p} &amp; marktprijzen</a>{f' &middot; <a href="{base}/{_slug(stad)}/">{p} in {stad_e}</a>' if has_stad else ''} &middot; <a href="{vak['ep_link']}">wat kost {vak['werk']}</a></p>
  </div></main>"""
    robots = "index,follow" if profiel_indexeerbaar(b) else "noindex,follow"
    return head(title, desc, canonical, schema, robots=robots) + body + FOOTER(vak)


def build_sitemap(vak_slug, steden_idx, include_voorvak=False, profiel_urls=None):
    urls = [f"{BASE}/{vak_slug}/"] + ([f"{BASE}{VOORDELEN}/"] if include_voorvak else []) + [f"{BASE}/{vak_slug}/{_slug(s)}/" for s, _ in steden_idx]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n" for u in urls)
    items += "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n" for u in (profiel_urls or []))
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)


def genereer_vak(vak_slug, primary=False):
    vak = VAKKEN[vak_slug]
    bedrijven = load_vakbedrijven(vak_slug)
    assign_profiel_slugs(vak_slug, bedrijven)          # vóór de build → kaarten linken naar profiel
    groepen = per_stad(bedrijven)
    steden_idx = sorted([(s, l) for s, l in groepen.items() if len(l) >= MIN_PER_STAD], key=lambda x: (-len(x[1]), x[0]))
    write(f"{vak_slug}/index.html", build_pillar(vak, vak_slug, bedrijven, steden_idx))
    for stad, lokaal in steden_idx:
        write(f"{vak_slug}/{_slug(stad)}/index.html", build_city_page(vak, vak_slug, stad, lokaal))
    # bedrijfsprofielen (alle bedrijven krijgen een pagina; alleen sterke profielen → index + sitemap)
    profiel_urls, n_idx = [], 0
    for b in bedrijven:
        buren = [x for x in groepen.get(b.get("stad") or "", []) if x is not b][:6]
        write(f"{vak_slug}/bedrijf/{b['_profiel_slug']}/index.html", build_profile(vak, vak_slug, b, buren))
        if profiel_indexeerbaar(b):
            profiel_urls.append(f"{BASE}{b['_profiel_url']}"); n_idx += 1
    write(f"{vak_slug}-sitemap.xml", build_sitemap(vak_slug, steden_idx, include_voorvak=primary, profiel_urls=profiel_urls))
    print(f"  ✓ {vak_slug}: pillar + {len(steden_idx)} stad-pagina's + {len(bedrijven)} profielen ({n_idx} indexeerbaar)")
    return len(bedrijven), len(groepen)


if __name__ == "__main__":
    targets = [a for a in sys.argv[1:] if a in VAKKEN] or list(VAKKEN.keys())
    print("Vakpillars genereren…")
    totaal_alle, plaatsen_set = 0, set()
    for i, vs in enumerate(targets):
        n, _ = genereer_vak(vs, primary=(i == 0))
        totaal_alle += n
    # gedeelde voor-vakbedrijven o.b.v. álle vakbedrijven
    alle = json.load(open(os.path.join(ROOT, "data", "vakbedrijven.json"), encoding="utf-8")).get("vakbedrijven", [])
    plaatsen = len({b.get("stad") for b in alle if b.get("stad")})
    write("voor-vakbedrijven/index.html", build_voor_vakbedrijven(len(alle), plaatsen))
    print(f"  ✓ voor-vakbedrijven ({len(alle)} vakbedrijven totaal)")
    print("Klaar.")
