/**
 * De Bylder-winkel (besluit Daniel, 31-10-2026): producten die Bylder zelf verkoopt. Bylder is de
 * verkoper; de leverancier levert rechtstreeks. Eerste producten, van Dutch Doors Company (Classic
 * Next): de onzichtbare plint van AGS-systems en het verdekte scharnier Basys DX-38 Design.
 *
 * PRIJZEN: alleen wat met de leverancier is afgesproken als verkoopprijs. Staat `prijs` op null, dan
 * toont de site geen bedrag en bevestigen we de prijs bij de bestelling (je betaalt pas daarna).
 * De prijslijst die we kregen is die voor vakbedrijven; de consumentenprijs moet nog vastgesteld
 * worden. De deurprijzen uit diezelfde lijst zijn alleen voor intern gebruik en staan hier niet.
 */

export type Variant = { id: string; naam: string; artikel?: string }

export const PLINT = {
  slug: 'onzichtbare-plint',
  naam: 'Onzichtbare plint',
  merk: 'AGS-systems',
  kort: 'Aluminium inbouwprofiel dat vóór het stucwerk op de ruwe wand komt. De plint valt erin, vlak met de wand.',
  /** Profiellengte; verkocht per profiel, niet per losse meter. */
  lengteMm: 2000,
  diepteMm: 15,
  maxMateriaalMm: 9,
  modellen: [
    { id: 'light-46', naam: 'Light 46', hoogteMm: 46 },
    { id: 'light-60', naam: 'Light 60', hoogteMm: 60 },
  ],
  /** Artikelnummers per model en wandtype (brochure AGS-systems 2025). */
  artikelen: {
    'light-46': { steen: '10046', droogbouw: '10045', binnenhoek: '11046', buitenhoek: '12046' },
    'light-60': { steen: '10061', droogbouw: '10060', binnenhoek: '11060', buitenhoek: '12060' },
  } as Record<string, { steen: string; droogbouw: string; binnenhoek: string; buitenhoek: string }>,
  koppelstuk: '13000',
  /** Verkoopprijs per profiel van 2 m, incl. btw. Nog niet vastgesteld. */
  prijs: null as number | null,
  /** Zaagverlies bovenop de gemeten meters. */
  verlies: 0.07,
}

export const SCHARNIER = {
  slug: 'verdekt-scharnier-dx-38',
  naam: 'Verdekt scharnier DX-38 Design',
  merk: 'Basys',
  kort: 'Verborgen scharnier voor kozijnloze en strakke binnendeuren. Draagt tot 80 kg per set, in drie richtingen verstelbaar.',
  draagvermogenKg: 80,
  perDeur: 3,
  kleuren: [
    { id: 'vernikkeld', naam: 'Velours vernikkeld (RVS-look)' },
    { id: 'zwart', naam: 'Zwart mat' },
  ] as Variant[],
  /** Verkoopprijs per scharnier en per set afdekplaatjes, incl. btw. Nog niet vastgesteld. */
  prijs: null as number | null,
  prijsAfdekplaatjes: null as number | null,
}

export const euro = (n: number) => '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ---------------------------------------------------------------- plinten uit een plattegrond */

type Rechthoek = [number, number, number, number]

/**
 * Wandlengte en hoeken van één ruimte, uit de vloerstroken die de tekeninglezer geeft (mm). De
 * stroken vormen samen precies de vloer; de rand van die vlakken is de wand waar de plint langs loopt.
 * Binnenhoek = een hoek die de ruimte in kijkt (4 bij een rechthoekige kamer), buitenhoek = een
 * hoek die uitsteekt (bij een L-vormige kamer).
 */
export function wandVanRuimte(stroken: Rechthoek[]): { mm: number; binnen: number; buiten: number; voegen: number } {
  if (!stroken.length) return { mm: 0, binnen: 0, buiten: 0, voegen: 0 }
  const xs = [...new Set(stroken.flatMap(s => [s[0], s[2]]))].sort((a, b) => a - b)
  const ys = [...new Set(stroken.flatMap(s => [s[1], s[3]]))].sort((a, b) => a - b)
  const binnenIn = (i: number, j: number) => {
    if (i < 0 || j < 0 || i >= xs.length - 1 || j >= ys.length - 1) return false
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2
    return stroken.some(s => cx > s[0] && cx < s[2] && cy > s[1] && cy < s[3])
  }
  let mm = 0
  // Randstukken per rechte lijn, om daarna aaneengesloten stukken samen te voegen tot hele wanden.
  const lijnen: Record<string, [number, number][]> = {}
  const rand = (k: string, a: number, b: number) => { (lijnen[k] ??= []).push([a, b]) }
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    if (!binnenIn(i, j)) continue
    const w = xs[i + 1] - xs[i], h = ys[j + 1] - ys[j]
    if (!binnenIn(i - 1, j)) { mm += h; rand(`L${xs[i]}`, ys[j], ys[j + 1]) }
    if (!binnenIn(i + 1, j)) { mm += h; rand(`R${xs[i + 1]}`, ys[j], ys[j + 1]) }
    if (!binnenIn(i, j - 1)) { mm += w; rand(`T${ys[j]}`, xs[i], xs[i + 1]) }
    if (!binnenIn(i, j + 1)) { mm += w; rand(`B${ys[j + 1]}`, xs[i], xs[i + 1]) }
  }
  // Een wand langer dan één profiel (2 m) heeft koppelstukken nodig waar de profielen aansluiten.
  let voegen = 0
  Object.values(lijnen).forEach(st => {
    st.sort((a, b) => a[0] - b[0])
    let [a, b] = st[0]
    const sluit = () => { voegen += Math.max(0, Math.ceil((b - a) / PLINT.lengteMm) - 1) }
    st.slice(1).forEach(([c, d]) => { if (c <= b) b = Math.max(b, d); else { sluit(); a = c; b = d } })
    sluit()
  })
  let binnen = 0, buiten = 0
  for (let i = 0; i < xs.length; i++) for (let j = 0; j < ys.length; j++) {
    const c = [binnenIn(i - 1, j - 1), binnenIn(i, j - 1), binnenIn(i - 1, j), binnenIn(i, j)]
    const n = c.filter(Boolean).length
    if (n === 1) binnen++
    else if (n === 3) buiten++
    else if (n === 2 && c[0] === c[3]) binnen += 2 // twee vlakken die elkaar alleen in een punt raken
  }
  return { mm, binnen, buiten, voegen }
}

/** Wat je bestelt voor een aantal meter wand, hoeken en koppelstukken. Zonder plattegrond schatten
 *  we de koppelstukken: gemiddeld één per twee profielen in een woning met wanden van 3 tot 5 m. */
export function plintPakket(meter: number, binnen: number, buiten: number, voegen: number | null) {
  const profielen = Math.max(0, Math.ceil((meter * (1 + PLINT.verlies)) / (PLINT.lengteMm / 1000)))
  const koppelstukken = voegen ?? Math.round(profielen / 2)
  return { profielen, binnenhoeken: binnen, buitenhoeken: buiten, koppelstukken }
}
