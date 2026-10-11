import { deelnemers, aantalMerken, type Deelnemer } from './merken'

/**
 * DE BRON voor de commerciële stap op een pagina (besluit Daniel, 11-10-2026: elke pagina
 * heeft er één). Per onderwerp staat hier welke stap erbij hoort; de component
 * CommercieleStap (web/app/components/) leest dit en kiest de vorm. Een andere stap voor een
 * onderwerp = hier één regel aanpassen; alle pagina's van dat onderwerp volgen bij de build.
 *
 * De stappen:
 *   deuren    → deurconfigurator (Classic Next), met foto
 *   gietvloer → gietvloerontwerper
 *   kast      → kastontwerper, met 3D-beeld
 *   plinten   → offerte onzichtbare plinten
 *   auping    → Auping-voucher, met foto (zoals op de homepage)
 *   korting   → ledenkorting bij de merken uit de genoemde categorieën van data/deelnemers.json
 *
 * Onder elke stap staat daarnaast de AanbodStrook met alle vijf, dus ook Auping met foto.
 */

export type Stap = 'deuren' | 'gietvloer' | 'kast' | 'plinten' | 'auping' | 'korting'
export type Aanbod = {
  stap: Stap
  /** De aanleiding in de woorden van dit onderwerp. Zonder: de standaardtekst van de stap. */
  aanleiding?: string
  /** Bij 'korting': categorieën uit data/deelnemers.json (veld cat). Leeg = alle merken. */
  categorieen?: string[]
  /** Kopregel van de korting, bv. "Korting op sanitair". */
  titel?: string
}

