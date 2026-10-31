'use client'

import { useEffect, useMemo, useState } from 'react'
import OfferteFormulier from '../../components/OfferteFormulier'
import { PLINT, euro, plintPakket, wandVanRuimte } from '@/lib/winkel'
import { VOORBEELD_LAGEN } from '../../mijn-woning/voorbeeld'
import type { Verdieping } from '@/lib/tekening/lees'

// Hoeveel profielen, hoeken en koppelstukken je nodig hebt (31-10-2026). Staat je woning in Mijn
// woning (zelfde browser, localStorage), dan rekenen we het per ruimte uit je tekening uit: de wand
// rond de vloer, min de deuropeningen. Anders vul je de meters en hoeken zelf in.

const OPSLAG = 'bylder:mijn-woning:v1'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
// Natte ruimtes krijgen tegels tot de vloer, en in de meterkast en op de trap geen plint.
const NIET_STANDAARD = /^(toilet|badkamer|meterkast|wasruimte|trap)/i

const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }
const nl = (n: number, d = 1) => n.toLocaleString('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d })

type Ruimte = { key: string; naam: string; laag: string; meter: number; binnen: number; buiten: number; voegen: number }

function ruimtesUit(lagen: Verdieping[]): Ruimte[] {
  const uit: Ruimte[] = []
  lagen.forEach((l, li) => {
    const aftrek: Record<number, { mm: number; n: number }> = {}
    l.deuren.forEach(d => {
      // De tekeninglezer zegt welke ruimtes een deur raakt; na een omweg via het account ontbreekt
      // dat soms, en dan hoort de deur bij de ruimte die hij afsluit.
      const ids = d.raakt?.length ? d.raakt : l.ruimtes.filter(r => r.naam.toLowerCase() === d.naar.toLowerCase()).map(r => r.id).slice(0, 1)
      ids.forEach(id => { aftrek[id] = { mm: (aftrek[id]?.mm ?? 0) + d.breedte, n: (aftrek[id]?.n ?? 0) + 1 } })
    })
    l.ruimtes.forEach(r => {
      const w = wandVanRuimte(r.stroken)
      const a = aftrek[r.id] ?? { mm: 0, n: 0 }
      uit.push({ key: `${li}:${r.id}`, naam: r.naam, laag: l.naam, meter: Math.max(0, (w.mm - a.mm) / 1000), binnen: w.binnen, buiten: w.buiten, voegen: w.voegen })
    })
  })
  return uit
}

export default function PlintCalculator() {
  const [bron, setBron] = useState<'woning' | 'voorbeeld' | 'zelf'>('zelf')
  const [lagen, setLagen] = useState<Verdieping[] | null>(null)
  const [uit, setUit] = useState<Record<string, boolean>>({})
  const [model, setModel] = useState('light-46')
  const [wand, setWand] = useState<'steen' | 'droogbouw'>('steen')
  const [meterZelf, setMeterZelf] = useState('')
  const [binnenZelf, setBinnenZelf] = useState('')
  const [buitenZelf, setBuitenZelf] = useState('')

  useEffect(() => {
    try {
      const o = JSON.parse(localStorage.getItem(OPSLAG) ?? 'null') as { lagen?: Verdieping[] } | null
      if (o?.lagen?.length) { setLagen(o.lagen); setBron('woning') }
    } catch { /* privévenster of kapotte waarde */ }
  }, [])

  const actieveLagen = bron === 'woning' ? lagen : bron === 'voorbeeld' ? VOORBEELD_LAGEN : null
  const ruimtes = useMemo(() => actieveLagen ? ruimtesUit(actieveLagen) : [], [actieveLagen])
  const aan = (r: Ruimte) => uit[r.key] ?? !NIET_STANDAARD.test(r.naam)

  let meter = 0, binnen = 0, buiten = 0
  let voegen: number | null = null
  if (actieveLagen) {
    voegen = 0
    ruimtes.filter(aan).forEach(r => { meter += r.meter; binnen += r.binnen; buiten += r.buiten; voegen = (voegen ?? 0) + r.voegen })
  } else {
    meter = Number(meterZelf.replace(',', '.')) || 0
    binnen = Math.max(0, Math.round(Number(binnenZelf) || 0))
    buiten = Math.max(0, Math.round(Number(buitenZelf) || 0))
  }
  const geldig = meter > 0 && meter < 3000
  const pakket = plintPakket(meter, binnen, buiten, voegen)
  const m = PLINT.modellen.find(x => x.id === model)!
  const art = PLINT.artikelen[model]

  const regels = [
    `${pakket.profielen} × profiel ${m.naam} voor ${wand === 'steen' ? 'steen' : 'gipswand (droogbouw)'}, 2 m (art. ${art[wand]})`,
    `${pakket.binnenhoeken} × binnenhoek (art. ${art.binnenhoek})`,
    `${pakket.buitenhoeken} × buitenhoek (art. ${art.buitenhoek})`,
    `${pakket.koppelstukken} × koppelstuk (art. ${PLINT.koppelstuk})`,
  ]
  const spec = [
    `Bestelling onzichtbare plint (${PLINT.merk} ${m.naam})`,
    `${nl(meter)} m wand${actieveLagen ? ` uit ${bron === 'woning' ? 'de eigen plattegrond' : 'de voorbeeldwoning'}, ${ruimtes.filter(aan).length} ruimtes` : ', zelf ingevuld'}`,
    ...regels,
  ].join('\n')

  const keuze = (b: typeof bron, t: string) => (
    <button type="button" onClick={() => setBron(b)} aria-pressed={bron === b}
      style={{ padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        border: `1.5px solid ${GROEN}`, background: bron === b ? GROEN : '#fff', color: bron === b ? '#F5F0E8' : GROEN }}>{t}</button>
  )

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="Waar komen de maten vandaan?">
        {lagen && keuze('woning', 'Uit mijn plattegrond')}
        {keuze('zelf', 'Zelf invullen')}
        {!lagen && keuze('voorbeeld', 'Probeer met een voorbeeldwoning')}
      </div>

      {!lagen && bron === 'zelf' && (
        <p style={{ fontSize: 13.5, color: `${INKT}0.65)`, margin: 0, lineHeight: 1.55 }}>
          Heb je je plattegrond? Zet hem in <a href="/mijn-woning/" style={{ color: GROEN, fontWeight: 700 }}>Mijn woning</a>, dan rekenen
          we de meters en hoeken per ruimte voor je uit.
        </p>
      )}

      {actieveLagen ? (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ ...label, marginBottom: 8 }}>In welke ruimtes komt de plint?</legend>
          <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
            {ruimtes.map(r => (
              <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#fff', cursor: 'pointer',
                border: `1.5px solid ${aan(r) ? GROEN : `${INKT}0.12)`}`, fontSize: 14 }}>
                <input type="checkbox" checked={aan(r)} onChange={e => setUit(u => ({ ...u, [r.key]: e.target.checked }))} style={{ width: 17, height: 17, accentColor: GROEN }} />
                <span style={{ flex: 1, fontWeight: 600, color: '#1A1208' }}>{r.naam}</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12.5, color: `${INKT}0.6)` }}>{nl(r.meter)} m</span>
              </label>
            ))}
          </div>
          {bron === 'voorbeeld' && <p style={{ fontSize: 12.5, color: `${INKT}0.6)`, margin: '8px 0 0' }}>Dit is een fictieve tussenwoning. Met je eigen plattegrond in Mijn woning staat hier jouw woning.</p>}
        </fieldset>
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div><label htmlFor="pc-m" style={label}>Meter wand, zonder deuren</label>
            <input id="pc-m" inputMode="decimal" value={meterZelf} onChange={e => setMeterZelf(e.target.value)} placeholder="bv. 60" style={veld} /></div>
          <div><label htmlFor="pc-b" style={label}>Binnenhoeken</label>
            <input id="pc-b" inputMode="numeric" value={binnenZelf} onChange={e => setBinnenZelf(e.target.value)} placeholder="bv. 16" style={veld} /></div>
          <div><label htmlFor="pc-u" style={label}>Buitenhoeken</label>
            <input id="pc-u" inputMode="numeric" value={buitenZelf} onChange={e => setBuitenZelf(e.target.value)} placeholder="bv. 2" style={veld} /></div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div><label htmlFor="pc-model" style={label}>Model</label>
          <select id="pc-model" value={model} onChange={e => setModel(e.target.value)} style={veld}>
            {PLINT.modellen.map(x => <option key={x.id} value={x.id}>{x.naam} · plint {x.hoogteMm} mm hoog</option>)}
          </select></div>
        <div><label htmlFor="pc-wand" style={label}>Wand</label>
          <select id="pc-wand" value={wand} onChange={e => setWand(e.target.value as 'steen' | 'droogbouw')} style={veld}>
            <option value="steen">Steen, beton of kalkzandsteen</option>
            <option value="droogbouw">Gipswand (droogbouw)</option>
          </select></div>
      </div>

      <section aria-live="polite" aria-label="Je pakket" style={{ background: '#fff', border: `1.5px solid ${GROEN}`, borderRadius: 14, padding: '16px 18px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: GROEN }}>
          Je pakket{geldig ? ` · ${nl(meter)} m wand` : ''}
        </p>
        {geldig ? (
          <>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6, fontSize: 15, color: '#1A1208' }}>
              <li><strong>{pakket.profielen}</strong> profielen {m.naam} van 2 m <span style={{ color: `${INKT}0.55)` }}>(incl. {Math.round(PLINT.verlies * 100)}% zaagverlies)</span></li>
              <li><strong>{pakket.binnenhoeken}</strong> binnenhoeken · <strong>{pakket.buitenhoeken}</strong> buitenhoeken</li>
              <li><strong>{pakket.koppelstukken}</strong> koppelstukken <span style={{ color: `${INKT}0.55)` }}>(ongeveer)</span></li>
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: 14.5, color: `${INKT}0.8)` }}>
              {PLINT.prijs != null
                ? <><strong style={{ fontSize: 18, color: '#1A1208' }}>{euro(pakket.profielen * PLINT.prijs)}</strong> voor de profielen, incl. btw. Hoeken en koppelstukken staan in je bevestiging.</>
                : <>De prijs staat in de bevestiging die je na je bestelling krijgt. Je betaalt pas als je akkoord bent.</>}
            </p>
          </>
        ) : <p style={{ margin: 0, fontSize: 14.5, color: `${INKT}0.65)` }}>Vul de meters in of kies je ruimtes, dan staat hier wat je nodig hebt.</p>}
      </section>

      <OfferteFormulier
        product="winkel-plint"
        bron="winkel-plint"
        specificatie={spec}
        configuratie={{ model, wand, bron, ruimtes: actieveLagen ? ruimtes.filter(aan).map(r => r.naam) : null }}
        hoeveelheden={{ m_plint: geldig ? Math.round(meter * 10) / 10 : null, profielen: geldig ? pakket.profielen : null, binnenhoeken: pakket.binnenhoeken, buitenhoeken: pakket.buitenhoeken, koppelstukken: pakket.koppelstukken }}
        terugkijkUrl={() => window.location.href}
        mailFallback={`mailto:info@bylder.com?subject=${encodeURIComponent('Bestelling onzichtbare plint')}&body=${encodeURIComponent(spec)}`}
        toelichtingHint="Bijvoorbeeld wanneer de stukadoor komt, of als je hulp wilt bij de keuze"
      />
    </div>
  )
}
