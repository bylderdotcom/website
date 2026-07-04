import type { Metadata } from 'next'
import { getPage, toMetadata } from '../../lib/bouwvergunning'
import RenderCluster from './RenderCluster'

// /bouwvergunning/ — de cluster-indexpagina (slug 'index' in pages.json).
export function generateMetadata(): Metadata {
  const page = getPage('index')!
  return toMetadata(page)
}

export default function BouwvergunningIndex() {
  const page = getPage('index')!
  return <RenderCluster page={page} />
}
