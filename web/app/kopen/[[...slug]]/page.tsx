import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/kopen'

// /kopen/ (index), /kopen/<cat>/ + /kopen/<cat>/<subcat>/ (hubs) en
// /kopen/<cat>/<subcat>/<stad>/ (vakstad, depth 3) in één optionele catch-all.
// Zelfde patroon als /project/ (zie web/app/project/[[...slug]]/page.tsx), maar
// dieper genest — 33.014 pagina's, het grootste cluster. Nav + Footer uit de
// gedeelde layout; de oude template-nav en mini-footer (contextuele links staan
// al in de body) vervallen. Phosphor-iconfont zoals in de bron.

export function generateStaticParams() {
  return getPages().map(p => ({ slug: slugToSegments(p.slug) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(segmentsToSlug(slug))
  return page ? toMetadata(page) : {}
}

export default async function KopenPage({ params }: { params: Promise<{ slug?: string[] }> }) {
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
