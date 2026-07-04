'use client'

import { useState, useEffect } from 'react'

// Getrouwe port van /functies/index.html (Fase 1B).
// De woningtype-toggle (nieuwbouw/bestaand/renovatie) + #hash-preselectie is
// interactief → hele inhoud als client-component. Metadata staat in page.tsx.
// Nav + Footer komen uit de gedeelde layout; de pagina-eigen mini-footer
// (© · Prijzen · Vouchers · Showroomsale) wordt door de gedeelde Footer vervangen.

type WT = 'nieuwbouw' | 'bestaand' | 'renovatie'

const CSS = `
.fn-root{--cream:#F5F0E8;--bark:#1A1208;--bark-2:#3D2E1E;--bark-3:rgba(61,46,30,.5);--moss:#3D5A3E;--moss-2:#4E7350;--rust:#B85C38;background:var(--cream);color:var(--bark-2);line-height:1.65}
.fn-root *,.fn-root *::before,.fn-root *::after{box-sizing:border-box}
.fn-root .container{max-width:1280px;margin:0 auto;padding:0 48px}
.fn-root a{color:var(--moss)}
.fn-root .btn{background:#3D5A3E;color:#F5F0E8;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.fn-root .btn:hover{background:#4E7350}
.fn-root .btn-ghost{background:#fff;color:var(--bark);border:1.5px solid rgba(61,46,30,.14)}
.fn-root .hero{padding:56px 0 30px;text-align:center}
.fn-root .hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;color:var(--bark);letter-spacing:-.03em;line-height:1.1}
.fn-root .hero h1 .it{color:var(--moss);font-style:italic;font-weight:300}
.fn-root .hero p{font-size:16px;color:var(--bark-3);max-width:620px;margin:16px auto 0;line-height:1.6}
.fn-root .wt-toggle{display:flex;justify-content:center;margin:28px 0 8px}
.fn-root .wt-toggle .wrap{display:inline-flex;background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:999px;padding:4px;gap:4px;flex-wrap:wrap;justify-content:center}
.fn-root .wt-btn{border:none;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;padding:9px 18px;border-radius:999px;background:transparent;color:rgba(61,46,30,.6);transition:all .2s}
.fn-root .wt-btn.on{background:#3D5A3E;color:#F5F0E8}
.fn-root .section{padding:24px 0 40px}
.fn-root .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:900px){.fn-root .grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.fn-root .grid{grid-template-columns:1fr}}
.fn-root .card{background:#fff;border:1px solid rgba(61,46,30,.08);border-radius:16px;padding:24px}
.fn-root .card .ico{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px;background:rgba(61,90,62,.1)}
.fn-root .card .ico.r{background:rgba(184,92,56,.1)}
.fn-root .card .h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.fn-root .card h3{font-size:1.05rem;font-weight:800;color:var(--bark)}
.fn-root .tag{font-size:10px;font-weight:700;font-family:'Space Mono',monospace;letter-spacing:.04em;padding:2px 8px;border-radius:999px;white-space:nowrap}
.fn-root .tag.free{background:rgba(61,90,62,.12);color:#3D5A3E}
.fn-root .tag.lid{background:rgba(184,92,56,.12);color:#B85C38}
.fn-root .tag.soon{background:rgba(61,46,30,.08);color:rgba(61,46,30,.5)}
.fn-root .card p{font-size:13.5px;color:var(--bark-3);line-height:1.6}
.fn-root .cta{text-align:center;padding:20px 0 80px}
.fn-root .cta .row{display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center}
.fn-root .cta p{font-size:13px;color:var(--bark-3);margin-top:12px}
@media(max-width:860px){.fn-root .container{padding:0 20px}}
`

const inlineLink: React.CSSProperties = { color: '#3D5A3E', fontWeight: 700, textDecoration: 'none' }

