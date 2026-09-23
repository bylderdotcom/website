# Bouwplan — de woningvisualisator

**Status:** voorstel om tegen te beslissen.
**Datum:** 22-09-2026. Alle cijfers zijn op die datum in deze repo gemeten.
**Vervolg op:** `docs/architectuur-configurators.md` (11-09-2026). Dat memo blijft gelden.
Dit stuk beslist wat daar nog openstond: hoe de koper binnenkomt, waar de geometrie
vandaan komt, en in welke volgorde het gebouwd wordt.

---

## 1. De opgave in één zin

Een koper van een nieuwbouwwoning moet zijn woning kunnen zien en virtueel afwerken
voordat er iets gebouwd is — zonder app, zonder scanner, zonder iets te uploaden als
dat niet hoeft.

## 2. Het besluit: de tekening is de bron, niet de scan

Pascal (pascal.app) doet hetzelfde voor bestaande gebouwen, met een LiDAR-scan vanaf
een iPhone Pro. Die route is voor ons om drie redenen dicht:

1. **Er valt niets te scannen.** De woning bestaat nog niet. Foto's kunnen pas op de
   kijkdag, en dan zijn de meeste keuzes al gemaakt. Een voordeur die een foto vereist,
   komt structureel te laat.
2. **Foto's zonder LiDAR leveren geen maten.** Fotogrammetrie werkt op textuur; een
   gestucte nieuwbouwwand heeft die niet. En uit foto's rolt een vorm, geen schaal —
   terwijl 40 cm verschil bij een gietvloer honderden euro's is en bij een gordijnrail
   een verkeerde bestelling.
3. **LiDAR sluit het grootste deel van de doelgroep uit.** iPhone 12 Pro of nieuwer.
   Geen Android, geen gewone iPhone.

Wat wél betrouwbaar werkt en vandaag kan: **een technische tekening lezen.** Ruimtes,
namen, maatvoering, deuropeningen, raamsparingen uit een plattegrond halen is
gestructureerde informatie uit een beeld halen — precies wat `api/quote-check.js` hier
al doet voor offertes. Uit een plattegrond met maten volgt met gewone meetkunde een
3D-ruimte.

**Foto's blijven, maar als controlelaag.** Kijkdagfoto's controleren of de meterkast
staat waar de tekening zegt, en leveren later het bewijs van wat er is opgeleverd.
Nooit het fundament.

### Wat dit betekent tegenover Innobrix

Innobrix werkt op BIM-modellen van ontwikkelaars. Dat is geen route die wij moeten
willen: het maakt de ontwikkelaar de poortwachter van onze klantrelatie, elk project
wordt een B2B-verkooptraject vóór er één koper bediend wordt, en een BIM-model is
gemaakt om te bouwen — leidingen, constructie, installaties — niet om een koper iets
te laten zien. Een plattegrond heeft elke koper zelf, van elk project, ook van
ontwikkelaars die nooit met ons praten.

## 3. Wat er sinds het memo van 11-09 veranderd is

| | 11-09 | 22-09 |
|---|---|---|
| Projecten in `nieuwbouwprojecten.json` | 995 | **1.268** |
| Projectpagina's | — | **289**, waarvan 287 inhoudelijk uitgewerkt |
| Configuratie reist mee met de offerte (stap 1) | niet gebouwd | **deels gebouwd** — `OfferteFormulier` en `OntwerpBewaren` sturen `configuratie`, `specificatie` en `hoeveelheden` mee naar `app.bylder.com` |
| Motor losgetrokken (stap 2) | niet gebouwd | **nog niet** — `configurator/` is ongewijzigd |

### Correctie op één aanname uit dat memo

Daar staat dat één omgezette plattegrond "elke koper van dat woningtype in dat project"
bedient, afgeschreven over *honderden* kopers. Gemeten klopt dat alleen voor de
staart. Van de 710 projecten met een woningaantal (samen 45.926 woningen):

- mediaan **32 woningen** per project
- driekwart onder de 62
- **107 projecten met 100 woningen of meer**

Bij een mediaanproject met vier tot zes woningtypes bedient één tekening dus zes tot
tien kopers, niet honderden. Dat verandert de conclusie niet — het verandert de
volgorde. **Begin bij de 107 grote projecten**, niet bij de projecten die nu toevallig
verkeer trekken. Waar die twee elkaar overlappen ligt de eerste tien.

## 4. De trechter

Elke stap staat hier met wat de bezoeker ziet, niet met wat er gebeurt.

### Stap 1 — De projectpagina (bestaat, 287 stuks)

Op de pagina van zijn eigen project ziet de koper een venster, geen knop — hetzelfde
patroon als `ConfiguratorCTA`, dat daar al voor bewezen is:

> **Zie je woning al ingericht, voordat hij gebouwd is.**
> Kies je woningtype en bekijk hem van binnen.

Twee ingangen, afhankelijk van wat we van dat project hebben:

