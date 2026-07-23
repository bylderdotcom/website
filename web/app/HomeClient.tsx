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

    // ── goedkeur-demo (#probeer): 3 voorstel-kaarten, jij keurt goed ──
    const pdStappen = [
      { chip: 'Vakbedrijf', titel: 'Dakkapel plaatsen — 3 bedrijven vergeleken', waarom: 'Bouwgroep Deltij staat bovenaan: 4,8★, 6 km bij je vandaan, kan in september.', prijs: 'vanaf €6.200', garantie: '10 jaar garantie', fair: 'Volgorde puur op geschiktheid — elk bedrijf betaalt ons hetzelfde.',
        variant: { titel: 'Dakkapel in kunststof — zelfde 3 bedrijven', waarom: 'Kunststof scheelt €800 en is onderhoudsarm. Plaatsing kan in oktober.', prijs: 'vanaf €5.400' },
        na: 'De dakkapel staat klaar. Dan je meerwerklijst — daar zag ik iets.' },
      { chip: 'Meerwerk', titel: 'Vloerverwarming: via de bouwer doen', waarom: 'Moet vóór de dekvloer — achteraf is het 3× duurder. De prijs van je bouwer is marktconform.', prijs: '€3.400', garantie: 'in de bouwgarantie', fair: 'Gecheckt tegen echte marktprijzen uit offertes van bewoners.',
        variant: { titel: 'Vloerverwarming: alleen begane grond', waarom: 'Scheelt €1.450; de zolder kan later nog via een eigen installateur.', prijs: '€1.950' },
        na: 'Slim geregeld. Nog één: de vloer voor je woonkamer.' },
      { chip: 'Product', titel: 'Eiken vloer voor de woonkamer', waarom: 'Past bij je stijl. Met je Bylder-voucher krijg je 10% korting bij Parketgigant.', prijs: '€1.536 na korting', garantie: '25 jaar garantie', fair: 'Aanbeveling op geschiktheid — elk merk betaalt ons hetzelfde.',
        variant: { titel: 'Donker geolied eiken — zelfde leverancier', waarom: 'Donkerder, zelfde prijsklasse, ook met 10% voucher.', prijs: '€1.590 na korting' },
        na: '' },
    ]
    let pdI = 0, pdBezig = false
    const pdEl = (id: string) => document.getElementById(id)
    const pdToon = (st: typeof pdStappen[0], metVariant: boolean) => {
      const set = (id: string, txt: string) => { const e = pdEl(id); if (e) e.textContent = txt }
      set('pd-chip', st.chip)
      set('pd-titel', metVariant && st.variant ? st.variant.titel : st.titel)
      set('pd-waarom', metVariant && st.variant ? st.variant.waarom : st.waarom)
      set('pd-prijs', metVariant && st.variant ? st.variant.prijs : st.prijs)
      set('pd-garantie', st.garantie)
      set('pd-fair', st.fair)
      set('pd-teller', 'Voorstel ' + (pdI + 1) + ' van ' + pdStappen.length)
      const a = pdEl('pd-acties'); if (a) a.style.display = 'flex'
      const st2 = pdEl('pd-status'); if (st2) st2.style.display = 'none'
    }
    const pdVolgende = (statusTekst: string) => {
      if (pdBezig) return
      pdBezig = true
      const a = pdEl('pd-acties'); if (a) a.style.display = 'none'
      const stt = pdEl('pd-status-tekst'); if (stt) stt.textContent = statusTekst
      const st2 = pdEl('pd-status'); if (st2) st2.style.display = 'flex'
      const prog = pdEl('pd-prog'); if (prog) prog.style.width = Math.round(((pdI + 1) / pdStappen.length) * 100) + '%'
      const na = pdStappen[pdI].na
      timers.push(setTimeout(() => {
        pdI++
        if (pdI >= pdStappen.length) {
          const k = pdEl('pd-kaart'); if (k) k.style.display = 'none'
          const t = pdEl('pd-teller'); if (t) t.textContent = 'Alles geregeld'
          const kl = pdEl('pd-klaar'); if (kl) kl.style.display = 'block'
          const m = pdEl('pd-msg'); if (m) m.textContent = 'Dat was alles. In je echte woningdossier houd ik dit bij van koopakte tot laatste lamp.'
        } else {
          if (na) { const m = pdEl('pd-msg'); if (m) m.textContent = na }
          const k = pdEl('pd-kaart'); if (k) k.style.opacity = '0'
          timers.push(setTimeout(() => { pdToon(pdStappen[pdI], false); if (k) k.style.opacity = '1'; pdBezig = false }, 200))
        }
      }, 900))
    }
    w.pdGoed = () => pdVolgende('Geregeld — Bylder gaat ermee aan de slag')
    w.pdWeg = () => pdVolgende('Weg — Bylder zoekt een alternatief')
    w.pdVariant = () => {
      if (pdBezig) return
      pdToon(pdStappen[pdI], true)
      const m = pdEl('pd-msg'); if (m) m.textContent = 'Aangepast. Beter zo? Keur goed, of pas nog eens aan.'
    }

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
