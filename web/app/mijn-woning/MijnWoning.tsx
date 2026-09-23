'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { leesPdf, type Verdieping } from '@/lib/tekening/lees'
import { ONTWERPEN, KLEUREN, FINEREN } from '../kozijnloze-deuren/configurator/ontwerpen'

/* ------------------------------------------------------------------ vaste gegevens */

// pdf.js wordt pas geladen als iemand een tekening kiest: de rest van de site merkt er
// niets van, en er komt geen dependency van ruim een megabyte bij. Het worker-script
// gaat als gewoon script mee, zodat pdf.js op de hoofdthread draait (een worker van
// een ander domein mag de browser niet starten).
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/'
const OPSLAG = 'bylder:mijn-woning:v1'
const H = 2600 // plafondhoogte; staat zelden op een tekening, dus een aanname die we tonen
const PRIJS_M2 = 85 // rekenvoorbeeld van /vouchers/drt-contemporary/, geen offerte
const KORTING = 0.1 // ledenkorting DRT via Bylder
const CONFIGURATOR = '/kozijnloze-deuren/configurator/'
// Standaarddeur van de configurator (NIEUW in Configurator.tsx), veld voor veld.
const STANDAARD = ['dawn', 'gelakt', '9010', '', 'oslo-oak', 'binnen', 'links', 'oma-q-slim', 'Zwart', 'loop', 'Zwart', '', 'Zwart']
const KLEURVLOER = [
  { id: 'kalk', n: 'Kalkwit', c: '#E9E4DA' },
  { id: 'zand', n: 'Zandbeige', c: '#D6C8B0' },
  { id: 'beton', n: 'Betongrijs', c: '#B9B6AF' },
  { id: 'antra', n: 'Antraciet', c: '#55524E' },
]
const NIET_GIET = /^(toilet|badkamer|meterkast|wasruimte|trap)/i

const INKT = '#1A1208', GROEN = '#3D5A3E', ROEST = '#B85C38'

type Opslag = {
  lagen: Verdieping[]
  bron: string
  kleur: string
  giet: Record<string, boolean>
  /** per deur (verdieping:index) de velden zoals de configurator ze in zijn adres zet */
  deuren: Record<string, string[]>
}

/* ------------------------------------------------------------------ hulpjes */

const nl = (n: number, d = 0) => n.toLocaleString('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d })
const eur = (n: number) => '€ ' + nl(Math.round(n))
const mooi = (s: string) => { const t = s.toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1) }
const kort = (naam: string) => naam.replace(/ en keuken$/, '').replace(/ en overloop$/, '')

function laadPdfJs(): Promise<unknown> {
  const w = window as unknown as { pdfjsLib?: unknown }
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib)
  const script = (src: string) => new Promise<void>((ok, nee) => {
    const s = document.createElement('script'); s.src = src; s.async = false
    s.onload = () => ok(); s.onerror = () => nee(new Error('laden mislukt'))
    document.head.appendChild(s)
  })
  return script(PDFJS + 'pdf.min.js').then(() => script(PDFJS + 'pdf.worker.min.js')).then(() => {
    if (!w.pdfjsLib) throw new Error('laden mislukt')
    return w.pdfjsLib
  })
}

function leesOpslag(): Opslag | null {
  try { const s = localStorage.getItem(OPSLAG); return s ? JSON.parse(s) as Opslag : null } catch { return null }
}
function schrijfOpslag(o: Opslag | null) {
  try { if (o) localStorage.setItem(OPSLAG, JSON.stringify(o)); else localStorage.removeItem(OPSLAG) } catch { /* privévenster */ }
}

/** Kleur, ontwerp en afwerking van een deur zoals de configurator hem teruggaf. */
function beschrijf(v: string[] | undefined) {
  if (!v) return null
  const o = ONTWERPEN.find(x => x.id === v[0])
  let kleur = '#F1ECE1', afw = ''
  if (v[1] === 'fineer') {
    const f = FINEREN.find(x => x.id === v[4]); kleur = f?.basis ?? '#654535'; afw = f ? f.naam : 'fineer'
  } else if (/^[0-9a-f]{6}$/i.test(v[3] || '')) {
    kleur = '#' + v[3]; afw = 'eigen kleur #' + v[3].toUpperCase()
  } else {
    const k = KLEUREN.find(x => x.ral === v[2]); kleur = k?.hex ?? kleur; afw = k ? `RAL ${k.ral} ${k.naam.toLowerCase()}` : `RAL ${v[2]}`
  }
  return { ontwerp: o?.naam ?? v[0], afwerking: afw, kleur }
}
function licht(hex: string) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150
}

/* ------------------------------------------------------------------ tekenen */

const COS = Math.cos(Math.PI / 6), YK = 0.42, ZK = 0.62
const iso = (x: number, y: number, z: number) => [(x - y) * COS, (x + y) * YK - z * ZK]
const pts = (a: number[][]) => a.map(q => { const p = iso(q[0], q[1], q[2]); return p[0].toFixed(0) + ',' + p[1].toFixed(0) }).join(' ')

