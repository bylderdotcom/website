'use client'

import { useEffect, useState } from 'react'
import { leesPlanning, stucDag, uiterlijkBestellen, type Planning } from './BestelMoment'
import { PLINT, SCHARNIER } from '@/lib/winkel'

// "Op tijd voor de bouw" in de winkel (31-10-2026): wat je wanneer regelt, in de volgorde van de
// bouw. Staat er een planning in deze browser (van de productpagina's), dan staan de datums erbij.

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const kort = (d: Date) => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })

type Item = { href: string; t: string }
const FASEN: { kop: string; wanneer: (p: Planning) => string | null; uitleg: string; items: Item[] }[] = [
  { kop: 'Vóór de sluitingsdatum van je meerwerk', wanneer: () => null,
    uitleg: 'Wat in de ruwbouw zit, kies je bij de bouwer: kozijnen, leidingen, lichtpunten. Een kozijnloze deur vraagt hier al om de juiste wandopening.',
    items: [{ href: '/kozijnloze-deuren/configurator/', t: 'Kozijnloze deur samenstellen' }, { href: '/kopersbegeleiding/meerwerklijst-nieuwbouw-controleren/', t: 'Je meerwerklijst laten controleren' }] },
  { kop: 'Vóór de stukadoor', wanneer: p => { const u = uiterlijkBestellen(p); return u ? `bestel uiterlijk ${kort(u)}` : null },
    uitleg: 'Wat de wand in gaat, moet er zijn voordat er gestuct wordt.',
    items: [{ href: `/winkel/${PLINT.slug}/`, t: 'Onzichtbare plint' }, { href: `/winkel/${SCHARNIER.slug}/`, t: 'Verdekt scharnier DX-38' }] },
  { kop: 'Na het stucwerk', wanneer: p => { const s = stucDag(p); return s ? `vanaf ongeveer ${kort(new Date(s.dag.getTime() + 28 * 86400000))}` : null },
    uitleg: 'Als de wanden droog zijn: vloer, kasten en de inrichting.',
    items: [{ href: '/gietvloer/ontwerpen/', t: 'Gietvloer ontwerpen' }, { href: '/kasten-op-maat/ontwerpen/', t: 'Kast op maat ontwerpen' }, { href: '/vouchers/', t: 'Ledenkorting bij woonwinkels' }] },
]

export default function Tijdlijn() {
  const [p, setP] = useState<Planning>({})
  useEffect(() => { setP(leesPlanning()) }, [])
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {FASEN.map((f, i) => {
        const w = f.wanneer(p)
        return (
          <li key={f.kop} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 14, background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 18px' }}>
            <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', background: GROEN, color: '#F5F0E8', font: "700 13px/30px 'Space Mono',monospace", textAlign: 'center' }}>{i + 1}</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0 4px' }}>{f.kop}{w && <span style={{ fontWeight: 600, fontSize: 14, color: '#B85C38' }}> · {w}</span>}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.75)`, margin: '0 0 8px' }}>{f.uitleg}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {f.items.map(it => <a key={it.href} href={it.href} style={{ fontSize: 14, fontWeight: 700, color: GROEN, border: `1.5px solid ${GROEN}`, borderRadius: 999, padding: '6px 12px', textDecoration: 'none' }}>{it.t}</a>)}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
