#!/usr/bin/env python3
"""
Content-hub rondom bouwvergunningen (NL). Pillar + project-spokes + proces-spokes,
volledig geoptimaliseerd (SEO/GEO/AEO/schema/CRO/a11y/CWV). Funnel: gratis account /
kopersbegeleiding voor wie (ver)bouwt. Standaard Bylder-nav (inline-CSS).

Correctheid (E-E-A-T): Omgevingswet sinds 1-1-2024; vergunningvrij = onder voorwaarden;
altijd vergunningcheck in het Omgevingsloket; gemeente/omgevingsplan kan afwijken;
vergunningvrij ≠ regelvrij (Bbl). Informatief, geen juridisch advies.

Gebruik: python3 generate_bouwvergunning.py
"""
import os, html, json

BASE = "https://www.bylder.com"
HUB = "/bouwvergunning"
SIGNUP = "https://app.bylder.com/registreer"
LOKET = "https://omgevingsloket.nl"
ROOT = os.path.dirname(os.path.abspath(__file__))

CAVEAT = ("Let op: sinds de Omgevingswet (1 januari 2024) vraag je dit aan als omgevingsvergunning. "
          "Of iets vergunningvrij is, hangt af van je specifieke situatie en het omgevingsplan van je gemeente. "
          "Doe daarom altijd eerst de gratis vergunningcheck in het Omgevingsloket. Bij een monument of beschermd "
          "stads- of dorpsgezicht gelden striktere regels. En let op: vergunningvrij is niet regelvrij — je moet nog "
          "steeds voldoen aan de bouwtechnische eisen (Besluit bouwwerken leefomgeving).")

