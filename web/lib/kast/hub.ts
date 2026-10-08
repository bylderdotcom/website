// De ContentHub "Kasten op maat": één pijlerpagina en een pagina per kasttype.
//
// WAT DEZE PAGINA'S ANDERS MAKEN DAN DIE VAN EEN KASTENMAKER
// Elke pagina toont een echt ontwerp uit ons rekenmodel, met de maten, vakken en
// het aantal onderdelen dat een timmerbedrijf ervoor zaagt. De vakregels (deur
// max 60 cm breed, plank max 80 cm zonder lat) zijn dezelfde als die de ontwerper
// bewaakt. Zo is de tekst te controleren en niet te verzinnen.
//
// GEEN PRIJZEN
// We noemen geen bedragen zolang het timmerbedrijf ons geen tarieven heeft gegeven.
// We leggen wel uit wat de prijs bepaalt. Een verzonnen vanafprijs veroudert stil.

export type Vraag = { v: string; a: string }
export type Sectie = { h2: string; p: string[]; lijst?: string[] }
export type HubPagina = {
  slug: string            // '' = pijler
  voorbeeld: string       // slug in VOORBEELDEN
  kort: string            // naam in menu's en kaarten
  title: string
  description: string
  label: string
  h1: string
  intro: string
  secties: Sectie[]
  vragen: Vraag[]
}

const ALGEMEEN: Vraag[] = [
  { v: 'Heb ik een technische tekening nodig?', a: 'Nee. Met een tekening kloppen de maten meteen. Zonder tekening vraagt de ontwerper gericht om de paar maten die nodig zijn, of schat hij ze uit een foto met een A4’tje tegen de muur. Je ontwerp heet dan indicatief: het timmerbedrijf meet in voordat er gezaagd wordt.' },
  { v: 'Wat kost het ontwerpen?', a: 'Niets. Ontwerpen en een offerte aanvragen zijn gratis en vrijblijvend. De opdracht sluit je met het timmerbedrijf, niet met Bylder.' },
]

