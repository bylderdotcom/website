'use client'

import { useEffect } from 'react'

import { wireKlusCheck } from '../components/klusCheck'

// Herbedraadt wat de inline <script>-blokken in de loodgieter-contenttemplates
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
      W: [{ low: 90, high: 180 }, { low: 90, high: 350 }, { low: 150, high: 600 }, { low: 150, high: 450 }, { low: 1800, high: 3500 }, { low: 90, high: 250 },],
      noot: 'indicatief, per klus, excl. voorrijkosten/btw',
    }))

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
