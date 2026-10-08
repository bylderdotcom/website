// KOPIE van app/src/components/kast/PlekAanwijzen.tsx (bylderdotcom/app). Wijzig beide tegelijk.
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowCounterClockwise, Trash, MagnifyingGlassPlus, MagnifyingGlassMinus, Check, UploadSimple } from '@phosphor-icons/react'

// Plattegrond uploaden en aanwijzen waar de kast komt.
//
// De koper tikt op de tekening: één tik is een plek, twee punten een kast langs
// één muur, drie punten een hoekkast (V-vorm) met de hoek in het middelste punt.
// Er gaan twee beelden naar de ontwerper: het overzicht (welke kamer) en een
// uitsnede rond de lijn, groot genoeg om de maatvoering op de tekening te lezen.
// Een pdf wordt in de browser getekend; er gaat geen pdf over de lijn.

export type AangewezenFoto = { media_type: 'image/jpeg'; data: string; voorbeeld: string }
export type Aangewezen = { fotos: AangewezenFoto[]; tekst: string }
type Punt = { x: number; y: number }
type Pdf = { numPages: number; getPage: (n: number) => Promise<PdfPagina> }
type PdfPagina = {
  getViewport: (o: { scale: number }) => { width: number; height: number }
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> }
}

const MAX = 2400
// Een pdf is scherp te renderen: groter, zodat de uitsnede rond de lijn de maatvoering leesbaar houdt.
const MAX_PDF = 4200
const ROOD = '#D7462E'
const BASE64_MAX = 1_400_000

const isPdf = (f: File) => /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)

async function tekenPdfPagina(pdf: Pdf, n: number): Promise<HTMLCanvasElement> {
  const p = await pdf.getPage(n)
  const v1 = p.getViewport({ scale: 1 })
  const v = p.getViewport({ scale: Math.min(6, MAX_PDF / Math.max(v1.width, v1.height)) })
  const c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height)
  const g = c.getContext('2d')!; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  await p.render({ canvasContext: g, viewport: v }).promise
  return c
}

