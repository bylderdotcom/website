// Gietvloerontwerper: kleurenkaart, vloertypes en kleurvergelijking.
//
// Dit bestand staat in twee repo's, letterlijk gelijk: app (src/lib/gietvloer/gegevens.ts)
// en website (web/app/components/gietvloer/gegevens.ts). Pas ze samen aan.
//
// VOORLOPIGE KLEURENKAART
// Het kleurassortiment van Dr. Schutz met kleurcodes volgt. Tot dan staat hier een kaart
// met de tinten die bij gietvloeren het meest gekozen worden. De pagina zegt dat erbij,
// en een staalaanvraag gaat naar Dr. Schutz met de hexcode en de inspiratiefoto, zodat
// zij de drie dichtstbijzijnde kleuren uit hun eigen assortiment sturen. Komt de echte
// kaart, vervang dan KLEUREN en zet VOORLOPIG op false.

export const VOORLOPIG = true
export const MAX_STALEN = 3

export type Kleur = { id: string; naam: string; hex: string; code?: string }

export const KLEUREN: Kleur[] = [
  { id: 'kalkwit', naam: 'Kalkwit', hex: '#ECE8E0' },
  { id: 'gebroken-wit', naam: 'Gebroken wit', hex: '#E2DCCF' },
  { id: 'zandbeige', naam: 'Zandbeige', hex: '#D6C8B0' },
  { id: 'leem', naam: 'Leem', hex: '#C4B39A' },
  { id: 'kiezel', naam: 'Kiezel', hex: '#CBC6BC' },
  { id: 'lichtgrijs', naam: 'Lichtgrijs', hex: '#C9C9C6' },
  { id: 'zeegrijs', naam: 'Zeegrijs', hex: '#AEB4B5' },
  { id: 'betongrijs', naam: 'Betongrijs', hex: '#B3AFA7' },
  { id: 'taupe', naam: 'Taupe', hex: '#9F9284' },
  { id: 'klei', naam: 'Klei', hex: '#A58B74' },
  { id: 'steengrijs', naam: 'Steengrijs', hex: '#8E8B85' },
  { id: 'okergrijs', naam: 'Okergrijs', hex: '#9A907A' },
  { id: 'grafiet', naam: 'Grafiet', hex: '#66635F' },
  { id: 'antraciet', naam: 'Antraciet', hex: '#4E4C49' },
  { id: 'basalt', naam: 'Basalt', hex: '#3B3B3A' },
  { id: 'zwart', naam: 'Diepzwart', hex: '#262524' },
]
export const kleurOp = (id: string | null | undefined) => KLEUREN.find(k => k.id === id) ?? null

export type TypeId = 'fine' | 'cement' | 'lava' | 'concrete'
export type VloerType = {
  id: TypeId; naam: string; kort: string; voor: string[]; tegen: string[]
  /** Hoe druk de tekening is (1 rustig – 4 druk) en hoe makkelijk schoon te houden (1–5), uit de keuzehulp. */
  tekening: number; schoon: number
  prijsNiveau: '€€' | '€€€'
  /** Indicatie per m² incl. btw. null tot Dr. Schutz de ranges met de verwerkers heeft afgestemd. */
  prijs: [number, number] | null
  kleuren: number
  wand: boolean
  vloerverwarming: string
  /** Hoeveel wolk het staaltje in de ontwerper toont (0–1). */
  wolk: number
}

