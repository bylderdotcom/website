import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { TYPES, KLEUREN, GIET_PRIJS_M2, MIN_M2, KLEUR_VOORBEHOUD } from '../components/gietvloer/gegevens'
import { onderdeel } from '@/lib/afwerken'
import Maquette from '../components/Maquette'
import JouwRegel from '../components/JouwRegel'
import DrieOffertes from '../components/DrieOffertes'
import KamerFoto from '../components/gietvloer/KamerFoto'

// /gietvloer/ — de productpagina voor de gietvloer (11-11-2026, besluit Daniel), in dezelfde opbouw als
// /kozijnloze-deuren/ en /kasten-op-maat/ en volgens het stijlboek. Tot die dag was dit de hub van de gids
// met gietvloerspecialisten; de steden en profielen staan nog op /gietvloer/<stad>/ en /gietvloer/bedrijf/<slug>/
// (app/gietvloer/[...slug]) en zijn hier onderaan te vinden. Feiten en prijzen: components/gietvloer/gegevens.ts.

const URL = 'https://www.bylder.com/gietvloer/'
const ONTWERPER = '/gietvloer/ontwerpen/'
const FOTO = '/img/gietvloer/dr-schutz-gietvloer-ruimte.jpg'

export const metadata: Metadata = {
  title: `Gietvloer: prijs per m², vier soorten en je kleur in je eigen woning | Bylder`,
  description: `Een gietvloer kost €${GIET_PRIJS_M2[0]} tot €${GIET_PRIJS_M2[1]} per m². Vergelijk de vier vloeren van Dr. Schutz, zie je kleur in je eigen kamers en vraag tot drie stalen gratis aan.`,
  alternates: { canonical: URL },
  openGraph: { title: 'Gietvloer: één vloer zonder naden, in de kleur die jij kiest', description: `Vier vloeren, ${KLEUREN.filter(k => k.type).length} kleuren, €${GIET_PRIJS_M2[0]} tot €${GIET_PRIJS_M2[1]} per m². Zie hem in je eigen woning.`, url: URL, type: 'website', images: [{ url: 'https://www.bylder.com/img/og/gietvloer.jpg', width: 1200, height: 630, alt: 'Maquette van een woning met de vloer in groen' }] },
  twitter: { card: 'summary_large_image' },
}

const INKT = 'rgba(61,46,30,', GROEN = '#3D5A3E'
const H2: React.CSSProperties = { fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '64px 0 12px', textWrap: 'balance' }
const P: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.7, color: `${INKT}0.8)`, margin: '0 0 16px', maxWidth: '66ch' }
const OOG: React.CSSProperties = { fontSize: 13, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B85C38', fontWeight: 700, margin: '0 0 12px' }
const KNOP: React.CSSProperties = { display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }
const LIJN = `1px solid ${INKT}0.14)`

const STAPPEN = [
  ['Kies je vloer', 'Upload een foto van een gietvloer die je mooi vindt; wij lezen de kleur en de glans. Of kies uit de kleuren hieronder.'],
  ['Zie hem in je woning', 'Je kiest per ruimte waar de vloer komt. Met je bouwtekening rekenen we de vierkante meters voor je uit.'],
  ['Stalen en offerte', 'Tot drie stalen gratis thuis. Bevalt het, dan vraag je de offerte aan; de verwerker meet eerst in.'],
]

const eur = (n: number) => '€ ' + n.toLocaleString('nl-NL')
const schaal = (n: number, max: number) => '●'.repeat(n) + '○'.repeat(max - n)

function steden(): { slug: string; naam: string }[] {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(process.cwd(), '..', 'data', 'clusters', 'gietvloer', 'cities.json'), 'utf8')) as Record<string, { city: string }>
    return Object.entries(c).map(([slug, v]) => ({ slug, naam: v.city })).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'))
  } catch { return [] }
}

