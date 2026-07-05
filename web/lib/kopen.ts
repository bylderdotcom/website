// Fase 2 — data-gedreven vakstad-cluster /kopen/ (33.014 pagina's, grootste cluster).
// Zelfde vakstad-mechanisme als /project/ (zie web/lib/project.ts), maar dieper:
// slug = categorie/subcategorie/gemeente (depth 3) i.p.v. type/gemeente. Content-
// template-namen en hub-fragmentbestanden gebruiken "__" als scheider voor het
// categorie/subcategorie-deel van de slug. Leest de canonieke datalaag op
// build-time; alleen de renderlaag migreert. Server/build-only (fs).

import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'kopen'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type KopenPage = {
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
  template: string // shell-variant (default/v2/v3/v4) — bepaalt de head-<style>
  ldjson: string[]
  content_kind: 'vakstad' | null
}

type Vakstad = { city: string; city_slug: string; prov: string; prov_slug: string; template: string }

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
}

let _pages: KopenPage[] | null = null
export function getPages(): KopenPage[] {
  if (!_pages) _pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
  return _pages!
}

let _vaksteden: Record<string, Vakstad> | null = null
function getVaksteden(): Record<string, Vakstad> {
  if (!_vaksteden) _vaksteden = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'vaksteden.json'), 'utf8'))
  return _vaksteden!
}

export function getPage(slug: string): KopenPage | undefined {
  return getPages().find(p => p.slug === slug)
}

// Head-<style> per shell-variant (default/v2/v3/v4).
const _cssCache: Record<string, string> = {}
export function getShellCss(templateField: string): string {
  if (!(templateField in _cssCache)) {
    const tpl = fs.readFileSync(path.join(TPL_DIR, `template.${templateField}.html`), 'utf8')
    const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    _cssCache[templateField] = m ? m[1] : ''
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
  // Hub-fragmentbestanden gebruiken "__" i.p.v. "/" tussen categorie en subcategorie
  // (bv. slug "binnendeuren/glazen-binnendeur" → content/binnendeuren__glazen-binnendeur.html).
  const file = slug.replace(/\//g, '__')
  if (!(file in _hubCache)) _hubCache[file] = fs.readFileSync(path.join(DATA_DIR, 'content', `${file}.html`), 'utf8')
  return _hubCache[file]
}

// De <main>-HTML: vakstad → content-template met stad/provincie ingevuld;
// hub (content_kind null) → self-contained content-fragment.
export function getMainHtml(page: KopenPage): string {
  if (page.content_kind === 'vakstad') {
    const v = getVaksteden()[page.slug]
    let body = readTpl(`content.vakstad.${v.template}.html`)
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
  if (robots.includes('noindex')) return { index: false, follow: false }
  const r: any = { index: true, follow: true }
  if (robots.includes('max-snippet:-1')) r['max-snippet'] = -1
  if (robots.includes('max-image-preview:large')) r['max-image-preview'] = 'large'
  if (robots.includes('max-video-preview:-1')) r['max-video-preview'] = -1
  return r
}

export function toMetadata(page: KopenPage) {
  const url = SITE + page.path
  const title = decodeEntities(page.title)
  const description = decodeEntities(page.description)
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: parseRobots(page.robots),
    openGraph: {
      type: (page.og_type as any) || 'website',
      title: decodeEntities(page.og_title || page.title),
      description: decodeEntities(page.og_description || page.description),
      url,
      ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
    },
    ...(page.twitter_card ? { twitter: { card: page.twitter_card as 'summary_large_image' } } : {}),
  } satisfies Metadata
}

// slug 'index' → [] (de /kopen/-root); 'cat/sub/stad' → ['cat','sub','stad'].
export function slugToSegments(slug: string): string[] {
  return slug === 'index' ? [] : slug.split('/')
}
export function segmentsToSlug(segments?: string[]): string {
  return segments && segments.length ? segments.join('/') : 'index'
}
