// Fase 2 — city+bedrijf-cluster /schilder/ (5.761 pagina's, 2.553 geïndexeerd).
// Clone van web/lib/gietvloer.ts. Verschillen: gebruikt overal {{maps_href}}
// (zoals gietvloer, niet {{maps_cid_href}}); kaart-vormen alleen rated/unrated.
// 2 bedrijf-entries missen city/city_slug (huting-schilderwerken-grekrg,
// jorek-klus-en-onderhoudsbedrijf-xegq58, beide template v12) — die
// contentvariant bevat {{city}}/{{city_slug}} dan ook niet, dus de generieke
// "vul alleen in wat aanwezig is"-aanpak dekt dit al. Leest de canonieke
// datalaag op build-time; alleen de renderlaag migreert. Server/build-only (fs).

import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'schilder'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type SchilderPage = {
  slug: string
  path: string
  title: string
  description: string
  og_type?: string
  robots?: string
  ldjson: string[]
  content_kind: 'city' | 'bedrijf' | null
}

type Company = {
  shape: string // 'rated' | 'unrated'
  profile_href: string
  name: string
  plaats: string
  rating: string
  reviews: string
  rating_disp?: string
  reviews_disp?: string
  maps_href?: string
  claim_href: string
}

type City = {
  city: string
  city_slug?: string
  template: string // content.city.<variant>.html
  companies: Company[]
}

type Sibling = { href: string; name: string; rating?: string }

type Bedrijf = {
  name: string
  city?: string
  city_slug?: string
  siblings?: Sibling[]
  rating_row?: string // row.rating_row.<variant>.html
  contact_row?: string // row.contact_row.<variant>.html
  template: string // content.bedrijf.<variant>.html
  rating_disp?: string
  reviews?: string
  maps_href?: string
  website?: string
  tel?: string
  tel_disp?: string
}

// Disclaimer uit de cluster-footer (templates/clusters/schilder/footer.default.html):
// unieke E-E-A-T-tekst, niet aanwezig in de city/bedrijf-contentfragmenten. Vervalt
// met de oude footer → hier als contentregel behouden i.p.v. stilzwijgend laten vallen.
const DISCLAIMER =
  'Prijzen zijn indicatieve marktbandbreedtes (NL 2026) en verschillen per project, regio en afwerking. Reviewscores zijn afkomstig van de genoemde externe platforms; bekijk de volledige beoordelingen bij de bron. Bylder is een onafhankelijk platform en geen schildersbedrijf.'
const DISCLAIMER_HTML = `<p style="font-size:11px;color:rgba(61,46,30,0.4);margin-top:24px;max-width:680px;">${DISCLAIMER}</p>`

const TILE_SHAPES = {
  rated: '<a href="{{href}}" class="tile">{{name}} <span style="color:rgba(61,46,30,0.4);font-weight:400;">&#9733; {{rating}}</span></a>',
  unrated: '<a href="{{href}}" class="tile">{{name}}</a>',
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
}

function fillPlaceholders(tpl: string, fields: Record<string, string | undefined>): string {
  let out = tpl
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) out = out.replaceAll(`{{${k}}}`, v)
  }
  return out
}

let _pages: SchilderPage[] | null = null
export function getPages(): SchilderPage[] {
  if (!_pages) _pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
  return _pages!
}
export function getPage(slug: string): SchilderPage | undefined {
  return getPages().find(p => p.slug === slug)
}

let _cities: Record<string, City> | null = null
function getCities(): Record<string, City> {
  if (!_cities) _cities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'cities.json'), 'utf8'))
  return _cities!
}
let _bedrijven: Record<string, Bedrijf> | null = null
function getBedrijven(): Record<string, Bedrijf> {
  if (!_bedrijven) _bedrijven = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bedrijven.json'), 'utf8'))
  return _bedrijven!
}

// Eén uniforme shell voor alle 5.761 pagina's (pages.json "template"-veld is
// overal "default").
let _css: string | null = null
export function getShellCss(): string {
  if (_css === null) {
    const tpl = fs.readFileSync(path.join(TPL_DIR, 'template.default.html'), 'utf8')
    const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    _css = m ? m[1] : ''
  }
  return _css
}

