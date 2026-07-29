// Data-gedreven cluster-renderer voor /slaapkamer/.
// Zelfde patroon als lib/gereedschap-lenen.ts, met één verschil: dit cluster kent
// geneste paden (/slaapkamer/matras-materialen/schuim/), dus de slug mag een
// schuine streep bevatten en de route is een catch-all. Content-bestanden gebruiken
// een dubbele underscore in plaats van die streep, zoals elders in de repo.
// Alleen build/server (fs) — nooit in een client-component importeren.

import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'slaapkamer'
const REPO = path.join(process.cwd(), '..')
const DATA_DIR = path.join(REPO, 'data', 'clusters', CLUSTER)
const TPL_DIR = path.join(REPO, 'templates', 'clusters', CLUSTER)

export type ClusterPage = {
  slug: string
  path: string
  title: string
  description: string
  og_type?: string
  og_image?: string
  twitter_card?: string
  robots?: string
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

let _pages: ClusterPage[] | null = null
export function getPages(): ClusterPage[] {
  if (!_pages) _pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf8'))
  return _pages!
}

export function getPage(slug: string): ClusterPage | undefined {
  return getPages().find(p => p.slug === slug)
}

export function getMainHtml(page: ClusterPage): string {
  const bestand = `${page.slug.replace(/\//g, '__')}.html`
  return fs.readFileSync(path.join(DATA_DIR, 'content', bestand), 'utf8')
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

export function toMetadata(page: ClusterPage) {
  const url = SITE + page.path
  const title = decodeEntities(page.title)
  const description = decodeEntities(page.description)
  const meta: Record<string, unknown> = {
    title,
    description,
    alternates: { canonical: url },
    robots: page.robots?.includes('noindex') ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: page.og_type || 'article',
      title,
      description,
      url,
      ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
    },
    ...(page.twitter_card ? { twitter: { card: page.twitter_card } } : {}),
  }
  return meta
}
