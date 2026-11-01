'use client'

import { useState } from 'react'
import { voegToe, useMand, type MandRegel } from './mand'
import { meet } from '../components/meet'

// "In je mandje" op een productpagina (1-11-2026). Na het toevoegen: door naar het mandje of verder
// winkelen. Afrekenen gebeurt één keer, in het mandje.
const GROEN = '#3D5A3E'

export default function MandKnop(p: Omit<MandRegel, 'id'> & { klaar: boolean }) {
  const [erin, setErin] = useState(false)
  const mand = useMand()
  const { klaar, ...regel } = p
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'center' }}>
      <button type="button" disabled={!klaar} onClick={() => { voegToe(regel); setErin(true); meet('mand_toevoegen', { product: p.product }) }} style={{
        background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0,
        cursor: klaar ? 'pointer' : 'not-allowed', opacity: klaar ? 1 : 0.5, fontFamily: 'inherit',
      }}>{erin ? 'Nog een keer toevoegen' : 'In je mandje'}</button>
      {erin && (
        <span role="status" style={{ fontSize: 14.5, color: '#1A1208' }}>
          Toegevoegd. <a href="/winkel/mand/" style={{ color: GROEN, fontWeight: 800 }}>Naar je mandje ({mand.length}) →</a>
        </span>
      )}
    </div>
  )
}