const _tplCache: Record<string, string> = {}
function readTpl(rel: string): string {
  if (!(rel in _tplCache)) _tplCache[rel] = fs.readFileSync(path.join(TPL_DIR, rel), 'utf8')
  return _tplCache[rel]
}

function renderCard(c: Company): string {
  return fillPlaceholders(readTpl(`card.${c.shape}.html`), {
    profile_href: c.profile_href,
    name: c.name,
    plaats: c.plaats,
    rating: c.rating,
    reviews: c.reviews,
    rating_disp: c.rating_disp,
    reviews_disp: c.reviews_disp,
    maps_href: c.maps_href,
    claim_href: c.claim_href,
  })
}

function renderTile(s: Sibling): string {
  const shape = s.rating ? TILE_SHAPES.rated : TILE_SHAPES.unrated
  return fillPlaceholders(shape, { href: s.href, name: s.name, rating: s.rating })
}

function getCityHtml(page: SchilderPage): string {
  const c = getCities()[page.slug]
  let body = readTpl(`content.city.${c.template}.html`)
  const cards = c.companies.map(renderCard).join('')
  body = body.replace('{{cards}}', cards).replaceAll('{{count}}', String(c.companies.length))
  body = fillPlaceholders(body, { city: c.city, city_slug: c.city_slug })
  return body.replace('</main>', `${DISCLAIMER_HTML}</main>`)
}

function getBedrijfHtml(page: SchilderPage): string {
  const b = getBedrijven()[page.slug]
  let body = readTpl(`content.bedrijf.${b.template}.html`)
  if (b.rating_row) {
    const row = fillPlaceholders(readTpl(`row.rating_row.${b.rating_row}.html`), {
      rating_disp: b.rating_disp, reviews: b.reviews, maps_href: b.maps_href,
    })
    body = body.replace('{{rating_row}}', row)
  }
  if (b.contact_row) {
    const row = fillPlaceholders(readTpl(`row.contact_row.${b.contact_row}.html`), {
      website: b.website, tel: b.tel, tel_disp: b.tel_disp, maps_href: b.maps_href,
    })
    body = body.replace('{{contact_row}}', row)
  }
  if (b.siblings) {
    body = body.replace('{{tiles}}', b.siblings.map(renderTile).join(''))
  }
  body = fillPlaceholders(body, { name: b.name, city: b.city, city_slug: b.city_slug })
  return body.replace('</main>', `${DISCLAIMER_HTML}</main>`)
}

const _hubCache: Record<string, string> = {}
function readHub(slug: string): string {
  if (!(slug in _hubCache)) _hubCache[slug] = fs.readFileSync(path.join(DATA_DIR, 'content', `${slug}.html`), 'utf8')
  return _hubCache[slug]
}

// De <main>-HTML voor elk van de 3 pagina-vormen: city (bedrijvengrid),
// bedrijf (profiel) of hub (self-contained, alleen 'index' in dit cluster).
export function getMainHtml(page: SchilderPage): string {
  if (page.content_kind === 'city') return getCityHtml(page)
  if (page.content_kind === 'bedrijf') return getBedrijfHtml(page)
  return readHub(page.slug)
}

function parseRobots(robots?: string) {
  if (!robots) return { index: true, follow: true }
  if (robots.includes('noindex')) return { index: false, follow: false }
  return { index: true, follow: true }
}

export function toMetadata(page: SchilderPage): Metadata {
  const url = SITE + page.path
  const title = decodeEntities(page.title)
  const description = decodeEntities(page.description)
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: parseRobots(page.robots),
    openGraph: {
      type: (page.og_type as any) || 'article',
      title,
      description,
      url,
    },
  } satisfies Metadata
}

export function slugToSegments(slug: string): string[] {
  return slug === 'index' ? [] : slug.split('/')
}
export function segmentsToSlug(segments?: string[]): string {
  return segments && segments.length ? segments.join('/') : 'index'
}