function svgVoor(l: Verdieping, li: number, o: Opslag): string {
  const k = l.kader, ox = k[0], oy = k[1], kap = l.kap
  const zk = kap ? (y: number) => Math.max(0, kap.zNok - kap.k * Math.abs(y + oy - kap.nokY)) : () => H
  const y0 = (l.binnenY ? l.binnenY[0] : k[1]) - oy, y1 = (l.binnenY ? l.binnenY[1] : k[3]) - oy, bx = k[2] - k[0]
  const tint = (KLEURVLOER.find(c => c.id === o.kleur) ?? KLEURVLOER[1]).c
  let vloer = `<polygon class="v" points="${pts([[0, y0, 0], [bx, y0, 0], [bx, y1, 0], [0, y1, 0]])}"/>`
  l.ruimtes.forEach(r => {
    if (!o.giet[li + ':' + r.id]) return
    r.stroken.forEach(s => {
      vloer += `<polygon class="g" fill="${tint}" points="${pts([[s[0] - ox, s[1] - oy, 0], [s[2] - ox, s[1] - oy, 0], [s[2] - ox, s[3] - oy, 0], [s[0] - ox, s[3] - oy, 0]])}"/>`
    })
  })
  const stuk: { d: number; s: string }[] = []
  const blok = (x0: number, a0: number, x1: number, a1: number, cls: string) => {
    const c = [[x0, a0], [x1, a0], [x1, a1], [x0, a1]]
    ;[[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j]) => {
      const a = c[i], b = c[j]
      stuk.push({ d: (a[0] + b[0] + a[1] + b[1]) / 2, s: `<polygon class="${cls}" points="${pts([[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], zk(b[1])], [a[0], a[1], zk(a[1])]])}"/>` })
    })
    stuk.push({ d: (x0 + x1 + a0 + a1) / 2 + 1, s: `<polygon class="${cls} t" points="${pts(c.map(q => [q[0], q[1], zk(q[1])]))}"/>` })
  }
  l.wanden.forEach(w => {
    const a = [w[0] - ox, w[1] - oy, w[2] - ox, w[3] - oy], cls = w[4] ? 'm r' : 'm'
    const nk = kap ? kap.nokY - oy : null
    if (nk !== null && a[1] < nk && a[3] > nk) { blok(a[0], a[1], a[2], nk, cls); blok(a[0], nk, a[2], a[3], cls) }
    else blok(a[0], a[1], a[2], a[3], cls)
  })
  let extra = ''
  if (kap) {
    const nk = kap.nokY - oy, zn = zk(nk)
    extra += `<polygon class="k" points="${pts([[0, y0, zk(y0)], [bx, y0, zk(y0)], [bx, nk, zn], [0, nk, zn]])}"/>`
      + `<polygon class="k" points="${pts([[0, nk, zn], [bx, nk, zn], [bx, y1, zk(y1)], [0, y1, zk(y1)]])}"/>`
    const d15 = (kap.zNok - 1500) / kap.k
    ;[nk - d15, nk + d15].forEach(yy => {
      if (yy < y0 || yy > y1) return
      const a = iso(0, yy, 0), b = iso(bx, yy, 0)
      extra += `<line class="h" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`
    })
  }
  let labels = ''
  l.ruimtes.forEach(r => {
    if (r.m2 < 3) return
    const i = iso(r.x - ox, r.y - oy, 0)
    labels += `<text x="${i[0]}" y="${i[1] - 160}" text-anchor="middle" class="l">${r.naam}</text>`
      + `<text x="${i[0]}" y="${i[1] + 300}" text-anchor="middle" class="n">≈ ${nl(r.m2, 1)} m²</text>`
  })
  l.deuren.forEach((d, di) => {
    const i = iso(d.x - ox, d.y - oy, 0), b = beschrijf(o.deuren[li + ':' + di])
    const vul = b ? b.kleur : GROEN, tekst = b ? (licht(b.kleur) ? INKT : '#fff') : '#fff'
    labels += `<g class="d"><circle cx="${i[0]}" cy="${i[1]}" r="250" fill="${vul}"/><text x="${i[0]}" y="${i[1] + 105}" text-anchor="middle" fill="${tekst}">${deurNummer(o, li, di)}</text></g>`
  })
  stuk.sort((p, q) => p.d - q.d)
  const xs: number[] = [], ys: number[] = []
  ;[[0, y0], [bx, y0], [bx, y1], [0, y1], [0, 0], [bx, k[3] - oy]].forEach(q => [0, kap ? kap.zNok : H].forEach(z => { const p = iso(q[0], q[1], z); xs.push(p[0]); ys.push(p[1]) }))
  const pad = 600, vx0 = Math.min(...xs) - pad, vx1 = Math.max(...xs) + pad, vy0 = Math.min(...ys) - pad - 380, vy1 = Math.max(...ys) + pad
  return `<svg viewBox="${vx0} ${vy0} ${vx1 - vx0} ${vy1 - vy0}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${mooi(l.naam)} in doorzichtig 3D">`
    + '<style>.v{fill:#D3CFC7;stroke:rgba(26,18,8,.42);stroke-width:22;stroke-opacity:.3}.g{stroke:none;opacity:.92}'
    + '.m{fill:rgba(26,18,8,.10);stroke:rgba(26,18,8,.42);stroke-width:18;stroke-linejoin:round}.m.t{fill:rgba(26,18,8,.62);fill-opacity:.55}'
    + '.m.r{fill:#B85C38;fill-opacity:.16;stroke:#B85C38;stroke-opacity:.8}.m.r.t{fill:#B85C38;fill-opacity:.7}'
    + '.k{fill:#1A1208;fill-opacity:.035;stroke:rgba(26,18,8,.42);stroke-width:18}.h{stroke:#3D5A3E;stroke-width:30;stroke-dasharray:140 90}'
    + '.d circle{stroke:#EDE6D8;stroke-width:50}.d text{font:700 290px "Plus Jakarta Sans",sans-serif}'
    + '.l{font:700 540px "Plus Jakarta Sans",sans-serif;fill:#1A1208;paint-order:stroke;stroke:#EDE6D8;stroke-width:110px}'
    + '.n{font:400 420px "Space Mono",monospace;fill:rgba(26,18,8,.7);paint-order:stroke;stroke:#EDE6D8;stroke-width:110px}</style>'
    + vloer + stuk.map(x => x.s).join('') + extra + labels + '</svg>'
}