// DE VIER BIO-SYSTEMEN VAN DR. SCHUTZ (besluit Daniel, 23-10-2026; mail Lars 22-10-2026,
// keuzehulp en webteksten). Gekozen op tekening, van rustig naar druk. De kwaliteit is bij
// alle vier gelijk: Shore D80, 100% waterdicht, UV-stabiel, emissiearm en hypoallergeen.
// Bevestigd door Lars (mail 23-10-2026): alle vier EMICODE EC1 PLUS-gecertificeerd (de
// webteksten met "EC1+ Ready" waren van vóór de certificering), alle vier uitstekend geschikt
// voor vloerverwarming, en 20/20/20/10 kleuren. Bio Fine is technisch de fijne eindlaag op
// Bio Cement; dat is informatie voor de verwerker, de koper hoort: een heel egale
// lavasteenvloer met een zeer fijne korrel. Nog open: de prijsranges (met de verwerkers) en
// de kleuren per systeem met naam, code en foto. Tot dan geen bedragen per systeem.
const VVW = 'Uitstekend geschikt voor vloerverwarming: de vloer ligt zonder lucht op de ondergrond, dus de warmte komt er ongehinderd door.'
export const TYPES: VloerType[] = [
  {
    id: 'fine', naam: 'Bio Fine', kort: 'De rustigste: een heel egale lavasteenvloer met een zeer fijne korrel.',
    voor: ['Rustig en ruimtelijk, past bij elk interieur', 'Zeer fijne korrel, eenvoudig te onderhouden', 'Laat meubels en kunst de aandacht houden'],
    tegen: ['Op een rustig vlak zie je kruimels en gebruikssporen sneller'],
    tekening: 1, schoon: 4, prijsNiveau: '€€', prijs: null, kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.15,
  },
  {
    id: 'cement', naam: 'Bio Cement', kort: 'Een subtiele wolkentekening met de sfeer van gepolijst cement.',
    voor: ['Industriële uitstraling zonder dat het onrustig wordt', 'Meer levendigheid dan Bio Fine', 'Gebruikssporen vallen minder op'],
    tegen: ['Iets meer aandacht bij het schoonmaken dan Bio Fine'],
    tekening: 2, schoon: 3, prijsNiveau: '€€', prijs: null, kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.5,
  },
  {
    id: 'lava', naam: 'Bio Lava', kort: 'Levendig en vol karakter, met duidelijke wolken en echte lavasteentjes.',
    voor: ['Geeft je ruimte direct karakter', 'Vuil en gebruikssporen vallen nauwelijks op door de lavasteentjes'],
    tegen: ['Een uitgesproken tekening waar je van moet houden', 'Vraagt het meeste aandacht bij het schoonmaken'],
    tekening: 3, schoon: 2, prijsNiveau: '€€', prijs: null, kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.75,
  },
  {
    id: 'concrete', naam: 'Bio Concrete', kort: 'De drukste tekening, met de echte uitstraling van beton of natuursteen.',
    voor: ['Volledig met diamant geslepen, daardoor extreem glad', 'Het makkelijkst schoon te houden van de vier',
      'Oogt als echt beton of natuursteen', 'De enige van de vier die ook op de wanden kan'],
    tegen: ['Een stap duurder door het extra slijpwerk en de extra arbeid', 'De drukste tekening: je moet ervan houden'],
    tekening: 4, schoon: 5, prijsNiveau: '€€€', prijs: null, kleuren: 10, wand: true,
    vloerverwarming: VVW, wolk: 0.95,
  },
]
export const typeOp = (id: string | null | undefined) => TYPES.find(t => t.id === id) ?? null

/** Wat voor alle vier geldt (keuzehulp Dr. Schutz). */
export const VOOR_ALLE = [
  'Shore D80: zeer krasvast en slijtvast',
  '100% waterdicht, ook voor badkamer, keuken en bijkeuken',
  'UV-stabiel: vergeelt niet, ook voor een grote raampartij',
  'EMICODE EC1 PLUS-gecertificeerd: de vloer geeft vrijwel geen emissies af, en is hypoallergeen',
  'Uitstekend geschikt voor vloerverwarming',
  'Naadloos en met de hand gelegd: geen twee vloeren zijn hetzelfde',
]

// Kamers die bij een nieuwe keuze standaard uit staan.
// De badkamer en de wasruimte staan sinds 23-10-2026 aan: alle vier Bio-systemen zijn waterdicht.
export const NIET_GIET = /^(toilet|meterkast|trap|berging|technische)/i

/* ---------------------------------------------------------------- analyse en keuze */

export type Analyse = {
  vloer: boolean
  hex: string
  kleurnaam: string
  toon: 'warm' | 'neutraal' | 'koel'
  helderheid: 'licht' | 'midden' | 'donker'
  glans: 'mat' | 'zijdeglans' | 'glans'
  uitstraling: 'strak' | 'licht gewolkt' | 'gewolkt'
  type: TypeId
  zekerheid: 'hoog' | 'middel' | 'laag'
  licht: string
  omschrijving: string
}

export type GekozenRuimte = { sleutel: string; verdieping: string; naam: string; m2: number }
export type Keuze = {
  kleur?: string
  type?: TypeId
  vloerverwarming?: 'ja' | 'nee' | 'weet-niet'
  ruimtes?: GekozenRuimte[]
  bron?: 'tekening' | 'handmatig'
}

export const m2Van = (k: Keuze) => Math.round((k.ruimtes ?? []).reduce((t, r) => t + (r.m2 || 0), 0) * 10) / 10

/** Keuze uit een verzoek: alles controleren, niets overnemen wat niet past. */
export function leesKeuze(v: unknown): Keuze {
  const k = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  const uit: Keuze = {}
  if (typeof k.kleur === 'string' && kleurOp(k.kleur)) uit.kleur = k.kleur
  if (typeof k.type === 'string' && typeOp(k.type)) uit.type = k.type as TypeId
  if (k.vloerverwarming === 'ja' || k.vloerverwarming === 'nee' || k.vloerverwarming === 'weet-niet') uit.vloerverwarming = k.vloerverwarming
  if (k.bron === 'tekening' || k.bron === 'handmatig') uit.bron = k.bron
  if (Array.isArray(k.ruimtes)) {
    uit.ruimtes = k.ruimtes.slice(0, 60).flatMap(r => {
      const x = (r && typeof r === 'object' ? r : {}) as Record<string, unknown>
      const m2 = Number(x.m2)
      const naam = typeof x.naam === 'string' ? x.naam.trim().slice(0, 60) : ''
      if (!naam || !Number.isFinite(m2) || m2 <= 0 || m2 > 500) return []
      return [{
        sleutel: typeof x.sleutel === 'string' ? x.sleutel.slice(0, 40) : naam,
        verdieping: typeof x.verdieping === 'string' ? x.verdieping.trim().slice(0, 40) : '',
        naam, m2: Math.round(m2 * 10) / 10,
      }]
    })
  }
  return uit
}

