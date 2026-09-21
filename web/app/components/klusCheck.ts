// Bedrading van de rekenhulp op de vak-clusters.
//
// Inline <script> voert niet uit via dangerouslySetInnerHTML, dus elk cluster
// had hier een eigen kopie van. Die kopieën deden allemaal hetzelfde en staan
// nu hier; per cluster blijven alleen de prijsbanden en de voetnoot over.
//
// Twee vormen op dezelfde velden:
// - hub- en stadspagina's houden wat ze hadden: kies werksoort, zie bandbreedte
//   (#kc-werk, #kc-m2, #kc-out).
// - bedrijfsprofielen hebben er sinds 21-09-2026 het bedrag uit de eigen
//   offerte bij (#kc-bedrag). Dan wordt de uitkomst een oordeel (#kc-oordeel)
//   en verschijnt pas daarna de vervolgstap (#kc-na). Zie web/lib/eerstezet.ts
//   voor waarom.

export type Band = { low: number; high: number }

export type KlusCheckOpts = {
  /** Prijsbanden per werksoort, in de volgorde van de <option>s. */
  W: Band[]
  /** Prijs per eenheid (m², meter) — dan telt #kc-m2 mee. Anders per klus. */
  perEenheid?: boolean
  /** Voetnoot achter de bandbreedte, bv. 'indicatief, per klus, excl. btw'. */
  noot: string
  /** Eenheid in de voetnoot bij perEenheid, bv. 'm²'. */
  eenheid?: string
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROOD = '#B85C38'

const fmt = (n: number) => n.toLocaleString('nl-NL')
const getal = (v: string) => parseFloat((v || '').replace(/[^0-9,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'))

function oordeelHtml(bedrag: number, b: Band): { html: string; knop: string } {
  const band = `&euro;${fmt(b.low)} &ndash; &euro;${fmt(b.high)}`
  const doos = (kleur: string, kop: string, uitleg: string) =>
    `<div style="border-left:4px solid ${kleur};background:${kleur}14;border-radius:0 10px 10px 0;`
    + `padding:12px 14px;"><div style="font-weight:800;font-size:15px;color:#1A1208;margin-bottom:3px;">`
    + `${kop}</div><div style="font-size:13.5px;color:${INKT}0.75);line-height:1.6;">${uitleg}</div></div>`

  if (bedrag < b.low) {
    const pct = Math.round(((b.low - bedrag) / b.low) * 100)
    return {
      html: doos(ROOD, `&euro;${fmt(bedrag)} ligt ${pct}% onder de marktprijs`,
        `De bandbreedte voor dit werk is ${band}. Een lage prijs is geen probleem, maar vraag wat er `
        + 'niet in zit: materiaal, voorrijkosten, afvoer en btw staan er vaak buiten.'),
      knop: 'Kijk wat er niet in de offerte staat',
    }
  }
  if (bedrag > b.high) {
    const pct = Math.round(((bedrag - b.high) / b.high) * 100)
    return {
      html: doos(ROOD, `&euro;${fmt(bedrag)} ligt ${pct}% boven de marktprijs`,
        `De bandbreedte voor dit werk is ${band}. Dat kan kloppen bij bijzonder werk, maar vraag om een `
        + 'offerte per post &mdash; dan zie je waar het verschil in zit.'),
      knop: 'Laat de offerte per post nakijken',
    }
  }
  return {
    html: doos(GROEN, `&euro;${fmt(bedrag)} valt binnen de marktprijs`,
      `De bandbreedte voor dit werk is ${band}. Het totaal klopt dus. Wat je dan nog wilt weten is of `
      + 'de posten eronder kloppen en of er niets ontbreekt.'),
    knop: 'Controleer de posten',
  }
}

/** Bedraadt de rekenhulp op de huidige pagina. Geeft een opruimfunctie terug. */
export function wireKlusCheck({ W, perEenheid = false, noot, eenheid = 'm²' }: KlusCheckOpts): () => void {
  const s = document.getElementById('kc-werk') as HTMLSelectElement | null
  const o = document.getElementById('kc-out')
  if (!s || !o) return () => {}
  const m = document.getElementById('kc-m2') as HTMLInputElement | null
  const bedragVeld = document.getElementById('kc-bedrag') as HTMLInputElement | null
  const oordeel = document.getElementById('kc-oordeel')
  const na = document.getElementById('kc-na')
  const knop = na?.querySelector('a')
  if (perEenheid && !m) return () => {}

  const calc = () => {
    const w = W[Number(s.value)]
    const a = m ? getal(m.value) : NaN
    if (!w || (perEenheid && !(a > 0))) {
      o.innerHTML = ''
      if (oordeel) oordeel.innerHTML = ''
      if (na) na.hidden = true
      return
    }
    const band: Band = perEenheid
      ? { low: Math.round(w.low * a), high: Math.round(w.high * a) }
      : w
    const staart = perEenheid ? `${w.low}–${w.high} €/${eenheid}, ${noot}` : noot
    o.innerHTML = `Marktprijs voor dit werk: <strong>€${fmt(band.low)} – €${fmt(band.high)}</strong>`
      + ` <span style="color:${INKT}0.55);font-size:13px;">(${staart})</span>`

    if (!bedragVeld || !oordeel) return
    const bedrag = getal(bedragVeld.value)
    if (!(bedrag > 0)) {
      oordeel.innerHTML = ''
      if (na) na.hidden = true
      return
    }
    const r = oordeelHtml(Math.round(bedrag), band)
    oordeel.innerHTML = r.html
    if (knop) knop.innerHTML = `${r.knop} &#8594;`
    if (na) na.hidden = false
  }

  const aan: Array<[HTMLElement, string]> = [[s, 'change']]
  if (m) aan.push([m, 'input'])
  if (bedragVeld) aan.push([bedragVeld, 'input'])
  aan.forEach(([el, ev]) => el.addEventListener(ev, calc))
  // Zonder bedrag en zonder hoeveelheid staat de bandbreedte er meteen, net als
  // voorheen; bij prijs-per-eenheid blijft hij leeg tot er een aantal in staat.
  calc()
  return () => aan.forEach(([el, ev]) => el.removeEventListener(ev, calc))
}
