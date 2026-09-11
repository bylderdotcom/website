import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'

/**
 * /kopen/vloeren/ — de vloerenhub, opnieuw opgebouwd.
 *
 * WAT ER MIS WAS
 * De oude hub was een rij van elf kaarten met elk dezelfde knop ("Alle 288
 * gemeenten"), een titel die in Google "Vloerkleed kopen" heette, prijzen die
 * onze eigen kennisbank tegenspraken (gietvloer "vanaf €45" tegenover €80–150),
 * en een vraag-en-antwoordblok dat alleen in de code stond — met "40+
 * partnermerken" en "288 gemeenten", allebei onjuist. Wat er níét stond: de
 * enige reden om via Bylder een vloer te kopen, namelijk dat negen vloerenzaken
 * leden korting geven.
 *
 * WAT HIJ NU DOET
 * Eerst de korting, met naam, plaats en percentage — uit data/deelnemers.json,
 * dus dezelfde bron als de merkentelling. Dan de keuze per situatie, één
 * prijstabel met de bedragen die de kennisbank al noemt, en de vragen die
 * mensen echt stellen, zichtbaar op de pagina.
 */

const SITE = 'https://www.bylder.com'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const DONKER = '#1A1208'
const APP = 'https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=kopen-vloeren'

// Het aantal zaken en de kortingsband komen uit dezelfde bron als de pagina:
// een getal dat met de hand in een beschrijving staat, loopt stil uit de pas.
export function generateMetadata(): Metadata {
  const zaken = vloerenzaken()
  const p = zaken.map(z => pct(z.aanbod)).filter(Boolean)
  const kern = `${zaken.length} vloerenzaken geven Bylder-leden ${Math.min(...p)} tot ${Math.max(...p)}% korting.`
  return {
    title: 'Vloer kopen met korting: welke past bij je huis? | Bylder',
    description: `${kern} Welke vloer past bij vloerverwarming, een badkamer of kinderen, en wat kost hij gelegd per m²?`,
    alternates: { canonical: `${SITE}/kopen/vloeren/` },
    openGraph: {
      title: 'Vloer kopen met korting: welke past bij je huis?',
      description: `${kern} Met een keuzehulp per situatie en eerlijke prijzen per m².`,
      url: `${SITE}/kopen/vloeren/`,
      type: 'website',
    },
  }
}

type Deelnemer = { naam?: string; plaats?: string; aanbod?: string; cat?: string; website?: string }

/** Vloerenzaken die meedoen, uit dezelfde bron als de merkentelling. */
function vloerenzaken(): Deelnemer[] {
  const p = path.join(process.cwd(), '..', 'data', 'deelnemers.json')
  const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  const lijst: Deelnemer[] = Array.isArray(d) ? d : d.deelnemers
  const vloerCat = /pvc|vloer|parket|laminaat|gietvloer|tapijt/i
  const vloerNaam = /vloer|parket|laminaat|tapijt|floor/i
  return lijst
    // Een zaak die zijn korting onder een andere categorie heeft geregistreerd
    // (De Bossche Tapijtschuur: raamdecoratie) presenteren we niet als vloerkorting.
    .filter(x => x.naam && !/raam/i.test(x.cat || '') && (vloerCat.test(x.cat || '') || vloerNaam.test(x.naam)))
    .sort((a, b) => pct(b.aanbod) - pct(a.aanbod))
}

function pct(s?: string) {
  const m = (s || '').match(/(\d+)\s*%/)
  return m ? Number(m[1]) : 0
}

// Gelegd per m², gelijk aan wat de kennisbank per vloersoort al noemt. Eén bron
// voor dezelfde vraag, anders spreken twee pagina's elkaar tegen.
const SOORTEN = [
  { naam: 'Laminaat', van: 20, tot: 50, vv: 'Matig', nat: 'Nee', krassen: 'Goed', bron: '/kennisbank/vloeren/laminaat-kiezen/',
    kort: 'Het goedkoopst per m², en met een slijtklasse AC4 of AC5 bestand tegen kinderen en stoelen.' },
  { naam: 'PVC', van: 45, tot: 90, vv: 'Goed', nat: 'Ja', krassen: 'Goed', bron: '/kennisbank/vloeren/gietvloer-of-pvc/',
    kort: 'Watervast, stil en dun, dus goed op vloerverwarming. De meest gekozen vloer in nieuwbouw.' },
  { naam: 'Parket', van: 60, tot: 130, vv: 'Matig', nat: 'Nee', krassen: 'Matig', bron: '/kennisbank/vloeren/parket-kiezen/',
    kort: 'Echt hout: warm, en opnieuw te schuren. Op vloerverwarming alleen gelaagd en niet te dik.' },
  { naam: 'Gietvloer', van: 80, tot: 150, vv: 'Goed', nat: 'Ja', krassen: 'Matig', bron: '/kennisbank/vloeren/gietvloer-kiezen/',
    kort: 'Eén vlak zonder naden door het hele huis. Vraagt een droge, vlakke dekvloer.' },
]
const MAX = 150

