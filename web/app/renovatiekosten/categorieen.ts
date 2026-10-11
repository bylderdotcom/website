// De acht onderdelen van /renovatiekosten/ (herbouwd 11-10-2026).
//
// PRIJZEN
// Alleen de bandbreedtes die al op de site stonden (de categorie- en gemeentepagina's sinds 2026).
// Geen verzonnen gemiddelden of besparingen: wat de prijs bepaalt staat in woorden, de echte
// prijs komt uit een offerte. Verandert een bandbreedte, pas hem dan ook aan in de statische
// gemeentepagina's (renovatiekosten/<onderdeel>/<gemeente>/), die tonen hetzelfde getal.
//
// AANBOD
// Elke pagina heeft een commerciële vervolgstap (besluit Daniel, 11-10-2026): iets wat de bezoeker
// via Bylder kan bestellen of met korting kan kopen. Per onderdeel de stap die er echt bij hoort.

export type Aanbod = 'gietvloer' | 'kast' | 'deuren' | 'vouchers'

export type Categorie = {
  slug: string
  naam: string
  /** zelfstandig naamwoord in een zin: "een badkamerrenovatie" */
  zin: string
  van: string
  tot: string
  eenheid: 'totaal' | 'per m²'
  watErIn: string[]
  bepalers: string[]
  moment: string
  vak: { href: string; label: string }
  aanbod: Aanbod
  /** de aanleiding bij de commerciële stap, in de woorden van dit onderdeel */
  aanleiding: string
  /** merken met ledenkorting die bij dit onderdeel horen (uit data/deelnemers.json) */
  merken?: string
  vragen: { v: string; a: string }[]
}

