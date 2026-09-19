// De dertien freesdeuren van Classic Next, als tekenopdracht.
//
// WAAROM PARAMETRISCH EN NIET ALS FOTO
// Op de productpagina staat: een groef is in de kern een schaduw, dus hoe donkerder
// de lak, hoe nadrukkelijker het patroon. Een ingekleurde foto van een witte deur
// kan dat niet laten zien — je krijgt een vlek waar een schaduw hoort. Door de
// groeven als vorm te beschrijven en het licht zijn werk te laten doen, klopt het
// gedrag vanzelf: in gebroken wit fluistert het patroon, in antraciet roept het.
//
// Coördinaten zijn fracties van het deurblad (0 = links/boven, 1 = rechts/onder),
// zodat hetzelfde ontwerp op elke deurmaat klopt.

export type Groef =
  | { soort: 'verticaal'; x: number }
  | { soort: 'horizontaal'; y: number }
  // Marge links/rechts en boven/onder apart: in de tekening is de kaderlijn
  // 139,5 mm van de zijkant en 127,5 mm van de boven- en onderkant. Dat is in
  // fracties dus niet hetzelfde getal.
  | { soort: 'kader'; x: number; y: number }
  // van/tot in graden; weggelaten = hele cirkel. 0° is rechts, met de klok mee.
  | { soort: 'boog'; cx: number; cy: number; r: number; van?: number; tot?: number }
  | { soort: 'chevron'; y: number; hoogte: number }

export type Ontwerp = {
  id: string
  naam: string
  groef: string          // korte typering, zoals op de productpagina
  waar: string           // waar het ontwerp op zijn plek valt
  groeven: Groef[]
}

// Volgorde van rustig naar uitgesproken — de volgorde waarin mensen ook kiezen.
export const ONTWERPEN: Ontwerp[] = [
  { id: 'origin', naam: 'Origin', groef: 'Geen freeswerk',
    waar: 'Het vlakke deurblad. In een instuckozijn verdwijnt deze deur het verst in de wand.',
    groeven: [] },
  { id: 'dawn', naam: 'Dawn', groef: '1 verticale groef',
    waar: 'Eén rechte lijn over de volle hoogte, op ruim een kwart vanaf de krukzijde.',
    groeven: [{ soort: 'verticaal', x: 0.2594 }] },
  { id: 'whisper', naam: 'Whisper', groef: '2 verticale groeven',
    waar: 'Op afstand lees je één accent, van dichtbij twee.',
    groeven: [{ soort: 'verticaal', x: 0.2194 }, { soort: 'verticaal', x: 0.3228 }] },
  { id: 'shadow', naam: 'Shadow', groef: '4 verticale groeven',
    waar: 'Vangt strijklicht. In een ruimte met licht van opzij zie je de groeven pas echt.',
    groeven: [0.1417, 0.1728, 0.2039, 0.235].map(x => ({ soort: 'verticaal', x }) as Groef) },
  { id: 'noir', naam: 'Noir', groef: '4 verticale groeven',
    waar: 'Verdeelt de deur in vijf even brede vlakken. Een lattenlook zonder latten.',
    groeven: [0.207, 0.4023, 0.5977, 0.793].map(x => ({ soort: 'verticaal', x }) as Groef) },
  { id: 'aura', naam: 'Aura', groef: 'Bundel fijne groeven',
    waar: 'De meest uitgesproken van de verticale reeks. Eén per ruimte is genoeg.',
    groeven: Array.from({ length: 13 }, (_, i) => ({ soort: 'verticaal', x: 0.28 + i * 0.036667 }) as Groef) },
  { id: 'muse', naam: 'Muse', groef: '2 horizontale groeven',
    waar: 'Horizontaal maakt een ruimte optisch breder. Handig in een smalle overloop.',
    groeven: [{ soort: 'horizontaal', y: 0.3328 }, { soort: 'horizontaal', y: 0.6672 }] },
  { id: 'echo', naam: 'Echo', groef: '4 horizontale groeven',
    waar: 'Regelmatiger dan Muse en daardoor rustiger, ondanks meer lijnen.',
    groeven: [0.2, 0.4, 0.6, 0.8].map(y => ({ soort: 'horizontaal', y }) as Groef) },
  { id: 'drift', naam: 'Drift', groef: 'Verticaal én horizontaal',
    waar: 'De enige met een duidelijke compositie. Vraagt om een wand waar hij alleen staat.',
    groeven: [{ soort: 'verticaal', x: 0.2594 }, { soort: 'horizontaal', y: 0.5151 },
              { soort: 'horizontaal', y: 0.6114 }] },
  { id: 'solace', naam: 'Solace', groef: 'Enkele omlijsting',
    waar: 'De klassieke paneeldeur, teruggebracht tot één lijn.',
    groeven: [{ soort: 'kader', x: 0.155, y: 0.0551 }] },
  { id: 'halo', naam: 'Halo', groef: 'Dubbele omlijsting',
    waar: 'Zelfde gedachte als Solace, met meer nadruk op de omtrek.',
    groeven: [{ soort: 'kader', x: 0.155, y: 0.0551 },
              { soort: 'kader', x: 0.2161, y: 0.0788 }] },
  { id: 'horizon', naam: 'Horizon', groef: 'Boogmotief',
    waar: 'Geen deur voor het hele huis, wel voor de deur waar je op uitkijkt vanaf de trap.',
    // Twee halve cirkels met hun platte kant tegen de linker kaderlijn; de
    // buitenste raakt de rechter kaderlijn. Middelpunt op halve hoogte.
    groeven: [{ soort: 'kader', x: 0.155, y: 0.0551 },
              { soort: 'boog', cx: 0.1567, cy: 0.5, r: 0.685, van: -90, tot: 90 },
              { soort: 'boog', cx: 0.1567, cy: 0.5, r: 0.615, van: -90, tot: 90 }] },
  { id: 'ember', naam: 'Ember', groef: 'Visgraat',
    waar: 'Slaat aan bij een visgraatvloer, en vloekt met bijna alles daarbuiten.',
    // Acht punten op gelijke afstand; de bovenste en de onderste lopen het
    // kader uit en worden erdoor afgesneden, precies als in de tekening.
    groeven: [{ soort: 'kader', x: 0.155, y: 0.0551 },
              ...Array.from({ length: 8 }, (_, i) =>
                ({ soort: 'chevron', y: 0.0039 + i * 0.124, hoogte: 0.1335 }) as Groef)] },
]

