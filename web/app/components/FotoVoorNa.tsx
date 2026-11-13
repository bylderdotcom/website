'use client'
import { useRef, useState } from 'react'
import { meet } from './meet'

/**
 * Gedeelde bouwsteen voor "zie het in je eigen foto" (13-11-2026): de bezoeker kiest een foto, maakt een paar keuzes
 * en ziet dezelfde foto met één onderdeel vervangen, met een schuif voor en na. Zonder account. Gebruikt door de
 * gietvloer (gietvloer/KamerFoto.tsx) en de kozijnloze deur (DeurFoto.tsx). De foto wordt in de browser verkleind en
 * gaat naar de app, die hem alleen doorgeeft aan de beeldgenerator (app: src/lib/fotobewerking.ts).
 * Onder het resultaat staat "Klopt dit beeld?"; een nee of een storing gaat naar de feedbacklijst (/api/feature-request).
 * Meten: GA4-event `meetNaam` met `stap` (foto, maak, klaar, fout, oordeel-ja, oordeel-nee, storing-gemeld, vervolg).
 */

const INKT = 'rgba(61,46,30,', GROEN = '#3D5A3E'

/** Verkleint de foto tot hooguit 1280 px en geeft hem terug als JPEG (data-url). */
async function verklein(bestand: File): Promise<string> {
  const bmp = await createImageBitmap(bestand)
  const f = Math.min(1, 1280 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * f); c.height = Math.round(bmp.height * f)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.85)
}

export type FotoVoorNaProps = {
  /** Anker van de kop, bv. 'kf-kop'. */
  id: string
  api: string
  meetNaam: string
  oog: string; kop: string; intro: string
  leegKop: string; leegTip: string
  knopKies: string; knopMaak: string; knopOpnieuw: string
  bezigKnop: string; bezigTekst: string
  naLabel: string; naAlt: string
  /** De stap waar Bylder aan verdient (configurator, ontwerper of offerte), met wat je daar anders doet dan hier. */
  vervolg: { href: string; tekst: string; naam: string; daar: string }
  /** Wat er met het verzoek meegaat (naast de foto), en een korte omschrijving voor de feedbacklijst. */
  keuze: Record<string, string>
  keuzeTekst: string
  /** Verandert deze waarde, dan vervalt het vorige resultaat. */
  sleutel: string
  /** Vorm van het fotovak; standaard liggend (4/3). Een deur is staand. */
  verhouding?: string
  /** De keuzes (knoppen, kleuren) van deze tool. */
  children: React.ReactNode
}