- **Woningtypes bekend** → hij kiest er een uit een rijtje en staat direct binnen. Geen
  upload, geen account, geen formulier. Dit is de hele belofte: kinderlijk eenvoudig.
- **Nog niet bekend** → "Wij hebben de tekeningen van dit project nog niet. Stuur je
  plattegrond, dan zetten wij hem om." Hij is dan de eerste van zijn project, en zijn
  buren erven het resultaat.

Die tweede ingang is het vliegwiel: **kopers leveren de bibliotheek aan die ze
vervolgens allemaal gebruiken.**

### Stap 2 — Binnen in de woning, zonder drempel

Wat hij ziet: zijn plattegrond, zijn ruimtes, zijn maten. Wat hij mag doen zonder
iets achter te laten: rondkijken, en per ruimte de configurators openen die er al
staan — deuren nu, gietvloer en plinten straks.

Vrij toegankelijk en indexeerbaar. Dit is onze variant op de gratis Pascal Editor: het
instrument wint de gebruiker, de transactie komt later.

### Stap 3 — De e-mail (bestaat)

`OntwerpBewaren` vraagt één ding — een e-mailadres — en mailt het ontwerp terug via een
link die het opent zoals het stond. Bewust geen naam, geen telefoon. Onder de woning
wordt dat: *"Stuur mij mijn woning."*

### Stap 4 — Het account (app.bylder.com)

Pas als er iets te bewaren valt dat groter is dan één ontwerp. De woning is dan de
houder: meerdere ruimtes, meerdere producten, één optelling die blijft staan en die
hij met zijn partner deelt.

**Waar wat woont:** de vrije, indexeerbare instap hoort in deze repo. De bewaarde
woning hoort in de app-repo — precies zoals `OntwerpBewaren` nu al naar
`app.bylder.com/api/ontwerp-bewaren` post. Dat beantwoordt openstaande beslissing 1
uit het vorige memo.

### Stap 5 — Wat eruit komt

Niet een plaatje, maar een staat die geld waard is:

- **Materiaalstaat.** 68 m² gietvloer, 9 binnendeuren met draairichting en kozijnmaat,
  14 strekkende meter gordijn. Rechtstreeks uit de geometrie.
- **Showroomroute.** Uit de 1.841 winkels in `winkels-publiek.json`: dít zijn de
  winkels om te bezoeken voor jouw keuzes, in deze volgorde, in jouw regio.
- **De adviseur.** Het moment waarop een mens het overneemt en met een gordijnstaal
  naar de gietvloershowroom loopt.

Daar komt de propositie uit `CLAUDE.md` samen: meerdere winkels, één traject. De
visualisator is niet het product — hij is de plek waar producten uit verschillende
winkels naast elkaar komen te liggen vóórdat iemand de deur uit gaat.

## 5. Het datamodel

Twee nieuwe lagen, aansluitend op wat er is.

### 5.1 Woningtype

```
Woningtype {
  id            stabiel, bv. 'parkbuurt-almelo-fase-3/type-c'
  project       slug uit nieuwbouwprojecten.json
  naam          zoals de brochure hem noemt ('Type C — hoekwoning')
  bouwnummers   [12, 14, 16]        // leeg mag; dan kiest de koper op type
  verdiepingen  Verdieping[]
  herkomst      { bron, datum, wie_valideerde }
  status        'concept' | 'gevalideerd'
}

Verdieping {
  nummer        0 = begane grond
  hoogte_mm     plafondhoogte
  ruimtes       Ruimte[]
}

Ruimte {
  id            stabiel
  type          slug uit data/ruimtes/   ← bestaande ontologie
  naam          zoals de tekening hem noemt
  omtrek        [[x,y], ...] in mm, rechtsom
  openingen     Opening[]
}

Opening {
  soort         'deur' | 'raam' | 'doorgang'
  wand          index in omtrek
  van_mm, breedte_mm, drempel_mm, hoogte_mm
  draai?        'links' | 'rechts'
}
```

Drie regels, in lijn met het vorige memo:

1. **Alles in millimeters.** Geen maatlabels, geen "standaard".
2. **`ruimte.type` verwijst naar `data/ruimtes/`.** Die ontologie bestaat al en is
   expliciet bedoeld als bron voor onder meer de 3D-tool. De twin is de geometrie
   eronder, niet een tweede waarheid ernaast.
3. **Herkomst reist mee.** Welke tekening, welke datum, wie het valideerde. Zonder dat
   is een maat over drie maanden niet te verantwoorden — en op deze maten worden
   offertes gebaseerd.

### 5.2 Woning

De instantie van een woningtype voor één koper. Houdt de `Configuratie{}` uit het
vorige memo vast, per ruimte-id. Woont in de app-repo.

## 6. Hoe een tekening erin komt

Geen computer-visiongok, maar een contentpijplijn met een mens in de lus — hetzelfde
patroon als de bestaande Python-pijplijnen.

