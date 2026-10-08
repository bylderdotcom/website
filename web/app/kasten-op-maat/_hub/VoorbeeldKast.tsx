'use client'

import { useMemo, useState } from 'react'
import Kast3D from '../../components/kast/Kast3D'
import { bouw } from '@/lib/kast/rekenmodel'
import { voorbeeld } from '@/lib/kast/voorbeelden'

// Het voorbeeld in 3D, draaiend, met een knop om de deuren te openen. Het
// rekenmodel draait hier in de browser; dezelfde uitkomst staat als tekening
// en feiten in de servergerenderde HTML eronder, dus zonder JavaScript mist er
// alleen het draaiende beeld.

export default function VoorbeeldKast({ slug, hoogte = 420 }: { slug: string; hoogte?: number }) {
  const v = voorbeeld(slug)
  const b = useMemo(() => bouw(v.ontwerp), [v])
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(61,46,30,.12)' }}>
      <Kast3D bouw={b} afwerking={v.ontwerp.afwerking} binnen={v.ontwerp.binnen} open={open} hoogte={`min(${hoogte}px, 80vw)`} draai achtergrond="#EDE9E2" />
      <button type="button" onClick={() => setOpen(o => !o)} aria-pressed={open} style={{
        position: 'absolute', left: 14, bottom: 14, background: '#1A1208', color: '#F5F0E8', border: 0,
        borderRadius: 999, padding: '9px 16px', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
      }}>{open ? 'Deuren dicht' : 'Deuren open'}</button>
      <span style={{
        position: 'absolute', right: 14, bottom: 16, fontSize: 12, color: 'rgba(61,46,30,.6)',
        fontFamily: "'Space Mono',monospace",
      }}>Sleep om te draaien</span>
    </div>
  )
}