# ── Project-spokes: "heb ik een vergunning nodig voor een [X]?" ───────────────
PROJECTS = [
    {"key": "dakkapel", "label": "Dakkapel", "tagline": "Meer ruimte en licht op zolder",
     "intro": "Een dakkapel geeft je zolder meer hoofdruimte en daglicht. Of je een omgevingsvergunning nodig hebt, hangt vooral af van op wélk dakvlak de dakkapel komt.",
     "vrij": ["Op het achterdakvlak of een naar het achtererf gekeerd zijdakvlak is een dakkapel vaak vergunningvrij, mits aan de voorwaarden voor hoogte, breedte en afstand tot de dakranden wordt voldaan.",
              "De dakkapel moet voorzien van een plat dak en netjes onder de nok blijven.",
              "Niet bij een monument of in een beschermd stads- of dorpsgezicht."],
     "wel": ["Een dakkapel aan de voorkant (voordakvlak) is vrijwel altijd vergunningplichtig.",
             "Afwijkende afmetingen of plaatsing buiten de standaardvoorwaarden.",
             "Monumenten en beschermde gezichten."],
     "kosten": "Reken naast de bouwkosten op leges (gemeentelijke kosten) als je wél een vergunning nodig hebt — die verschillen per gemeente en zijn vaak een percentage van de bouwsom.",
     "qa": [("Mag een dakkapel aan de voorkant zonder vergunning?", "Meestal niet. Aan de voorzijde is een dakkapel vrijwel altijd vergunningplichtig; aan de achterkant kan het vaak vergunningvrij, onder voorwaarden."),
            ("Mag mijn buurman bezwaar maken tegen mijn dakkapel?", "Bij een vergunningvrije dakkapel niet via de vergunning. Is er wél een vergunning nodig, dan kunnen belanghebbenden bezwaar maken nadat de vergunning is verleend.")]},
    {"key": "aanbouw", "label": "Aanbouw", "tagline": "Extra ruimte aan je woning",
     "intro": "Een aanbouw (bijbehorend bouwwerk aan de woning, bijvoorbeeld een uitgebouwde keuken of kamer) is in het achtererfgebied vaak vergunningvrij — binnen grenzen.",
     "vrij": ["In het achtererfgebied vaak vergunningvrij tot een bepaalde diepte en oppervlakte, afhankelijk van de grootte van je perceel.",
              "Maximale hoogte en afstand tot de erfgrens volgens de landelijke voorwaarden.",
              "Past binnen het omgevingsplan van je gemeente."],
     "wel": ["Aan de voorkant of zijkant die naar openbaar gebied is gekeerd.",
             "Groter dan de vergunningvrije grenzen, of strijdig met het omgevingsplan.",
             "Monument of beschermd gezicht."],
     "kosten": "Een aanbouw verhoogt vaak de WOZ-waarde en de woningwaarde. Bij vergunningplicht betaal je leges bovenop de bouwkosten.",
     "qa": [("Hoe groot mag een aanbouw vergunningvrij zijn?", "Dat hangt af van je perceelgrootte en de landelijke voorwaarden voor het achtererfgebied. Doe de vergunningcheck om je exacte ruimte te bepalen."),
            ("Telt een aanbouw mee voor de woningwaarde?", "Ja, extra woonoppervlak verhoogt doorgaans de waarde — mits netjes en (indien nodig) vergund uitgevoerd.")]},
    {"key": "uitbouw", "label": "Uitbouw", "tagline": "Je woonruimte vergroten",
     "intro": "Een uitbouw vergroot je bestaande ruimte, meestal aan de achterzijde. De regels lijken sterk op die van een aanbouw: in het achtererfgebied vaak vergunningvrij, binnen grenzen.",
     "vrij": ["Achtererfgebied, binnen de maximale diepte/oppervlakte voor jouw perceel.",
              "Binnen de hoogte- en afstandsvoorwaarden.",
              "Niet strijdig met het omgevingsplan; geen monument/beschermd gezicht."],
     "wel": ["Aan de voorkant of naar openbaar gebied gekeerde zijkant.",
             "Boven de vergunningvrije grenzen.",
             "Afwijking van het omgevingsplan."],
     "kosten": "Bij vergunningplicht gelden leges; een goede offerte-check voorkomt dat je te veel betaalt aan de aannemer.",
     "qa": [("Wat is het verschil tussen aanbouw en uitbouw?", "In de praktijk worden ze door elkaar gebruikt. Een uitbouw vergroot meestal een bestaande ruimte; een aanbouw voegt een nieuwe ruimte toe. De vergunningregels zijn vergelijkbaar."),
            ("Heb ik een constructieberekening nodig?", "Vaak wel, ook bij vergunningvrij bouwen, omdat je aan de bouwtechnische eisen (Bbl) moet voldoen. Je aannemer of constructeur regelt dit.")]},
    {"key": "dakopbouw", "label": "Dakopbouw", "tagline": "Een extra verdieping",
     "intro": "Een dakopbouw (een extra bouwlaag of het optoppen van het dak) verandert de hoogte en het silhouet van je woning. Dit is vrijwel altijd vergunningplichtig.",
     "vrij": ["Zelden vergunningvrij — een dakopbouw raakt de hoogte en het straatbeeld."],
     "wel": ["Vrijwel altijd een omgevingsvergunning nodig.",
             "Toetsing aan het omgevingsplan (maximale bouwhoogte) en vaak welstand.",
             "Constructieve toets is essentieel."],
     "kosten": "Naast de bouwkosten betaal je leges. Houd rekening met een uitgebreidere procedure bij afwijking van het omgevingsplan.",
     "qa": [("Is een dakopbouw ooit vergunningvrij?", "In de praktijk zelden. Omdat de bouwhoogte en het aanzicht veranderen, is bijna altijd een omgevingsvergunning vereist."),
            ("Moet ik mijn buren informeren?", "Verstandig wel. Bij een vergunning kunnen omwonenden bezwaar maken; vroeg overleg voorkomt verrassingen.")]},
    {"key": "schuur-tuinhuis", "label": "Schuur of tuinhuis", "tagline": "Bijgebouw in de tuin",
     "intro": "Een schuur, tuinhuis of ander bijgebouw in het achtererfgebied is vaak vergunningvrij te plaatsen — zolang je binnen de voorwaarden voor oppervlakte en hoogte blijft.",
     "vrij": ["In het achtererfgebied, binnen de toegestane oppervlakte (afhankelijk van je perceel) en maximale hoogte.",
              "Op voldoende afstand van de erfgrens volgens de voorwaarden.",
              "Niet bedoeld voor bewoning; past in het omgevingsplan."],
     "wel": ["Voor de voorgevelrooilijn of naar openbaar gebied gekeerd.",
             "Groter/hoger dan toegestaan, of bedoeld als verblijfsruimte.",
             "Monument of beschermd gezicht."],
     "kosten": "Een vergunningvrij tuinhuis bespaart leges; een grotere of bewoonbare variant kan vergunningplichtig zijn.",
     "qa": [("Hoeveel m² schuur mag ik vergunningvrij bouwen?", "Dat hangt af van de grootte van je achtererf. Er geldt een staffel; de vergunningcheck rekent het voor jouw perceel uit."),
            ("Mag ik in een tuinhuis (laten) wonen?", "Nee, een vergunningvrij bijgebouw is niet bedoeld als zelfstandige woonruimte. Bewoning vraagt aparte toestemming.")]},
    {"key": "garage", "label": "Garage", "tagline": "Aangebouwd of vrijstaand",
     "intro": "Een garage kan vergunningvrij zijn als ze als bijbehorend bouwwerk in het achtererfgebied past, maar een garage aan de voorzijde of bij de oprit is meestal vergunningplichtig.",
     "vrij": ["Vrijstaande of aangebouwde garage in het achtererfgebied, binnen de oppervlakte- en hoogtevoorwaarden.",
              "Past binnen het omgevingsplan."],
     "wel": ["Garage aan de voorkant of naast de woning richting de straat.",
             "Boven de vergunningvrije grenzen.",
             "Wijziging van een inrit/uitrit vraagt vaak een aparte toestemming van de gemeente."],
     "kosten": "Reken op leges bij vergunningplicht, plus eventueel kosten voor een nieuwe inrit.",
     "qa": [("Heb ik een vergunning nodig voor een inrit?", "Het aanleggen of verbreden van een inrit/uitrit vraagt meestal toestemming van de gemeente, los van de garage zelf."),
            ("Mag ik mijn garage ombouwen tot kamer?", "Inwendig verbouwen is vaak vergunningvrij, maar het wijzigen van de gevel (bijv. de garagedeur vervangen door een raam) kan vergunningplichtig zijn.")]},
    {"key": "carport", "label": "Carport", "tagline": "Overdekte parkeerplek",
     "intro": "Een carport is een open overkapping voor je auto. In het achtererfgebied vaak vergunningvrij; aan de voorkant meestal niet.",
     "vrij": ["In het achtererfgebied, binnen de voorwaarden voor oppervlakte en hoogte.",
              "Open constructie, passend in het omgevingsplan."],
     "wel": ["Voor de voorgevelrooilijn (vaak het geval bij een carport bij de oprit).",
             "Boven de vergunningvrije grenzen of bij een monument/beschermd gezicht."],
     "kosten": "Een vergunningvrije carport scheelt leges; aan de voorzijde reken je op een vergunningprocedure.",
     "qa": [("Mag een carport aan de voorkant zonder vergunning?", "Meestal niet — de voorzijde valt buiten het achtererfgebied, dus daar is doorgaans een vergunning nodig."),
            ("Is een carport hetzelfde als een overkapping?", "Een carport is een overkapping specifiek voor een auto. De vergunningregels zijn vergelijkbaar met die van een overkapping.")]},
    {"key": "overkapping", "label": "Overkapping of veranda", "tagline": "Beschut buiten zitten",
     "intro": "Een overkapping of veranda tegen de woning of in de tuin is in het achtererfgebied vaak vergunningvrij, binnen de bekende voorwaarden.",
     "vrij": ["Achtererfgebied, binnen oppervlakte- en hoogtegrenzen.",
              "Open of half-open constructie die past in het omgevingsplan."],
     "wel": ["Aan de voorkant of naar openbaar gebied gekeerd.",
             "Te groot/hoog, of dichtgebouwd tot serre (dan gelden andere regels).",
             "Monument of beschermd gezicht."],
     "kosten": "Vergunningvrij = geen leges. Een dichte serre kan wél vergunningplichtig zijn.",
     "qa": [("Wanneer wordt een overkapping een serre?", "Zodra je hem (deels) dichtmaakt met wanden/glas ontstaat een serre, waarvoor andere — en vaker vergunningplichtige — regels gelden."),
            ("Mag een overkapping tegen de schutting van de buren?", "Op de erfgrens gelden afstands- en hoogtevoorwaarden. Overleg met je buren en check je situatie.")]},
    {"key": "zonnepanelen", "label": "Zonnepanelen", "tagline": "Duurzaam opwekken",
     "intro": "Zonnepanelen op je dak zijn in veruit de meeste gevallen vergunningvrij. Bij monumenten en beschermde gezichten gelden uitzonderingen.",
     "vrij": ["Op een schuin dak in of direct op het dakvlak, in dezelfde hellingshoek.",
              "Op een plat dak binnen de afstands- en hoogtevoorwaarden.",
              "Op een gewone (niet-monumentale) woning."],
     "wel": ["Monumenten en panden in een beschermd stads- of dorpsgezicht.",
             "Afwijkende plaatsing (bijv. ver buiten het dakvlak) of veldopstellingen."],
     "kosten": "Geen leges bij vergunningvrij plaatsen. Houd rekening met eventuele eisen van de netbeheerder bij teruglevering.",
     "qa": [("Heb ik een vergunning nodig voor zonnepanelen?", "Meestal niet — op een normale woning zijn dakpanelen doorgaans vergunningvrij. Bij een monument of beschermd gezicht wel checken."),
            ("Gelden er regels voor zonnepanelen op een plat dak?", "Ja, dan gelden voorwaarden voor de afstand tot de dakrand en de hoogte. Binnen die voorwaarden meestal vergunningvrij.")]},
    {"key": "dakraam", "label": "Dakraam", "tagline": "Daglicht op zolder",
     "intro": "Een dakraam (velux) plaatsen is vaak vergunningvrij, zeker op het achterdakvlak. Aan de voorkant of bij een monument kan het anders liggen.",
     "vrij": ["Een dakraam dat in het dakvlak blijft en aan de voorwaarden voldoet, is doorgaans vergunningvrij.",
              "Op het achterdakvlak vrijwel altijd vrij."],
     "wel": ["Monumenten en beschermde gezichten.",
             "Sterk afwijkende of grote ingrepen in het dakvlak."],
     "kosten": "Vergunningvrij = geen leges; alleen de plaatsingskosten.",
     "qa": [("Is een dakraam hetzelfde als een dakkapel?", "Nee. Een dakraam ligt vlak in het dakvlak; een dakkapel steekt uit het dak. Een dakraam is daardoor vaker vergunningvrij."),
            ("Mag een dakraam aan de voorkant?", "Vaak wel, mits het netjes in het dakvlak blijft. Bij een monument of beschermd gezicht eerst checken.")]},
    {"key": "schutting", "label": "Schutting of erfafscheiding", "tagline": "Privacy in de tuin",
     "intro": "Een schutting of erfafscheiding plaatsen is vaak vergunningvrij, maar er gelden duidelijke hoogtegrenzen die afhangen van de locatie op je perceel.",
     "vrij": ["Achter de voorgevelrooilijn vaak tot 2 meter hoog vergunningvrij.",
              "Aan de voorzijde (naar openbaar gebied) doorgaans tot 1 meter.",
              "Past binnen het omgevingsplan."],
     "wel": ["Hoger dan de toegestane grens.",
             "Monument of beschermd gezicht.",
             "Strijd met het omgevingsplan."],
     "kosten": "Binnen de hoogtegrenzen geen leges. Houd rekening met het burenrecht (plaatsing op of bij de erfgrens).",
     "qa": [("Hoe hoog mag een schutting zijn zonder vergunning?", "Achter de voorgevel vaak tot 2 meter, aan de straatzijde meestal tot 1 meter — onder voorwaarden. Check je situatie."),
            ("Mag een schutting op de erfgrens?", "Dat mag, maar via het burenrecht heeft je buur er ook mee te maken. Overleg voorkomt conflicten.")]},
    {"key": "gevelwijziging", "label": "Gevel wijzigen", "tagline": "Ramen, deuren en aanzicht",
     "intro": "Het wijzigen van de gevel — een raam vergroten, een deur verplaatsen of een pui veranderen — kan vergunningplichtig zijn, omdat het het aanzicht van het pand raakt.",
     "vrij": ["Kleine, niet-zichtbare wijzigingen aan de achterkant zijn soms vergunningvrij.",
              "Onderhoud waarbij niets aan het aanzicht verandert."],
     "wel": ["Wijzigingen aan de voorgevel of het aanzicht.",
             "Monumenten en beschermde gezichten (vrijwel altijd vergunningplichtig).",
             "Constructieve ingrepen (bijv. een muur weghalen voor een grote pui)."],
     "kosten": "Bij vergunningplicht gelden leges en mogelijk een welstandstoets.",
     "qa": [("Mag ik een raam vergroten zonder vergunning?", "Aan de achterkant soms; aan de voorgevel of bij een monument meestal niet. Doe de vergunningcheck."),
            ("Geldt dit ook voor een nieuwe voordeur?", "Vervangen in dezelfde opening is vaak vrij; verplaatsen of het aanzicht wijzigen kan vergunningplichtig zijn.")]},
    {"key": "kozijnen", "label": "Kozijnen vervangen", "tagline": "Isoleren en verduurzamen",
     "intro": "Kozijnen vervangen — bijvoorbeeld voor isolerend glas — is in een gewone woning vaak vergunningvrij, zolang het aanzicht niet wezenlijk verandert.",
     "vrij": ["Vervangen in dezelfde maatvoering en uitstraling, in een niet-monumentale woning.",
              "Verduurzaming (isolatieglas) zonder het aanzicht te wijzigen."],
     "wel": ["Monumenten en beschermde stads- of dorpsgezichten.",
             "Wijziging van indeling, maatvoering of uitstraling van de gevel."],
     "kosten": "Vergunningvrij vervangen scheelt leges. Voor verduurzaming zijn soms subsidies beschikbaar.",
     "qa": [("Mag ik kunststof kozijnen plaatsen in plaats van hout?", "In een gewone woning vaak wel als het aanzicht vergelijkbaar blijft. Bij een monument of beschermd gezicht meestal niet zonder vergunning."),
            ("Krijg ik subsidie voor isolerende kozijnen?", "Voor isolatieglas zijn er regelmatig landelijke of gemeentelijke subsidies. Combineer dit met een goede offerte-check.")]},
    {"key": "mantelzorgwoning", "label": "Mantelzorgwoning", "tagline": "Zorg dichtbij huis",
     "intro": "Een mantelzorgwoning — een (tijdelijke) woonruimte voor zorg aan een naaste — is onder voorwaarden vergunningvrij te realiseren in of bij de woning.",
     "vrij": ["Een mantelzorgwoning in een bestaand bijgebouw of als bijbehorend bouwwerk in het achtererfgebied, binnen de voorwaarden.",
              "Er moet sprake zijn van een aantoonbare mantelzorgbehoefte."],
     "wel": ["Buiten de vergunningvrije grenzen (oppervlakte/hoogte/locatie).",
             "Als de mantelzorgsituatie eindigt en de zelfstandige woonruimte blijft bestaan.",
             "Monument of beschermd gezicht."],
     "kosten": "Vergunningvrij scheelt leges, maar leg de mantelzorgbehoefte goed vast (bijv. een verklaring).",
     "qa": [("Heb ik een vergunning nodig voor een mantelzorgwoning?", "Onder voorwaarden is het vergunningvrij, mits er een mantelzorgbehoefte is en je binnen de grenzen voor bijbehorende bouwwerken blijft."),
            ("Wat gebeurt er als de zorg stopt?", "De zelfstandige woonfunctie moet dan worden beëindigd; anders kan alsnog een vergunning nodig zijn. Leg dit vooraf goed vast.")]},
]

