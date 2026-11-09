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

export type Kleur = {
  id: string; naam: string; hex: string; code?: string
  /** Echte kleur uit het assortiment van één systeem, met foto (www.bylder.com/img/gietvloer/…). */
  type?: TypeId; foto?: string
}

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
  // Bio Fine: de 20 kleuren van Dr. Schutz (mail Lars 4-11-2026, foto's 'Bio Fine webversie').
  // De hexcode is het gemiddelde van het midden van de foto, alleen voor het vergelijken met een
  // inspiratiefoto. De voorlopige kaart hierboven blijft alleen als vangnet voor een systeem zonder eigen kleuren.
  { id: 'fine-balos', naam: 'Balos', hex: '#AB9985', type: 'fine', foto: '/img/gietvloer/bio-fine/balos.webp' },
  { id: 'fine-bassa', naam: 'Bassa', hex: '#A18D76', type: 'fine', foto: '/img/gietvloer/bio-fine/bassa.webp' },
  { id: 'fine-bildenberg', naam: 'Bildenberg', hex: '#A3998F', type: 'fine', foto: '/img/gietvloer/bio-fine/bildenberg.webp' },
  { id: 'fine-bolton', naam: 'Bolton', hex: '#A59E96', type: 'fine', foto: '/img/gietvloer/bio-fine/bolton.webp' },
  { id: 'fine-colmar', naam: 'Colmar', hex: '#A89E95', type: 'fine', foto: '/img/gietvloer/bio-fine/colmar.webp' },
  { id: 'fine-hikari', naam: 'Hikari', hex: '#B19F88', type: 'fine', foto: '/img/gietvloer/bio-fine/hikari.webp' },
  { id: 'fine-juvelen', naam: 'Juvelen', hex: '#A59586', type: 'fine', foto: '/img/gietvloer/bio-fine/juvelen.webp' },
  { id: 'fine-kiri', naam: 'Kiri', hex: '#AF9C8A', type: 'fine', foto: '/img/gietvloer/bio-fine/kiri.webp' },
  { id: 'fine-kuggen', naam: 'Kuggen', hex: '#BEADA5', type: 'fine', foto: '/img/gietvloer/bio-fine/kuggen.webp' },
  { id: 'fine-olivera', naam: 'Olivera', hex: '#A49787', type: 'fine', foto: '/img/gietvloer/bio-fine/olivera.webp' },
  { id: 'fine-orla', naam: 'Orla', hex: '#AA9989', type: 'fine', foto: '/img/gietvloer/bio-fine/orla.webp' },
  { id: 'fine-osaka', naam: 'Osaka', hex: '#B6A289', type: 'fine', foto: '/img/gietvloer/bio-fine/osaka.webp' },
  { id: 'fine-oxford', naam: 'Oxford', hex: '#9C8A77', type: 'fine', foto: '/img/gietvloer/bio-fine/oxford.webp' },
  { id: 'fine-pada', naam: 'Pada', hex: '#968A81', type: 'fine', foto: '/img/gietvloer/bio-fine/pada.webp' },
  { id: 'fine-palmleaf', naam: 'Palmleaf', hex: '#AE9179', type: 'fine', foto: '/img/gietvloer/bio-fine/palmleaf.webp' },
  { id: 'fine-pisa', naam: 'Pisa', hex: '#B0A69C', type: 'fine', foto: '/img/gietvloer/bio-fine/pisa.webp' },
  { id: 'fine-preston', naam: 'Preston', hex: '#A79587', type: 'fine', foto: '/img/gietvloer/bio-fine/preston.webp' },
  { id: 'fine-serra', naam: 'Serra', hex: '#B6A899', type: 'fine', foto: '/img/gietvloer/bio-fine/serra.webp' },
  { id: 'fine-shard', naam: 'Shard', hex: '#9E9185', type: 'fine', foto: '/img/gietvloer/bio-fine/shard.webp' },
  { id: 'fine-stockholm', naam: 'Stockholm', hex: '#A19889', type: 'fine', foto: '/img/gietvloer/bio-fine/stockholm.webp' },
  // Bio Cement, Bio Lava en Bio Concrete: foto's 'webversie' van Dr. Schutz (9-11-2026), zelfde werkwijze.
  // Bio Cement
  { id: 'cement-balos', naam: 'Balos', hex: '#8F8170', type: 'cement', foto: '/img/gietvloer/bio-cement/balos.webp' },
  { id: 'cement-bassa', naam: 'Bassa', hex: '#8E7C67', type: 'cement', foto: '/img/gietvloer/bio-cement/bassa.webp' },
  { id: 'cement-bildenberg', naam: 'Bildenberg', hex: '#97928B', type: 'cement', foto: '/img/gietvloer/bio-cement/bildenberg.webp' },
  { id: 'cement-bolton', naam: 'Bolton', hex: '#9F9A91', type: 'cement', foto: '/img/gietvloer/bio-cement/bolton.webp' },
  { id: 'cement-colmar', naam: 'Colmar', hex: '#98928C', type: 'cement', foto: '/img/gietvloer/bio-cement/colmar.webp' },
  { id: 'cement-hikari', naam: 'Hikari', hex: '#9B8B78', type: 'cement', foto: '/img/gietvloer/bio-cement/hikari.webp' },
  { id: 'cement-juvelen', naam: 'Juvelen', hex: '#908479', type: 'cement', foto: '/img/gietvloer/bio-cement/juvelen.webp' },
  { id: 'cement-kiri', naam: 'Kiri', hex: '#A89787', type: 'cement', foto: '/img/gietvloer/bio-cement/kiri.webp' },
  { id: 'cement-kuggen', naam: 'Kuggen', hex: '#A1948C', type: 'cement', foto: '/img/gietvloer/bio-cement/kuggen.webp' },
  { id: 'cement-olivera', naam: 'Olivera', hex: '#958B80', type: 'cement', foto: '/img/gietvloer/bio-cement/olivera.webp' },
  { id: 'cement-orla', naam: 'Orla', hex: '#A09385', type: 'cement', foto: '/img/gietvloer/bio-cement/orla.webp' },
  { id: 'cement-osaka', naam: 'Osaka', hex: '#A3937D', type: 'cement', foto: '/img/gietvloer/bio-cement/osaka.webp' },
  { id: 'cement-oxford', naam: 'Oxford', hex: '#938372', type: 'cement', foto: '/img/gietvloer/bio-cement/oxford.webp' },
  { id: 'cement-pada', naam: 'Pada', hex: '#7E7771', type: 'cement', foto: '/img/gietvloer/bio-cement/pada.webp' },
  { id: 'cement-palmleaf', naam: 'Palmleaf', hex: '#88705C', type: 'cement', foto: '/img/gietvloer/bio-cement/palmleaf.webp' },
  { id: 'cement-pisa', naam: 'Pisa', hex: '#989088', type: 'cement', foto: '/img/gietvloer/bio-cement/pisa.webp' },
  { id: 'cement-preston', naam: 'Preston', hex: '#A0948B', type: 'cement', foto: '/img/gietvloer/bio-cement/preston.webp' },
  { id: 'cement-serra', naam: 'Serra', hex: '#A59E92', type: 'cement', foto: '/img/gietvloer/bio-cement/serra.webp' },
  { id: 'cement-shard', naam: 'Shard', hex: '#9A9187', type: 'cement', foto: '/img/gietvloer/bio-cement/shard.webp' },
  { id: 'cement-stockholm', naam: 'Stockholm', hex: '#918D83', type: 'cement', foto: '/img/gietvloer/bio-cement/stockholm.webp' },
  // Bio Lava
  { id: 'lava-balos', naam: 'Balos', hex: '#948473', type: 'lava', foto: '/img/gietvloer/bio-lava/balos.webp' },
  { id: 'lava-bassa', naam: 'Bassa', hex: '#9C8A74', type: 'lava', foto: '/img/gietvloer/bio-lava/bassa.webp' },
  { id: 'lava-bildenberg', naam: 'Bildenberg', hex: '#A1988E', type: 'lava', foto: '/img/gietvloer/bio-lava/bildenberg.webp' },
  { id: 'lava-bolton', naam: 'Bolton', hex: '#99938A', type: 'lava', foto: '/img/gietvloer/bio-lava/bolton.webp' },
  { id: 'lava-colmar', naam: 'Colmar', hex: '#A49D95', type: 'lava', foto: '/img/gietvloer/bio-lava/colmar.webp' },
  { id: 'lava-hikari', naam: 'Hikari', hex: '#A79782', type: 'lava', foto: '/img/gietvloer/bio-lava/hikari.webp' },
  { id: 'lava-juvelen', naam: 'Juvelen', hex: '#9B8E82', type: 'lava', foto: '/img/gietvloer/bio-lava/juvelen.webp' },
  { id: 'lava-kiri', naam: 'Kiri', hex: '#9C8A78', type: 'lava', foto: '/img/gietvloer/bio-lava/kiri.webp' },
  { id: 'lava-kuggen', naam: 'Kuggen', hex: '#ADA098', type: 'lava', foto: '/img/gietvloer/bio-lava/kuggen.webp' },
  { id: 'lava-olivera', naam: 'Olivera', hex: '#9B9182', type: 'lava', foto: '/img/gietvloer/bio-lava/olivera.webp' },
  { id: 'lava-orla', naam: 'Orla', hex: '#A19484', type: 'lava', foto: '/img/gietvloer/bio-lava/orla.webp' },
  { id: 'lava-osaka', naam: 'Osaka', hex: '#B09B7E', type: 'lava', foto: '/img/gietvloer/bio-lava/osaka.webp' },
  { id: 'lava-oxford', naam: 'Oxford', hex: '#958776', type: 'lava', foto: '/img/gietvloer/bio-lava/oxford.webp' },
  { id: 'lava-pada', naam: 'Pada', hex: '#948A83', type: 'lava', foto: '/img/gietvloer/bio-lava/pada.webp' },
  { id: 'lava-palmleaf', naam: 'Palmleaf', hex: '#9A806B', type: 'lava', foto: '/img/gietvloer/bio-lava/palmleaf.webp' },
  { id: 'lava-pisa', naam: 'Pisa', hex: '#9B928A', type: 'lava', foto: '/img/gietvloer/bio-lava/pisa.webp' },
  { id: 'lava-preston', naam: 'Preston', hex: '#9E9187', type: 'lava', foto: '/img/gietvloer/bio-lava/preston.webp' },
  { id: 'lava-serra', naam: 'Serra', hex: '#9A9082', type: 'lava', foto: '/img/gietvloer/bio-lava/serra.webp' },
  { id: 'lava-shard', naam: 'Shard', hex: '#958B80', type: 'lava', foto: '/img/gietvloer/bio-lava/shard.webp' },
  { id: 'lava-stockholm', naam: 'Stockholm', hex: '#999386', type: 'lava', foto: '/img/gietvloer/bio-lava/stockholm.webp' },
  // Bio Concrete
  { id: 'concrete-bassa', naam: 'Bassa', hex: '#887B6B', type: 'concrete', foto: '/img/gietvloer/bio-concrete/bassa.webp' },
  { id: 'concrete-bildenberg', naam: 'Bildenberg', hex: '#96918C', type: 'concrete', foto: '/img/gietvloer/bio-concrete/bildenberg.webp' },
  { id: 'concrete-hikari', naam: 'Hikari', hex: '#9F8F7C', type: 'concrete', foto: '/img/gietvloer/bio-concrete/hikari.webp' },
  { id: 'concrete-juvelen', naam: 'Juvelen', hex: '#877D75', type: 'concrete', foto: '/img/gietvloer/bio-concrete/juvelen.webp' },
  { id: 'concrete-olivera', naam: 'Olivera', hex: '#8C8479', type: 'concrete', foto: '/img/gietvloer/bio-concrete/olivera.webp' },
  { id: 'concrete-orla', naam: 'Orla', hex: '#9E938A', type: 'concrete', foto: '/img/gietvloer/bio-concrete/orla.webp' },
  { id: 'concrete-osaka', naam: 'Osaka', hex: '#9F8E78', type: 'concrete', foto: '/img/gietvloer/bio-concrete/osaka.webp' },
  { id: 'concrete-oxford', naam: 'Oxford', hex: '#948879', type: 'concrete', foto: '/img/gietvloer/bio-concrete/oxford.webp' },
  { id: 'concrete-serra', naam: 'Serra', hex: '#9B9388', type: 'concrete', foto: '/img/gietvloer/bio-concrete/serra.webp' },
  { id: 'concrete-shard', naam: 'Shard', hex: '#918A83', type: 'concrete', foto: '/img/gietvloer/bio-concrete/shard.webp' },
  { id: 'concrete-stockholm', naam: 'Stockholm', hex: '#87837B', type: 'concrete', foto: '/img/gietvloer/bio-concrete/stockholm.webp' },
]
export const kleurOp = (id: string | null | undefined) => KLEUREN.find(k => k.id === id) ?? null

