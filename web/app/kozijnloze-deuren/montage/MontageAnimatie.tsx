'use client'

import { useEffect, useRef, useState } from 'react'
import { STAPPEN } from './stappen'

// Montage van een kozijnloze deur als animatie (11-11-2026): een vooraanzicht van de wand, waarin elke stap
// zichtbaar gebeurt. Speelt vanzelf af (met pauze), per stap terug te kijken, en staat stil bij
// "minder beweging" in de systeeminstellingen. Alleen SVG en CSS: geen 3D, licht op een telefoon.

const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const INKT = 'rgba(61,46,30,'
const DUUR = 5200

// Maten in het beeld (geen echte maten): wand 760 x 440, sparing midden.
const W = { x: 20, y: 20, w: 760, h: 440 }
const S = { x: 300, y: 70, w: 200, h: 390 }        // sparing
const K = { x: S.x + 8, y: S.y + 8, w: S.w - 16, h: S.h - 8 } // kozijn (binnenmaat)
const VERF = '#C9C4B8'

export default function MontageAnimatie() {
  const [stap, setStap] = useState(0)
  const [speelt, setSpeelt] = useState(true)
  const [rustig, setRustig] = useState(false)
  const kader = useRef<HTMLDivElement>(null)
  const inBeeld = useRef(false)

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (m.matches) { setRustig(true); setSpeelt(false) }
    const io = new IntersectionObserver(([e]) => { inBeeld.current = e.isIntersecting }, { threshold: 0.3 })
    if (kader.current) io.observe(kader.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!speelt) return
    const t = setInterval(() => { if (inBeeld.current) setStap(s => (s + 1) % STAPPEN.length) }, DUUR)
    return () => clearInterval(t)
  }, [speelt])

  const na = (n: number) => stap >= n
  const op = (n: number) => stap === n
  const tr = rustig ? 'none' : 'all .9s cubic-bezier(.2,.7,.2,1)'
  const zicht = (aan: boolean): React.CSSProperties => ({ opacity: aan ? 1 : 0, transition: tr })
  const kozijnY = na(1) ? 0 : -470
  const deurX = na(4) ? 0 : 520
  const geverfd = na(7)
  const stuc = na(3)
  const wandKleur = geverfd ? VERF : stuc ? '#E9E4DA' : '#B9AE9C'
  const deurKleur = geverfd ? VERF : '#E4DFD5'
  const stapInfo = STAPPEN[stap]
  const scharnieren = [0.12, 0.5, 0.88]

  return (
    <div ref={kader} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 18, overflow: 'hidden' }}>
      <svg viewBox="0 0 800 480" role="img" aria-label={`Montage van een kozijnloze deur, stap ${stap + 1} van ${STAPPEN.length}: ${stapInfo.kop}`}
        style={{ display: 'block', width: '100%', height: 'auto', background: '#F6F2EA' }}>
        <defs>
          <pattern id="mm-steen" width="60" height="30" patternUnits="userSpaceOnUse">
            <rect width="60" height="30" fill="#B9AE9C" />
            <path d="M0 0.5H60M0 15.5H60M30 0V15M0 15V30M60 15V30" stroke="#A39882" strokeWidth="1.4" />
          </pattern>
          <clipPath id="mm-wand"><path d={`M${W.x} ${W.y}H${W.x + W.w}V${W.y + W.h}H${W.x}Z M${S.x} ${S.y}V${S.y + S.h}H${S.x + S.w}V${S.y}Z`} clipRule="evenodd" /></clipPath>
        </defs>

        {/* vloer en wand met sparing */}
        <rect x="0" y={W.y + W.h} width="800" height="20" fill="#D8CFC0" />
        <g clipPath="url(#mm-wand)">
          <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="url(#mm-steen)" />
          {/* stucwerk: veegt van links naar rechts over de stenen */}
          <rect x={W.x} y={W.y} height={W.h} fill={wandKleur}
            width={stuc ? W.w : 0} style={{ transition: rustig ? 'none' : 'width 1.6s ease-in-out, fill .9s' }} />
        </g>

        {/* stap 1: maatpijlen in de sparing */}
        <g style={zicht(op(0))} stroke={ROEST} strokeWidth="2" fill={ROEST}>
          <path d={`M${S.x + 6} ${S.y + 30}H${S.x + S.w - 6}`} /><path d={`M${S.x + 6} ${S.y + 30}l10 -6v12z M${S.x + S.w - 6} ${S.y + 30}l-10 -6v12z`} stroke="none" />
          <path d={`M${S.x + S.w / 2} ${S.y + 6}V${S.y + S.h - 6}`} /><path d={`M${S.x + S.w / 2} ${S.y + 6}l-6 10h12z M${S.x + S.w / 2} ${S.y + S.h - 6}l-6 -10h12z`} stroke="none" />
          <text x={S.x + S.w / 2 + 10} y={S.y + 200} fontSize="16" stroke="none" fontFamily="inherit">maat sparing</text>
        </g>

        {/* het kozijn: zakt in de sparing */}
        <g style={{ transform: `translateY(${kozijnY}px)`, transition: tr }}>
          <path d={`M${S.x} ${S.y + S.h}V${S.y}H${S.x + S.w}V${S.y + S.h}H${S.x + S.w - 8}V${S.y + 8}H${S.x + 8}V${S.y + S.h}Z`}
            fill={stuc ? (geverfd ? VERF : '#E9E4DA') : '#9AA1A6'} stroke={stuc ? 'none' : '#6E767C'} strokeWidth="1.5" style={{ transition: tr }} />
          {/* afplaktape op de zichtkant */}
          <path d={`M${S.x + 8} ${S.y + S.h}V${S.y + 8}H${S.x + S.w - 8}V${S.y + S.h}`} fill="none" stroke="#5B8DB8" strokeWidth="3" strokeDasharray="10 6" style={zicht(na(2) && !na(4))} />
        </g>

        {/* stap 2: waterpas en diagonalen */}
        <g style={zicht(op(1))}>
          <path d={`M${K.x} ${K.y}L${K.x + K.w} ${K.y + K.h}M${K.x + K.w} ${K.y}L${K.x} ${K.y + K.h}`} stroke={ROEST} strokeWidth="1.6" strokeDasharray="7 6" />
          <rect x={K.x + 30} y={K.y + 40} width={K.w - 60} height="18" rx="4" fill="#E9C46A" stroke="#A8862E" />
          <rect x={K.x + K.w / 2 - 12} y={K.y + 43} width="24" height="12" rx="6" fill="#fff" stroke="#A8862E" />
          <circle cx={K.x + K.w / 2} cy={K.y + 49} r="4" fill="#7FB069" />
          <rect x={K.x - 30} y={K.y + 120} width="18" height="150" rx="4" fill="#E9C46A" stroke="#A8862E" />
          <circle cx={K.x - 21} cy={K.y + 195} r="4" fill="#7FB069" />
        </g>

        {/* stap 3: bevestigingspunten */}
        <g style={zicht(op(2))} fill={ROEST}>
          {[0.15, 0.4, 0.65, 0.9].flatMap(f => [S.x + 4, S.x + S.w - 4].map(x => <circle key={`${f}-${x}`} cx={x} cy={S.y + S.h * f} r="5" />))}
          {[0.3, 0.7].map(f => <circle key={f} cx={S.x + S.w * f} cy={S.y + 4} r="5" />)}
        </g>

        {/* stap 4: de stukadoor (spaan) veegt mee */}
        <g style={{ ...zicht(op(3)), transform: `translateX(${op(3) ? 520 : 0}px)`, transition: rustig ? 'none' : 'transform 1.6s ease-in-out, opacity .4s' }}>
          <rect x="40" y="250" width="70" height="14" rx="3" fill="#8D99A3" /><rect x="68" y="264" width="12" height="34" rx="4" fill="#7A5A3E" />
        </g>

        {/* het deurblad: schuift van rechts in het kozijn */}
        <g style={{ transform: `translateX(${deurX}px)`, transition: tr }}>
          <rect x={K.x + 3} y={K.y + 3} width={K.w - 6} height={K.h - 6} fill={deurKleur} stroke={geverfd ? 'rgba(0,0,0,.08)' : '#BDB6A8'} strokeWidth="1.5" style={{ transition: tr }} />
          {/* scharnieren */}
          {scharnieren.map(f => <rect key={f} x={K.x + 2} y={K.y + K.h * f - 14} width="6" height="28" rx="2" fill={ROEST} style={{ transition: tr, opacity: op(4) || op(5) ? 1 : 0 }} />)}
          {/* slot en kruk */}
          <g style={zicht(na(6))}>
            <rect x={K.x + K.w - 10} y={K.y + K.h * 0.53 - 16} width="5" height="32" rx="2" fill="#7D7F7D" />
            <rect x={K.x + K.w - 44} y={K.y + K.h * 0.53 - 4} width="34" height="7" rx="3" fill="#222" />
            <rect x={K.x + K.w - 14} y={K.y + K.h * 0.53 - 9} width="8" height="17" rx="2" fill="#222" />
          </g>
        </g>

        {/* stap 6: verstelpijlen bij de scharnieren */}
        <g style={zicht(op(5))} stroke={GROEN} strokeWidth="2.2" fill="none">
          {scharnieren.map(f => {
            const y = K.y + K.h * f
            return <g key={f}>
              <path d={`M${K.x - 26} ${y - 16}V${y + 16}M${K.x - 26} ${y - 16}l-5 7M${K.x - 26} ${y - 16}l5 7M${K.x - 26} ${y + 16}l-5 -7M${K.x - 26} ${y + 16}l5 -7`} />
              <path d={`M${K.x + 18} ${y}H${K.x + 48}M${K.x + 48} ${y}l-7 -5M${K.x + 48} ${y}l-7 5M${K.x + 18} ${y}l7 -5M${K.x + 18} ${y}l7 5`} />
            </g>
          })}
          <rect x={K.x} y={K.y} width={K.w} height={K.h} stroke="#7FB069" strokeWidth="2" strokeDasharray="4 5" />
        </g>

        {/* label rechtsboven: stap en wie */}
        <g>
          <rect x="560" y="34" width="206" height="54" rx="12" fill="#fff" stroke={`${INKT}0.12)`} />
          <text x="576" y="56" fontSize="13" fill={GROEN} fontWeight="700" fontFamily="inherit" letterSpacing="1">STAP {stap + 1} VAN {STAPPEN.length}</text>
          <text x="576" y="77" fontSize="14" fill="#1A1208" fontFamily="inherit">{stapInfo.wie}</text>
        </g>
      </svg>

      <div style={{ padding: '16px 18px 18px', borderTop: `1px solid ${INKT}0.08)` }}>
        <h3 aria-live="polite" style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px', color: '#1A1208' }}>{stap + 1}. {stapInfo.kop}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: `${INKT}0.8)`, margin: '0 0 14px', minHeight: '5em' }}>{stapInfo.tekst}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button type="button" onClick={() => { setSpeelt(false); setStap(s => (s + STAPPEN.length - 1) % STAPPEN.length) }} style={knop}>Vorige</button>
          <button type="button" onClick={() => setSpeelt(v => !v)} style={{ ...knop, background: GROEN, color: '#F5F0E8', borderColor: GROEN }}>{speelt ? 'Pauzeer' : 'Afspelen'}</button>
          <button type="button" onClick={() => { setSpeelt(false); setStap(s => (s + 1) % STAPPEN.length) }} style={knop}>Volgende</button>
          <div role="tablist" aria-label="Stappen" style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {STAPPEN.map((s, i) => (
              <button key={s.kop} type="button" role="tab" aria-selected={i === stap} aria-label={`Stap ${i + 1}: ${s.kop}`}
                onClick={() => { setSpeelt(false); setStap(i) }}
                style={{ width: 12, height: 12, borderRadius: 6, padding: 0, border: 0, cursor: 'pointer', background: i === stap ? GROEN : `${INKT}0.2)` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const knop: React.CSSProperties = {
  padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${INKT}0.16)`, background: '#fff', color: '#1A1208',
  fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
}
