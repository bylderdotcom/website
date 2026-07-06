'use client'

import { useEffect } from 'react'

// Herbedraadt de 2 inline <script>-blokken uit de stukadoor-contenttemplates
// (identiek op index/city/bedrijf-pagina's) die niet uitvoeren via
// dangerouslySetInnerHTML: de kostencalculator (#kc-werk/#kc-m2/#kc-out —
// prijs per m², zoals gietvloer/schilder, géén auto-berekening bij laden) en,
// alleen op stadspagina's, de sorteer-dropdown voor de bedrijvengrid
// (#dir-sort/#dir-grid, byte-identiek aan de vorige 6 clusters). Elementen
// die niet bestaan worden overgeslagen.
export default function InteractiveScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Kostencalculator — prijsbanden (€/m²) 1-op-1 uit de bron.
    const W = [
      { low: 8, high: 14 },
      { low: 14, high: 22 },
      { low: 18, high: 38 },
      { low: 40, high: 95 },
      { low: 45, high: 90 },
    ]
    const s = document.getElementById('kc-werk') as HTMLSelectElement | null
    const m = document.getElementById('kc-m2') as HTMLInputElement | null
    const o = document.getElementById('kc-out')
    if (s && m && o) {
      const fmt = (n: number) => n.toLocaleString('nl-NL')
      const calc = () => {
        const w = W[Number(s.value)]
        const a = parseFloat((m.value || '').replace(',', '.'))
        if (!w || !(a > 0)) { o.innerHTML = ''; return }
        o.innerHTML = `Indicatie voor jouw klus: <strong>€${fmt(Math.round(w.low * a))} – €${fmt(Math.round(w.high * a))}</strong> <span style="color:rgba(61,46,30,0.5);font-size:13px;">(${w.low}–${w.high} €/m², indicatief)</span>`
      }
      s.addEventListener('change', calc)
      m.addEventListener('input', calc)
      cleanups.push(() => { s.removeEventListener('change', calc); m.removeEventListener('input', calc) })
    }

    // Sorteer-dropdown voor de bedrijvengrid (alleen op stadspagina's) — zelfde
    // gedrag als de vorige 6 clusters.
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
