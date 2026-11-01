'use client'

import { useEffect, useState } from 'react'

// De verkoopprijzen staan op één plek: in de app (src/lib/winkel.ts). De site haalt ze op, zodat de
// prijs op de pagina altijd dezelfde is als wat de klant afrekent. Bedragen in centen, incl. btw.
export const WINKEL_API = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com') + '/api/winkel'

export type WinkelPrijzen = {
  prijzen: {
    plint: { profiel: number | null; binnenhoek: number | null; buitenhoek: number | null; koppelstuk: number | null }
    scharnier: { stuk: number | null; afdekplaat: number | null }
    /** Per leverancier, één keer per bestelling. */
    verzending: Record<string, number | null>
  }
  leverancier: Record<string, string>
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

/** Wat één product kost zonder verzending; null als de prijs nog niet bekend is. Rekent zoals de app. */
export function productCent(product: string, c: Record<string, unknown>, w: WinkelPrijzen | null): number | null {
  if (!w?.online[product]) return null
  const n = (v: unknown) => Math.max(0, Math.round(Number(v)) || 0)
  if (product === 'winkel-plint') {
    const p = w.prijzen.plint
    return n(c.profielen) * p.profiel! + n(c.binnenhoeken) * p.binnenhoek! + n(c.buitenhoeken) * p.buitenhoek! + n(c.koppelstukken) * p.koppelstuk!
  }
  if (product === 'winkel-scharnier') {
    const p = w.prijzen.scharnier, stuks = Math.max(1, n(c.deuren)) * 3
    return stuks * p.stuk! + (c.afdekplaatjes ? stuks * p.afdekplaat! : 0)
  }
  return null
}

/** Verzendkosten van een mandje: één keer per leverancier. */
export function verzendCent(producten: string[], w: WinkelPrijzen | null): number | null {
  if (!w) return null
  const lev = new Set(producten.map(p => w.leverancier[p]).filter(Boolean))
  let t = 0
  for (const l of lev) { const v = w.prijzen.verzending[l]; if (v == null) return null; t += v }
  return t
}