async function tekenAfbeelding(f: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(f)
  const s = Math.min(1, MAX / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
  const g = c.getContext('2d')!; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.drawImage(bmp, 0, 0, c.width, c.height)
  return c
}

/** Lijn en genummerde punten op een canvas, in de maat van dat canvas. */
function tekenMarkering(g: CanvasRenderingContext2D, punten: Punt[], schaal: number, dx = 0, dy = 0) {
  const lw = Math.max(3, 6 * schaal), r = Math.max(9, 16 * schaal)
  g.lineCap = 'round'; g.lineJoin = 'round'
  if (punten.length > 1) {
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = lw + 4 * schaal
    g.beginPath(); punten.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x - dx, p.y - dy)); g.stroke()
    g.strokeStyle = ROOD; g.lineWidth = lw
    g.beginPath(); punten.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, p.x - dx, p.y - dy)); g.stroke()
  }
  punten.forEach((p, i) => {
    g.fillStyle = ROOD; g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, 3 * schaal)
    g.beginPath(); g.arc(p.x - dx, p.y - dy, r, 0, Math.PI * 2); g.fill(); g.stroke()
    g.fillStyle = '#fff'; g.font = `700 ${Math.round(r * 1.2)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(String(i + 1), p.x - dx, p.y - dy + r * 0.05)
  })
}

/** Canvas → jpeg die binnen de limiet van de ontwerper past. */
function naarJpeg(c: HTMLCanvasElement, maxZijde: number): AangewezenFoto {
  let zijde = maxZijde, q = 0.86
  for (;;) {
    const s = Math.min(1, zijde / Math.max(c.width, c.height))
    const o = document.createElement('canvas'); o.width = Math.round(c.width * s); o.height = Math.round(c.height * s)
    const g = o.getContext('2d')!; g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height)
    const url = o.toDataURL('image/jpeg', q)
    const data = url.split(',')[1]
    if (data.length <= BASE64_MAX || zijde < 700) return { media_type: 'image/jpeg', data, voorbeeld: url }
    if (q > 0.7) q -= 0.08; else zijde = Math.round(zijde * 0.85)
  }
}

function beschrijf(n: number) {
  const kop = '[Plattegrond] Op mijn plattegrond (overzicht en uitsnede) heb ik in rood aangegeven waar de kast komt'
  if (n === 1) return `${kop}: bij punt 1.`
  if (n === 2) return `${kop}: langs de muur van punt 1 naar punt 2.`
  if (n === 3) return `${kop}: in een hoek, als V-vorm van punt 1 via de hoek bij punt 2 naar punt 3.`
  return `${kop}: langs de lijn van punt 1 tot punt ${n}.`
}

export default function PlekAanwijzen({ onKlaar, onSluit }: { onKlaar: (a: Aangewezen) => void; onSluit: () => void }) {
  const [beeld, setBeeld] = useState<HTMLCanvasElement | null>(null)
  const [url, setUrl] = useState('')
  const [punten, setPunten] = useState<Punt[]>([])
  const [zoom, setZoom] = useState(1)
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [pagina, setPagina] = useState(1)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [sleep, setSleep] = useState(false)
  const invoer = useRef<HTMLInputElement>(null)
  const doek = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onSluit() }
    window.addEventListener('keydown', esc)
    const oud = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = oud }
  }, [onSluit])

  function toon(c: HTMLCanvasElement) { setBeeld(c); setUrl(c.toDataURL('image/jpeg', 0.82)); setPunten([]); setZoom(1) }

  async function kies(f?: File | null) {
    if (!f) return
    setFout(''); setBezig(true)
    try {
      if (isPdf(f)) {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        const doc = (await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise) as unknown as Pdf
        setPdf(doc); setPagina(1); toon(await tekenPdfPagina(doc, 1))
      } else if (/^image\//.test(f.type)) {
        setPdf(null); toon(await tekenAfbeelding(f))
      } else setFout('Kies een pdf of een foto van de tekening.')
    } catch (e) {
      console.error(e); setFout('Deze tekening konden we niet openen. Probeer een foto of een andere pdf.')
    } finally { setBezig(false) }
  }

  async function naarPagina(n: number) {
    if (!pdf || n < 1 || n > pdf.numPages) return
    setBezig(true); setPagina(n)
    try { toon(await tekenPdfPagina(pdf, n)) } finally { setBezig(false) }
  }

  function tik(e: React.MouseEvent<HTMLDivElement>) {
    if (!beeld || punten.length >= 6) return
    const r = e.currentTarget.getBoundingClientRect()
    setPunten(p => [...p, { x: (e.clientX - r.left) / r.width * beeld.width, y: (e.clientY - r.top) / r.height * beeld.height }])
  }

  function klaar() {
    if (!beeld || !punten.length) return
    // overzicht: de hele tekening met de markering
    const ov = document.createElement('canvas'); ov.width = beeld.width; ov.height = beeld.height
    const g = ov.getContext('2d')!; g.drawImage(beeld, 0, 0)
    const schaal = Math.max(beeld.width, beeld.height) / 1600
    tekenMarkering(g, punten, schaal)
    // uitsnede: rond de lijn, minstens een kwart van de tekening, zodat maten leesbaar zijn
    const xs = punten.map(p => p.x), ys = punten.map(p => p.y)
    const minZ = Math.max(beeld.width, beeld.height) * 0.24
    const bw = Math.max(minZ, (Math.max(...xs) - Math.min(...xs)) * 1.7), bh = Math.max(minZ, (Math.max(...ys) - Math.min(...ys)) * 1.7)
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2
    const x0 = Math.max(0, Math.round(cx - bw / 2)), y0 = Math.max(0, Math.round(cy - bh / 2))
    const x1 = Math.min(beeld.width, Math.round(cx + bw / 2)), y1 = Math.min(beeld.height, Math.round(cy + bh / 2))
    const ui = document.createElement('canvas'); ui.width = x1 - x0; ui.height = y1 - y0
    const gu = ui.getContext('2d')!; gu.drawImage(beeld, x0, y0, ui.width, ui.height, 0, 0, ui.width, ui.height)
    tekenMarkering(gu, punten, Math.max(ui.width, ui.height) / 1600, x0, y0)
    const groot = Math.max(ui.width, ui.height) / Math.max(beeld.width, beeld.height) > 0.8
    const fotos = groot ? [naarJpeg(ov, 1568)] : [naarJpeg(ov, 1400), naarJpeg(ui, 1568)]
    onKlaar({ fotos, tekst: beschrijf(punten.length) })
  }

  const sw = beeld ? Math.max(beeld.width, beeld.height) / 260 : 4
  const hint = !punten.length ? 'Tik op de plek waar de kast komt.'
    : punten.length === 1 ? 'Eén plek. Langs een muur? Tik het tweede uiteinde.'
      : punten.length === 2 ? 'Langs één muur. Een hoekkast? Maak van punt 2 de hoek en tik het derde punt.'
        : punten.length === 3 ? 'Hoekkast (V-vorm), met de hoek bij punt 2.' : `Een lijn langs ${punten.length} punten.`

  // In een portaal: binnen de ontwerper zit een paneel met backdrop-filter, en
  // daarin zou 'position: fixed' niet het hele scherm pakken.
  return createPortal(
    <div className="pa" role="dialog" aria-modal="true" aria-labelledby="pa-titel">
      <style>{CSS}</style>
      <div className="pa-kop">
        <div>
          <h2 id="pa-titel">Wijs de plek aan op je plattegrond</h2>
          <p>{beeld ? hint : 'Een pdf van de verkooptekening of een foto van de plattegrond. De ontwerper leest de maten ervan af.'}</p>
        </div>
        <button type="button" className="pa-rond" onClick={onSluit} aria-label="Sluiten"><X size={20} /></button>
      </div>

      {!beeld ? (
        <div className={`pa-leeg${sleep ? ' pa-sleep' : ''}`}
          onDragOver={e => { e.preventDefault(); setSleep(true) }} onDragLeave={() => setSleep(false)}
          onDrop={e => { e.preventDefault(); setSleep(false); kies(e.dataTransfer.files?.[0]) }}>
          <UploadSimple size={34} aria-hidden="true" />
          <strong>{bezig ? 'Tekening openen…' : 'Sleep je tekening hierheen'}</strong>
          <span>pdf, jpg of png</span>
          <button type="button" className="pa-knop pa-primair" disabled={bezig} onClick={() => invoer.current?.click()}>Kies een bestand</button>
          <span className="pa-klein">Geen tekening? Sluit dit venster en beschrijf de plek in het gesprek. Een foto met een A4’tje tegen de muur werkt ook.</span>
        </div>
      ) : (
        <div className="pa-werk" ref={doek}>
          <div className="pa-doek" style={{ width: `calc(${zoom} * min(100%, (100dvh - 210px) * ${beeld.width / beeld.height}))` }} onClick={tik}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Je plattegrond" draggable={false} />
            <svg viewBox={`0 0 ${beeld.width} ${beeld.height}`} aria-hidden="true">
              {punten.length > 1 && <polyline points={punten.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth={sw * 1.7} strokeLinecap="round" strokeLinejoin="round" />}
              {punten.length > 1 && <polyline points={punten.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={ROOD} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
              {punten.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={sw * 2.6} fill={ROOD} stroke="#fff" strokeWidth={sw * 0.5} />
                  <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={sw * 3.2} fontWeight={700}>{i + 1}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {fout && <p role="alert" className="pa-fout">{fout}</p>}

      {beeld && (
        <div className="pa-balk">
          <div className="pa-groep">
            <button type="button" className="pa-rond" onClick={() => setPunten(p => p.slice(0, -1))} disabled={!punten.length} aria-label="Laatste punt weghalen" title="Laatste punt weghalen"><ArrowCounterClockwise size={18} /></button>
            <button type="button" className="pa-rond" onClick={() => setPunten([])} disabled={!punten.length} aria-label="Alle punten wissen" title="Alle punten wissen"><Trash size={18} /></button>
            <button type="button" className="pa-rond" onClick={() => setZoom(z => Math.max(1, z - 0.5))} disabled={zoom <= 1} aria-label="Uitzoomen"><MagnifyingGlassMinus size={18} /></button>
            <button type="button" className="pa-rond" onClick={() => setZoom(z => Math.min(4, z + 0.5))} disabled={zoom >= 4} aria-label="Inzoomen"><MagnifyingGlassPlus size={18} /></button>
            {pdf && pdf.numPages > 1 && (
              <label className="pa-pagina">Pagina
                <select value={pagina} onChange={e => naarPagina(Number(e.target.value))} disabled={bezig}>
                  {Array.from({ length: pdf.numPages }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="pa-knop" onClick={() => { setBeeld(null); setPdf(null); setPunten([]) }}>Andere tekening</button>
          </div>
          <button type="button" className="pa-knop pa-primair" onClick={klaar} disabled={!punten.length}><Check size={18} weight="bold" aria-hidden="true" />Gebruik deze plek</button>
        </div>
      )}
      <input ref={invoer} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" hidden onChange={e => { kies(e.target.files?.[0]); e.target.value = '' }} />
    </div>,
    document.body,
  )
}

const CSS = `
.pa{position:fixed;inset:0;z-index:2147483000;background:#F5F0E8;display:flex;flex-direction:column;color:#3D2E1E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.pa-kop{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:16px 18px 12px;border-bottom:1px solid rgba(61,46,30,.12);background:#fff}
.pa-kop h2{margin:0 0 4px;font-size:18px;font-weight:800;color:#1A1208;letter-spacing:-.01em}
.pa-kop p{margin:0;font-size:14px;line-height:1.5;color:rgba(61,46,30,.7)}
.pa-rond{flex:none;width:40px;height:40px;border-radius:999px;border:1px solid rgba(61,46,30,.16);background:#fff;color:#1A1208;display:grid;place-items:center;cursor:pointer}
.pa-rond:disabled{opacity:.4;cursor:default}
.pa-leeg{flex:1;margin:18px;border:2px dashed rgba(61,46,30,.22);border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;color:rgba(61,46,30,.7)}
.pa-leeg strong{font-size:17px;color:#1A1208}
.pa-sleep{border-color:#3D5A3E;background:rgba(61,90,62,.06)}
.pa-klein{font-size:13px;max-width:44ch;line-height:1.5;margin-top:6px}
.pa-werk{flex:1;overflow:auto;padding:14px;-webkit-overflow-scrolling:touch}
.pa-doek{position:relative;margin:0 auto;max-width:none;cursor:crosshair;background:#fff;box-shadow:0 10px 30px -18px rgba(26,18,8,.5);border-radius:6px;overflow:hidden;touch-action:pan-x pan-y}
.pa-doek img{display:block;width:100%;height:auto;user-select:none;-webkit-user-select:none;pointer-events:none}
.pa-doek svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.pa-balk{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:12px 14px calc(12px + env(safe-area-inset-bottom));border-top:1px solid rgba(61,46,30,.12);background:#fff}
.pa-groep{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pa-knop{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;border:1px solid rgba(61,46,30,.16);background:#fff;font:inherit;font-weight:700;font-size:14px;color:#1A1208;cursor:pointer}
.pa-primair{background:#3D5A3E;border-color:#3D5A3E;color:#F5F0E8}
.pa-primair:disabled{opacity:.45;cursor:default}
.pa-pagina{display:inline-flex;gap:6px;align-items:center;font-size:13px;font-weight:600}
.pa-pagina select{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid rgba(61,46,30,.2);background:#fff}
.pa-fout{margin:8px 18px;color:#8C2F1E;font-size:14px}
@media (max-width:640px){.pa-balk .pa-primair{width:100%;justify-content:center}}
`
