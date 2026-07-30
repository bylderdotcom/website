import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { paginaRuimtes, getRuimte, renderRuimte, metadataVoor, ldjsonVoor, getRuimteCss } from '../../../lib/ruimtes'

// Alleen ruimtes met status 'pagina' krijgen een URL. De andere 22 bestaan in de
// ontologie voor de agent en de tools, maar publiceren we niet — bewuste
// indexatie, zoals bij de vakbedrijf-profielen.
export function generateStaticParams() {
  return paginaRuimtes().map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const r = getRuimte(slug)
  return r ? (metadataVoor(r) as Metadata) : {}
}

export default async function RuimtePagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = getRuimte(slug)
  if (!r || r.status !== 'pagina') notFound()
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getRuimteCss() }} />
      {ldjsonVoor(r).map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: b }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: renderRuimte(r) }} />
    </>
  )
}
