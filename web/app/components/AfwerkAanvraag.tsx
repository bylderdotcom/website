'use client'

import { useState } from 'react'
import OfferteFormulier from './OfferteFormulier'

// Aanvraag voor de afwerking van een nieuwbouwwoning, met Bylder als aannemer (28-10-2026).
// De koper kiest de onderdelen en geeft de woonoppervlakte en de opleverdatum op; dat gaat als
// specificatie en hoeveelheden naar het loket in de app (product 'afwerking-nieuwbouw').

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function AfwerkAanvraag({ onderdelen, gekozen: start, bron }: {
  onderdelen: { slug: string; naam: string }[]
  /** Vooraf aangevinkt; op een onderdeelpagina dat onderdeel. */
  gekozen: string[]
  bron: string
}) {
  const [gekozen, setGekozen] = useState<string[]>(start)
  const [m2, setM2] = useState('')
  const [oplevering, setOplevering] = useState('')
  const [project, setProject] = useState('')

  const namen = onderdelen.filter(o => gekozen.includes(o.slug)).map(o => o.naam)
  const specificatie = [
    `Afwerking nieuwbouw, Bylder als aannemer`,
    `Onderdelen: ${namen.length ? namen.join(', ') : 'nog niet gekozen'}`,
    m2 ? `Woonoppervlakte: ${m2} m²` : '',
    oplevering ? `Oplevering woning: ${oplevering}` : '',
    project ? `Project: ${project}` : '',
  ].filter(Boolean).join('\n')
  const zet = (slug: string, aan: boolean) => setGekozen(g => aan ? [...new Set([...g, slug])] : g.filter(x => x !== slug))

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ ...label, marginBottom: 8 }}>Wat wil je laten doen?</legend>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))' }}>
          {onderdelen.map(o => {
            const aan = gekozen.includes(o.slug)
            return (
              <label key={o.slug} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600, color: '#1A1208', background: '#fff', border: `1.5px solid ${aan ? GROEN : `${INKT}0.14)`}` }}>
                <input type="checkbox" checked={aan} onChange={e => zet(o.slug, e.target.checked)} style={{ width: 17, height: 17, accentColor: GROEN }} />
                {o.naam}
              </label>
            )
          })}
        </div>
      </fieldset>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div><label htmlFor="af-m2" style={label}>Woonoppervlakte (m²)</label>
          <input id="af-m2" inputMode="numeric" value={m2} onChange={e => setM2(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} placeholder="bv. 120" style={veld} /></div>
        <div><label htmlFor="af-opl" style={label}>Oplevering van je woning</label>
          <input id="af-opl" value={oplevering} onChange={e => setOplevering(e.target.value.slice(0, 60))} placeholder="bv. maart 2027" style={veld} /></div>
        <div><label htmlFor="af-proj" style={label}>Nieuwbouwproject</label>
          <input id="af-proj" value={project} onChange={e => setProject(e.target.value.slice(0, 120))} placeholder="naam of straat" style={veld} /></div>
      </div>
      <OfferteFormulier
        product="afwerking-nieuwbouw"
        bron={bron}
        specificatie={specificatie}
        configuratie={{ onderdelen: gekozen, oplevering: oplevering || null, project: project || null }}
        hoeveelheden={{ m2_woning: m2 ? Number(m2) : null }}
        terugkijkUrl={() => window.location.href}
        mailFallback={`mailto:danielpaaij@bylder.com?subject=${encodeURIComponent('Afwerking nieuwbouw')}&body=${encodeURIComponent(specificatie)}`}
        toelichtingHint="Bijvoorbeeld: wat je al hebt geregeld, of wensen voor kleuren en materialen. Je tekening kun je na je aanvraag in je account zetten."
      />
    </div>
  )
}
