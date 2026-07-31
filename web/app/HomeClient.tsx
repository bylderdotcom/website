'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { HOME_HTML_TOP, HOME_HTML_MID, HOME_HTML_BOTTOM, HOME_STYLE } from './homeHtml'
import HomeServices from './HomeServices'

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

    // ── levende blauwdruk: woning tekent zichzelf + goedkeur-demo (#probeer) ──
    const houseSvg = document.querySelector<SVGSVGElement>('.house-svg')
    const demoCards = Array.from(document.querySelectorAll<HTMLElement>('#probeer .card'))
    const donePanel = document.getElementById('donePanel')
    if (houseSvg && demoCards.length) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      houseSvg.querySelectorAll<SVGGeometryElement>('.iso-draw').forEach((el, i) => {
        if (reduce) return
        let len = 0
        try { len = el.getTotalLength() } catch { len = 0 }
        if (!len) return
        el.style.strokeDasharray = String(len)
        el.style.strokeDashoffset = String(len)
        requestAnimationFrame(() => { requestAnimationFrame(() => {
          el.style.transition = 'stroke-dashoffset 1.1s ease ' + (i * 0.09) + 's'
          el.style.strokeDashoffset = '0'
        }) })
      })
      houseSvg.querySelectorAll('.pin').forEach((p, i) => {
        if (reduce) { p.classList.add('show'); return }
        timers.push(setTimeout(() => p.classList.add('show'), 1400 + i * 220))
      })

      const decided: Record<number, boolean> = {}
      let decidedCount = 0
      let demoInteracted = false
      let autoplayTimer: ReturnType<typeof setTimeout> | null = null
      let autoplayStarted = false
      const ghostFor = (i: number) => houseSvg.querySelector('.ghost-' + i)
      const pinFor = (i: number) => houseSvg.querySelector('.pin-' + i)
      const cardFor = (i: number) => demoCards.find(c => +(c.dataset.index || 0) === i)
      const checkAll = () => { if (decidedCount === demoCards.length && donePanel) donePanel.hidden = false }
      const approveDemo = (i: number) => {
        if (decided[i]) return
        decided[i] = true; decidedCount++
        const card = cardFor(i); if (!card) return
        card.classList.add('approved')
        card.querySelectorAll('button').forEach(b => { b.disabled = true })
        const g = ghostFor(i); if (g) g.classList.add('solid')
        const p = pinFor(i); if (p) p.classList.add('done')
        checkAll()
      }
      const rejectDemo = (i: number) => {
        if (decided[i]) return
        decided[i] = true; decidedCount++
        const card = cardFor(i); if (!card) return
        card.classList.add('rejected')
        card.querySelectorAll('button').forEach(b => { b.disabled = true })
        const p = pinFor(i); if (p) p.classList.add('gone')
        checkAll()
      }
      const cancelAutoplay = () => {
        demoInteracted = true
        if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null }
      }
      demoCards.forEach(card => {
        const i = +(card.dataset.index || 0)
        card.querySelector('.approve')?.addEventListener('click', () => { cancelAutoplay(); approveDemo(i) })
        card.querySelector('.reject')?.addEventListener('click', () => { cancelAutoplay(); rejectDemo(i) })
      })

      // Bekijk opties (dakkapel): varianten live op de woning
      const card1 = cardFor(1)
      const vPanel = card1 ? card1.querySelector<HTMLElement>('.variants') : null
      if (card1 && vPanel) {
        const vTitel = card1.querySelector('h3') as HTMLElement
        const vPrijs = card1.querySelector('.price') as HTMLElement
        const VAR: Record<string, { titel: string; prijs: string }> = {
          a: { titel: 'Dakkapel in hout — 3 bedrijven vergeleken', prijs: 'vanaf €6.200' },
          b: { titel: 'Dakkapel in kunststof — 3 bedrijven vergeleken', prijs: 'vanaf €5.400' },
        }
        const toonVariant = (v: string) => {
          const ga = houseSvg.querySelector<SVGGElement>('.g1v-a')
          const gb = houseSvg.querySelector<SVGGElement>('.g1v-b')
          if (ga) ga.style.display = v === 'a' ? '' : 'none'
          if (gb) gb.style.display = v === 'b' ? '' : 'none'
          vPanel.querySelectorAll<HTMLElement>('.variant').forEach(r => r.classList.toggle('selected', r.dataset.variant === v))
          vTitel.textContent = VAR[v].titel
          vPrijs.textContent = VAR[v].prijs
        }
        card1.querySelector('.inspect')?.addEventListener('click', () => { cancelAutoplay(); vPanel.hidden = !vPanel.hidden })
        vPanel.querySelectorAll<HTMLElement>('.variant').forEach(row => {
          row.addEventListener('click', () => { cancelAutoplay(); toonVariant(row.dataset.variant || 'a') })
          row.querySelector('.choose')?.addEventListener('click', (e) => {
            e.stopPropagation()
            cancelAutoplay()
            toonVariant(row.dataset.variant || 'a')
            vPanel.hidden = true
            approveDemo(1)
          })
        })
      }

      // autoplay: pas wanneer de kaarten in beeld zijn, en nooit na interactie
      const startAutoplay = () => {
        if (demoInteracted || autoplayStarted) return
        autoplayStarted = true
        const volgende = () => {
          if (demoInteracted) return
          const open = [1, 2, 3].find(i => !decided[i])
          if (open == null) return
          approveDemo(open)
          autoplayTimer = setTimeout(volgende, 2500)
          timers.push(autoplayTimer)
        }
        autoplayTimer = setTimeout(volgende, 800)
        timers.push(autoplayTimer)
      }
      const cardsWrap = document.querySelector('#probeer .cards')
      if ('IntersectionObserver' in window && cardsWrap) {
        const io = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            io.disconnect()
            timers.push(setTimeout(() => { if (!demoInteracted) startAutoplay() }, 4000))
          }
        }, { threshold: 0.4 })
        io.observe(cardsWrap)
      }
      ;['pointerdown', 'keydown', 'touchstart'].forEach(evt =>
        document.addEventListener(evt, () => { demoInteracted = true }, { passive: true, once: true }))
    }

    // ── woningtype-toggle (index.html @DOMContentLoaded) ──
    const wtBtns = Array.from(document.querySelectorAll<HTMLElement>('#wt-toggle .wt-btn'))
    const wtGrids = Array.from(document.querySelectorAll<HTMLElement>('.wt-grid'))
    const selWt = (wname: string) => {
      wtBtns.forEach(x => {
        const on = x.dataset.wt === wname
        x.style.background = on ? '#3D5A3E' : 'transparent'
        x.style.color = on ? '#F5F0E8' : 'rgba(61,46,30,0.72)'
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
      'Meerwerklijst gecheckt: 3 posten te duur — keur de besparing goed.',
      'Dakkapel: 3 vakbedrijven vergeleken — keur je favoriet goed.',
      'Eiken vloer met 10% voucher gevonden — keur goed en klaar.',
      'Vergunning uitgezocht: niet nodig — al afgevinkt.',
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
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_TOP }} />
      <HomeServices />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_MID }} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM }} />

      {/* Zelfstandig popup-script uit de bron; no-op op de homepage (detecteert #aupingPopup) */}
      <Script src="/auping-popup.js" strategy="afterInteractive" />
    </>
  )
}
