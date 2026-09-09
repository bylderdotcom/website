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
  | { soort: 'kader'; inset: number }
  | { soort: 'boog'; cx: number; cy: number; r: number }
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
    waar: 'Eén rechte lijn over de volle hoogte, uit het midden geplaatst.',
    groeven: [{ soort: 'verticaal', x: 0.38 }] },
  { id: 'whisper', naam: 'Whisper', groef: '2 verticale groeven',
    waar: 'Op afstand lees je één accent, van dichtbij twee.',
    groeven: [{ soort: 'verticaal', x: 0.355 }, { soort: 'verticaal', x: 0.40 }] },
  { id: 'shadow', naam: 'Shadow', groef: '3 verticale groeven',
    waar: 'Vangt strijklicht. In een ruimte met licht van opzij zie je de groeven pas echt.',
    groeven: [{ soort: 'verticaal', x: 0.30 }, { soort: 'verticaal', x: 0.335 },
              { soort: 'verticaal', x: 0.37 }] },
  { id: 'noir', naam: 'Noir', groef: '5 verticale groeven',
    waar: 'Een lattenlook zonder latten. Past bij houten wandpanelen elders in huis.',
    groeven: [0.28, 0.36, 0.44, 0.52, 0.60].map(x => ({ soort: 'verticaal', x }) as Groef) },
  { id: 'aura', naam: 'Aura', groef: 'Bundel fijne groeven',
    waar: 'De meest uitgesproken van de verticale reeks. Eén per ruimte is genoeg.',
    groeven: Array.from({ length: 10 }, (_, i) => ({ soort: 'verticaal', x: 0.42 + i * 0.028 }) as Groef) },
  { id: 'muse', naam: 'Muse', groef: '2 horizontale groeven',
    waar: 'Horizontaal maakt een ruimte optisch breder. Handig in een smalle overloop.',
    groeven: [{ soort: 'horizontaal', y: 0.34 }, { soort: 'horizontaal', y: 0.66 }] },
  { id: 'echo', naam: 'Echo', groef: '4 horizontale groeven',
    waar: 'Regelmatiger dan Muse en daardoor rustiger, ondanks meer lijnen.',
    groeven: [0.2, 0.4, 0.6, 0.8].map(y => ({ soort: 'horizontaal', y }) as Groef) },
  { id: 'drift', naam: 'Drift', groef: 'Verticaal én horizontaal',
    waar: 'De enige met een duidelijke compositie. Vraagt om een wand waar hij alleen staat.',
    groeven: [{ soort: 'verticaal', x: 0.36 }, { soort: 'horizontaal', y: 0.46 },
              { soort: 'horizontaal', y: 0.56 }] },
  { id: 'solace', naam: 'Solace', groef: 'Enkele omlijsting',
    waar: 'De klassieke paneeldeur, teruggebracht tot één lijn.',
    groeven: [{ soort: 'kader', inset: 0.09 }] },
  { id: 'halo', naam: 'Halo', groef: 'Dubbele omlijsting',
    waar: 'Zelfde gedachte als Solace, met meer nadruk op de omtrek.',
    groeven: [{ soort: 'kader', inset: 0.075 }, { soort: 'kader', inset: 0.095 }] },
  { id: 'horizon', naam: 'Horizon', groef: 'Boogmotief',
    waar: 'Geen deur voor het hele huis, wel voor de deur waar je op uitkijkt vanaf de trap.',
    groeven: [{ soort: 'kader', inset: 0.075 },
              { soort: 'boog', cx: 0.62, cy: 0.42, r: 0.38 },
              { soort: 'boog', cx: 0.62, cy: 0.42, r: 0.345 }] },
  { id: 'ember', naam: 'Ember', groef: 'Visgraat',
    waar: 'Slaat aan bij een visgraatvloer, en vloekt met bijna alles daarbuiten.',
    groeven: [{ soort: 'kader', inset: 0.085 },
              ...Array.from({ length: 8 }, (_, i) =>
                ({ soort: 'chevron', y: 0.13 + i * 0.095, hoogte: 0.058 }) as Groef)] },
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
