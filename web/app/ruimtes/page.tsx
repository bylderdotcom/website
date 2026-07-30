import type { Metadata } from 'next'
import { alleRuimtes, renderIndex, getRuimteCss } from '../../lib/ruimtes'

const SITE = 'https://www.bylder.com'

export const metadata: Metadata = {
  title: 'Elke ruimte in huis, en wat je er beslist | Bylder',
  description: 'Van zolder tot bijkeuken en van meterkast tot dakterras: per woonruimte de beslissingen die er vallen, wat er het vaakst misgaat en wie het werk doet.',
  alternates: { canonical: `${SITE}/ruimtes/` },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', title: 'Elke ruimte in huis, en wat je er beslist', url: `${SITE}/ruimtes/` },
}

// ItemList over de hele ontologie: laat een zoekmachine in één blok zien welke
// ruimtes we dekken, inclusief de ruimtes zonder eigen pagina.
function ldjson() {
  const alle = alleRuimtes()
  return [
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: 'Woonruimtes', numberOfItems: alle.length,
      itemListElement: alle.map((r, i) => ({
        '@type': 'ListItem', position: i + 1, name: r.naam, description: r.kern,
        ...(r.status === 'pagina' ? { url: SITE + (r.pagina_pad ?? `/ruimtes/${r.slug}/`) } : {}),
      })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Ruimtes', item: `${SITE}/ruimtes/` },
      ],
    },
  ]
}

export default function RuimtesIndex() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getRuimteCss() }} />
      {ldjson().map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b, null, 2) }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: renderIndex() }} />
    </>
  )
}
