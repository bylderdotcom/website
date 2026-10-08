'use client'

// Website-versie van de kastontwerper (app/src/components/kast/Ontwerper.tsx in
// bylderdotcom/app). Zelfde scherm; praat met de publieke API van de app, zonder
// account. Het gesprek heeft een id en een geheime sleutel (in de URL en lokaal
// bewaard), zodat de bezoeker verder kan en het ontwerp kan meenemen naar de app.

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Images, Ruler, MagicWand, Couch, Television, Stairs, Books, Paperclip, PaperPlaneRight, X, Cube, Door, SquaresFour, Package, ArrowsClockwise } from '@phosphor-icons/react'
import { bouw as bouwKast } from '@/lib/kast/rekenmodel'
import { VOORBEELD_HOEKKAST, type Ontwerp } from '@/lib/kast/ontwerp'
import { Plattegrond, Uitslag } from './Tekeningen'
import Werkplaats from './Werkplaats'

// Het ontwerpscherm: links het gesprek met de AI, rechts de kast (3D, aanzicht,
// plattegrond, werkplaats). Alles rechts komt uit het rekenmodel.
//
// Sfeer: een tekentafel. Papier met een fijn raster, zacht licht dat langzaam
// beweegt, en zolang er nog geen ontwerp is een voorbeeldkast die rustig draait,
// zodat je meteen ziet wat hier gebeurt.

const Kast3D = dynamic(() => import('./Kast3D'), { ssr: false, loading: () => <div className="ko-laden">3D laden…</div> })

type Regel = { rol: 'koper' | 'ontwerper'; tekst: string; fotos: number }
type Foto = { media_type: 'image/jpeg'; data: string; voorbeeld: string }
type Tab = '3d' | 'aanzicht' | 'plattegrond' | 'werkplaats'

const STARTERS = [
  { slug: 'hoekkast', icoon: Couch, titel: 'Hoekkast met ronde koppen', tekst: 'Ik wil deze kast in de hoek van mijn woonkamer, in een V-vorm met afgeronde koppen aan beide uiteinden. Langs de lange muur 2 meter, langs de trapwand ook ongeveer 2 meter. Plafond 2,60. Er hoeft geen kleding in, wel een lange steelstofzuiger.' },
  { slug: 'tv-wand', icoon: Television, titel: 'Tv-wand met open vakken', tekst: 'Een tv-wand van 3,20 meter breed tegen een rechte muur, plafond 2,60. In het midden een open plek voor een tv van 65 inch, eronder lades, links en rechts dichte kasten tot het plafond.' },
  { slug: 'kast-in-nis', icoon: Stairs, titel: 'Kast in een nis', tekst: 'Een inbouwkast in een nis van 1,40 meter breed en 2,50 hoog. Onderin lades voor schoenen, daarboven planken en een hangdeel voor jassen.' },
  { slug: 'boekenkast', icoon: Books, titel: 'Boekenkast', tekst: 'Een boekenkast van 2,40 meter breed en 2,40 hoog tegen een rechte muur, 32 cm diep. Grotendeels open, onderin dichte kastjes. Eiken, warm en rustig.' },
]
STARTERS.push({ slug: 'inbouwkast', icoon: Package, titel: 'Inbouwkast slaapkamer', tekst: 'Een inbouwkast in de slaapkamer van muur tot muur, 2,44 meter breed en 2,50 hoog. 60 cm diep, met hangruimte voor kleding en planken. Rustige zandkleur, zonder grepen.' })
const BEZIG = ['Foto’s bekijken', 'Indeling bepalen', 'Vakregels controleren', 'Tekeningen maken']

async function verklein(file: File): Promise<Foto> {
  const bmp = await createImageBitmap(file)
  const max = 1568, f = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * f); c.height = Math.round(bmp.height * f)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const url = c.toDataURL('image/jpeg', 0.85)
  return { media_type: 'image/jpeg', data: url.split(',')[1], voorbeeld: url }
}

const API = process.env.NEXT_PUBLIC_KAST_API ?? 'https://app.bylder.com/api/kast'
const APP = 'https://app.bylder.com'
const OPSLAG = 'bylder-kastontwerp'

