'use client'

import { useEffect } from 'react'
import { meet } from './meet'

// Telt klikken op links met data-meet="<plek>" (bv. de afwerkverwijzing onder de commerciële
// stap). Eén luisteraar voor de hele site, zodat server-componenten geen eigen JS nodig hebben.
// Statische HTML (afwerkbalk, offerte-check) meet met een eigen onclick; die heeft geen data-meet.
export default function KlikMeter() {
  useEffect(() => {
    const klik = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[data-meet]') as HTMLAnchorElement | null
      if (a) meet('afwerk_klik', { plek: a.dataset.meet ?? '', doel: a.getAttribute('href') })
    }
    document.addEventListener('click', klik)
    return () => document.removeEventListener('click', klik)
  }, [])
  return null
}
