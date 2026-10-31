/**
 * Bylder als hoofdaannemer voor de afwerking van een nieuwbouwwoning (besluit Daniel, 28-10-2026).
 *
 * Eén offerte, één contract, één planning en één aanspreekpunt. Het werk doen vakbedrijven uit
 * het netwerk als onderaannemer; Bylder heeft geen eigen ploegen. Landelijk; de marketing zet in op de regio Den Bosch (niet op de site noemen, besluit Daniel 29-10-2026).
 *
 * Deze file is de bron voor /nieuwbouw-afwerken/ en /nieuwbouw-afwerken/<onderdeel>/. De
 * bedragen komen uit de Bylder-prijsbenchmark (app: src/lib/priceBenchmarks.ts, p25–p75,
 * indicatief, 2026). Wijzigt de benchmark, pas dan hier mee aan. Zonder benchmark (deuren,
 * kasten) noemen we geen bedrag maar verwijzen we naar de configurator.
 */

export const REGIO = {
  naam: 'regio Den Bosch',
  gemeenten: ["'s-Hertogenbosch", 'Rosmalen', 'Vught', 'Sint-Michielsgestel', 'Heusden', 'Oss', 'Maasdriel'],
}

/** Stads- en gemeentenaam per slug zoals de clusters ze gebruiken (/stukadoor/<slug>/, /project/<klus>/<slug>/). */
const REGIO_SLUGS: Record<string, string> = {
  's-hertogenbosch': "'s-Hertogenbosch", 'den-bosch': 'Den Bosch', rosmalen: 'Rosmalen', vught: 'Vught',
  'sint-michielsgestel': 'Sint-Michielsgestel', heusden: 'Heusden', oss: 'Oss', maasdriel: 'Maasdriel',
}

/** De plaats in de regio waar een pagina over gaat, of null. */
export function plaatsInRegio(pad: string): string | null {
  for (const deel of pad.replace(/^\/|\/$/g, '').split('/')) if (REGIO_SLUGS[deel]) return REGIO_SLUGS[deel]
  return null
}

