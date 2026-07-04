'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { HOME_HTML, HOME_STYLE } from './homeHtml'

// Getrouwe port van de homepage-body. De secties + overlays worden byte-getrouw
// via dangerouslySetInnerHTML gerenderd (behoudt exact alle markup, ids, Tailwind-
// classes en inline `onclick=/oninput=`-attributen). De inline <script>-blokken uit
// de bron zijn hier als één useEffect herbedraad: globale functies (selectChoice,
// hpCalc, sluitPopup, claimVoucher) op window + init (woningtype-toggle, typewriter,
// auping-popup). Tailwind draait via de Play-CDN met de merk-kleur-config, net als
// in de bron. Nav + Footer komen uit de gedeelde layout.

// Tailwind Play-CDN config (merk-kleuren + fonts), 1-op-1 uit index.html.
const TW_CONFIG = {
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8', 'cream-2': '#EDE6D8', 'cream-3': '#E4DBC8',
        sand: '#C8B89A', 'sand-dark': '#9A866A',
        bark: '#3D2E1E', 'bark-2': '#5C4433', 'bark-3': '#8A7060',
        moss: '#3D5A3E', 'moss-light': '#4E7350', 'moss-bg': '#EBF0E8',
        rust: '#B85C38', 'rust-bg': '#F5EBE5', charcoal: '#1A1208',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
}

export default function HomeClient() {
  useEffect(() => {
    const w = window as any
    const timers: ReturnType<typeof setTimeout>[] = []

    // ── globale functies die de inline onclick/oninput-attributen aanroepen ──
    w.selectChoice = function (btn: HTMLElement) {
      document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('active-choice'))
      btn.classList.add('active-choice')
      document.getElementById('scan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    w.claimVoucher = function () { window.location.href = 'https://app.bylder.com' }
    w.claimVoucherRust = function () { window.location.href = 'https://app.bylder.com' }
    w.hpCalc = function (val: string) {
      const n = parseFloat(val) || 0
      const depot = Math.round(n * 0.05)
      const meerwerk = Math.round(n * 0.14)
      const totaal = n + meerwerk
      const fmt = (v: number) => '€ ' + Math.round(v).toLocaleString('nl-NL')
      const set = (id: string, txt: string) => { const el = document.getElementById(id); if (el) el.textContent = txt }
      set('hpDepot', n ? fmt(depot) : '€ —')
      set('hpMeerwerk', n ? fmt(meerwerk) : '€ —')
      set('hpTotaal', n ? fmt(totaal) : '€ —')
      const wrap = document.getElementById('hpTotaalWrap'); if (wrap) wrap.style.display = n ? 'block' : 'none'
    }
    w.sluitPopup = function () { const p = document.getElementById('aupingPopup'); if (p) p.style.display = 'none' }

    // ── woningtype-toggle (index.html @DOMContentLoaded) ──
    const wtBtns = Array.from(document.querySelectorAll<HTMLElement>('#wt-toggle .wt-btn'))
    const wtGrids = Array.from(document.querySelectorAll<HTMLElement>('.wt-grid'))
    const selWt = (wname: string) => {
      wtBtns.forEach(x => {
        const on = x.dataset.wt === wname
        x.style.background = on ? '#3D5A3E' : 'transparent'
        x.style.color = on ? '#F5F0E8' : 'rgba(61,46,30,.6)'
      })
      wtGrids.forEach(x => { x.style.display = x.dataset.wt === wname ? 'grid' : 'none' })
    }
    const wtHandlers: Array<[HTMLElement, () => void]> = []
    wtBtns.forEach(x => {
      const h = () => selWt(x.dataset.wt as string)
      x.addEventListener('click', h)
      wtHandlers.push([x, h])
    })

    // ── typewriter (index.html) ──
    const phrases = [
      'Slimme AI-begeleiding bij elke stap.',
      'Gemiddeld €4.200 bespaard per project.',
      'Gecertificeerde aannemers in jouw regio.',
      'Vouchers automatisch gekoppeld aan jouw plan.',
    ]
    let pi = 0, ci = 0, del = false
    const type = () => {
      const el = document.getElementById('typewriter')
      if (!el) return
      const cur = phrases[pi]
      if (!del) {
        el.textContent = cur.slice(0, ++ci)
        if (ci === cur.length) { del = true; timers.push(setTimeout(type, 2200)); return }
      } else {
        el.textContent = cur.slice(0, --ci)
        if (ci === 0) { del = false; pi = (pi + 1) % phrases.length }
      }
      timers.push(setTimeout(type, del ? 30 : 55))
    }
    timers.push(setTimeout(type, 1200))

    // ── auping-popup (index.html inline) ──
    if (!localStorage.getItem('aupingPopupDismissed')) {
      timers.push(setTimeout(() => { const p = document.getElementById('aupingPopup'); if (p) p.style.display = 'flex' }, 4000))
    }
    const pop = document.getElementById('aupingPopup')
    const onPopClick = function (this: HTMLElement, e: MouseEvent) { if (e.target === this) w.sluitPopup() }
    if (pop) pop.addEventListener('click', onPopClick as EventListener)
    const inner = document.getElementById('aupingPopupInner')
    let startY = 0
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY }
    const onTouchEnd = (e: TouchEvent) => { if (e.changedTouches[0].clientY - startY > 60) w.sluitPopup() }
    if (inner) {
      inner.addEventListener('touchstart', onTouchStart, { passive: true })
      inner.addEventListener('touchend', onTouchEnd, { passive: true })
    }

    return () => {
      timers.forEach(clearTimeout)
      wtHandlers.forEach(([el, h]) => el.removeEventListener('click', h))
      if (pop) pop.removeEventListener('click', onPopClick as EventListener)
      if (inner) { inner.removeEventListener('touchstart', onTouchStart); inner.removeEventListener('touchend', onTouchEnd) }
    }
  }, [])

  return (
    <>
      {/* icon-fonts zoals in de bron (React 19 hoist stylesheet-links naar <head>) */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />

      {/* Tailwind Play-CDN + merk-config (config zetten ná load triggert reprocess) */}
      <Script
        id="tailwind-cdn"
        src="https://cdn.tailwindcss.com"
        strategy="afterInteractive"
        onLoad={() => { (window as any).tailwind.config = TW_CONFIG }}
      />

      <style dangerouslySetInnerHTML={{ __html: HOME_STYLE }} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML }} />

      {/* Zelfstandig popup-script uit de bron; no-op op de homepage (detecteert #aupingPopup) */}
      <Script src="/auping-popup.js" strategy="afterInteractive" />
    </>
  )
}
