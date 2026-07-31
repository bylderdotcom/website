import type { ClusterPage } from '../../lib/wonen-in'
import { getMainHtml, getClusterCss } from '../../lib/wonen-in'

// Server-component: rendert één nieuwbouw-project-clusterpagina. Cluster-CSS +
// JSON-LD + de <main>-HTML. Nav + Footer komen uit de gedeelde root-layout.
export default function RenderCluster({ page }: { page: ClusterPage }) {
  const css = getClusterCss()
  const main = getMainHtml(page)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
    </>
  )
}