function Card({ icoR, icon, title, tag, children }: { icoR?: boolean; icon: string; title: React.ReactNode; tag: { cls: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className={icoR ? 'ico r' : 'ico'}><i className={icon}></i></div>
      <div className="h"><h3>{title}</h3><span className={'tag ' + tag.cls}>{tag.label}</span></div>
      <p>{children}</p>
    </div>
  )
}

const FREE_PROBEREN = { cls: 'free', label: 'GRATIS TE PROBEREN' }
const FREE_STARTEN = { cls: 'free', label: 'GRATIS starten' }
const FREE = { cls: 'free', label: 'GRATIS' }
const LID = { cls: 'lid', label: 'LID €99' }
const SOON = { cls: 'soon', label: 'BINNENKORT' }

const InrichtenBody = ({ mid }: { mid: React.ReactNode }) => (
  <>Pas je meubels, kasten en keuken <strong>op schaal</strong> in op je plattegrond — zo zie je meteen wat past (gratis). {mid} <a href="/plattegrond-inrichten/" style={inlineLink}>Meer over inrichten →</a></>
)
const BouwvergunningBody = () => (
  <>Check <strong>gratis</strong> of je een vergunning nodig hebt, en bereid met lidmaatschap je aanvraag voor: documenten-checklist + begeleide intake → concept-dossier, voorgevuld met de maten uit je tekening. <a href="/bouwvergunning/" style={inlineLink}>Meer over bouwvergunningen →</a></>
)

export default function FunctiesClient() {
  const [wt, setWt] = useState<WT>('nieuwbouw')

  useEffect(() => {
    // Voorselecteren op basis van #hash (bv. /functies/#renovatie vanaf de homepage-tegels).
    const h = (location.hash || '').replace('#', '')
    if (h === 'nieuwbouw' || h === 'bestaand' || h === 'renovatie') setWt(h)
  }, [])

  const grid = (w: WT): React.CSSProperties => ({ display: wt === w ? 'grid' : 'none' })
  const desc = (w: WT): React.CSSProperties => ({ display: wt === w ? 'block' : 'none', maxWidth: 620, margin: '16px auto 0', fontSize: 14, color: 'var(--bark-3)', lineHeight: 1.6 })

  return (
    <div className="fn-root">
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="hero"><div className="container">
        <h1>Alle functies,<br /><span className="it">per woningtype</span></h1>
        <p>Bylder begeleidt je door je hele kopersreis. Hieronder zie je per woningtype welke functies je helpen — en wat <strong>gratis</strong> is versus <strong>met lidmaatschap</strong>.</p>
        <div className="wt-toggle"><div className="wrap">
          <button type="button" className={wt === 'nieuwbouw' ? 'wt-btn on' : 'wt-btn'} onClick={() => setWt('nieuwbouw')}><i className="ph-thin ph-buildings"></i> Nieuwbouw</button>
          <button type="button" className={wt === 'bestaand' ? 'wt-btn on' : 'wt-btn'} onClick={() => setWt('bestaand')}><i className="ph-thin ph-house"></i> Bestaande bouw</button>
          <button type="button" className={wt === 'renovatie' ? 'wt-btn on' : 'wt-btn'} onClick={() => setWt('renovatie')}><i className="ph-thin ph-hammer"></i> Renovatie</button>
        </div></div>
        <div className="wt-desc" style={desc('nieuwbouw')}>Je koopt een <strong>nieuw te bouwen woning</strong> — van tekening tot oplevering. Denk aan meerwerk, kopersopties en de bouwfasen.</div>
        <div className="wt-desc" style={desc('bestaand')}>Je koopt een <strong>al bestaande, bewoonbare woning</strong> die je niet (meteen) ingrijpend gaat verbouwen. Denk aan bezichtiging, een eerlijk bod, financiering en de overdracht.</div>
        <div className="wt-desc" style={desc('renovatie')}>Je gaat een woning <strong>(ver)bouwen of renoveren</strong> — denk aan verbouwplan, vergunning, budget en aannemer. <span style={{ color: 'var(--moss)', fontWeight: 600 }}>Kies dit ook als je een bestaande woning koopt om er meteen flink in te verbouwen.</span></div>
      </div></section>

      <section className="section"><div className="container">

        {/* NIEUWBOUW */}
        <div className="grid wt-grid" style={grid('nieuwbouw')}>
          <Card icon="ph-thin ph-robot" title="AI-Kopersbegeleider" tag={FREE_PROBEREN}>Stel je vraag of laat je offerte checken: direct inzicht in marktprijzen, risico's, meerwerk en faseadvies. 5 berichten gratis, onbeperkt met lidmaatschap.</Card>
          <Card icoR icon="ph-thin ph-magnifying-glass" title={<>Woning- &amp; offerte-analyse</>} tag={FREE_PROBEREN}>Upload je plattegrond of offerte → AI berekent oppervlakte en kosten per ruimte. Verandert je tekening door meerwerk? Upload elke versie — Bylder bewaart ze en laat per ronde zien <strong>wat er wijzigt</strong> (extra stopcontacten, lichtpunten, m²). 1 analyse gratis, onbeperkt met lidmaatschap.</Card>
          <Card icon="ph-thin ph-stack" title="Meerwerk-tracker" tag={LID}>Meerwerk verandert je technische tekening — soms wel 4 rondes. De tracker bewaart elke versie en toont per ronde precies <strong>wat er wijzigt</strong> (extra stopcontacten, lichtpunten, m²). Zo houd je grip op je keuzes én je budget, en controleer je of je krijgt waarvoor je betaalt. <a href="/meerwerk/" style={inlineLink}>Meer over meerwerk →</a></Card>
          <Card icon="ph-thin ph-cube" title={<>Inrichten &amp; 3D-impressie</>} tag={FREE_STARTEN}><InrichtenBody mid={<>Upload je bouwtekening → Bylder maakt er een 3D-impressie van in jouw stijl (Scandinavisch, Japandi, industrieel…). Zie je afgewerkte woning vóór je keuzes maakt.</>} /></Card>
          <Card icon="ph-thin ph-clipboard-text" title="Bouwvergunning-hulp" tag={LID}><BouwvergunningBody /></Card>
          <Card icoR icon="ph-thin ph-tag" title="Kortingsvouchers" tag={LID}>Exclusieve kortingen bij 61 woonmerken zoals Auping, Goossens en DRT. Gemiddeld €4.200 besparing — codes actief met lidmaatschap.</Card>
          <Card icon="ph-thin ph-calendar-blank" title={<>Planning, budget &amp; kosten</>} tag={FREE}>Projectplanning over alle 11 fasen, opleverdatum-countdown, all-in kostenoverzicht en de 36-punts opleverchecklist — gratis te gebruiken.</Card>
          <Card icoR icon="ph-thin ph-folders" title="AI document-kluis" tag={LID}>Bewaar offertes &amp; contracten; de AI checkt ze op te dure posten, risico-clausules en garantie-registratie.</Card>
          <Card icon="ph-thin ph-shield-check" title={<>Garantie &amp; oplevergebreken</>} tag={LID}>Houd garanties bij én log bouwgebreken na oplevering — van melding tot erkenning tot afhandeling. Mis nooit een garantietermijn.</Card>
        </div>

        {/* BESTAANDE BOUW */}
        <div className="grid wt-grid" style={grid('bestaand')}>
          <Card icon="ph-thin ph-robot" title="AI-Kopersbegeleider" tag={FREE_PROBEREN}>Vragen over de aankoop, een eerlijk bod en de kosten van een bestaande woning — direct antwoord. 5 berichten gratis, onbeperkt met lidmaatschap.</Card>
          <Card icoR icon="ph-thin ph-magnifying-glass" title="Bouwkundige-keuring-analyse" tag={FREE_PROBEREN}>Upload je keuringsrapport → de AI groepeert gebreken op urgentie, schat herstelkosten en je onderhandelingsruimte op de koopprijs.</Card>
          <Card icon="ph-thin ph-cube" title={<>Inrichten &amp; 3D-impressie</>} tag={FREE_STARTEN}><InrichtenBody mid={<>Upload de plattegrond → een 3D-impressie van je heringerichte woning in jouw stijl (Scandinavisch, Japandi, industrieel…). Zie het resultaat vóór je begint.</>} /></Card>
          <Card icon="ph-thin ph-clipboard-text" title="Bouwvergunning-hulp" tag={LID}><BouwvergunningBody /></Card>
          <Card icon="ph-thin ph-handshake" title={<>Bod- &amp; overdracht-begeleiding</>} tag={FREE_PROBEREN}>AI-bodadvies om je bod te bepalen (met lidmaatschap) + een gratis overdracht- &amp; intrek-checklist, van notaris tot meterstanden.</Card>
          <Card icoR icon="ph-thin ph-tag" title="Kortingsvouchers" tag={LID}>Exclusieve kortingen bij 61 woonmerken voor je inrichting en verbouwing. Gemiddeld €4.200 besparing.</Card>
          <Card icoR icon="ph-thin ph-folders" title="AI document-kluis" tag={LID}>Bewaar koopakte, keuringsrapport en offertes; de AI checkt ze op risico's, te dure posten en garantie.</Card>
          <Card icon="ph-thin ph-shield-check" title={<>Garantie &amp; oplevergebreken</>} tag={LID}>Houd garanties bij én log bouwgebreken na oplevering — van melding tot erkenning tot afhandeling. Mis nooit een garantietermijn.</Card>
        </div>

        {/* RENOVATIE */}
        <div className="grid wt-grid" style={grid('renovatie')}>
          <Card icon="ph-thin ph-robot" title="AI-verbouwbegeleider" tag={FREE_PROBEREN}>Stel je vragen over je verbouwing, offertes en meerwerk — direct inzicht in marktprijzen en wat je via de aannemer of achteraf doet.</Card>
          <Card icoR icon="ph-thin ph-magnifying-glass" title={<>Offerte- &amp; kostenanalyse</>} tag={FREE_PROBEREN}>Upload je verbouwofferte → AI vergelijkt met marktprijzen en geeft aan waar je kunt onderhandelen.</Card>
          <Card icon="ph-thin ph-cube" title={<>Inrichten &amp; 3D-impressie</>} tag={FREE_STARTEN}><InrichtenBody mid={<>Upload je (verbouw)tekening → een 3D-impressie van het eindresultaat in jouw stijl (Scandinavisch, Japandi, industrieel…). Zie hoe je woning wordt vóór de verbouwing.</>} /></Card>
          <Card icon="ph-thin ph-clipboard-text" title="Bouwvergunning-hulp" tag={LID}><BouwvergunningBody /></Card>
          <Card icoR icon="ph-thin ph-tag" title="Kortingsvouchers" tag={LID}>Exclusieve kortingen bij 61 woonmerken voor je verbouwing en inrichting. Gemiddeld €4.200 besparing.</Card>
          <Card icon="ph-thin ph-chart-bar" title={<>Verbouwbudget &amp; tracker</>} tag={FREE}>Houd je verbouwbudget bij, upload facturen en verdien Bylder Points. Budget calculator inbegrepen.</Card>
          <Card icoR icon="ph-thin ph-folders" title="AI document-kluis" tag={LID}>Bewaar offertes &amp; contracten; de AI checkt ze op te dure posten, risico's en garantie-registratie.</Card>
          <Card icon="ph-thin ph-toolbox" title={<>Verbouwplanning &amp; aannemer-matching</>} tag={SOON}>Planning van je verbouwing en matching met gecertificeerde aannemers op project, budget en locatie.</Card>
        </div>

      </div></section>

      <section className="cta"><div className="container">
        <div className="row">
          <a href="https://app.bylder.com/registreer" className="btn">Start gratis →</a>
          <a href="/prijzen/" className="btn btn-ghost">Bekijk de prijzen</a>
        </div>
        <p>Start gratis · onbeperkt vanaf €99 eenmalig · geen abonnement</p>
      </div></section>
    </div>
  )
}