1. **Binnen**: PDF of foto (brochure van de ontwikkelaar, of van de koper zelf).
2. **Lezen**: model haalt ruimtes, namen, maten en openingen eruit als JSON. Patroon
   bestaat in `api/quote-check.js`.
3. **Controleren**: een mens ziet de omgezette plattegrond náást de originele tekening
   en corrigeert. Tien minuten werk per tekening.
4. **Poort**: pas op `gevalideerd` als de som van de ruimte-oppervlaktes binnen een
   paar procent van het opgegeven woonoppervlak valt, alle ruimtes gesloten polygonen
   zijn, en elke ruimte minstens één opening heeft.
5. **Publiceren**: zichtbaar op de projectpagina.

> **Alleen `gevalideerd` levert getallen aan een offerte.** Een concept mag getoond
> worden met de melding dat de maten nog niet gecontroleerd zijn. Automatiseer exact
> wat automatisch te controleren valt — niet meer.

## 7. Auteursrecht op plattegronden

Een plattegrond uit een verkoopbrochure is beschermd werk van de architect. Dezelfde
discussie als bij Nieuw Wonen Nederland in `nwn_scraper.py`, en minstens zo hard.

**Niet doen:** brochures leegtrekken en tekeningen overnemen.

**Wel, twee schone routes:**

1. **De koper levert zijn eigen tekening** voor zijn eigen woning. Wij maken daar een
   model van voor hem.
2. **Afspraak per project met de ontwikkelaar.** Geen obstakel maar een opening:
   ontwikkelaars verkopen meerwerk en hebben er belang bij dat kopers hun woning zien.
   Dit is tegelijk de eerste zakelijke reden om met ze aan tafel te zitten.

In beide gevallen nemen we de **maten** over en tekenen we onze eigen geometrie — we
reproduceren de tekening niet.

## 8. Bouwvolgorde

Doorgenummerd vanaf het vorige memo. Per stap staat wanneer hij klaar is — niet "de
code staat er", maar iets dat te controleren valt.

| # | Stap | Klaar wanneer |
|---|---|---|
| 1 | **Configuratievorm afmaken** (loopt) | Een geconfigureerde deur komt als leesbare regels binnen bij een offerte, met stabiele ids en prijsherkomst |
| 2 | **Motor eruit** | Deurconfigurator draait ongewijzigd op de losgetrokken motor, beeld identiek |
| 3 | **Woningtype-schema + tien tekeningen met de hand** | Tien gevalideerde woningtypes uit grote projecten die al verkeer trekken. Géén automatisering |
| 4 | **De woningweergave** | Een koper kiest op een projectpagina zijn woningtype en ziet zijn plattegrond met ruimtes en maten, op een telefoon leesbaar |
| 5 | **Materiaalstaat** | Uit die geometrie rolt m² vloer, aantal deuren en strekkende meter gordijn — controleerbaar tegen de tekening |
| 6 | **Configurators in de ruimte** | De deurconfigurator opent vanuit een ruimte en schrijft terug naar die ruimte |
| 7 | **"Stuur mij mijn woning" + account** | Een bewaarde woning opent later opnieuw, met alle keuzes |
| 8 | **Showroomroute eronder** | De materiaalstaat wijst naar echte winkels uit `winkels-publiek.json`, op reisafstand |
| 9 | **Tekeningpijplijn automatiseren** | Pas nadat 3 tien keer met de hand gedaan is en de poort uit §6 klopt |
| 10 | **Kijkdagfoto's als controlelaag** | Een foto corrigeert een maat, en de herkomst laat zien dat het gebeurd is |

Stap 4 en 5 zijn samen de eerste oplevering die iets waard is: iemand ziet zijn woning
en krijgt te horen hoeveel vloer hij nodig heeft. Dat kan live zonder dat er één
configurator in staat.

**Wat hier bewust niet in staat:** gordijnen (andere motor, zie het vorige memo),
scannen, en een onderhoudsabonnement na oplevering. Dat laatste is waar Pascal zijn
geld verdient en waarschijnlijk ook onze lange lijn — warmtepomp, WTW-ventilatie en
zonnepanelen vragen in elke nieuwbouwwoning periodiek onderhoud en niemand weet door
wie. Nu niet bouwen. Wel weten dat de woning die hier ontstaat twintig jaar meegaat.

## 9. Beslissingen die Daniel moet nemen

1. **Welke tien projecten voor stap 3?** Voorstel: de overlap tussen de 107 projecten
   met 100+ woningen en de projectpagina's die nu verkeer trekken.
2. **Wie valideert de tekeningen?** Tien minuten per stuk, maar het moet iemand zijn
   die een plattegrond kan lezen.
3. **Eerst 2D of meteen 3D?** Voorstel: stap 4 levert een nette 2D-plattegrond met
   maten. De extrusie naar 3D is daarna een presentatielaag op dezelfde data, geen
   nieuw project.
4. **Prijs zichtbaar in de materiaalstaat, of alleen hoeveelheden?** Bepaalt of stap 5
   een offerte is of een boodschappenlijst.
