import type { Metadata } from 'next'
import { getPage, toMetadata } from '../../lib/wonen-in'
import RenderCluster from './RenderCluster'

// /nieuwbouw-project/ — de cluster-indexpagina (slug 'index' in pages.json).
export function generateMetadata(): Metadata {
  const page = getPage('index')!
  return toMetadata(page)
}

export default function WonenInIndex() {
  const page = getPage('index')!
  return <RenderCluster page={page} />
}