const SITUATIES = [
  { vraag: 'Je hebt vloerverwarming', antwoord: 'Kies een vloer die de warmte doorlaat: PVC, een gietvloer of tegels. Bij laminaat en parket telt de dikte, samen met de ondervloer. Vraag de leverancier naar de warmteweerstand; hoe lager, hoe beter.', past: 'PVC · gietvloer · tegels' },
  { vraag: 'Het is een badkamer, keuken of hal', antwoord: 'Water en zand zijn hier de vijand. PVC en een gietvloer zijn watervast; laminaat zwelt op als er water in de naad komt.', past: 'PVC · gietvloer · tegels' },
  { vraag: 'Er lopen kinderen of huisdieren', antwoord: 'Krassen en geluid wegen zwaarder dan uitstraling. Laminaat in slijtklasse AC5 en PVC zijn het meest vergevingsgezind; een gietvloer krast eerder dan je denkt.', past: 'PVC · laminaat AC5' },
  { vraag: 'Je woont in een appartement', antwoord: 'De vereniging van eigenaren stelt vaak een eis aan contactgeluid. Die haal je met de ondervloer, niet met de vloer zelf. Vraag de eis op vóór je bestelt.', past: 'Elke vloer, met de juiste ondervloer' },
  { vraag: 'Je wilt één vlak door het hele huis', antwoord: 'Een gietvloer heeft geen naden, en PVC of parket in één richting door alle ruimtes komt dichtbij. Samen met een kozijnloze deur en een plintloze afwerking loopt alles in één lijn door.', past: 'Gietvloer · PVC in één verloop' },
]

const PRODUCTEN: [string, string][] = [
  ['pvc-vloer', 'PVC vloer'], ['pvc-vloer-visgraat', 'PVC visgraat'], ['laminaat', 'Laminaat'],
  ['laminaat-visgraat', 'Laminaat visgraat'], ['parket', 'Parket'], ['parket-eiken', 'Eiken parket'],
  ['gietvloer', 'Gietvloer'], ['gietvloer-betonlook', 'Gietvloer betonlook'], ['gietvloer-wit', 'Witte gietvloer'],
  ['tapijt', 'Tapijt'], ['vloerkleed', 'Vloerkleed'],
]

const VRAGEN = [
  { v: 'Hoe krijg ik korting op een vloer via Bylder?',
    a: 'Maak een gratis account aan. Je krijgt dan een persoonlijke code die je in de winkel of bij de bestelling noemt. Hoeveel korting je krijgt, staat per zaak op deze pagina: van 5 tot 25 procent.' },
  { v: 'Wat kost een vloer per m², inclusief leggen?',
    a: 'Indicatief: laminaat €20–50, PVC €45–90, parket €60–130 en een PU-gietvloer €80–150 per m², inclusief leggen. Egaliseren komt daar vaak nog bij, ongeveer €10–20 per m² als de ondergrond niet vlak genoeg is.' },
  { v: 'Welke vloer is het beste bij vloerverwarming?',
    a: 'Een vloer die de warmte goed doorlaat: PVC, een gietvloer of tegels. Laminaat en parket kunnen ook, maar dan telt de dikte van vloer en ondervloer samen. Hoe lager de warmteweerstand, hoe sneller de ruimte warm is.' },
  { v: 'Wanneer kies ik de vloer bij nieuwbouw?',
    a: 'De vloer zelf leg je meestal na de oplevering, maar twee dingen vallen eerder: de dekvloer moet droog zijn voordat PVC, parket of een gietvloer erop mag, en een plintloze afwerking moet de stukadoor weten voordat hij begint.' },
  { v: 'Kan ik mijn vloerofferte laten controleren?',
    a: 'Ja. Upload de offerte en je ziet per post of de prijs binnen de marktbandbreedte valt, en of er posten dubbel in staan — egaliseren en plinten zitten soms in twee offertes tegelijk.' },
]

