import { bouw, zaaglijst, platen } from '@/lib/kast/rekenmodel'
import { voorbeeld } from '@/lib/kast/voorbeelden'
import { PIJLER, TYPES, urlVan, BIJGEWERKT, URL_BASIS, type HubPagina } from '@/lib/kast/hub'
import { Uitslag } from '../../components/kast/Tekeningen'
import VoorbeeldKast from './VoorbeeldKast'

// Eén weergave voor de pijler en de typepagina's. Alles wat hier staat komt uit
// het rekenmodel of uit lib/kast/hub.ts; er staat geen enkel getal met de hand.

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const KOPER = '#B85C38'

const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 22 }
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '52px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const LABEL: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700 }
const KNOP: React.CSSProperties = { display: 'inline-block', background: '#1A1208', color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }

const nl = (v: number) => v.toLocaleString('nl-NL', { maximumFractionDigits: 1 })
export const ontwerpUrl = (p: HubPagina) => `/kasten-op-maat/ontwerpen/${p.slug ? `?start=${p.slug}` : ''}`
const knopTekst = (p: HubPagina) => (p.slug ? `Ontwerp je ${p.kort.toLowerCase()}` : 'Begin met ontwerpen')

function feiten(slug: string) {
  const v = voorbeeld(slug)
  const b = bouw(v.ontwerp)
  const lijst = zaaglijst(b)
  return {
    v, b, lijst,
    lengte: b.maten.benen.reduce((s, x) => s + x.lengte, 0),
    deuren: b.fronten.filter(f => f.soort === 'deur').length,
    lades: b.fronten.filter(f => f.soort === 'lade').length,
    onderdelen: lijst.reduce((s, r) => s + r.n, 0),
    platen: platen(b).reduce((s, p) => s + p.platen, 0),
  }
}