export default function GietvloerPagina() {
  const lijst = steden()
  const vloer = onderdeel('vloeren')
  const vragen = [
    { v: 'Wat kost een gietvloer per m²?', a: `Als indicatie €${GIET_PRIJS_M2[0]} tot €${GIET_PRIJS_M2[1]} per m², inclusief btw. Bio Fine, Bio Cement en Bio Lava kosten €${TYPES[0].prijs![0]} tot €${TYPES[0].prijs![1]} per m², Bio Concrete €${TYPES[3].prijs![0]} tot €${TYPES[3].prijs![1]} door het extra slijpwerk. Een vloer kleiner dan ${MIN_M2} m² wordt als ${MIN_M2} m² gerekend.` },
    { v: 'Kan een gietvloer op vloerverwarming?', a: TYPES[0].vloerverwarming },
    { v: 'Kan een gietvloer in de badkamer?', a: 'Ja. Alle vier de vloeren zijn 100% waterdicht en geschikt voor badkamer, keuken en bijkeuken. Bio Concrete kan als enige ook op de wanden.' },
    { v: 'Welke gietvloer is het makkelijkst schoon te houden?', a: 'Bio Concrete: die wordt volledig met diamant geslepen en is daardoor extreem glad. Bio Fine is ook eenvoudig te onderhouden, maar op een rustig vlak zie je kruimels en gebruikssporen sneller.' },
    { v: 'Wie legt de vloer?', a: 'Een gespecialiseerde verwerker. Je vraagt de offerte aan in je gratis Bylder-omgeving; de verwerker krijgt je ruimtes, je kleur en je inspiratiefoto, en meet eerst in.' },
  ]
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Gietvloer in je woning', serviceType: 'Gietvloer', url: URL, image: `https://www.bylder.com${FOTO}`,
      provider: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' }, areaServed: { '@type': 'Country', name: 'Nederland' },
      offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: GIET_PRIJS_M2[0], highPrice: GIET_PRIJS_M2[1], unitText: 'm²' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: vragen.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' }, { '@type': 'ListItem', position: 2, name: 'Gietvloer', item: URL }] },
  ]
  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 16px 72px', color: '#1A1208' }}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <style>{`.gv-held{display:grid;gap:32px;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);align-items:center}
        .gv-vier{list-style:none;padding:0;margin:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))}
        .gv-vier a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid ${INKT}0.12);border-radius:16px;overflow:hidden;text-decoration:none;color:inherit}
        .gv-rij{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr);gap:8px 20px;padding:14px 0;border-top:${LIJN};align-items:baseline}
        .gv-kl{list-style:none;padding:0;margin:0;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(84px,1fr))}
        .gv-twee{display:grid;gap:32px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:center}
        @media(max-width:820px){.gv-held,.gv-twee{grid-template-columns:minmax(0,1fr)}.gv-rij{grid-template-columns:minmax(0,1fr) auto}.gv-rij span:last-child{grid-column:1/-1}}`}</style>

      <nav aria-label="Kruimelpad" style={{ fontSize: 13.5, color: `${INKT}0.6)`, margin: '0 0 22px' }}>
        <a href="/" style={{ color: GROEN, textDecoration: 'none', fontWeight: 600 }}>Home</a> › Gietvloer
      </nav>

      <div className="gv-held">
        <div>
          <p style={OOG}>Vloeren · gietvloer</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4.4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 16px', textWrap: 'balance' }}>Gietvloer: één vloer zonder naden, in de kleur die jij kiest</h1>
          <p style={{ ...P, fontSize: 17.5 }}>Een gietvloer loopt zonder naden en drempels door je hele woning. Upload een foto van een vloer die je mooi vindt, zie hem in je eigen kamers en vraag tot drie stalen gratis aan.</p>
          <p className="maat" style={{ fontSize: 17, fontWeight: 700, margin: '0 0 20px' }}>
            <JouwRegel soort="gietvloer" standaard={`${eur(GIET_PRIJS_M2[0])} tot ${eur(GIET_PRIJS_M2[1])} per m²`} perM2={GIET_PRIJS_M2} minM2={MIN_M2} />
          </p>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={ONTWERPER} data-meet="gietvloer-held" style={KNOP}>Ontwerp je gietvloer →</a>
            <a href="#kf-kop" style={{ color: GROEN, fontWeight: 700 }}>Zie hem in je eigen kamer →</a>
          </div>
          <p style={{ fontSize: 14, color: `${INKT}0.65)`, margin: '14px 0 0' }}>Gratis, zonder account. Inclusief btw.</p>
        </div>
        <figure style={{ margin: 0 }}>
          <img src={FOTO} alt="Lichtgrijze gietvloer zonder naden in een ruimte met hoge ramen en gele fauteuils" width={1200} height={900} fetchPriority="high" decoding="async"
            style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 18 }} />
          <figcaption style={{ fontSize: 13, color: `${INKT}0.6)`, marginTop: 8 }}>Gietvloer van Dr. Schutz</figcaption>
        </figure>
      </div>

      <h2 style={H2}>Zo werkt het</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0 32px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
        {STAPPEN.map(([kop, tekst], i) => (
          <li key={kop} style={{ borderTop: LIJN, padding: '16px 0 8px' }}>
            <span className="maat" style={{ color: GROEN, fontWeight: 700, fontSize: 14 }}>0{i + 1}</span>
            <strong style={{ display: 'block', fontSize: 18, margin: '6px 0' }}>{kop}</strong>
            <span style={{ fontSize: 15.5, lineHeight: 1.6, color: `${INKT}0.78)` }}>{tekst}</span>
          </li>
        ))}
      </ol>

      <KamerFoto />

      <h2 style={H2}>Vier vloeren, van rustig naar druk</h2>
      <p style={P}>De kwaliteit is bij alle vier gelijk: 100% waterdicht, UV-stabiel en emissiearm (EMICODE EC1 PLUS). Je kiest op de tekening in de vloer.</p>
      <ul className="gv-vier">
        {TYPES.map(t => {
          const foto = KLEUREN.find(k => k.type === t.id && k.foto)?.foto
          return (
            <li key={t.id}>
              <a href={ONTWERPER} data-meet={`gietvloer-type-${t.id}`}>
                {foto && <img src={foto} alt={`${t.naam}: voorbeeld van de tekening in de vloer`} loading="lazy" decoding="async" width={600} height={400} style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3 / 2', objectFit: 'cover' }} />}
                <span style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <strong style={{ fontSize: 19 }}>{t.naam}</strong>
                  <span style={{ fontSize: 15, lineHeight: 1.55, color: `${INKT}0.75)`, flex: 1 }}>{t.kort}</span>
                  <span className="maat" style={{ fontSize: 13.5, color: `${INKT}0.75)` }}>Tekening {schaal(t.tekening, 4)}<br />Schoonhouden {schaal(t.schoon, 5)}</span>
                  {t.prijs && <span className="maat" style={{ fontSize: 14.5, fontWeight: 700 }}>{eur(t.prijs[0])} tot {eur(t.prijs[1])} per m²</span>}
                </span>
              </a>
            </li>
          )
        })}
      </ul>

      <h2 id="prijs" style={{ ...H2, scrollMarginTop: 120 }}>Wat kost een gietvloer?</h2>
      <p style={P}>Indicatie per m², inclusief btw. Een vloer kleiner dan {MIN_M2} m² wordt als {MIN_M2} m² gerekend. De verwerker meet in voordat je een offerte krijgt.</p>
      <div style={{ maxWidth: 860, borderBottom: LIJN }}>
        {TYPES.map(t => (
          <div key={t.id} className="gv-rij">
            <strong>{t.naam}</strong>
            <span className="maat" style={{ fontWeight: 700 }}>{t.prijs ? `${eur(t.prijs[0])} tot ${eur(t.prijs[1])}` : 'op aanvraag'}</span>
            <span style={{ fontSize: 14.5, color: `${INKT}0.72)` }}>{t.kleuren} kleuren{t.wand ? ', ook op de wand' : ''}</span>
          </div>
        ))}
        <div className="gv-rij">
          <strong>Voorbeeld: {MIN_M2 + 5} m² woonkamer en keuken</strong>
          <span className="maat" style={{ fontWeight: 700 }}>{eur((MIN_M2 + 5) * GIET_PRIJS_M2[0])} tot {eur((MIN_M2 + 5) * GIET_PRIJS_M2[1])}</span>
          <span style={{ fontSize: 14.5, color: `${INKT}0.72)` }}>Met je eigen tekening rekent de ontwerper je eigen vierkante meters uit</span>
        </div>
      </div>

      <h2 style={H2}>De kleuren van Bio Fine</h2>
      <p style={P}>Twintig kleuren in de rustigste vloer. In de ontwerper zie je ook de kleuren van Bio Cement, Bio Lava en Bio Concrete, en leg je er je eigen foto naast.</p>
      <ul className="gv-kl">
        {KLEUREN.filter(k => k.type === 'fine' && k.foto).map(k => (
          <li key={k.id}>
            <img src={k.foto} alt={`Gietvloer Bio Fine in de kleur ${k.naam}`} loading="lazy" decoding="async" width={168} height={168} style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '1', objectFit: 'cover', borderRadius: 10 }} />
            <span style={{ display: 'block', fontSize: 13, marginTop: 4, color: `${INKT}0.8)` }}>{k.naam}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: `${INKT}0.6)`, margin: '14px 0 0', maxWidth: '80ch' }}>{KLEUR_VOORBEHOUD}</p>
      <p style={{ margin: '18px 0 0' }}><a href={ONTWERPER} style={{ color: GROEN, fontWeight: 700 }}>Zie je kleur in je eigen woning →</a></p>

      <div className="gv-twee" style={{ marginTop: 64 }}>
        <div>
          <h2 style={{ ...H2, margin: '0 0 12px' }}>Wanneer in de bouw</h2>
          {vloer && <p style={P}>{vloer.wanneer}</p>}
          <p style={P}>{TYPES[0].vloerverwarming}</p>
          <p style={{ ...P, marginBottom: 0 }}>Laat je de vloer leggen als onderdeel van je hele afwerking? Dan staat hij in één offerte met stucwerk, tegels en schilderwerk. <a href="/nieuwbouw-afwerken/vloeren/" style={{ color: GROEN, fontWeight: 700 }}>Vloeren in je afwerking →</a></p>
        </div>
        <Maquette accent="vloeren" bijschrift="Voorbeeldwoning · in groen: de vloer" style={{ maxWidth: 460, width: '100%', margin: '0 auto' }} />
      </div>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ maxWidth: 860, borderBottom: LIJN }}>
        {vragen.map(q => (
          <details key={q.v} style={{ borderTop: LIJN, padding: '14px 0' }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16.5 }}>{q.v}</summary>
            <p style={{ ...P, margin: '10px 0 0', fontSize: 15.5 }}>{q.a}</p>
          </details>
        ))}
      </div>

      <DrieOffertes soort="gietvloer" href={ONTWERPER} marge="64px 0 0" />

      {lijst.length > 0 && (
        <section aria-labelledby="gv-steden">
          <h2 id="gv-steden" style={H2}>Gietvloerspecialisten per stad</h2>
          <p style={P}>Liever eerst zelf rondkijken? In de gids staan gietvloerspecialisten in {lijst.length} steden, met hun beoordelingen op een rij.</p>
          <details style={{ borderTop: LIJN, borderBottom: LIJN, padding: '14px 0', maxWidth: 860 }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16.5 }}>Alle {lijst.length} steden</summary>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: '8px 16px', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {lijst.map(s => <li key={s.slug}><a href={`/gietvloer/${s.slug}/`} style={{ color: GROEN, fontSize: 15 }}>{s.naam}</a></li>)}
            </ul>
          </details>
          <p style={{ fontSize: 14.5, color: `${INKT}0.7)`, margin: '14px 0 0' }}>Leg je zelf gietvloeren? <a href="/voor-vakbedrijven/" style={{ color: GROEN, fontWeight: 700 }}>Zo kom je in de gids</a>.</p>
        </section>
      )}
    </main>
  )
}
