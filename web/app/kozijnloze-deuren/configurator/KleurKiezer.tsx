'use client'

import { useEffect, useRef, useCallback } from 'react'
import { KLEUREN, type Kleur } from './ontwerpen'

// Vrije kleurkiezer: tint en verzadiging in het vlak, helderheid in de balk.
//
// WAAROM ER ALTIJD EEN RAL BIJ STAAT
// Classic Next lakt in RAL. Iemand die hier een kleur kiest die niet bestelbaar
// is, krijgt straks een offerte voor iets anders dan hij zag — precies het soort
// belofte dat we vandaag op drie andere plekken hebben weggehaald. Dus: kies vrij
// om te zién hoe een kleur op deze deur valt, en lees eronder welke RAL daar het
// dichtst bij ligt. Dat is ook hoe je het in het echt doet: je kijkt, en dan
// bestel je een staal.

const VLAK_B = 260
const VLAK_H = 190

function hsvNaarRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6), f = h * 6 - i
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t],
                     [p, q, v], [t, p, v], [v, p, q]][i % 6]
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

const hex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')

// sRGB → Lab, zodat "dichtstbijzijnde" klopt met wat een oog ziet. In platte
// RGB-afstand ligt donkerblauw ineens naast donkergroen.
function naarLab(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  const [r, g, b] = rgb
  const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const Y = (r * 0.2126 + g * 0.7152 + b * 0.0722)
  const Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116)
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]
}

export function dichtstbijzijndeRal(h: string): Kleur {
  const a = naarLab(h)
  let best = KLEUREN[0], bestD = Infinity
  for (const k of KLEUREN) {
    const b = naarLab(k.hex)
    const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
    if (d < bestD) { bestD = d; best = k }
  }
  return best
}

export default function KleurKiezer({
  waarde, helderheid, onKies,
}: {
  waarde: string
  helderheid: number
  onKies: (hex: string, h: number, s: number, v: number) => void
}) {
  const vlak = useRef<HTMLCanvasElement>(null)
  const balk = useRef<HTMLCanvasElement>(null)
  const sleept = useRef<'vlak' | 'balk' | null>(null)

  // Het vlak: tint over de breedte, verzadiging over de hoogte, en de gekozen
  // helderheid als zwarte sluier eroverheen.
  const tekenVlak = useCallback(() => {
    const c = vlak.current
    if (!c) return
    const g = c.getContext('2d')!
    const d = g.createImageData(VLAK_B, VLAK_H)
    for (let y = 0; y < VLAK_H; y++) {
      for (let x = 0; x < VLAK_B; x++) {
        const [r, gg, b] = hsvNaarRgb(x / VLAK_B, 1 - y / VLAK_H, helderheid)
        const i = (y * VLAK_B + x) * 4
        d.data[i] = r; d.data[i + 1] = gg; d.data[i + 2] = b; d.data[i + 3] = 255
      }
    }
    g.putImageData(d, 0, 0)
  }, [helderheid])

  const tekenBalk = useCallback(() => {
    const c = balk.current
    if (!c) return
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 0, VLAK_H)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(1, '#000000')
    g.fillStyle = grad
    g.fillRect(0, 0, 22, VLAK_H)
  }, [])

  useEffect(() => { tekenVlak(); tekenBalk() }, [tekenVlak, tekenBalk])

  const uitVlak = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    const [rr, gg, bb] = hsvNaarRgb(x, 1 - y, helderheid)
    onKies(hex(rr, gg, bb), x, 1 - y, helderheid)
  }

  const uitBalk = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    onKies(waarde, -1, -1, Math.max(0.06, v))
  }

  const ral = dichtstbijzijndeRal(waarde)

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, touchAction: 'none' }}>
        <canvas ref={vlak} width={VLAK_B} height={VLAK_H}
          onPointerDown={e => { sleept.current = 'vlak'; e.currentTarget.setPointerCapture(e.pointerId); uitVlak(e) }}
          onPointerMove={e => { if (sleept.current === 'vlak') uitVlak(e) }}
          onPointerUp={() => { sleept.current = null }}
          aria-label="Kleurvlak: sleep om een tint te kiezen"
          style={{ flex: 1, height: VLAK_H, borderRadius: 9, cursor: 'crosshair',
                   border: '1px solid rgba(61,46,30,0.18)', display: 'block' }} />
        <canvas ref={balk} width={22} height={VLAK_H}
          onPointerDown={e => { sleept.current = 'balk'; e.currentTarget.setPointerCapture(e.pointerId); uitBalk(e) }}
          onPointerMove={e => { if (sleept.current === 'balk') uitBalk(e) }}
          onPointerUp={() => { sleept.current = null }}
          aria-label="Helderheid"
          style={{ width: 22, height: VLAK_H, borderRadius: 6, cursor: 'ns-resize',
                   border: '1px solid rgba(61,46,30,0.18)', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 6, background: waarde,
                       border: '1px solid rgba(61,46,30,0.25)', flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'rgba(61,46,30,0.7)', margin: 0, lineHeight: 1.55 }}>
          Dichtstbijzijnde leverbare kleur: <strong>RAL {ral.ral} &middot; {ral.naam}</strong>.
          Classic Next lakt in RAL, dus dit is wat je uiteindelijk krijgt.
        </p>
      </div>
    </div>
  )
}
