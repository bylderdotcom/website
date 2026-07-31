// Ruimte-ontologie → pagina. De HTML wordt hier gerenderd uit data/ruimtes/*.json;
// er bestaat geen los geschreven contentbestand per ruimte. Dat is het hele punt:
// dezelfde bron voedt de pagina, het FAQ-schema, de agent en straks de
// aanbevelingslaag. Loopt er iets uiteen, dan is dat een bug in één renderer en
// niet in vijf plekken tegelijk.
//
// Alleen build/server (fs) — nooit in een client-component importeren.

import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const REPO = path.join(process.cwd(), '..')
const DIR = path.join(REPO, 'data', 'ruimtes')

// Eén plek voor de datum die de pagina toont én die in het schema als dateModified
// staat. Stonden die uit elkaar, dan beweert de pagina iets anders dan de metadata —
// precies het patroon dat de claim-bewaker moet vangen. Bijwerken zodra de inhoud
// van data/ruimtes/*.json verandert.
const BIJGEWERKT = { tekst: '31 juli 2026', iso: '2026-07-31' }

export type Beslissing = { vraag: string; waarom: string; opties: string[] }
export type Sectie = { kop: string; alineas: string[] }
export type Producttype = { type: string; waarom: string }

export type Ruimte = {
  slug: string
  naam: string
  synoniemen: string[]
  type: string
  status: 'node' | 'pagina'
  kern: string
  momenten: string[]
  beslissingen: Beslissing[]
  vakken: string[]
  vergunning?: { nodig: string; toelichting: string; pad?: string }
  kosten_paden?: string[]
  productcategorieen?: string[]
  producttypen?: Producttype[]
  meerwerk?: string[]
  fouten?: string[]
  vragen?: { v: string; a: string }[]
  verwante_ruimtes?: string[]
  paden?: string[]
  pagina_pad?: string
  verwijs_pad?: string
  verwijs_reden?: string
  intro?: string
  secties?: Sectie[]
}

let _alle: Ruimte[] | null = null
export function alleRuimtes(): Ruimte[] {
  if (!_alle) {
    _alle = fs.readdirSync(DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) as Ruimte)
      .sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
  }
  return _alle!
}

export const paginaRuimtes = () => alleRuimtes().filter(r => r.status === 'pagina')
export const getRuimte = (slug: string) => alleRuimtes().find(r => r.slug === slug)

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const VAK_LABEL: Record<string, string> = {
  stukadoor: 'Stukadoors', schilder: 'Schilders', loodgieter: 'Loodgieters',
  elektricien: 'Elektriciens', aannemer: 'Aannemers', badkamer: 'Badkamerspecialisten',
  dakkapel: 'Dakkapelspecialisten', gietvloer: 'Gietvloerspecialisten',
  isolatiebedrijf: 'Isolatiebedrijven', kozijnbedrijf: 'Kozijnbedrijven',
  warmtepompinstallateur: 'Warmtepompinstallateurs', dakdekker: 'Dakdekkers',
  ventilatiebedrijf: 'Ventilatiebedrijven', timmerman: 'Timmerlieden',
  energieadviseur: 'Energieadviseurs',
}

const MOMENT_LABEL: Record<string, string> = {
  'nieuwbouw-oplevering': 'bij de oplevering van een nieuwbouwwoning',
  verbouwing: 'tijdens een verbouwing',
  verhuizing: 'bij een verhuizing',
  verduurzaming: 'bij het verduurzamen',
}

