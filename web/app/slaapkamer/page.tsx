import type { Metadata } from 'next'
import { getPage, toMetadata } from '../../lib/slaapkamer'
import RenderCluster from './RenderCluster'

// /slaapkamer/ — de pillar (slug 'index' in pages.json).
export function generateMetadata(): Metadata {
  return toMetadata(getPage('index')!) as Metadata
}

export default function SlaapkamerIndex() {
  return <RenderCluster page={getPage('index')!} />
}