/** Doorlopende nummering over alle verdiepingen: 1 t/m het aantal deuren. */
function deurNummer(o: Opslag, li: number, di: number) {
  let n = 0
  for (let a = 0; a < li; a++) n += o.lagen[a].deuren.length
  return n + di + 1
}

/* ------------------------------------------------------------------ heen en terug */

function naarConfigurator(o: Opslag) {
  const deuren: string[] = []
  o.lagen.forEach((l, li) => l.deuren.forEach((d, di) => {
    const v = (o.deuren[li + ':' + di] ?? STANDAARD).slice()
    v[11] = encodeURIComponent(kort(d.naar))
    deuren.push(v.join('~'))
  }))
  return `${CONFIGURATOR}?deuren=${encodeURIComponent(deuren.join('_'))}&terug=${encodeURIComponent('/mijn-woning/')}`
}

/** Wat de configurator terugstuurt, op naam koppelen aan de deuren uit de tekening. */
function koppelTerug(o: Opslag, q: string): { opslag: Opslag; aantal: number } {
  const binnen = q.split('_').map(s => s.split('~')).filter(v => v.length >= 12)
  const plekken: { key: string; naam: string }[] = []
  o.lagen.forEach((l, li) => l.deuren.forEach((d, di) => plekken.push({ key: li + ':' + di, naam: kort(d.naar) })))
  const bezet = new Set<string>(), nieuw = { ...o.deuren }
  let aantal = 0
  binnen.forEach((v, i) => {
    let naam = ''
    try { naam = decodeURIComponent(v[11] || '') } catch { naam = v[11] || '' }
    const plek = plekken.find(p => !bezet.has(p.key) && p.naam === naam)
      ?? (plekken[i] && !bezet.has(plekken[i].key) ? plekken[i] : undefined)
    if (!plek) return
    bezet.add(plek.key); nieuw[plek.key] = v.slice(0, 13); aantal++
  })
  return { opslag: { ...o, deuren: nieuw }, aantal }
}

/* ------------------------------------------------------------------ de pagina */

type Stap = { t: string; klaar: boolean }