export type TypeId = 'fine' | 'cement' | 'lava' | 'concrete'
export type VloerType = {
  id: TypeId; naam: string; kort: string; voor: string[]; tegen: string[]
  /** Hoe druk de tekening is (1 rustig – 4 druk) en hoe makkelijk schoon te houden (1–5), uit de keuzehulp. */
  tekening: number; schoon: number
  prijsNiveau: '€€' | '€€€'
  /** Indicatie per m² incl. btw (Dr. Schutz, afgestemd met de verwerkers, mail Lars 4-11-2026). */
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
// lavasteenvloer met een zeer fijne korrel. Prijzen (mail Lars 4-11-2026): Fine, Cement en Lava
// € 80–130 per m², Concrete € 100–150, minimaal 35 m². Kleuren met foto van alle vier (Concrete: 11 foto's).
const VVW = 'Uitstekend geschikt voor vloerverwarming: de vloer ligt zonder lucht op de ondergrond, dus de warmte komt er ongehinderd door.'
export const TYPES: VloerType[] = [
  {
    id: 'fine', naam: 'Bio Fine', kort: 'De rustigste: een heel egale lavasteenvloer met een zeer fijne korrel.',
    voor: ['Rustig en ruimtelijk, past bij elk interieur', 'Zeer fijne korrel, eenvoudig te onderhouden', 'Laat meubels en kunst de aandacht houden'],
    tegen: ['Op een rustig vlak zie je kruimels en gebruikssporen sneller'],
    tekening: 1, schoon: 4, prijsNiveau: '€€', prijs: [80, 130], kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.15,
  },
  {
    id: 'cement', naam: 'Bio Cement', kort: 'Een subtiele wolkentekening met de sfeer van gepolijst cement.',
    voor: ['Industriële uitstraling zonder dat het onrustig wordt', 'Meer levendigheid dan Bio Fine', 'Gebruikssporen vallen minder op'],
    tegen: ['Iets meer aandacht bij het schoonmaken dan Bio Fine'],
    tekening: 2, schoon: 3, prijsNiveau: '€€', prijs: [80, 130], kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.5,
  },
  {
    id: 'lava', naam: 'Bio Lava', kort: 'Levendig en vol karakter, met duidelijke wolken en echte lavasteentjes.',
    voor: ['Geeft je ruimte direct karakter', 'Vuil en gebruikssporen vallen nauwelijks op door de lavasteentjes'],
    tegen: ['Een uitgesproken tekening waar je van moet houden', 'Vraagt het meeste aandacht bij het schoonmaken'],
    tekening: 3, schoon: 2, prijsNiveau: '€€', prijs: [80, 130], kleuren: 20, wand: false,
    vloerverwarming: VVW, wolk: 0.75,
  },
  {
    id: 'concrete', naam: 'Bio Concrete', kort: 'De drukste tekening, met de echte uitstraling van beton of natuursteen.',
    voor: ['Volledig met diamant geslepen, daardoor extreem glad', 'Het makkelijkst schoon te houden van de vier',
      'Oogt als echt beton of natuursteen', 'De enige van de vier die ook op de wanden kan'],
    tegen: ['Een stap duurder door het extra slijpwerk en de extra arbeid', 'De drukste tekening: je moet ervan houden'],
    tekening: 4, schoon: 5, prijsNiveau: '€€€', prijs: [100, 150], kleuren: 11, wand: true,
    vloerverwarming: VVW, wolk: 0.95,
  },
]
export const typeOp = (id: string | null | undefined) => TYPES.find(t => t.id === id) ?? null

/** Minimale oppervlakte voor een gietvloer (Dr. Schutz). Een kleinere vloer wordt als 35 m² gerekend. */
export const MIN_M2 = 35

/** De kleuren die bij een systeem horen: eigen kleuren met foto, anders de voorlopige kaart. */
export function kleurenVoor(type: TypeId | null | undefined): Kleur[] {
  const eigen = KLEUREN.filter(k => k.type === (type ?? 'fine'))
  return eigen.length ? eigen : KLEUREN.filter(k => !k.type)
}

/** Wisselt de koper van systeem: dezelfde kleurnaam in het nieuwe systeem, anders de dichtstbijzijnde. */
export function kleurInType(kleurId: string | null | undefined, type: TypeId): string | undefined {
  const k = kleurOp(kleurId)
  if (!k) return undefined
  if (k.type === type || (!k.type && !KLEUREN.some(x => x.type === type))) return k.id
  const zelfde = KLEUREN.find(x => x.type === type && x.naam === k.naam)
  return zelfde?.id ?? besteKleuren(k.hex, 1, type)[0]?.kleur.id
}

/** Tekst bij de kleuren en afbeeldingen, op verzoek van Dr. Schutz (mail Lars 4-11-2026). */
export const KLEUR_VOORBEHOUD = 'De getoonde kleuren en afbeeldingen zijn uitsluitend ter indicatie. Door verschillen in beeldscherminstellingen kan de weergave afwijken van de werkelijke kleur en structuur van de vloer. Aan de afbeeldingen kunnen geen rechten worden ontleend. Bekijk alle kleuren bij een verwerker in de buurt, of vraag alvast drie kleurstalen aan van je favoriete kleuren.'

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
export function besteKleuren(hex: string, n = 3, type?: TypeId | null): Match[] {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return []
  // Binnen het gekozen systeem; zonder systeem over alle echte kleuren (met foto).
  const echt = KLEUREN.filter(k => k.type)
  const lijst = type ? kleurenVoor(type) : echt.length ? echt : KLEUREN
  return lijst.map(k => ({ kleur: k, afstand: Math.round(kleurAfstand(hex, k.hex) * 10) / 10 }))
    .sort((a, b) => a.afstand - b.afstand).slice(0, n)
    .map(m => ({ ...m, oordeel: oordeel(m.afstand) }))
}

export const isLicht = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150
}

/** Indicatie per m² voor een gietvloer in een woning (incl. btw), voor Mijn woning: de ranges van
 *  Dr. Schutz over alle vier de systemen (mail Lars 4-11-2026). */
export const GIET_PRIJS_M2: [number, number] = [80, 150]