export const ONDERWERPEN: Record<string, Aanbod> = {
  // /kopen/<productgroep>/
  'kopen/vloeren': { stap: 'gietvloer', aanleiding: 'Twijfel je over een gietvloer? Upload een foto van een vloer die je mooi vindt. Wij lezen de kleur, je kiest de ruimtes en je krijgt tot drie stalen gratis thuis.' },
  'kopen/tegels': { stap: 'korting', categorieen: ['Vloertegels', 'Wandtegels', 'Sanitair'], titel: 'Korting op tegels' },
  'kopen/raamdecoratie': { stap: 'korting', categorieen: ['Raamdecoratie', 'Zonwering'], titel: 'Korting op raamdecoratie en zonwering' },
  'kopen/sanitair': { stap: 'korting', categorieen: ['Sanitair', 'Wandtegels'], titel: 'Korting op sanitair' },
  'kopen/verlichting': { stap: 'korting', categorieen: ['Verlichting', 'Smart home'], titel: 'Korting op verlichting' },
  'kopen/keuken': { stap: 'korting', categorieen: ['Kitchen', 'Verlichting', 'Wandtegels'], titel: 'Korting op je keuken' },
  'kopen/slaap-en-bedden': { stap: 'auping' },
  'kopen/tuin': { stap: 'korting', categorieen: ['Tuin', 'Tuinmeubelen', 'Groen dak'], titel: 'Korting voor je tuin' },
  'kopen/zitmeubelen': { stap: 'korting', categorieen: ['Meubelen'], titel: 'Korting op meubels' },
  'kopen/binnendeuren': { stap: 'deuren', aanleiding: 'Een binnendeur zonder zichtbaar kozijn, plafondhoog en vlak in de wand. Stel hem samen in 3D en vraag direct een offerte aan bij Classic Next.' },
  'kopen/buitendeuren': { stap: 'korting', categorieen: ['Deuren', 'Smart home'], titel: 'Korting op deuren en sloten' },
  'kopen/elektronica': { stap: 'korting', categorieen: ['Smart home', 'Verlichting'], titel: 'Korting op slim wonen' },
  'kopen/isolatie': { stap: 'korting', categorieen: ['Groen dak', 'Bouwmaterialen'], titel: 'Korting op verduurzamen' },
  'kopen/kasten': { stap: 'kast', aanleiding: 'Een kast die precies in je nis, hoek of schuine wand past. Begin vanaf een voorbeeldfoto, zie hem in 3D en vraag een offerte aan bij een timmerbedrijf.' },
  'kopen/verf': { stap: 'korting', categorieen: ['Behang', 'Muurbekleding', 'Stucwerk'], titel: 'Korting op wandafwerking' },
  'kopen/wandafwerking': { stap: 'plinten', aanleiding: 'Een strakke wand eindigt zonder lijst langs de vloer. Een onzichtbare plint gaat vóór de stukadoor de wand in; vraag de offerte aan voordat het stucwerk is ingepland.' },
  'kopen/dakkapellen': { stap: 'kast', aanleiding: 'Een zolder met dakkapel wordt pas een kamer met genoeg bergruimte. Ontwerp een kast op maat, zie hem in 3D en vraag een offerte aan bij een timmerbedrijf.' },
  'kopen/zonnepanelen': { stap: 'korting', titel: 'Korting bij de merken van Bylder' },
  'kopen/laadpalen': { stap: 'korting', titel: 'Korting bij de merken van Bylder' },
  'kopen': { stap: 'auping' },

  // Vakmannen per stad (/loodgieter/<stad>/ enz.): de stap die past bij wat de koper laat doen.
  'loodgieter': { stap: 'korting', categorieen: ['Sanitair', 'Wandtegels'], titel: 'Korting op het sanitair zelf',
    aanleiding: 'De loodgieter sluit aan, het sanitair koop je zelf. Met een gratis Bylder-account krijg je ledenkorting bij deze zaken:' },
  'aannemer': { stap: 'deuren', aanleiding: 'Verbouw je of laat je afbouwen? Een kozijnloze deur gaat vóór de stukadoor de wand in; dan moet de aannemer het weten. Stel je deuren samen in 3D en vraag direct een offerte aan bij Classic Next.' },
  'schilder': { stap: 'korting', categorieen: ['Behang', 'Muurbekleding', 'Stucwerk'], titel: 'Korting op behang en wandafwerking',
    aanleiding: 'De schilder zet de verf of het behang op, het materiaal kies je zelf. Met een gratis Bylder-account krijg je ledenkorting bij deze merken:' },
  'elektricien': { stap: 'korting', categorieen: ['Verlichting', 'Smart home'], titel: 'Korting op verlichting en slim wonen',
    aanleiding: 'De elektricien legt de punten aan, de lampen koop je zelf. Met een gratis Bylder-account krijg je ledenkorting bij deze merken:' },
  'badkamer': { stap: 'korting', categorieen: ['Sanitair', 'Wandtegels', 'Vloertegels'], titel: 'Korting op sanitair en tegels',
    aanleiding: 'Sanitair en tegels zijn vaak de helft van de badkamerrekening. Met een gratis Bylder-account krijg je ledenkorting bij deze zaken:' },
  'stukadoor': { stap: 'plinten', aanleiding: 'Komt de stukadoor? Dan is dit het moment voor een onzichtbare plint en een kozijnloze deur: allebei gaan ze vóór het stucwerk de wand in. Vraag de offerte aan voordat het stucwerk is ingepland.' },
  'dakkapel': { stap: 'kast', aanleiding: 'Een zolder met dakkapel wordt pas een kamer met genoeg bergruimte. Ontwerp een kast op maat vanaf een voorbeeldfoto, zie hem in 3D en vraag een offerte aan bij een timmerbedrijf.' },
}

/** Het aanbod voor een pad als 'kopen/sanitair/wastafel/utrecht': het langste onderwerp dat past. */
export function aanbodVoor(pad: string): Aanbod | null {
  const delen = pad.replace(/^\/|\/$/g, '').split('/')
  for (let i = delen.length; i > 0; i--) {
    const a = ONDERWERPEN[delen.slice(0, i).join('/')]
    if (a) return a
  }
  return null
}

/** Merken met korting in de gevraagde categorieën, hoogste korting eerst. Leeg = alle merken. */
export function kortingenVoor(categorieen?: string[], max = 6): Deelnemer[] {
  const lijst = deelnemers().filter(d => !categorieen?.length || categorieen.includes(d.cat))
  const pct = (a: string) => { const m = a.match(/^(\d+)%/); return m ? +m[1] : (a.startsWith('€') ? 8 : 0) }
  return lijst.sort((a, b) => pct(b.aanbod) - pct(a.aanbod)).slice(0, max)
}

export { aantalMerken }