function schema(p: HubPagina) {
  const url = urlVan(p)
  const kruimels = [
    { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
    { '@type': 'ListItem', position: 2, name: 'Kasten op maat', item: URL_BASIS },
    ...(p.slug ? [{ '@type': 'ListItem', position: 3, name: p.kort, item: url }] : []),
  ]
  const graph: Record<string, unknown>[] = [
    { '@type': 'BreadcrumbList', itemListElement: kruimels },
    {
      '@type': 'WebPage', '@id': url, url, name: p.h1, description: p.description, inLanguage: 'nl-NL',
      dateModified: BIJGEWERKT, about: { '@type': 'Thing', name: p.slug ? p.kort : 'Kast op maat' },
      isPartOf: { '@type': 'WebSite', name: 'Bylder', url: 'https://www.bylder.com/' },
      publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' },
      potentialAction: { '@type': 'CreateAction', name: knopTekst(p), target: `https://www.bylder.com${ontwerpUrl(p)}` },
    },
    { '@type': 'FAQPage', mainEntity: p.vragen.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ]
  if (!p.slug) graph.push({
    '@type': 'HowTo', name: 'Een kast op maat ontwerpen en laten maken',
    step: [
      { '@type': 'HowToStep', name: 'Laat zien wat je mooi vindt', text: 'Upload 1 tot 4 foto’s van kasten die je aanspreken. De ontwerper haalt er stijl en kleur uit.' },
      { '@type': 'HowToStep', name: 'Vertel waar de kast komt', text: 'Welke muur of hoek, hoeveel ruimte, de plafondhoogte en wat erin moet.' },
      { '@type': 'HowToStep', name: 'Stuur het ontwerp bij', text: 'Je ziet de kast in 3D met maten. Wijzigen doe je in gewone taal.' },
      { '@type': 'HowToStep', name: 'Vraag een offerte aan', text: 'Het timmerbedrijf krijgt tekeningen, zaaglijst en beslaglijst, meet in en maakt de kast.' },
    ],
  })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export default function HubWeergave({ p }: { p: HubPagina }) {
  const f = feiten(p.voorbeeld)
  const o = f.v.ontwerp
  const anderen = TYPES.filter(t => t.slug !== p.slug)
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 72px', color: '#1A1208' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema(p)) }} />
      <div style={{ maxWidth: 812 }}>
        <nav aria-label="Kruimelpad" style={{ ...LABEL, marginBottom: 10 }}>
          <a href="/" style={{ color: `${INKT}0.55)`, textDecoration: 'none' }}>Bylder</a>
          {' / '}
          {p.slug
            ? <><a href="/kasten-op-maat/" style={{ color: `${INKT}0.55)`, textDecoration: 'none' }}>Kasten op maat</a>{' / '}<span style={{ color: `${INKT}0.8)` }}>{p.kort}</span></>
            : <span style={{ color: `${INKT}0.8)` }}>Kasten op maat</span>}
        </nav>
        <p style={LABEL}>{p.label}</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4.4vw, 2.3rem)', lineHeight: 1.15, fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>{p.h1}</h1>
        <p style={{ ...P, fontSize: 17.5, maxWidth: '62ch' }}>{p.intro}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', margin: '20px 0 0' }}>
          <a href={ontwerpUrl(p)} style={KNOP}>{knopTekst(p)} &rarr;</a>
          <span style={{ fontSize: 14, color: `${INKT}0.62)` }}>Gratis. Je eerste drie vragen zonder account.</span>
        </div>
      </div>

      {/* Het voorbeeld: draaiend in 3D, en ernaast wat het rekenmodel ervan maakt. */}
      <section aria-labelledby="voorbeeld-kop" style={{ display: 'grid', gap: 20, margin: '38px 0 0', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', alignItems: 'start' }}>
        <VoorbeeldKast slug={p.voorbeeld} />
        <div style={{ ...KAART, background: '#FBF8F3' }}>
          <p style={LABEL}>Voorbeeld uit de ontwerper</p>
          <h2 id="voorbeeld-kop" style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0 12px' }}>{f.v.titel}</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', margin: 0, fontSize: 15 }}>
            <dt style={{ color: `${INKT}0.6)` }}>Maat</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>
              {o.opstelling === 'hoek' ? f.b.maten.benen.map(x => `${nl(x.lengte)}`).join(' + ') + ' cm langs twee muren' : `${nl(f.lengte)} cm breed`}, {nl(f.b.maten.hoogte)} cm hoog, {nl(o.diepte)} cm diep
            </dd>
            <dt style={{ color: `${INKT}0.6)` }}>Fronten</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{f.deuren} deuren{f.lades ? `, ${f.lades} lades` : ''}{o.greep === 'geen' ? ', greeploos' : o.greep === 'staaf' ? ', met staafgrepen' : ', met knoppen'}</dd>
            <dt style={{ color: `${INKT}0.6)` }}>Afwerking</dt>
            <dd style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 4, background: o.afwerking.hex, border: `1px solid ${INKT}0.2)` }} />
              {o.afwerking.naam}{o.afwerking.glans ? `, ${o.afwerking.glans}` : ''}
            </dd>
            <dt style={{ color: `${INKT}0.6)` }}>Werkplaats</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{f.onderdelen} onderdelen op de zaaglijst, ongeveer {f.platen} platen</dd>
          </dl>
          {o.notities?.[0] && <p style={{ ...P, fontSize: 14.5, margin: '14px 0 0' }}>{o.notities[o.notities.length - 1]}</p>}
          <a href={ontwerpUrl(p)} style={{ display: 'inline-block', marginTop: 14, color: GROEN, fontWeight: 800, textDecoration: 'none' }}>Pas dit voorbeeld aan naar jouw ruimte &rarr;</a>
        </div>
      </section>

      <div style={{ maxWidth: 812 }}>
        <figure style={{ ...KAART, margin: '20px 0 0', padding: '18px 18px 12px' }}>
          <Uitslag bouw={f.b} ontwerp={o} />
          <figcaption style={{ fontSize: 13, color: `${INKT}0.6)`, marginTop: 8 }}>Vooraanzicht met maten, zoals het timmerbedrijf het krijgt. Maten in centimeters.</figcaption>
        </figure>

        {p.secties.map(s => (
          <section key={s.h2}>
            <h2 style={H2}>{s.h2}</h2>
            {s.p.map((t, i) => <p key={i} style={P}>{t}</p>)}
            {s.lijst && (
              <ul style={{ ...P, paddingLeft: 20, display: 'grid', gap: 6 }}>
                {s.lijst.map(t => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        ))}

        <h2 style={H2}>Wat het timmerbedrijf van dit ontwerp krijgt</h2>
        <p style={P}>Een deel van de zaaglijst van het voorbeeld hierboven. Elk onderdeel heeft een lengte, breedte en dikte in millimeters, het materiaal en de afwerking van de kanten.</p>
        <div style={{ overflowX: 'auto', border: `1px solid ${INKT}0.12)`, borderRadius: 14, background: '#fff' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 460, fontSize: 14 }}>
            <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Zaaglijst, eerste regels</caption>
            <thead><tr>{['Onderdeel', 'Aantal', 'L × B × D (mm)', 'Materiaal'].map(h => <th key={h} scope="col" style={{ ...LABEL, textAlign: 'left', padding: '10px 12px', background: '#F5F0E8' }}>{h}</th>)}</tr></thead>
            <tbody>
              {f.lijst.slice(0, 6).map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '9px 12px', borderTop: `1px solid ${INKT}0.08)` }}>{r.naam}</td>
                  <td style={{ padding: '9px 12px', borderTop: `1px solid ${INKT}0.08)`, fontVariantNumeric: 'tabular-nums' }}>{r.n}</td>
                  <td style={{ padding: '9px 12px', borderTop: `1px solid ${INKT}0.08)`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.L} × {r.B} × {r.T}</td>
                  <td style={{ padding: '9px 12px', borderTop: `1px solid ${INKT}0.08)`, color: `${INKT}0.7)` }}>{r.mat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...P, fontSize: 13.5, color: `${INKT}0.6)`, marginTop: 10 }}>En nog {f.lijst.length - 6} regels, plus de beslaglijst en de plattegrond.</p>
      </div>

      <h2 style={H2}>{p.slug ? 'Andere kasten op maat' : 'Kies je kast'}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {(p.slug ? [PIJLER, ...anderen] : anderen).map(t => (
          <li key={t.slug || 'pijler'}>
            <a href={t.slug ? `/kasten-op-maat/${t.slug}/` : '/kasten-op-maat/'} style={{ ...KAART, display: 'block', height: '100%', boxSizing: 'border-box', textDecoration: 'none', color: '#1A1208', padding: 18 }}>
              <strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>{t.slug ? t.kort : 'Alles over kasten op maat'}</strong>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: `${INKT}0.7)` }}>{t.description.split('. ')[0]}.</span>
            </a>
          </li>
        ))}
      </ul>

      <div style={{ maxWidth: 812 }}>
        <h2 style={H2}>Veelgestelde vragen</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {p.vragen.map(q => (
            <details key={q.v} style={{ ...KAART, padding: '16px 20px' }}>
              <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16 }}>{q.v}</summary>
              <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
            </details>
          ))}
        </div>
      </div>

      <aside aria-label="Begin met ontwerpen" style={{ background: '#1A1208', borderRadius: 20, padding: '30px 28px', margin: '52px 0 0', color: '#F5F0E8' }}>
        <p style={{ ...LABEL, color: '#E8A87C' }}>Ontwerper · offerte</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 10px', textWrap: 'balance' }}>Zie je eigen kast in 3D, voordat er iets gezaagd wordt</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,.78)', margin: '0 0 18px', maxWidth: '58ch' }}>
          Upload een paar voorbeeldfoto’s, vertel waar de kast komt en wat erin moet. Met of zonder bouwtekening; het timmerbedrijf meet altijd gratis in.
        </p>
        <a href={ontwerpUrl(p)} style={{ ...KNOP, background: '#F5F0E8', color: '#1A1208' }}>{knopTekst(p)} &rarr;</a>
      </aside>
      <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '18px 0 0' }}>Bijgewerkt {new Date(BIJGEWERKT).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}. <span style={{ color: KOPER }}>Bylder</span> rekent elk voorbeeld door met hetzelfde model als de ontwerper.</p>
    </main>
  )
}