# ── Proces-spokes: uitleg en procedures ──────────────────────────────────────
TOPICS = [
    {"key": "omgevingsvergunning-aanvragen", "label": "Omgevingsvergunning aanvragen", "tagline": "Stap voor stap",
     "intro": "Heb je een vergunning nodig, dan vraag je sinds 2024 een omgevingsvergunning aan via het Omgevingsloket. Zo pak je het aan.",
     "punten": [("Doe eerst de vergunningcheck", "Bepaal in het Omgevingsloket of je plan vergunningplichtig is."),
                ("Verzamel je gegevens", "Tekeningen, foto's, een situatieschets en soms een constructieberekening."),
                ("Dien in via het Omgevingsloket", "Met DigiD (particulier) of eHerkenning (bedrijf)."),
                ("Volg de procedure", "De gemeente beoordeelt en beslist binnen de wettelijke termijn.")],
     "steps": [("Vergunningcheck", "Check in het Omgevingsloket of je een vergunning nodig hebt."),
               ("Aanvraag voorbereiden", "Verzamel tekeningen, situatieschets en eventuele berekeningen."),
               ("Indienen", "Dien de aanvraag in via het Omgevingsloket met DigiD/eHerkenning."),
               ("Besluit", "De gemeente neemt binnen de wettelijke termijn een besluit.")],
     "qa": [("Waar vraag ik een omgevingsvergunning aan?", "Via het landelijke Omgevingsloket (omgevingsloket.nl), met DigiD of eHerkenning."),
            ("Kan ik eerst overleggen met de gemeente?", "Ja, veel gemeenten bieden een vooroverleg of conceptaanvraag aan om je plan af te stemmen.")]},
    {"key": "vergunningvrij-bouwen", "label": "Vergunningvrij bouwen", "tagline": "Wat mag zonder vergunning",
     "intro": "Veel kleinere (ver)bouwingen mogen zonder omgevingsvergunning, mits ze binnen de landelijke voorwaarden vallen. Vergunningvrij is echter niet regelvrij.",
     "punten": [("Vooral in het achtererfgebied", "Aan-/uitbouwen, bijgebouwen, overkappingen: vaak vrij binnen grenzen."),
                ("Voorwaarden gelden altijd", "Oppervlakte, hoogte, afstand tot de erfgrens en plaatsing bepalen of het vrij is."),
                ("Niet bij monumenten", "Monumenten en beschermde gezichten zijn vrijwel altijd vergunningplichtig."),
                ("Bouwtechnische eisen blijven", "Je moet voldoen aan het Besluit bouwwerken leefomgeving (constructie, veiligheid).")],
     "qa": [("Betekent vergunningvrij dat ik alles mag?", "Nee. Je hoeft geen vergunning aan te vragen, maar je moet wel binnen de voorwaarden blijven én voldoen aan de bouwtechnische eisen."),
            ("Hoe weet ik zeker dat mijn plan vergunningvrij is?", "Doe de vergunningcheck in het Omgevingsloket; die toetst jouw specifieke situatie aan de regels en het omgevingsplan.")]},
    {"key": "vergunningcheck", "label": "Vergunningcheck doen", "tagline": "Heb ik een vergunning nodig?",
     "intro": "Met de vergunningcheck in het Omgevingsloket bepaal je in een paar minuten of je plan vergunningvrij of vergunningplichtig is — voor jouw exacte adres.",
     "punten": [("Gratis en online", "De check staat op omgevingsloket.nl."),
                ("Op jouw adres", "De uitkomst houdt rekening met het omgevingsplan van je gemeente."),
                ("Per activiteit", "Bouwen, slopen, kappen of een uitrit aanleggen worden apart getoetst.")],
     "steps": [("Ga naar het Omgevingsloket", "Open de vergunningcheck op omgevingsloket.nl."),
               ("Vul je adres en plan in", "Beschrijf wat je wilt (ver)bouwen."),
               ("Beantwoord de vragen", "De check leidt je langs de relevante voorwaarden."),
               ("Bekijk de uitkomst", "Je ziet of het vergunningvrij is of dat je moet aanvragen.")],
     "qa": [("Is de vergunningcheck bindend?", "Het geeft een sterke indicatie op basis van je antwoorden. Twijfel je? Stem af met je gemeente of vraag een conceptaanvraag aan."),
            ("Wat heb ik nodig voor de check?", "Je adres en een duidelijk idee van wat je wilt doen. Voor de daadwerkelijke aanvraag heb je meer gegevens nodig.")]},
    {"key": "omgevingswet", "label": "De Omgevingswet", "tagline": "Wat veranderde in 2024",
     "intro": "Sinds 1 januari 2024 geldt de Omgevingswet. Die bundelt tientallen wetten over de leefomgeving en verving o.a. de Wabo en het bestemmingsplan.",
     "punten": [("Eén omgevingsvergunning", "Voor bouwen, slopen, kappen en meer, aan te vragen via het Omgevingsloket."),
                ("Omgevingsplan i.p.v. bestemmingsplan", "Elke gemeente werkt naar één omgevingsplan met alle regels voor de leefomgeving."),
                ("Knip in de bouwactiviteit", "De ruimtelijke toets (omgevingsplan) en de technische toets (bouwtechniek) zijn van elkaar gescheiden."),
                ("Sneller en digitaal", "Meer zaken lopen via het digitale Omgevingsloket.")],
     "qa": [("Bestaat het bestemmingsplan nog?", "Bestaande bestemmingsplannen gaan op in het omgevingsplan (overgangsfase). De regels blijven leidend voor wat mag op jouw locatie."),
            ("Is vergunningvrij bouwen veranderd?", "De systematiek is grotendeels voortgezet onder de Omgevingswet, met nieuwe terminologie. Doe altijd de actuele vergunningcheck.")]},
    {"key": "wkb", "label": "Wet kwaliteitsborging (Wkb)", "tagline": "Bouwkwaliteit geborgd",
     "intro": "De Wet kwaliteitsborging voor het bouwen (Wkb) ging samen met de Omgevingswet in op 1 januari 2024. Bij eenvoudigere nieuwbouw en verbouw controleert een onafhankelijke kwaliteitsborger de bouwkwaliteit.",
     "punten": [("Onafhankelijke controle", "Een kwaliteitsborger toetst tijdens de bouw of aan de eisen wordt voldaan."),
                ("Geldt voor gevolgklasse 1", "Bijvoorbeeld grondgebonden woningen en kleinere bouwwerken."),
                ("Gefaseerde invoering", "De Wkb wordt stap voor stap uitgebreid naar meer bouwwerken."),
                ("Sterkere positie van de koper", "Aannemers zijn langer aansprakelijk voor gebreken.")],
     "qa": [("Geldt de Wkb voor mijn verbouwing?", "Voor bouwwerken in gevolgklasse 1 (zoals veel grondgebonden woningen) vaak wel. Je aannemer of de gemeente kan dit voor jouw project bevestigen."),
            ("Wat heb ik aan de Wkb als koper?", "Meer zekerheid over de bouwkwaliteit en een sterkere positie als er na oplevering gebreken blijken.")]},
    {"key": "kosten", "label": "Wat kost een omgevingsvergunning", "tagline": "Leges en bijkomende kosten",
     "intro": "Voor het behandelen van je aanvraag betaal je leges aan de gemeente. De hoogte verschilt per gemeente en hangt vaak samen met de bouwkosten.",
     "punten": [("Leges per gemeente", "Vaak een percentage van de bouwsom; soms een vast tarief per activiteit."),
                ("Bijkomende kosten", "Denk aan tekeningen, een constructieberekening en eventueel welstand."),
                ("Geen leges bij vergunningvrij", "Valt je plan binnen de voorwaarden, dan bespaar je de legeskosten.")],
     "qa": [("Hoeveel kost een vergunning gemiddeld?", "Dat loopt sterk uiteen omdat leges per gemeente verschillen en meebewegen met de bouwsom. Vraag het tarief op bij je gemeente."),
            ("Krijg ik leges terug bij weigering?", "Soms gedeeltelijk. Gemeenten hanteren hiervoor eigen regels in hun legesverordening.")]},
    {"key": "doorlooptijd", "label": "Hoe lang duurt een vergunning", "tagline": "Doorlooptijd en procedures",
     "intro": "De meeste aanvragen lopen via de reguliere procedure met een beslistermijn van 8 weken. Complexe of afwijkende plannen kunnen de uitgebreide procedure van 26 weken volgen.",
     "punten": [("Reguliere procedure", "Beslistermijn van doorgaans 8 weken, eenmalig te verlengen met 6 weken."),
                ("Uitgebreide procedure", "Voor complexere plannen, met een termijn van doorgaans 26 weken."),
                ("Bezwaar telt mee", "Na verlening volgt nog een bezwaartermijn voordat de vergunning onherroepelijk is."),
                ("Vooroverleg bespaart tijd", "Een goed voorbereide aanvraag voorkomt vertraging.")],
     "qa": [("Wat als de gemeente niet op tijd beslist?", "Onder de Omgevingswet is er niet langer automatisch een vergunning van rechtswege; neem bij overschrijding contact op met je gemeente."),
            ("Kan ik de doorlooptijd verkorten?", "Met een complete aanvraag en vooroverleg voorkom je aanvullende vragen en vertraging.")]},
    {"key": "bezwaar", "label": "Bezwaar maken tegen een vergunning", "tagline": "Jij of je buren",
     "intro": "Belanghebbenden — zoals omwonenden — kunnen bezwaar maken tegen een verleende omgevingsvergunning. Andersom kun jij bezwaar maken tegen een vergunning van een ander.",
     "punten": [("Wie mag bezwaar maken", "Belanghebbenden, meestal direct omwonenden."),
                ("Binnen de termijn", "Doorgaans zes weken na bekendmaking van het besluit."),
                ("Onderbouwd", "Leg uit welk belang wordt geraakt en waarom."),
                ("Daarna eventueel beroep", "Bij de rechtbank, als het bezwaar wordt afgewezen.")],
     "qa": [("Kan mijn buurman mijn verbouwing tegenhouden?", "Alleen bij een vergunningplichtig plan, via bezwaar binnen de termijn. Bij vergunningvrij bouwen kan dat niet via de vergunning."),
            ("Hoe voorkom ik bezwaar?", "Informeer je buren vroeg en betrek ze bij je plannen; dat voorkomt veel weerstand.")]},
    {"key": "bestemmingsplan-omgevingsplan", "label": "Bestemmingsplan & omgevingsplan", "tagline": "Wat mag er op jouw locatie",
     "intro": "Wat je op een perceel mag bouwen, staat in het omgevingsplan (voorheen het bestemmingsplan). Het bepaalt functies, bouwhoogtes en grenzen.",
     "punten": [("Functie en bouwregels", "Wonen, bedrijf, maximale hoogte, bebouwingspercentage en meer."),
                ("Omgevingsplan vervangt bestemmingsplan", "Gemeenten werken naar één omgevingsplan onder de Omgevingswet."),
                ("Afwijken kan", "Soms is afwijking mogelijk via een omgevingsvergunning, na afweging door de gemeente.")],
     "qa": [("Hoe vind ik wat mag op mijn adres?", "Bekijk het omgevingsplan via het Omgevingsloket of vraag het op bij je gemeente."),
            ("Mijn plan past niet in het omgevingsplan — kan het toch?", "Soms, via een vergunning om af te wijken. De gemeente weegt dan de belangen af; vooroverleg is aan te raden.")]},
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
    <a href="{HUB}/">Bouwvergunning</a>
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
.grid-2{{display:grid;grid-template-columns:1fr 1fr;gap:16px;}}
.highlight{{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;font-size:14px;color:rgba(61,46,30,0.75);line-height:1.7;}}
.check-list{{list-style:none;display:flex;flex-direction:column;gap:10px;}}
.check-list li{{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}}
.check-list li::before{{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}}
.x-list{{list-style:none;display:flex;flex-direction:column;gap:10px;}}
.x-list li{{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}}
.x-list li::before{{content:'!';color:#B85C38;font-weight:800;flex-shrink:0;width:18px;height:18px;border-radius:50%;background:rgba(184,92,56,0.12);text-align:center;font-size:12px;line-height:18px;margin-top:1px;}}
.faq-item{{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}}
.faq-item h3{{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}}
.faq-item p{{font-size:14px;color:rgba(61,46,30,0.65);line-height:1.7;}}
.tile{{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;padding:16px 18px;transition:border-color .15s;}}
.tile:hover{{border-color:rgba(61,90,62,0.4);}}
.cta-primary{{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}}
@media(max-width:768px){{.container{{padding:0 20px;}}.grid-3,.grid-2{{grid-template-columns:1fr;}}.hero-grid{{grid-template-columns:1fr!important;gap:32px!important;}}aside{{position:static!important;}}}}
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
    <p style="font-size:12px;color:rgba(245,240,232,0.4);max-width:560px;line-height:1.6;">Informatief overzicht, geen juridisch advies. Regels rond bouwvergunningen veranderen en verschillen per gemeente — doe altijd de actuele <a href="__LOKET__" style="color:#8AAE8B;" rel="nofollow">vergunningcheck in het Omgevingsloket</a>.</p>
    <p style="font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,0.25);margin-top:18px;">© 2025 Bylder Nederland B.V. — KvK 65020006</p>
  </div>
</footer>
</body></html>"""

def footer():
    return FOOTER.replace("__LOKET__", LOKET)

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
  <p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;color:rgba(245,240,232,0.5);margin-bottom:10px;">Slim (ver)bouwen met Bylder</p>
  <h2 style="font-size:1.7rem;font-weight:800;color:#F5F0E8;margin-bottom:12px;">Pak je verbouwing slim en voordelig aan</h2>
  <p style="color:rgba(245,240,232,0.7);margin-bottom:26px;max-width:520px;margin-left:auto;margin-right:auto;font-size:15px;">Bylder helpt je bij het hele traject: een eerlijke offerte-check, kostenraming per ruimte en kortingen bij 40+ woonmerken. Maak gratis een account aan.</p>
  <a href="{SIGNUP}" class="cta-primary">Start gratis &#8594;</a>
</div>"""

def loket_note():
    return f'<div class="highlight">{html.escape(CAVEAT)} <a href="{LOKET}" rel="nofollow">Doe de vergunningcheck &#8594;</a></div>'

# ── Hub ──────────────────────────────────────────────────────────────────────
def build_hub():
    title = "Bouwvergunning nodig? Compleet overzicht per project | Bylder.com"
    desc = "Heb je een bouwvergunning (omgevingsvergunning) nodig voor je dakkapel, aanbouw, schuur of zonnepanelen? Per project uitgelegd wat vergunningvrij mag — plus aanvragen, kosten en doorlooptijd."
    canonical = f"{BASE}{HUB}/"
    qa = [
        ("Heb ik een bouwvergunning nodig?", "Dat hangt af van wat en waar je (ver)bouwt. Veel kleinere ingrepen in het achtererfgebied zijn vergunningvrij, maar er gelden voorwaarden. Doe de vergunningcheck in het Omgevingsloket voor jouw situatie."),
        ("Wat is een omgevingsvergunning?", "Sinds de Omgevingswet (2024) is dit de vergunning voor o.a. bouwen, verbouwen en slopen. Je vraagt 'm aan via het Omgevingsloket."),
        ("Wat betekent vergunningvrij bouwen?", "Dat je voor je plan geen vergunning hoeft aan te vragen, mits het binnen de landelijke voorwaarden valt. Let op: vergunningvrij is niet regelvrij — bouwtechnische eisen blijven gelden."),
        ("Wat kost een vergunning?", "Je betaalt leges aan de gemeente; die verschillen per gemeente en hangen vaak samen met de bouwsom. Bij vergunningvrij bouwen vervallen die kosten."),
    ]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Bouwvergunning", canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": "Bouwvergunning nodig? Compleet overzicht", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}}]

    proj_tiles = "".join(f'<a href="{HUB}/{p["key"]}/" class="tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{p["label"]}</div><div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">{p["tagline"]}</div></a>' for p in PROJECTS)
    topic_tiles = "".join(f'<a href="{HUB}/{t["key"]}/" class="tile"><div style="font-weight:700;font-size:15px;color:#1A1208;">{t["label"]}</div><div style="font-size:12.5px;color:rgba(61,46,30,0.55);margin-top:2px;">{t["tagline"]}</div></a>' for t in TOPICS)

    body = f"""<main style="padding:60px 0;">
  <div class="container">
    <div style="max-width:760px;">
      <div class="badge">Bouwen &amp; verbouwen</div>
      <h1 style="font-size:2.6rem;font-weight:800;line-height:1.14;margin-bottom:14px;">Heb je een bouwvergunning nodig?</h1>
      <p style="font-size:1.12rem;color:rgba(61,46,30,0.65);line-height:1.7;margin-bottom:18px;">Of je nu een dakkapel, aanbouw, schuur of zonnepanelen plant: veel ingrepen mogen <strong>vergunningvrij</strong>, maar lang niet alles. Hieronder vind je per project wat is toegestaan, plus hoe je een <strong>omgevingsvergunning</strong> aanvraagt, wat het kost en hoe lang het duurt.</p>
    </div>
    {loket_note()}

    <h2 style="font-size:1.5rem;font-weight:800;margin:40px 0 8px;">Per project: vergunning nodig?</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">Kies je verbouwing en zie meteen wat vergunningvrij mag en wanneer je wél een vergunning nodig hebt.</p>
    <div class="grid-3">{proj_tiles}</div>

    <h2 style="font-size:1.5rem;font-weight:800;margin:44px 0 8px;">Aanvragen, regels &amp; procedures</h2>
    <p style="font-size:15px;color:rgba(61,46,30,0.6);margin-bottom:16px;">Alles over de omgevingsvergunning: aanvragen, vergunningvrij bouwen, de Omgevingswet, kosten, doorlooptijd en bezwaar.</p>
    <div class="grid-3">{topic_tiles}</div>

    {cta_block()}

    {faq_html(qa)}

    <div class="divider"></div>
    <p style="font-size:14px;color:rgba(61,46,30,0.6);">Verder: <a href="/renovatie/">renovatie &amp; verbouwing</a> · <a href="/nieuwbouw-tools/">gratis tools</a> · <a href="/functies/">alle functies van Bylder</a></p>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Project-pagina ───────────────────────────────────────────────────────────
def build_project(p):
    label = p["label"]
    title = f"{label}: vergunning nodig? Vergunningvrij & aanvragen | Bylder.com"
    desc = f"{label} (ver)bouwen: heb je een omgevingsvergunning nodig of mag het vergunningvrij? Voorwaarden, wanneer je wél een vergunning nodig hebt, kosten en de vergunningcheck."
    canonical = f"{BASE}{HUB}/{p['key']}/"
    qa = p["qa"]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Bouwvergunning", f"{BASE}{HUB}/"), (label, canonical)]),
              {"@context": "https://schema.org", "@type": "Article", "headline": f"{label}: vergunning nodig?", "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}}]

    vrij = "".join(f"<li>{html.escape(x)}</li>" for x in p["vrij"])
    wel = "".join(f"<li>{html.escape(x)}</li>" for x in p["wel"])
    others = [o for o in PROJECTS if o["key"] != p["key"]][:6]
    other_tiles = "".join(f'<a href="{HUB}/{o["key"]}/" class="tile"><div style="font-weight:700;font-size:14px;color:#1A1208;">{o["label"]}</div></a>' for o in others)

    body = f"""<main style="padding:56px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:28px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bouwvergunning</a> → <span style="color:rgba(61,46,30,0.6);">{label}</span></p>
        <div class="badge">{label}</div>
        <h1 style="font-size:2.3rem;font-weight:800;line-height:1.15;margin-bottom:8px;">{label}: heb je een vergunning nodig?</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);font-style:italic;margin-bottom:8px;">{p['tagline']}</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:20px;">{html.escape(p['intro'])}</p>

        <h2 style="font-size:1.35rem;font-weight:700;margin:32px 0 12px;">Vaak vergunningvrij — onder voorwaarden</h2>
        <ul class="check-list">{vrij}</ul>

        <h2 style="font-size:1.35rem;font-weight:700;margin:32px 0 12px;">Wanneer je wél een vergunning nodig hebt</h2>
        <ul class="x-list">{wel}</ul>

        <h2 style="font-size:1.35rem;font-weight:700;margin:32px 0 12px;">Kosten</h2>
        <p style="font-size:15px;color:rgba(61,46,30,0.72);line-height:1.8;">{html.escape(p['kosten'])}</p>

        {loket_note()}
        {cta_block()}

        {faq_html(qa)}

        <h2 style="font-size:1.35rem;font-weight:700;margin:36px 0 12px;">Andere projecten</h2>
        <div class="grid-3">{other_tiles}</div>

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">bouwvergunning-overzicht</a> · <a href="{HUB}/omgevingsvergunning-aanvragen/">vergunning aanvragen</a> · <a href="{HUB}/kosten/">kosten</a></p>
      </article>

      <aside style="position:sticky;top:96px;">
        <div class="card" style="margin-bottom:18px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Twijfel je over je situatie?</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Doe de gratis vergunningcheck voor jouw adres in het Omgevingsloket.</p>
          <a href="{LOKET}" rel="nofollow" style="display:block;text-align:center;background:#fff;color:#3D5A3E;border:1.5px solid rgba(61,90,62,0.3);padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Vergunningcheck &#8594;</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Slim verbouwen met Bylder</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Offerte-check, kostenraming en kortingen bij 40+ merken.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis &#8594;</a>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Proces-pagina ────────────────────────────────────────────────────────────
