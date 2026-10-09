'use client'

// De gietvloerontwerper. Dit bestand staat letterlijk gelijk in twee repo's:
//   website  web/app/components/gietvloer/Ontwerper.tsx   (modus 'site', zonder account)
//   app      src/components/gietvloer/Ontwerper.tsx       (modus 'app', ingelogd)
// Pas ze samen aan. Wat per omgeving verschilt, komt binnen via props.
//
// DE ROUTE
// 1. Inspiratiefoto: de AI leest kleur, toon, glans en uitstraling; wij zoeken de drie
//    dichtstbijzijnde kleuren op de kaart (CIEDE2000, zoals het oog kleur ziet).
// 2. Je woning: de ruimtes uit je tekening (Mijn woning), per verdieping aan of uit, en
//    de vloer kleurt mee. Zonder tekening vul je de ruimtes zelf in.
// 3. Type: PU, epoxy of cementgebonden, met eerlijke voor- en nadelen.
// 4. Stalen (tot 3 gratis, Dr. Schutz) en de offerte. Op de website loopt de offerte via
//    een account in de app; in de app vraag je hem direct aan.
//
// Het ontwerp staat op de server (gietvloer_sessies). Op de website met id + geheime
// sleutel in de URL en lokaal bewaard, in de app op het account.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ImageSquare, UploadSimple, Palette, House, Stack, Package, Door, Cube, Check, ArrowRight, Truck, Receipt, Thermometer, Plus, Trash, Info } from '@phosphor-icons/react'
import {
  KLEUREN, TYPES, MAX_STALEN, VOORLOPIG, NIET_GIET, kleurOp, typeOp, m2Van, isLicht, besteKleuren,
  type Analyse, type Keuze, type GekozenRuimte, type Match, type TypeId,
} from './gegevens'

/* ---------------------------------------------------------------- typen */

export type Laag = {
  naam: string
  kader: [number, number, number, number]
  wanden: number[][]
  ruimtes: { id: number; naam: string; m2: number; x: number; y: number; stroken: [number, number, number, number][] }[]
}
type Weergave = {
  id: string; sleutel: string | null; foto: string | null; analyse: Analyse | null; matches: Match[]
  keuze: Keuze; analyses: number; maxAnalyses: number; bewaard: boolean; gekoppeld: boolean; aangevraagd: boolean
  stalen: { datum: string; kleuren: { id: string; naam: string }[] } | null
}
type Props = {
  api: string
  modus: 'site' | 'app'
  /** app: de gemeten woning van de koper; site: leeg (de pagina leest Mijn woning uit de browser) */
  woning?: Laag[] | null
  startGiet?: Record<string, boolean> | null
  naam?: string
}

const APP = 'https://app.bylder.com'
const OPSLAG = 'bylder:gietvloer:v1'
const WONING_OPSLAG = 'bylder:mijn-woning:v1'

const nl = (n: number, d = 0) => n.toLocaleString('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d })
const eur = (n: number) => '€ ' + nl(Math.round(n / 50) * 50)
const mooi = (s: string) => { const t = s.toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1) }

async function verklein(file: File): Promise<{ media_type: 'image/jpeg'; data: string; url: string }> {
  const bmp = await createImageBitmap(file)
  const max = 1568, f = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * f); c.height = Math.round(bmp.height * f)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const url = c.toDataURL('image/jpeg', 0.85)
  return { media_type: 'image/jpeg', data: url.split(',')[1], url }
}

const HANDMATIG: GekozenRuimte[] = [
  { sleutel: 'h-woon', verdieping: 'Begane grond', naam: 'Woonkamer en keuken', m2: 40 },
  { sleutel: 'h-hal', verdieping: 'Begane grond', naam: 'Hal', m2: 6 },
  { sleutel: 'h-overloop', verdieping: 'Eerste verdieping', naam: 'Overloop', m2: 5 },
  { sleutel: 'h-slk1', verdieping: 'Eerste verdieping', naam: 'Slaapkamer 1', m2: 14 },
  { sleutel: 'h-slk2', verdieping: 'Eerste verdieping', naam: 'Slaapkamer 2', m2: 10 },
  { sleutel: 'h-slk3', verdieping: 'Eerste verdieping', naam: 'Slaapkamer 3', m2: 8 },
]

/* ---------------------------------------------------------------- de vloer in je woning */

const COS = Math.cos(Math.PI / 6), YK = 0.5, ZK = 0.62, WH = 900
const iso = (x: number, y: number, z = 0) => [(x - y) * COS, (x + y) * YK - z * ZK]
const pts = (a: number[][]) => a.map(q => { const p = iso(q[0], q[1], q[2] ?? 0); return p[0].toFixed(0) + ',' + p[1].toFixed(0) }).join(' ')

function Wolk({ id, licht, sterkte }: { id: string; licht: boolean; sterkte: number }) {
  // Wolken in de vloer: ruis, uitgeknipt op de vorm van de vloer. Op een lichte vloer
  // donkere wolken, op een donkere vloer lichte.
  const c = licht ? '0' : '1'
  return (
    <filter id={id} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0011" numOctaves={3} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values={`0 0 0 0 ${c}  0 0 0 0 ${c}  0 0 0 0 ${c}  ${2.2 * sterkte} 0 0 0 ${-0.9 * sterkte}`} result="a" />
      <feComposite in="a" in2="SourceAlpha" operator="in" />
    </filter>
  )
}

