'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type Dia = { id: string; html: string }
const B = 1920, H = 1080

// Binnen een dia: geen marges van de browser, alles op het 1920×1080-doek.
const CSS = `
.kp-dia section{position:relative;box-sizing:border-box;width:${B}px;height:${H}px;overflow:hidden;margin:0}
.kp-dia h1,.kp-dia h2,.kp-dia h3,.kp-dia p{margin:0;-webkit-hyphens:manual;hyphens:manual;overflow-wrap:normal}
.kp-dia img,.kp-dia video{display:block}
.kp-knop{font:600 15px/1 'Plus Jakarta Sans',system-ui,sans-serif;border-radius:999px;padding:13px 20px;cursor:pointer;border:1.5px solid #213C73;display:inline-flex;gap:8px;align-items:center}
.kp-knop:focus-visible{outline:3px solid #C11733;outline-offset:2px}
`

function Doek({ dia, schaal }: { dia: Dia; schaal: number }) {
  return (
    <div className="kp-dia" style={{ width: B, height: H, transform: `scale(${schaal})`, transformOrigin: 'top left', fontFamily: "'Source Sans 3', Arial, sans-serif" }}
      dangerouslySetInnerHTML={{ __html: dia.html }} />
  )
}

export default function Presentatie({ dias }: { dias: Dia[] }) {
  const lijst = useRef<HTMLDivElement>(null)
  const scherm = useRef<HTMLDivElement>(null)
  const [breed, setBreed] = useState(0)
  const [nu, setNu] = useState<number | null>(null)
  const [vp, setVp] = useState({ w: 1920, h: 1080 })
  const [gekopieerd, setGekopieerd] = useState(false)

  useEffect(() => {
    const el = lijst.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBreed(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const zet = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    zet(); window.addEventListener('resize', zet)
    return () => window.removeEventListener('resize', zet)
  }, [])

  const start = useCallback((i: number) => {
    setNu(i)
    const el = scherm.current
    requestAnimationFrame(() => { (scherm.current ?? el)?.requestFullscreen?.().catch(() => {}) })
  }, [])
  const stop = useCallback(() => {
    setNu(null)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])
  const naar = useCallback((d: number) => setNu(i => i === null ? i : Math.min(dias.length - 1, Math.max(0, i + d))), [dias.length])

  useEffect(() => {
    if (nu === null) return
    const toets = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); naar(1) }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); naar(-1) }
      else if (e.key === 'Escape') stop()
      else if (e.key === 'Home') setNu(0)
      else if (e.key === 'End') setNu(dias.length - 1)
    }
    const fs = () => { if (!document.fullscreenElement) setNu(null) }
    window.addEventListener('keydown', toets)
    document.addEventListener('fullscreenchange', fs)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', toets); document.removeEventListener('fullscreenchange', fs); document.body.style.overflow = '' }
  }, [nu, naar, stop, dias.length])

  const veeg = useRef<number | null>(null)
  const kopieer = async () => {
    try { await navigator.clipboard.writeText('https://www.bylder.com/klusseniers/presentatie/'); setGekopieerd(true); setTimeout(() => setGekopieerd(false), 2000) } catch {}
  }

  const s = breed / B
  const sp = Math.min(vp.w / B, vp.h / H)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{CSS}</style>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ maxWidth: 640 }}>
          <p style={{ margin: '0 0 8px', fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C11733', fontWeight: 700 }}>Klussenier × Bylder</p>
          <h1 style={{ margin: 0, fontSize: 'clamp(30px,4.6vw,46px)', lineHeight: 1.1, color: '#14213D', fontWeight: 800, fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" }}>Jouw klant, jouw link, jouw vergoeding</h1>
          <p style={{ margin: '10px 0 0', fontSize: 16, lineHeight: 1.6, color: '#4A5568' }}>De presentatie in {dias.length} dia&apos;s. Presenteer hem schermvullend, of scrol erdoorheen.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="kp-knop" onClick={() => start(0)} style={{ background: '#C11733', color: '#FFFFFF', borderColor: '#C11733' }} data-meet="klusseniers-presenteer">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>Presenteer
          </button>
          <button type="button" className="kp-knop" onClick={kopieer} style={{ background: 'transparent', color: '#213C73' }}>
            {gekopieerd ? 'Link gekopieerd' : 'Kopieer de link'}
          </button>
        </div>
      </header>
      <p className="kp-draai" style={{ fontSize: 14, color: 'rgba(61,46,30,0.7)', margin: '0 0 16px' }}>Op je telefoon? Draai hem een kwartslag of tik op een dia om hem groot te zien.</p>

      <div ref={lijst} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {dias.map((d, i) => (
          <div key={d.id} id={`dia-${i + 1}`} onClick={() => start(i)}
            style={{ cursor: 'zoom-in', display: 'block', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 12, boxShadow: '0 1px 0 #E2D8C6, 0 10px 30px rgba(26,18,8,0.08)', background: '#fff', position: 'relative' }}>
            {breed > 0 && <Doek dia={d} schaal={s} />}
            <button type="button" onClick={e => { e.stopPropagation(); start(i) }} className="kp-knop" aria-label={`Dia ${i + 1} schermvullend tonen`}
              style={{ position: 'absolute', right: 10, bottom: 10, background: 'rgba(255,255,255,0.92)', color: '#213C73', padding: '8px 12px', fontSize: 13 }}>{i + 1}</button>
          </div>
        ))}
      </div>

      <div ref={scherm} hidden={nu === null} role="dialog" aria-modal="true" aria-label="Presentatie"
        onClick={e => { const x = e.clientX / window.innerWidth; naar(x < 0.3 ? -1 : 1) }}
        onTouchStart={e => { veeg.current = e.touches[0].clientX }}
        onTouchEnd={e => { if (veeg.current === null) return; const dx = e.changedTouches[0].clientX - veeg.current; veeg.current = null; if (Math.abs(dx) > 50) { e.preventDefault(); naar(dx < 0 ? 1 : -1) } }}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0E1A33', display: nu === null ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {nu !== null && (
          <div key={nu} style={{ width: B * sp, height: H * sp, overflow: 'hidden' }}>
            <Doek dia={dias[nu]} schaal={sp} />
          </div>
        )}
        {nu !== null && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', gap: 8, alignItems: 'center', font: "600 14px 'Plus Jakarta Sans',system-ui,sans-serif", color: '#D5DDEC', background: 'rgba(14,26,51,0.75)', padding: '6px 8px 6px 14px', borderRadius: 999 }}>
            <span aria-live="polite">{nu + 1} / {dias.length}</span>
            <button type="button" onClick={() => naar(-1)} aria-label="Vorige dia" style={{ all: 'unset', cursor: 'pointer', padding: '4px 8px' }}>←</button>
            <button type="button" onClick={() => naar(1)} aria-label="Volgende dia" style={{ all: 'unset', cursor: 'pointer', padding: '4px 8px' }}>→</button>
            <button type="button" onClick={stop} aria-label="Sluiten" style={{ all: 'unset', cursor: 'pointer', padding: '4px 8px' }}>Sluiten</button>
          </div>
        )}
      </div>
    </div>
  )
}