export function renderRuimte(r: Ruimte): string {
  const d: string[] = []
  d.push('<main style="padding:60px 0;"><div class="container">')

  d.push(`<div style="max-width:760px;">
    <nav aria-label="Kruimelpad" class="kruimel">
      <a href="/">Bylder.com</a><span>&rsaquo;</span>
      <a href="/ruimtes/">Ruimtes</a><span>&rsaquo;</span><span>${esc(r.naam)}</span>
    </nav>
    <div class="badge">${esc(r.type === 'buiten' ? 'Buitenruimte' : r.type === 'technisch' ? 'Technische ruimte' : 'Woonruimte')}</div>
    <h1>${esc(r.naam)}: wat je hier beslist, en in welke volgorde</h1>
    <p class="lead">${esc(r.intro ?? r.kern)}</p>
    <p class="meta">Laatst bijgewerkt: ${BIJGEWERKT.tekst}${r.synoniemen.length ? ` &middot; ook wel: ${r.synoniemen.map(esc).join(', ')}` : ''}</p>
  </div>`)

  d.push(`<div class="highlight" style="max-width:760px;"><strong>Kort:</strong> ${esc(r.kern)} Speelt ${r.momenten.map(m => MOMENT_LABEL[m] ?? m).join(', ')}.</div>`)

  // Beslissingen — de kern van de ontologie, en het meest citeerbare deel
  d.push('<h2>De beslissingen die hier vallen</h2>')
  d.push('<p class="sub">Op volgorde: elke keuze hieronder beperkt de volgende. Wie ze omdraait, betaalt het ontwerp twee keer.</p>')
  d.push('<div class="besl-lijst">')
  r.beslissingen.forEach((b, i) => {
    d.push(`<div class="besl">
      <div class="besl-nr">${i + 1}</div>
      <div>
        <h3>${esc(b.vraag)}</h3>
        <p>${esc(b.waarom)}</p>
        <div class="opties">${b.opties.map(o => `<span class="optie">${esc(o)}</span>`).join('')}</div>
      </div>
    </div>`)
  })
  d.push('</div>')

  for (const s of r.secties ?? []) {
    d.push(`<h2>${esc(s.kop)}</h2>`)
    d.push(s.alineas.map(a => `<p class="body">${esc(a)}</p>`).join(''))
  }

  if (r.fouten?.length) {
    d.push('<h2>Wat er het vaakst misgaat</h2>')
    d.push(`<ul class="x-list" style="max-width:760px;">${r.fouten.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`)
  }

  if (r.vergunning) {
    const kleur = r.vergunning.nodig === 'ja' ? '#B85C38' : r.vergunning.nodig === 'soms' ? '#B8873A' : '#3D5A3E'
    const kop = { ja: 'Ja, vergunning nodig', soms: 'Soms vergunningplichtig', nee: 'Geen vergunning nodig' }[r.vergunning.nodig] ?? ''
    d.push(`<h2>Vergunning</h2><div class="highlight" style="max-width:760px;border-left-color:${kleur};">
      <strong>${esc(kop)}.</strong> ${esc(r.vergunning.toelichting)}
      ${r.vergunning.pad ? ` <a href="${r.vergunning.pad}">Zo werkt de vergunningaanvraag</a>.` : ''}</div>`)
  }

  // ── De commerciële laag: wat je hier nodig hebt en wie het doet ──
  if (r.producttypen?.length) {
    d.push('<h2>Wat je hier nodig hebt</h2>')
    d.push('<p class="sub">Niet als winkellijst, maar als checklist: dit zijn de keuzes waar geld in zit, met de reden erbij.</p>')
    d.push(`<table class="vgl"><thead><tr><th>Product</th><th>Waarom het hier uitmaakt</th></tr></thead><tbody>
      ${r.producttypen.map(p => `<tr><td>${esc(p.type)}</td><td>${esc(p.waarom)}</td></tr>`).join('')}
    </tbody></table>`)
  }

  if (r.meerwerk?.length) {
    d.push(`<div class="highlight" style="max-width:760px;"><strong>Bij nieuwbouw is dit meerwerk.</strong>
      Deze posten liggen bij de oplevering nog open en zijn achteraf aanzienlijk duurder:
      ${r.meerwerk.map(m => esc(m.replace(/-/g, ' '))).join(', ')}. Reken ze door voordat je de meerwerklijst tekent.</div>`)
  }

  if (r.vakken.length) {
    d.push('<h2>Wie dit werk doet</h2>')
    d.push('<div class="grid-3">')
    for (const v of r.vakken) {
      d.push(`<a href="/${v}/" class="tile"><div class="tile-t">${esc(VAK_LABEL[v] ?? v)}</div>
        <div class="tile-d">Marktprijzen, wat het werk inhoudt en bedrijven per gemeente</div></a>`)
    }
    d.push('</div>')
  }

  if (r.kosten_paden?.length || r.paden?.length) {
    const alle = [...new Set([...(r.kosten_paden ?? []), ...(r.paden ?? [])])]
    d.push(`<h2>Kosten en verdieping</h2><ul class="check-list" style="max-width:760px;">
      ${alle.map(p => `<li><a href="${p}">${esc(p.replace(/\//g, ' ').trim().replace(/-/g, ' '))}</a></li>`).join('')}
    </ul>`)
  }

  if (r.vragen?.length) {
    d.push('<div class="divider"></div><h2>Veelgestelde vragen</h2>')
    d.push(r.vragen.map(q => `<div class="faq-item"><h3>${esc(q.v)}</h3><p>${esc(q.a)}</p></div>`).join(''))
  }

  const verwant = (r.verwante_ruimtes ?? []).map(s => getRuimte(s)).filter(Boolean) as Ruimte[]
  if (verwant.length) {
    d.push('<div class="divider"></div><h2>Grenst aan</h2><div class="grid-3">')
    for (const v of verwant) {
      const href = v.status === 'pagina' ? (v.pagina_pad ?? `/ruimtes/${v.slug}/`) : (v.verwijs_pad ?? null)
      const inner = `<div class="tile-t">${esc(v.naam)}</div><div class="tile-d">${esc(v.kern.split('.')[0])}.</div>`
      d.push(href ? `<a href="${href}" class="tile">${inner}</a>` : `<div class="tile tile-uit">${inner}</div>`)
    }
    d.push('</div>')
  }

  d.push('<div class="divider"></div><p class="body"><a href="/ruimtes/">Alle woonruimtes op een rij</a></p>')
  d.push('</div></main>')
  return d.join('\n')
}

export function renderIndex(): string {
  const alle = alleRuimtes()
  const perType: Record<string, Ruimte[]> = {}
  for (const r of alle) (perType[r.type] ??= []).push(r)
  const TYPE_KOP: Record<string, string> = {
    binnen: 'Binnen', verkeersruimte: 'Gangen, hallen en trappen',
    technisch: 'Technische ruimtes', buiten: 'Buiten',
  }

  const d: string[] = ['<main style="padding:60px 0;"><div class="container">']
  d.push(`<div style="max-width:760px;">
    <nav aria-label="Kruimelpad" class="kruimel"><a href="/">Bylder.com</a><span>&rsaquo;</span><span>Ruimtes</span></nav>
    <div class="badge">Ruimte voor ruimte</div>
    <h1>Elke ruimte in huis, en wat je er beslist</h1>
    <p class="lead">Een woning is geen plattegrond maar een reeks beslissingen, en die vallen per ruimte. Wat je op zolder kiest bepaalt wat er op de overloop nog kan; wat je in de bijkeuken plaatst bepaalt of je meterkast het aankan. Hieronder alle ${alle.length} ruimtes die we in kaart hebben, met per ruimte de keuzes, de veelgemaakte fouten en wie het werk doet.</p>
    <p class="meta">Laatst bijgewerkt: ${BIJGEWERKT.tekst}</p>
  </div>`)
  d.push(`<div class="highlight" style="max-width:760px;"><strong>Bylder verkoopt niets van dit alles.</strong> We brengen in kaart wat er per ruimte te beslissen valt en wie het uitvoert. Waar een merk een aanbieding via Bylder heeft, staat dat er zichtbaar bij.</div>`)

  for (const [type, kop] of Object.entries(TYPE_KOP)) {
    const rs = perType[type]
    if (!rs?.length) continue
    d.push(`<h2>${kop}</h2><div class="grid-3">`)
    for (const r of rs) {
      // Drie soorten tegels: een eigen ruimtepagina, een verwijzing naar bestaande
      // content elders op de site (badkamer, slaapkamer), of alleen een node.
      const href = r.status === 'pagina' ? (r.pagina_pad ?? `/ruimtes/${r.slug}/`) : (r.verwijs_pad ?? null)
      const n = r.beslissingen.length
      const label = r.status === 'pagina'
        ? `${n} beslissing${n === 1 ? '' : 'en'}`
        : r.verwijs_pad ? 'eigen hub op Bylder' : `${n} beslissing${n === 1 ? '' : 'en'} &middot; nog geen pagina`
      const inner = `<div class="tile-t">${esc(r.naam)}</div>
        <div class="tile-d">${esc(r.kern.split('.')[0])}.</div>
        <div class="tile-m">${label}</div>`
      d.push(href ? `<a href="${href}" class="tile">${inner}</a>` : `<div class="tile tile-uit">${inner}</div>`)
    }
    d.push('</div>')
  }

  d.push(`<div class="divider"></div>
    <h2>Waarom niet elke ruimte een pagina heeft</h2>
    <p class="body">We beschrijven alle ruimtes, maar publiceren alleen waar we echt iets toe te voegen hebben. Een trapkast verdient geen artikel van tweeduizend woorden; de vraag "past hier een kast" verdient wel een goed antwoord. De ruimtes zonder eigen pagina staan hier omdat ze deel uitmaken van hetzelfde geheel &mdash; en omdat onze eigen tools ermee rekenen.</p>`)
  d.push('</div></main>')
  return d.join('\n')
}

export function metadataVoor(r: Ruimte) {
  const url = SITE + (r.pagina_pad ?? `/ruimtes/${r.slug}/`)
  const title = `${r.naam}: keuzes, fouten en vakmensen | Bylder`
  // Korte kern-teksten leverden een description van 113 tekens op — te dun om als
  // snippet te dienen. Aanvullen met wat er feitelijk op de pagina staat.
  const kort = (t: string, max: number) =>
    t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max - 1)).trimEnd() + '…'
  const staart = `${r.beslissingen.length} keuzes, de fouten die het vaakst voorkomen en wie het werk doet.`
  const description = r.kern.length < 120 ? kort(`${r.kern} ${staart}`, 158) : kort(r.kern, 158)
  return {
    title, description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { type: 'article', title, description, url },
  }
}

export function ldjsonVoor(r: Ruimte): string[] {
  const url = SITE + (r.pagina_pad ?? `/ruimtes/${r.slug}/`)
  const blokken: object[] = []

  if (r.vragen?.length) {
    blokken.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: r.vragen.map(q => ({
        '@type': 'Question', name: q.v,
        acceptedAnswer: { '@type': 'Answer', text: q.a },
      })),
    })
  }

  // DefinedTerm met de synoniemen: laat een AI-zoekmachine weten dat washok,
  // wasruimte en bijkeuken hetzelfde zijn. Dat is precies wat de ontologie weet
  // en wat op een gewone pagina nergens uit blijkt.
  blokken.push({
    '@context': 'https://schema.org', '@type': 'DefinedTerm',
    name: r.naam, description: r.kern, url,
    ...(r.synoniemen.length ? { alternateName: r.synoniemen } : {}),
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Woonruimtes', url: SITE + '/ruimtes/' },
  })

  blokken.push({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: `${r.naam}: keuzes, fouten en vakmensen`,
    description: r.kern,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    dateModified: BIJGEWERKT.iso,
    inLanguage: 'nl-NL',
    author: { '@type': 'Organization', name: 'Bylder', url: SITE },
    publisher: { '@type': 'Organization', name: 'Bylder', url: SITE },
    about: { '@type': 'DefinedTerm', name: r.naam, url },
    isPartOf: { '@type': 'CollectionPage', name: 'Woonruimtes', url: SITE + '/ruimtes/' },
  })

  blokken.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Ruimtes', item: SITE + '/ruimtes/' },
      { '@type': 'ListItem', position: 3, name: r.naam, item: url },
    ],
  })
  return blokken.map(b => JSON.stringify(b, null, 2))
}

export function getRuimteCss(): string {
  const tpl = fs.readFileSync(path.join(REPO, 'templates', 'clusters', 'ruimtes', 'template.default.html'), 'utf8')
  const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  return m ? m[1] : ''
}