function VloerPlan({ laag, li, gekozen, kleur, wolk, glans, wissel }: {
  laag: Laag; li: number; gekozen: Set<string>; kleur: string; wolk: number; glans: boolean; wissel: (sleutel: string) => void
}) {
  const k = laag.kader, ox = k[0], oy = k[1]
  const vlakken: { d: number; el: React.ReactNode }[] = []
  laag.wanden.forEach((w, wi) => {
    const a = [w[0] - ox, w[1] - oy, w[2] - ox, w[3] - oy]
    const c = [[a[0], a[1]], [a[2], a[1]], [a[2], a[3]], [a[0], a[3]]]
    ;[[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j], fi) => {
      const p = c[i], q = c[j]
      vlakken.push({ d: (p[0] + q[0] + p[1] + q[1]) / 2, el: <polygon key={`w${wi}-${fi}`} className="gv-muur" points={pts([[p[0], p[1], 0], [q[0], q[1], 0], [q[0], q[1], WH], [p[0], p[1], WH]])} /> })
    })
    vlakken.push({ d: (a[0] + a[2] + a[1] + a[3]) / 2 + 1, el: <polygon key={`wt${wi}`} className="gv-muur gv-muur-top" points={pts(c.map(q => [q[0], q[1], WH]))} /> })
  })
  vlakken.sort((p, q) => p.d - q.d)
  const xs: number[] = [], ys: number[] = []
  ;[[0, 0], [k[2] - ox, 0], [k[2] - ox, k[3] - oy], [0, k[3] - oy]].forEach(q => [0, WH].forEach(z => { const p = iso(q[0], q[1], z); xs.push(p[0]); ys.push(p[1]) }))
  const pad = 500, vx = Math.min(...xs) - pad, vy = Math.min(...ys) - pad, vw = Math.max(...xs) + pad - vx, vh = Math.max(...ys) + pad - vy
  const fid = `gv-wolk-${li}`, gid = `gv-glans-${li}`
  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="gv-plan-svg" role="img" aria-label={`${mooi(laag.naam)}: de ruimtes met gietvloer in de gekozen kleur`}>
      <defs>
        <Wolk id={fid} licht={isLicht(kleur)} sterkte={wolk} />
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      {laag.ruimtes.map(r => {
        const sl = `${li}:${r.id}`, aan = gekozen.has(sl)
        return (
          <g key={sl} className={'gv-ruimte' + (aan ? ' aan' : '')} onClick={() => wissel(sl)}>
            {r.stroken.map((s, si) => {
              const p = pts([[s[0] - ox, s[1] - oy], [s[2] - ox, s[1] - oy], [s[2] - ox, s[3] - oy], [s[0] - ox, s[3] - oy]])
              return (
                <g key={si}>
                  <polygon points={p} fill={aan ? kleur : '#E4DED3'} className="gv-vlak" />
                  {aan && wolk > 0 && <polygon points={p} fill="#000" filter={`url(#${fid})`} />}
                  {aan && glans && <polygon points={p} fill={`url(#${gid})`} />}
                </g>
              )
            })}
          </g>
        )
      })}
      {vlakken.map(v => v.el)}
      {laag.ruimtes.filter(r => r.m2 >= 3).map(r => {
        const p = iso(r.x - ox, r.y - oy, 0), aan = gekozen.has(`${li}:${r.id}`)
        return (
          <g key={`l${r.id}`} className="gv-label" pointerEvents="none">
            <text x={p[0]} y={p[1] - 120} textAnchor="middle" className={'gv-l-naam' + (aan ? '' : ' uit')}>{r.naam}</text>
            <text x={p[0]} y={p[1] + 360} textAnchor="middle" className="gv-l-m2">≈ {nl(r.m2, 1)} m²</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Een vloerstaal in perspectief: zo ligt de kleur op de vloer, met wolken en glans. */
function Staal({ kleur, wolk, glans, label }: { kleur: string; wolk: number; glans: boolean; label?: string }) {
  const id = 'gv-s' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const p = pts([[0, 0], [6000, 0], [6000, 4000], [0, 4000]])
  const z = pts([[6000, 0, 0], [6000, 4000, 0], [6000, 4000, -260], [6000, 0, -260]])
  const v = pts([[0, 4000, 0], [6000, 4000, 0], [6000, 4000, -260], [0, 4000, -260]])
  return (
    <svg viewBox="-3700 -300 9100 5600" className="gv-staal" role="img" aria-label={label ?? 'Vloerstaal in de gekozen kleur'}>
      <defs>
        <Wolk id={id} licht={isLicht(kleur)} sterkte={wolk} />
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <polygon points={z} fill={kleur} style={{ filter: 'brightness(.78)' }} />
      <polygon points={v} fill={kleur} style={{ filter: 'brightness(.88)' }} />
      <polygon points={p} fill={kleur} />
      {wolk > 0 && <polygon points={p} fill="#000" filter={`url(#${id})`} />}
      {glans && <polygon points={p} fill={`url(#${id}g)`} />}
    </svg>
  )
}

/* ---------------------------------------------------------------- het scherm */

export default function Ontwerper({ api, modus, woning: woningProp, startGiet, naam }: Props) {
  const [w, setW] = useState<Weergave | null>(null)
  const [keuze, setKeuze] = useState<Keuze>({})
  const [woning, setWoning] = useState<Laag[] | null>(woningProp ?? null)
  const [giet, setGiet] = useState<Record<string, boolean> | null>(startGiet ?? null)
  const [laag, setLaag] = useState(0)
  const [handmatig, setHandmatig] = useState<GekozenRuimte[] | null>(null)
  const [handUit, setHandUit] = useState<Set<string>>(new Set())
  const [voorbeeld, setVoorbeeld] = useState<string | null>(null)
  const [lezen, setLezen] = useState(false)
  const [fout, setFout] = useState('')
  const [alleKleuren, setAlleKleuren] = useState(false)
  const [over, setOver] = useState(false)
  const rij = useRef<Promise<unknown>>(Promise.resolve())
  const sessie = useRef<{ id: string; s: string | null } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const geladen = useRef(false)
  const bestand = useRef<HTMLInputElement>(null)
  const teller = useRef(0)

  const bewaarLokaal = (id: string, s: string | null) => {
    sessie.current = { id, s }
    if (modus !== 'site' || !s) return
    try { localStorage.setItem(OPSLAG, JSON.stringify({ id, s })) } catch { /* privévenster */ }
    const u = new URL(window.location.href)
    if (u.searchParams.get('id') !== id) { u.searchParams.set('id', id); u.searchParams.set('s', s); window.history.replaceState(null, '', u) }
  }

  const neem = useCallback((d: Weergave) => {
    setW(d); bewaarLokaal(d.id, d.sleutel)
    // De keuze komt alleen bij binnenkomst van de server; daarna is wat op het scherm staat leidend.
    if (!geladen.current) { geladen.current = true; setKeuze(d.keuze ?? {}) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Alles naar de server gaat achter elkaar: zo ontstaat er nooit twee keer een nieuw ontwerp. */
  const stuur = useCallback((body: Record<string, unknown>) => {
    const p = rij.current.then(async () => {
      const ids = sessie.current ? (modus === 'site' ? { id: sessie.current.id, s: sessie.current.s } : { id: sessie.current.id }) : {}
      const r = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, ...ids }) })
      const d = await r.json().catch(() => ({ error: 'Er ging iets mis. Probeer het opnieuw.' }))
      if (d?.id) neem(d as Weergave)
      if (!r.ok) throw new Error(d?.error ?? 'Er ging iets mis. Probeer het opnieuw.')
      return d
    })
    rij.current = p.catch(() => undefined)
    return p
  }, [api, modus, neem])

  // Bij binnenkomst: het ontwerp terughalen, en op de website de woning uit Mijn woning.
  useEffect(() => {
    const laad = async () => {
      if (modus === 'site') {
        try {
          const o = JSON.parse(localStorage.getItem(WONING_OPSLAG) || 'null')
          if (o && Array.isArray(o.lagen) && o.lagen.length) { setWoning(o.lagen); if (o.giet) setGiet(o.giet) }
        } catch { /* geen woning */ }
      }
      const q = new URLSearchParams(window.location.search)
      let id = q.get('id'), s = q.get('s')
      if (modus === 'site' && (!id || !s)) { try { const o = JSON.parse(localStorage.getItem(OPSLAG) || 'null'); if (o?.id && o?.s) { id = o.id; s = o.s } } catch { /* niets */ } }
      if (modus === 'app' && !id) {
        const l = await fetch(api).then(r => r.json()).catch(() => null)
        id = l?.sessies?.[0]?.id ?? null
      }
      if (!id) return
      const r = await fetch(modus === 'site' ? `${api}?id=${encodeURIComponent(id)}&s=${encodeURIComponent(s ?? '')}` : `${api}?id=${encodeURIComponent(id)}`)
      if (r.ok) neem(await r.json())
      else if (modus === 'site') { try { localStorage.removeItem(OPSLAG) } catch { /* niets */ } }
    }
    laad().catch(() => undefined)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // De ruimtes: uit de tekening (standaard zoals in Mijn woning, anders alles behalve
  // natte ruimtes en trap), of zelf ingevuld.
  const kandidaten: GekozenRuimte[] = useMemo(() => woning
    ? woning.flatMap((l, li) => l.ruimtes.map(r => ({ sleutel: `${li}:${r.id}`, verdieping: mooi(l.naam), naam: r.naam, m2: Math.round(r.m2 * 10) / 10 })))
    : [], [woning])
  // Zolang de koper zelf niets koos: alles uit de tekening behalve natte ruimtes en trap
  // (of wat hij in Mijn woning al aanzette), en zonder tekening een gangbare indeling.
  const standaard: Keuze = useMemo(() => woning
    ? { ruimtes: (() => { const aan = kandidaten.filter(r => giet ? giet[r.sleutel] : !NIET_GIET.test(r.naam)); return aan.length ? aan : kandidaten.filter(r => !NIET_GIET.test(r.naam)) })(), bron: 'tekening' }
    : { ruimtes: HANDMATIG, bron: 'handmatig' }, [woning, kandidaten, giet])
  const metStandaard = (k: Keuze): Keuze => (k.ruimtes && !(woning && k.bron === 'handmatig')) ? k : { ...k, ...standaard }

  /** Keuze aanpassen; na een korte pauze naar de server. */
  function wijzig(deel: Keuze, direct = true) {
    setKeuze(k => {
      const n = { ...metStandaard(k), ...deel }
      if (timer.current) clearTimeout(timer.current)
      const opslaan = () => stuur({ actie: 'keuze', keuze: n }).catch(e => setFout((e as Error).message))
      if (direct || sessie.current) timer.current = setTimeout(opslaan, 500)
      return n
    })
  }
  const eff = metStandaard(keuze)

  const kies = async (f?: File | null) => {
    if (!f) return
    if (!/^image\//.test(f.type)) { setFout('Kies een foto (jpg, png of webp).'); return }
    setFout(''); setLezen(true)
    try {
      const v = await verklein(f)
      setVoorbeeld(v.url)
      const d = await stuur({ actie: 'foto', foto: { media_type: v.media_type, data: v.data } }) as Weergave
      // Kleur van de foto overnemen en meteen de hele keuze (ook de ruimtes) bewaren.
      if (d.keuze?.kleur) wijzig({ kleur: d.keuze.kleur, ...(keuze.type ? {} : { type: d.keuze.type }) })
      setTimeout(() => document.getElementById('gv-kleur')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    } catch (e) { setFout((e as Error).message) } finally { setLezen(false) }
  }

  /* ---- afgeleid ---- */
  const kleur = kleurOp(keuze.kleur) ?? (w?.matches[0]?.kleur ?? null)
  const hex = kleur?.hex ?? '#CBC6BC'
  const type = typeOp(keuze.type)
  const a = w?.analyse ?? null
  const uitstraling = a?.uitstraling ?? (keuze.type === 'cement' ? 'gewolkt' : 'licht gewolkt')
  const wolk = keuze.type === 'cement' ? 0.9 : uitstraling === 'gewolkt' ? 0.7 : uitstraling === 'licht gewolkt' ? 0.35 : 0
  const glans = (a?.glans ?? 'zijdeglans') !== 'mat' && keuze.type !== 'cement'
  const gekozen = new Set((eff.ruimtes ?? []).map(r => r.sleutel))
  const m2 = m2Van(eff)
  const handLijst = handmatig ?? eff.ruimtes ?? HANDMATIG
  const foto = voorbeeld ?? w?.foto ?? null
  const matches = w?.matches?.length ? w.matches : kleur ? besteKleuren(kleur.hex).slice(0, 3) : []

  const wisselTekening = (sl: string) => {
    const nu = new Set(gekozen)
    if (nu.has(sl)) nu.delete(sl); else nu.add(sl)
    wijzig({ ruimtes: kandidaten.filter(r => nu.has(r.sleutel)), bron: 'tekening' })
  }
  const zetHandmatig = (lijst: GekozenRuimte[], uit = handUit) => {
    setHandmatig(lijst)
    wijzig({ ruimtes: lijst.filter(r => !uit.has(r.sleutel) && r.m2 > 0 && r.naam.trim()), bron: 'handmatig' })
  }

  const koppel = w && w.sleutel ? `${APP}/dashboard/gietvloer/koppel?id=${encodeURIComponent(w.id)}&s=${encodeURIComponent(w.sleutel)}` : null

  return (
    <div className="gv">
      <style>{CSS}</style>

      {/* ============ 1. inspiratie ============ */}
      <section className="gv-blok" aria-labelledby="gv-1">
        <p className="gv-stap"><span>1</span>Je inspiratie</p>
        <h2 id="gv-1" className="gv-h2">Laat de vloer zien die je mooi vindt.</h2>
        <p className="gv-lead">Een foto van Pinterest, Instagram of uit een showroom. Wij lezen de kleur, de glans en de wolken, en zoeken de kleuren die er het dichtst bij liggen.</p>
        <div className="gv-foto-rij">
          <label className={'gv-sleep' + (over ? ' over' : '') + (foto ? ' met' : '')} htmlFor="gv-bestand"
            onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); kies(e.dataTransfer.files?.[0]) }}>
            {foto
              ? <img src={foto} alt="Je inspiratiefoto" />
              : <span className="gv-sleep-leeg"><ImageSquare size={34} weight="thin" aria-hidden="true" /><strong>Kies of sleep een foto</strong><span>jpg, png of webp</span></span>}
            {lezen && <span className="gv-lezen" role="status"><i /><i /><i />Kleur en glans lezen…</span>}
          </label>
          <input ref={bestand} id="gv-bestand" type="file" accept="image/jpeg,image/png,image/webp" className="gv-verborgen" onChange={e => { kies(e.target.files?.[0]); e.target.value = '' }} />
          <div className="gv-lezing">
            {a ? (
              <>
                {!a.vloer && <p className="gv-let"><Info size={16} aria-hidden="true" />Dit lijkt geen gietvloer. We hebben de kleur toch gelezen.</p>}
                <div className="gv-gemeten"><i style={{ background: a.hex }} /><div><strong>{mooi(a.kleurnaam)}</strong><span>gemeten {a.hex}</span></div></div>
                <ul className="gv-chips" aria-label="Wat we op de foto zien">
                  <li>{a.toon}</li><li>{a.helderheid}</li><li>{a.glans}</li><li>{a.uitstraling}</li><li>lijkt op {typeOp(a.type)?.naam.toLowerCase()}</li>
                </ul>
                <p className="gv-omschr">{a.omschrijving}</p>
                {a.licht && <p className="gv-klein">{a.licht}</p>}
              </>
            ) : (
              <div className="gv-stappen">
                <p><Palette size={18} aria-hidden="true" />We lezen kleur, toon en glans, en corrigeren voor het licht op de foto.</p>
                <p><House size={18} aria-hidden="true" />Je ziet de vloer in je eigen woning, kamer voor kamer.</p>
                <p><Truck size={18} aria-hidden="true" />Tot drie stalen gratis thuis, verstuurd door Dr. Schutz.</p>
              </div>
            )}
            <div className="gv-acties">
              <button type="button" className="gv-knop" onClick={() => bestand.current?.click()} disabled={lezen}>
                <UploadSimple size={17} aria-hidden="true" />{foto ? 'Andere foto' : 'Kies een foto'}
              </button>
              {!foto && <button type="button" className="gv-knop gv-knop-licht" onClick={() => { setAlleKleuren(true); document.getElementById('gv-kleur')?.scrollIntoView({ behavior: 'smooth' }) }}>Geen foto: kies een kleur</button>}
            </div>
            {fout && <p role="alert" className="gv-fout">{fout}</p>}
          </div>
        </div>

        {/* kleur */}
        <div id="gv-kleur" className="gv-kleurblok">
          <h3 className="gv-h3">{a ? 'Dichtst bij je foto' : 'Kies een kleur'}</h3>
          {a && (
            <div className="gv-matches" role="radiogroup" aria-label="Kleuren die het dichtst bij je foto liggen">
              {matches.map(m => (
                <button key={m.kleur.id} type="button" role="radio" aria-checked={keuze.kleur === m.kleur.id} className="gv-match" onClick={() => wijzig({ kleur: m.kleur.id })}>
                  <Staal kleur={m.kleur.hex} wolk={wolk} glans={glans} label={`Vloerstaal ${m.kleur.naam}`} />
                  <strong>{m.kleur.naam}</strong>
                  <span>{m.oordeel}</span>
                  {keuze.kleur === m.kleur.id && <Check className="gv-vink" size={16} weight="bold" aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
          {(alleKleuren || !a) && (
            <div className="gv-kaart" role="radiogroup" aria-label="Alle kleuren">
              {KLEUREN.map(k => (
                <button key={k.id} type="button" role="radio" aria-checked={keuze.kleur === k.id} onClick={() => wijzig({ kleur: k.id })}>
                  <i style={{ background: k.hex }} />{k.naam}
                </button>
              ))}
            </div>
          )}
          {a && !alleKleuren && <button type="button" className="gv-link" onClick={() => setAlleKleuren(true)}>Alle {KLEUREN.length} kleuren tonen</button>}
          {VOORLOPIG && <p className="gv-klein">Voorlopige kleurenkaart: de kleuren van Dr. Schutz volgen. Vraag je stalen aan, dan stuurt Dr. Schutz de drie kleuren uit hun assortiment die het dichtst bij jouw keuze liggen. Een scherm toont kleur nooit precies; een staal wel.</p>}
        </div>
      </section>

      {/* ============ 2. je woning ============ */}
      <section className="gv-blok" aria-labelledby="gv-2">
        <p className="gv-stap"><span>2</span>Je woning</p>
        <h2 id="gv-2" className="gv-h2">{woning ? 'Kies waar de gietvloer komt.' : 'Waar komt de gietvloer?'}</h2>
        {woning ? (
          <>
            <p className="gv-lead">Tik op een ruimte of vink hem aan. De vloer kleurt mee{kleur ? ` in ${kleur.naam.toLowerCase()}` : ''}.</p>
            {woning.length > 1 && (
              <div className="gv-tabs" role="tablist" aria-label="Verdiepingen">
                {woning.map((l, li) => <button key={li} type="button" role="tab" aria-selected={laag === li} onClick={() => setLaag(li)}>{mooi(l.naam)}</button>)}
              </div>
            )}
            <div className="gv-plan">
              <div className="gv-plan-beeld"><VloerPlan laag={woning[laag]} li={laag} gekozen={gekozen} kleur={hex} wolk={wolk} glans={glans} wissel={wisselTekening} /></div>
              <div className="gv-lijst">
                {woning.map((l, li) => (
                  <fieldset key={li} className="gv-groep">
                    <legend>{mooi(l.naam)}</legend>
                    {l.ruimtes.slice().sort((x, y) => y.m2 - x.m2).map(r => {
                      const sl = `${li}:${r.id}`
                      return (
                        <label key={sl} className="gv-vink-rij">
                          <input type="checkbox" checked={gekozen.has(sl)} onChange={() => wisselTekening(sl)} />
                          <span>{r.naam}</span><span className="gv-mono">≈ {nl(r.m2, 1)} m²</span>
                        </label>
                      )
                    })}
                  </fieldset>
                ))}
              </div>
            </div>
            <p className="gv-klein">Ruimtes en m² komen uit je tekening. De verwerker meet altijd in voordat hij een definitieve prijs geeft.</p>
          </>
        ) : (
          <>
            <p className="gv-lead">Vul je ruimtes in. Weet je de m² niet precies, dan is een schatting genoeg: er wordt altijd ingemeten.</p>
            <div className="gv-hand">
              {handLijst.map((r, i) => (
                <div key={r.sleutel} className={'gv-hand-rij' + (handUit.has(r.sleutel) ? ' uit' : '')}>
                  <input type="checkbox" aria-label={`${r.naam} meenemen`} checked={!handUit.has(r.sleutel)} onChange={() => { const u = new Set(handUit); if (u.has(r.sleutel)) u.delete(r.sleutel); else u.add(r.sleutel); setHandUit(u); zetHandmatig(handLijst, u) }} />
                  <input className="gv-hand-naam" aria-label="Naam van de ruimte" value={r.naam} onChange={e => zetHandmatig(handLijst.map((x, j) => j === i ? { ...x, naam: e.target.value } : x))} />
                  <select aria-label="Verdieping" value={r.verdieping} onChange={e => zetHandmatig(handLijst.map((x, j) => j === i ? { ...x, verdieping: e.target.value } : x))}>
                    {['Begane grond', 'Eerste verdieping', 'Tweede verdieping', 'Zolder'].map(v => <option key={v}>{v}</option>)}
                  </select>
                  <label className="gv-hand-m2"><input type="number" inputMode="decimal" min={1} max={300} aria-label="Vierkante meters" value={r.m2 || ''} onChange={e => zetHandmatig(handLijst.map((x, j) => j === i ? { ...x, m2: Number(e.target.value) } : x))} />m²</label>
                  <button type="button" className="gv-icoon-knop" aria-label={`${r.naam} verwijderen`} onClick={() => zetHandmatig(handLijst.filter((_, j) => j !== i))}><Trash size={16} aria-hidden="true" /></button>
                </div>
              ))}
              <button type="button" className="gv-link" onClick={() => zetHandmatig([...handLijst, { sleutel: `h-${handLijst.length}-${++teller.current}`, verdieping: 'Begane grond', naam: 'Nieuwe ruimte', m2: 10 }])}><Plus size={14} aria-hidden="true" /> Ruimte toevoegen</button>
            </div>
            <div className="gv-tekening-tip">
              <Cube size={22} weight="thin" aria-hidden="true" />
              <div><strong>Heb je de plattegrond van je aannemer?</strong> Zet hem in Mijn woning: wij meten elke kamer uit de tekening en je ziet de vloer in je eigen woning in 3D.</div>
              <Link className="gv-knop gv-knop-licht" href={modus === 'site' ? '/mijn-woning/' : '/dashboard/mijn-woning'}>Naar Mijn woning</Link>
            </div>
          </>
        )}
        <p className="gv-totaal"><Stack size={18} aria-hidden="true" /><strong>≈ {nl(m2, 1)} m² gietvloer</strong> in {(eff.ruimtes ?? []).length} {(eff.ruimtes ?? []).length === 1 ? 'ruimte' : 'ruimtes'}</p>
      </section>

      {/* ============ 3. type ============ */}
      <section className="gv-blok" aria-labelledby="gv-3">
        <p className="gv-stap"><span>3</span>Het type</p>
        <h2 id="gv-3" className="gv-h2">Welke gietvloer past bij jou?</h2>
        <div className="gv-vvw" role="radiogroup" aria-label="Komt er vloerverwarming?">
          <span><Thermometer size={18} aria-hidden="true" />Komt er vloerverwarming?</span>
          {([['ja', 'Ja'], ['nee', 'Nee'], ['weet-niet', 'Weet ik nog niet']] as const).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={keuze.vloerverwarming === v} onClick={() => wijzig({ vloerverwarming: v })}>{l}</button>
          ))}
        </div>
        <div className="gv-typen" role="radiogroup" aria-label="Type gietvloer">
          {TYPES.map(t => (
            <button key={t.id} type="button" role="radio" aria-checked={keuze.type === t.id} className="gv-type" onClick={() => wijzig({ type: t.id as TypeId })}>
              <span className="gv-type-kop">
                <strong>{t.naam}</strong>
                {a?.type === t.id && <em>past bij je foto</em>}
              </span>
              <span className="gv-type-kort">{t.kort}</span>
              <span className="gv-type-sub">Voordelen</span>
              <ul className="gv-voor">{t.voor.map(v => <li key={v}>{v}</li>)}</ul>
              <span className="gv-type-sub">Nadelen</span>
              <ul className="gv-tegen">{t.tegen.map(v => <li key={v}>{v}</li>)}</ul>
              {keuze.vloerverwarming === 'ja' && <span className="gv-type-vvw"><Thermometer size={15} aria-hidden="true" />{t.vloerverwarming}</span>}
              <span className="gv-type-prijs">€ {t.prijs[0]}–{t.prijs[1]} per m²</span>
              {keuze.type === t.id && <Check className="gv-vink" size={18} weight="bold" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <p className="gv-klein">Prijzen zijn een indicatie per m² inclusief btw, uit de Bylder-prijsbenchmark voor gietvloeren. Voorbereiding van de ondervloer en plinten komen er soms bij. Je echte prijs volgt na de opmeting.</p>
      </section>

      {/* ============ 4. stalen en offerte ============ */}
      <section className="gv-blok gv-slot" aria-labelledby="gv-4">
        <p className="gv-stap"><span>4</span>Stalen en offerte</p>
        <h2 id="gv-4" className="gv-h2">Zie hem in het echt, en vraag de prijs.</h2>
        <div className="gv-overzicht">
          <Staal kleur={hex} wolk={wolk} glans={glans} />
          <dl>
            <div><dt>Kleur</dt><dd>{kleur?.naam ?? 'nog niet gekozen'}</dd></div>
            <div><dt>Type</dt><dd>{type?.naam ?? 'nog niet gekozen'}</dd></div>
            <div><dt>Oppervlak</dt><dd>≈ {nl(m2, 1)} m²</dd></div>
            {type && m2 > 0 && <div className="gv-indicatie"><dt>Indicatie</dt><dd>{eur(m2 * type.prijs[0])} – {eur(m2 * type.prijs[1])}</dd></div>}
          </dl>
        </div>
        <div className="gv-twee">
          <Stalen modus={modus} w={w} kleur={keuze.kleur ?? null} matches={matches} naam={naam} stuur={stuur} />
          {modus === 'app'
            ? <Offerte w={w} m2={m2} type={!!type} naam={naam} stuur={stuur} />
            : <Account koppel={koppel} maak={() => stuur({ actie: 'keuze', keuze: eff })} />}
        </div>
        <Woning modus={modus} />
      </section>
    </div>
  )
}

/* ---------------------------------------------------------------- stalen */

function Stalen({ modus, w, kleur, matches, naam, stuur }: {
  modus: 'site' | 'app'; w: Weergave | null; kleur: string | null; matches: Match[]; naam?: string
  stuur: (b: Record<string, unknown>) => Promise<unknown>
}) {
  const beginSleutel = [kleur, ...matches.map(m => m.kleur.id)].filter(Boolean).join(',')
  const begin = useMemo(() => [...new Set(beginSleutel.split(',').filter(Boolean))].slice(0, MAX_STALEN), [beginSleutel])
  const [eigen, setEigen] = useState<string[] | null>(null)
  const gekozen = eigen ?? begin
  const [v, setV] = useState({ naam: naam ?? '', email: '', straat: '', huisnummer: '', postcode: '', plaats: '', telefoon: '' })
  const [akkoord, setAkkoord] = useState(false)
  const [open, setOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  if (w?.stalen) return (
    <div className="gv-kaartje gv-klaar">
      <Truck size={26} weight="thin" aria-hidden="true" />
      <h3>Je stalen zijn aangevraagd</h3>
      <p>Dr. Schutz stuurt je gratis {w.stalen.kleuren.map(k => k.naam).join(', ')}. Leg ze bij daglicht op de plek van de vloer, en kijk ook ’s avonds.</p>
    </div>
  )
  const wissel = (id: string) => {
    setEigen(g => { g = g ?? begin; return g.includes(id) ? g.filter(x => x !== id) : g.length >= MAX_STALEN ? g : [...g, id] })
  }
  const veld = (k: keyof typeof v, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="gv-veld"><span>{label}</span><input value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} {...extra} /></label>
  )
  const verstuur = async () => {
    setFout(''); setBezig(true)
    try { await stuur({ actie: 'stalen', kleuren: gekozen, ...v, akkoord }) } catch (e) { setFout((e as Error).message) } finally { setBezig(false) }
  }
  return (
    <div className="gv-kaartje">
      <Truck size={26} weight="thin" aria-hidden="true" />
      <h3>Tot 3 stalen gratis</h3>
      <p>Dr. Schutz stuurt ze naar je toe. Een staal laat de kleur en de glans beter zien dan een scherm.</p>
      <div className="gv-staal-keuze" role="group" aria-label={`Kies tot ${MAX_STALEN} kleuren`}>
        {KLEUREN.filter(k => gekozen.includes(k.id) || matches.some(m => m.kleur.id === k.id) || k.id === kleur).concat(open ? KLEUREN.filter(k => !gekozen.includes(k.id) && !matches.some(m => m.kleur.id === k.id) && k.id !== kleur) : []).map(k => (
          <button key={k.id} type="button" aria-pressed={gekozen.includes(k.id)} disabled={!gekozen.includes(k.id) && gekozen.length >= MAX_STALEN} onClick={() => wissel(k.id)}>
            <i style={{ background: k.hex }} />{k.naam}
          </button>
        ))}
        {!open && <button type="button" className="gv-link" onClick={() => setOpen(true)}>Andere kleur</button>}
      </div>
      <p className="gv-klein">{gekozen.length} van {MAX_STALEN} gekozen</p>
      <div className="gv-velden">
        {veld('naam', 'Naam', { autoComplete: 'name' })}
        {modus === 'site' && veld('email', 'E-mailadres', { type: 'email', autoComplete: 'email' })}
        <div className="gv-velden-rij">{veld('straat', 'Straat', { autoComplete: 'address-line1' })}{veld('huisnummer', 'Nr.', { autoComplete: 'off', className: 'kort' })}</div>
        <div className="gv-velden-rij">{veld('postcode', 'Postcode', { autoComplete: 'postal-code', className: 'kort' })}{veld('plaats', 'Plaats', { autoComplete: 'address-level2' })}</div>
      </div>
      <label className="gv-akkoord"><input type="checkbox" checked={akkoord} onChange={e => setAkkoord(e.target.checked)} /><span>Bylder geeft mijn naam, adres en de gekozen kleuren door aan Dr. Schutz, zodat zij de stalen kunnen versturen.</span></label>
      <button type="button" className="gv-knop gv-knop-primair" disabled={bezig || !gekozen.length || !akkoord} onClick={verstuur}>
        {bezig ? 'Bezig…' : `Vraag ${gekozen.length === 1 ? 'het staal' : `${gekozen.length} stalen`} gratis aan`}
      </button>
      {fout && <p role="alert" className="gv-fout">{fout}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- offerte (app) */

function Offerte({ w, m2, type, naam, stuur }: { w: Weergave | null; m2: number; type: boolean; naam?: string; stuur: (b: Record<string, unknown>) => Promise<unknown> }) {
  const [v, setV] = useState({ naam: naam ?? '', postcode: '', plaats: '', telefoon: '', planning: '', toelichting: '' })
  const [akkoord, setAkkoord] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState(false)
  if (w?.aangevraagd || klaar) return (
    <div className="gv-kaartje gv-klaar">
      <Receipt size={26} weight="thin" aria-hidden="true" />
      <h3>Je offerte is aangevraagd</h3>
      <p>Een verwerker die Dr. Schutz aanbeveelt krijgt je ruimtes, je kleur en je foto. Hij meet eerst in. De offerte zie je bij Mijn offertes.</p>
      <Link className="gv-knop" href="/dashboard/offertes">Naar mijn offertes<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  )
  const veld = (k: keyof typeof v, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="gv-veld"><span>{label}</span><input value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} {...extra} /></label>
  )
  const klaarVoor = m2 > 0 && type && !!w
  return (
    <div className="gv-kaartje">
      <Receipt size={26} weight="thin" aria-hidden="true" />
      <h3>Vraag de offerte aan</h3>
      <p>Bij een verwerker die Dr. Schutz aanbeveelt. Hij krijgt je ruimtes, kleur en inspiratiefoto, en meet eerst in. Gratis en vrijblijvend.</p>
      <div className="gv-velden">
        {veld('naam', 'Naam', { autoComplete: 'name' })}
        <div className="gv-velden-rij">{veld('postcode', 'Postcode', { autoComplete: 'postal-code', className: 'kort' })}{veld('plaats', 'Plaats', { autoComplete: 'address-level2' })}</div>
        {veld('telefoon', 'Telefoon (handig voor het inmeten)', { type: 'tel', autoComplete: 'tel' })}
        <label className="gv-veld"><span>Wanneer?</span>
          <select value={v.planning} onChange={e => setV({ ...v, planning: e.target.value })}>
            <option value="">Kies…</option><option>Direct na de oplevering</option><option>Binnen 3 maanden</option><option>Over 3 tot 6 maanden</option><option>Weet ik nog niet</option>
          </select>
        </label>
        <label className="gv-veld"><span>Nog iets dat de verwerker moet weten?</span><textarea rows={3} value={v.toelichting} onChange={e => setV({ ...v, toelichting: e.target.value })} /></label>
      </div>
      <label className="gv-akkoord"><input type="checkbox" checked={akkoord} onChange={e => setAkkoord(e.target.checked)} /><span>Bylder mag mijn aanvraag, naam en contactgegevens delen met de verwerker.</span></label>
      <button type="button" className="gv-knop gv-knop-primair" disabled={bezig || !klaarVoor || !akkoord} onClick={async () => {
        setFout(''); setBezig(true)
        try { await stuur({ actie: 'offerte', ...v, akkoord }); setKlaar(true) } catch (e) { setFout((e as Error).message) } finally { setBezig(false) }
      }}>{bezig ? 'Bezig…' : 'Vraag de offerte aan'}</button>
      {!klaarVoor && <p className="gv-klein">Kies eerst de ruimtes en het type.</p>}
      {fout && <p role="alert" className="gv-fout">{fout}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- account (website) */

function Account({ koppel, maak }: { koppel: string | null; maak: () => Promise<unknown> }) {
  const [bezig, setBezig] = useState(false)
  return (
    <div className="gv-kaartje gv-account">
      <Receipt size={26} weight="thin" aria-hidden="true" />
      <h3>Offerte? Ga verder in je Bylder-omgeving</h3>
      <p>Maak een gratis account en neem je vloer mee. Daar vraag je de offerte aan, en ligt de rest van je woning ook klaar.</p>
      <ul className="gv-voordelen">
        <li><Check size={15} weight="bold" aria-hidden="true" />Offerte van een verwerker die Dr. Schutz aanbeveelt, op jouw ruimtes en kleur</li>
        <li><Check size={15} weight="bold" aria-hidden="true" />Je vloer, je kleur en je foto blijven bewaard, op telefoon en laptop</li>
        <li><Check size={15} weight="bold" aria-hidden="true" />Ook je binnendeuren en kasten op maat ontwerpen, in dezelfde woning</li>
        <li><Check size={15} weight="bold" aria-hidden="true" />Ledenkorting bij de merken die meedoen, en een adviseur die je stalen van showroom naar showroom meeneemt</li>
      </ul>
      <button type="button" className="gv-knop gv-knop-primair" disabled={bezig} onClick={async () => {
        setBezig(true)
        try {
          // Eerst de laatste keuze bewaren (en zo nodig het ontwerp aanmaken), dan naar de app.
          const d = await maak() as Weergave
          const link = d?.sleutel ? `${APP}/dashboard/gietvloer/koppel?id=${encodeURIComponent(d.id)}&s=${encodeURIComponent(d.sleutel)}` : koppel
          if (link) window.location.href = link
        } finally { setBezig(false) }
      }}>Maak een account en vraag de offerte aan<ArrowRight size={16} aria-hidden="true" /></button>
      <p className="gv-klein">Gratis, geen abonnement. Een account maken duurt een halve minuut.</p>
    </div>
  )
}

/* ---------------------------------------------------------------- de rest van je woning */

function Woning({ modus }: { modus: 'site' | 'app' }) {
  const site = modus === 'site'
  const items = [
    { icoon: Door, titel: 'Binnendeuren', tekst: 'Kozijnloze deuren van Classic Next, deur voor deur samengesteld.', href: 'https://www.bylder.com/kozijnloze-deuren/configurator/' },
    { icoon: Package, titel: 'Kast op maat', tekst: 'Upload een voorbeeld, de AI tekent hem in 3D met zaaglijst.', href: site ? '/kasten-op-maat/ontwerpen/' : '/dashboard/kast' },
    { icoon: Cube, titel: 'Mijn woning in 3D', tekst: 'Je plattegrond erin, en elke kamer gemeten.', href: site ? '/mijn-woning/' : '/dashboard/mijn-woning' },
  ]
  return (
    <div className="gv-rest">
      <h3 className="gv-h3">Ook voor de rest van je woning</h3>
      <div className="gv-rest-rij">
        {items.map(i => (
          <Link key={i.titel} href={i.href} className="gv-rest-item">
            <i.icoon size={24} weight="thin" aria-hidden="true" />
            <strong>{i.titel}</strong><span>{i.tekst}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- opmaak */

const CSS = `
.gv{--papier:#F5F0E8;--inkt:#1A1208;--tekst:#3D2E1E;--zacht:rgba(61,46,30,.64);--lijn:rgba(61,46,30,.13);--mos:#3D5A3E;--koper:#B85C38;color:var(--tekst);font-family:inherit}
.gv *{box-sizing:border-box}
.gv-verborgen{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.gv-blok{background:#fff;border:1px solid var(--lijn);border-radius:22px;padding:22px 18px;margin:0 0 18px;box-shadow:0 18px 40px -30px rgba(26,18,8,.35)}
@media (min-width:760px){.gv-blok{padding:30px 32px}}
.gv-stap{display:flex;align-items:center;gap:10px;margin:0 0 8px;font:700 12px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--koper)}
.gv-stap span{display:grid;place-items:center;width:24px;height:24px;border-radius:8px;background:var(--mos);color:#F5F0E8;font-size:12px}
.gv-h2{font-size:clamp(1.3rem,2.6vw,1.7rem);line-height:1.15;letter-spacing:-.025em;font-weight:800;color:var(--inkt);margin:0 0 8px;text-wrap:balance}
.gv-h3{font-size:1.05rem;font-weight:800;color:var(--inkt);margin:22px 0 10px}
.gv-lead{margin:0 0 16px;font-size:15.5px;line-height:1.6;color:var(--zacht);max-width:62ch}
.gv-klein{font-size:13px;line-height:1.55;color:var(--zacht);margin:10px 0 0}
.gv-mono{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:var(--zacht)}
.gv-foto-rij{display:grid;gap:16px}
@media (min-width:760px){.gv-foto-rij{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}}
.gv-sleep{position:relative;display:grid;place-items:center;min-height:230px;border:2px dashed rgba(61,90,62,.35);border-radius:18px;background:repeating-linear-gradient(45deg,rgba(61,90,62,.03) 0 12px,transparent 12px 24px);cursor:pointer;overflow:hidden;transition:border-color .15s,background .15s}
.gv-sleep.over{border-color:var(--mos);background:rgba(61,90,62,.08)}
.gv-sleep.met{border-style:solid;border-color:var(--lijn);background:#000}
.gv-sleep img{width:100%;height:100%;max-height:360px;object-fit:cover;display:block}
.gv-sleep-leeg{display:grid;justify-items:center;gap:6px;color:var(--zacht);text-align:center;padding:20px}
.gv-sleep-leeg strong{color:var(--inkt);font-size:15px}
.gv-lezen{position:absolute;left:12px;bottom:12px;display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(26,18,8,.78);color:#F5F0E8;font-size:13px;font-weight:600}
.gv-lezen i{width:6px;height:6px;border-radius:50%;background:#E8A87C;animation:gv-hup 1.2s infinite ease-in-out}
.gv-lezen i:nth-child(2){animation-delay:.15s}.gv-lezen i:nth-child(3){animation-delay:.3s}
@keyframes gv-hup{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-4px);opacity:1}}
@media (prefers-reduced-motion:reduce){.gv-lezen i{animation:none}}
.gv-lezing{display:grid;gap:10px;align-content:start}
.gv-gemeten{display:flex;gap:12px;align-items:center}
.gv-gemeten i{width:52px;height:52px;border-radius:14px;border:1px solid var(--lijn);box-shadow:inset 0 0 0 3px rgba(255,255,255,.5)}
.gv-gemeten strong{display:block;color:var(--inkt);font-size:17px}
.gv-gemeten span{font:12.5px ui-monospace,Menlo,monospace;color:var(--zacht)}
.gv-chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.gv-chips li{padding:5px 10px;border-radius:999px;background:var(--papier);font-size:13px;font-weight:600;color:var(--inkt)}
.gv-omschr{margin:0;font-size:15px;line-height:1.6}
.gv-let{display:flex;gap:6px;align-items:flex-start;margin:0;padding:10px 12px;border-radius:12px;background:rgba(184,92,56,.09);color:#8A4A2A;font-size:14px}
.gv-stappen{display:grid;gap:10px}
.gv-stappen p{display:flex;gap:10px;align-items:flex-start;margin:0;font-size:14.5px;line-height:1.5}
.gv-stappen svg{flex:none;color:var(--mos);margin-top:2px}
.gv-acties{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.gv-knop{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 16px;border-radius:12px;border:1px solid var(--lijn);background:#fff;color:var(--inkt);font-weight:600;font-size:14.5px;line-height:1.2;font-family:inherit;cursor:pointer;text-decoration:none;transition:transform .15s,box-shadow .15s}
.gv-knop:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 18px -10px rgba(26,18,8,.35)}
.gv-knop:disabled{opacity:.5;cursor:not-allowed}
.gv-knop-primair{background:var(--mos);border-color:var(--mos);color:#F5F0E8;width:100%}
.gv-knop-licht{background:var(--papier)}
.gv-link{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:6px 0;color:var(--mos);font-weight:700;font-size:14px;font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.gv-fout{margin:0;color:#A3402A;font-size:14px;font-weight:600}
.gv-kleurblok{margin-top:6px}
.gv-matches{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gv-match{position:relative;display:grid;gap:2px;justify-items:start;text-align:left;padding:8px 8px 10px;border-radius:14px;border:1.5px solid var(--lijn);background:#fff;cursor:pointer;font:inherit;color:var(--tekst)}
.gv-match[aria-checked=true]{border-color:var(--mos);box-shadow:0 0 0 3px rgba(61,90,62,.15)}
.gv-match strong{font-size:14px;color:var(--inkt)}
.gv-match span{font-size:12.5px;color:var(--zacht)}
.gv-vink{position:absolute;top:8px;right:8px;color:#fff;background:var(--mos);border-radius:50%;padding:3px;width:22px;height:22px}
.gv-staal{width:100%;height:auto;display:block}
.gv-kaart{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.gv-kaart button,.gv-staal-keuze button{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:6px 11px 6px 6px;border-radius:999px;border:1.5px solid var(--lijn);background:#fff;font-weight:600;font-size:13.5px;font-family:inherit;color:var(--inkt);cursor:pointer}
.gv-kaart i,.gv-staal-keuze i{width:24px;height:24px;border-radius:50%;border:1px solid rgba(26,18,8,.12)}
.gv-kaart button[aria-checked=true],.gv-staal-keuze button[aria-pressed=true]{border-color:var(--mos);background:rgba(61,90,62,.08)}
.gv-staal-keuze button:disabled{opacity:.45;cursor:not-allowed}
.gv-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
.gv-tabs button{min-height:40px;padding:8px 14px;border-radius:999px;border:1px solid var(--lijn);background:#fff;font-weight:700;font-size:13.5px;font-family:inherit;color:var(--zacht);cursor:pointer}
.gv-tabs button[aria-selected=true]{background:var(--inkt);border-color:var(--inkt);color:#F5F0E8}
.gv-plan{display:grid;gap:14px}
@media (min-width:900px){.gv-plan{grid-template-columns:minmax(0,3fr) minmax(0,2fr);align-items:start}}
.gv-plan-beeld{background:linear-gradient(180deg,#FBF8F3,#F1EBE0);border-radius:18px;border:1px solid var(--lijn);padding:6px}
.gv-plan-svg{width:100%;height:auto;display:block;max-height:520px}
.gv-ruimte{cursor:pointer}
.gv-ruimte .gv-vlak{stroke:rgba(26,18,8,.28);stroke-width:14;transition:fill .25s}
.gv-ruimte:hover .gv-vlak{stroke:var(--mos);stroke-width:30}
.gv-muur{fill:rgba(26,18,8,.10);stroke:rgba(26,18,8,.45);stroke-width:16;stroke-linejoin:round}
.gv-muur-top{fill:rgba(26,18,8,.55)}
.gv-l-naam{font:700 430px system-ui,sans-serif;fill:#1A1208;paint-order:stroke;stroke:rgba(255,255,255,.85);stroke-width:90px}
.gv-l-naam.uit{fill:rgba(26,18,8,.45)}
.gv-l-m2{font:400 330px ui-monospace,Menlo,monospace;fill:rgba(26,18,8,.7);paint-order:stroke;stroke:rgba(255,255,255,.85);stroke-width:90px}
.gv-lijst{display:grid;gap:12px}
.gv-groep{border:0;margin:0;padding:0}
.gv-groep legend{font:700 12px/1 ui-monospace,Menlo,monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--zacht);margin-bottom:6px}
.gv-vink-rij{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;min-height:40px;padding:4px 2px;border-bottom:1px solid var(--lijn);font-size:14.5px;cursor:pointer}
.gv-vink-rij input,.gv-hand-rij input[type=checkbox],.gv-akkoord input{width:20px;height:20px;accent-color:var(--mos)}
.gv-hand{display:grid;gap:8px}
.gv-hand-rij{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:8px;border:1px solid var(--lijn);border-radius:12px}
.gv-hand-rij.uit{opacity:.55}
.gv-hand-rij select{grid-column:2/5;grid-row:2;min-height:38px;border:1px solid var(--lijn);border-radius:10px;padding:0 8px;font:inherit;font-size:13.5px;background:#fff}
.gv-hand-naam{min-height:40px;border:1px solid var(--lijn);border-radius:10px;padding:0 10px;font:inherit;font-size:14.5px;min-width:0}
.gv-hand-m2{display:flex;align-items:center;gap:4px;font-size:13.5px;color:var(--zacht)}
.gv-hand-m2 input{width:64px;min-height:40px;border:1px solid var(--lijn);border-radius:10px;padding:0 8px;font:inherit;font-size:14.5px}
.gv-icoon-knop{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;border:1px solid var(--lijn);background:#fff;color:var(--zacht);cursor:pointer}
.gv-tekening-tip{display:grid;grid-template-columns:auto 1fr;gap:10px 12px;align-items:start;margin-top:14px;padding:14px;border-radius:14px;background:var(--papier);font-size:14.5px;line-height:1.5}
.gv-tekening-tip svg{color:var(--mos)}
.gv-tekening-tip .gv-knop{grid-column:1/-1;justify-self:start}
.gv-totaal{display:flex;align-items:center;gap:8px;margin:16px 0 0;padding:12px 14px;border-radius:12px;background:rgba(61,90,62,.08);color:var(--inkt);font-size:15px}
.gv-totaal svg{color:var(--mos)}
.gv-vvw{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px}
.gv-vvw>span{display:flex;align-items:center;gap:6px;font-weight:700;color:var(--inkt);font-size:14.5px;width:100%}
@media (min-width:760px){.gv-vvw>span{width:auto;margin-right:6px}}
.gv-vvw button{min-height:40px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--lijn);background:#fff;font-weight:600;font-size:13.5px;font-family:inherit;color:var(--inkt);cursor:pointer}
.gv-vvw button[aria-checked=true]{border-color:var(--mos);background:rgba(61,90,62,.1)}
.gv-typen{display:grid;gap:10px}
@media (min-width:900px){.gv-typen{grid-template-columns:repeat(3,minmax(0,1fr))}}
.gv-type{position:relative;display:flex;flex-direction:column;gap:6px;text-align:left;padding:16px;border-radius:16px;border:1.5px solid var(--lijn);background:#fff;font:inherit;color:var(--tekst);cursor:pointer}
.gv-type[aria-checked=true]{border-color:var(--mos);box-shadow:0 0 0 3px rgba(61,90,62,.15)}
.gv-type-kop{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding-right:26px}
.gv-type-kop strong{font-size:16.5px;color:var(--inkt)}
.gv-type-kop em{font-style:normal;font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(184,92,56,.12);color:#8A4A2A}
.gv-type-kort{font-size:14px;line-height:1.5;color:var(--zacht)}
.gv-type-sub{font:700 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--zacht);margin-top:6px}
.gv-voor,.gv-tegen{margin:0;padding:0;list-style:none;display:grid;gap:4px;font-size:14px;line-height:1.45}
.gv-voor li,.gv-tegen li{position:relative;padding-left:16px}
.gv-voor li::before{content:'';position:absolute;left:2px;top:.55em;width:7px;height:7px;border-radius:50%;background:var(--mos)}
.gv-tegen li::before{content:'';position:absolute;left:2px;top:.75em;width:8px;height:2px;background:var(--koper)}
.gv-type-vvw{display:flex;gap:6px;align-items:flex-start;margin-top:6px;padding:8px 10px;border-radius:10px;background:var(--papier);font-size:13.5px;line-height:1.45}
.gv-type-prijs{margin-top:auto;padding-top:8px;font:700 14px ui-monospace,Menlo,monospace;color:var(--inkt)}
.gv-overzicht{display:grid;gap:14px;align-items:center;margin-bottom:16px}
@media (min-width:760px){.gv-overzicht{grid-template-columns:260px 1fr}}
.gv-overzicht .gv-staal{max-width:260px}
.gv-overzicht dl{margin:0;display:grid;gap:6px}
.gv-overzicht dl div{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--lijn);font-size:15px}
.gv-overzicht dt{color:var(--zacht)}
.gv-overzicht dd{margin:0;font-weight:700;color:var(--inkt);text-align:right}
.gv-indicatie dd{font-family:ui-monospace,Menlo,monospace}
.gv-twee{display:grid;gap:12px}
@media (min-width:900px){.gv-twee{grid-template-columns:1fr 1fr;align-items:start}}
.gv-kaartje{display:grid;gap:10px;padding:18px;border-radius:18px;border:1px solid var(--lijn);background:linear-gradient(180deg,#fff,#FBF8F3)}
.gv-kaartje>svg{color:var(--mos)}
.gv-kaartje h3{margin:0;font-size:1.1rem;color:var(--inkt)}
.gv-kaartje p{margin:0;font-size:14.5px;line-height:1.55}
.gv-klaar{background:rgba(61,90,62,.07);border-color:rgba(61,90,62,.25)}
.gv-account{background:linear-gradient(170deg,#24321F,#3D5A3E);color:#EDE6D8;border-color:transparent}
.gv-account h3{color:#fff}.gv-account>svg{color:#E8A87C}
.gv-account .gv-klein{color:rgba(237,230,216,.75)}
.gv-account .gv-knop-primair{background:#F5F0E8;border-color:#F5F0E8;color:var(--inkt)}
.gv-voordelen{list-style:none;padding:0;margin:0;display:grid;gap:7px;font-size:14px;line-height:1.45}
.gv-voordelen li{display:grid;grid-template-columns:auto 1fr;gap:8px}
.gv-voordelen svg{margin-top:2px;color:#E8A87C}
.gv-staal-keuze{display:flex;flex-wrap:wrap;gap:6px}
.gv-velden{display:grid;gap:8px}
.gv-velden-rij{display:grid;grid-template-columns:1fr auto;gap:8px}
.gv-velden-rij .gv-veld:first-child:has(input.kort){order:0}
.gv-veld{display:grid;gap:4px;font-size:13px;font-weight:600;color:var(--zacht)}
.gv-veld input,.gv-veld select,.gv-veld textarea{min-height:44px;border:1px solid var(--lijn);border-radius:10px;padding:8px 11px;font:inherit;font-size:15px;color:var(--inkt);background:#fff;min-width:0;width:100%}
.gv-veld input.kort{width:110px}
.gv-akkoord{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;font-size:13.5px;line-height:1.5}
.gv-rest{margin-top:22px}
.gv-rest-rij{display:grid;gap:8px}
@media (min-width:760px){.gv-rest-rij{grid-template-columns:repeat(3,1fr)}}
.gv-rest-item{display:grid;gap:4px;padding:14px;border-radius:14px;border:1px solid var(--lijn);background:#fff;text-decoration:none;color:var(--tekst);transition:transform .15s,box-shadow .15s}
.gv-rest-item:hover{transform:translateY(-1px);box-shadow:0 10px 22px -14px rgba(26,18,8,.4)}
.gv-rest-item svg{color:var(--koper)}
.gv-rest-item strong{color:var(--inkt);font-size:15px}
.gv-rest-item span{font-size:13.5px;line-height:1.45;color:var(--zacht)}
`
