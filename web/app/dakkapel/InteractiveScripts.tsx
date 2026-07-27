'use client'

import { useEffect } from 'react'

// Herbedraadt de 2 inline <script>-blokken uit de dakkapel-contenttemplates
// (identiek op index/city/bedrijf-pagina's) die niet uitvoeren via
// dangerouslySetInnerHTML: de prijsindicatie (#kc-werk/#kc-out — vaste prijs
// per dakkapel, geen m²-invoer, berekent al bij laden, zoals aannemer/
// badkamer) en, alleen op stadspagina's, de sorteer-dropdown voor de
// bedrijvengrid (#dir-sort/#dir-grid, byte-identiek aan de vorige 7
// clusters). Elementen die niet bestaan worden overgeslagen.
export default function InteractiveScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Prijsindicatie — vaste prijsbanden per klustype 1-op-1 uit de bron.
    const W = [
      { low: 7000, high: 12000 },
      { low: 9000, high: 16000 },
      { low: 14000, high: 25000 },
      { low: 18000, high: 35000 },
      { low: 4000, high: 10000 },
    ]
    const s = document.getElementById('kc-werk') as HTMLSelectElement | null
    const o = document.getElementById('kc-out')
    if (s && o) {
      const fmt = (n: number) => n.toLocaleString('nl-NL')
      const calc = () => {
        const w = W[Number(s.value)]
        if (!w) { o.innerHTML = ''; return }
        o.innerHTML = `Indicatie: <strong>€${fmt(w.low)} – €${fmt(w.high)}</strong> <span style="color:rgba(61,46,30,0.72);font-size:13px;">(indicatief, per dakkapel, excl. btw)</span>`
      }
      s.addEventListener('change', calc)
      calc() // de bron berekent ook direct bij laden (eerste optie)
      cleanups.push(() => s.removeEventListener('change', calc))
    }

    // Sorteer-dropdown voor de bedrijvengrid (alleen op stadspagina's) — zelfde
    // gedrag als de vorige 7 clusters.
    const sel = document.getElementById('dir-sort') as HTMLSelectElement | null
    const g = document.getElementById('dir-grid')
    if (sel && g) {
      const k = (c: Element, attr: string) => parseFloat(c.getAttribute(attr) || '0') || 0
      const onChange = () => {
        const mode = sel.value
        const cards = Array.from(g.children)
        if (mode === 'reviews') cards.sort((a, b) => k(b, 'data-reviews') - k(a, 'data-reviews'))
        else if (mode === 'rating') cards.sort((a, b) => k(b, 'data-rating') - k(a, 'data-rating') || k(b, 'data-reviews') - k(a, 'data-reviews'))
        else if (mode === 'lid') cards.sort((a, b) => k(b, 'data-lid') - k(a, 'data-lid') || k(b, 'data-reviews') - k(a, 'data-reviews'))
        cards.forEach(c => g.appendChild(c))
      }
      sel.addEventListener('change', onChange)
      cleanups.push(() => sel.removeEventListener('change', onChange))
    }

    return () => cleanups.forEach(fn => fn())
  }, [])

  return null
}
