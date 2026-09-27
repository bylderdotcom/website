// De goedkeur-demo en de kosten-per-gemeente uit de oude homepage, bijgewerkt
// zonder homeSections.ts aan te raken (dat bestand is gegenereerd).
//
// De demo ging over een zolder die slaapkamer wordt: dakkapel, eiken vloer,
// vloerverwarming. Dat is een verbouwscenario, terwijl de kop over de
// nieuwbouwkoper gaat. Nu: binnendeuren (met de keuze glad/groef die je op de
// woning ziet), gietvloer, en het meerwerk dat vóór de dekvloer moet. Bedragen
// die we niet kunnen staven staan er niet; kortingen komen uit de deelnemers.
import { readFileSync } from 'fs'
import path from 'path'

const V = (a: string, b: string) => [a, b] as const

export const DEMO_TEKST: ReadonlyArray<readonly [string, string]> = [
  V('Stel: je zolder wordt een slaapkamer. Dit heb ik alvast voor je uitgezocht &#8212; kies wat bij je past. Je ziet elke keuze terug op de woning bovenaan.',
    'Stel: je plattegrond is uitgelezen. Dit heb ik alvast voor je klaargezet &#8212; kies wat bij je past. Je ziet elke keuze terug op de woning bovenaan.'),
  // kaart 1
  V('<span class="chip">VAKBEDRIJF</span>', '<span class="chip">PRODUCT</span>'),
  V('<span class="price">vanaf &#8364;6.200</span>', '<span class="price">5% ledenkorting</span>'),
  V('<h3>Dakkapel plaatsen &#8212; 3 bedrijven vergeleken</h3>', '<h3>Binnendeuren: 12 stuks, kozijnloos</h3>'),
  V('<p>Bouwgroep Deltij bovenaan: 4,8&#9733;, 6 km, kan in september.</p>', '<p>Geteld uit je tekening. Plafondhoog, deur en wand in &#233;&#233;n kleur.</p>'),
  V('<div class="v-info"><b>Hout</b><span>warmer, traditioneler &#183; vanaf &#8364;6.200</span></div>', '<div class="v-info"><b>Glad</b><span>deur en wand &#233;&#233;n vlak &#183; elke RAL-kleur</span></div>'),
  V('<div class="v-info"><b>Kunststof</b><span>onderhoudsarm, sneller geplaatst &#183; vanaf &#8364;5.400</span></div>', '<div class="v-info"><b>Met groefpatroon</b><span>13 patronen &#183; elke RAL-kleur</span></div>'),
  // kaart 2
  V('<span class="price">&#8364;1.536 na korting</span>', '<span class="price">10% ledenkorting</span>'),
  V('<h3>Eiken vloer voor de woonkamer</h3>', '<h3>Gietvloer voor de begane grond</h3>'),
  V('<p>Past bij je stijl; 10% korting via je Bylder-voucher.</p>', '<p>78 m&#178; zonder naden, bij DRT Contemporary Flooring &#8212; aangesloten merk.</p>'),
]

// De woning: het schaduwvoorstel op het dak (dakkapel) wordt een deur in de
// gevelopening, en de spelden krijgen de nieuwe namen.
export const HUIS_TEKST: ReadonlyArray<readonly [string, string]> = [
  V(`<g class="g1v g1v-a">
          <path d="M212.5,183.1 L267.5,214.8 L267.5,177.8 L212.5,146.0 Z" />
          <path d="M212.5,146.0 L243.7,128.0" />
          <path d="M267.5,177.8 L298.6,159.8" />
          <path d="M243.7,128.0 L298.6,159.8" />
          <path d="M267.5,214.8 L298.6,159.8" />
          <path d="M226.3,181.7 L253.7,197.6 L253.7,179.1 L226.3,163.2 Z" />
          </g>`,
    `<g class="g1v g1v-a">
          <path d="M287.4,401.0 L320.6,420.2 L320.6,379.6 L287.4,360.4 Z" />
          <path d="M315.5,398.5 L315.5,401.5" />
          </g>`),
  V(`<g class="g1v g1v-b" style="display:none">
          <path d="M203.4,177.8 L276.6,220.1 L276.6,193.6 L203.4,151.3 Z" />
          <path d="M203.4,151.3 L225.7,138.5" />
          <path d="M276.6,193.6 L298.9,180.7" />
          <path d="M225.7,138.5 L298.9,180.7" />
          <path d="M276.6,220.1 L298.9,180.7" />
          <path d="M211.4,175.8 L268.6,208.8 L268.6,194.3 L211.4,161.2 Z" />
          </g>`,
    `<g class="g1v g1v-b" style="display:none">
          <path d="M287.4,401.0 L320.6,420.2 L320.6,379.6 L287.4,360.4 Z" />
          <path d="M287.4,372.5 L320.6,391.7" />
          <path d="M287.4,382.5 L320.6,401.7" />
          <path d="M287.4,392.5 L320.6,411.7" />
          </g>`),
  V('<g transform="translate(240.0,103.9)"><g class="pin pin-1">\n          <line class="leader" x1="0" y1="0" x2="0.0" y2="58.0" />',
    '<g transform="translate(304.0,296.0)"><g class="pin pin-1">\n          <line class="leader" x1="0" y1="0" x2="0.0" y2="62.0" />'),
  V('<text class="pin-label" y="-24">1 DAKKAPEL</text>', '<text class="pin-label" y="-24">1 BINNENDEUREN</text>'),
  V('<text class="pin-label" y="32">2 EIKEN VLOER</text>', '<text class="pin-label" y="32">2 GIETVLOER</text>'),
  V('<text class="pin-label" y="32">3 MEERWERK</text>', '<text class="pin-label" y="32">3 VLOERVERWARMING</text>'),
]

export function vervang(html: string, paren: ReadonlyArray<readonly [string, string]>): string {
  for (const [oud, nieuw] of paren) {
    if (!html.includes(oud)) throw new Error('demo.ts: tekst niet gevonden: ' + oud.slice(0, 60))
    html = html.replace(oud, nieuw)
  }
  return html
}

// "20 projecten · 288 gemeenten" stond hard in de tekst. De projectpagina's
// zijn <soort>/<gemeente>; het aantal soorten en gemeenten komt daaruit.
export function projectAantallen(): { soorten: number; gemeenten: number } {
  const p = path.join(process.cwd(), '..', 'data', 'clusters', 'project', 'pages.json')
  const pages: { slug: string }[] = JSON.parse(readFileSync(p, 'utf8'))
  const soorten = new Set<string>(), gemeenten = new Set<string>()
  for (const { slug } of pages) {
    const [s, g] = slug.split('/')
    if (s && g) { soorten.add(s); gemeenten.add(g) }
  }
  return { soorten: soorten.size, gemeenten: gemeenten.size }
}

export function kostenBlok(html: string): string {
  const { soorten, gemeenten } = projectAantallen()
  return html
    .replace(/\d+ projecten · \d+ gemeenten/, `${soorten} projecten · ${gemeenten} gemeenten`)
    .replace(/Alle \d+ projecten bekijken/, `Alle ${soorten} projecten bekijken`)
    .replace(/\+\d+(?=\s*<)/, `+${soorten - 5}`)
}