export const PIJLER: HubPagina = {
  slug: '', voorbeeld: 'hoekkast', kort: 'Kast op maat',
  title: 'Kast op maat laten maken: ontwerp hem zelf met AI | Bylder',
  description: 'Ontwerp een kast op maat uit je eigen voorbeeldfoto’s: hoekkast, tv-wand, inbouwkast of boekenkast. Je ziet hem in 3D, het timmerbedrijf krijgt tekening en zaaglijst.',
  label: 'Maatwerk · kasten',
  h1: 'Een kast op maat, ontworpen door jou en gemaakt door een timmerbedrijf',
  intro: 'Een kast op maat past precies: van muur tot muur, tot aan het plafond, in een hoek of een nis. Je hoeft hem niet te kunnen tekenen. Laat de ontwerper zien wat je mooi vindt, vertel waar hij komt en wat erin moet, en je ziet hem in 3D in je eigen ruimte. Het timmerbedrijf krijgt daarna een ontwerp waar het mee kan zagen.',
  secties: [
    { h2: 'Zo werkt het', p: [
      'Je begint met een paar foto’s van kasten die je aanspreken, uit een tijdschrift, van Pinterest of uit een showroom. Daaruit haalt de ontwerper de stijl: greeploos of met grepen, ronde of rechte koppen, gelakt of hout, en de kleur.',
      'Daarna vertel je waar de kast komt en wat erin moet. De ontwerper vraagt door als hij iets mist, zoals de muurlengte of de plafondhoogte. Binnen een minuut staat er een eerste ontwerp, in 3D, met aanzicht en plattegrond. Bijsturen doe je in gewone taal: ‘bovenkasten iets hoger’, ‘links geen ronde kop’.',
      'Ben je tevreden, dan vraag je een offerte aan. Het timmerbedrijf krijgt je ontwerp met maattekeningen, een zaaglijst per onderdeel en een beslaglijst. Het meet in, maakt de kast en plaatst hem.',
    ] },
    { h2: 'Waarom het ontwerp altijd te maken is', p: [
      'Elk ontwerp gaat door een rekenmodel dat werkt zoals een meubelmaker denkt: in korpussen, fronten, planken en beslag. Het bewaakt de vakregels, en een ontwerp dat er een breekt, komt niet bij je terug.',
    ], lijst: [
      'Een deur is hooguit 60 cm breed en 240 cm hoog; breder wordt een dubbele deur.',
      'Een legplank van 18 mm overspant hooguit 80 cm; tot 120 cm met een lat onder de voorkant.',
      'Een lade is hooguit 100 cm breed en minstens 12 cm hoog.',
      'Tussen kast en plafond blijft 2 cm voor een passtrook die de meubelmaker op het plafond aftekent.',
      'Deuren in een binnenhoek krijgen een vulstuk van 6 cm en zo nodig een openingsbegrenzer, zodat ze elkaar niet raken.',
    ] },
    { h2: 'Met of zonder bouwtekening', p: [
      'Heb je een bouwtekening, zet die dan in je Bylder-omgeving. De ontwerper kent dan de maten van je kamers en hoeft alleen nog te weten welke muur het is.',
      'Heb je geen tekening, dan meet je zelf een paar maten: de muur op drie hoogtes (de kleinste telt) en het plafond op twee plekken. Weet je het niet precies, maak dan een foto van de plek met een A4’tje tegen de muur. Het ontwerp heet dan indicatief, en het timmerbedrijf meet in voordat er gezaagd wordt.',
    ] },
    { h2: 'Wat de prijs bepaalt', p: [
      'Een kast op maat wordt geprijsd op wat er gezaagd, afgewerkt en gemonteerd wordt. Omdat de ontwerper een zaaglijst maakt, weet het timmerbedrijf dat precies, en hoef je niet te wachten op een eerste inmeetafspraak voor een prijs.',
    ], lijst: [
      'Hoeveel plaat: de lengte, hoogte en diepte van de kast.',
      'De afwerking: wit melamine binnenin is voordeliger dan alles gelakt; fineer is duurder dan lak.',
      'Ronde koppen: buigwerk en gefreesde delen kosten meer dan rechte delen.',
      'Lades en beslag: een lade kost meer dan een plank.',
      'Montage: tot het plafond en tussen muren vraagt meer pas- en meetwerk.',
    ] },
  ],
  vragen: [
    { v: 'Kan ik een kast ontwerpen die er nog niet is?', a: 'Ja. Er zijn geen vaste kastjes of standaardmaten. Elke breedte, hoogte, verdeling en ronde kop is mogelijk, zolang het uit plaatmateriaal te maken is. De ontwerper zegt het als iets niet kan, en stelt dan het dichtstbijzijnde voor dat wel kan.' },
    { v: 'Hoe weet de ontwerper welke kleur ik wil?', a: 'Uit je foto’s. Bij lak kiest hij de dichtstbijzijnde RAL-kleur, bij hout een fineer of decor. Hij zegt wat hij koos, en je verandert het met één zin.' },
    { v: 'Wie maakt de kast?', a: 'Een timmerbedrijf waarmee Bylder samenwerkt. Het krijgt je ontwerp met tekeningen en zaaglijst, meet in, maakt de kast en plaatst hem. De opdracht sluit je met het timmerbedrijf.' },
    ...ALGEMEEN,
  ],
}

