'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { FILM_FASEN } from '../held/fasen'

// De film van de homepage (WoningFilm) in het blok "Van sleutel tot ingericht huis" op elke
// projectpagina (Daniel, 29-10-2026). Het blok zelf is HTML in het fragment van de pagina; daarin
// staat een plek (#sleutel-film) met een stilstaand beeld van de voorbeeldwoning. Pas als die plek
// in beeld komt laadt three.js en speelt de film eroverheen, zodat de pagina zelf even snel blijft.
// Zonder WebGL, of als het tekenen faalt, blijft het stilstaande beeld staan.

const WoningFilm = dynamic(() => import('../held/WoningFilm'), { ssr: false })

export default function ProjectFilm() {
  const [plek, setPlek] = useState<HTMLElement | null>(null)
  const [aan, setAan] = useState(false)
  const [stap, setStap] = useState(0)
  const [naar, setNaar] = useState({ fase: 0, n: 0 })

  useEffect(() => {
    const el = document.getElementById('sleutel-film')
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPlek(el); io.disconnect() }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!plek) return null
  return createPortal(
    <div style={{ position: 'absolute', inset: 0, background: aan ? '#FFFDF9' : 'transparent', transition: 'background .3s' }}>
      {/* Dezelfde regel als in de stijl van de homepage (held/stijl.ts), die hier niet geladen is. */}
      <style>{'.wf-doek{position:absolute;inset:0}.wf-doek canvas{display:block;width:100%!important;height:100%!important}'
        // Op een telefoon alleen de stap die in beeld is; de rij knoppen dekt daar de film af.
        + '@media(max-width:600px){.pf-stap:not([aria-pressed=true]){display:none}}'}</style>
      <div style={{ position: 'absolute', inset: 0 }}>
        <WoningFilm opFase={(f) => { setAan(true); setStap(f) }} naar={naar} opGeenWebgl={() => setPlek(null)} />
      </div>
      {aan && (
        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FILM_FASEN.map((f, i) => (
            <button key={f} className="pf-stap" type="button" onClick={() => setNaar((n) => ({ fase: i, n: n.n + 1 }))} aria-pressed={i === stap}
              style={{ font: "700 11px 'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 9px', borderRadius: 999, cursor: 'pointer',
                border: '1px solid rgba(61,90,62,0.35)', background: i === stap ? '#3D5A3E' : 'rgba(255,253,249,0.9)', color: i === stap ? '#F5F0E8' : '#3D5A3E' }}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>,
    plek,
  )
}
