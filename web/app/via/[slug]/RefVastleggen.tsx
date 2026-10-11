'use client'

import { useEffect } from 'react'
import { legRefVast } from '../../components/aanbreng'

/** Wie deze pagina opent, hoort bij deze vakman (de eerste wint). */
export default function RefVastleggen({ slug }: { slug: string }) {
  useEffect(() => { legRefVast(slug) }, [slug])
  return null
}
