import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/project'

// /project/ (index), /project/<type>/ (hub) en /project/<type>/<stad>/ (vakstad)
// in één optionele catch-all. Nav + Footer uit de gedeelde layout; de oude
// template-nav en de mini-footer (waarvan de contextuele links al in de body
// staan) vervallen. Phosphor-iconfont zoals in de bron.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function ProjectPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))!
  const css = getShellCss(page.template)
  const main = getMainHtml(page)
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
    </>
  )
}