// RAL-benaderingen voor het scherm. RAL is een fysieke standaard op een kleurstaal;
// wat je hier ziet is een benadering die per beeldscherm verschilt. Dat staat ook
// op de pagina — een kleur beloven die bij levering anders is, is duurder dan de
// nuance uitleggen.
export type Kleur = { ral: string; naam: string; hex: string }

export const KLEUREN: Kleur[] = [
  { ral: '9010', naam: 'Zuiver wit', hex: '#F1ECE1' },
  { ral: '9016', naam: 'Verkeerswit', hex: '#F1F0EA' },
  { ral: '9003', naam: 'Signaalwit', hex: '#F4F4F4' },
  { ral: '9001', naam: 'Crèmewit', hex: '#E9E0D2' },
  { ral: '1013', naam: 'Parelwit', hex: '#E3D9C6' },
  { ral: '1015', naam: 'Licht ivoor', hex: '#E6D2B5' },
  { ral: '7035', naam: 'Lichtgrijs', hex: '#D7D7D7' },
  { ral: '7047', naam: 'Telegrijs 4', hex: '#D0D0D0' },
  { ral: '7038', naam: 'Agaatgrijs', hex: '#B5B8B1' },
  { ral: '7001', naam: 'Zilvergrijs', hex: '#8F999F' },
  { ral: '7037', naam: 'Stofgrijs', hex: '#7D7F7D' },
  { ral: '7039', naam: 'Kwartsgrijs', hex: '#6C6960' },
  { ral: '7012', naam: 'Basaltgrijs', hex: '#4E5452' },
  { ral: '7016', naam: 'Antracietgrijs', hex: '#383E42' },
  { ral: '7021', naam: 'Zwartgrijs', hex: '#2F3234' },
  { ral: '9005', naam: 'Gitzwart', hex: '#0E0E10' },
  { ral: '6021', naam: 'Bleekgroen', hex: '#89AC76' },
  { ral: '6005', naam: 'Mosgroen', hex: '#2F4538' },
  { ral: '6009', naam: 'Dennengroen', hex: '#27352A' },
  { ral: '5014', naam: 'Duifblauw', hex: '#6C7C98' },
  { ral: '5008', naam: 'Grijsblauw', hex: '#2E3A44' },
  { ral: '5011', naam: 'Staalblauw', hex: '#1A2B3C' },
  { ral: '3009', naam: 'Oxyderood', hex: '#6D3F3B' },
  { ral: '3005', naam: 'Wijnrood', hex: '#59191F' },
  { ral: '8017', naam: 'Chocoladebruin', hex: '#442F29' },
  { ral: '8019', naam: 'Grijsbruin', hex: '#3D3635' },
]


// ── Afwerking ────────────────────────────────────────────────────────────
// Drie wegen, en ze sluiten elkaar uit: gegrond schilder je zelf, gelakt komt in
// een RAL-kleur uit de fabriek, fineer is hout en heeft dus geen kleurkeuze maar
// een houtsoort.
export type Afwerking = 'gegrond' | 'gelakt' | 'fineer'

