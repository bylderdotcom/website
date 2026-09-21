'use client'

import { useEffect } from 'react'

import { wireKlusCheck } from '../components/klusCheck'

// Herbedraadt wat de inline <script>-blokken in de elektricien-contenttemplates
// zouden doen — via dangerouslySetInnerHTML voeren die niet uit. Twee dingen:
// de rekenhulp (#kc-werk/#kc-m2/#kc-out, op bedrijfsprofielen met #kc-bedrag
// erbij — zie app/components/klusCheck.ts) en, alleen op stadspagina's, de
// sorteer-dropdown voor de bedrijvengrid (#dir-sort/#dir-grid). Elementen die
// niet bestaan worden overgeslagen.
export default function InteractiveScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    // Rekenhulp: bandbreedte per werksoort, en op bedrijfsprofielen het
    // oordeel over het bedrag uit de offerte van de bezoeker.
    cleanups.push(wireKlusCheck({
      W: [{ low: 80, high: 180 }, { low: 90, high: 350 }, { low: 90, high: 250 }, { low: 500, high: 1500 }, { low: 600, high: 1500 }, { low: 1500, high: 6000 },],
      noot: 'indicatief, per klus, excl. voorrijkosten/btw',
    }))

    // Sorteer-dropdown voor de bedrijvengrid (alleen op stadspagina's) — zelfde
    // gedrag als de vorige 4 clusters.
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
