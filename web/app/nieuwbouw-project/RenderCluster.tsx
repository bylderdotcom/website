import type { ClusterPage } from '../../lib/nieuwbouw-project'
import { getMainHtml, getClusterCss } from '../../lib/nieuwbouw-project'
import { verrijkProject } from '../../lib/project-aanbod'
import { aantalMerken } from '../../lib/merken'
import AanbodStrook from '../components/AanbodStrook'

// Server-component: rendert één nieuwbouw-project-clusterpagina. Cluster-CSS +
// JSON-LD + de <main>-HTML. Nav + Footer komen uit de gedeelde root-layout.
//
// Commerciële stappen (11-10-2026): verrijkProject zet plinten, ledenkorting en Auping met
// foto in de pagina, en de gietvloerknop naar de ontwerper. Onderaan de AanbodStrook.
// De <main>-tags van het fragment gaan eruit: de layout levert de <main> al.
export default function RenderCluster({ page }: { page: ClusterPage }) {
  const css = getClusterCss()
  const main = verrijkProject(getMainHtml(page), page.slug)
    .replace(/<main[^>]*>/, '').replace(/<\/main>(?![\s\S]*<\/main>)/, '')
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
      <div className="container">
        <AanbodStrook merken={aantalMerken()} titel="Alles wat je via Bylder regelt" marge="8px 0 56px" />
      </div>
    </>
  )
}
