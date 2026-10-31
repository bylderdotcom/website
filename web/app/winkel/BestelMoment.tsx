'use client'

import { useEffect, useState } from 'react'
import { LEVERTIJD_WEKEN, MARGE_WEKEN } from '@/lib/winkel'

// "Op tijd voor de bouw" (besluit Daniel, 31-10-2026). Plint, scharnier en kozijnloze deur gaan vóór
// het stucwerk de wand in. Wie de datum van de stukadoor (of de oplevering) invult, ziet de laatste
// dag om te bestellen. De datums blijven in deze browser (localStorage) en gelden voor de hele winkel.

export const PLANNING = 'bylder:planning:v1'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const DAG = 86400000
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export type Planning = { stukadoor?: string; oplevering?: string }
const datum = (d: Date) => d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function leesPlanning(): Planning {
  try { return JSON.parse(localStorage.getItem(PLANNING) ?? '{}') as Planning } catch { return {} }
}

/** De dag dat de stukadoor begint: ingevuld, of geschat op drie weken na de oplevering. */
export function stucDag(p: Planning): { dag: Date; geschat: boolean } | null {
  if (p.stukadoor) return { dag: new Date(p.stukadoor + 'T12:00:00'), geschat: false }
  if (p.oplevering) return { dag: new Date(new Date(p.oplevering + 'T12:00:00').getTime() + 21 * DAG), geschat: true }
  return null
}

export function uiterlijkBestellen(p: Planning): Date | null {
  const s = stucDag(p)
  return s ? new Date(s.dag.getTime() - (LEVERTIJD_WEKEN + MARGE_WEKEN) * 7 * DAG) : null
}

export default function BestelMoment({ wat }: { wat: string }) {
  const [p, setP] = useState<Planning>({})
  useEffect(() => { setP(leesPlanning()) }, [])
  const zet = (n: Planning) => { setP(n); try { localStorage.setItem(PLANNING, JSON.stringify(n)) } catch { /* privévenster */ } }
  const s = stucDag(p), uiterlijk = uiterlijkBestellen(p)
  const dagen = uiterlijk ? Math.ceil((uiterlijk.getTime() - Date.now()) / DAG) : null

  return (
    <section aria-labelledby="moment-kop" style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 'clamp(16px,3vw,22px)' }}>
      <h3 id="moment-kop" style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px' }}>Wanneer moet je bestellen?</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.75)`, margin: '0 0 12px' }}>
        {wat} gaat vóór het stucwerk de wand in. Vul in wanneer de stukadoor komt, of je opleverdatum als je dat nog niet weet.
      </p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <div><label htmlFor="bm-stuc" style={label}>Stukadoor begint</label>
          <input id="bm-stuc" type="date" value={p.stukadoor ?? ''} onChange={e => zet({ ...p, stukadoor: e.target.value || undefined })} style={veld} /></div>
        <div><label htmlFor="bm-opl" style={label}>Of: oplevering</label>
          <input id="bm-opl" type="date" value={p.oplevering ?? ''} onChange={e => zet({ ...p, oplevering: e.target.value || undefined })} style={veld} /></div>
      </div>
      {uiterlijk && s && (
        <p aria-live="polite" style={{ margin: '14px 0 0', fontSize: 15.5, lineHeight: 1.55, color: '#1A1208', borderLeft: `3px solid ${dagen! < 7 ? '#B85C38' : GROEN}`, paddingLeft: 12 }}>
          {dagen! < 0
            ? <><strong>Dat wordt krap.</strong> Bestel vandaag en overleg met je stukadoor; de levertijd is ongeveer {LEVERTIJD_WEKEN} weken.</>
            : <>Bestel <strong>uiterlijk {datum(uiterlijk)}</strong>{dagen! <= 60 ? ` (over ${dagen} ${dagen === 1 ? 'dag' : 'dagen'})` : ''}.</>}
          <span style={{ display: 'block', fontSize: 13.5, color: `${INKT}0.65)`, marginTop: 4 }}>
            Uitgaande van ongeveer {LEVERTIJD_WEKEN} weken levertijd en een week marge{s.geschat ? ', en een stukadoor die zo’n drie weken na de oplevering begint' : ''}.
          </span>
        </p>
      )}
      <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '12px 0 0' }}>Doet de bouwer het stucwerk? Dan moet het via je meerwerklijst, vóór de sluitingsdatum. Vraag je bouwer of dat nog kan.</p>
    </section>
  )
}