export default function Ontwerper({ start }: { start?: string }) {
  const [id, setId] = useState<string | null>(null)
  const [ontwerp, setOntwerp] = useState<Ontwerp | null>(null)
  const [gesprek, setGesprek] = useState<Regel[]>([])
  const [tekst, setTekst] = useState('')
  const [fotos, setFotos] = useState<Foto[]>([])
  const [bezig, setBezig] = useState(false)
  const [bezigStap, setBezigStap] = useState(0)
  const [fout, setFout] = useState('')
  const [tab, setTab] = useState<Tab>('3d')
  const [open, setOpen] = useState(false)
  const [sleep, setSleep] = useState(false)
  const [sleutel, setSleutel] = useState<string | null>(null)
  const [nodigEmail, setNodigEmail] = useState(false)
  const [bewaard, setBewaard] = useState(false)
  const eind = useRef<HTMLDivElement>(null)
  const veld = useRef<HTMLTextAreaElement>(null)
  const bestand = useRef<HTMLInputElement>(null)

  const bouw = useMemo(() => (ontwerp ? bouwKast(ontwerp) : null), [ontwerp])
  const voorbeeldBouw = useMemo(() => bouwKast(VOORBEELD_HOEKKAST), [])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    let id0 = q.get('id'), s0 = q.get('s')
    if (!id0 || !s0) { try { const o = JSON.parse(localStorage.getItem(OPSLAG) || 'null'); if (o?.id && o?.s) { id0 = o.id; s0 = o.s } } catch {} }
    if (id0 && s0) laad(id0, s0)
    const st = q.get('start') || start
    const gevonden = STARTERS.find(x => x.slug === st)
    if (gevonden && !(id0 && s0)) setTekst(gevonden.tekst)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Naar het laatste bericht: binnen het gesprekvenster als dat scrollt (desktop).
  // Op een telefoon groeit het venster mee; dan alleen de pagina meeschuiven als er
  // al een gesprek is, anders springt een lege pagina bij het laden naar beneden.
  const lijst = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = lijst.current
    if (!el || (gesprek.length === 0 && !bezig)) return
    if (el.scrollHeight > el.clientHeight + 4) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    else eind.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [gesprek, bezig])
  useEffect(() => {
    if (!bezig) return
    const t = setInterval(() => setBezigStap(s => Math.min(s + 1, BEZIG.length - 1)), 7000)
    return () => clearInterval(t)
  }, [bezig])
  useEffect(() => { const v = veld.current; if (v) { v.style.height = 'auto'; v.style.height = Math.min(220, v.scrollHeight) + 'px' } }, [tekst])

  function zetId(nieuw: string | null, s: string | null = null) {
    setId(nieuw); setSleutel(s)
    const u = new URL(window.location.href)
    u.searchParams.delete('start')
    if (nieuw && s) { u.searchParams.set('id', nieuw); u.searchParams.set('s', s) } else { u.searchParams.delete('id'); u.searchParams.delete('s') }
    window.history.replaceState(null, '', u.toString())
    try { if (nieuw && s) localStorage.setItem(OPSLAG, JSON.stringify({ id: nieuw, s })); else localStorage.removeItem(OPSLAG) } catch {}
  }

  async function laad(sid: string, s: string) {
    setFout('')
    try {
      const r = await fetch(`${API}?id=${encodeURIComponent(sid)}&s=${encodeURIComponent(s)}`); const j = await r.json()
      if (!r.ok) { zetId(null); return }
      zetId(j.id, j.sleutel ?? s); setOntwerp(j.ontwerp); setGesprek(j.gesprek ?? []); setBewaard(!!j.bewaard)
    } catch { /* geen verbinding: begin leeg */ }
  }

  function nieuw(voorbeeld = false) {
    setFout(''); setGesprek([]); setOntwerp(null); zetId(null); setTekst(''); setFotos([]); setOpen(false); setNodigEmail(false); setBewaard(false)
    if (voorbeeld) setTekst(STARTERS[0].tekst)
    veld.current?.focus()
  }

  async function kiesFotos(lijst: FileList | File[] | null) {
    if (!lijst) return
    const beelden = [...lijst].filter(f => /^image\/(jpeg|png|webp)$/.test(f.type))
    const nieuw = await Promise.all(beelden.slice(0, 4 - fotos.length).map(verklein))
    setFotos(f => [...f, ...nieuw].slice(0, 4))
  }

  async function verstuur(e?: React.FormEvent) {
    e?.preventDefault()
    if (bezig || (!tekst.trim() && !fotos.length)) return
    setBezigStap(0); setBezig(true); setFout('')
    const mijn: Regel = { rol: 'koper', tekst: tekst.trim(), fotos: fotos.length }
    setGesprek(g => [...g, mijn])
    const body = { id, s: sleutel, tekst: tekst.trim(), fotos: fotos.map(({ media_type, data }) => ({ media_type, data })) }
    const terug = { tekst, fotos }
    setTekst(''); setFotos([])
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!r.ok) { if (j.nodigEmail) setNodigEmail(true); setFout(j.nodigEmail ? '' : (j.error || 'Er ging iets mis.')); setGesprek(g => g.slice(0, -1)); setTekst(terug.tekst); setFotos(terug.fotos); return }
      zetId(j.id, j.sleutel); setBewaard(!!j.bewaard)
      if (j.ontwerp) { setOntwerp(j.ontwerp); setTab('3d') }
      setGesprek(j.gesprek ?? [])
      if (j.fouten?.length) setFout('Het laatste voorstel brak nog vakregels; je ziet het vorige ontwerp.')
    } catch { setFout('De ontwerper reageerde niet. Probeer het opnieuw.') }
    finally { setBezig(false) }
  }

  const leeg = gesprek.length === 0 && !bezig
  const kan = !bezig && (tekst.trim().length > 0 || fotos.length > 0)

  return (
    <div className="ko">
      <style>{CSS}</style>
      <div className="ko-licht" aria-hidden="true"><span /><span /><span /></div>
      <div className="ko-wrap">
        <header className="ko-kop">
          <div>
            <div className="ko-label">Bylder maatwerk · kast op maat</div>
            <h1>Ontwerp een kast die precies past</h1>
            <p>Laat zien wat je mooi vindt en vertel waar hij komt. De ontwerper tekent hem uit, tot op de zaaglijst voor het timmerbedrijf.</p>
          </div>
          <div className="ko-acties">
            <button type="button" className="ko-knop" onClick={() => nieuw(false)}><ArrowsClockwise size={16} aria-hidden="true" />Nieuw ontwerp</button>
          </div>
        </header>

        <div className="ko-grid">
          {/* ── Gesprek ── */}
          <section className={`ko-paneel ko-gesprek${sleep ? ' ko-sleep' : ''}`} aria-label="Gesprek met de ontwerper"
            onDragOver={e => { e.preventDefault(); setSleep(true) }} onDragLeave={() => setSleep(false)}
            onDrop={e => { e.preventDefault(); setSleep(false); kiesFotos(e.dataTransfer.files) }}>
            <div className="ko-berichten" ref={lijst}>
              {leeg && (
                <div className="ko-start">
                  <ol className="ko-stappen">
                    <li><span className="ko-icoon"><Images size={20} /></span><div><strong>Laat zien wat je mooi vindt</strong><span>1 tot 4 foto’s van kasten die je aanspreken. Kleur en stijl haalt de ontwerper eruit.</span></div></li>
                    <li><span className="ko-icoon"><Ruler size={20} /></span><div><strong>Vertel waar hij komt</strong><span>Welke muur of hoek, hoeveel ruimte, hoe hoog het plafond is en wat erin moet.</span></div></li>
                    <li><span className="ko-icoon"><MagicWand size={20} /></span><div><strong>De ontwerper tekent hem uit</strong><span>In 3D, met maten en zaaglijst. Daarna stuur je bij in gewone taal.</span></div></li>
                  </ol>
                  <div className="ko-label ko-label-klein">Of begin met</div>
                  <div className="ko-starters">
                    {STARTERS.map(s => (
                      <button key={s.titel} type="button" onClick={() => { setTekst(s.tekst); veld.current?.focus() }}>
                        <s.icoon size={18} aria-hidden="true" /><span>{s.titel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {gesprek.map((r, i) => (
                <div key={i} className={`ko-bericht ko-${r.rol}`}>
                  {r.rol === 'ontwerper' && <span className="ko-avatar" aria-hidden="true">B.</span>}
                  <div className="ko-bel">
                    {r.fotos > 0 && <div className="ko-fotolabel"><Images size={14} aria-hidden="true" /> {r.fotos} {r.fotos === 1 ? 'foto' : 'foto’s'}</div>}
                    {r.tekst}
                  </div>
                </div>
              ))}
              {bezig && (
                <div className="ko-bericht ko-ontwerper" role="status">
                  <span className="ko-avatar ko-avatar-bezig" aria-hidden="true">B.</span>
                  <div className="ko-bel ko-bezig">
                    <span className="ko-puntjes" aria-hidden="true"><i /><i /><i /></span>
                    <span>{BEZIG[bezigStap]}…</span>
                    <div className="ko-voortgang" aria-hidden="true">{BEZIG.map((_, i) => <b key={i} className={i <= bezigStap ? 'aan' : ''} />)}</div>
                  </div>
                </div>
              )}
              <div ref={eind} />
            </div>

            <form className="ko-composer" onSubmit={verstuur}>
              {nodigEmail && id && sleutel && <EmailPoort id={id} s={sleutel} onKlaar={() => { setNodigEmail(false); setBewaard(true); setTimeout(() => verstuur(), 50) }} />}
              {fotos.length > 0 && (
                <div className="ko-duimen">
                  {fotos.map((f, i) => (
                    <div key={i} className="ko-duim">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.voorbeeld} alt={`Foto ${i + 1}`} />
                      <button type="button" aria-label={`Foto ${i + 1} weghalen`} onClick={() => setFotos(fs => fs.filter((_, k) => k !== i))}><X size={12} weight="bold" /></button>
                    </div>
                  ))}
                  {fotos.length < 4 && <button type="button" className="ko-duim-plus" onClick={() => bestand.current?.click()} aria-label="Nog een foto toevoegen">+</button>}
                </div>
              )}
              <div className="ko-invoer">
                <button type="button" className="ko-rond" onClick={() => bestand.current?.click()} aria-label="Foto’s toevoegen" title="Foto’s toevoegen"><Paperclip size={20} /></button>
                <label htmlFor="kast-tekst" className="ko-verborgen">Bericht aan de ontwerper</label>
                <textarea id="kast-tekst" ref={veld} value={tekst} rows={1} onChange={e => setTekst(e.target.value)}
                  placeholder={leeg ? 'Beschrijf je kast, of sleep hier foto’s naartoe…' : 'Bijv. ‘bovenkasten iets hoger’ of ‘alleen rechts een ronde kop’'}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); verstuur() } }} />
                <button type="submit" className="ko-rond ko-stuur" disabled={!kan} aria-label="Verstuur"><PaperPlaneRight size={20} weight="fill" /></button>
                <input ref={bestand} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { kiesFotos(e.target.files); e.target.value = '' }} hidden />
              </div>
              {fout ? <p role="alert" className="ko-fout">{fout}</p> : <p className="ko-hint">Enter verstuurt · Shift+Enter voor een nieuwe regel</p>}
            </form>
            {sleep && <div className="ko-dropzone" aria-hidden="true"><Images size={34} /><span>Laat los om toe te voegen</span></div>}
          </section>

          {/* ── De kast ── */}
          <section className="ko-paneel ko-podium" aria-label="De kast">
            {!bouw || !ontwerp ? (
              <div className="ko-showcase">
                <Kast3D bouw={voorbeeldBouw} afwerking={VOORBEELD_HOEKKAST.afwerking} binnen="wit" open={false} draai hoogte="100%" achtergrond="#E9E3D8" />
                <div className="ko-showcase-kaart">
                  <div className="ko-label ko-label-klein">Voorbeeld</div>
                  <strong>Hoekkast met ronde koppen</strong>
                  <span>Ontworpen uit twee foto’s en drie zinnen. Jouw ontwerp verschijnt hier.</span>
                  <button type="button" className="ko-knop ko-knop-klein" onClick={() => nieuw(true)}>Begin met dit voorbeeld</button>
                </div>
              </div>
            ) : (
              <>
                <div className="ko-podiumkop">
                  <div className="ko-tabs" role="tablist" aria-label="Weergave">
                    {([['3d', '3D', Cube], ['aanzicht', 'Aanzicht', Door], ['plattegrond', 'Plattegrond', SquaresFour], ['werkplaats', 'Werkplaats', Package]] as const).map(([t, label, Icon]) => (
                      <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'aan' : ''} onClick={() => setTab(t)}><Icon size={16} aria-hidden="true" />{label}</button>
                    ))}
                  </div>
                  {tab === '3d' && <button type="button" className="ko-knop ko-knop-klein" aria-pressed={open} onClick={() => setOpen(o => !o)}>{open ? 'Deuren dicht' : 'Deuren open'}</button>}
                </div>
                <div className="ko-titel">
                  <strong>{ontwerp.naam}</strong>
                  <div className="ko-chips">
                    {bouw.maten.benen.map(b => <span key={b.muur}>{b.muur} {String(b.lengte).replace('.', ',')} cm</span>)}
                    <span>{bouw.maten.hoogte} cm hoog</span><span>{bouw.maten.diepte} cm diep</span>
                    <span><i className="ko-staal" style={{ background: ontwerp.afwerking.hex }} />{ontwerp.afwerking.naam}</span>
                    <span className={ontwerp.maatstatus === 'gemeten' ? 'ko-gemeten' : 'ko-indicatief'}>{ontwerp.maatstatus === 'gemeten' ? 'Maten gemeten' : 'Maten indicatief · wordt ingemeten'}</span>
                  </div>
                </div>
                <div className="ko-weergave">
                  {tab === '3d' && <Kast3D bouw={bouw} afwerking={ontwerp.afwerking} binnen={ontwerp.binnen} open={open} hoogte={480} achtergrond="#EDE9E2" />}
                  {tab === 'aanzicht' && <div className="ko-tekening"><div style={{ minWidth: 520 }}><Uitslag bouw={bouw} ontwerp={ontwerp} /></div></div>}
                  {tab === 'plattegrond' && <div className="ko-tekening"><div style={{ maxWidth: 560, margin: '0 auto' }}><Plattegrond bouw={bouw} /></div></div>}
                  {tab === 'werkplaats' && <Werkplaats bouw={bouw} />}
                </div>
                {ontwerp.notities?.length ? <ul className="ko-notities">{ontwerp.notities.map((n, i) => <li key={i}>{n}</li>)}</ul> : null}
                {id && sleutel && <Meenemen id={id} s={sleutel} bewaard={bewaard} onBewaard={() => setBewaard(true)} />}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

async function bewaar(id: string, s: string, email: string) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actie: 'bewaar', id, s, email }) })
  const j = await r.json().catch(() => ({}))
  return r.ok ? null : (j.error || 'Bewaren mislukt')
}

