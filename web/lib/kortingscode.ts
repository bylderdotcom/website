// Fase 2 — data-gedreven cluster-renderer voor /kortingscode/<merk>/ (523
// individuele merk-subpagina's; de index-hub zelf is al geport in Fase 1B als
// hardcoded web/app/kortingscode/page.tsx — de 'index'-entry in pages.json
// wordt hier dan ook overgeslagen). "Simpel"-vorm zoals bouwvergunning: één
// content-fragment per pagina, geen aside (altijd null), één template/footer-
// variant. Enige bijzonderheid: dit cluster komt uit de oudere Fase 1B-
// generator en heeft de site-nav ZELF ingebakken in het content-fragment
// (`<nav class="glass-nav">…</nav>` vóór `<main>`) — de nieuwere
// generate_cluster.py-clusters (bouwvergunning e.v.) laten dat al weg. Omdat
// Nav al uit de gedeelde root-layout komt, snijden we hier alles vóór `<main`
// weg i.p.v. het hele fragment te hergebruiken.
// Leest de canonieke datalaag op build-time; alleen de renderlaag migreert.
// Server/build-only (fs).

import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'kortingscode'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type KortingscodePage = {
  slug: string
  path: string
  title: string
  description: string
  og_type?: string
  twitter_card?: string
  robots?: string
  aside?: string | null
  ldjson: string[]
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

let _pages: KortingscodePage[] | null = null
export function getPages(): KortingscodePage[] {
  if (!_pages) {
    const all: KortingscodePage[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
    _pages = all.filter(p => p.slug !== 'index') // index-hub is al geport, apart van dit cluster
  }
  return _pages!
}

export function getPage(slug: string): KortingscodePage | undefined {
  return getPages().find(p => p.slug === slug)
}

// Het content-fragment bevat vóór <main> nog de site-nav uit de oude
// Fase 1B-generator; die vervalt (Nav komt uit de gedeelde layout). Elk
// fragment heeft precies één <main>...</main> gevolgd door een cosmetische
// warm-divider — die blijft staan, exact zoals de bron.
export function getMainHtml(page: KortingscodePage): string {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'content', `${page.slug}.html`), 'utf8')
  const idx = raw.indexOf('<main')
  return idx === -1 ? raw : raw.slice(idx)
}

let _css: string | null = null
export function getClusterCss(): string {
  if (_css === null) {
    const tpl = fs.readFileSync(path.join(TPL_DIR, 'template.default.html'), 'utf8')
    const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    _css = m ? m[1] : ''
  }
  return _css
}

// Getrouwe robots-parse: merken zonder actieve code staan op "noindex, follow"
// (dun/near-duplicate tot er een echte deal is — standing order), de rest op
// "index, follow, max-snippet:-1, max-image-preview:large". follow moet dus
// onafhankelijk van index uit de bron komen, niet eraan gekoppeld worden.
function parseRobots(robots?: string) {
  if (!robots) return { index: true, follow: true }
  return {
    index: !robots.includes('noindex'),
    follow: !robots.includes('nofollow'),
    ...(robots.includes('max-snippet:-1') ? { 'max-snippet': -1 } : {}),
    ...(robots.includes('max-image-preview:large') ? { 'max-image-preview': 'large' as const } : {}),
  }
}

export function toMetadata(page: KortingscodePage) {
  const url = SITE + page.path
  const title = decodeEntities(page.title)
  const description = decodeEntities(page.description)
  const meta: any = {
    title,
    description,
    alternates: { canonical: url },
    robots: parseRobots(page.robots),
    openGraph: {
      type: (page.og_type as any) || 'website',
      title,
      description,
      url,
    },
    ...(page.twitter_card ? { twitter: { card: page.twitter_card } } : {}),
  }
  return meta
}