export const TYPES: HubPagina[] = [
  {
    slug: 'hoekkast', voorbeeld: 'hoekkast', kort: 'Hoekkast',
    title: 'Hoekkast op maat: L- of V-vorm, ook met ronde koppen | Bylder',
    description: 'Een hoekkast op maat benut de dode hoek en loopt langs twee muren. Ontwerp hem zelf met ronde koppen, greeploos tot het plafond. Met maten, vakregels en zaaglijst.',
    label: 'Kast op maat · hoekkast',
    h1: 'Hoekkast op maat: twee muren, één kast',
    intro: 'Een hoekkast loopt langs twee muren en komt samen in de binnenhoek. Hij geeft veel bergruimte op een plek die anders leeg blijft. De uitdaging zit in de hoek zelf: daar ontstaat een diep vak dat je slecht bereikt, en daar kunnen deuren elkaar raken.',
    secties: [
      { h2: 'De dode hoek slim gebruiken', p: [
        'Waar de twee benen samenkomen, ligt een vak van ongeveer 40 × 40 cm dat je alleen van opzij bereikt. Dat is de perfecte plek voor lange spullen die je niet dagelijks pakt: een steelstofzuiger, een strijkplank of een kerstboom. In het voorbeeld hieronder is het hoekvak 100 cm breed en 148 cm vrij hoog, zonder tussenschot, met erboven één plank.',
      ] },
      { h2: 'Deuren in de binnenhoek', p: [
        'Twee deuren die elk vanuit de hoek opendraaien, raken elkaar. Daarom krijgt de hoek aan beide kanten een vulstuk van 6 cm, en draait de eerste deur van één been vanuit de hoek met een openingsbegrenzer op ongeveer 90°. De deuren van het andere been draaien van de hoek af.',
      ] },
      { h2: 'Ronde koppen', p: [
        'Een ronde kop is een kwartcirkel aan het vrije uiteinde, even breed als de kast diep is. Onderin een dicht gebogen kastje, daarboven open ronde planken, bovenin een gebogen kap. De ronding wordt gemaakt van buig-MDF over gefreesde spanten. Dat is meer werk dan een rechte kop, maar je loopt er langs zonder scherpe hoek.',
      ] },
    ],
    vragen: [
      { v: 'Hoe diep moet een hoekkast zijn?', a: 'Voor spullen en boeken is 40 cm genoeg, voor kleding op hangers 60 cm. Hoe ondieper, hoe kleiner en sierlijker een ronde kop wordt.' },
      { v: 'Kan een hoekkast tot het plafond?', a: 'Ja. De kast komt tot 2 cm onder het plafond; die ruimte werkt de meubelmaker af met een passtrook die hij op het plafond aftekent, omdat geen plafond helemaal recht is.' },
      ...ALGEMEEN,
    ],
  },
  {
    slug: 'tv-wand', voorbeeld: 'tv-wand', kort: 'Tv-wand',
    title: 'Tv-wand op maat: kast met open tv-vak en lades | Bylder',
    description: 'Een tv-wand op maat met een open vak voor je televisie, lades voor kabels en apparatuur en dichte kasten tot het plafond. Ontwerp hem zelf in 3D.',
    label: 'Kast op maat · tv-wand',
    h1: 'Tv-wand op maat: de tv in een kast die de hele muur vult',
    intro: 'Een tv-wand maakt van een muur met losse meubels één rustig vlak. De tv krijgt een open vak, de apparatuur en kabels verdwijnen achter fronten, en links en rechts is bergruimte tot het plafond.',
    secties: [
      { h2: 'Het tv-vak op maat van je tv', p: [
        'Een tv van 65 inch is ongeveer 145 cm breed en 83 cm hoog. In het voorbeeld is het open vak 160 × 115 cm, zodat er rondom lucht blijft en je de tv ook aan de wand kunt hangen. Vertel de ontwerper de maat van je tv; hij rekent het vak daarop.',
      ] },
      { h2: 'Lades voor apparatuur en kabels', p: [
        'Onder het tv-vak zitten twee rijen lades. Een lade is hooguit 100 cm breed; bij een breder tv-vak verdeelt de ontwerper ze over twee kasten. Vraag de meubelmaker om kabeldoorvoeren in de rug en ventilatie bij een ontvanger of spelcomputer.',
      ] },
      { h2: 'Greeploos', p: [
        'Een tv-wand oogt het rustigst zonder grepen. Fronten gaan dan open met een drukopener. In het voorbeeld zijn alle fronten greeploos in een zachte grijstint.',
      ] },
    ],
    vragen: [
      { v: 'Hoe diep is een tv-wand?', a: 'Meestal 40 tot 45 cm. Diep genoeg voor apparatuur en lades, ondiep genoeg om de kamer niet kleiner te maken.' },
      { v: 'Kan de tv aan de wand in het open vak?', a: 'Ja. Het vak heeft dan geen rug of een rug met een uitsparing, zodat de beugel op de muur kan. Zeg het tegen de ontwerper, dan staat het in de aanvraag voor het timmerbedrijf.' },
      ...ALGEMEEN,
    ],
  },
  {
    slug: 'kast-in-nis', voorbeeld: 'kast-in-nis', kort: 'Kast in een nis',
    title: 'Kast in een nis op maat: van muur tot muur | Bylder',
    description: 'Een inbouwkast in een nis vult de ruimte van muur tot muur en tot het plafond. Met lades voor schoenen, ruimte voor jassen en passtroken voor scheve muren.',
    label: 'Kast op maat · nis',
    h1: 'Kast in een nis: precies passend, ook als de muren niet recht zijn',
    intro: 'Een nis is de dankbaarste plek voor een kast op maat: de muren doen het zijwerk, en een kast die van muur tot muur loopt, oogt alsof hij er altijd was. Het enige wat telt, is dat de kast ook past als de muren niet helemaal recht zijn.',
    secties: [
      { h2: 'Passtroken voor scheve muren', p: [
        'Geen muur is helemaal recht. Daarom houdt de ontwerper aan beide kanten 2 cm over voor een passtrook. De meubelmaker tekent die af op de muur en zaagt hem precies op maat, zodat er geen kier zichtbaar is.',
        'Meet de nis daarom op drie hoogtes: onder, in het midden en boven. De kleinste maat telt.',
      ] },
      { h2: 'Hal: schoenen, jassen en tassen', p: [
        'In het voorbeeld is de nis 140 cm breed. Drie smalle delen van 45 cm, elk met lades onderin voor schoenen, een hoge deur en een bovenkast. Het middelste deel heeft geen planken: daar hangen de jassen.',
      ] },
    ],
    vragen: [
      { v: 'Hoe breed mag een deur in een nis zijn?', a: 'Hooguit 60 cm. Bij een nis van 140 cm worden het dus drie deuren, of twee dubbele deuren met een tussenschot.' },
      ...ALGEMEEN,
    ],
  },
  {
    slug: 'boekenkast', voorbeeld: 'boekenkast', kort: 'Boekenkast',
    title: 'Boekenkast op maat: planken die niet doorbuigen | Bylder',
    description: 'Een boekenkast op maat tot het plafond, met open vakken die niet doorbuigen en dichte kastjes onderin. Ontwerp hem zelf in eiken of in elke RAL-kleur.',
    label: 'Kast op maat · boekenkast',
    h1: 'Boekenkast op maat: open vakken die blijven staan',
    intro: 'Een boekenkast staat of valt met zijn planken. Boeken zijn zwaar, en een plank die te breed is, zakt na een paar maanden door. Een boekenkast op maat lost dat op met de juiste vakbreedte, en vult de muur zonder losse gaten.',
    secties: [
      { h2: 'Vakbreedte: hooguit 80 cm', p: [
        'Een legplank van 18 mm met boeken erop overspant hooguit 80 cm. Daarom verdeelt de ontwerper een brede muur in vakken van ongeveer 76 cm binnenmaat. Wil je bredere vakken, dan krijgen de planken een lat onder de voorkant, tot 120 cm.',
      ] },
      { h2: 'Diepte en vakhoogte', p: [
        'Voor boeken is 30 tot 35 cm diep genoeg. Een vak van 32 cm hoog past bijna alle boeken; voor grote kunstboeken maak je één of twee vakken hoger. In het voorbeeld zijn de open vakken 34 cm hoog, met onderin dichte kastjes van 70 cm voor spullen die je niet wilt zien.',
      ] },
    ],
    vragen: [
      { v: 'Welk materiaal voor een boekenkast?', a: 'Eiken fineer of gelakt MDF. Bij een open kast zie je de binnenkant, dus die is in dezelfde afwerking als de buitenkant.' },
      ...ALGEMEEN,
    ],
  },
  {
    slug: 'inbouwkast', voorbeeld: 'inbouwkast', kort: 'Inbouwkast',
    title: 'Inbouwkast slaapkamer op maat: hangruimte en planken | Bylder',
    description: 'Een inbouwkast voor de slaapkamer van muur tot muur, 60 cm diep, met hangruimte en planken. Ontwerp hem zelf, het timmerbedrijf meet in en plaatst hem.',
    label: 'Kast op maat · inbouwkast',
    h1: 'Inbouwkast voor de slaapkamer: kleding op maat opgeborgen',
    intro: 'Een inbouwkast in de slaapkamer loopt van muur tot muur en tot het plafond. Je verliest geen ruimte aan zijkanten en een bovenkant die stof verzamelt, en de verdeling binnenin past bij wat jij ophangt en neerlegt.',
    secties: [
      { h2: '60 cm diep voor kleding', p: [
        'Kleding op hangers vraagt 60 cm diepte. Voor overhemden en jasjes is 100 cm hanghoogte genoeg, voor jurken en jassen 150 tot 160 cm. In het voorbeeld heeft elk deel een hangvak van 182 cm hoog en een vak met vijf planken.',
      ] },
      { h2: 'Dubbele deuren van hooguit 60 cm', p: [
        'Een deur van meer dan 60 cm breed trekt krom en draait te ver de kamer in. Een deel van 120 cm krijgt daarom twee deuren, met een tussenschot onder de naad. Bovenin komen bovenkasten voor wat je zelden pakt.',
      ] },
    ],
    vragen: [
      { v: 'Hoe hoog moet een hangvak zijn?', a: 'Voor overhemden en broeken ongeveer 100 cm, voor jurken en lange jassen 150 tot 160 cm. Vertel de ontwerper wat je ophangt.' },
      ...ALGEMEEN,
    ],
  },
]

export const ALLE = [PIJLER, ...TYPES]
export const URL_BASIS = 'https://www.bylder.com/kasten-op-maat/'
export const urlVan = (p: HubPagina) => (p.slug ? `${URL_BASIS}${p.slug}/` : URL_BASIS)
export const BIJGEWERKT = '2026-10-08'
