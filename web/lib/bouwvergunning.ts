// Fase 2 — data-gedreven cluster-renderer voor /bouwvergunning/.
// Leest de CANONIEKE datalaag op build-time (single source of truth): de
// `data/clusters/bouwvergunning/`-JSON + content-fragmenten en de gedeelde
// `templates/clusters/bouwvergunning/`-CSS + aside-fragmenten. Zo migreert alleen
// de renderlaag (Python-template → Next-route); de content/SEO-data blijft één bron.
// Alleen op build/server gebruikt (fs) — nooit in een client-component importeren.

import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.bylder.com'
const CLUSTER = 'bouwvergunning'
const REPO = path.join(process.cwd(), '..') // build.sh draait in web/, dus .. = repo-root
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
  aside?: string | null
  ldjson: string[]
  ldjson_sep?: string
}

// Alleen &amp; komt voor in de titel/description-velden (uit HTML geëxtraheerd).
// Metadata-velden moeten platte tekst zijn; Next her-encodeert zelf naar HTML.
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

const _asideCache: Record<string, string> = {}
function asideFragment(variant: string): string {
  if (!(variant in _asideCache)) {
    _asideCache[variant] = fs.readFileSync(path.join(TPL_DIR, `aside.${variant}.html`), 'utf8')
  }
  return _asideCache[variant]
}

// De volledige <main>-HTML voor een pagina: het content-fragment met {{aside}}
// vervangen door de gekozen aside-variant (project/thema), of ongewijzigd als de
// pagina geen aside heeft (check, index) — exact zoals render_page in Python doet.
export function getMainHtml(page: ClusterPage): string {
  let main = fs.readFileSync(path.join(DATA_DIR, 'content', `${page.slug}.html`), 'utf8')
  if (page.aside) main = main.replace('{{aside}}', asideFragment(page.aside))
  return main
}

// De cluster-CSS uit de gedeelde template (identiek voor default én v2).
let _css: string | null = null
export function getClusterCss(): string {
  if (_css === null) {
    const tpl = fs.readFileSync(path.join(TPL_DIR, 'template.default.html'), 'utf8')
    const m = tpl.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    _css = m ? m[1] : ''
  }
  return _css
}

// pages.json-velden → Next Metadata. Entities gedecodeerd; og_image/twitter_card
// alleen als de bron ze zet.
export function toMetadata(page: ClusterPage) {
  const url = SITE + page.path
  const title = decodeEntities(page.title)
  const description = decodeEntities(page.description)
  const meta: any = {
    title,
    description,
    alternates: { canonical: url },
    robots: page.robots?.includes('noindex') ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: (page.og_type as any) || 'article',
      title,
      description,
      url,
      ...(page.og_image ? { images: [{ url: page.og_image }] } : {}),
    },
    ...(page.twitter_card ? { twitter: { card: page.twitter_card } } : {}),
  }
  return meta
}
