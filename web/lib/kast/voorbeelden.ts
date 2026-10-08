import { VOORBEELD_HOEKKAST, type Ontwerp } from './ontwerp'

// Voorbeeldontwerpen per kasttype, voor de ContentHub. Elk voorbeeld gaat door
// hetzelfde rekenmodel als een echt ontwerp, dus de maten, vakken en de zaaglijst
// op de pagina's zijn echt en niet verzonnen.

const plint = { hoogte: 8, terug: 4 }
const lak = (naam: string, code: string, hex: string) => ({ soort: 'lak' as const, naam, code, hex, glans: 'mat' as const })

export type Voorbeeld = { slug: string; type: string; titel: string; ontwerp: Ontwerp }

export const VOORBEELDEN: Voorbeeld[] = [
  {
    slug: 'hoekkast', type: 'Hoekkast', titel: 'Hoekkast met ronde koppen',
    ontwerp: { ...VOORBEELD_HOEKKAST, naam: 'Hoekkast met ronde koppen' },
  },
  {
    slug: 'tv-wand', type: 'Tv-wand', titel: 'Tv-wand met lades en open vak',
    ontwerp: {
      versie: 1, naam: 'Tv-wand', plafond: 260, diepte: 45, plint, passtrook: 2, opstelling: 'wand',
      benen: [{ muur: 'tv-muur', muurlengte: 340, segmenten: [
        { breedte: 80, vorm: 'recht', zones: [{ hoogte: 186, inhoud: 'deuren', deuren: 2, planken: 4 }, { hoogte: 64, inhoud: 'deuren', deuren: 2, planken: 1 }] },
        { breedte: 80, vorm: 'recht', zones: [{ hoogte: 45, inhoud: 'lades', lades: 2 }, { hoogte: 115, inhoud: 'leeg', functie: 'tv' }, { hoogte: 26, inhoud: 'open', planken: 0 }, { hoogte: 64, inhoud: 'deuren', deuren: 2, planken: 1 }] },
        { breedte: 80, vorm: 'recht', zones: [{ hoogte: 45, inhoud: 'lades', lades: 2 }, { hoogte: 115, inhoud: 'leeg', functie: 'tv' }, { hoogte: 26, inhoud: 'open', planken: 0 }, { hoogte: 64, inhoud: 'deuren', deuren: 2, planken: 1 }] },
        { breedte: 80, vorm: 'recht', zones: [{ hoogte: 186, inhoud: 'deuren', deuren: 2, planken: 4 }, { hoogte: 64, inhoud: 'deuren', deuren: 2, planken: 1 }] },
      ] }],
      afwerking: lak('Zachtgrijs', 'RAL 7044', '#B8B3A6'), binnen: 'wit', greep: 'geen', maatstatus: 'gemeten', maatbron: 'voorbeeld',
      notities: ['Een open plek van 160 × 115 cm voor een tv van 65 inch, met lades eronder voor kabels en spelcomputers.'],
    },
  },
  {
    slug: 'kast-in-nis', type: 'Kast in een nis', titel: 'Halkast in een nis',
    ontwerp: {
      versie: 1, naam: 'Halkast in een nis', plafond: 250, diepte: 40, plint, passtrook: 2, opstelling: 'nis',
      benen: [{ muur: 'nis in de hal', muurlengte: 140, segmenten: [0, 1, 2].map(i => ({
        breedte: 45.3, vorm: 'recht' as const, zones: [
          { hoogte: 36, inhoud: 'lades' as const, lades: 2, functie: 'schoenen' },
          { hoogte: 168, inhoud: 'deuren' as const, deuren: 1 as const, planken: i === 1 ? 0 : 4, functie: i === 1 ? 'jassen' : null },
          { hoogte: 36, inhoud: 'deuren' as const, deuren: 1 as const, planken: 0 },
        ] })) }],
      afwerking: lak('Gebroken wit', 'RAL 9010', '#EDEAE0'), binnen: 'wit', greep: 'staaf', maatstatus: 'gemeten', maatbron: 'voorbeeld',
      notities: ['Lades onderin voor schoenen, in het middelste vak ruimte voor jassen.'],
    },
  },
  {
    slug: 'boekenkast', type: 'Boekenkast', titel: 'Boekenkast in eiken',
    ontwerp: {
      versie: 1, naam: 'Boekenkast', plafond: 260, diepte: 32, plint, passtrook: 2, opstelling: 'wand',
      benen: [{ muur: 'boekenmuur', muurlengte: 260, segmenten: [0, 1, 2].map(() => ({
        breedte: 80, vorm: 'recht' as const, zones: [
          { hoogte: 70, inhoud: 'deuren' as const, deuren: 2 as const, planken: 1 },
          { hoogte: 180, inhoud: 'open' as const, planken: 4, functie: 'boeken' },
        ] })) }],
      afwerking: { soort: 'hout', naam: 'Eiken naturel', code: null, hex: '#B98A5A', glans: 'mat' }, binnen: 'zelfde', greep: 'geen', maatstatus: 'gemeten', maatbron: 'voorbeeld',
      notities: ['Open vakken van 76 cm breed: zo buigen planken met boeken niet door.'],
    },
  },
  {
    slug: 'inbouwkast', type: 'Inbouwkast', titel: 'Inbouwkast voor de slaapkamer',
    ontwerp: {
      versie: 1, naam: 'Inbouwkast slaapkamer', plafond: 250, diepte: 60, plint, passtrook: 2, opstelling: 'nis',
      benen: [{ muur: 'slaapkamermuur', muurlengte: 244, segmenten: [0, 1].map(() => ({
        breedte: 120, vorm: 'recht' as const, zones: [
          { hoogte: 186, inhoud: 'deuren' as const, deuren: 2 as const, vakken: [{ planken: 0, functie: 'hangroede' }, { planken: 5 }] },
          { hoogte: 54, inhoud: 'deuren' as const, deuren: 2 as const, planken: 0 },
        ] })) }],
      afwerking: lak('Zandkleur', 'RAL 1013', '#E3D9C6'), binnen: 'wit', greep: 'geen', maatstatus: 'gemeten', maatbron: 'voorbeeld',
      notities: ['60 cm diep voor kleding op hangers; per deel een hangvak en een vak met planken.'],
    },
  },
]

export const voorbeeld = (slug: string) => VOORBEELDEN.find(v => v.slug === slug)!
