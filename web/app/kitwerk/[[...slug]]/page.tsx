import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/kitwerk'
import MetCommercieleStap from '../../components/MetCommercieleStap'
import { zonderUitgeslotenLd } from '@/lib/uitgesloten'

// /kitwerk/ (hub), /kitwerk/<stad>/ en /kitwerk/bedrijf/<slug>/. Zie web/lib/kitwerk.ts.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function KitwerkPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))!
  const css = getShellCss()
  const main = getMainHtml(page)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {zonderUitgeslotenLd('kitwerk', page.ldjson).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      {/* Commerciële stap per vak: web/lib/aanbod.ts */}
      <MetCommercieleStap html={main} pad={`kitwerk/${page.slug}`} />
    </>
  )
}