function EmailPoort({ id, s, onKlaar }: { id: string; s: string; onKlaar: () => void }) {
  const [email, setEmail] = useState('')
  const [fout, setFout] = useState('')
  const [bezig, setBezig] = useState(false)
  return (
    <div className="ko-poort" role="group" aria-label="E-mailadres om verder te ontwerpen">
      <strong>Je ontwerp bewaren en verder ontwerpen?</strong>
      <span>Laat je e-mailadres achter. Je krijgt een link om later verder te gaan. Geen nieuwsbrief.</span>
      <div className="ko-poort-rij">
        <label htmlFor="kast-email" className="ko-verborgen">E-mailadres</label>
        <input id="kast-email" type="email" autoComplete="email" placeholder="jij@voorbeeld.nl" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="button" className="ko-knop ko-knop-primair" disabled={bezig || !email.includes('@')} onClick={async () => { setBezig(true); const f = await bewaar(id, s, email); setBezig(false); if (f) setFout(f); else onKlaar() }}>{bezig ? 'Bezig…' : 'Bewaar en ga verder'}</button>
      </div>
      {fout && <p role="alert" className="ko-fout">{fout}</p>}
    </div>
  )
}

function Meenemen({ id, s, bewaard, onBewaard }: { id: string; s: string; bewaard: boolean; onBewaard: () => void }) {
  const [email, setEmail] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const link = `${APP}/dashboard/kast/koppel?id=${encodeURIComponent(id)}&s=${encodeURIComponent(s)}`
  return (
    <div className="ko-offerte">
      <div className="ko-offerte-rij">
        <div><strong>Tevreden? Vraag een offerte aan</strong><span>Neem je ontwerp mee naar je gratis Bylder-omgeving. Daar vraag je de offerte aan bij het timmerbedrijf, en ontwerp je verder op de plattegrond van je woning.</span></div>
        <a className="ko-knop ko-knop-primair" href={link}>Neem mee en vraag offerte aan</a>
      </div>
      {!bewaard && (
        <div className="ko-poort-rij" style={{ marginTop: 12 }}>
          <label htmlFor="kast-bewaar" className="ko-verborgen">E-mailadres om je ontwerp te bewaren</label>
          <input id="kast-bewaar" type="email" autoComplete="email" placeholder="Of bewaar het: je e-mailadres" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="button" className="ko-knop ko-knop-klein" disabled={bezig || !email.includes('@')} onClick={async () => { setBezig(true); const f = await bewaar(id, s, email); setBezig(false); if (f) setFout(f); else onBewaard() }}>Mail mij de link</button>
        </div>
      )}
      {bewaard && <p className="ko-hint" style={{ marginTop: 8 }}>Bewaard. Je hebt een mail met een link om verder te gaan.</p>}
      {fout && <p role="alert" className="ko-fout">{fout}</p>}
    </div>
  )
}

