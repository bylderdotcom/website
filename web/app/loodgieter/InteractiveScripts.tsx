'use client'

import { useEffect } from 'react'

// Herbedraadt de 2 inline <script>-blokken uit de loodgieter-contenttemplates
// (identiek op index/city/bedrijf-pagina's) die niet uitvoeren via
// dangerouslySetInnerHTML: de prijsindicatie (#kc-werk/#kc-out — vaste prijs per
// klus, geen m²-invoer zoals bij gietvloer, en berekent meteen bij laden) en,
// alleen op stadspagina's, de sorteer-dropdown voor de bedrijvengrid
// (#dir-sort/#dir-grid, identiek aan gietvloer). Elementen die niet bestaan
// worden overgeslagen.
export default function InteractiveScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Prijsindicatie — vaste prijsbanden per klustype 1-op-1 uit de bron.
    const W = [
      { low: 90, high: 180 },
      { low: 90, high: 350 },
      { low: 150, high: 600 },
      { low: 150, high: 450 },
      { low: 1800, high: 3500 },
      { low: 90, high: 250 },
    ]
    const s = document.getElementById('kc-werk') as HTMLSelectElement | null
    const o = document.getElementById('kc-out')
    if (s && o) {
      const fmt = (n: number) => n.toLocaleString('nl-NL')
      const calc = () => {
        const w = W[Number(s.value)]
        if (!w) { o.innerHTML = ''; return }
        o.innerHTML = `Indicatie: <strong>€${fmt(w.low)} – €${fmt(w.high)}</strong> <span style="color:rgba(61,46,30,0.72);font-size:13px;">(indicatief, per klus, excl. voorrijkosten/btw)</span>`
      }
      s.addEventListener('change', calc)
      calc() // de bron berekent ook direct bij laden (eerste optie)
      cleanups.push(() => s.removeEventListener('change', calc))
    }

    // Sorteer-dropdown voor de bedrijvengrid (alleen op stadspagina's) — zelfde
    // gedrag als het gietvloer-cluster.
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
