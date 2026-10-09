import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/gietvloer'
import InteractiveScripts from '../InteractiveScripts'
import { zonderUitgeslotenLd } from '@/lib/uitgesloten'
import GietvloerCTA from '../../components/GietvloerCTA'

// /gietvloer/ (index-hub), /gietvloer/<stad>/ (bedrijvengrid) en
// /gietvloer/bedrijf/<slug>/ (bedrijfsprofiel) in één optionele catch-all.
// Eerste city+bedrijf-cluster: nieuwe render-vorm t.o.v. vakstad (project/kopen).
// Nav + Footer uit de gedeelde layout; de disclaimer uit de oude cluster-footer
// is behouden als contentregel op city/bedrijf-pagina's (web/lib/gietvloer.ts).
// InteractiveScripts herbedraadt de kostencalculator + sorteer-dropdown.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function GietvloerPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))!
  const css = getShellCss()
  const main = getMainHtml(page)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {zonderUitgeslotenLd('gietvloer', page.ldjson).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
      {!page.slug.startsWith('bedrijf/') && (
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px' }}>
          <GietvloerCTA aanleiding="Upload een foto van een gietvloer die je mooi vindt. Wij lezen de kleur en de glans, je kiest de ruimtes in je woning, en Dr. Schutz stuurt tot drie stalen gratis." />
        </div>
      )}
      <InteractiveScripts />
    </>
  )
}