const CSS = `
.ko{--papier:#F5F0E8;--inkt:#1A1208;--tekst:#3D2E1E;--zacht:rgba(61,46,30,.62);--lijn:rgba(61,46,30,.12);--mos:#3D5A3E;--mos2:#2F4730;--koper:#B85C38;--perzik:#E8A87C;--blauw:#6A84A0;
  position:relative;min-height:100vh;background:var(--papier);color:var(--tekst);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow:hidden;isolation:isolate}
.ko::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;
  background-image:linear-gradient(rgba(61,46,30,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(61,46,30,.055) 1px,transparent 1px),linear-gradient(rgba(61,46,30,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(61,46,30,.03) 1px,transparent 1px);
  background-size:120px 120px,120px 120px,24px 24px,24px 24px;mask-image:radial-gradient(ellipse 90% 70% at 50% 20%,#000 30%,transparent 85%);-webkit-mask-image:radial-gradient(ellipse 90% 70% at 50% 20%,#000 30%,transparent 85%)}
.ko-licht{position:absolute;inset:0;z-index:-2;pointer-events:none;filter:blur(70px);opacity:.75}
.ko-licht span{position:absolute;border-radius:50%;animation:ko-drijf 26s ease-in-out infinite alternate}
.ko-licht span:nth-child(1){width:520px;height:520px;left:-120px;top:-160px;background:rgba(61,90,62,.28)}
.ko-licht span:nth-child(2){width:460px;height:460px;right:-100px;top:60px;background:rgba(232,168,124,.38);animation-duration:32s;animation-delay:-8s}
.ko-licht span:nth-child(3){width:420px;height:420px;left:35%;bottom:-220px;background:rgba(106,132,160,.30);animation-duration:38s;animation-delay:-14s}
@keyframes ko-drijf{0%{transform:translate(0,0) scale(1)}50%{transform:translate(60px,40px) scale(1.12)}100%{transform:translate(-40px,80px) scale(.95)}}
.ko-wrap{max-width:1360px;margin:0 auto;padding:26px 20px 64px}
.ko-terug{font-size:13px;color:var(--zacht);text-decoration:none}
.ko-terug:hover{color:var(--inkt)}
.ko-kop{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-end;justify-content:space-between;margin:10px 0 22px}
.ko-kop h1{font-size:clamp(1.8rem,3.4vw,2.6rem);line-height:1.08;letter-spacing:-.035em;font-weight:800;color:var(--inkt);margin:.25em 0 .3em;text-wrap:balance;max-width:18ch}
.ko-kop p{margin:0;max-width:60ch;font-size:15.5px;line-height:1.6;color:var(--zacht)}
.ko-label{font:700 11.5px/1 ui-monospace,'SFMono-Regular',Menlo,monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--koper);margin-top:14px}
.ko-label-klein{margin:0 0 10px;font-size:10.5px}
.ko-acties{display:flex;gap:10px;flex-wrap:wrap}
.ko-knop{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14px;font-family:inherit;padding:11px 16px;border-radius:12px;border:1px solid var(--lijn);background:rgba(255,255,255,.8);color:var(--inkt);cursor:pointer;backdrop-filter:blur(8px);transition:transform .15s,box-shadow .15s,background .15s}
.ko-knop:hover{background:#fff;box-shadow:0 6px 18px -8px rgba(26,18,8,.25);transform:translateY(-1px)}
.ko-knop-klein{padding:8px 13px;font-size:13px}
.ko-select{display:inline-flex;align-items:center;gap:8px;padding:0 6px 0 14px;border-radius:12px;border:1px solid var(--lijn);background:rgba(255,255,255,.8);color:var(--zacht);backdrop-filter:blur(8px)}
.ko-select select{border:0;background:transparent;font-weight:600;font-size:14px;font-family:inherit;color:var(--inkt);padding:11px 6px;cursor:pointer;outline:none}
.ko-grid{display:grid;gap:20px;grid-template-columns:minmax(0,5fr) minmax(0,7fr);align-items:start}
@media (max-width:980px){.ko-grid{grid-template-columns:1fr}.ko-podium{order:-1}}
.ko-paneel{position:relative;background:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.9);border-radius:24px;box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 24px 60px -30px rgba(26,18,8,.35),0 2px 6px -2px rgba(26,18,8,.08);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);min-width:0}
.ko-gesprek{display:flex;flex-direction:column;height:min(760px,calc(100vh - 190px));min-height:560px}
.ko-berichten{flex:1;overflow-y:auto;padding:22px 22px 8px;display:grid;gap:14px;align-content:start}
.ko-start{display:grid;gap:18px}
.ko-stappen{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.ko-stappen li{display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-radius:16px;background:linear-gradient(180deg,#fff,rgba(245,240,232,.6));border:1px solid var(--lijn);animation:ko-in .5s both}
.ko-stappen li:nth-child(2){animation-delay:.08s}.ko-stappen li:nth-child(3){animation-delay:.16s}
.ko-stappen strong{display:block;color:var(--inkt);font-size:15px;margin-bottom:2px}
.ko-stappen span:not(.ko-icoon){font-size:13.5px;line-height:1.5;color:var(--zacht)}
.ko-icoon{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--mos);color:#F5F0E8;box-shadow:0 6px 14px -6px rgba(61,90,62,.7)}
@keyframes ko-in{from{opacity:.0;transform:translateY(6px)}to{opacity:1;transform:none}}
.ko-starters{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}
.ko-starters button{display:flex;gap:10px;align-items:center;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid var(--lijn);background:#fff;font-weight:600;font-size:13.5px;font-family:inherit;color:var(--inkt);cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}
.ko-starters button svg{color:var(--koper);flex:none}
.ko-starters button:hover{border-color:rgba(184,92,56,.45);transform:translateY(-1px);box-shadow:0 8px 20px -12px rgba(184,92,56,.6)}
.ko-bericht{display:flex;gap:10px;align-items:flex-end;animation:ko-in .35s both}
.ko-koper{justify-content:flex-end}
.ko-bel{max-width:86%;padding:12px 15px;border-radius:18px;font-size:14.5px;line-height:1.6;white-space:pre-wrap}
.ko-koper .ko-bel{background:linear-gradient(160deg,var(--mos),var(--mos2));color:#F5F0E8;border-bottom-right-radius:6px;box-shadow:0 10px 24px -14px rgba(47,71,48,.9)}
.ko-ontwerper .ko-bel{background:#fff;border:1px solid var(--lijn);color:var(--tekst);border-bottom-left-radius:6px}
.ko-avatar{flex:none;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--mos);color:#F5F0E8;font:700 12px ui-monospace,Menlo,monospace}
.ko-avatar-bezig{animation:ko-puls 1.6s ease-in-out infinite}
@keyframes ko-puls{0%,100%{box-shadow:0 0 0 0 rgba(61,90,62,.45)}50%{box-shadow:0 0 0 8px rgba(61,90,62,0)}}
.ko-fotolabel{display:flex;align-items:center;gap:5px;font-size:12px;opacity:.8;margin-bottom:4px}
.ko-bezig{display:grid;gap:8px;min-width:220px;color:var(--zacht)}
.ko-bezig>span:not(.ko-puntjes){font-weight:600;color:var(--inkt)}
.ko-puntjes{display:inline-flex;gap:4px}
.ko-puntjes i{width:7px;height:7px;border-radius:50%;background:var(--koper);animation:ko-hup 1.2s infinite ease-in-out}
.ko-puntjes i:nth-child(2){animation-delay:.15s}.ko-puntjes i:nth-child(3){animation-delay:.3s}
@keyframes ko-hup{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}
.ko-voortgang{display:flex;gap:4px}
.ko-voortgang b{flex:1;height:3px;border-radius:2px;background:var(--lijn);transition:background .6s}
.ko-voortgang b.aan{background:var(--mos)}
.ko-composer{padding:12px 14px 14px;border-top:1px solid var(--lijn)}
.ko-duimen{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.ko-duim{position:relative}
.ko-duim img{width:64px;height:64px;object-fit:cover;border-radius:12px;display:block;box-shadow:0 4px 12px -6px rgba(26,18,8,.5)}
.ko-duim button{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:11px;border:2px solid #fff;background:var(--inkt);color:#fff;cursor:pointer;display:grid;place-items:center;padding:0}
.ko-duim-plus{width:64px;height:64px;border-radius:12px;border:1.5px dashed rgba(61,46,30,.3);background:transparent;font-size:22px;color:var(--zacht);cursor:pointer}
.ko-invoer{display:flex;align-items:flex-end;gap:8px;padding:6px;border-radius:18px;background:#fff;border:1.5px solid var(--lijn);transition:border-color .15s,box-shadow .15s}
.ko-invoer:focus-within{border-color:var(--mos);box-shadow:0 0 0 4px rgba(61,90,62,.12)}
.ko-invoer textarea{flex:1;min-width:0;border:0;outline:none;resize:none;font-size:15px;line-height:1.5;font-family:inherit;padding:9px 4px;background:transparent;color:var(--inkt);max-height:220px}
.ko-rond{flex:none;width:42px;height:42px;border-radius:13px;border:0;display:grid;place-items:center;cursor:pointer;background:transparent;color:var(--zacht);transition:background .15s,color .15s,transform .15s}
.ko-rond:hover{background:var(--papier);color:var(--inkt)}
.ko-stuur{background:var(--mos);color:#F5F0E8}
.ko-stuur:hover{background:var(--mos2);color:#fff;transform:translateY(-1px)}
.ko-stuur:disabled{background:rgba(61,46,30,.12);color:rgba(61,46,30,.4);cursor:default;transform:none}
.ko-hint{margin:8px 4px 0;font-size:12px;color:rgba(61,46,30,.45)}
.ko-fout{margin:8px 4px 0;font-size:13px;color:#8C2F1E}
.ko-verborgen{position:absolute;left:-9999px}
.ko-sleep{outline:2px dashed var(--mos);outline-offset:-8px}
.ko-dropzone{position:absolute;inset:8px;border-radius:18px;background:rgba(61,90,62,.08);display:grid;place-content:center;justify-items:center;gap:8px;color:var(--mos);font-weight:700;pointer-events:none}
.ko-podium{padding:14px}
.ko-showcase{position:relative;height:min(760px,calc(100vh - 190px));min-height:560px;border-radius:18px;overflow:hidden}
.ko-showcase-kaart{position:absolute;left:18px;bottom:18px;max-width:320px;display:grid;gap:6px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,.86);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.9);box-shadow:0 18px 40px -22px rgba(26,18,8,.5)}
.ko-showcase-kaart strong{color:var(--inkt);font-size:16px}
.ko-showcase-kaart span{font-size:13.5px;line-height:1.5;color:var(--zacht)}
.ko-showcase-kaart .ko-knop{justify-self:start;margin-top:4px}
.ko-podiumkop{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:12px}
.ko-tabs{display:inline-flex;gap:2px;padding:4px;border-radius:14px;background:var(--papier);border:1px solid var(--lijn);flex-wrap:wrap}
.ko-tabs button{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:10px;border:0;background:transparent;font-weight:600;font-size:13.5px;font-family:inherit;color:var(--zacht);cursor:pointer;transition:background .15s,color .15s}
.ko-tabs button:hover{color:var(--inkt)}
.ko-tabs button.aan{background:#fff;color:var(--inkt);box-shadow:0 2px 8px -3px rgba(26,18,8,.25)}
.ko-titel{display:grid;gap:8px;margin:0 2px 12px}
.ko-titel strong{font-size:17px;color:var(--inkt);letter-spacing:-.01em}
.ko-chips{display:flex;flex-wrap:wrap;gap:6px}
.ko-chips span{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:5px 10px;border-radius:999px;background:var(--papier);border:1px solid var(--lijn);color:var(--tekst);font-variant-numeric:tabular-nums}
.ko-staal{width:12px;height:12px;border-radius:4px;display:inline-block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}
.ko-tekening{overflow-x:auto;background:#fff;border-radius:16px;border:1px solid var(--lijn);padding:12px}
.ko-notities{margin:12px 4px 0;padding-left:18px;font-size:13px;color:var(--zacht);line-height:1.6}

.ko-gemeten{background:rgba(61,90,62,.1)!important;border-color:rgba(61,90,62,.25)!important;color:var(--mos)!important}
.ko-indicatief{background:rgba(232,168,124,.18)!important;border-color:rgba(184,92,56,.3)!important;color:#8A4A2A!important}
.ko-knop-primair{background:var(--mos);color:#F5F0E8;border-color:var(--mos)}
.ko-knop-primair:hover{background:var(--mos2)}
.ko-knop-primair:disabled{opacity:.5;cursor:not-allowed;transform:none}
.ko-offerte{margin-top:14px;padding:16px 18px;border-radius:18px;background:linear-gradient(135deg,rgba(61,90,62,.08),rgba(232,168,124,.12));border:1px solid var(--lijn)}
.ko-offerte strong{display:block;color:var(--inkt);font-size:15.5px}
.ko-offerte span{font-size:13.5px;color:var(--zacht);line-height:1.5}
.ko-offerte-rij{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.ko-offerte-klaar{display:grid;gap:4px}
.ko-offerte-form{display:grid;gap:12px}
.ko-velden{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))}
.ko-veld{display:grid;gap:5px}
.ko-veld span{font-size:12.5px;font-weight:600;color:var(--zacht)}
.ko-veld input,.ko-veld textarea{font:inherit;font-size:14px;padding:10px 12px;border-radius:11px;border:1.5px solid var(--lijn);background:#fff;color:var(--inkt)}
.ko-akkoord{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.5}
.ko-poort{display:grid;gap:6px;padding:14px 16px;margin-bottom:10px;border-radius:16px;background:linear-gradient(135deg,rgba(232,168,124,.16),rgba(61,90,62,.08));border:1px solid var(--lijn)}
.ko-poort strong{color:var(--inkt);font-size:15px}
.ko-poort span{font-size:13.5px;color:var(--zacht);line-height:1.5}
.ko-poort-rij{display:flex;gap:8px;flex-wrap:wrap}
.ko-poort-rij input{flex:1;min-width:180px;font:inherit;font-size:14px;padding:10px 12px;border-radius:11px;border:1.5px solid var(--lijn);background:#fff;color:var(--inkt)}
a.ko-knop{text-decoration:none}
.ko-laden{height:100%;min-height:300px;display:grid;place-items:center;color:var(--zacht);font-size:13px}
.ko button:focus-visible,.ko select:focus-visible{outline:2px solid var(--koper);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.ko *{animation:none!important;transition:none!important}}
@media (max-width:640px){.ko-gesprek{height:auto;min-height:0}.ko-berichten{max-height:none}.ko-showcase{height:420px;min-height:0}.ko-wrap{padding:18px 14px 48px}}
`
