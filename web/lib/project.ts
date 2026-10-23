// Fase 2 — data-gedreven vakstad-cluster /project/ (5641 pagina's).
// Vorm: per pagina-type een content-template met {{city}}/{{prov}}-placeholders,
// gerenderd over ~270 gemeenten (data in vaksteden.json). Leest de CANONIEKE
// datalaag op build-time; alleen de renderlaag migreert. Server/build-only (fs).

import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { metKennisbank } from './kennisbank-links'
import { zonderOudKopstuk, zonderKaleNavRegel } from './oud-kopstuk'
import { RASTER_SJABLOON_CSS } from './raster'
import { KLUSSEN, lokaal, lokaalHtml, vragen } from './klus-lokaal'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'project'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type ProjectPage = {
  slug: string
  path: string
  title: string
  description: string
  og_type?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_card?: string
  robots?: string
  template: string // shell-variant (default/v2/v3) — bepaalt de head-<style>
  ldjson: string[]
  content_kind: 'vakstad' | null
}

type Vakstad = { city: string; city_slug: string; prov: string; prov_slug: string; template: string }

/** Waar page.tsx de commerciële stap (CommercieleStap) tussen de HTML zet. */
export const STAP_PLEK = '<!--klus-stap-->'

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
}

let _pages: ProjectPage[] | null = null
export function getPages(): ProjectPage[] {
  if (!_pages) _pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
  return _pages!
}

let _vaksteden: Record<string, Vakstad> | null = null
function getVaksteden(): Record<string, Vakstad> {
  if (!_vaksteden) _vaksteden = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vaksteden.json'), 'utf8'))
  return _vaksteden!
}

export function getPage(slug: string): ProjectPage | undefined {
  return getPages().find(p => p.slug === slug)
}

// Head-<style> per shell-variant (default/v2/v3). Anders dan bouwvergunning
// verschillen de shells hier, dus per pagina de juiste CSS pakken.
const _cssCache: Record<string, string> = {}
export function getShellCss(templateField: string): string {
  if (!(templateField in _cssCache)) {
    const tpl = fs.readFileSync(path.join(TPL_DIR, `template.${templateField}.html`), 'utf8')
    const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    // Na de sjabloonstijl: container op het raster van het menu (lib/raster.ts).
    _cssCache[templateField] = m ? zonderKaleNavRegel(m[1]) + RASTER_SJABLOON_CSS : ''
  }
  return _cssCache[templateField]
}

const _tplCache: Record<string, string> = {}
function readTpl(rel: string): string {
  if (!(rel in _tplCache)) _tplCache[rel] = fs.readFileSync(path.join(TPL_DIR, rel), 'utf8')
  return _tplCache[rel]
}
const _hubCache: Record<string, string> = {}
function readHub(slug: string): string {
  if (!(slug in _hubCache)) _hubCache[slug] = zonderOudKopstuk(
    fs.readFileSync(path.join(DATA_DIR, 'content', `${slug}.html`), 'utf8'))
  return _hubCache[slug]
}

// De <main>-HTML: vakstad → content-template met stad/provincie ingevuld;
// hub (content_kind null) → self-contained content-fragment.
function getMainHtmlRaw(page: ProjectPage): string {
  if (page.content_kind === 'vakstad') {
    const v = getVaksteden()[page.slug]
    // Ook hier het ingebakken menu eruit — dit pad sloeg het knipwerk over.
    let body = zonderOudKopstuk(readTpl(`content.vakstad.${v.template}.html`))
    // De prijzen zijn landelijk; "gecorrigeerd voor regio" klopte niet (23-10-2026).
    body = body.replace('Bylder vergelijkt jouw offerte automatisch met deze prijzen, gecorrigeerd voor regio {{prov}}.',
      'Landelijke richtprijzen 2026. Bylder vergelijkt jouw offerte met deze prijzen; lokaal kan het afwijken.')
    // Lokale inhoud en de commerciële stap direct onder de prijzen (zie klus-lokaal.ts). De
    // stap is React en komt in page.tsx op de plek van STAP_PLEK; de sections staan hier op
    // het hoogste niveau, dus knippen daar breekt geen element.
    const [klus] = page.slug.split('/')
    const l = lokaal(klus, v.city_slug, v.city)
    const eindPrijzen = body.indexOf('</section>', body.indexOf('id="prijzen"'))
    if (eindPrijzen > 0) {
      const na = eindPrijzen + '</section>'.length
      body = body.slice(0, na) + (l ? lokaalHtml(l) : '') + STAP_PLEK + body.slice(na)
    }
    body = body
      .replaceAll('{{city}}', v.city)
      .replaceAll('{{city_slug}}', v.city_slug)
      .replaceAll('{{prov}}', v.prov)
      .replaceAll('{{prov_slug}}', v.prov_slug)
    return body
  }
  return readHub(page.slug)
}

