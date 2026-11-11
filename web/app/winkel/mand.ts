'use client'

import { useEffect, useState } from 'react'

// Het winkelmandje (1-11-2026). Staat in deze browser (localStorage), zodat het blijft als je later
// terugkomt, en is op elke pagina te zien via het icoon in het menu. Elke regel is één product met
// zijn keuzes; de prijs rekent de app uit bij het afrekenen (berekenMand), de site rekent hem voor.

export const MAND = 'bylder:mand:v1'
const EVENT = 'bylder-mand'

export type MandRegel = {
  id: string
  product: 'winkel-plint' | 'winkel-scharnier' | 'winkel-deurset'
  titel: string
  /** Wat erin zit, zoals de klant het leest. */
  regels: string[]
  configuratie: Record<string, unknown>
  hoeveelheden: Record<string, number | null>
  href: string
}

export function leesMand(): MandRegel[] {
  try { const m = JSON.parse(localStorage.getItem(MAND) ?? '[]'); return Array.isArray(m) ? m : [] } catch { return [] }
}

function schrijf(m: MandRegel[]) {
  try { localStorage.setItem(MAND, JSON.stringify(m)) } catch { /* privévenster */ }
  window.dispatchEvent(new Event(EVENT))
}

export function voegToe(r: Omit<MandRegel, 'id'>) {
  schrijf([...leesMand(), { ...r, id: Math.random().toString(36).slice(2, 10) }])
}
export function verwijder(id: string) { schrijf(leesMand().filter(r => r.id !== id)) }
export function leegMand() { schrijf([]) }

/** Het mandje, en bijgewerkt zodra het ergens op de site (of in een ander tabblad) verandert. */
export function useMand(): MandRegel[] {
  const [m, setM] = useState<MandRegel[]>([])
  useEffect(() => {
    const lees = () => setM(leesMand())
    lees()
    window.addEventListener(EVENT, lees)
    window.addEventListener('storage', lees)
    return () => { window.removeEventListener(EVENT, lees); window.removeEventListener('storage', lees) }
  }, [])
  return m
}
