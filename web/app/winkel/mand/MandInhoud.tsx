'use client'

import { useMand, verwijder } from '../mand'
import { useWinkelPrijzen, euroCent, productCent, verzendCent } from '../prijzen'
import Afrekenen from '../Afrekenen'
import BestelMoment from '../BestelMoment'
import { PLINT, SCHARNIER } from '@/lib/winkel'
import { S, INKT, GROEN } from '../stijl'

// Inhoud van het mandje (1-11-2026): de regels met hun prijs, verzending één keer per leverancier,
// wanneer je moet bestellen, wat erbij hoort, en één keer afrekenen.

// Wat erbij hoort: per product in het mandje een suggestie die er nog niet in zit.
const ERBIJ: Record<string, { product: string; href: string; tekst: string }> = {
  'winkel-plint': { product: 'winkel-scharnier', href: `/winkel/${SCHARNIER.slug}/`, tekst: 'Bij je onzichtbare plint: het verdekte scharnier voor een kozijnloze deur.' },
  'winkel-scharnier': { product: 'winkel-plint', href: `/winkel/${PLINT.slug}/`, tekst: 'Bij je scharnieren: de onzichtbare plint, ook vóór het stucwerk de wand in.' },
}

export default function MandInhoud() {
  const mand = useMand()
  const prijzen = useWinkelPrijzen()
  const online = mand.length > 0 && mand.every(r => prijzen?.online[r.product])
  const regelCent = mand.map(r => productCent(r.product, r.configuratie, prijzen))
  const verzend = online ? verzendCent(mand.map(r => r.product), prijzen) : null
  const totaal = online && verzend != null && regelCent.every(c => c != null) ? regelCent.reduce((t, c) => t! + c!, 0)! + verzend : null
  const erbij = [...new Set(mand.map(r => r.product))].map(p => ERBIJ[p]).filter(e => e && !mand.some(r => r.product === e.product))

  if (!mand.length) {
    return (
      <div style={{ ...S.kaart, maxWidth: 640 }}>
        <p style={{ ...S.p, margin: '0 0 12px' }}>Je mandje is leeg.</p>
        <a href="/winkel/" style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '12px 20px', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}>Naar de winkel</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '24px 36px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        {mand.map((r, i) => (
          <article key={r.id} style={{ ...S.kaart, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px 12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h2 style={{ ...S.h3, margin: 0 }}>{r.titel}</h2>
              <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{regelCent[i] != null ? euroCent(regelCent[i]!) : ''}</span>
            </div>
            <ul style={{ margin: '8px 0 10px', paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: `${INKT}0.75)` }}>
              {r.regels.map(x => <li key={x}>{x}</li>)}
            </ul>
            <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
              <a href={r.href} style={{ color: GROEN, fontWeight: 700 }}>Wijzigen</a>
              <button type="button" onClick={() => verwijder(r.id)} style={{ background: 'none', border: 0, padding: 0, color: '#B3261E', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Verwijderen</button>
            </div>
          </article>
        ))}
        {erbij.map(e => (
          <a key={e.product} href={e.href} style={{ ...S.kaart, padding: '14px 18px', borderStyle: 'dashed', textDecoration: 'none', color: '#1A1208', fontSize: 14.5 }}>
            {e.tekst} <span style={{ color: GROEN, fontWeight: 800 }}>Bekijken →</span>
          </a>
        ))}
        <BestelMoment wat="Wat in je mandje zit" />
      </div>

      <aside style={{ ...S.bestel, marginTop: 0, position: 'sticky', top: 120 }}>
        <h2 style={{ ...S.h3, fontSize: '1.15rem', margin: '0 0 10px' }}>Afrekenen</h2>
        {online && totaal != null ? (
          <div style={{ fontSize: 15, marginBottom: 14 }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 6px' }}><span>Producten</span><span>{euroCent(totaal - verzend!)}</span></p>
            <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 6px', color: `${INKT}0.7)` }}><span>Verzending</span><span>{euroCent(verzend!)}</span></p>
            <p style={{ display: 'flex', justifyContent: 'space-between', margin: 0, paddingTop: 8, borderTop: `1px solid ${INKT}0.12)`, fontWeight: 800, fontSize: 17 }}><span>Totaal, incl. btw</span><span>{euroCent(totaal)}</span></p>
          </div>
        ) : (
          <p style={{ ...S.p, fontSize: 14.5, marginBottom: 14 }}>Plaats je bestelling; binnen één werkdag krijg je de prijs, de levertijd en een betaallink. Je betaalt pas als je akkoord bent.</p>
        )}
        <Afrekenen items={mand} online={online} totaalCent={totaal} toelichtingHint="Bijvoorbeeld wanneer de stukadoor komt" />
      </aside>
    </div>
  )
}
