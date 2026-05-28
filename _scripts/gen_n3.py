#!/usr/bin/env python3
import os, sys
exec(open('/Users/danielpaaij/Documents/GitHub/website/generate_op_maat.py').read())

BASE = "/Users/danielpaaij/Documents/GitHub/website/op-maat"

# Each entry: (cat_slug, cat_label, prod_slug, prod_title, h1, meta_desc, intro, price, leadtime, faqs, related_pages)
PAGES = [
  # ── KEUKEN ──────────────────────────────────────────────────────
  ("keuken","Keuken","maatwerk-keuken","Maatwerk keuken laten maken",
   "Maatwerk keuken laten maken — wat kost het en hoe werkt het?",
   "Maatwerk keuken laten maken voor je nieuwbouwwoning. Prijzen €8.000–€25.000, levertijd 8–14 weken en de beste tips voor het kiezen van een keukenmaker.",
   "Een maatwerk keuken wordt volledig op maat gemaakt voor de ruimte, de aansluitpunten en jouw woonwensen. Anders dan een doe-het-zelfkeuken van IKEA of een dealerkeuken van een keten, ontwerpt een keukenmaker elke kast, lade en het werkblad op de millimeter precies voor jouw situatie.",
   "€8.000 – €25.000 incl. plaatsing",
   "8–14 weken",
   [("Wat kost een maatwerk keuken?","Een basis maatwerk keuken (laminaat frontjes, eenvoudig blad) kost €8.000–€12.000. Middensegment (PU-gespoten, composiet blad, inbouwapparatuur) €12.000–€18.000. Luxe (massief hout, keramiek, AEG/Siemens/Miele) €18.000–€40.000+."),
    ("Hoe lang duurt een maatwerk keuken?","Na akkoord op het ontwerp en tekeningen duurt productie 6–10 weken. Reserveer 2 weken extra voor planning van de montagedatum. Begin dus minstens 4 maanden voor gewenste oplevering met offertes."),
    ("Maatwerk of dealerkeuken — wat is beter?","Maatwerk past exact in de ruimte en geeft meer vrijheid in ontwerp. Een dealerkeuken (Häcker, Nobilia) is vaak goedkoper maar in vaste modulmaten. Voor onregelmatige ruimtes en unieke indelingen wint maatwerk altijd.")],
   [("/op-maat/keuken/keukeneiland-op-maat/","Keukeneiland op maat"),("/op-maat/keuken/keukenkasten-op-maat/","Keukenkasten op maat"),("/op-maat/keuken/","← Terug naar keuken")]),

  ("keuken","Keuken","keukeneiland-op-maat","Keukeneiland op maat",
   "Keukeneiland op maat laten maken — maten, prijzen en ontwerptips",
   "Keukeneiland op maat voor nieuwbouw: welke maten zijn ideaal, wat kost het (€3.000–€12.000) en welke functies bouw je in? Alles wat je moet weten.",
   "Een keukeneiland op maat is de meest flexibele oplossing: je bepaalt zelf de hoogte, breedte, materiaal en of je een inductieplaat, spoelbak of extra opbergruimte wilt integreren. In nieuwbouw is er vaak ruimte voor een eiland, maar de standaardindeling voorziet er niet altijd in.",
   "€3.000 – €12.000 afhankelijk van grootte en uitvoering",
   "8–12 weken",
   [("Welke maten zijn ideaal voor een keukeneiland?","Minimaal 90 cm breed en 60 cm diep voor functioneel gebruik. Voor een eiland met zitplaatsen reken je 45 cm extra overhang. Loopruimte rondom het eiland: minimaal 90–100 cm."),
    ("Wat kost een keukeneiland op maat?","Een eenvoudig eiland (blok met planken) kost €3.000–€5.000. Met inductie en spoelbak €5.000–€8.000. Een luxe eiland met waterval blad en kasten €8.000–€15.000."),
    ("Kan ik een eiland combineren met een zit-werkplek?","Ja. Door een overhang van 35–45 cm aan één kant maak je ruimte voor barkrukken (zittend werken of eten). Ideaal als ontbijtbar in de ochtend.")],
   [("/op-maat/keuken/maatwerk-keuken/","Maatwerk keuken"),("/op-maat/keuken/keukenkasten-op-maat/","Keukenkasten op maat"),("/op-maat/keuken/","← Terug naar keuken")]),

  ("keuken","Keuken","keukenkasten-op-maat","Keukenkasten op maat",
   "Keukenkasten op maat laten maken — materialen, prijzen en tips",
   "Keukenkasten op maat voor nieuwbouw: welk materiaal kies je, wat kost het en hoe krijg je de beste indeling? Inclusief prijzen per strekkende meter.",
   "Keukenkasten op maat worden gemaakt in de exacte hoogte, breedte en diepte die jouw keuken vraagt. Je kiest zelf frontmateriaal (folie, lak, hout), greepvorm, scharnieren en binnenindeling. De prijs is afhankelijk van materiaal en afwerking.",
   "€350 – €900 per lopende meter kast",
   "6–10 weken",
   [("Wat kost een strekkende meter keukenkast?","Een basiskast (laminaat folie) kost €350–€500 per lopende meter. Gespoten MDF €500–€700/m. Massief hout of keramiek frontjes €700–€1.200/m. Exclusief apparatuur."),
    ("Welk materiaal is het beste voor keukenkasten?","MDF met folie of gespoten lak is de standaard — duurzaam en goed te reinigen. Massief hout geeft meer karakter maar is gevoeliger voor vocht. Voor kastfronten: gelakt MDF scoort het beste op duurzaamheid en onderhoud."),
    ("Hoe hoog maak ik keukenkasten?","Standaard bovenkast: 72 cm hoog. Maatwerkkasten tot aan het plafond elimineren stofvangst en geven meer opbergruimte. In nieuwbouw met 260 cm plafondhoogte is een kast van 220–230 cm ideaal.")],
   [("/op-maat/keuken/maatwerk-keuken/","Maatwerk keuken"),("/op-maat/keuken/keukeneiland-op-maat/","Keukeneiland op maat"),("/op-maat/keuken/","← Terug naar keuken")]),

  # ── KASTEN EN OPBERGEN ──────────────────────────────────────────
  ("kasten-en-opbergen","Kasten & opbergen","inbouwkast-op-maat","Inbouwkast op maat",
   "Inbouwkast op maat laten maken — prijzen, materialen en indeling",
   "Inbouwkast op maat voor nieuwbouw: prijzen €800–€4.000, beste materialen en hoe je de indeling optimaal benut. Inclusief tips voor nieuwbouwwoningen.",
   "Een inbouwkast op maat past precies in de beschikbare nis of ruimte — van vloer tot plafond, van muur tot muur. In nieuwbouw zijn nissen zelden standaard diep genoeg voor IKEA PAX, waardoor maatwerk de logische keuze is.",
   "€800 – €4.000 afhankelijk van grootte en indeling",
   "4–8 weken",
   [("Wat kost een inbouwkast op maat?","Een eenvoudige inbouwkast (1 deur, 3 planken, 1 roede) kost €800–€1.500. Met meerdere deuren en lades €1.500–€3.000. Een kastenwand van 3 meter breed kost €2.500–€6.000."),
    ("Schuifdeur of openslaande deur?","Schuifdeuren zijn beter in kleine ruimtes — je hebt geen zwaaibereik nodig. Openslaande deuren geven beter toegang tot de volledige breedte. Schuifdeuren zijn duurder (€200–€600 extra per deur)."),
    ("Welke diepte heeft een inbouwkast nodig?","Voor hangende kleding: minimaal 55–60 cm diep. Voor vouwkleding en planken: 45 cm is genoeg. Schoenenkasten: 35 cm is voldoende.")],
   [("/op-maat/kasten-en-opbergen/inloopkast-op-maat/","Inloopkast op maat"),("/op-maat/kasten-en-opbergen/schuifdeuren-op-maat/","Schuifdeuren op maat"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  ("kasten-en-opbergen","Kasten & opbergen","inloopkast-op-maat","Inloopkast op maat",
   "Inloopkast op maat laten maken — indeling, kosten en tips",
   "Inloopkast op maat voor nieuwbouw: wat kost het (€3.000–€12.000), welke indeling werkt het best en hoe gebruik je de ruimte maximaal?",
   "Een inloopkast op maat is het droomscenario voor veel nieuwbouwkopers. Als er een aparte kamer of groot nis beschikbaar is, kun je de volledige ruimte — inclusief hoeken — optimaal benutten met een systeem dat precies op jouw kledingcollectie is afgestemd.",
   "€3.000 – €12.000 afhankelijk van grootte",
   "6–10 weken",
   [("Wat kost een inloopkast op maat?","Een inloopkast van 4 m² met basistindeling (roedes, planken) kost €3.000–€5.000. Met lades, verlichting en spiegelwand €5.000–€9.000. Luxe uitvoering met eiland €8.000–€15.000."),
    ("Welke minimale afmetingen heeft een inloopkast nodig?","Minimaal 1,5 m breed en 1,5 m diep (met looppad). Ideaal is 2 m breed × 2,5 m diep. De looppadvereiste is 90 cm als je aan beide kanten kastelementen hebt."),
    ("Open of gesloten inloopkast?","Een open inloopkast (zonder deuren) geeft meer lucht maar verzamelt stof. Een gesloten kast beschermt kleding beter. Combinatie: schuifdeuren aan de buitenzijde, open indeling binnen.")],
   [("/op-maat/kasten-en-opbergen/inbouwkast-op-maat/","Inbouwkast op maat"),("/op-maat/slaapkamer/inloopkast-slaapkamer/","Inloopkast slaapkamer"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  ("kasten-en-opbergen","Kasten & opbergen","schuifdeuren-op-maat","Schuifdeuren op maat",
   "Schuifdeuren op maat laten maken — systemen, prijzen en materialen",
   "Schuifdeuren op maat voor kast of kamer: prijzen €400–€2.500 per deur, populaire systemen en materialen. Alles voor nieuwbouwwoningen.",
   "Schuifdeuren op maat zijn de perfecte oplossing als er geen ruimte is voor openslaande deuren. Ze worden gemaakt op de exacte hoogte en breedte van de opening, en zijn leverbaar in glas, gespoten MDF, hout of aluminium frame.",
   "€400 – €2.500 per deur afhankelijk van materiaal",
   "3–6 weken",
   [("Wat kosten schuifdeuren op maat?","Een eenvoudige MDF schuifdeur (folie of gespoten) kost €400–€800 incl. beslag. Glazen schuifdeuren €600–€1.200. Aluminium frame met inleg €800–€2.000. Prijs per deur exclusief kastframe."),
    ("Welk systeem — vloergeleid of plafondgeleid?","Plafondgeleide systemen (geen rail op de vloer) zijn schoner en toegankelijker. Vloergeleide systemen zijn stabieler bij zware deuren. Voor deuren tot 80 kg is plafondgeleiding prima."),
    ("Welk materiaal kies ik voor schuifdeuren?","MDF gespoten lak: strak en modern. Houtfineer: warm karakter. Glas (mat of helder): ruimtelijk en licht. Combinatie aluminium+glas: industrieel. Kies op basis van de rest van het interieur.")],
   [("/op-maat/kasten-en-opbergen/inbouwkast-op-maat/","Inbouwkast op maat"),("/op-maat/kasten-en-opbergen/wandmeubel-op-maat/","Wandmeubel op maat"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  ("kasten-en-opbergen","Kasten & opbergen","wandmeubel-op-maat","Wandmeubel op maat",
   "Wandmeubel op maat laten maken — prijzen, ontwerp en materialen",
   "Wandmeubel op maat voor de woonkamer: prijzen €1.500–€8.000, populaire materialen en hoe je een ontwerp laat maken dat past bij jouw interieur.",
   "Een wandmeubel op maat benut de volledige wandbreedte en -hoogte van je woonkamer. Je combineert een tv-gedeelte, opbergruimte en decoratieve vakken in één geheel dat precies bij jouw ruimte past.",
   "€1.500 – €8.000 afhankelijk van grootte en uitvoering",
   "6–10 weken",
   [("Wat kost een wandmeubel op maat?","Een wandmeubel van 3 meter breed (basis MDF) kost €1.500–€3.000. Met gespoten lak en LED-verlichting €2.500–€5.000. Een volledige wand van 5 meter met tv-gedeelte en opbergruimte €4.000–€10.000."),
    ("Hoe verwerk ik de tv-aansluiting in een wandmeubel?","Zorg dat de stroomgroep achter het tv-gedeelte loopt vóór het stucwerk. Vraag de elektricien om een leegstaande buis voor kabels. Het wandmeubel heeft dan een doorgangsgat voor kabels die onzichtbaar weggewerkt zijn."),
    ("Wandmeubel vast aan de wand of vrijstaand?","Vast (ingebouwd) geeft een strakker resultaat. Vrijstaand is eenvoudiger te verwijderen bij verhuizing. Voor muurvaste modellen geldt: check of de wand de belasting aankan (steenwol isolatiewanden hebben extra bevestigingspunten nodig).")],
   [("/op-maat/kasten-en-opbergen/tv-meubel-op-maat/","Tv-meubel op maat"),("/op-maat/kasten-en-opbergen/boekenkast-op-maat/","Boekenkast op maat"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  ("kasten-en-opbergen","Kasten & opbergen","boekenkast-op-maat","Boekenkast op maat",
   "Boekenkast op maat laten maken — maten, prijzen en materialen",
   "Boekenkast op maat voor nieuwbouw: prijzen €600–€4.000, populaire materialen (MDF, multiplex, massief) en tips voor de juiste vakindeling.",
   "Een boekenkast op maat past van vloer tot plafond en van muur tot muur — geen lastige afslagen, geen vervelende kieren. Ideaal voor de studeerkamer, woonkamer of gang in nieuwbouw waar de maten zelden standaard zijn.",
   "€600 – €4.000 afhankelijk van grootte en materiaal",
   "4–8 weken",
   [("Wat kost een boekenkast op maat?","Een eenvoudige boekenkast (MDF, wit gelakt) van 2 meter hoog en 1,5 meter breed kost €600–€1.200. Met deuren en lades €1.200–€2.500. Massief hout of multiplex met zichtbare schroeven: €1.500–€4.000."),
    ("Welke plaatdikte gebruik ik voor boekenplanken?","Gebruik minimaal 22 mm MDF of 18 mm multiplex voor planken tot 80 cm breed. Bij bredere planken (>80 cm) kies je 25 mm of een verstevigingsregel achteraan om doorbuigen te voorkomen."),
    ("Kan ik verlichting integreren in een boekenkast?","Ja. LED-strips in de legplanken geven een warm effect. Spotjes aan de bovenkant schijnen naar beneden. Gebruik dimbare LED (2700–3000K) voor woonkamerbibliotheken.")],
   [("/op-maat/kasten-en-opbergen/wandmeubel-op-maat/","Wandmeubel op maat"),("/op-maat/woonkamer/","Woonkamer op maat"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  ("kasten-en-opbergen","Kasten & opbergen","tv-meubel-op-maat","Tv-meubel op maat",
   "Tv-meubel op maat laten maken — zwevend, met kast of volledig wandsysteem",
   "Tv-meubel op maat voor nieuwbouw: prijzen €500–€4.000, zwevend of staand, met of zonder kasten. Alles wat je moet weten voor een strak resultaat.",
   "Een tv-meubel op maat geeft je controle over de exacte breedte, hoogte van het zweven, kabeldoorvoer en combinatie met opbergruimte. In nieuwbouw is de tv-wand een populaire keuze die het interieur direct definieert.",
   "€500 – €4.000 afhankelijk van uitvoering",
   "4–8 weken",
   [("Wat kost een zwevend tv-meubel op maat?","Een zwevend tv-meubel (1 lade, 2 vakken) kost €500–€1.200. Met extra opbergruimte en geïntegreerde LED €1.000–€2.500. Een complete tv-wand (meubel + wandpanelen) €2.000–€5.000."),
    ("Op welke hoogte hang ik het tv-meubel?","Het ideale kijkhoogte-midden ligt op ooghoogte zittend: 100–110 cm vanaf de vloer. Een zwevend meubel op 50–60 cm hoogte met een tv die 60–70 cm hoog begint is een goede combinatie."),
    ("Hoe verberg ik kabels bij een zwevend tv-meubel?","Vraag vóór het stucwerk een inbouwaansluiting (HDMI, stroom, coax) achter de voorgenomen tv-positie. De installateur legt een leegstaande buis van het meubel naar de grond of het dressoir.")],
   [("/op-maat/kasten-en-opbergen/wandmeubel-op-maat/","Wandmeubel op maat"),("/op-maat/woonkamer/","Woonkamer op maat"),("/op-maat/kasten-en-opbergen/","← Terug naar kasten")]),

  # ── SLAAPKAMER ──────────────────────────────────────────────────
  ("slaapkamer","Slaapkamer","inloopkast-slaapkamer","Inloopkast slaapkamer op maat",
   "Inloopkast slaapkamer op maat — indeling, prijzen en tips",
   "Inloopkast in de slaapkamer op maat laten maken: prijzen €3.000–€10.000, ideale indeling en hoe je de ruimte maximaal benut in nieuwbouw.",
   "Een inloopkast in de slaapkamer is de meest gewilde upgrade bij nieuwbouw. Door een aparte kamer of grote nis volledig in te richten als kleedruimte, houd je de slaapkamer zelf rustig en overzichtelijk.",
   "€3.000 – €10.000 afhankelijk van grootte",
   "6–10 weken",
   [("Hoe groot moet een inloopkast in de slaapkamer zijn?","Minimale bruikbare afmetingen: 1,5 m × 1,5 m met looppad van 90 cm. Ideaal: 2 m × 2,5 m. Voor een eiland in het midden: minimaal 3 m × 3 m."),
    ("Verlichting in de inloopkast — welk systeem?","Bewegingssensor met LED-verlichting is de handigste oplossing. Gebruik 3000K (warm wit) voor een aangename sfeer. Zorg voor minimaal 200 lux op de kledingzone."),
    ("Inloopkast laten maken of zelf IKEA PAX?","IKEA PAX kost €800–€2.000 voor een complete inloopkast maar past niet in onregelmatige ruimtes. Maatwerk kost meer (€3.000+) maar past perfect en ziet er professioneler uit. Bij een prominente slaapkamer is maatwerk de betere keuze.")],
   [("/op-maat/kasten-en-opbergen/inloopkast-op-maat/","Inloopkast op maat"),("/op-maat/slaapkamer/bedombouw-op-maat/","Bedombouw op maat"),("/op-maat/slaapkamer/","← Terug naar slaapkamer")]),

  ("slaapkamer","Slaapkamer","bedombouw-op-maat","Bedombouw op maat",
   "Bedombouw op maat laten maken — materialen, prijzen en ontwerptips",
   "Bedombouw op maat voor nieuwbouw: prijzen €800–€4.000, welk materiaal je kiest en hoe je een bedombouw combineert met opbergruimte.",
   "Een bedombouw op maat geeft de slaapkamer een rustige, ingebouwde uitstraling. Je kiest zelf de hoogte, de diepte van eventuele opbergladen, het materiaal en de afwerking. Populaire uitvoeringen zijn zwevend (gestripte plint) of op pootjes.",
   "€800 – €4.000 afhankelijk van uitvoering",
   "4–8 weken",
   [("Wat kost een bedombouw op maat?","Een eenvoudige bedombouw (houten frame met beklede zijpanelen) kost €800–€1.500. Met geïntegreerde opberglades €1.500–€2.500. Met bedombouw inclusief hoofdbord en nachtkastjes €2.500–€5.000."),
    ("Kan ik opbergruimte integreren in de bedombouw?","Ja. Klapboxen (hydraulisch) of uitschuifbare lades onder het bed zijn populaire opties. Klapboxen bieden meer ruimte maar zijn minder dagelijks toegankelijk. Lades zijn handiger maar kosten meer."),
    ("Welk materiaal gebruik je voor een bedombouw?","MDF met stofbekleding is de standaard — warm en geluidsdempend. MDF gespoten lak is strakker en stofvrij. Houtfineer of plaatmateriaal voor een natuurlijk karakter. Combinaties zijn ook mogelijk.")],
   [("/op-maat/slaapkamer/hoofdbord-op-maat/","Hoofdbord op maat"),("/op-maat/slaapkamer/inloopkast-slaapkamer/","Inloopkast slaapkamer"),("/op-maat/slaapkamer/","← Terug naar slaapkamer")]),

  ("slaapkamer","Slaapkamer","hoofdbord-op-maat","Hoofdbord op maat",
   "Hoofdbord op maat laten maken — bekleding, maten en prijzen",
   "Hoofdbord op maat voor de slaapkamer: prijzen €300–€1.500, populaire materialen (stof, leer, hout) en de beste maten voor een comfortabel hoofdbord.",
   "Een hoofdbord op maat is een van de eenvoudigste manieren om de slaapkamer een exclusief karakter te geven. Je bepaalt de breedte (gelijk aan het bed of breder), de hoogte, het materiaal en de bekleding.",
   "€300 – €1.500 afhankelijk van materiaal en maat",
   "3–6 weken",
   [("Wat kost een hoofdbord op maat?","Een eenvoudig gestoffeerd hoofdbord (MDF + schuim + stof) kost €300–€600. Met lederlook of echt leer €500–€1.200. Een hoofdbord met geïntegreerde LED-verlichting of wandpanelen €800–€2.000."),
    ("Hoe breed en hoog maak ik een hoofdbord?","Breedte: gelijk aan de breedte van het bed of 20 cm breder aan elke zijde. Hoogte: minimaal 70 cm boven de matras, ideaal 100–120 cm. Voor een statement: vloer-tot-plafond panelen."),
    ("Welk stof kiest je voor een gestoffeerd hoofdbord?","Meubelstof of linnen: betaalbaar en verkrijgbaar in vele kleuren. Velours: luxe en warm. Lederlook: gemakkelijk schoon te maken. Vermijd lichte kleuren als je graag leest in bed — vlekken zijn zichtbaar.")],
   [("/op-maat/slaapkamer/bedombouw-op-maat/","Bedombouw op maat"),("/op-maat/slaapkamer/inloopkast-slaapkamer/","Inloopkast slaapkamer"),("/op-maat/slaapkamer/","← Terug naar slaapkamer")]),

  ("slaapkamer","Slaapkamer","kinderkamer-op-maat","Kinderkamer op maat inrichten",
   "Kinderkamer op maat inrichten — bedstee, bureau en opbergruimte",
   "Kinderkamer op maat met bedstee, bureau en opbergkasten: prijzen €1.500–€8.000. Benutte ook de kleinste kinderkamer maximaal met slim maatwerk.",
   "In nieuwbouw zijn kinderkamers zelden ruim. Een maatwerk oplossing — bedstee, hoekbureau, of een hoogslaper met opbergruimte — benut elke vierkante meter optimaal. Zo groeit een kinderkamer van 8 m² uit tot een complete leef- en slaapruimte.",
   "€1.500 – €8.000 afhankelijk van indeling",
   "6–10 weken",
   [("Wat kost een maatwerk kinderkamer?","Een bedstee met bureau eronder kost €1.500–€3.000. Een complete inrichting (bed, bureau, kledingkast, planken) kost €3.000–€7.000. Bedden met schuiflade €200–€500 extra."),
    ("Bedstee of hoogslaper — wat is beter?","Een bedstee is ingebouwd en geeft een ruimtebesparing van ~4 m². Een hoogslaper is los, goedkoper en flexibel. Voor kleine kamers (<10 m²) is een bedstee de betere keuze omdat de onderliggende ruimte volledig bruikbaar is als bureau of speelhoek."),
    ("Op welke leeftijd is een bedstee geschikt?","Vanaf 6 jaar is een kind groot genoeg voor een bedstee met trap. Jonger: ga voor een laag bed en later uitbouwen. Let op veiligheid: de zijleuning moet minimaal 20 cm boven de matras uitsteken.")],
   [("/op-maat/slaapkamer/bedombouw-op-maat/","Bedombouw op maat"),("/op-maat/kasten-en-opbergen/inbouwkast-op-maat/","Inbouwkast op maat"),("/op-maat/slaapkamer/","← Terug naar slaapkamer")]),

  # ── BADKAMER ────────────────────────────────────────────────────
  ("badkamer","Badkamer","badkamermeubel-op-maat","Badkamermeubel op maat",
   "Badkamermeubel op maat laten maken — materialen, prijzen en afmetingen",
   "Badkamermeubel op maat voor nieuwbouw: prijzen €600–€3.000, vochtbestendige materialen en hoe je de indeling afstemt op jouw badkamer.",
   "Een badkamermeubel op maat past precies op de beschikbare ruimte, sluit aan op de aansluitpunten die de aannemer heeft aangelegd, en heeft exact de indeling die jij wilt — van laden tot open vakken en geïntegreerde verlichting.",
   "€600 – €3.000 afhankelijk van grootte en materiaal",
   "4–8 weken",
   [("Wat kost een badkamermeubel op maat?","Een enkelvoudig onderkast (60 cm breed) kost €600–€1.200. Een badkamerwand met dubbel wastafel en spiegelkast €2.000–€4.500."),
    ("Welk materiaal is vochtbestendig voor een badkamermeubel?","PVC, Trespa en gelakt MDF (vochtwerend) zijn de beste keuzes. Massief hout is mooier maar gevoeliger voor vocht en vraagt meer onderhoud. Vermijd onbehandeld MDF — dit zwelt op bij aanhoudend vocht."),
    ("Moet ik ook de afvoer aanpassen voor een maatwerkkast?","Niet per se, maar check wel de aansluitpositie. Een maatwerkleverancier past het meubel aan op de bestaande afvoerposities. Verplaatsen van afvoer kost €300–€800 extra.")],
   [("/op-maat/badkamer/wastafelblad-op-maat/","Wastafelblad op maat"),("/op-maat/badkamer/spiegelkast-op-maat/","Spiegelkast op maat"),("/op-maat/badkamer/","← Terug naar badkamer")]),

  ("badkamer","Badkamer","wastafelblad-op-maat","Wastafelblad op maat",
   "Wastafelblad op maat laten maken — composiet, keramiek of natuursteen",
   "Wastafelblad op maat voor de badkamer: materialen vergeleken (composiet, keramiek, marmer), prijzen €300–€1.500 en de beste dikte voor jouw onderbouw.",
   "Een wastafelblad op maat wordt gesneden op de exacte breedte, diepte en kraangaten van jouw badkamer. Je kiest het materiaal, de afwerking en of je een geïntegreerde spoelbak wilt of een oplegwas.",
   "€300 – €1.500 afhankelijk van materiaal en maat",
   "2–4 weken",
   [("Welk materiaal kies ik voor een wastafelblad?","Composiet (Corian, HI-MACS): naadloos, goed repareerbaar, €400–€900. Keramiek: hard, krasbestendig, €500–€1.200. Marmer of graniet: luxe, €600–€1.500. Hout: warm maar vraagt onderhoud, €400–€800."),
    ("Wat kost een wastafelblad op maat?","Een composiet blad van 80 cm breed kost €350–€600 incl. zaagwerk en kraangat. Een keramisch blad kost €450–€900. Inclusief plaatsing: €150–€300 extra."),
    ("Geïntegreerde spoelbak of oplegwas?","Geïntegreerde (onder)spoelbak: naadloos en makkelijk schoon te maken, populairste keuze. Oplegwas: meer uitstraling maar een naad die schoongehouden moet worden. Onderbouwwas: nettes dan oplegwas.")],
   [("/op-maat/badkamer/badkamermeubel-op-maat/","Badkamermeubel op maat"),("/op-maat/badkamer/spiegelkast-op-maat/","Spiegelkast op maat"),("/op-maat/badkamer/","← Terug naar badkamer")]),

  ("badkamer","Badkamer","spiegelkast-op-maat","Spiegelkast op maat",
   "Spiegelkast op maat laten maken — maten, verlichting en opbergruimte",
   "Spiegelkast op maat voor de badkamer: prijzen €400–€2.000, geïntegreerde LED-verlichting en hoe je de indeling optimaal benut in jouw nieuwbouwbadkamer.",
   "Een spiegelkast op maat combineert een grote spiegel met opbergruimte achter de spiegeldeur. Ideaal boven het wastafelblad — de breedte volgt exact de maten van het meubel eronder, de hoogte gaat tot het plafond als je wilt.",
   "€400 – €2.000 afhankelijk van grootte en verlichting",
   "3–6 weken",
   [("Wat kost een spiegelkast op maat?","Een enkelvoudige spiegelkast (60 cm) zonder verlichting kost €400–€700. Met geïntegreerde LED-rand €600–€1.000. Een brede spiegelkast (120 cm) met 2 deuren en verlichting €1.000–€2.000."),
    ("Welke verlichting in een spiegelkast?","LED-strip rondom de spiegel (4000K daglicht) is het meest funtioneel voor make-up en scheren. Verlichting boven de spiegel geeft schaduwen. Kies een kleurtemperatuur van 3500–4000K voor de badkamer."),
    ("Vaste of losse spiegelkast?","Een vaste (ingebouwde) spiegelkast is dieper en past in een nis. Een losse hangt voor de wand en is makkelijker te vervangen. In nieuwbouw is een ingebouwde spiegelkast strakker en ruimtebesparend.")],
   [("/op-maat/badkamer/badkamermeubel-op-maat/","Badkamermeubel op maat"),("/op-maat/badkamer/wastafelblad-op-maat/","Wastafelblad op maat"),("/op-maat/badkamer/","← Terug naar badkamer")]),

  ("badkamer","Badkamer","douchecabine-op-maat","Douchecabine op maat",
   "Douchecabine op maat laten maken — prijzen, glas en profielen",
   "Douchecabine op maat voor nieuwbouw: prijzen €800–€3.500, glasdikte en profielkeuze. Hoe je de perfecte douche-afbakening krijgt voor jouw badkamer.",
   "Een douchecabine op maat past precies in de nis of het hoekje dat de aannemer voor jou heeft aangelegd. Je kiest de glasdikte, het profieltype (chroom, mat zwart, goud) en of je een deur met of zonder onderprofiel wilt.",
   "€800 – €3.500 afhankelijk van type en materiaal",
   "3–6 weken",
   [("Wat kost een douchecabine op maat?","Een eenvoudige douchewand (zonder draaideur) kost €400–€900. Een inloopdouche met 1 vaste wand en 1 draaideur kost €800–€1.800. Een complete douchehoek met 2 wanden en deur: €1.200–€3.500."),
    ("Welke glasdikte is het beste?","Minimaal 8 mm gehard glas voor een inloopdouche. 6 mm is voldoende voor een ingekaderde douchecabine. Dikkere glas (10 mm) geeft een luxueuzer gevoel en is stabieler. Let op: zwaarder glas vraagt sterker beslag."),
    ("Inloopdouche of douchecabine — wat past bij nieuwbouw?","Een inloopdouche (zonder deuren) ziet er luxe uit maar vraagt meer vloeroppervlak (minimaal 90×90 cm). Een douchecabine met deur is ruimtebesparend. In nieuwbouw met kleine badkamers is een cabine praktischer.")],
   [("/op-maat/badkamer/badkamermeubel-op-maat/","Badkamermeubel op maat"),("/op-maat/badkamer/bad-op-maat/","Bad op maat"),("/op-maat/badkamer/","← Terug naar badkamer")]),

  ("badkamer","Badkamer","bad-op-maat","Bad op maat",
   "Bad op maat laten maken — vrijstaand, ingebouwd of hoekbad",
   "Bad op maat voor de badkamer: prijzen €1.500–€8.000, vergelijking vrijstaand vs ingebouwd en welke maten bij nieuwbouwbadkamers passen.",
   "Een bad op maat — of het nu een ingebouwd bad met stenen omlijsting is of een vrijstaand designbad — maakt de badkamer direct bijzonder. In nieuwbouw is er soms ruimte voor een bad naast de douche, maar de exacte maten bepalen wat mogelijk is.",
   "€1.500 – €8.000 afhankelijk van type",
   "4–8 weken",
   [("Wat kost een bad op maat?","Een ingebouwd bad met betegelde omlijsting kost €1.500–€3.000 (bad + werk). Een vrijstaand acryl bad kost €800–€2.500. Een vrijstaand composiet of stenen bad €3.000–€8.000+."),
    ("Welke minimale ruimte heb ik nodig voor een bad?","Een standaard bad is 170 cm lang en 70–75 cm breed. Inclusief loopruimte aan één zijde (60 cm): minimaal 170 × 135 cm vloeroppervlak. Hoekbaden zijn dieper (80–90 cm) en passen in hoeken."),
    ("Vrijstaand of ingebouwd bad — wat is beter?","Vrijstaand: visueel aantrekkelijker, makkelijker te schoonmaken rondom. Ingebouwd: ruimtebesparend, afwerking met tegels sluit aan op de rest van de badkamer. Kies vrijstaand als het bad een eye-catcher mag zijn.")],
   [("/op-maat/badkamer/douchecabine-op-maat/","Douchecabine op maat"),("/op-maat/badkamer/badkamermeubel-op-maat/","Badkamermeubel op maat"),("/op-maat/badkamer/","← Terug naar badkamer")]),

  # ── WOONKAMER ───────────────────────────────────────────────────
  ("woonkamer","Woonkamer","bankstellen-op-maat","Bankstellen op maat",
   "Bankstellen op maat laten maken — stof, maten en prijzen",
   "Bankstellen op maat voor de woonkamer: prijzen €2.000–€8.000, stoffen en materialen vergeleken en hoe je de perfecte maat bepaalt voor jouw ruimte.",
   "Een bank op maat heeft precies de breedte, diepte en hoogte die jij wilt, in de stof of het leer van jouw keuze. Ideaal als de standaard maten (220 cm, 260 cm) niet passen in jouw woonkamer-indeling.",
   "€2.000 – €8.000 afhankelijk van grootte en materiaal",
   "8–14 weken",
   [("Wat kost een bank op maat?","Een 2,5-zitsbank op maat in standaard meubelstof kost €2.000–€3.500. In leer of premium stof €3.000–€6.000. Een modulaire hoekbank op maat kost €3.500–€8.000+."),
    ("Welk materiaal kies ik voor een maatwerk bank?","Stof: warmer en in vele kleuren, €2.000+. Teddy/bouclé: trendgevoelig maar comfortabel. Leer: duurzaam en makkelijk schoon, €500–€1.500 extra. Kunstleer: goedkoper alternatief maar minder duurzaam."),
    ("Hoe bepaal ik de juiste bankmaat?","Laat minimaal 45 cm loopruimte rondom de bank. Een 3-zitsbank vraagt 200–240 cm. Meet of je een hoekbank kunt plaatsen — dat geeft meer zitcomfort per vierkante meter. Stel je ook een ottoman voor als optie.")],
   [("/op-maat/woonkamer/eettafel-op-maat/","Eettafel op maat"),("/op-maat/woonkamer/roomdivider-op-maat/","Roomdivider op maat"),("/op-maat/woonkamer/","← Terug naar woonkamer")]),

  ("woonkamer","Woonkamer","eettafel-op-maat","Eettafel op maat",
   "Eettafel op maat laten maken — materialen, maten en prijzen",
   "Eettafel op maat voor de woonkamer: prijzen €1.200–€5.000, materialen vergeleken (eiken, keramiek, metaal) en de ideale maten per aantal personen.",
   "Een eettafel op maat heeft precies de afmetingen die passen bij jouw eetkamerruimte en het aantal personen aan tafel. Je kiest het blad (massief hout, keramiek, glas) en het onderstel (metalen poot, houten trestle, U-frame).",
   "€1.200 – €5.000 afhankelijk van materiaal",
   "6–12 weken",
   [("Wat kost een eettafel op maat?","Een massief eikenhouten tafel (200 cm) kost €1.500–€3.000. Keramisch blad met metalen poot €1.800–€3.500. Een meer designtafel (marmer, bijzonder hout) €3.000–€8.000."),
    ("Welke maat eettafel per aantal personen?","2 personen: 80×80 cm. 4 personen: 120–140 cm lang. 6 personen: 160–180 cm. 8 personen: 200–220 cm. Reken 60 cm breedte en 80 cm lengte per persoon als minimum."),
    ("Welk materiaal is het meest duurzaam?","Massief eiken: langdurig en herstelbaar (opschuren). Keramiek: krasbestendig en hitteresistent, ideaal met kinderen. Glas: mooi maar toont vingerafdrukken. Marmer: luxe maar gevoelig voor vlekken.")],
   [("/op-maat/woonkamer/bankstellen-op-maat/","Bankstellen op maat"),("/op-maat/woonkamer/bureau-op-maat/","Bureau op maat"),("/op-maat/woonkamer/","← Terug naar woonkamer")]),

  ("woonkamer","Woonkamer","bureau-op-maat","Bureau op maat",
   "Bureau op maat laten maken — thuis werken, prijzen en ergonomie",
   "Bureau op maat voor thuiswerken in nieuwbouw: prijzen €600–€3.000, ergonomische maten en hoe je een ingebouwd bureau maakt dat past bij jouw werkplek.",
   "Een bureau op maat is ideaal als je thuis werkt en een vaste werkplek wilt die naadloos opgaat in het interieur. Ingebouwde bureaus, hoekbureaus en bureaus met kast eronder zijn populaire maatwerkopties.",
   "€600 – €3.000 afhankelijk van type",
   "4–8 weken",
   [("Wat kost een bureau op maat?","Een eenvoudig bureau (blad + poot) kost €600–€1.200. Met kast of lades eronder €1.000–€2.000. Een volledig ingebouwde werkhoek (bureau + kasten) €2.000–€4.000."),
    ("Welke ergonomische maten gebruik ik voor een bureau?","Standaard werkhoogte: 72–76 cm (zittend). Voor een zit-sta bureau: verstelbaar van 65 tot 125 cm. Diepte: minimaal 60 cm, ideaal 70–80 cm. Breedte per persoon: minimaal 90 cm, ideaal 120–160 cm."),
    ("Hoe integreer ik kabelmanagement in een maatwerk bureau?","Bouw een kabeldoorvoer (grommet) in het blad voor stroomkabels en USB. Voeg een kabelgoot aan de achterzijde toe. Overweeg een ingebouwde stekkerdoos in de la voor opladers.")],
   [("/op-maat/woonkamer/eettafel-op-maat/","Eettafel op maat"),("/op-maat/kasten-en-opbergen/wandmeubel-op-maat/","Wandmeubel op maat"),("/op-maat/woonkamer/","← Terug naar woonkamer")]),

  ("woonkamer","Woonkamer","roomdivider-op-maat","Roomdivider op maat",
   "Roomdivider op maat laten maken — vrijstaand, vast of open rek",
   "Roomdivider op maat voor de woonkamer: prijzen €800–€4.000, welk type past bij jouw ruimte en hoe je woon- en eetgedeelte visueel scheidt.",
   "Een roomdivider op maat scheidt woon- en eetgedeelte of creëert een privacyzone in een open plattegrond. In nieuwbouw met grote woonkamers is een roomdivider een populaire manier om structuur te geven zonder muren te plaatsen.",
   "€800 – €4.000 afhankelijk van type",
   "4–8 weken",
   [("Wat kost een roomdivider op maat?","Een open boekenkast als roomdivider (MDF) kost €800–€1.800. Een stalen frame met glazen panelen €1.200–€3.000. Een houten of MDF vaste wand met doorkijkopeningen €1.500–€4.000."),
    ("Vrijstaand of vast — wat is beter?","Vrijstaand is flexibel maar kan omvallen bij contact. Vast (bevestigd aan plafond of vloer) is stabieler en geeft een meer permanente indeling. In nieuwbouw is vastzetten aan plafond de veiligste optie."),
    ("Welke hoogte heeft een roomdivider?","Voor visuele scheiding: 120–150 cm (je kijkt er overheen). Voor volledige scheiding: vloer tot plafond. Een halfhoge roomdivider (120 cm) met planken is de populairste combinatie: scheidt maar houdt de ruimte luchtig.")],
   [("/op-maat/woonkamer/bankstellen-op-maat/","Bankstellen op maat"),("/op-maat/kasten-en-opbergen/wandmeubel-op-maat/","Wandmeubel op maat"),("/op-maat/woonkamer/","← Terug naar woonkamer")]),

  # ── TRAP EN HAL ─────────────────────────────────────────────────
  ("trap-en-hal","Trap & hal","trapombouw-op-maat","Trapombouw op maat",
   "Trapombouw op maat laten maken — prijzen, materialen en stijlen",
   "Trapombouw op maat voor nieuwbouw: prijzen €2.000–€8.000, materialen vergeleken en welke stijl past bij jouw interieur. Alles over het ombouwen van de standaard nieuwbouwtrap.",
   "De standaard nieuwbouwtrap is functioneel maar zelden mooi. Een trapombouw vervangt de bestaande treden, stootborden en balusters door materialen die passen bij jouw interieur — van eiken treden met stalen spijlen tot een volledig wit geschilderd geheel.",
   "€2.000 – €8.000 afhankelijk van type",
   "4–8 weken",
   [("Wat kost een trapombouw?","Alleen nieuwe treden plaatsen kost €1.500–€3.000. Treden + balusters + leuning: €3.000–€6.000. Complete renovatie met kwartslag en nieuwe constructie: €5.000–€12.000."),
    ("Welke materialen zijn populair voor een trapombouw?","Eiken (massief of fineer): warm en duurzaam, meest gekozen. Beton-look: industrieel. Staal met houten treden: modern. Wit MDF met stalen spijlen: Scandinavisch. Kies op basis van het interieur."),
    ("Moet ik een vergunning aanvragen voor een trapombouw?","Nee, een trapombouw is een verbouwing binnenshuis en vereist geen vergunning. Wel moet de trap voldoen aan de bouwnormen (minimale tredediepte 22 cm, maximale stijghoogte 21 cm).")],
   [("/op-maat/trap-en-hal/trapleuning-op-maat/","Trapleuning op maat"),("/op-maat/trap-en-hal/garderobewand-op-maat/","Garderobewand op maat"),("/op-maat/trap-en-hal/","← Terug naar trap & hal")]),

  ("trap-en-hal","Trap & hal","trapleuning-op-maat","Trapleuning op maat",
   "Trapleuning op maat laten maken — materialen, normen en prijzen",
   "Trapleuning op maat voor nieuwbouw: prijzen €400–€2.500, materialen vergeleken (hout, staal, RVS) en welke normen gelden voor de hoogte en doorboring.",
   "Een trapleuning op maat past bij de breedte en hoogte van jouw trap en kan worden gemaakt in het materiaal dat aansluit op de rest van de trapombouw. Populaire combinaties: eikenhouten leuning met stalen spijlen, of een RVS leuning met glazen panelen.",
   "€400 – €2.500 afhankelijk van materiaal en lengte",
   "3–6 weken",
   [("Wat kost een trapleuning op maat?","Een houten leuning (eiken, 4 meter) kost €400–€900. RVS leuning €600–€1.500. Een complete balustrade (leuning + spijlen, 10 treden) kost €1.200–€3.500."),
    ("Welke hoogte moet een trapleuning hebben?","Minimale hoogte: 90 cm boven de trede. Aan de bovenzijde en op overloop: 100 cm. Dit zijn de Bouwbesluit-normen in Nederland. Afwijken naar beneden is niet toegestaan."),
    ("Houten of stalen leuning — wat is beter?","Hout: warm, traditioneel, te schilderen of te behandelen. Staal: modern, duurzaam, minder onderhoud. RVS: meest onderhoudsvriendelijk en hygiënisch. Combinaties (houten handgreep op stalen spijlen) zijn populairste keuze.")],
   [("/op-maat/trap-en-hal/trapombouw-op-maat/","Trapombouw op maat"),("/op-maat/trap-en-hal/garderobewand-op-maat/","Garderobewand op maat"),("/op-maat/trap-en-hal/","← Terug naar trap & hal")]),

  ("trap-en-hal","Trap & hal","garderobewand-op-maat","Garderobewand op maat",
   "Garderobewand op maat laten maken — hal, entree en gang",
   "Garderobewand op maat voor de hal: prijzen €1.200–€4.000, indeling met kapstok, schoenenkast en spiegel. De entree van je nieuwbouwwoning optimaal benutten.",
   "De hal in nieuwbouw is zelden groot. Een garderobewand op maat combineert kapstok, schoenenkast en eventueel een spiegel in één ingebouwde oplossing die de beschikbare wandbreedte volledig benut.",
   "€1.200 – €4.000 afhankelijk van grootte",
   "4–8 weken",
   [("Wat kost een garderobewand op maat?","Een eenvoudige garderobewand (kapstok + schoenenkast, 120 cm breed) kost €1.200–€2.000. Met spiegel en extra opbergruimte €1.800–€3.500."),
    ("Welke indeling is handig voor een garderobewand?","Kapstokgedeelte: 150–180 cm hoog voor jassen, lager voor kinderkleding. Schoenenvakken: 20–25 cm diep. Bovenste vakken: voor tassen en koffers. Spiegel: ideaal naast de deur om snel te checken voor je vertrekt."),
    ("Moet ik de kapstok in de wand verankeren?","Ja, bij een muurvaste garderobewand worden bevestigingspunten in de wand aangebracht. In nieuwbouw met steenwol-gevulde wanden zijn extra muurankers nodig (gipsdeuvel of doorsteekanker). Dit doet de installateur.")],
   [("/op-maat/trap-en-hal/trapombouw-op-maat/","Trapombouw op maat"),("/op-maat/kasten-en-opbergen/inbouwkast-op-maat/","Inbouwkast op maat"),("/op-maat/trap-en-hal/","← Terug naar trap & hal")]),

  # ── RAAMDECORATIE ───────────────────────────────────────────────
  ("raamdecoratie","Raamdecoratie","gordijnen-op-maat","Gordijnen op maat",
   "Gordijnen op maat laten maken — stof, ophangmethode en prijzen",
   "Gordijnen op maat voor nieuwbouw: prijzen €150–€800 per raam, populaire stoffen en ophangmethodes. Alles wat je moet weten voor de juiste gordijnen.",
   "Gordijnen op maat worden gesneden en gestikt op de exacte hoogte en breedte van jouw ramen. In nieuwbouw zijn ramen zelden standaard — op maat gesneden gordijnen zorgen voor een perfecte val zonder te kort of te lang.",
   "€150 – €800 per raam afhankelijk van stof",
   "3–6 weken na opmeting",
   [("Wat kosten gordijnen op maat?","Eenvoudige linnen gordijnen op maat: €150–€300 per raam incl. confectie. Verduisterende gordijnen: €200–€400. Premium stof (velours, zijde-look): €350–€800 per raam. Vloer-tot-plafond gordijnen zijn duurder door meer stof."),
    ("Wanneer maak ik gordijnen op maat voor nieuwbouw?","Na sleuteloverdracht: laat opmeten door de leverancier. Bestelling en productie: 3–6 weken. Ophangen: na eventuele schilderwerken zodat er geen stofschade is. Wacht niet te lang — je wilt gordijnen bij intrek voor privacy."),
    ("Welk ophangmateriaal kies ik?","Roede: eenvoudig en klassiek. Railsysteem: functioneler voor zware gordijnen en schuiven. Plafondmontage: modern en minimalistisch. Kies plafondmontage als je vloer-tot-plafond gordijnen wilt voor maximale ruimtelijkheid.")],
   [("/op-maat/raamdecoratie/shutters-op-maat/","Shutters op maat"),("/op-maat/raamdecoratie/vouwgordijnen-op-maat/","Vouwgordijnen op maat"),("/op-maat/raamdecoratie/","← Terug naar raamdecoratie")]),

  ("raamdecoratie","Raamdecoratie","shutters-op-maat","Shutters op maat",
   "Shutters op maat laten maken — hout, PVC en aluminium vergeleken",
   "Shutters op maat voor nieuwbouw: prijzen €300–€900 per raam, materialen vergeleken (hout, PVC, aluminium) en hoe je ze laat monteren.",
   "Shutters op maat worden gemaakt in het exacte formaat van elk raam. Ze bieden maximale privacy-controle door de lamellen te draaien, blokkeren direct zonlicht en zien er strak uit. Populair in nieuwbouw door de strakke, tijdloze uitstraling.",
   "€300 – €900 per raam afhankelijk van materiaal",
   "4–8 weken na opmeting",
   [("Wat kosten shutters op maat?","PVC shutters: €300–€500 per raam (meest onderhoudsvriendelijk). Houten shutters: €500–€800 per raam (warmer, maar gevoeliger voor vocht). Aluminium: €600–€1.000 per raam (voor buiten of vochtige ruimtes)."),
    ("PVC of houten shutters — wat is beter?","PVC: waterbestendig, geschikt voor badkamer en keuken, goedkoper. Hout: warmer uitstraling, goed te schilderen. In woonkamers kies je vaker voor hout; in natte ruimtes is PVC de betere keuze."),
    ("Zijn shutters geschikt voor dakramen?","Ja, speciaal gevormde shutters zijn beschikbaar voor schuine of driehoekige ramen. Prijs is hoger (€600–€1.500) door de complexere productie. Let op: alleen te openen als de lamellen gekanteld zijn.")],
   [("/op-maat/raamdecoratie/gordijnen-op-maat/","Gordijnen op maat"),("/op-maat/raamdecoratie/jaloezieen-op-maat/","Jaloezieen op maat"),("/op-maat/raamdecoratie/","← Terug naar raamdecoratie")]),

  ("raamdecoratie","Raamdecoratie","jaloezieen-op-maat","Jaloezieen op maat",
   "Jaloezieen op maat laten maken — materialen, bedieningstypes en prijzen",
   "Jaloezieen op maat voor nieuwbouw: prijzen €80–€400 per raam, aluminium vs hout, bediening (handmatig, koordloos, elektrisch). Welke keuze past bij jou?",
   "Jaloezieen op maat worden gesneden op de millimeter voor elk raam. Je kiest het materiaaltype (aluminium, hout, bamboe), de lamel-breedte en de bediening. Een populaire keuze voor kantoorruimtes, werkkamers en keukens.",
   "€80 – €400 per raam afhankelijk van type",
   "2–4 weken",
   [("Wat kosten jaloezieen op maat?","Aluminium jaloezieen (25 mm): €80–€150 per raam. Houten jaloezieen (50 mm): €150–€300 per raam. Elektrisch bediend (smart): €250–€500 per raam."),
    ("Welke lamelbreedte kies ik?","25 mm: compact, veel controle over lichtinval. 50 mm: moderner en makkelijker schoon te maken. 70+ mm: meer licht als open, stoerder karakter. Kies 25 mm voor kleine ramen, 50 mm voor grote ramen."),
    ("Koordloos of met koord?","Koordloos is veiliger (kinderen) en ziet er strakker uit. Met koord geeft meer controle over exacte hoogte. Kies koordloos in kinderkamers; met koord als je fijnregeling wilt.")],
   [("/op-maat/raamdecoratie/shutters-op-maat/","Shutters op maat"),("/op-maat/raamdecoratie/vouwgordijnen-op-maat/","Vouwgordijnen op maat"),("/op-maat/raamdecoratie/","← Terug naar raamdecoratie")]),

  ("raamdecoratie","Raamdecoratie","vouwgordijnen-op-maat","Vouwgordijnen op maat",
   "Vouwgordijnen op maat laten maken — stof, bediening en prijzen",
   "Vouwgordijnen op maat voor nieuwbouw: prijzen €100–€400 per raam, stoffen vergeleken (verduisterend, daglicht, transparant) en bedieningstypes.",
   "Vouwgordijnen op maat worden gevouwen opgetrokken en bieden een strakker alternatief voor gordijnen. Ze zijn populair voor dakramen, nissen en kleine ramen. Je kiest het stoftype (transparant, daglicht, verduisterend) en de bediening.",
   "€100 – €400 per raam afhankelijk van stof",
   "2–5 weken",
   [("Wat kosten vouwgordijnen op maat?","Transparant stof: €100–€200 per raam. Daglichtstof: €150–€250. Verduisterend: €200–€350. Elektrisch bediend: €250–€450 per raam."),
    ("Verduisterend of daglicht vouwgordijn?","Verduisterend: voor slaapkamers en thuisbioscoop. Daglichtstof: filtert direct zonlicht, houdt ruimte licht. Transparant: privacy maar volop licht. Combineer verduisterend met transparant in slaapkamers voor dag/nacht gebruik."),
    ("Zijn vouwgordijnen geschikt voor dakramen?","Ja, speciaal voor dakramen zijn vouwgordijnen met extra rail verkrijgbaar die langs het raam schuiven. Let op: de maten moeten exact overeenkomen — minimale afwijking geeft kieren.")],
   [("/op-maat/raamdecoratie/gordijnen-op-maat/","Gordijnen op maat"),("/op-maat/raamdecoratie/jaloezieen-op-maat/","Jaloezieen op maat"),("/op-maat/raamdecoratie/","← Terug naar raamdecoratie")]),

  # ── VERLICHTING ─────────────────────────────────────────────────
  ("verlichting","Verlichting","lichtplan-op-maat","Lichtplan op maat laten maken",
   "Lichtplan op maat laten maken voor nieuwbouw — wanneer, hoe en kosten",
   "Lichtplan op maat voor nieuwbouw: wanneer je het moet maken (vóór stucwerk), wat het kost (€300–€800) en hoe je voorkomt dat je later dure aanpassingen nodig hebt.",
   "Een lichtplan op maat bepaalt waar inbouwspots, wandlampen, schakelgroepen en dimmers komen in jouw nieuwbouwwoning. Dit plan maak je vóórdat het stucwerk wordt aangebracht — achteraf aanpassen kost 3–5× meer.",
   "€300 – €800 voor een professioneel lichtplan",
   "1–2 weken",
   [("Wanneer moet een lichtplan klaar zijn?","Vóór het aanbrengen van stucwerk (ruwbouwfase). De elektricien legt dan de leidingen aan op basis van het plan. Bij nieuwbouw is dit na het plaatsen van de kozijnen, vóór het stucken van de wanden."),
    ("Wat bevat een goed lichtplan?","Plattegrond met exacte spot-posities, schakelposities, dimmerzones, wandlichtpunten en een eventuele slimme verlichtingsschema. Inclusief specificaties voor armaturen (vermogen, kleurtemperatuur, dimbaar)."),
    ("Kan ik zelf een lichtplan maken?","Ja, met tools als Dialux of DIALux evo (gratis). Maar een professionele lichtdesigner geeft een meer uitgewerkt plan met materiaalkeuze. Kosten €300–€800. Sommige verlichtingswinkels bieden dit gratis aan als je armaturen afneemt.")],
   [("/op-maat/verlichting/inbouwspots-op-maat/","Inbouwspots op maat"),("/op-maat/verlichting/hanglamp-op-maat/","Hanglamp op maat"),("/nieuwbouw-gids/fase-2-bouwfase/lichtplan-nieuwbouw/","Lichtplan gids")]),

  ("verlichting","Verlichting","inbouwspots-op-maat","Inbouwspots op maat",
   "Inbouwspots op maat voor nieuwbouw — typen, plaatsing en prijzen",
   "Inbouwspots op maat voor nieuwbouw: welke typen (vast, kantelbaar, IP65), hoeveel spots per m², prijzen €20–€150 per spot en de beste plaatsing.",
   "Inbouwspots on maat verwijst naar een op maat geplande spotindeling — niet een standaard grid, maar een configuratie die aansluit op de functie van elke ruimte. Het gaat om het aantal, de positie en het type spot per vertrek.",
   "€20 – €150 per spot (armatuur), exclusief installatie",
   "Beslissen vóór stucwerk; armaturen 2–4 weken levertijd",
   [("Hoeveel inbouwspots per m²?","Als vuistregel: 1 spot per 1,5–2 m² plafondhoogte 2,6 m. In een woonkamer van 30 m²: 15–20 spots. Gebruik meer spots bij hogere plafonds (3 m+) of donkere ruimtes. Kook- en werkvlakken hebben extra spots nodig."),
    ("Vast of kantelbaar inbouwspot?","Vaste spots geven een strak plafond maar verlichten alleen recht naar beneden. Kantelbare spots kunnen accent geven op muren, schilderijen of werkbladen. Kies vast voor algemene verlichting; kantelbaar voor accenten."),
    ("Welk vermogen heeft een inbouwspot nodig?","5–7W LED per spot is voldoende bij 2,6 m plafondhoogte. Bij 3 m+ kies je voor 8–10W. Gebruik dimbare LED-spots met een compatibele dimmer. Kleurtemperatuur: 2700K (warm) voor woonkamer, 3000–4000K voor keuken en badkamer.")],
   [("/op-maat/verlichting/lichtplan-op-maat/","Lichtplan op maat"),("/op-maat/verlichting/hanglamp-op-maat/","Hanglamp op maat"),("/op-maat/verlichting/","← Terug naar verlichting")]),

  ("verlichting","Verlichting","hanglamp-op-maat","Hanglamp op maat",
   "Hanglamp op maat laten maken — materialen, maten en prijzen",
   "Hanglamp op maat voor nieuwbouw: prijzen €200–€2.000, populaire materialen (messing, beton, hout) en op welke hoogte je een hanglamp boven de eettafel hangt.",
   "Een hanglamp op maat is een statement-stuk boven de eettafel of in de woonkamer. Je kiest zelf het materiaal, de kleur, de kabellengte en het aantal lichtpunten. Populaire uitvoeringen: messing met globe, beton, rotan of een industriële multi-spot rail.",
   "€200 – €2.000 afhankelijk van type en materiaal",
   "3–8 weken",
   [("Op welke hoogte hang ik een hanglamp boven de eettafel?","De onderkant van de lamp hangt 70–80 cm boven het tafelblad. Bij hogere plafonds (3 m+) mag dit 80–90 cm zijn. De lamp mag niet in de zichtlijn zitten als je aan tafel zit — dat veroorzaakt verblinding."),
    ("Wat kost een hanglamp op maat?","Een maatwerk hanglamp van een lokale smid of glasblazers kost €400–€1.500. Een design hanglamp van Pholc, Ferm Living of Loftlight kost €200–€800. Op maat gemaakte railverlichting €600–€2.000."),
    ("Hoe zorg ik voor de juiste aansluiting bij nieuwbouw?","Laat vóór het stucwerk een kroonsteenpunt aanleggen op de exacte positie boven de eettafel (of een railspot-leiding). De kroonsteen-positie kan later nauwelijks worden verplaatst zonder stucwerk te breken.")],
   [("/op-maat/verlichting/lichtplan-op-maat/","Lichtplan op maat"),("/op-maat/verlichting/inbouwspots-op-maat/","Inbouwspots op maat"),("/op-maat/verlichting/","← Terug naar verlichting")]),

  # ── TUIN EN BUITEN ──────────────────────────────────────────────
  ("tuin-en-buiten","Tuin & buiten","overkapping-op-maat","Overkapping op maat",
   "Overkapping op maat laten maken — hout, aluminium en vergunning",
   "Overkapping op maat voor de tuin: prijzen €2.500–€12.000, hout vs aluminium, en wanneer je een vergunning nodig hebt voor je nieuwbouwtuin.",
   "Een overkapping op maat geeft je een beschermde buitenruimte die aansluit op de architectuur van je woning. Hout geeft warmte, aluminium is onderhoudsvriendelijker. De afmetingen passen precies bij de beschikbare tuinruimte.",
   "€2.500 – €12.000 afhankelijk van type en grootte",
   "4–10 weken",
   [("Heb ik een vergunning nodig voor een overkapping?","Vergunningsvrij als: achter of naast woning, maximaal 2,5 m hoog aan de gevel, maximaal 50% van het achtererf bebouwd. Oversteek mag groter zijn. Check altijd de lokale bestemmingsplanregels."),
    ("Hout of aluminium overkapping — wat is beter?","Hout: warmer, goedkoper (€2.500–€6.000), vraagt 5-jaarlijkse behandeling. Aluminium: duurzamer, onderhoudsvrij, duurder (€4.000–€12.000). Voor nieuwbouw past aluminium vaak beter bij de strakke architectuur."),
    ("Kan ik een overkapping combineren met zonnepanelen?","Ja. Speciale overkappingen met zonnepanelen-dak (solar carport of solar terras) zijn verkrijgbaar. De panelen fungeren als dakbedekking. Kosten €6.000–€15.000 incl. panelen. Je hebt hier bijna altijd een vergunning voor nodig.")],
   [("/op-maat/tuin-en-buiten/schutting-op-maat/","Schutting op maat"),("/op-maat/tuin-en-buiten/tuinverlichting-op-maat/","Tuinverlichting op maat"),("/op-maat/tuin-en-buiten/","← Terug naar tuin & buiten")]),

  ("tuin-en-buiten","Tuin & buiten","tuinschuur-op-maat","Tuinschuur op maat",
   "Tuinschuur op maat laten maken — hout, metaal en fundering",
   "Tuinschuur op maat voor nieuwbouwtuin: prijzen €1.500–€8.000, materialen vergeleken en wat je moet regelen voor plaatsing (fundering, vergunning).",
   "Een tuinschuur op maat past precies in de beschikbare ruimte in de tuin en is afgestemd op het doel — fietsen, tuingereedschap, buitenkeuken of hobbyruimte. Je kiest zelf de afmetingen, het materiaal en het daktype.",
   "€1.500 – €8.000 afhankelijk van grootte en materiaal",
   "4–8 weken",
   [("Wat kost een tuinschuur op maat?","Een houten schuur van 3×2 m kost €1.500–€3.000. Metalen schuur: €1.000–€2.500. Een grotere berging (4×3 m) met fundering: €3.000–€6.000. Luxe hobbykamer-schuur: €6.000–€15.000."),
    ("Heb ik een vergunning nodig voor een tuinschuur?","Vergunningsvrij als: maximaal 3 m hoog, maximaal 50% bebouwing van het achtererf, niet meer dan 2,5 m hoog naast een openbare weg. Check de bestemmingsplanregels voor jouw gemeente."),
    ("Welke fundering voor een tuinschuur?","Betonpoeren: goedkoopst en geschikt voor kleine schuren. Betontegels op puin: stabiel en eenvoudig. Betonfundering: voor grote of zware schuren. In nieuwe tuinen wacht je 6–12 maanden op aardverzakking voordat je een permanente fundering plaatst.")],
   [("/op-maat/tuin-en-buiten/overkapping-op-maat/","Overkapping op maat"),("/op-maat/tuin-en-buiten/schutting-op-maat/","Schutting op maat"),("/op-maat/tuin-en-buiten/","← Terug naar tuin & buiten")]),

  ("tuin-en-buiten","Tuin & buiten","schutting-op-maat","Schutting op maat",
   "Schutting op maat laten maken — hout, composiet en aluminium",
   "Schutting op maat voor de nieuwbouwtuin: prijzen €80–€300 per meter, materialen vergeleken en wat de maximale hoogte is zonder vergunning.",
   "Een schutting op maat past precies tussen de palen op de erfgrens en sluit aan op de lengte en eventuele hoogteverschillen van jouw tuin. Populaire materialen zijn vurenhout, hardwood, composiet en aluminium.",
   "€80 – €300 per strekkende meter afhankelijk van materiaal",
   "2–6 weken",
   [("Wat kost een schutting op maat per meter?","Grenen/vuren: €80–€120/m (behandeling elke 3–5 jaar). Hardwood (bangkirai): €120–€200/m (duurzamer). Composiet: €150–€250/m (onderhoudsvrij). Aluminium: €200–€350/m (meest duurzaam)."),
    ("Hoe hoog mag een schutting zijn zonder vergunning?","Aan de achtertuin: maximaal 2 m hoog vergunningsvrij. Aan de voortuin of langs openbare weg: maximaal 1 m. Hogere schuttingen kunnen omgevingsvergunning vereisen."),
    ("Composiet of hout — wat is de beste keuze?","Composiet is duurzamer (30+ jaar) en onderhoudsvrij maar duurder. Hout is goedkoper, geeft een warmere uitstraling maar vraagt jaarlijkse inspectie en regelmatig behandelen. Voor nieuwbouwtuinen is composiet een populaire duurzame keuze.")],
   [("/op-maat/tuin-en-buiten/overkapping-op-maat/","Overkapping op maat"),("/op-maat/tuin-en-buiten/tuinverlichting-op-maat/","Tuinverlichting op maat"),("/op-maat/tuin-en-buiten/","← Terug naar tuin & buiten")]),

  ("tuin-en-buiten","Tuin & buiten","terrasmeubilair-op-maat","Terrasmeubilair op maat",
   "Terrasmeubilair op maat laten maken — materialen, prijzen en zitcomfort",
   "Terrasmeubilair op maat voor nieuwbouwtuin: prijzen €800–€6.000, populaire materialen (teak, aluminium, polyrattan) en tips voor duurzame buitenstoelen.",
   "Terrasmeubilair op maat geeft je precies de tafelgrootte en het aantal stoelen dat past bij jouw terras en gezinsgrootte. Je kiest het materiaal, de kussenstof en de afmeting van de tafel.",
   "€800 – €6.000 afhankelijk van materiaal en grootte",
   "4–10 weken voor maatwerk",
   [("Wat kost terrasmeubilair op maat?","Aluminium terrasset (tafel + 4 stoelen): €800–€2.000. Teak houten set: €1.500–€4.000. Polyrattan loungeset op maat: €1.500–€5.000."),
    ("Welk materiaal voor buiten — teak, aluminium of polyrattan?","Teak: luxe, duurzaam, vraagt oliehouden. Aluminium: licht, roestvrij, onderhoudsvriendelijk. Polyrattan: comfortabel, weerbestendig, goedkoper. Staal poedercoat: sterk maar zwaarder."),
    ("Wanneer bestel ik terrasmeubilair voor nieuwbouw?","Bestel 6–8 weken voor je de tuin wilt gebruiken. Maatwerk heeft een langere levertijd (6–10 weken). Standaard sets zijn vaak al op voorraad. Wacht met plaatsen tot de bestrating klaar is.")],
   [("/op-maat/tuin-en-buiten/overkapping-op-maat/","Overkapping op maat"),("/op-maat/tuin-en-buiten/tuinverlichting-op-maat/","Tuinverlichting op maat"),("/op-maat/tuin-en-buiten/","← Terug naar tuin & buiten")]),

  ("tuin-en-buiten","Tuin & buiten","tuinverlichting-op-maat","Tuinverlichting op maat",
   "Tuinverlichting op maat — padverlichting, spots en sfeerverlichting",
   "Tuinverlichting op maat voor nieuwbouw: prijzen €500–€3.000, typen verlichting (palen, inbouw, LED-strip) en hoe je het aansluit op de stroomaansluiting.",
   "Tuinverlichting op maat omvat een compleet verlichtingsplan voor de tuin — van padverlichting tot gevelspots en sfeerverlichting in het terrasgedeelte. In nieuwbouw is er doorgaans een buitencontactdoos aanwezig als startpunt.",
   "€500 – €3.000 voor een complete tuinverlichting",
   "2–6 weken",
   [("Wat kost tuinverlichting op maat?","Padverlichting (8 palen): €300–€600. Gevelspot: €150–€300 per stuk. Complete tuinverlichting (pad + gevel + terras): €800–€2.500. Slimme verlichting (Philips Hue Outdoor): €600–€1.500 extra."),
    ("Hoe leg ik de kabels aan voor tuinverlichting?","Gebruik buitenkabel (YMVK) op minimaal 60 cm diepte. Leg een kabelkoker voor extra bescherming. De elektricien plaatst een buitengroep in de meterkast of sluit aan op een bestaand buitencontact. Plan dit bij aanleg van de tuin."),
    ("Slimme tuinverlichting of standaard?","Slimme verlichting (Philips Hue, Lutec) is bedienbaar via app en koppelbaar aan bewegingsmelders en tijdschema's. Kosten €50–€200 extra per armatuur. Standaard verlichting met timer is goedkoper (€10–€30/armatuur) maar minder flexibel.")],
   [("/op-maat/tuin-en-buiten/overkapping-op-maat/","Overkapping op maat"),("/op-maat/tuin-en-buiten/schutting-op-maat/","Schutting op maat"),("/op-maat/tuin-en-buiten/","← Terug naar tuin & buiten")]),

  # ── TECHNIEK EN ENERGIE ─────────────────────────────────────────
  ("techniek-en-energie","Techniek & energie","vloerverwarming-op-maat","Vloerverwarming op maat",
   "Vloerverwarming op maat voor nieuwbouw — soorten, kosten en geschiktheid",
   "Vloerverwarming op maat voor nieuwbouw: prijzen €3.000–€8.000, verschil natte vs elektrische vloerverwarming en hoe je dit als meerwerk bestelt bij de aannemer.",
   "Vloerverwarming is in nieuwbouw een populair meerwerk omdat de aanleg eenvoudig is voor het gietvloer of de dekvloer wordt gestort. Het systeem werkt optimaal met de lage-temperatuurwarmtepomp die standaard in veel nieuwbouwwoningen zit.",
   "€3.000 – €8.000 afhankelijk van oppervlak en type",
   "Bestellen vóór dekvloer storten",
   [("Wat kost vloerverwarming in nieuwbouw?","Natte vloerverwarming als meerwerk bij de aannemer: €3.000–€6.000 voor een compleet huis. Via een installateur achteraf: €4.000–€9.000 (dekvloer moet worden afgefreesd). Elektrische vloerverwarming (losse systemen): €30–€60/m² incl. installatie."),
    ("Natte of elektrische vloerverwarming — wat is beter?","Natte (water) vloerverwarming: lage energiekosten, ideaal met warmtepomp, vereist cv-installateur. Elektrische vloerverwarming: goedkoper om aan te leggen maar duurder in gebruik. Voor een volledig huis is natte vloerverwarming de betere keuze."),
    ("Welke vloer is geschikt voor vloerverwarming?","Tegels: beste warmtegeleiding. Keramisch parket (dunne houtlook-tegel): goed. Engineered wood (fineer): geschikt als niet dikker dan 15 mm. Massief hout: beperkt geschikt, check met leverancier. Laminaat: geschikt als gemarkeerd met vloerverwarmingssymbool.")],
   [("/op-maat/techniek-en-energie/smart-home-op-maat/","Smart home op maat"),("/op-maat/techniek-en-energie/zonnepanelen-op-maat/","Zonnepanelen op maat"),("/op-maat/techniek-en-energie/","← Terug naar techniek & energie")]),

  ("techniek-en-energie","Techniek & energie","smart-home-op-maat","Smart home op maat",
   "Smart home op maat voor nieuwbouw — systemen, kosten en installatie",
   "Smart home op maat voor nieuwbouw: prijzen €1.500–€20.000, vergelijking populaire systemen (Fibaro, KNX, Google/Apple) en wat je vóór het stucwerk moet regelen.",
   "Een smart home op maat voor nieuwbouw geeft je centrale controle over verlichting, verwarming, beveiliging en apparaten. In nieuwbouw is de aanleg goedkoper dan achteraf — bekabeling voor KNX of ingebouwde actoren loopt mee met de elektra.",
   "€1.500 – €20.000 afhankelijk van systeem en omvang",
   "Beslissen vóór elektra-aanleg",
   [("Welke smart home systemen zijn er?","Basis (draadloos): Google Home, Apple HomeKit, Amazon Alexa. Kosten €500–€2.000. Midden (bedraad + draadloos): Fibaro, Homey Pro. Kosten €2.000–€6.000. Professioneel (volledig bedraad): KNX, Loxone. Kosten €8.000–€20.000+."),
    ("Wanneer beslis ik over smart home in nieuwbouw?","Vóór de elektra-aanleg. Voor KNX en Loxone moet de installateur speciale kabelwegen aanleggen. Voor draadloze systemen kun je achteraf nog beginnen. Beslis tijdens de bouwfase (fase 2)."),
    ("Is een smart home de moeite waard?","Voor energie-efficiëntie (slimme thermostaat + aanwezigheidsdetectie bespaart 10–15% energiekosten). Voor comfort en veiligheid ja. Voor een hoger verkoopprijs: beperkt (slim huis verkoopt sneller maar prijs-effect is klein). Baseer de beslissing op persoonlijk gebruik.")],
   [("/op-maat/techniek-en-energie/vloerverwarming-op-maat/","Vloerverwarming op maat"),("/op-maat/techniek-en-energie/zonnepanelen-op-maat/","Zonnepanelen op maat"),("/op-maat/techniek-en-energie/","← Terug naar techniek & energie")]),

  ("techniek-en-energie","Techniek & energie","zonnepanelen-op-maat","Zonnepanelen op maat",
   "Zonnepanelen op maat voor nieuwbouw — aantal, kosten en terugverdientijd",
   "Zonnepanelen op maat voor nieuwbouw: hoeveel panelen passen op je dak, wat kost het (€6.000–€10.000) en wat is de terugverdientijd? Inclusief tips voor optimale opbrengst.",
   "Zonnepanelen op maat voor nieuwbouw betekent dat het systeem — aantal panelen, omvormer en eventuele thuisbatterij — precies is afgestemd op jouw dak, energieverbruik en financiële doelstellingen.",
   "€6.000 – €10.000 voor een compleet systeem",
   "Plaatsing vlak na oplevering",
   [("Hoeveel zonnepanelen passen op mijn nieuwbouwdak?","Een standaard rijtjeswoning heeft 40–60 m² dakoppervlak. Met panelen van 1,7 m² per stuk passen er 10–16 panelen op een dakvlak. Bij 400W per paneel geeft dit 4.000–6.400 Wp vermogen."),
    ("Wat kost zonnepanelen op maat voor nieuwbouw?","Een systeem van 12 panelen (4.800 Wp): €6.000–€8.500 inclusief installatie en omvormer. Met thuisbatterij (10 kWh): +€4.000–€7.000. Terugverdientijd zonder batterij: 7–10 jaar. Met batterij: 10–14 jaar."),
    ("Kan ik zonnepanelen bestellen als meerwerk bij de aannemer?","Ja, maar het is doorgaans duurder dan via een externe installateur (10–30% toeslag). Voordeel: de aannemer regelt alles en het zit in de hypotheek. Overweeg eerst offertes van externe installateurs voor vergelijking.")],
   [("/op-maat/techniek-en-energie/smart-home-op-maat/","Smart home op maat"),("/op-maat/techniek-en-energie/laadpaal-op-maat/","Laadpaal op maat"),("/op-maat/techniek-en-energie/","← Terug naar techniek & energie")]),

  ("techniek-en-energie","Techniek & energie","laadpaal-op-maat","Laadpaal op maat",
   "Laadpaal op maat voor nieuwbouw — types, kosten en subsidie",
   "Laadpaal op maat voor nieuwbouwhuis: prijzen €800–€2.500, verschil 1-fase vs 3-fase, welke subsidie er is en hoe je de installatie plant bij oplevering.",
   "Een laadpaal op maat voor nieuwbouw is afgestemd op jouw elektrische auto (of toekomstige aanschaf), de capaciteit van de meterkast en of je wilt koppelen met zonnepanelen en thuisbatterij.",
   "€800 – €2.500 inclusief installatie",
   "Plan bij oplevering",
   [("Wat kost een laadpaal voor nieuwbouw?","Een 1-fase laadpaal (3,7 kW): €600–€1.200 incl. installatie. Een 3-fase laadpaal (11–22 kW): €900–€2.000 incl. installatie. Met dynamische laadregeling (koppeling met zonnepanelen): €200–€500 extra."),
    ("1-fase of 3-fase laadpaal — wat is beter?","1-fase (3,7 kW): laadt een gemiddelde EV in 8–10 uur. Prima voor nachtladen. 3-fase (11 kW): laadt in 3–4 uur. Beter als je overdag wilt laden of meerdere auto's hebt. Controleer of je meterkast 3-fase heeft — in nieuwbouw is dit standaard."),
    ("Welke subsidie is er voor een laadpaal?","ISDE-subsidie (investeringssubsidie) is in 2025 nog beschikbaar voor slimme laadpalen. Check de RVO-website voor het actuele bedrag (historisch €500–€1.000). Sommige gemeenten bieden extra subsidie. Vraag dit na bij de installateur.")],
   [("/op-maat/techniek-en-energie/zonnepanelen-op-maat/","Zonnepanelen op maat"),("/op-maat/techniek-en-energie/smart-home-op-maat/","Smart home op maat"),("/op-maat/techniek-en-energie/","← Terug naar techniek & energie")]),
]

for (cat_slug, cat_label, prod_slug, prod_title, h1, meta_desc, intro, price, leadtime, faqs, related) in PAGES:
    related_links = "".join([f'<a href="{r[0]}" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">{r[1]}</a>' for r in related])
    faq_blocks = "".join([faq_block(q, a) for q, a in faqs])
    faq_schema = faq_ld(faqs)
    bc_html = breadcrumb_html([("Bylder", "/"), ("Op maat", "/op-maat/"), (cat_label, f"/op-maat/{cat_slug}/"), (prod_title, f"/op-maat/{cat_slug}/{prod_slug}/")])
    bc_ld = breadcrumb_ld([("Bylder", "/"), ("Op maat", "/op-maat/"), (cat_label, f"/op-maat/{cat_slug}/"), (prod_title, f"/op-maat/{cat_slug}/{prod_slug}/")])

    html = f"""<!DOCTYPE html><html lang="nl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{h1} | Bylder</title>
<meta name="description" content="{meta_desc[:158]}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.bylder.com/op-maat/{cat_slug}/{prod_slug}/">
<meta property="og:type" content="article"><meta property="og:site_name" content="Bylder">
<meta property="og:url" content="https://www.bylder.com/op-maat/{cat_slug}/{prod_slug}/">
<meta property="og:title" content="{h1} | Bylder">
<meta property="og:description" content="{meta_desc[:155]}">
<script type="application/ld+json">{faq_schema}</script>
<script type="application/ld+json">{bc_ld}</script>
{HEAD_COMMON}
</head><body>
{NAV}
<div style="padding-top:68px;"><div class="container" style="padding-top:10px;padding-bottom:10px;">{bc_html}</div></div>
<section style="padding:40px 0 52px;background:#fff;">
  <div class="container" style="max-width:800px;">
    <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;background:rgba(61,46,30,0.08);border-radius:999px;font-size:11px;font-family:'Space Mono',monospace;font-weight:700;color:#5C4433;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.08em;">Op maat · {cat_label}</div>
    <h1 style="font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.15;margin-bottom:16px;">{h1}</h1>
    <p style="font-size:17px;color:rgba(61,46,30,0.65);line-height:1.8;margin-bottom:24px;">{intro}</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
      <div style="background:rgba(61,46,30,0.06);border-radius:10px;padding:12px 16px;"><div style="font-size:11px;font-family:'Space Mono',monospace;color:rgba(61,46,30,0.4);text-transform:uppercase;margin-bottom:4px;">Prijs</div><div style="font-weight:700;color:#1A1208;font-size:14px;">{price}</div></div>
      <div style="background:rgba(61,46,30,0.06);border-radius:10px;padding:12px 16px;"><div style="font-size:11px;font-family:'Space Mono',monospace;color:rgba(61,46,30,0.4);text-transform:uppercase;margin-bottom:4px;">Levertijd</div><div style="font-weight:700;color:#1A1208;font-size:14px;">{leadtime}</div></div>
    </div>
  </div>
</section>
<div class="warm-divider"></div>
<section style="padding:48px 0;">
  <div style="max-width:1280px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:1fr 320px;gap:48px;align-items:start;">
    <article>
      <h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;letter-spacing:-0.02em;margin-bottom:16px;">Veelgestelde vragen</h2>
      {faq_blocks}
      <div style="margin-top:32px;">
        <h3 style="font-size:1rem;font-weight:700;color:#1A1208;margin-bottom:12px;">Verwant</h3>
        <div style="display:flex;flex-direction:column;gap:6px;">{related_links}</div>
      </div>
    </article>
    <aside class="sidebar" style="position:sticky;top:80px;">
      {SIDEBAR_CTA}
      <div style="background:#fff;border:1px solid rgba(61,46,30,0.08);border-radius:14px;padding:18px;">
        <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:rgba(61,46,30,0.35);margin-bottom:10px;">Navigatie</div>
        <div style="display:flex;flex-direction:column;gap:7px;">
          <a href="/op-maat/{cat_slug}/" style="font-size:13px;color:rgba(61,46,30,0.6);text-decoration:none;">← {cat_label} overzicht</a>
          <a href="/op-maat/" style="font-size:13px;color:#3D5A3E;font-weight:700;margin-top:4px;">← Alle categorieën</a>
        </div>
      </div>
    </aside>
  </div>
</section>
<div class="warm-divider"></div>
{CTA_SECTION}
{FOOTER}
<script src="/auping-popup.js"></script>
</body></html>"""

    write_page(f"{BASE}/{cat_slug}/{prod_slug}/index.html", html)

print(f"\nNiveau-3 klaar. Totaal {len(PAGES)} productpagina's aangemaakt.")
