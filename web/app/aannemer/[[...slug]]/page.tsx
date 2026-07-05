import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/aannemer'
import InteractiveScripts from '../InteractiveScripts'

// /aannemer/ (index-hub), /aannemer/<stad>/ (bedrijvengrid) en
// /aannemer/bedrijf/<slug>/ (bedrijfsprofiel) in één optionele catch-all.
// City+bedrijf-cluster, clone van /gietvloer/ (zie web/lib/aannemer.ts voor de
// verschillen: geen extra card-vormen, één bedrijf zonder city/city_slug).
// Nav + Footer uit de gedeelde layout; de disclaimer uit de oude cluster-footer
// is behouden als contentregel op city/bedrijf-pagina's.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function AannemerPage({ params }: { params: Promise<{ slug?: string[] }> }) {
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
