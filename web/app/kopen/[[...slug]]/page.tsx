import type { Metadata } from 'next'
import CommercieleStap from '../../components/CommercieleStap'
import { getPages, getPage, getMainHtml, getShellCss, toMetadata, slugToSegments, segmentsToSlug } from '../../../lib/kopen'

// /kopen/ (index), /kopen/<cat>/ + /kopen/<cat>/<subcat>/ (hubs) en
// /kopen/<cat>/<subcat>/<stad>/ (vakstad, depth 3) in één optionele catch-all.
// Zelfde patroon als /project/ (zie web/app/project/[[...slug]]/page.tsx), maar
// dieper genest — 33.014 pagina's, het grootste cluster. Nav + Footer uit de
// gedeelde layout; de oude template-nav en mini-footer (contextuele links staan
// al in de body) vervallen. Phosphor-iconfont zoals in de bron.

export function generateStaticParams() {
  // /kopen/vloeren/ heeft een eigen pagina (web/app/kopen/vloeren/page.tsx);
  // die gaat voor, dus hier niet nog een keer genereren.
  const EIGEN = new Set(['vloeren'])
  return getPages().filter(p => !EIGEN.has(p.slug)).map(p => ({ slug: slugToSegments(p.slug) }))
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
  // De commerciële stap (web/lib/aanbod.ts) direct na de kop, waar hij op een telefoon in het
  // eerste scherm staat; de strook met al het aanbod onderaan.
  // Knippen mag pas zonder de <main>-tags van de bron: anders sluit de browser die halverwege.
  // De layout levert de <main> al.
  const html = main.replace(/<main[^>]*>/, '').replace(/<\/main>(?![\s\S]*<\/main>)/, '')
  // Knip vóór de tweede sectie: de kop zit in een eigen <div class="c">, dus direct na de
  // eerste </section> knippen zou die wrapper open laten.
  const knip = html.indexOf('<section', html.indexOf('</section>'))
  const [kop, rest] = knip > 0 ? [html.slice(0, knip), html.slice(knip)] : ['', html]
  const pad = `kopen/${page.slug === 'index' ? '' : page.slug}`
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      {kop && <div dangerouslySetInnerHTML={{ __html: kop }} />}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <CommercieleStap pad={pad} alleen="stap" marge="28px 0 32px" />
      </div>
      <div dangerouslySetInnerHTML={{ __html: rest }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <CommercieleStap pad={pad} alleen="strook" marge="40px 0 56px" />
      </div>
    </>
  )
}
