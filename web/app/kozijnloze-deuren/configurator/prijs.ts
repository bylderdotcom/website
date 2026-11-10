// Prijsindicatie per deur in de configurator (besluit Daniel, 10-11-2026; Classic Next akkoord).
//
// BRON: prijslijst 2026 en de lijst 'Prijs per onderdeel' van Classic Next, met de antwoorden van
// Thijs van 10-11-2026. Adviesprijzen voor consumenten, inclusief btw, EXCLUSIEF MONTAGE.
//  - Kozijn AGS TST50: het complete pakket uit de prijslijst, met bovendorpel, 3 scharnieren DX-38 en een
//    Mertech-magneetslot (€ 650 / € 695 ex btw). Slottype en -kleur zitten in het pakket.
//  - Deurblad 50 mm, tot 930 mm breed: tot 2315 mm hoog of tot 2700 mm hoog, gegrond of afgelakt
//    (afgelakt tot 2700 = € 685 ex btw; de € 658 in de lijst was een tikfout).
//  - Freeswerk: € 90 ex btw per deur (prijslijst: "meerprijs freeslijn ontwerp per deur").
//  - Deuren hoger dan 2315 mm krijgen een vierde scharnier; dat rekenen we erbij (€ 41,50 ex btw).
//  - Krukken per model en kleur. Oval 1750 zwart = € 32,23 ex btw (tikfout in de lijst hersteld).
//    Molinia staat niet in de lijst: geen bedrag, komt in de offerte.
//  - Houtdecor (HPL) is op offertebasis: geen bedrag.
// Verandert een prijs, dan alleen hier. De indicatie gaat mee in de offerteaanvraag.

export type Hoogte = 'plafond' | 'standaard'
export const HOOGTES: { id: Hoogte; naam: string; uitleg: string }[] = [
  { id: 'plafond', naam: 'Plafondhoog', uitleg: 'Tot 270 cm. De deur loopt door tot het plafond, zoals in het beeld.' },
  { id: 'standaard', naam: 'Standaardhoogte', uitleg: 'Tot 231,5 cm, de gangbare deurhoogte. Het beeld toont de plafondhoge uitvoering.' },
]

const btw = (ex: number) => Math.round(ex * 121) / 100
const KOZIJN: Record<Hoogte, number> = { standaard: btw(650), plafond: btw(695) }
const BLAD: Record<Hoogte, { gegrond: number; gelakt: number }> = {
  standaard: { gegrond: btw(390), gelakt: btw(479) },
  plafond: { gegrond: btw(490), gelakt: btw(685) },
}
const FREESWERK = btw(90)
const SCHARNIER = btw(41.5)

/** Kruk per model; een bedrag per kleur waar de lijst dat onderscheidt. */
const KRUK: Record<string, number | Record<string, number>> = {
  carlina: 108, fragola: 47, guava: 178, lima: 33, 'oma-q-slim': 34, sorella: 183,
  'oval-1741': { Basalt: 69, 'Goud mat': 85, Koper: 69, Zwart: 64 },
  'oval-1743': { Basalt: 78, 'Goud mat': 94, Koper: 78, Zwart: 71 },
  'oval-1750': { RVS: 29.9, Zwart: 39, Goud: 47, Wit: 41 },
  viola: { 'Chroom gepolijst': 72, 'Chroom geborsteld': 73, Grafiet: 72, Nikkel: 79 },
}

export function krukPrijs(model: string, afwerking: string): number | null {
  const k = KRUK[model]
  if (k == null) return null
  return typeof k === 'number' ? k : k[afwerking] ?? null
}

export type DeurVoorPrijs = { hoogte: Hoogte; afwerking: 'gegrond' | 'gelakt' | 'fineer'; freeswerk: boolean; kruk: string; krukAfwerking: string }
export type Prijs = {
  /** Som van wat bekend is; null als het deurblad geen prijs heeft (houtdecor). */
  totaal: number | null
  regels: { naam: string; bedrag: number | null }[]
  /** De kruk heeft geen prijs in de lijst en zit dus niet in het totaal. */
  zonderKruk: boolean
}

export function deurPrijs(d: DeurVoorPrijs): Prijs {
  const hoog = d.hoogte === 'plafond'
  const blad = d.afwerking === 'fineer' ? null : BLAD[d.hoogte][d.afwerking]
  const kruk = krukPrijs(d.kruk, d.krukAfwerking)
  const regels: Prijs['regels'] = [
    { naam: `Kozijn ${hoog ? 'tot 270 cm' : 'tot 240 cm'}, met ${hoog ? '4' : '3'} scharnieren en magneetslot`, bedrag: KOZIJN[d.hoogte] + (hoog ? SCHARNIER : 0) },
    { naam: `Deurblad ${hoog ? 'tot 270 cm' : 'tot 231,5 cm'}, ${d.afwerking === 'gegrond' ? 'gegrond' : d.afwerking === 'gelakt' ? 'afgelakt' : 'houtdecor'}`, bedrag: blad },
    ...(d.freeswerk ? [{ naam: 'Freeswerk', bedrag: FREESWERK }] : []),
    { naam: 'Deurkruk', bedrag: kruk },
  ]
  const totaal = blad == null ? null : regels.reduce((t, r) => t + (r.bedrag ?? 0), 0)
  return { totaal, regels, zonderKruk: kruk == null }
}

/** Laagste prijs voor een complete deur zonder kruk: standaardhoogte, gegrond, zonder freeswerk. */
export const VANAF = KOZIJN.standaard + BLAD.standaard.gegrond

export const euro = (n: number) => '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const euroRond = (n: number) => '€ ' + Math.round(n).toLocaleString('nl-NL')
