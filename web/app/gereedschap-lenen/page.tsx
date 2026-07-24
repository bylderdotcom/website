import type { Metadata } from 'next'
import { getPage, toMetadata } from '../../lib/gereedschap-lenen'
import RenderCluster from './RenderCluster'

// /gereedschap-lenen/ — de cluster-indexpagina (slug 'index' in pages.json).
export function generateMetadata(): Metadata {
  const page = getPage('index')!
  return toMetadata(page)
}

export default function GereedschapLenenIndex() {
  const page = getPage('index')!
  return <RenderCluster page={page} />
}