export const AFWERKINGEN: { id: Afwerking; naam: string; uitleg: string }[] = [
  { id: 'gegrond', naam: 'Gegrond',
    uitleg: 'Voorbehandeld en klaar om te schilderen. Elke kleur is dus mogelijk, ook eentje '
          + 'die je later nog wilt veranderen — je schildert de deur mee met de wand.' },
  { id: 'gelakt', naam: 'Gelakt',
    uitleg: 'Afgelakt in de fabriek in de RAL-kleur die je kiest. Strakker en harder dan '
          + 'schilderwerk op de bouw, en meteen klaar bij levering.' },
  // Let op: de decors die Classic Next levert zijn HPL — een geperst houtdecor,
  // geen echt houtfineer. Dat stond hier eerst wel en is onjuist. Het verschil
  // hoort de koper te weten: HPL is harder en krasvaster, fineer is echt hout
  // met de prijs die daarbij hoort.
  { id: 'fineer', naam: 'Houtdecor',
    uitleg: 'Een geperst houtdecor (HPL) met de nerf voelbaar in het oppervlak. Geen kleurkeuze '
          + 'maar een houtsoort: de nerf is het patroon. Harder en krasvaster dan gelakt.' },
]

// VOORLOPIG. Classic Next levert drie houtsoorten; welke dat precies zijn en hoe
// ze eruitzien volgt uit hun scans. Tot die er zijn tonen we een indicatie en
// zegt de pagina dat er ook bij — een houtnerf verzinnen die bij levering anders
// blijkt, is precies het soort belofte dat we niet doen.
export type Fineer = {
  id: string; naam: string
  /** Basiskleur en nerfkleur. Twee rollen: de wand volgt de basiskleur als er
   *  houtdecor gekozen is, en als de kleurkaart niet laadt tekenen we hiermee
   *  een grove nerf in plaats van een leeg vlak. */
  basis: string; nerf: string
  /** Bestandsnaam van de kleurkaart onder /img/classic-next/fineer/. */
  beeld?: string
  /** De structuurkaart (persing). Decors uit dezelfde reeks delen die, dus hij
   *  staat apart: W07 hoort bij drie decors, en dat scheelt 124 kB. */
  structuur?: string
  /** Hoeveel millimeter de tegel in werkelijkheid beslaat, breed bij hoog.
   *  Niet elk decor is vierkant: Master Oak is een hele plaat van 3040 bij
   *  1270 mm. Zonder deze maat wordt de nerf te grof of te fijn. */
  tegelMm?: [number, number]
  /** Het artikelnummer van de leverancier, voor op de offerte. */
  code?: string
}

// De decors die Classic Next levert, aangeleverd als Unilin-materiaal op 14 en
// 16 september 2026. Het zijn HPL-decors: een geperst houtdecor, geen echt
// houtfineer.
//
// De maten komen uit het V-Ray-bestand van elk decor, niet uit een schatting.
// Bij twee ervan stond de eenheid er niet bij; 3040 bij 1270 mm komt daar
// vrijwel exact overeen met een standaard HPL-plaat van 3050 bij 1300, wat
// bevestigt dat het om centimeters gaat.
export const FINEREN: Fineer[] = [
  { id: 'oslo-oak', naam: 'Oslo Oak tanned red', basis: '#654535', nerf: '#4A3226',
    beeld: 'oslo-oak', structuur: 'structuur-w07', tegelMm: [1300, 1300], code: '0H598-W07' },
  { id: 'oslo-oak-cocoa', naam: 'Oslo Oak cocoa brown', basis: '#5A4032', nerf: '#412C22',
    beeld: 'oslo-oak-cocoa', structuur: 'structuur-w07', tegelMm: [1300, 1300], code: '0H597-W07' },
  { id: 'valley-ash', naam: 'Valley Ash sunlit brown', basis: '#8A6A4C', nerf: '#6A4F37',
    beeld: 'valley-ash', structuur: 'structuur-w07', tegelMm: [1300, 1300], code: '0H593-W07' },
  { id: 'dainty-oak-latte', naam: 'Dainty Oak latte', basis: '#B79A79', nerf: '#957B5E',
    beeld: 'dainty-oak-latte', structuur: 'structuur-v1a', tegelMm: [1300, 1509], code: '0H267-V1A' },
  { id: 'robinson-oak', naam: 'Robinson Oak light natural', basis: '#C0A484', nerf: '#9C8365',
    beeld: 'robinson-oak', structuur: 'structuur-w06', tegelMm: [1306, 1300], code: '0H784-W06' },
  { id: 'master-oak', naam: 'Master Oak natural', basis: '#A98A66', nerf: '#876C4E',
    beeld: 'master-oak', structuur: 'structuur-v2a', tegelMm: [3040, 1270], code: '0H913-V2A' },
  // Bij dit decor leverde Unilin geen structuurkaart, alleen een normaalkaart.
  // Die kunnen wij niet in de hoogtekaart gebruiken; het decor is dus vlak.
  { id: 'master-oak-patina', naam: 'Master Oak patina', basis: '#9B7F5E', nerf: '#7B6347',
    beeld: 'master-oak-patina', tegelMm: [3040, 1270], code: '0H923-V2A' },
  { id: 'kivu-wenge', naam: 'Kivu Wenge', basis: '#4A3A30', nerf: '#332721',
    beeld: 'kivu-wenge', structuur: 'structuur-cst', tegelMm: [1300, 1300], code: '0H687-CST' },
]