export default function FotoVoorNa(p: FotoVoorNaProps) {
  const [foto, setFoto] = useState<string | null>(null)
  // Het resultaat hoort bij de keuzes waarmee het gemaakt is; bij een andere keuze verdwijnt het.
  const [na, setNa] = useState<{ url: string; sleutel: string } | null>(null)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [over, setOver] = useState<number | null>(null)
  const [schuif, setSchuif] = useState(50)
  // Oordeel over het beeld: '' nog niet gevraagd, 'ja', 'nee' (toelichting open), 'dank' (verstuurd).
  const [oordeel, setOordeel] = useState<'' | 'ja' | 'nee' | 'dank'>('')
  const [toelichting, setToelichting] = useState('')
  const kies = useRef<HTMLInputElement>(null)
  const beeld = na && na.sleutel === p.sleutel ? na.url : null

  const neemFoto = async (b: File | undefined) => {
    if (!b) return
    setFout(''); setNa(null)
    try { setFoto(await verklein(b)); meet(p.meetNaam, { stap: 'foto' }) }
    catch { setFout('Deze foto kunnen we niet lezen. Kies een jpg of png.') }
  }
  const maak = async () => {
    if (!foto) return
    setFout(''); setOordeel(''); setBezig(true); meet(p.meetNaam, { stap: 'maak', product: p.keuzeTekst })
    try {
      const r = await fetch(p.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ beeld: foto, ...p.keuze }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.url) throw new Error(j.error || 'Het beeld lukte niet. Probeer het zo opnieuw.')
      // Pas tonen als het beeld geladen is, zodat de schuif niet over een leeg vlak gaat.
      await new Promise<void>((ok, nee) => { const i = new Image(); i.onload = () => ok(); i.onerror = () => nee(new Error('Het beeld kon niet geladen worden. Probeer het opnieuw.')); i.src = j.url })
      setNa({ url: j.url, sleutel: p.sleutel }); setSchuif(50); setToelichting(''); setOver(typeof j.over === 'number' ? j.over : null); meet(p.meetNaam, { stap: 'klaar', product: p.keuzeTekst })
    } catch (e) { setFout((e as Error).message); meet(p.meetNaam, { stap: 'fout' }) } finally { setBezig(false) }
  }
  // Een melding gaat naar dezelfde lijst als "Mis je iets?" (feature_requests), met de keuzes erbij.
  const meld = async (waarom: 'beeld' | 'storing') => {
    const tekst = waarom === 'beeld' ? `${p.kop}: het beeld klopt niet. ${toelichting.trim()}`.trim() : `${p.kop} werkt niet: ${fout}`
    setOordeel('dank'); meet(p.meetNaam, { stap: waarom === 'beeld' ? 'oordeel-nee' : 'storing-gemeld', product: p.keuzeTekst })
    await fetch('/api/feature-request', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tekst, context: `${p.meetNaam} | ${p.keuzeTekst} | ${typeof window !== 'undefined' ? window.innerWidth : ''}px`, website: '' }) }).catch(() => undefined)
  }

  return (
    <section aria-labelledby={p.id} className="kf">
      <style>{`
        .kf{display:grid;gap:28px 40px;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-items:start;margin:64px 0 0}
        .kf h2{font-size:1.55rem;font-weight:800;letter-spacing:-0.022em;margin:0 0 12px;text-wrap:balance}
        .kf p{font-size:16.5px;line-height:1.7;color:${INKT}0.8);margin:0 0 18px;max-width:52ch}
        .kf-oog{font:700 13px 'Space Mono',monospace;text-transform:uppercase;letter-spacing:.1em;color:#B85C38;margin:0 0 12px!important}
        .kf-lab{font:700 13px 'Space Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:${INKT}0.6);margin:18px 0 8px;display:block}
        .kf-types{display:flex;flex-wrap:wrap;gap:8px}
        .kf-types button{font-weight:700;font-size:14.5px;line-height:1;font-family:inherit;padding:11px 14px;border-radius:999px;border:1px solid ${INKT}0.2);background:#fff;color:#1A1208;cursor:pointer}
        .kf-types button[aria-checked="true"]{background:#1A1208;border-color:#1A1208;color:#F5F0E8}
        .kf-kleuren{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(44px,1fr))}
        .kf-kleuren button{aspect-ratio:1;border-radius:10px;border:2px solid transparent;padding:0;cursor:pointer;background-size:cover;background-position:center;outline:1px solid ${INKT}0.15);outline-offset:-1px}
        .kf-kleuren button[aria-checked="true"]{border-color:${GROEN};box-shadow:0 0 0 2px #F5F0E8 inset}
        .kf-knop{display:inline-flex;align-items:center;gap:10px;background:${GROEN};color:#F5F0E8;font-weight:800;font-size:16px;font-family:inherit;padding:15px 26px;border-radius:12px;border:0;cursor:pointer;margin-top:22px}
        .kf-knop:disabled{opacity:.55;cursor:not-allowed}
        .kf-link{background:none;border:0;padding:0;color:${GROEN};font-weight:700;font-size:15px;font-family:inherit;text-decoration:underline;cursor:pointer}
        .kf-vak{position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:#EDE6D8;border:1px dashed ${INKT}0.3);display:grid;place-items:center;text-align:center}
        .kf-vak.vol{border:1px solid ${INKT}0.12)}
        .kf-vak img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
        .kf-leeg{padding:24px;display:grid;gap:12px;justify-items:center}
        .kf-leeg strong{font-size:18px}
        .kf-leeg span{font-size:14.5px;color:${INKT}0.7);max-width:34ch;line-height:1.5}
        .kf-lijn{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-50%);box-shadow:0 0 0 1px rgba(26,18,8,.15);pointer-events:none}
        .kf-greep{position:absolute;top:50%;width:44px;height:44px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);display:grid;place-items:center;box-shadow:0 2px 10px rgba(26,18,8,.25);pointer-events:none}
        .kf-bereik{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
        .kf-etiket{position:absolute;bottom:12px;font:700 13px 'Space Mono',monospace;background:rgba(26,18,8,.72);color:#F5F0E8;padding:5px 9px;border-radius:7px;pointer-events:none}
        .kf-bezig{position:absolute;inset:0;background:rgba(245,240,232,.82);display:grid;place-items:center;font-weight:700;padding:20px}
        .kf-oordeel{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:16px 0 0;font-size:15px;color:${INKT}0.8)}
        .kf-oordeel button{font-weight:700;font-size:14.5px;font-family:inherit;padding:9px 16px;min-height:40px;border-radius:999px;border:1px solid ${INKT}0.25);background:#fff;color:#1A1208;cursor:pointer}
        .kf-oordeel form{display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%}
        .kf-oordeel label{width:100%;font-weight:700}
        .kf-oordeel input{flex:1;min-width:180px;padding:10px 12px;border-radius:10px;border:1px solid ${INKT}0.25);font-family:inherit;font-size:16px;background:#fff}
        .kf-verschil{margin:22px 0 0;border-top:1px solid ${INKT}0.14);border-bottom:1px solid ${INKT}0.14)}
        .kf-verschil div{display:grid;grid-template-columns:132px minmax(0,1fr);gap:4px 14px;padding:12px 0}
        .kf-verschil div+div{border-top:1px solid ${INKT}0.14)}
        .kf-verschil dt{font:700 13px 'Space Mono',monospace;text-transform:uppercase;letter-spacing:.06em;color:${INKT}0.6);padding-top:3px}
        .kf-verschil dd{margin:0;font-size:15px;line-height:1.55;color:${INKT}0.82)}
        .kf-verschil a{color:${GROEN};font-weight:800;white-space:nowrap}
        .kf-verschil .nu dt{color:${GROEN}}
        @media(max-width:520px){.kf-verschil div{grid-template-columns:minmax(0,1fr)}.kf-verschil a{white-space:normal}}
        .kf-klein{font-size:13.5px!important;color:${INKT}0.62)!important;margin:12px 0 0!important;line-height:1.55!important}
        @media(max-width:820px){.kf{grid-template-columns:minmax(0,1fr)}.kf-beeld{order:-1}}
      
        .kf-kleuren button.kf-wand{display:grid;place-items:center;font-size:11px;font-weight:700;color:#1A1208;background:#fff}
      `}</style>

      <div>
        <p className="kf-oog">{p.oog}</p>
        <h2 id={p.id}>{p.kop}</h2>
        <p>{p.intro}</p>

        {p.children}

        <div>
          <button type="button" className="kf-knop" disabled={bezig} onClick={() => (foto ? maak() : kies.current?.click())}>
            {bezig ? p.bezigKnop : foto ? (beeld ? p.knopOpnieuw : p.knopMaak) : p.knopKies}
          </button>
        </div>
        {foto && !bezig && <p className="kf-klein"><button type="button" className="kf-link" onClick={() => kies.current?.click()}>Andere foto kiezen</button></p>}
        {fout && (
          <p role="alert" style={{ color: '#8C2F1E', fontSize: 15, margin: '12px 0 0' }}>
            {fout}{' '}
            {oordeel === 'dank' ? <span style={{ color: GROEN }}>Dank je, we kijken ernaar.</span>
              : <button type="button" className="kf-link" onClick={() => meld('storing')}>Meld dat het niet werkt</button>}
          </p>
        )}
        {beeld && (
          <div className="kf-oordeel" aria-live="polite">
            {oordeel === '' && <><span>Klopt dit beeld?</span>
              <button type="button" onClick={() => { setOordeel('ja'); meet(p.meetNaam, { stap: 'oordeel-ja', product: p.keuzeTekst }) }}>Ja</button>
              <button type="button" onClick={() => setOordeel('nee')}>Nee</button></>}
            {oordeel === 'ja' && <span>Fijn, dank je.</span>}
            {oordeel === 'nee' && (
              <form onSubmit={e => { e.preventDefault(); meld('beeld') }}>
                <label htmlFor={`${p.id}-waarom`}>Wat klopt er niet?</label>
                <input id={`${p.id}-waarom`} value={toelichting} onChange={e => setToelichting(e.target.value)} maxLength={300} placeholder="Bijvoorbeeld: er is meer veranderd dan ik koos" />
                <button type="submit">Verstuur</button>
              </form>
            )}
            {oordeel === 'dank' && <span>Dank je, we kijken ernaar.</span>}
          </div>
        )}
        {/* Het verschil met de configurator, altijd zichtbaar (verzoek Daniel, 13-11-2026): de foto is een indruk,
            de configurator is waar je de echte uitvoering kiest en de prijs ziet. */}
        <dl className="kf-verschil">
          <div><dt>Deze foto</dt><dd>Een indruk van hoe het bij jou staat. Zonder maten en zonder prijs.</dd></div>
          <div className={beeld ? 'nu' : undefined}><dt>{p.vervolg.naam}</dt><dd>{p.vervolg.daar}{' '}
            <a href={p.vervolg.href} onClick={() => meet(p.meetNaam, { stap: 'vervolg', product: p.keuzeTekst })}>{p.vervolg.tekst} →</a></dd></div>
        </dl>
        <p className="kf-klein">
          Gratis, zonder account{over !== null ? `, nog ${over} ${over === 1 ? 'beeld' : 'beelden'} vandaag` : ''}. Je foto wordt alleen gebruikt om dit beeld te maken en niet door ons bewaard.
          Het beeld is een impressie.
        </p>
        <input ref={kies} type="file" accept="image/jpeg,image/png,image/webp,image/heic" hidden onChange={e => { neemFoto(e.target.files?.[0]); e.target.value = '' }} />
      </div>

      <div className="kf-beeld">
        <div className={`kf-vak${foto ? ' vol' : ''}`} style={p.verhouding ? { aspectRatio: p.verhouding, maxWidth: 440, margin: '0 auto' } : undefined}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); neemFoto(e.dataTransfer.files?.[0]) }}>
          {!foto && (
            <div className="kf-leeg">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={GROEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
              <strong>{p.leegKop}</strong>
              <span>{p.leegTip}</span>
              <button type="button" className="kf-link" onClick={() => kies.current?.click()}>Foto kiezen</button>
            </div>
          )}
          {/* eslint-disable @next/next/no-img-element */}
          {foto && <img src={foto} alt="Je foto zoals het nu is" />}
          {foto && beeld && (
            <>
              <img src={beeld} alt={p.naAlt} style={{ clipPath: `inset(0 0 0 ${schuif}%)` }} />
              <span className="kf-etiket" style={{ left: 12 }}>Nu</span>
              <span className="kf-etiket" style={{ right: 12 }}>{p.naLabel}</span>
              <span className="kf-lijn" style={{ left: `${schuif}%` }} />
              <span className="kf-greep" style={{ left: `${schuif}%` }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1208" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l-5 6 5 6M15 6l5 6-5 6" /></svg>
              </span>
              <input className="kf-bereik" type="range" min={0} max={100} value={schuif} aria-label="Schuif tussen voor en na" onChange={e => setSchuif(Number(e.target.value))} />
            </>
          )}
          {/* eslint-enable @next/next/no-img-element */}
          {bezig && <div className="kf-bezig" role="status">{p.bezigTekst}</div>}
        </div>
      </div>
    </section>
  )
}