const LABEL: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace", fontSize: 11.5, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: ROEST, fontWeight: 700,
}
const H2: React.CSSProperties = {
  fontSize: 'clamp(1.45rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.025em',
  lineHeight: 1.15, margin: '0 0 10px', color: DONKER, textWrap: 'balance',
}
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: 0, maxWidth: '64ch' }
const SECTIE: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 18 }
const KNOP: React.CSSProperties = {
  display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5,
  padding: '13px 22px', borderRadius: 11, textDecoration: 'none',
}
const KNOP_STIL: React.CSSProperties = {
  display: 'inline-block', color: GROEN, fontWeight: 700, fontSize: 15.5, padding: '13px 4px',
  textDecoration: 'underline', textUnderlineOffset: 4,
}

export default function VloerenPagina() {
  const zaken = vloerenzaken()
  const hoogste = Math.max(...zaken.map(z => pct(z.aanbod)))
  const laagste = Math.min(...zaken.map(z => pct(z.aanbod)).filter(Boolean))

  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Kopen', item: `${SITE}/kopen/` },
        { '@type': 'ListItem', position: 3, name: 'Vloeren', item: `${SITE}/kopen/vloeren/` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Vloerenzaken met ledenkorting via Bylder',
      itemListElement: zaken.map((z, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'Store', name: z.naam, ...(z.plaats ? { address: { '@type': 'PostalAddress', addressLocality: z.plaats, addressCountry: 'NL' } } : {}) },
      })),
    },
  ]

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px', color: DONKER,
                   display: 'flex', flexDirection: 'column', gap: 64 }}>
      {schema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <style>{`
        .vl-held{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:center}
        .vl-zaken{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
        .vl-sit{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
        .vl-prod{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
        .vl-tabel{overflow-x:auto;border:1px solid ${INKT}0.14);border-radius:14px;background:#FFFDF9}
        .vl-tabel table{border-collapse:collapse;width:100%;min-width:640px;font-size:15px}
        .vl-tabel th,.vl-tabel td{text-align:left;padding:13px 16px;border-bottom:1px solid ${INKT}0.1)}
        .vl-tabel th{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${INKT}0.55);font-weight:700}
        .vl-tabel tr:last-child td{border-bottom:0}
        .vl-tabel td.getal{font-variant-numeric:tabular-nums;white-space:nowrap}
        .vl-prod a:hover,.vl-zaak:hover{border-color:${GROEN}!important}
        @media(max-width:860px){.vl-held{grid-template-columns:1fr;gap:28px}}
      `}</style>

      {/* ── kop ── */}
      <section className="vl-held">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)` }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder.com</a> &rsaquo;{' '}
            <a href="/kopen/" style={{ color: 'inherit' }}>Kopen</a> &rsaquo; Vloeren
          </nav>
          <div style={LABEL}>Vloeren kopen</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.6vw, 3.1rem)', fontWeight: 800, letterSpacing: '-0.035em',
                       lineHeight: 1.05, margin: 0, textWrap: 'balance' }}>
            Welke vloer past bij je huis &mdash; en waar koop je hem voor minder?
          </h1>
          <p style={{ ...P, fontSize: 18 }}>
            {zaken.length} vloerenzaken geven Bylder-leden {laagste} tot {hoogste}% korting. Hieronder
            zie je welke, welke vloer bij jouw situatie past, en wat hij gelegd kost per m².
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#korting" style={KNOP}>Bekijk de kortingen &darr;</a>
            <a href="/offerte-check/?utm_source=bylder-site&amp;utm_campaign=kopen-vloeren" style={KNOP_STIL}>
              Laat je vloerofferte checken
            </a>
          </div>
        </div>

        {/* Prijsladder: het enige wat een koper in één oogopslag wil weten. */}
        <figure style={{ margin: 0, background: '#FFFDF9', border: `1px solid ${INKT}0.14)`, borderRadius: 16,
                         padding: '22px 22px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <figcaption style={{ ...LABEL, color: `${INKT}0.6)` }}>Gelegd per m², indicatief</figcaption>
          {SOORTEN.map(s => (
            <div key={s.naam} style={{ display: 'grid', gridTemplateColumns: '6.2rem 1fr 6.4rem', gap: 12, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{s.naam}</span>
              <span style={{ position: 'relative', height: 14, background: `${INKT}0.07)`, borderRadius: 7 }}>
                <i style={{ position: 'absolute', top: 0, bottom: 0, borderRadius: 7, background: GROEN,
                            left: `${(s.van / MAX) * 100}%`, width: `${((s.tot - s.van) / MAX) * 100}%` }} />
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13.5, textAlign: 'right',
                             fontVariantNumeric: 'tabular-nums' }}>&euro;{s.van}&ndash;{s.tot}</span>
            </div>
          ))}
          <p style={{ fontSize: 12.5, color: `${INKT}0.55)`, margin: 0, lineHeight: 1.55 }}>
            Inclusief leggen. Egaliseren komt er vaak bij: €10&ndash;20 per m². Bedragen zoals in onze
            kennisbank per vloersoort.
          </p>
        </figure>
      </section>

      {/* ── korting ── */}
      <section id="korting" style={SECTIE}>
        <div>
          <div style={LABEL}>Ledenkorting</div>
          <h2 style={H2}>Bij deze {zaken.length} vloerenzaken krijg je korting</h2>
          <p style={P}>
            Met een gratis account krijg je een persoonlijke code. Die noem je in de winkel of bij de
            bestelling. Plaatsing op deze lijst is niet te koop: het zijn de zaken die leden korting geven.
          </p>
        </div>
        <div className="vl-zaken">
          {zaken.map(z => (
            <div key={z.naam} className="vl-zaak" style={{ background: '#FFFDF9', border: `1px solid ${INKT}0.14)`,
                 borderRadius: 13, padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: GROEN,
                             fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {pct(z.aanbod) ? `${pct(z.aanbod)}%` : z.aanbod}
              </span>
              <span style={{ fontWeight: 800, fontSize: 15.5 }}>{z.naam}</span>
              <span style={{ fontSize: 13.5, color: `${INKT}0.6)` }}>{z.plaats || 'Online'}</span>
            </div>
          ))}
        </div>
        <div><a href={APP} style={KNOP}>Maak een gratis account en activeer je korting &rarr;</a></div>
      </section>

      {/* ── per situatie ── */}
      <section style={SECTIE}>
        <div>
          <div style={LABEL}>Kiezen</div>
          <h2 style={H2}>Welke vloer past bij jouw situatie?</h2>
          <p style={P}>Niet de mooiste vloer is de beste keuze, maar de vloer die past bij hoe je woont.</p>
        </div>
        <div className="vl-sit">
          {SITUATIES.map(s => (
            <div key={s.vraag} style={{ borderTop: `2px solid ${DONKER}`, paddingTop: 14,
                                        display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>{s.vraag}</h3>
              <p style={{ ...P, fontSize: 15 }}>{s.antwoord}</p>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12.5, color: GROEN, fontWeight: 700 }}>
                {s.past}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── vergelijking ── */}
      <section style={SECTIE}>
        <div>
          <div style={LABEL}>Vergelijken</div>
          <h2 style={H2}>Vier vloeren naast elkaar</h2>
        </div>
        <div className="vl-tabel">
          <table>
            <thead>
              <tr><th>Vloer</th><th>Gelegd per m²</th><th>Vloerverwarming</th><th>Watervast</th><th>Krassen</th><th>In het kort</th></tr>
            </thead>
            <tbody>
              {SOORTEN.map(s => (
                <tr key={s.naam}>
                  <td style={{ fontWeight: 800 }}><a href={s.bron} style={{ color: DONKER }}>{s.naam}</a></td>
                  <td className="getal">&euro;{s.van}&ndash;{s.tot}</td>
                  <td>{s.vv}</td><td>{s.nat}</td><td>{s.krassen}</td>
                  <td style={{ color: `${INKT}0.72)`, minWidth: 260 }}>{s.kort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── nieuwbouw ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 32,
                        background: DONKER, color: '#F5F0E8', borderRadius: 18, padding: 'clamp(24px,4vw,40px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...LABEL, color: '#E8A87C' }}>Nieuwbouw</div>
          <h2 style={{ ...H2, color: '#F5F0E8' }}>De vloer leg je later, maar twee keuzes vallen eerder</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ ...P, color: 'rgba(245,240,232,0.8)' }}>
            <strong style={{ color: '#F5F0E8' }}>De dekvloer moet droog zijn.</strong> PVC, parket en een
            gietvloer mogen pas op een droge ondergrond. Wie direct na de sleutel wil leggen, laat het
            vochtgehalte meten in plaats van te gokken.
          </p>
          <p style={{ ...P, color: 'rgba(245,240,232,0.8)' }}>
            <strong style={{ color: '#F5F0E8' }}>Plintloos moet de stukadoor weten.</strong> Een vloer zonder
            plint, of een deur zonder kozijn, wordt vóór het stucwerk besloten &mdash; niet erna.{' '}
            <a href="/kennisbank/vloeren/plintloos-afwerken/" style={{ color: '#E8A87C' }}>Plintloos afwerken</a>
            {' · '}
            <a href="/kozijnloze-deuren/" style={{ color: '#E8A87C' }}>kozijnloze deuren</a>
          </p>
        </div>
      </section>

      {/* ── per soort ── */}
      <section style={SECTIE}>
        <div>
          <div style={LABEL}>Per soort</div>
          <h2 style={H2}>Prijzen en vakbedrijven per vloersoort</h2>
          <p style={P}>Per soort zie je de marktprijs in jouw gemeente en wie het bij jou in de buurt legt.</p>
        </div>
        <div className="vl-prod">
          {PRODUCTEN.map(([slug, naam]) => (
            <a key={slug} href={`/kopen/vloeren/${slug}/`} style={{ display: 'flex', justifyContent: 'space-between',
               gap: 8, padding: '13px 15px', border: `1px solid ${INKT}0.14)`, borderRadius: 11,
               background: '#FFFDF9', textDecoration: 'none', color: DONKER, fontWeight: 700, fontSize: 15 }}>
              {naam}<span style={{ color: GROEN }}>&rarr;</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── offerte ── */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
                        border: `1px solid ${INKT}0.14)`, borderRadius: 16, padding: '24px 26px', background: '#FFFDF9' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '62ch' }}>
          <h2 style={{ ...H2, fontSize: '1.35rem', margin: 0 }}>Al een offerte voor je vloer?</h2>
          <p style={{ ...P, fontSize: 15 }}>
            Upload hem en zie per post of de prijs klopt. Egaliseren en plinten staan soms in twee offertes
            tegelijk.
          </p>
        </div>
        <a href="/offerte-check/?utm_source=bylder-site&amp;utm_campaign=kopen-vloeren" style={KNOP}>Offerte checken &rarr;</a>
      </section>

      {/* ── vragen ── */}
      <section style={SECTIE}>
        <div>
          <div style={LABEL}>Vragen</div>
          <h2 style={H2}>Wat mensen vragen voordat ze een vloer kopen</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 860 }}>
          {VRAGEN.map((q, i) => (
            <details key={q.v} open={i === 0} style={{ borderTop: `1px solid ${INKT}0.14)`, padding: '16px 0' }}>
              <summary style={{ fontWeight: 800, fontSize: 16.5, cursor: 'pointer' }}>{q.v}</summary>
              <p style={{ ...P, fontSize: 15.5, marginTop: 10 }}>{q.a}</p>
            </details>
          ))}
        </div>
        <p style={{ fontSize: 14, color: `${INKT}0.65)`, margin: 0 }}>
          Verder lezen: <a href="/kennisbank/vloeren/laminaat-kiezen/" style={{ color: GROEN }}>laminaat kiezen</a> ·{' '}
          <a href="/kennisbank/vloeren/parket-kiezen/" style={{ color: GROEN }}>parket kiezen</a> ·{' '}
          <a href="/kennisbank/vloeren/gietvloer-kiezen/" style={{ color: GROEN }}>gietvloer kiezen</a> ·{' '}
          <a href="/kennisbank/vloeren/gietvloer-of-pvc/" style={{ color: GROEN }}>gietvloer of PVC</a> ·{' '}
          <a href="/kennisbank/vloeren/vloer-in-nieuwbouw/" style={{ color: GROEN }}>vloer in nieuwbouw</a>
        </p>
      </section>
    </main>
  )
}
