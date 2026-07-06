import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/dakkapel'
import InteractiveScripts from '../InteractiveScripts'

// /dakkapel/ (index-hub), /dakkapel/<stad>/ (bedrijvengrid) en
// /dakkapel/bedrijf/<slug>/ (bedrijfsprofiel) in één optionele catch-all.
// LAATSTE city+bedrijf-cluster — clone van /gietvloer/ (zie web/lib/dakkapel.ts)
// — simpelste vorm (zoals badkamer): geen city_alt/name_alt, geen ontbrekende
// city/maps_href-velden, geen extra card-vormen. Nav + Footer uit de gedeelde
// layout; de disclaimer uit de oude cluster-footer is behouden als
// contentregel op city/bedrijf-pagina's.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function DakkapelPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))!
  const css = getShellCss()
  const main = getMainHtml(page)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
      <InteractiveScripts />
    </>
  )
}