/** Welk onderdeel van de afwerking bij een pagina hoort, op het begin van het pad. */
const ONDERDEEL_VOOR: [RegExp, string][] = [
  [/^(stukadoor|project\/stucwerk|kopen\/wandafwerking)\b/, 'stucwerk'],
  [/^(project\/badkamer-tegelen|kopen\/tegels)\b/, 'tegelwerk'],
  [/^(badkamer|loodgieter|project\/badkamer-renovatie|kopen\/sanitair)\b/, 'sanitair'],
  [/^(gietvloer|project\/(gietvloer-leggen|parket-leggen|vloerverwarming-installeren)|kopen\/vloeren)\b/, 'vloeren'],
  [/^(kozijnloze-deuren|kopen\/binnendeuren)\b/, 'binnendeuren'],
  [/^(schilder|project\/schilderwerk-binnen|kopen\/verf)\b/, 'schilderwerk'],
  [/^(kasten-op-maat|kopen\/kasten)\b/, 'kasten'],
]
export function onderdeelVoorPad(pad: string): Onderdeel | null {
  const p = pad.replace(/^\//, '')
  const hit = ONDERDEEL_VOOR.find(([re]) => re.test(p))
  return hit ? onderdeel(hit[1]) : null
}

export type Onderdeel = {
  slug: string
  naam: string
  /** Kop van de onderdeelpagina. */
  h1: string
  title: string
  description: string
  kort: string
  /** Wat eronder valt. */
  wat: string[]
  /** Wanneer in de afbouw, en waarom. */
  wanneer: string
  prijs: { tekst: string; van: number; tot: number; eenheid: string } | null
  /** Wat we uit de tekening van de koper halen. */
  uitTekening: string
  letOp: string[]
  /** Een eigen configurator of ontwerper bij dit onderdeel. */
  ontwerper?: { href: string; tekst: string }
  vragen: { v: string; a: string }[]
}

export const ONDERDELEN: Onderdeel[] = [
  {
    slug: 'stucwerk', naam: 'Stucwerk',
    h1: 'Stucwerk in je nieuwbouwwoning',
    title: 'Stucwerk nieuwbouwwoning laten doen | Bylder',
    description: 'Wanden en plafonds gestuct, in één offerte voor je hele afwerking. Glad sausklaar €18 tot €38 per m², spuitwerk vanaf €8, berekend uit je tekening.',
    kort: 'Wanden en plafonds glad of in structuur, de basis voor al het andere.',
    wat: ['Wanden glad stucen of sausklaar maken', 'Plafonds stucen in plaats van spuitwerk', 'Hoekprofielen en stucstoppers', 'Afkitten bij kozijnen en plafonds'],
    wanneer: 'Als eerste, direct na de oplevering. Kozijnloze deuren en onzichtbare plinten moeten er dan al in zitten: die worden meegestuct.',
    prijs: { tekst: 'glad, sausklaar stucwerk (behangklaar €14 tot €22, spuitwerk €8 tot €14 per m²)', van: 18, tot: 38, eenheid: 'm²' },
    uitTekening: 'De wandoppervlakte per ruimte: de omtrek maal de hoogte, min ramen en deuren.',
    letOp: ['Stucwerk moet drogen voordat de schilder komt. Dat plannen we in, zodat niemand op elkaar wacht.',
      'Nieuwbouw wordt vaak "behangklaar" opgeleverd. Voor een strak geverfde wand is meer nodig; dat staat apart in de offerte.'],
    vragen: [
      { v: 'Wat kost stucwerk in een nieuwbouwwoning?', a: 'Dat hangt af van het soort. Glad, sausklaar stucwerk kost als indicatie €18 tot €38 per m², behangklaar stucwerk €14 tot €22 en spuitwerk (vaak op plafonds) €8 tot €14 per m² (Bylder-prijsbenchmark, 2026). Een tussenwoning heeft al snel 250 tot 350 m² wand en plafond. Omdat we de maten uit je tekening halen, staat de echte prijs in je offerte zonder dat er eerst iemand komt meten.' },
      { v: 'Moet het stucwerk vóór de vloer?', a: 'Ja. Stucwerk geeft stof en vocht. Eerst stucen en laten drogen, dan tegelen en schilderen, en pas daarna de vloer.' },
    ],
  },
  {
    slug: 'tegelwerk', naam: 'Tegelwerk',
    h1: 'Tegelwerk in je nieuwbouwwoning',
    title: 'Tegelwerk nieuwbouw laten doen | Bylder',
    description: 'Badkamer, toilet en vloeren betegeld, als onderdeel van één offerte voor je hele afwerking. Indicatie €60 tot €130 per m² inclusief leggen.',
    kort: 'Badkamer, toilet, keukenwand en tegelvloeren, gelegd door een tegelzetter uit de regio.',
    wat: ['Wand- en vloertegels in badkamer en toilet', 'Tegelvloeren in woonkamer, hal en keuken', 'Keukenwand of spatwand', 'Kitwerk en afwerkprofielen'],
    wanneer: 'Na het stucwerk en vóór het schilderwerk. In de badkamer samen met het sanitair: eerst de tegels, dan het sanitair erop.',
    prijs: { tekst: 'tegelvloer inclusief leggen', van: 60, tot: 130, eenheid: 'm²' },
    uitTekening: 'De vloeroppervlakte per ruimte en de wanden van badkamer en toilet.',
    letOp: ['Laat je bij de ontwikkelaar de badkamer vervallen, dan krijg je vaak een bedrag terug. Wij rekenen met dat bedrag in de offerte.',
      'Grote tegels vragen een vlakke ondervloer. Dat meten we na voordat we beginnen.'],
    vragen: [
      { v: 'Wat kost tegelwerk per m²?', a: 'Als indicatie €60 tot €130 per m² voor een tegelvloer inclusief leggen (Bylder-prijsbenchmark, 2026). De tegel zelf maakt het grootste verschil. Met ledenkorting bij de tegelzaken van Bylder koop je de tegels voordeliger.' },
    ],
  },
  {
    slug: 'sanitair', naam: 'Sanitair en badkamer',
    h1: 'Badkamer en sanitair in je nieuwbouwwoning',
    title: 'Badkamer nieuwbouw laten plaatsen | Bylder',
    description: 'Een complete badkamer en toilet, van tegels tot kraan, in één offerte voor je hele afwerking. Indicatie €7.000 tot €20.000 voor een complete badkamer.',
    kort: 'Douche, bad, wastafelmeubel, toilet en kranen, geplaatst en aangesloten.',
    wat: ['Douche of inloopdouche met douchegoot', 'Bad, wastafelmeubel en spiegel', 'Hangend toilet en fonteintje', 'Kranen, thermostaat en radiator'],
    wanneer: 'Samen met het tegelwerk, na het stucwerk. De aansluitpunten liggen in nieuwbouw al vast.',
    prijs: { tekst: 'complete badkamer', van: 7000, tot: 20000, eenheid: 'totaal' },
    uitTekening: 'De afmetingen van badkamer en toilet en waar de aansluitpunten zitten.',
    letOp: ['Een afvoer of leiding verplaatsen kan alleen goed vóór de oplevering, via de aannemer van het project. Weet je dat je iets anders wilt, vraag het dan vóór de sluitingsdatum van het meerwerk.',
      'Sanitair koop je via ons met ledenkorting; je ziet bij elk product wie het levert.'],
    vragen: [
      { v: 'Wat kost een badkamer in een nieuwbouwwoning?', a: 'Een complete badkamer kost als indicatie €7.000 tot €20.000 (Bylder-prijsbenchmark, 2026), afhankelijk van grootte, tegels en sanitair. In je offerte staat elk onderdeel apart, zodat je ziet waar het geld heen gaat.' },
    ],
  },
  {
    slug: 'vloeren', naam: 'Vloeren',
    h1: 'De vloer in je nieuwbouwwoning',
    title: 'Vloer nieuwbouw laten leggen | Bylder',
    description: 'Gietvloer, pvc of laminaat in je hele woning, als onderdeel van één offerte voor je afwerking. Indicatie €35 tot €130 per m², berekend uit je tekening.',
    kort: 'Gietvloer, pvc of laminaat, per ruimte gekozen en in één keer gelegd.',
    wat: ['Gietvloer van Dr. Schutz', 'Pvc of laminaat, ook in visgraat', 'Egaliseren van de dekvloer', 'Plinten of onzichtbare plinten'],
    wanneer: 'Na het stucwerk en het tegelwerk. Eerst meten we of de dekvloer droog genoeg is, zeker bij vloerverwarming.',
    prijs: { tekst: 'pvc of laminaat (€35 tot €85) tot gietvloer (€70 tot €130)', van: 35, tot: 130, eenheid: 'm²' },
    uitTekening: 'De vloeroppervlakte per ruimte en welke ruimtes je in welke vloer wilt.',
    letOp: ['Bij vloerverwarming moet de dekvloer volgens schema zijn opgestookt voordat de vloer gelegd wordt.',
      'Een gietvloer en de stukadoor beïnvloeden elkaar. Wij plannen ze in de goede volgorde.'],
    ontwerper: { href: '/gietvloer/ontwerpen/', tekst: 'Kies je gietvloer in de ontwerper' },
    vragen: [
      { v: 'Wat kost een vloer in een nieuwbouwwoning?', a: 'Als indicatie €35 tot €85 per m² voor pvc of laminaat en €70 tot €130 per m² voor een gietvloer (Bylder-prijsbenchmark, 2026). Met de vierkante meters uit je tekening staat de echte prijs in je offerte.' },
    ],
  },
  {
    slug: 'binnendeuren', naam: 'Binnendeuren',
    h1: 'Binnendeuren in je nieuwbouwwoning',
    title: 'Binnendeuren nieuwbouw laten plaatsen | Bylder',
    description: 'Kozijnloze of gewone binnendeuren, afgehangen en afgesteld, als onderdeel van één offerte voor je hele afwerking. Stel je deuren eerst samen in 3D.',
    kort: 'Kozijnloze deuren van Classic Next of gewone binnendeuren, afgehangen met beslag.',
    wat: ['Kozijnloze, plafondhoge deuren', 'Gewone binnendeuren in bestaande kozijnen', 'Beslag, sloten en deurstoppers', 'Schuifdeuren en taatsdeuren'],
    wanneer: 'Een kozijnloos kozijn gaat vóór het stucwerk in de wand. De deur zelf hangen we af na het schilderwerk.',
    prijs: null,
    uitTekening: 'Het aantal deuren, hun breedte en de draairichting.',
    letOp: ['Kozijnloze deuren vragen een besluit vóór de stukadoor komt. Daarom staan ze vooraan in de planning.'],
    ontwerper: { href: '/kozijnloze-deuren/configurator/', tekst: 'Stel je deuren samen in 3D' },
    vragen: [
      { v: 'Wanneer kies ik mijn binnendeuren?', a: 'Kies je kozijnloze deuren, dan vóór het stucwerk: het kozijn wordt in de wand meegestuct. Bij gewone deuren kan het later; we hangen ze af na het schilderwerk.' },
    ],
  },
  {
    slug: 'schilderwerk', naam: 'Schilderwerk',
    h1: 'Schilderwerk in je nieuwbouwwoning',
    title: 'Schilderwerk nieuwbouw binnen | Bylder',
    description: 'Wanden, plafonds en kozijnen binnen geschilderd, als onderdeel van één offerte voor je hele afwerking. Indicatie €12 tot €28 per m².',
    kort: 'Wanden, plafonds, kozijnen en trap binnen, in de kleuren die je kiest.',
    wat: ['Wanden en plafonds latexen', 'Binnenkozijnen en deuren lakken', 'Trap en traphek', 'Voorbehandelen van nieuw stucwerk'],
    wanneer: 'Als het stucwerk droog is en het tegelwerk klaar, vóór de vloer en de deuren.',
    prijs: { tekst: 'binnenschilderwerk', van: 12, tot: 28, eenheid: 'm²' },
    uitTekening: 'Dezelfde wand- en plafondoppervlakte als voor het stucwerk.',
    letOp: ['Nieuw stucwerk moet eerst worden voorbehandeld, anders bladdert de verf.'],
    vragen: [
      { v: 'Wat kost schilderwerk in een nieuwbouwwoning?', a: 'Als indicatie €12 tot €28 per m² (Bylder-prijsbenchmark, 2026). Met de oppervlakte uit je tekening staat de echte prijs in je offerte.' },
    ],
  },
  {
    slug: 'kasten', naam: 'Kasten op maat',
    h1: 'Kasten op maat in je nieuwbouwwoning',
    title: 'Kasten op maat nieuwbouw | Bylder',
    description: 'Inbouwkasten, tv-wand en garderobe op maat, als onderdeel van één offerte voor je hele afwerking. Ontwerp je kast eerst in 3D.',
    kort: 'Inbouwkasten, garderobe, tv-wand en trapkast, gemaakt door een timmerbedrijf.',
    wat: ['Inbouwkast in een nis', 'Garderobe en kledingkast', 'Tv-wand en boekenkast', 'Kast onder de trap'],
    wanneer: 'Als laatste, na de vloer en het schilderwerk. Het timmerbedrijf meet in als de wanden en de vloer klaar zijn.',
    prijs: null,
    uitTekening: 'De nissen, hoeken en plafondhoogte waar de kast komt.',
    letOp: ['Een kast wordt nooit strak in een nis getekend: hij moet erin bij de montage, en een deur moet vrij open.'],
    ontwerper: { href: '/kasten-op-maat/ontwerpen/', tekst: 'Ontwerp je kast in 3D' },
    vragen: [
      { v: 'Wanneer komt de kast op maat?', a: 'Als laatste. Het timmerbedrijf meet in als vloer en wanden klaar zijn, en maakt de kast daarna in vier tot zes weken.' },
    ],
  },
]

export const onderdeel = (slug: string) => ONDERDELEN.find(o => o.slug === slug) ?? null

/** De volgorde van de afbouw, zoals wij hem plannen. */
export const VOLGORDE = [
  { stap: 'Tekening en planning', tekst: 'We halen de maten uit je tekening en zetten de planning op vanaf je opleverdatum.' },
  { stap: 'Wat vóór het stucwerk moet', tekst: 'Kozijnloze kozijnen en onzichtbare plinten gaan de wand in.' },
  { stap: 'Stucwerk', tekst: 'Wanden en plafonds, en daarna drogen.' },
  { stap: 'Tegelwerk en sanitair', tekst: 'Badkamer, toilet en tegelvloeren.' },
  { stap: 'Schilderwerk', tekst: 'Wanden, plafonds en kozijnen.' },
  { stap: 'Vloeren', tekst: 'Na een vochtmeting van de dekvloer.' },
  { stap: 'Deuren en kasten', tekst: 'Deuren afhangen, kasten inmeten en plaatsen.' },
]

export const URL_AFWERKEN = 'https://www.bylder.com/nieuwbouw-afwerken/'

export const euro = (n: number) => '€' + n.toLocaleString('nl-NL')
export const prijsTekst = (p: NonNullable<Onderdeel['prijs']>) =>
  p.eenheid === 'totaal' ? `${euro(p.van)} tot ${euro(p.tot)}` : `${euro(p.van)} tot ${euro(p.tot)} per ${p.eenheid}`

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Blok "Van sleutel tot ingericht huis in <project>" op elke projectpagina (besluit Daniel, 29-10-2026;
 * eerst alleen in de regio als "Laat je woning afwerken"). Als HTML, omdat het in het fragment van de
 * projectpagina komt, direct boven "Twee afwerkingen die je nu kiest". Toont de voorbeeldwoning in 3D
 * (/mijn-woning/?voorbeeld), de offerteknop met project en oplevering al ingevuld, en dat de koper
 * zijn eigen vakman kan laten meekijken.
 */
export function afwerkBlokProject(project: string, slug: string, oplevering: string | null): string {
  const q = new URLSearchParams({ project, ...(oplevering ? { oplevering } : {}) }).toString()
  const offerte = `/nieuwbouw-afwerken/?${q}#aanvraag`
  const voorbeeld = `/mijn-woning/?voorbeeld&${new URLSearchParams({ project: slug, naam: project }).toString()}`
  const meet = (plek: string) => `window.gtag&&gtag('event','afwerk_klik',{plek:'${plek}',pagina:location.pathname})`
  const stap = (n: string, t: string, p: string) =>
    `<li style="display:flex;gap:12px;align-items:flex-start;margin:0 0 12px"><span style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:#3D5A3E;color:#F5F0E8;font:700 13px/26px 'Space Mono',monospace;text-align:center">${n}</span>`
    + `<span style="font-size:15px;line-height:1.55;color:rgba(61,46,30,0.82)"><strong style="color:#1A1208">${t}</strong> ${p}</span></li>`
  return `<!--bylder:afwerk-project--><style>@media(max-width:720px){.sleutel-beeld{order:-1}}</style><section aria-labelledby="sleutel-kop" style="margin:32px 0;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:20px;padding:clamp(20px,4vw,34px);display:grid;gap:24px 32px;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));align-items:center">`
    + `<div>`
    + `<p style="font-family:'Space Mono',monospace;font-size:11.5px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:#3D5A3E;margin:0 0 8px">Alles voor je woning, via Bylder</p>`
    + `<h2 id="sleutel-kop" style="font-size:clamp(1.4rem,2.6vw,1.85rem);font-weight:800;line-height:1.2;letter-spacing:-0.02em;margin:0 0 14px;color:#1A1208">Van sleutel tot ingericht huis in ${esc(project)}</h2>`
    + `<ol style="list-style:none;margin:0 0 18px;padding:0">`
    + stap('1', 'Zie je woning in 3D.', 'Uit je eigen plattegrond, met elke ruimte en elke deur. Daarin ontwerp je deuren, vloer en kasten.')
    + stap('2', 'Laat het afwerken in één offerte.', `Stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten, met één planning${oplevering ? ` op je oplevering (verwacht ${esc(oplevering)})` : ''}.`)
    + stap('3', 'Richt in met korting.', 'Ledenkorting bij woonwinkels en merken in de buurt.')
    + `</ol>`
    + `<div style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 18px">`
    + `<a href="${esc(offerte)}" onclick="${meet('project')}" style="background:#3D5A3E;color:#F5F0E8;border-radius:11px;padding:13px 20px;font-weight:800;font-size:15px;text-decoration:none">Vraag een offerte aan &rarr;</a>`
    + `<a href="${esc(voorbeeld)}" onclick="${meet('project-voorbeeld')}" style="border:1.5px solid #3D5A3E;color:#3D5A3E;border-radius:11px;padding:12px 18px;font-weight:700;font-size:15px;text-decoration:none">Bekijk een voorbeeldwoning in 3D</a>`
    + `</div>`
    + `<p style="display:flex;gap:10px;align-items:flex-start;margin:0;padding-top:14px;border-top:1px solid rgba(61,46,30,0.1);font-size:14.5px;line-height:1.55;color:rgba(61,46,30,0.8)">`
    + `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D5A3E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M4 5h7v14H4zM13 5h7v14h-7zM6.5 9h2M6.5 12h2M15.5 9h2M15.5 12h2"/></svg>`
    + `<span><strong style="color:#1A1208">Je eigen vakman kijkt mee.</strong> Ook het bedrijf dat jij al kent, maakt een offerte voor je woning, naast die van Bylder.</span></p>`
    + `</div>`
    // #sleutel-film: hier speelt ProjectFilm de film van de homepage zodra hij in beeld komt;
    // daaronder het stilstaande beeld van de voorbeeldwoning voor wie geen WebGL heeft.
    + `<figure class="sleutel-beeld" style="margin:0"><div id="sleutel-film" style="position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;background:#EDE6D8;border:1px solid rgba(61,46,30,0.1)">`
    + `<img src="/img/voorbeeldwoning-3d.webp" srcset="/img/voorbeeldwoning-3d-sm.webp 600w, /img/voorbeeldwoning-3d.webp 1200w" sizes="(max-width: 760px) 100vw, 560px" width="1200" height="712" loading="lazy" decoding="async" alt="Voorbeeldwoning in 3D: een plattegrond die een woning wordt, met vierkante meters en genummerde binnendeuren" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"></div>`
    + `<figcaption style="font-size:12.5px;color:rgba(61,46,30,0.65);margin-top:8px">Voorbeeld: zo wordt een plattegrond een woning in 3D. Met jouw tekening staat hier je eigen woning.</figcaption></figure>`
    + `</section>`
    // Plek voor "Wat je buren kozen" (BurenKozen.tsx); blijft leeg tot er genoeg kopers zijn.
    + `<div id="buren-kozen"></div>`
}
