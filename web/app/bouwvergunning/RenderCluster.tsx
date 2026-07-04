import type { ClusterPage } from '../../lib/bouwvergunning'
import { getMainHtml, getClusterCss } from '../../lib/bouwvergunning'

// Server-component: rendert één bouwvergunning-clusterpagina. Cluster-CSS +
// JSON-LD + de resolved <main>-HTML (content-fragment met aside). Nav + Footer
// komen uit de gedeelde root-layout; de oude template-nav/footer vervallen.
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