export const CATEGORIEEN: Categorie[] = [
  {
    slug: 'badkamer', naam: 'Badkamer', zin: 'een badkamerrenovatie', van: '€7.500', tot: '€20.000+', eenheid: 'totaal',
    watErIn: ['Slopen en afvoeren', 'Leidingwerk en afvoer', 'Tegelwerk vloer en wand', 'Sanitair en kranen', 'Verlichting en ventilatie'],
    bepalers: ['Blijven leidingen en afvoer op hun plek, of verhuizen ze?', 'Tegelformaat: grote tegels vragen een vlakkere ondergrond en meer uren', 'Inloopdouche met goot of een douchebak', 'Het sanitair zelf: van bouwmarkt tot designserie'],
    moment: 'Bij nieuwbouw: beslis vóór de sluitingsdatum of je de badkamer casco laat opleveren. Dan betaal je de projectbadkamer niet om hem daarna te slopen.',
    vak: { href: '/badkamer/', label: 'Badkamerspecialisten met beoordelingen' },
    aanbod: 'vouchers', merken: 'Swanenberg, Pand16, Sanitairwinkel.nl, Tegeldepot Meppel en Voordeligsanitair',
    aanleiding: 'Sanitair en tegels zijn vaak de helft van de rekening. Met een gratis Bylder-account krijg je ledenkorting bij onder meer Swanenberg, Pand16 en Sanitairwinkel.nl.',
    vragen: [
      { v: 'Wat kost een nieuwe badkamer in 2026?', a: 'Een complete badkamerrenovatie kost in 2026 meestal €7.500 tot €20.000 of meer. Het verschil zit vooral in het verplaatsen van leidingen, het tegelformaat en het sanitair.' },
      { v: 'Is een casco badkamer bij nieuwbouw goedkoper?', a: 'Vaak wel, omdat je de projectbadkamer niet betaalt en daarna sloopt. Let op de verrekening: de aannemer trekt een vast bedrag af, vergelijk dat met wat je eigen badkamer kost.' },
      { v: 'Hoe weet ik of mijn badkamerofferte eerlijk is?', a: 'Leg de posten naast elkaar: sloop, leidingwerk, tegelen per m², sanitair en afwerking. Met de gratis offerte-check van Bylder zie je per post of hij in lijn is met de markt.' },
    ],
  },
  {
    slug: 'keuken', naam: 'Keuken', zin: 'een keukenrenovatie', van: '€3.500', tot: '€25.000+', eenheid: 'totaal',
    watErIn: ['Kasten en fronten', 'Aanrechtblad', 'Inbouwapparatuur', 'Achterwand', 'Montage, water en elektra'],
    bepalers: ['Fronten vervangen of een complete nieuwe keuken', 'Werkblad: laminaat, composiet of natuursteen', 'Inbouwapparatuur en kraan', 'Verplaatsen van water, afvoer of de kookgroep'],
    moment: 'Laat de keuken bij nieuwbouw meestal niet via de projectshowroom lopen zonder te vergelijken: de keuze is vrij, de stelpost is vaak laag.',
    vak: { href: '/aannemer/', label: 'Vakbedrijven voor montage en installatie' },
    aanbod: 'vouchers', merken: 'Van Eigen Hand',
    aanleiding: 'Een keuken koop je één keer. Met een gratis Bylder-account krijg je onder meer €750 korting bij Van Eigen Hand, en ledenkorting op verlichting en tegels.',
    vragen: [
      { v: 'Wat kost een nieuwe keuken inclusief montage?', a: 'In 2026 betaal je voor een keukenrenovatie €3.500 tot €25.000 of meer. Alleen fronten vervangen zit aan de onderkant, een nieuwe keuken met natuursteen en inbouwapparatuur aan de bovenkant.' },
      { v: 'Moet ik bij nieuwbouw de keuken van de projectshowroom nemen?', a: 'Nee. Je mag meestal ook casco laten opleveren en zelf kopen. Vergelijk de stelpost met een offerte van een eigen keukenzaak.' },
      { v: 'Waar zit de marge in een keukenofferte?', a: 'Vaak in de apparatuur en in losse posten zoals montage en aansluiten. Vraag om een offerte per post en vergelijk die met de gratis offerte-check.' },
    ],
  },
  {
    slug: 'gietvloer', naam: 'Gietvloer', zin: 'een gietvloer', van: '€45', tot: '€120+', eenheid: 'per m²',
    watErIn: ['Ondergrond voorbereiden en primeren', 'Gietlaag (PU, epoxy of microcement)', 'Toplaag of coating', 'Afwerking langs wanden en drempels'],
    bepalers: ['Type: PU is warmer en zachter, epoxy harder, microcement dunner', 'De staat van de dekvloer: scheuren en vocht kosten extra', 'Oppervlakte: kleine ruimtes zijn per m² duurder', 'Vloerverwarming: de vloer moet eerst opgestookt zijn'],
    moment: 'Kies de vloer vóór de plinten en de stukadoor. Met een schaduwvoeg of inbouwplint loopt de gietvloer strak tot aan de wand.',
    vak: { href: '/gietvloer/', label: 'Alles over gietvloeren' },
    aanbod: 'gietvloer', merken: 'DRT Contemporary Flooring',
    aanleiding: 'Upload een foto van een gietvloer die je mooi vindt. Wij lezen de kleur, je kiest de ruimtes in je woning en je krijgt tot drie stalen gratis thuis. Daarna een offerte van een verwerker.',
    vragen: [
      { v: 'Wat kost een gietvloer per m² in 2026?', a: 'Reken op €45 tot €120 of meer per m², inclusief leggen. PU en microcement zitten vaak hoger dan een eenvoudige epoxyvloer; kleine ruimtes zijn per m² duurder.' },
      { v: 'Kan een gietvloer op vloerverwarming?', a: 'Ja, een gietvloer geleidt warmte goed. De dekvloer moet wel droog en opgestookt zijn voordat de verwerker begint.' },
      { v: 'Hoe kies ik de kleur van een gietvloer?', a: 'Met de gietvloerontwerper van Bylder upload je een foto van een vloer die je mooi vindt. Je krijgt de dichtstbijzijnde kleur en tot drie stalen gratis thuis.' },
    ],
  },
  {
    slug: 'schilderwerk', naam: 'Schilderwerk', zin: 'schilderwerk', van: '€6', tot: '€18+', eenheid: 'per m²',
    watErIn: ['Afplakken en afdekken', 'Gaten vullen en schuren', 'Voorstrijken', 'Twee lagen verf'],
    bepalers: ['Binnen of buiten: buiten is duurder door steigers en weer', 'De staat van de ondergrond', 'Plafonds en kozijnen kosten meer tijd dan wanden', 'Verfsoort en aantal lagen'],
    moment: 'Bij nieuwbouw is een wand vaak "behangklaar", niet "sauswerkklaar". Dan is er eerst nog plamuurwerk nodig.',
    vak: { href: '/schilder/', label: 'Schilders met beoordelingen' },
    aanbod: 'vouchers', merken: 'Graham & Brown, Enzo Pellini en Super-stuc.nl',
    aanleiding: 'Wand en plafond afwerken? Met een gratis Bylder-account krijg je ledenkorting bij onder meer Graham & Brown (behang), Enzo Pellini en Super-stuc.nl.',
    vragen: [
      { v: 'Wat kost een schilder per m² in 2026?', a: 'Voor binnenschilderwerk betaal je meestal €6 tot €18 of meer per m², afhankelijk van de ondergrond, het aantal lagen en of het om wanden, plafonds of kozijnen gaat.' },
      { v: 'Wat is het verschil tussen behangklaar en sauswerkklaar?', a: 'Behangklaar laat kleine oneffenheden toe die onder behang verdwijnen. Sauswerkklaar is strakker. Ga je verven op een behangklare wand, dan komt er eerst plamuurwerk bij.' },
      { v: 'Is een schilder per uur of per m² goedkoper?', a: 'Per m² geeft vooraf zekerheid. Per uur is alleen gunstig als het werk klein en overzichtelijk is. Vraag bij een uurtarief altijd om een schatting van het aantal uren.' },
    ],
  },
  {
    slug: 'dakkapel', naam: 'Dakkapel', zin: 'een dakkapel', van: '€7.500', tot: '€22.000+', eenheid: 'totaal',
    watErIn: ['Prefab of op maat gebouwde kapel', 'Plaatsen en wind- en waterdicht maken', 'Kozijnen en beglazing', 'Binnenafwerking'],
    bepalers: ['Breedte van de kapel', 'Prefab of op maat gebouwd', 'Kunststof of hout, en het soort glas', 'Of er een vergunning nodig is (meestal aan de voorkant)'],
    moment: 'Met een dakkapel wordt de zolder een kamer. Plan de kasten meteen mee: een kast op maat maakt van de nieuwe ruimte een kamer met bergruimte.',
    vak: { href: '/dakkapel/', label: 'Dakkapelbouwers met beoordelingen' },
    aanbod: 'kast',
    aanleiding: 'Een zolder met dakkapel wordt pas een kamer met genoeg bergruimte. Ontwerp een kast op maat vanaf een voorbeeldfoto, zie hem in 3D en vraag een offerte aan bij een timmerbedrijf.',
    vragen: [
      { v: 'Wat kost een dakkapel in 2026?', a: 'Een dakkapel kost in 2026 meestal €7.500 tot €22.000 of meer. Breedte, prefab of maatwerk en het materiaal van de kozijnen maken het verschil.' },
      { v: 'Heb ik een vergunning nodig voor een dakkapel?', a: 'Aan de achterkant vaak niet, aan de voorkant of zijkant meestal wel. Check het via het Omgevingsloket voordat je tekent.' },
      { v: 'Hoe krijg ik genoeg bergruimte op zolder?', a: 'Met kasten op maat, die de hele wand benutten. In de kastontwerper van Bylder begin je vanaf een voorbeeldfoto, zie je de kast in 3D en vraag je direct een offerte aan.' },
    ],
  },
  {
    slug: 'aanbouw', naam: 'Aanbouw', zin: 'een aanbouw', van: '€1.200', tot: '€2.800+', eenheid: 'per m²',
    watErIn: ['Fundering', 'Ruwbouw en dak', 'Kozijnen en pui', 'Installaties', 'Afwerking van vloer, wand en plafond'],
    bepalers: ['Fundering: op staal of op palen', 'De pui: schuifpui of vouwwand', 'Doorbraak in de achtergevel en de stalen balk', 'Het afwerkingsniveau binnen'],
    moment: 'Een aanbouw krijgt een nieuwe vloer, nieuwe wanden en vaak een nieuwe doorgang. Kies vloer, deuren en plinten vóór de afbouw begint, dan sluit alles strak aan op het bestaande huis.',
    vak: { href: '/aannemer/', label: 'Aannemers met beoordelingen' },
    aanbod: 'gietvloer', merken: 'DRT Contemporary Flooring',
    aanleiding: 'Een aanbouw met een gietvloer loopt naadloos door in de woonkamer, zonder drempel. Upload een foto van een vloer die je mooi vindt en ontvang tot drie stalen gratis.',
    vragen: [
      { v: 'Wat kost een aanbouw per m² in 2026?', a: 'Reken op €1.200 tot €2.800 of meer per m². De fundering, de pui en het afwerkingsniveau binnen bepalen waar je uitkomt.' },
      { v: 'Heb ik een vergunning nodig voor een aanbouw?', a: 'Een aanbouw aan de achterkant is binnen bepaalde maten vergunningvrij. Check het altijd in het Omgevingsloket; regels verschillen per gemeente.' },
      { v: 'Welke vloer past bij een aanbouw?', a: 'Een vloer die zonder drempel doorloopt in het bestaande huis. Een gietvloer kan dat over een groot oppervlak zonder naden.' },
    ],
  },
  {
    slug: 'zonnepanelen', naam: 'Zonnepanelen', zin: 'zonnepanelen', van: '€3.500', tot: '€11.000+', eenheid: 'totaal',
    watErIn: ['Panelen', 'Omvormer of micro-omvormers', 'Montagesysteem', 'Installatie en aanmelden'],
    bepalers: ['Aantal panelen en het vermogen per paneel', 'Omvormer of micro-omvormers', 'Dakvorm en bereikbaarheid', 'Of de meterkast een extra groep nodig heeft'],
    moment: 'De salderingsregeling stopt per 2027. Reken de terugverdientijd door met wat je zelf direct verbruikt, niet met wat je terugleverde.',
    vak: { href: '/kopen/zonnepanelen/', label: 'Zonnepanelen vergelijken' },
    aanbod: 'vouchers',
    aanleiding: 'Bezig met verduurzamen en inrichten? Met een gratis Bylder-account krijg je ledenkorting bij {merken} merken, van verlichting tot zonwering.',
    vragen: [
      { v: 'Wat kosten zonnepanelen in 2026?', a: 'Een installatie kost in 2026 meestal €3.500 tot €11.000 of meer, afhankelijk van het aantal panelen, de omvormer en het dak.' },
      { v: 'Zijn zonnepanelen nog rendabel zonder saldering?', a: 'Vaak wel, maar de terugverdientijd wordt langer. Hoe meer stroom je zelf direct gebruikt, hoe beter de rekensom.' },
      { v: 'Hoe vergelijk ik offertes voor zonnepanelen?', a: 'Vergelijk de prijs per wattpiek, het merk van panelen en omvormer, en de garanties. De gratis offerte-check van Bylder legt de posten naast de markt.' },
    ],
  },
  {
    slug: 'warmtepomp', naam: 'Warmtepomp', zin: 'een warmtepomp', van: '€4.000', tot: '€15.000+', eenheid: 'totaal',
    watErIn: ['De warmtepomp', 'Installatie en leidingwerk', 'Eventueel een boilervat', 'Aanpassingen aan de afgifte'],
    bepalers: ['Hybride of volledig elektrisch', 'Lucht-water of bodem-water', 'Isolatie van de woning', 'Of er vloerverwarming ligt of komt'],
    moment: 'Een warmtepomp werkt het best met lage temperatuur, dus met vloerverwarming. Leg je de vloer opnieuw, kies dan een vloer die warmte goed doorlaat.',
    vak: { href: '/aannemer/', label: 'Installateurs en vakbedrijven' },
    aanbod: 'gietvloer',
    aanleiding: 'Een gietvloer is dun en geleidt warmte goed, dus hij past bij vloerverwarming en een warmtepomp. Upload een foto van een vloer die je mooi vindt en ontvang tot drie stalen gratis.',
    vragen: [
      { v: 'Wat kost een warmtepomp in 2026?', a: 'Een warmtepomp kost in 2026 meestal €4.000 tot €15.000 of meer. Een hybride pomp zit aan de onderkant, een volledig elektrische bodemwarmtepomp aan de bovenkant.' },
      { v: 'Is er subsidie op een warmtepomp?', a: 'Ja, via de ISDE-regeling van de RVO. Het bedrag hangt af van het type en het vermogen; vraag het aan na installatie.' },
      { v: 'Welke vloer past bij een warmtepomp?', a: 'Een vloer met lage warmteweerstand op vloerverwarming, zoals een gietvloer of tegels. Dikke vloeren of tapijt remmen de warmte af.' },
    ],
  },
]

export const categorie = (slug: string) => CATEGORIEEN.find(c => c.slug === slug)