export default function MijnWoning() {
  const [o, setO] = useState<Opslag | null>(null)
  const [stappen, setStappen] = useState<Stap[]>([])
  const [fout, setFout] = useState('')
  const [melding, setMelding] = useState('')
  const [actief, setActief] = useState(0)
  const [over, setOver] = useState(false)
  const dek = useRef<HTMLDivElement>(null)
  const uitkomst = useRef<HTMLElement>(null)
  const deurBlok = useRef<HTMLElement>(null)

  const bewaar = useCallback((n: Opslag | null) => { setO(n); schrijfOpslag(n) }, [])

  // Bij binnenkomst: bewaarde woning ophalen, en wat de configurator eventueel terugstuurt.
  useEffect(() => {
    const opgeslagen = leesOpslag()
    const u = new URL(window.location.href), q = u.searchParams.get('deuren')
    if (opgeslagen && q) {
      const { opslag, aantal } = koppelTerug(opgeslagen, q)
      bewaar(opslag)
      setMelding(aantal ? `${aantal} ${aantal === 1 ? 'deur' : 'deuren'} bijgewerkt vanuit de configurator.` : '')
      setTimeout(() => deurBlok.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } else if (opgeslagen) setO(opgeslagen)
    if (q) { u.searchParams.delete('deuren'); window.history.replaceState(null, '', u) }
  }, [bewaar])

  const verwerk = useCallback(async (data: Uint8Array, naam: string) => {
    setFout(''); setMelding('')
    const lijst: Stap[] = []
    const zet = (t: string, klaar = false) => { lijst.push({ t, klaar }); setStappen([...lijst]) }
    const klaar = (t: string) => { lijst[lijst.length - 1] = { t, klaar: true }; setStappen([...lijst]) }
    const wacht = (ms: number) => new Promise(r => setTimeout(r, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms))
    try {
      zet('Tekening openen')
      let pdfjs: unknown
      try { pdfjs = await laadPdfJs() } catch { throw new Error('De PDF-lezer kon niet laden. Controleer je verbinding en probeer het opnieuw.') }
      const lagen = await leesPdf(pdfjs, data)
      klaar('Tekening geopend: ' + naam)
      if (!lagen.length) throw new Error('We vonden geen wanden in deze PDF. Dat gebeurt bij een scan of foto van een tekening. Een PDF die je van de aannemer of makelaar kreeg werkt meestal wel.')
      let nw = 0, nr = 0, nk = 0, nd = 0
      lagen.forEach(l => { nw += l.wanden.length; nr += l.wanden.filter(w => w[4]).length; nk += l.ruimtes.length; nd += l.deuren.length })
      zet('Schaal zoeken'); await wacht(300); klaar('Schaal gevonden: 1:' + lagen[0].schaal)
      zet('Wanden meten'); await wacht(400); klaar(`${nw} wanden gemeten${nr ? `, waarvan ${nr} meerwerk` : ''}`)
      zet('Ruimtes herkennen'); await wacht(400); klaar(`${nk} ruimtes herkend op ${lagen.length} verdieping${lagen.length === 1 ? '' : 'en'}`)
      zet('Deuren tellen'); await wacht(400); klaar(`${nd} binnendeuren geteld`)
      const kap = lagen.find(l => l.kap)
      if (kap?.kap) { zet('Kap berekenen'); await wacht(300); klaar(`Kap uit de hoogtelijnen: nok op ± ${nl(kap.kap.zNok / 1000, 2)} m`) }
      zet('Woning opbouwen'); await wacht(250); klaar('Je woning staat klaar')
      const giet: Record<string, boolean> = {}
      lagen[0].ruimtes.forEach(r => { if (!NIET_GIET.test(r.naam)) giet['0:' + r.id] = true })
      bewaar({ lagen, bron: naam, kleur: 'zand', giet, deuren: {} })
      setActief(0)
      setTimeout(() => uitkomst.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setStappen([]); setFout(e instanceof Error ? e.message : String(e))
    }
  }, [bewaar])

  const kies = (f?: File) => {
    if (!f) return
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { setFout('Dit is geen PDF. Sleep de tekening als PDF-bestand hierheen.'); return }
    const r = new FileReader()
    r.onload = () => verwerk(new Uint8Array(r.result as ArrayBuffer), f.name)
    r.readAsArrayBuffer(f)
  }

  const wisselGiet = (key: string) => o && bewaar({ ...o, giet: { ...o.giet, [key]: !o.giet[key] } })

  /* ---- afgeleide getallen ---- */
  const totaal = o ? o.lagen.reduce((t, l) => t + l.ruimtes.reduce((s, r) => s + r.m2, 0), 0) : 0
  const aantalDeuren = o ? o.lagen.reduce((t, l) => t + l.deuren.length, 0) : 0
  const gekozen = o ? Object.keys(o.deuren).length : 0
  const m2Giet = o ? o.lagen.reduce((t, l, li) => t + l.ruimtes.reduce((s, r) => s + (o.giet[li + ':' + r.id] ? r.m2 : 0), 0), 0) : 0
  const bruto = m2Giet * PRIJS_M2, korting = bruto * KORTING

  return (
    <div className="mw">
      <style>{CSS}</style>

      <header className="mw-kop">
        <p className="mw-oog">Bylder · je woning, voordat hij gebouwd is</p>
        <h1>Zie je nieuwe woning.<br />Sleep je plattegrond hierheen.</h1>
        <p className="mw-lead">De tekening die je van de aannemer kreeg is genoeg. Wij lezen de wanden, de deuren en de vloer eruit, bouwen je woning op, en laten zien wat je ermee kunt.</p>
      </header>

      <label className={'mw-sleep' + (over ? ' over' : '')} htmlFor="mw-bestand"
        onDragEnter={e => { e.preventDefault(); setOver(true) }} onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={e => { e.preventDefault(); setOver(false) }}
        onDrop={e => { e.preventDefault(); setOver(false); kies(e.dataTransfer.files[0]) }}>
        <input type="file" id="mw-bestand" accept="application/pdf,.pdf" onChange={e => kies(e.target.files?.[0])} />
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={GROEN} strokeWidth="1.6" aria-hidden="true"><path d="M8 34h24M20 6v20M12 14l8-8 8 8" /></svg>
        <span className="mw-sleep-t">{o ? 'Andere tekening? Sleep hem hierheen' : 'Sleep je tekening hierheen'}</span>
        <span className="mw-sleep-s">of <u>kies een PDF</u> · verkoop- of meerwerktekening</span>
      </label>

      {stappen.length > 0 && (
        <ol className="mw-stappen" aria-live="polite">
          {stappen.map((s, i) => <li key={i} className={s.klaar ? 'klaar' : 'bezig'}>{s.t}</li>)}
        </ol>
      )}
      {fout && <p className="mw-fout" role="alert">{fout}</p>}

      {o && (
        <section ref={uitkomst} className="mw-uit" aria-labelledby="mw-uit-kop">
          <h2 id="mw-uit-kop">Dit is je woning</h2>
          <p className="mw-sub"><span className="mono">≈ {nl(totaal)} m²</span> binnen de wanden, gemeten uit {o.bron} op schaal 1:{o.lagen[0].schaal}. Plafondhoogte 2,60 m aangenomen.</p>

          <div className="mw-kiezer" role="tablist" aria-label="Verdieping">
            {o.lagen.map((l, i) => (
              <button key={i} type="button" role="tab" aria-selected={i === actief}
                onClick={() => { const k = dek.current?.children[i] as HTMLElement | undefined; if (k && dek.current) dek.current.scrollTo({ left: k.offsetLeft - dek.current.offsetLeft, behavior: 'smooth' }); setActief(i) }}>
                {mooi(l.naam).replace('verdieping', 'verd.')}
              </button>
            ))}
          </div>
          <div className="mw-dek" ref={dek} tabIndex={0} aria-label="Verdiepingen, veeg opzij"
            onScroll={e => { const d = e.currentTarget; const i = Math.round(d.scrollLeft / (d.clientWidth + 12)); if (i !== actief) setActief(Math.max(0, Math.min(o.lagen.length - 1, i))) }}>
            {o.lagen.map((l, i) => (
              <div className="mw-laag" key={i}>
                <div className="mw-stage">
                  <div dangerouslySetInnerHTML={{ __html: svgVoor(l, i, o) }} />
                  <div className="mw-stage-kop">
                    <div><div className="nm">{mooi(l.naam)}</div><div className="sub">{l.ruimtes.length} ruimtes · {l.deuren.length} deuren{l.kap ? ` · nok ± ${nl(l.kap.zNok / 1000, 2)} m` : ''}</div></div>
                    <div className="opp"><div className="getal mono">≈ {nl(l.ruimtes.reduce((t, r) => t + r.m2, 0), 1)}</div><div className="eh">m² vloer</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mw-veeg"><span className="mw-stip" aria-hidden="true">{o.lagen.map((_, i) => <i key={i} className={i === actief ? 'aan' : ''} />)}</span>Veeg opzij voor de volgende verdieping</div>
          <div className="mw-legenda">
            <span><b className="mw-dot">1</b> binnendeur</span>
            <span><i className="gv" /> gietvloer</span>
            <span><i className="mwk" /> meerwerk (rood in je tekening)</span>
            {o.lagen.some(l => l.kap) && <span><i className="hl" /> 1,50 m onder de kap</span>}
          </div>

          {/* ================= DEUREN ================= */}
          <section className="mw-product" ref={deurBlok} aria-labelledby="mw-deuren">
            <p className="mw-oog groen">Deuren · Classic Next</p>
            <h2 id="mw-deuren" className="mw-p-kop">{aantalDeuren} binnendeuren in je tekening. Allemaal te vervangen door een deur zonder zichtbaar kozijn.</h2>
            {melding && <p className="mw-melding" role="status">{melding}</p>}
            <p className="mw-p-lead">Standaard levert de aannemer meestal een opdekdeur in een stalen kozijn. Classic Next maakt kozijn en deur als één systeem: het kozijn verdwijnt in de wand en de deur ligt vlak met de muur. Magneetslot en verdekte scharnieren zitten er standaard in.</p>

            <div className="mw-vergelijk">
              <figure>
                <svg viewBox="0 0 160 200" role="img" aria-label="Standaard: opdekdeur in stalen kozijn">
                  <rect x="0" y="0" width="160" height="200" fill="#EDE6D8" />
                  <rect x="38" y="30" width="84" height="170" fill="#CFCBC3" stroke="rgba(26,18,8,.42)" />
                  <rect x="44" y="36" width="72" height="164" fill="#F4F1EA" stroke="rgba(26,18,8,.42)" />
                  <rect x="38" y="30" width="84" height="6" fill="#BDB8AE" />
                  <line x1="104" y1="118" x2="116" y2="118" stroke={INKT} strokeWidth="3" strokeLinecap="round" />
                  <line x1="0" y1="199" x2="160" y2="199" stroke="rgba(26,18,8,.42)" strokeWidth="2" />
                </svg>
                <figcaption><b>Standaard</b>Opdekdeur in stalen kozijn, kozijn zichtbaar in de wand</figcaption>
              </figure>
              <figure>
                <svg viewBox="0 0 160 200" role="img" aria-label="Classic Next: kozijnloos en plafondhoog">
                  <rect x="0" y="0" width="160" height="200" fill="#EDE6D8" />
                  <rect x="44" y="2" width="72" height="198" fill="#EFEAE0" />
                  <line x1="44" y1="2" x2="44" y2="200" stroke="rgba(26,18,8,.42)" strokeWidth=".8" />
                  <line x1="116" y1="2" x2="116" y2="200" stroke="rgba(26,18,8,.42)" strokeWidth=".8" />
                  <line x1="104" y1="110" x2="116" y2="110" stroke={INKT} strokeWidth="3" strokeLinecap="round" />
                  <line x1="0" y1="199" x2="160" y2="199" stroke="rgba(26,18,8,.42)" strokeWidth="2" />
                </svg>
                <figcaption><b>Classic Next</b>Geen zichtbaar kozijn, deur tot aan het plafond</figcaption>
              </figure>
            </div>

            {o.lagen.map((l, li) => l.deuren.length > 0 && (
              <div className="mw-groep" key={li}>
                <p className="mw-groep-kop">{mooi(l.naam)}</p>
                <ul>
                  {l.deuren.map((d, di) => {
                    const b = beschrijf(o.deuren[li + ':' + di])
                    return (
                      <li key={di} className={b ? 'gekozen' : ''}>
                        <b className="mw-dot" style={b ? { background: b.kleur, color: licht(b.kleur) ? INKT : '#fff' } : undefined}>{deurNummer(o, li, di)}</b>
                        <span className="mw-deur-t">
                          <span className="nm">{kort(d.naar)}</span>
                          <span className="sp">{b ? `${b.ontwerp} · ${b.afwerking}` : `nog niet gekozen · ± ${nl(d.breedte / 10)} cm`}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            <p className="mw-let"><b>Beslis vóór de stukadoor komt.</b> Het kozijn moet in de ruwbouw in de wand staan. Bij nieuwbouw loopt dat via de meerwerklijst van je aannemer, dus let op de sluitingsdatum.</p>
            <ul className="mw-plus">
              <li>5% ledenkorting via Bylder</li>
              <li>Gemaakt in Uden, levering door heel Nederland</li>
              <li>Je keuzes komen terug in deze woning</li>
            </ul>
            <div className="mw-cta">
              <a className="mw-knop" href={naarConfigurator(o)}>{gekozen ? `Verder met je ${aantalDeuren} deuren` : `Configureer deze ${aantalDeuren} deuren`}</a>
              <a className="mw-knop-licht" href="/kozijnloze-deuren/classic-next/">Meer over Classic Next</a>
            </div>
          </section>

          {/* ================= VLOER ================= */}
          <section className="mw-product" aria-labelledby="mw-vloer">
            <p className="mw-oog groen">Vloer · DRT Contemporary</p>
            <h2 id="mw-vloer" className="mw-p-kop">≈ {nl(m2Giet)} m² gietvloer, gemeten uit je tekening.</h2>
            <p className="mw-p-lead">DRT legt naadloze polyurethaan gietvloeren. Een gietvloer is dun en ligt direct op de dekvloer, en gaat daardoor goed samen met vloerverwarming. Kies welke ruimtes meedoen: de vloer in je woning kleurt mee.</p>
            <div className="mw-kleuren" role="radiogroup" aria-label="Kleurindicatie gietvloer">
              {KLEURVLOER.map(c => (
                <button key={c.id} type="button" role="radio" aria-checked={o.kleur === c.id} onClick={() => bewaar({ ...o, kleur: c.id })}>
                  <i style={{ background: c.c }} />{c.n}
                </button>
              ))}
            </div>
            <div className="mw-vloerlijst">
              {o.lagen.map((l, li) => (
                <div key={li}>
                  <p className="mw-groep-kop">{mooi(l.naam)}</p>
                  {l.ruimtes.slice().sort((a, b) => b.m2 - a.m2).map(r => {
                    const key = li + ':' + r.id
                    return (
                      <label className="mw-vl-rij" key={key}>
                        <input type="checkbox" id={`mw-giet-${li}-${r.id}`} checked={!!o.giet[key]} onChange={() => wisselGiet(key)} />
                        <span>{r.naam}</span><span className="mono">≈ {nl(r.m2, 1)} m²</span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="mw-reken">
              <div><span>{nl(m2Giet, 1)} m² × €{PRIJS_M2}</span><span className="mono">{eur(bruto)}</span></div>
              <div className="groen"><span>10% ledenkorting DRT via Bylder</span><span className="mono">− {eur(korting)}</span></div>
              <div><span>Opmeting aan huis</span><span className="mono">gratis</span></div>
              <div className="tot"><span>Rekenvoorbeeld</span><span className="mono">{eur(bruto - korting)}</span></div>
            </div>
            <p className="mw-klein">Rekenvoorbeeld op €{PRIJS_M2} per m², het bedrag uit het voorbeeld op onze DRT-pagina. Je echte prijs volgt uit de opmeting. Kleuren zijn een indicatie op je scherm, geen staal.</p>
            <div className="mw-cta"><a className="mw-knop" href="/vouchers/drt-contemporary/">Vraag een gratis opmeting aan</a></div>
            <p className="mw-klein">De offertetool voor gietvloeren komt eraan. Tot die er is, meet DRT gratis bij je thuis.</p>
          </section>

          <section className="mw-samen">
            <p className="mw-oog licht">Waarom via Bylder</p>
            <h3>Eén plan voor je hele woning, langs de winkels die het echt maken.</h3>
            <p>Uit één tekening: <b>{aantalDeuren} deuren</b> voor Classic Next en <b>≈ {nl(m2Giet)} m² vloer</b> voor DRT. Normaal meet je dat twee keer op, bij twee winkels. Hier ligt het klaar, met ledenkorting bij allebei, en een adviseur die je stalen van de ene showroom naar de andere meeneemt.</p>
          </section>

          <p className="mw-voet">
            Je woning staat alleen in deze browser. Je tekening zelf is niet verstuurd of bewaard.{' '}
            <button type="button" className="mw-link" onClick={() => { bewaar(null); setStappen([]); setMelding('') }}>Woning wissen</button>
          </p>
        </section>
      )}

      {!o && (
        <p className="mw-voet">Je tekening blijft in je browser: er wordt niets verstuurd of opgeslagen.</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ opmaak */

const CSS = `
.mw{max-width:1180px;margin:0 auto;padding:28px 16px 64px;color:${INKT};font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.mw .mono{font-family:'Space Mono',monospace;font-variant-numeric:tabular-nums}
.mw-oog{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:rgba(26,18,8,.45);font-weight:700;margin:0}
.mw-oog.groen{color:${GROEN}}.mw-oog.licht{color:rgba(245,240,232,.6)}
.mw-kop h1{font-size:clamp(26px,6.4vw,44px);line-height:1.08;font-weight:800;letter-spacing:-.03em;margin:6px 0 12px;text-wrap:balance}
.mw-lead{max-width:60ch;margin:0;color:rgba(26,18,8,.7);font-size:15.5px;line-height:1.6}
.mw-sleep{position:relative;display:grid;justify-items:center;gap:8px;text-align:center;cursor:pointer;border:2px dashed rgba(26,18,8,.28);border-radius:16px;background:#FBF8F2;padding:34px 16px;margin-top:20px}
.mw-sleep:hover,.mw-sleep.over{border-color:${GROEN};background:#EBF0E8}
.mw-sleep:focus-within{outline:3px solid ${GROEN};outline-offset:3px}
.mw-sleep input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.mw-sleep-t{font-size:18px;font-weight:700}.mw-sleep-s{font-size:13px;color:rgba(26,18,8,.7)}
.mw-stappen{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:8px}
.mw-stappen li{display:flex;gap:10px;align-items:center;font-size:14px}
.mw-stappen li::before{content:"";width:16px;height:16px;border-radius:50%;flex:none;border:2px solid rgba(26,18,8,.28)}
.mw-stappen li.bezig{color:rgba(26,18,8,.7)}
.mw-stappen li.bezig::before{border-top-color:${GROEN};animation:mw-draai .8s linear infinite}
.mw-stappen li.klaar::before{border-color:${GROEN};background:${GROEN} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.2l2.6 2.6L12 5.4' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E") center/cover}
@keyframes mw-draai{to{transform:rotate(360deg)}}
.mw-fout{margin:16px 0 0;padding:12px 14px;border-radius:10px;background:rgba(184,92,56,.1);border:1px solid ${ROEST};font-size:14px}
.mw-uit{margin-top:28px}
.mw-uit>h2{font-size:24px;font-weight:800;letter-spacing:-.02em;margin:0 0 4px}
.mw-sub{margin:0 0 14px;color:rgba(26,18,8,.7);font-size:14px}
.mw-kiezer{display:flex;gap:6px;padding:3px;background:#EDE6D8;border-radius:999px;width:max-content;max-width:100%;overflow-x:auto}
.mw-kiezer button{font:inherit;font-size:13px;font-weight:600;white-space:nowrap;border:0;background:transparent;color:rgba(26,18,8,.7);padding:7px 14px;border-radius:999px;cursor:pointer}
.mw-kiezer button[aria-selected="true"]{background:${INKT};color:#F5F0E8}
.mw-dek{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin-top:12px;scrollbar-width:none}
.mw-dek::-webkit-scrollbar{display:none}
.mw-laag{scroll-snap-align:center}
.mw-stage{position:relative;background:radial-gradient(120% 90% at 50% 12%,#E4DBC8 0%,#EDE6D8 62%);border:1px solid rgba(26,18,8,.14);border-radius:14px;overflow:hidden}
.mw-stage svg{display:block;width:100%;height:auto;max-height:min(58vh,520px)}
.mw-stage-kop{position:absolute;inset:12px 12px auto 12px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;pointer-events:none}
.mw-stage-kop .nm{font-size:13.5px;font-weight:700}.mw-stage-kop .sub{font-size:11.5px;color:rgba(26,18,8,.7)}
.mw-stage-kop .opp{text-align:right}.mw-stage-kop .getal{font-size:19px;font-weight:700}.mw-stage-kop .eh{font-size:11px;color:rgba(26,18,8,.7)}
.mw-veeg{display:flex;align-items:center;gap:7px;justify-content:center;font-size:11.5px;color:rgba(26,18,8,.45);padding-top:9px}
.mw-stip{display:flex;gap:5px}.mw-stip i{width:5px;height:5px;border-radius:50%;background:rgba(26,18,8,.28)}.mw-stip i.aan{background:${INKT}}
.mw-legenda{display:flex;flex-wrap:wrap;gap:14px;font-size:11.5px;color:rgba(26,18,8,.55);padding-top:10px}
.mw-legenda span{display:inline-flex;align-items:center;gap:6px}
.mw-legenda i{display:block;width:16px}.mw-legenda i.gv{height:10px;background:#D6C8B0;border-radius:2px}
.mw-legenda i.mwk{border-top:3px solid ${ROEST}}.mw-legenda i.hl{border-top:2px dashed ${GROEN}}
.mw-dot{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:${GROEN};color:#fff;font-size:11px;font-weight:700;flex:none;box-shadow:0 0 0 1px rgba(26,18,8,.18)}
.mw-product{margin-top:26px;padding:20px 16px;background:#FBF8F2;border:1px solid rgba(26,18,8,.14);border-radius:16px;display:grid;gap:14px}
.mw-p-kop{font-size:clamp(21px,4.6vw,28px);line-height:1.15;letter-spacing:-.02em;font-weight:800;margin:0;text-wrap:balance}
.mw-p-lead{margin:0;color:rgba(26,18,8,.7);max-width:64ch;line-height:1.6}
.mw-melding{margin:0;padding:10px 12px;border-radius:10px;background:#EBF0E8;color:${GROEN};font-weight:700;font-size:14px}
.mw-vergelijk{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:520px}
.mw-vergelijk figure{margin:0;display:grid;gap:8px}
.mw-vergelijk svg{width:100%;height:auto;max-height:220px;border-radius:10px}
.mw-vergelijk figcaption{font-size:12.5px;color:rgba(26,18,8,.7);line-height:1.4}
.mw-vergelijk figcaption b{display:block;color:${INKT};font-size:13.5px}
.mw-groep{display:grid;gap:6px}
.mw-groep-kop{margin:6px 0 0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(26,18,8,.45);font-weight:700}
.mw-groep ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px}
.mw-groep li{display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid rgba(26,18,8,.14);border-radius:10px;background:#F5F0E8}
.mw-groep li.gekozen{border-color:${GROEN};background:#EBF0E8}
.mw-deur-t{display:grid;min-width:0}.mw-deur-t .nm{font-size:14px;font-weight:700}.mw-deur-t .sp{font-size:12px;color:rgba(26,18,8,.6)}
.mw-let{margin:0;padding:12px 14px;border-left:3px solid ${ROEST};background:rgba(184,92,56,.07);border-radius:0 10px 10px 0;font-size:14px;line-height:1.55}
.mw-plus{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13.5px}
.mw-plus li::before{content:"✓";color:${GROEN};font-weight:800;margin-right:6px}
.mw-cta{display:flex;flex-wrap:wrap;gap:10px}
.mw-knop{display:inline-block;background:${GROEN};color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;font-size:15px}
.mw-knop-licht{display:inline-block;color:${INKT};text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;font-size:15px;border:1px solid rgba(26,18,8,.28)}
.mw-kleuren{display:flex;flex-wrap:wrap;gap:8px}
.mw-kleuren button{font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;border-radius:999px;border:1px solid rgba(26,18,8,.28);background:#F5F0E8;color:${INKT};cursor:pointer}
.mw-kleuren i{width:22px;height:22px;border-radius:50%;border:1px solid rgba(26,18,8,.28)}
.mw-kleuren button[aria-checked="true"]{border-color:${GROEN};box-shadow:0 0 0 2px ${GROEN} inset}
.mw-vloerlijst{display:grid;gap:4px}
@media (min-width:760px){.mw-vloerlijst{grid-template-columns:repeat(3,1fr);gap:4px 18px;align-items:start}}
.mw-vl-rij{display:flex;align-items:center;gap:8px;padding:7px 2px;border-bottom:1px solid rgba(26,18,8,.14);font-size:14px;cursor:pointer}
.mw-vl-rij input{width:18px;height:18px;accent-color:${GROEN}}
.mw-vl-rij .mono{margin-left:auto;font-size:12.5px;color:rgba(26,18,8,.7)}
.mw-reken{display:grid;gap:1px;background:rgba(26,18,8,.14);border-radius:10px;overflow:hidden;max-width:460px}
.mw-reken div{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;background:#F5F0E8;font-size:14px}
.mw-reken .groen{color:${GROEN};font-weight:600}.mw-reken .tot{font-weight:800;font-size:16px}
.mw-klein{margin:0;font-size:12px;color:rgba(26,18,8,.5);max-width:64ch}
.mw-samen{margin-top:22px;background:${INKT};color:#F5F0E8;border-radius:14px;padding:18px 16px}
.mw-samen h3{font-size:19px;margin:4px 0 8px}.mw-samen p{margin:0;max-width:62ch;font-size:14px;line-height:1.6;opacity:.9}
.mw-voet{margin-top:24px;font-size:12px;color:rgba(26,18,8,.5)}
.mw-link{font:inherit;color:${ROEST};font-weight:700;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline}
`
