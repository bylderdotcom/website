'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// "Wat je buren kozen" op de projectpagina (besluit Daniel, 31-10-2026). Haalt de tellingen op uit de
// app (/api/project-keuzes) en zet ze in de plek #buren-kozen onder het blok "Van sleutel tot
// ingericht huis". De app geeft alleen iets terug vanaf drie kopers per regel; zonder regels blijft
// de plek leeg en ziet de bezoeker niets.

const API = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com') + '/api/project-keuzes'
type Regel = { soort: string; tekst: string; kopers: number; detail?: string }

export default function BurenKozen({ project }: { project: string }) {
  const [plek, setPlek] = useState<HTMLElement | null>(null)
  const [regels, setRegels] = useState<Regel[]>([])
  useEffect(() => {
    const el = document.getElementById('buren-kozen')
    if (!el) return
    fetch(`${API}?project=${encodeURIComponent(project)}`).then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.regels?.length) { setRegels(d.regels.slice(0, 5)); setPlek(el) } }).catch(() => undefined)
  }, [project])
  if (!plek || !regels.length) return null
  return createPortal(
    <section aria-labelledby="buren-kop" style={{ margin: '0 0 32px', background: '#FAF7F1', border: '1px solid rgba(61,46,30,0.1)', borderRadius: 18, padding: 'clamp(18px,3vw,26px)' }}>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#3D5A3E', margin: '0 0 8px' }}>Wat je buren kozen</p>
      <h2 id="buren-kop" style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 12px', color: '#1A1208' }}>Kopers in dit project gingen je voor</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
        {regels.map(r => (
          <li key={r.soort + r.tekst} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 15.5, color: 'rgba(61,46,30,0.85)' }}>
            <strong style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, color: '#1A1208', minWidth: 28 }}>{r.kopers}</strong>
            <span>{r.kopers === 1 ? 'koper' : 'kopers'} {r.tekst}{r.detail ? <span style={{ color: 'rgba(61,46,30,0.6)' }}> · {r.detail}</span> : null}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12.5, color: 'rgba(61,46,30,0.6)', margin: '12px 0 0' }}>Geteld per koper, zonder namen. We tonen iets pas als minstens drie kopers het kozen.</p>
    </section>,
    plek,
  )
}