def build_topic(t):
    label = t["label"]
    title = f"{label} — {t['tagline']} | Bylder.com"
    desc = t["intro"][:155]
    canonical = f"{BASE}{HUB}/{t['key']}/"
    qa = t["qa"]
    schema = [faq_schema(qa), breadcrumb([("Bylder.com", BASE + "/"), ("Bouwvergunning", f"{BASE}{HUB}/"), (label, canonical)])]
    if t.get("steps"):
        schema.append({"@context": "https://schema.org", "@type": "HowTo", "name": label,
                       "step": [{"@type": "HowToStep", "name": n, "text": x} for n, x in t["steps"]]})
    else:
        schema.append({"@context": "https://schema.org", "@type": "Article", "headline": label, "description": desc, "author": {"@type": "Organization", "name": "Bylder.com"}, "publisher": {"@type": "Organization", "name": "Bylder.com"}})

    punten = "".join(f'<li><strong>{html.escape(n)}.</strong> {html.escape(x)}</li>' for n, x in t["punten"])
    steps_html = ""
    if t.get("steps"):
        steps_html = '<h2 style="font-size:1.35rem;font-weight:700;margin:32px 0 12px;">Stap voor stap</h2><ol style="list-style:decimal;padding-left:24px;display:flex;flex-direction:column;gap:12px;font-size:15px;">' + "".join(f'<li><strong>{html.escape(n)}.</strong> {html.escape(x)}</li>' for n, x in t["steps"]) + "</ol>"

    topic_links = "".join(f'<a href="{HUB}/{o["key"]}/" class="tile"><div style="font-weight:700;font-size:14px;color:#1A1208;">{o["label"]}</div></a>' for o in TOPICS if o["key"] != t["key"])

    body = f"""<main style="padding:56px 0;">
  <div class="container">
    <div class="hero-grid" style="display:grid;grid-template-columns:2fr 1fr;gap:56px;align-items:start;">
      <article>
        <p style="font-size:13px;color:rgba(61,46,30,0.4);margin-bottom:28px;"><a href="/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bylder.com</a> → <a href="{HUB}/" style="color:rgba(61,46,30,0.4);text-decoration:none;">Bouwvergunning</a> → <span style="color:rgba(61,46,30,0.6);">{label}</span></p>
        <div class="badge">{label}</div>
        <h1 style="font-size:2.2rem;font-weight:800;line-height:1.15;margin-bottom:8px;">{label}</h1>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.5);font-style:italic;margin-bottom:8px;">{t['tagline']}</p>
        <div class="divider"></div>
        <p style="font-size:1.05rem;color:rgba(61,46,30,0.72);line-height:1.8;margin-bottom:20px;">{html.escape(t['intro'])}</p>

        <h2 style="font-size:1.35rem;font-weight:700;margin:32px 0 12px;">Het belangrijkste op een rij</h2>
        <ul class="check-list">{punten}</ul>

        {steps_html}

        {loket_note()}
        {cta_block()}

        {faq_html(qa)}

        <h2 style="font-size:1.35rem;font-weight:700;margin:36px 0 12px;">Meer over vergunningen</h2>
        <div class="grid-3">{topic_links}</div>

        <div class="divider"></div>
        <p style="font-size:14px;color:rgba(61,46,30,0.6);">Terug naar het <a href="{HUB}/">bouwvergunning-overzicht</a></p>
      </article>

      <aside style="position:sticky;top:96px;">
        <div class="card" style="margin-bottom:18px;">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Vergunningcheck</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Bepaal gratis of jouw plan vergunningvrij is.</p>
          <a href="{LOKET}" rel="nofollow" style="display:block;text-align:center;background:#fff;color:#3D5A3E;border:1.5px solid rgba(61,90,62,0.3);padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Naar het Omgevingsloket &#8594;</a>
        </div>
        <div class="card">
          <p style="font-size:13px;font-weight:700;color:#1A1208;margin-bottom:8px;">Slim verbouwen met Bylder</p>
          <p style="font-size:13px;color:rgba(61,46,30,0.55);margin-bottom:14px;line-height:1.6;">Offerte-check, kostenraming en kortingen bij 40+ merken.</p>
          <a href="{SIGNUP}" style="display:block;text-align:center;background:#3D5A3E;color:#F5F0E8;padding:11px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">Start gratis &#8594;</a>
        </div>
      </aside>
    </div>
  </div>
</main>"""
    return head(title, desc, canonical, schema) + body + footer()

# ── Sitemap ──────────────────────────────────────────────────────────────────
def build_sitemap():
    urls = [f"{BASE}{HUB}/"] + [f"{BASE}{HUB}/{p['key']}/" for p in PROJECTS] + [f"{BASE}{HUB}/{t['key']}/" for t in TOPICS]
    items = "".join(f"  <url><loc>{u}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓", path)

if __name__ == "__main__":
    print("Bouwvergunning content-hub genereren…")
    write("bouwvergunning/index.html", build_hub())
    for p in PROJECTS:
        write(f"bouwvergunning/{p['key']}/index.html", build_project(p))
    for t in TOPICS:
        write(f"bouwvergunning/{t['key']}/index.html", build_topic(t))
    write("bouwvergunning-sitemap.xml", build_sitemap())
    total = 1 + len(PROJECTS) + len(TOPICS)
    print(f"Klaar: 1 hub + {len(PROJECTS)} projecten + {len(TOPICS)} proces-pagina's = {total} pagina's + sitemap.")
