import type { Metadata } from 'next'
import { KORTINGSCODE_MAIN_HTML } from './mainHtml'

// Getrouwe port van /kortingscode/index.html (Fase 1B).
// Deze hub is een data-gegenereerde index van 522 merk-tegels over 35
// categorieën, zonder eigen JS-interactiviteit (de "code"-badge is een statische
// pill; de daadwerkelijke code zit achter login op de merk-subpagina). Om geen
// enkele merknaam/slug met de hand fout over te typen (merk-gevoelig + linkrisico)
// wordt de exacte <main>-inhoud byte-getrouw via dangerouslySetInnerHTML gerenderd.
// De body gebruikt alleen eigen classes (container/grid-cards/brandcard) — géén
// Tailwind — dus de Tailwind-CDN uit de bron is niet nodig. Nav + Footer komen uit
// de gedeelde layout; de pagina-eigen footer wordt daardoor vervangen.

const TITLE = 'Kortingscodes voor je nieuwe woning — merken & winkels | Bylder'
const DESC =
  'Actuele kortingscodes voor 522+ woon-, interieur- en bouwmerken. Van schakelaars tot keukens en meubels — bespaar op de afwerking van je nieuwbouw of verbouwing met Bylder.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  authors: [{ name: 'Bylder Nederland B.V.' }],
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  alternates: {
    canonical: 'https://www.bylder.com/kortingscode/',
    languages: { nl: 'https://www.bylder.com/kortingscode/' },
  },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESC,
    url: 'https://www.bylder.com/kortingscode/',
    locale: 'nl_NL',
  },
  twitter: { card: 'summary_large_image' },
}

const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Kortingscodes voor je nieuwe woning',
  description: DESC,
  url: 'https://www.bylder.com/kortingscode/',
  isPartOf: { '@type': 'WebSite', name: 'Bylder', url: 'https://www.bylder.com' },
}

const CSS = `
.kc-main *{box-sizing:border-box}
.kc-main{color:#3D2E1E}
.kc-main .container{width:100%;max-width:1100px;margin:0 auto;padding-left:48px;padding-right:48px}
.kc-main .brandcard{background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:12px;padding:14px 16px;text-decoration:none;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:border-color .2s}
.kc-main .brandcard:hover{border-color:#3D5A3E}
@media(max-width:768px){.kc-main .container{padding-left:20px;padding-right:20px}.kc-main .grid-cards{grid-template-columns:1fr 1fr!important}}
`

export default function KortingscodePage() {
  return (
    <>
      <link rel="sitemap" type="application/xml" href="/kortingscode-sitemap.xml" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <div className="kc-main" dangerouslySetInnerHTML={{ __html: KORTINGSCODE_MAIN_HTML }} />
    </>
  )
}
