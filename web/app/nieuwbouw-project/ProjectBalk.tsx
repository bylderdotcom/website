'use client'

import { useEffect, useState } from 'react'

// Vaste balk onderaan elke projectpagina (3-11-2026): de projectnaam en de stap waar het om draait,
// zodat die nooit meer dan een duim weg is. Verschijnt als je voorbij de kop bent gescrold, en gaat
// weg zodra het blok "Van sleutel tot ingericht huis" of de footer in beeld is (daar staan dezelfde
// knoppen al).

export default function ProjectBalk({ project, offerte, woning }: { project: string; offerte: string; woning: string }) {
  const [zichtbaar, setZichtbaar] = useState(false)
  useEffect(() => {
    const doelen = [document.getElementById('sleutel-kop')?.closest('section'), document.querySelector('footer')].filter(Boolean) as Element[]
    const inBeeld = new Set<Element>()
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
      es.forEach(e => (e.isIntersecting ? inBeeld.add(e.target) : inBeeld.delete(e.target)))
      kijk()
    }) : null
    doelen.forEach(d => io?.observe(d))
    function kijk() { setZichtbaar(window.scrollY > 520 && inBeeld.size === 0) }
    window.addEventListener('scroll', kijk, { passive: true })
    kijk()
    return () => { io?.disconnect(); window.removeEventListener('scroll', kijk) }
  }, [])
  const meet = (plek: string) => { try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'afwerk_klik', { plek, pagina: location.pathname }) } catch { /* geen GA */ } }
  return (
    <div aria-hidden={!zichtbaar} style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: 'rgba(255,253,249,.97)',
      borderTop: '1px solid rgba(61,46,30,.14)', boxShadow: '0 -6px 18px -12px rgba(26,18,8,.35)',
      transform: zichtbaar ? 'none' : 'translateY(110%)', transition: 'transform .25s',
      padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.35, color: '#1A1208' }}>
          <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project}</strong>
          <span style={{ color: 'rgba(61,46,30,.64)' }}>Van sleutel tot ingericht huis</span>
        </p>
        <a href={woning} className="pb-3d" onClick={() => meet('project-balk-3d')} tabIndex={zichtbaar ? 0 : -1}
          style={{ flexShrink: 0, border: '1.5px solid #3D5A3E', color: '#3D5A3E', fontWeight: 700, fontSize: 14, padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>Je woning in 3D</a>
        <a href={offerte} onClick={() => meet('project-balk')} tabIndex={zichtbaar ? 0 : -1}
          style={{ flexShrink: 0, background: '#3D5A3E', color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '11px 16px', borderRadius: 10, textDecoration: 'none' }}>Vraag een offerte aan</a>
      </div>
      <style>{'@media(max-width:560px){.pb-3d{display:none}}'}</style>
    </div>
  )
}
