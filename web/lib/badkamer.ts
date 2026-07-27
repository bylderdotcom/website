// Fase 2 — city+bedrijf-cluster /badkamer/ (2.359 pagina's, 1.978 geïndexeerd).
// Clone van web/lib/gietvloer.ts. Simpelste cluster tot nu toe: geen
// city_alt/name_alt, alle bedrijven hebben city + maps_href (geen
// maps_cid_href-alternatief nodig), kaart-vormen alleen rated/unrated. Leest
// de canonieke datalaag op build-time; alleen de renderlaag migreert.
// Server/build-only (fs).

import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'badkamer'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type BadkamerPage = {
  slug: string
  path: string
  title: string
  description: string
  og_type?: string
  robots?: string
  ldjson: string[]
  content_kind: 'city' | 'bedrijf' | 'register' | null
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

// Disclaimer uit de cluster-footer (templates/clusters/badkamer/footer.default.html):
// unieke E-E-A-T-tekst, niet aanwezig in de city/bedrijf-contentfragmenten. Vervalt
// met de oude footer → hier als contentregel behouden i.p.v. stilzwijgend laten vallen.
const DISCLAIMER =
  'Prijzen zijn indicatieve marktbandbreedtes (NL 2026) en verschillen per project, regio en afwerking. Reviewscores zijn afkomstig van de genoemde externe platforms; bekijk de volledige beoordelingen bij de bron. Bylder is een onafhankelijk platform en geen badkamerbedrijf.'
const DISCLAIMER_HTML = `<p style="font-size:11px;color:rgba(61,46,30,0.72);margin-top:24px;max-width:680px;">${DISCLAIMER}</p>`

const TILE_SHAPES = {
  rated: '<a href="{{href}}" class="tile">{{name}} <span style="color:rgba(61,46,30,0.72);font-weight:400;">&#9733; {{rating}}</span></a>',
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

let _pages: BadkamerPage[] | null = null
export function getPages(): BadkamerPage[] {
  if (!_pages) {
    const real: BadkamerPage[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
    _pages = [...real, ...buildRegisterPages()]
  }
  return _pages!
}
export function getPage(slug: string): BadkamerPage | undefined {
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

// A-Z-registerlaag (Fase 2 interne-linkarchitectuur, reports/interne-linkarchitectuur-ontwerp.md):
// ontsluit bedrijfsprofielen in plaatsen zonder eigen stadspagina (anders wees,
// 0 inkomende links). Puur een Next-side navigatieconstruct uit bedrijven.json —
// bestaat niet in de legacy site, dus geen pages.json/content-bron nodig.
// noindex,follow: crawlpad, geen zoekresultaat-kandidaat.
type RegisterEntry = { name: string; href: string }
function registerLetter(name: string): string {
  const first = name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}
let _registerGroups: Record<string, RegisterEntry[]> | null = null
function getRegisterGroups(): Record<string, RegisterEntry[]> {
  if (!_registerGroups) {
    const groups: Record<string, RegisterEntry[]> = {}
    for (const [slug, b] of Object.entries(getBedrijven())) {
      const letter = registerLetter(b.name)
      ;(groups[letter] ??= []).push({ name: b.name, href: `/${CLUSTER}/${slug}/` })
    }
    for (const letter of Object.keys(groups)) groups[letter].sort((a, b) => a.name.localeCompare(b.name, 'nl'))
    _registerGroups = groups
  }
  return _registerGroups!
}
function registerLetters(): string[] {
  return Object.keys(getRegisterGroups()).sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
}
function registerSlugPart(letter: string): string {
  return letter === '#' ? 'overig' : letter.toLowerCase()
}
function buildRegisterPages(): BadkamerPage[] {
  return registerLetters().map(letter => {
    const slug = `register/${registerSlugPart(letter)}`
    return {
      slug,
      path: `/${CLUSTER}/${slug}/`,
      title: `Alle ${CLUSTER}-bedrijven — ${letter} | Bylder`,
      description: `Alfabetisch overzicht van alle ${CLUSTER}-bedrijven op Bylder (${letter}).`,
      robots: 'noindex, follow',
      ldjson: [],
      content_kind: 'register',
    }
  })
}
function letterButton(letter: string, active: boolean): string {
  const href = `/${CLUSTER}/register/${registerSlugPart(letter)}/`
  const style = active
    ? 'background:#3D5A3E;color:#F5F0E8;'
    : 'background:#fff;border:1px solid rgba(61,46,30,0.1);color:#1A1208;'
  return `<a href="${href}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;font-size:12.5px;font-weight:700;text-decoration:none;${style}">${letter}</a>`
}
// Ingevoegd op de hub-pagina, vóór </main> (zelfde patroon als DISCLAIMER_HTML hieronder).
function registerLinksHtml(): string {
  const links = registerLetters().map(l => letterButton(l, false)).join('')
  return `<section style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(61,46,30,0.1);"><h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3D5A3E;margin-bottom:10px;">Alle bedrijven A&ndash;Z</h2><div style="display:flex;flex-wrap:wrap;gap:6px;">${links}</div></section>`
}
function getRegisterHtml(page: BadkamerPage): string {
  const part = page.slug.split('/')[1]
  const letter = part === 'overig' ? '#' : part.toUpperCase()
  const groups = getRegisterGroups()
  const companies = groups[letter] || []
  const nav = registerLetters().map(l => letterButton(l, l === letter)).join('')
  const tiles = companies.map(c => `<a href="${c.href}" class="tile">${c.name}</a>`).join('')
  return `<main style="padding:48px 0 20px;"><div class="container" style="max-width:1000px;">
  <p style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:18px;"><a href="/" style="color:rgba(61,46,30,0.72);text-decoration:none;">Bylder.com</a> &rarr; <a href="/${CLUSTER}/" style="color:rgba(61,46,30,0.72);text-decoration:none;">${CLUSTER}</a> &rarr; <span style="color:rgba(61,46,30,0.72);">Alle bedrijven &mdash; ${letter}</span></p>
  <h1 style="font-size:1.8rem;font-weight:800;line-height:1.15;margin-bottom:16px;">Alle bedrijven &mdash; ${letter}</h1>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:28px;">${nav}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">${tiles}</div>
  </div></main>`
}

// Eén uniforme shell voor alle 2.359 pagina's (pages.json "template"-veld is
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

function getCityHtml(page: BadkamerPage): string {
  const c = getCities()[page.slug]
  let body = readTpl(`content.city.${c.template}.html`)
  const cards = c.companies.map(renderCard).join('')
  body = body.replace('{{cards}}', cards).replaceAll('{{count}}', String(c.companies.length))
  body = fillPlaceholders(body, { city: c.city, city_slug: c.city_slug })
  return body.replace('</main>', `${DISCLAIMER_HTML}</main>`)
}

// Oproep aan de eigenaar om zijn profiel op te eisen. De claim-flow bestaat en
// werkt, maar niets op deze 25.707 pagina's wees ernaartoe (gemeten 27 jul 2026)
// — vandaar 1 claim op het hele bestand. Staat onderaan, na de inhoud: de koper
// die vergelijkt heeft er niets aan, de eigenaar die zichzelf opzoekt wel.
// Lokale marktcijfers per plaats (data/plaats-gemeente.json). Gekoppeld op de
// mediane positie van de bedrijven in die plaats naar de dichtstbijzijnde
// gemeentecentroide, zodat Hoofddorp bij Haarlemmermeer uitkomt en niet bij zichzelf.
type PlaatsCijfers = {
  gemeente: string; slug: string
  prijs?: number | null; prijs_vs_nl?: number | null
  gereed?: number | null; gereed_jaar?: string | null
  vergund?: number | null; verhuizingen?: number | null
  doorstroom?: number | null; projecten?: number | null
}
let _plaatsen: Record<string, PlaatsCijfers> | null = null
function plaatsCijfers(citySlug?: string): PlaatsCijfers | null {
  if (!citySlug) return null
  if (!_plaatsen) {
    try {
      _plaatsen = JSON.parse(fs.readFileSync(
        path.join(REPO, 'data', 'plaats-gemeente.json'), 'utf8')).plaatsen
    } catch { _plaatsen = {} }
  }
  return _plaatsen![citySlug] ?? null
}

const nl = (n: number) => n.toLocaleString('nl-NL')

// De markt waarin dit bedrijf werkt. Alleen tonen als er genoeg cijfers zijn om
// een zin van te maken -- een blok met drie streepjes helpt niemand.
function marktHtml(city?: string, citySlug?: string): string {
  const c = plaatsCijfers(citySlug)
  if (!c || !city) return ''
  const feiten: string[] = []
  if (c.gereed != null && c.gereed_jaar) {
    feiten.push(`kwamen er in ${c.gereed_jaar} <strong>${nl(c.gereed)} nieuwbouwwoningen</strong> gereed`)
  }
  if (c.vergund != null && c.vergund > 0) {
    feiten.push(`zijn er vergunningen verleend voor <strong>${nl(c.vergund)} woningen</strong>`)
  }
  if (c.verhuizingen != null) {
    feiten.push(`verhuisden <strong>${nl(c.verhuizingen)} mensen</strong> binnen de gemeente`)
  }
  if (feiten.length < 2) return ''
  // Nette Nederlandse opsomming: komma's, en 'en' voor het laatste deel.
  const reeks = feiten.length > 1
    ? feiten.slice(0, -1).join(', ') + ' en ' + feiten[feiten.length - 1]
    : feiten[0]
  const prijs = c.prijs
    ? ` Een bestaande koopwoning kost er gemiddeld &euro;${nl(Math.round(c.prijs))}.`
    : ''
  return '<div class="divider"></div>'
    + `<h2>De markt rond ${city}</h2>`
    + `<p>Wie een vakman zoekt, doet dat zelden zonder aanleiding. In de gemeente `
    + `${c.gemeente} ${reeks}.${prijs} Dat zijn allemaal huishoudens `
    + `die op enig moment een offerte opvragen.</p>`
    + `<p style="font-size:14px;"><a href="/wonen-in/${c.slug}/">Alle cijfers over `
    + `wonen in ${c.gemeente}</a> &#8212; nieuwbouw, koopprijzen en verhuizingen, `
    + `met bron en jaartal.</p>`
}

function claimHtml(pageSlug: string, naam: string): string {
  const slug = pageSlug.replace(/^bedrijf\//, '')
  return '<div class="divider"></div>'
    + '<div style="background:#fff;border:1px solid rgba(61,46,30,0.12);border-radius:14px;'
    + 'padding:20px 22px;margin:20px 0;">'
    + '<h2 style="font-size:1.05rem;font-weight:800;color:#1A1208;margin:0 0 6px;">'
    + 'Is dit jouw bedrijf?</h2>'
    + '<p style="font-size:14px;color:rgba(61,46,30,0.72);line-height:1.65;margin:0 0 12px;">'
    + 'Dit profiel is samengesteld uit openbare bronnen. Eis het op om je gegevens, '
    + 'diensten en foto\'s zelf te beheren. Vermelding blijft gratis; activeren kost '
    + '&euro;79 per jaar voor je eigen plaats.</p>'
    + '<a href="https://app.bylder.com/vakbedrijf/claim/' + encodeURIComponent(slug)
    + '?utm_source=bylder-site&amp;utm_campaign=profiel-claim" '
    + 'style="background:#3D5A3E;color:#F5F0E8;padding:11px 22px;border-radius:10px;'
    + 'font-weight:800;font-size:14px;text-decoration:none;display:inline-flex;">'
    + 'Profiel opeisen &#8594;</a>'
    + '</div>'
}

function getBedrijfHtml(page: BadkamerPage): string {
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
  const markt = marktHtml(b.city, b.city_slug)
  const claim = claimHtml(page.slug, b.name)
  return body.replace('</main>', `${markt}${claim}${DISCLAIMER_HTML}</main>`)
}

const _hubCache: Record<string, string> = {}
function readHub(slug: string): string {
  if (!(slug in _hubCache)) {
    let body = fs.readFileSync(path.join(DATA_DIR, 'content', `${slug}.html`), 'utf8')
    if (slug === 'index') body = body.replace('</main>', `${registerLinksHtml()}</main>`)
    _hubCache[slug] = body
  }
  return _hubCache[slug]
}

// De <main>-HTML voor elk van de 4 pagina-vormen: city (bedrijvengrid), bedrijf
// (profiel), register (A-Z-overzicht, Fase 2 link-architectuur) of hub
// (self-contained, alleen 'index' in dit cluster).
export function getMainHtml(page: BadkamerPage): string {
  if (page.content_kind === 'city') return getCityHtml(page)
  if (page.content_kind === 'bedrijf') return getBedrijfHtml(page)
  if (page.content_kind === 'register') return getRegisterHtml(page)
  return readHub(page.slug)
}

// index/follow onafhankelijk uitlezen: de registerlaag (Fase 2 link-architectuur)
// staat op "noindex, follow" — noindex mag follow niet meeslepen zoals de oude
// versie hier deed (wél al zo in web/lib/kortingscode.ts).
function parseRobots(robots?: string) {
  if (!robots) return { index: true, follow: true }
  return { index: !robots.includes('noindex'), follow: !robots.includes('nofollow') }
}

export function toMetadata(page: BadkamerPage): Metadata {
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
