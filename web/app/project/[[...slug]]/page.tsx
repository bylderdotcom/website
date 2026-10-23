import type { Metadata } from 'next'
import { getPages, getPage, getMainHtml, getShellCss, getLdjson, toMetadata, slugToSegments, segmentsToSlug, STAP_PLEK } from '../../../lib/project'
import CommercieleStap from '../../components/CommercieleStap'

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
  const [voor, na] = main.split(STAP_PLEK)
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {getLdjson(page).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      {/* Commerciële stap per klus (web/lib/aanbod.ts, 'project/<klus>'): op een kluspagina
          direct onder de prijzen en de lokale inhoud, elders onderaan. De strook altijd onderaan. */}
      {main.includes(STAP_PLEK) ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: voor }} />
          <div className="container"><CommercieleStap pad={`project/${page.slug}`} alleen="stap" marge="8px 0 32px" /></div>
          <div dangerouslySetInnerHTML={{ __html: na }} />
        </>
      ) : (
        <>
          <div dangerouslySetInnerHTML={{ __html: main }} />
          <div className="container"><CommercieleStap pad={`project/${page.slug}`} alleen="stap" marge="32px 0 0" /></div>
        </>
      )}
      <div className="container"><CommercieleStap pad={`project/${page.slug}`} alleen="strook" marge="40px 0 24px" /></div>
    </>
  )
}
