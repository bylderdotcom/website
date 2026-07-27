'use client'

import { useEffect } from 'react'

// Herbedraadt de 2 inline <script>-blokken uit de aannemer-contenttemplates
// (identiek op index/city/bedrijf-pagina's) die niet uitvoeren via
// dangerouslySetInnerHTML: de prijsindicatie (#kc-werk/#kc-out — vaste prijs
// per project, geen m²-invoer, berekent al bij laden, zoals bij loodgieter)
// en, alleen op stadspagina's, de sorteer-dropdown voor de bedrijvengrid
// (#dir-sort/#dir-grid, byte-identiek aan gietvloer/loodgieter). Elementen
// die niet bestaan worden overgeslagen.
export default function InteractiveScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Prijsindicatie — vaste prijsbanden per klustype 1-op-1 uit de bron.
    const W = [
      { low: 15000, high: 60000 },
      { low: 10000, high: 80000 },
      { low: 7000, high: 18000 },
      { low: 1500, high: 5000 },
      { low: 5000, high: 25000 },
    ]
    const s = document.getElementById('kc-werk') as HTMLSelectElement | null
    const o = document.getElementById('kc-out')
    if (s && o) {
      const fmt = (n: number) => n.toLocaleString('nl-NL')
      const calc = () => {
        const w = W[Number(s.value)]
        if (!w) { o.innerHTML = ''; return }
        o.innerHTML = `Indicatie: <strong>€${fmt(w.low)} – €${fmt(w.high)}</strong> <span style="color:rgba(61,46,30,0.72);font-size:13px;">(indicatief, per project, excl. btw)</span>`
      }
      s.addEventListener('change', calc)
      calc() // de bron berekent ook direct bij laden (eerste optie)
      cleanups.push(() => s.removeEventListener('change', calc))
    }

    // Sorteer-dropdown voor de bedrijvengrid (alleen op stadspagina's) — zelfde
    // gedrag als gietvloer/loodgieter.
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
