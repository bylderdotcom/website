'use client'

import { useEffect, useState } from 'react'

// De verkoopprijzen staan op één plek: in de app (src/lib/winkel.ts). De site haalt ze op, zodat de
// prijs op de pagina altijd dezelfde is als wat de klant afrekent. Bedragen in centen, incl. btw.
export const WINKEL_API = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com') + '/api/winkel'

export type WinkelPrijzen = {
  prijzen: {
    plint: { profiel: number | null; binnenhoek: number | null; buitenhoek: number | null; koppelstuk: number | null }
    scharnier: { stuk: number | null; afdekplaat: number | null }
    verzending: { plint: number | null; scharnier: number | null }
  }
  online: Record<string, boolean>
}

export function useWinkelPrijzen(): WinkelPrijzen | null {
  const [p, setP] = useState<WinkelPrijzen | null>(null)
  useEffect(() => {
    fetch(`${WINKEL_API}/prijzen`).then(r => (r.ok ? r.json() : null)).then(setP).catch(() => setP(null))
  }, [])
  return p
}

export const euroCent = (c: number) => '€ ' + (c / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