/** De regels die de verwerker en de admin te zien krijgen. */
export function specificatie(s: { keuze: Keuze | null; analyse: Analyse | null }): string[] {
  const k = s.keuze ?? {}, kleur = kleurOp(k.kleur), type = typeOp(k.type), a = s.analyse
  const perVerdieping = new Map<string, string[]>()
  ;(k.ruimtes ?? []).forEach(r => {
    const v = r.verdieping || 'Woning'
    perVerdieping.set(v, [...(perVerdieping.get(v) ?? []), `${r.naam} ${r.m2.toLocaleString('nl-NL')} m²`])
  })
  return [
    `${type?.naam ?? 'Gietvloer, type nog niet gekozen'}: ongeveer ${m2Van(k).toLocaleString('nl-NL')} m²`,
    `Kleur: ${kleur ? `${kleur.naam} (${kleur.hex}${kleur.code ? `, ${kleur.code}` : ''})` : 'nog niet gekozen'}${VOORLOPIG ? ' — voorlopige Bylder-kaart, kies de dichtstbijzijnde uit het eigen assortiment' : ''}`,
    ...(a ? [`Inspiratiefoto: ${a.kleurnaam}, ${a.toon}, ${a.glans}, ${a.uitstraling}`] : []),
    `Vloerverwarming: ${k.vloerverwarming === 'ja' ? 'ja' : k.vloerverwarming === 'nee' ? 'nee' : 'weet de koper nog niet'}`,
    ...[...perVerdieping].map(([v, rs]) => `${v}: ${rs.join(', ')}`),
    `Maten: ${k.bron === 'tekening' ? 'uit de technische tekening' : 'opgegeven door de koper'}, inmeten nodig`,
  ]
}

/* ---------------------------------------------------------------- kleur vergelijken */

function naarLab(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const r = lin(n >> 16), g = lin((n >> 8) & 255), b = lin(n & 255)
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

/** CIEDE2000: hoe ver twee kleuren uit elkaar liggen zoals het oog dat ziet (2 ≈ net zichtbaar). */
export function kleurAfstand(hex1: string, hex2: string): number {
  const [L1, a1, b1] = naarLab(hex1), [L2, a2, b2] = naarLab(hex2)
  const rad = Math.PI / 180
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
  const a1p = a1 * (1 + G), a2p = a2 * (1 + G)
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2)
  const h = (b: number, a: number) => { if (!a && !b) return 0; const v = Math.atan2(b, a) / rad; return v < 0 ? v + 360 : v }
  const h1p = h(b1, a1p), h2p = h(b2, a2p)
  const dL = L2 - L1, dC = C2p - C1p
  let dh = 0
  if (C1p * C2p) { dh = h2p - h1p; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360 }
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad)
  const Lm = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2
  let hm = h1p + h2p
  if (C1p * C2p) { if (Math.abs(h1p - h2p) > 180) hm += h1p + h2p < 360 ? 360 : -360; hm /= 2 }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad)
  const dTh = 30 * Math.exp(-(((hm - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2)
  const Sc = 1 + 0.045 * Cmp, Sh = 1 + 0.015 * Cmp * T
  const Rt = -Math.sin(2 * dTh * rad) * Rc
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
}

export type Match = { kleur: Kleur; afstand: number; oordeel: string }
const oordeel = (d: number) => (d < 3 ? 'Vrijwel gelijk' : d < 6 ? 'Dichtbij' : d < 12 ? 'Zelfde richting' : 'Verder weg')

/** De drie kleuren uit de kaart die het dichtst bij de vloer op de foto liggen. */
export function besteKleuren(hex: string, n = 3): Match[] {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return []
  return KLEUREN.map(k => ({ kleur: k, afstand: Math.round(kleurAfstand(hex, k.hex) * 10) / 10 }))
    .sort((a, b) => a.afstand - b.afstand).slice(0, n)
    .map(m => ({ ...m, oordeel: oordeel(m.afstand) }))
}

export const isLicht = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150
}

/** Indicatie per m² voor een gietvloer in een woning (incl. btw), voor Mijn woning: de Bylder-
 *  prijsbenchmark voor gietvloer, 25%–75%. Vervangen door de ranges per systeem zodra die er zijn. */
export const GIET_PRIJS_M2: [number, number] = [70, 130]