function parseRobots(robots?: string) {
  if (!robots) return { index: true, follow: true }
  // noindex mag follow niet meeslepen: de bestaande-bouw-klussen staan op noindex, maar hun
  // links naar de andere klussen en de vakbedrijven moeten blijven tellen (23-10-2026).
  if (robots.includes('noindex')) return { index: false, follow: !robots.includes('nofollow') }
  const r: any = { index: true, follow: true }
  if (robots.includes('max-snippet:-1')) r['max-snippet'] = -1
  if (robots.includes('max-image-preview:large')) r['max-image-preview'] = 'large'
  if (robots.includes('max-video-preview:-1')) r['max-video-preview'] = -1
  return r
}

/** Titel en omschrijving op de zoekopdracht ("badkamer renovatie utrecht kosten"), met wat er
 *  lokaal te vinden is. Alleen voor de klussen in KLUSSEN; de rest houdt de oude titel. */
function lokaleMeta(page: ProjectPage): { title: string; description: string } | null {
  if (page.content_kind !== 'vakstad') return null
  const v = getVaksteden()[page.slug], [klus] = page.slug.split('/')
  const l = KLUSSEN[klus] ? lokaal(klus, v.city_slug, v.city) : null
  if (!l) return null
  const n = l.bedrijven.reduce((s, b) => s + b.totaal, 0)
  const kort = l.klus.naam.toLowerCase()
  const opties = [
    n ? `${l.klus.naam} ${v.city}: kosten 2026 en ${n} vakbedrijven | Bylder` : '',
    l.winkelsTotaal ? `${l.klus.naam} ${v.city}: kosten 2026 en ${l.winkelsTotaal} showrooms | Bylder` : '',
    `${l.klus.naam} ${v.city}: kosten 2026 | Bylder`,
  ].filter(Boolean)
  const title = opties.find(t => t.length <= 68) ?? opties[opties.length - 1]
  const stukken = [
    n ? `${n} ${l.bedrijven.map(b => b.wie).join(' en ')} met reviews` : '',
    l.winkelsTotaal ? `${l.winkelsTotaal} winkels voor ${l.klus.winkelsLabel} binnen 15 km` : '',
  ].filter(Boolean)
  const description = `Wat kost ${kort} in ${v.city}? Richtprijzen 2026${stukken.length ? ', ' + stukken.join(', ') : ''}. ` +
    `Laat je offerte gratis checken en krijg ledenkorting.`
  return { title, description }
}

/** De JSON-LD van de pagina, met de lokale vragen erbij in het FAQ-schema. */
export function getLdjson(page: ProjectPage): string[] {
  if (page.content_kind !== 'vakstad') return page.ldjson
  const v = getVaksteden()[page.slug], [klus] = page.slug.split('/')
  const l = KLUSSEN[klus] ? lokaal(klus, v.city_slug, v.city) : null
  const extra = l ? vragen(l) : []
  if (!extra.length) return page.ldjson
  return page.ldjson.map(block => {
    try {
      const d = JSON.parse(block)
      if (d['@type'] !== 'FAQPage') return block
      d.mainEntity = [...(d.mainEntity ?? []), ...extra.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))]
      return JSON.stringify(d)
    } catch { return block }
  })
}

export function toMetadata(page: ProjectPage) {
  const url = SITE + page.path
  const lok = lokaleMeta(page)
  const title = lok?.title ?? decodeEntities(page.title)
  const description = lok?.description ?? decodeEntities(page.description)
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: parseRobots(page.robots),
    openGraph: {
      type: (page.og_type as any) || 'website',
      title: lok?.title ?? decodeEntities(page.og_title || page.title),
      description: lok?.description ?? decodeEntities(page.og_description || page.description),
      url,
      ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
    },
    ...(page.twitter_card ? { twitter: { card: page.twitter_card as 'summary_large_image' } } : {}),
  } satisfies Metadata
}

// slug 'index' → [] (de /project/-root); 'type/stad' → ['type','stad'].
export function slugToSegments(slug: string): string[] {
  return slug === 'index' ? [] : slug.split('/')
}
export function segmentsToSlug(segments?: string[]): string {
  return segments && segments.length ? segments.join('/') : 'index'
}

// Kennisbank-links erbij (zie kennisbank-links.ts voor de aanleiding).
export function getMainHtml(page: ProjectPage): string {
  return metKennisbank(getMainHtmlRaw(page), 'project')
}
