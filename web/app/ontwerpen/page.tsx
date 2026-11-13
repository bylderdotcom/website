import type { Metadata } from 'next'
import { VANAF, euroRond } from '../kozijnloze-deuren/configurator/prijs'
import { GIET_PRIJS_M2, TYPES } from '../components/gietvloer/gegevens'
import Maquette from '../components/Maquette'

// Ontwerpen en bestellen: de drie configuratoren op één plek, en wat er ná het
// ontwerpen gebeurt. Want een ontwerper zonder vervolg is speelgoed; deze pagina
// laat zien dat elk ontwerp een offerte wordt, en die offerte een bestelling bij
// de partij die het maakt of legt.
//
// Wat hier over Mijn woning staat, moet kloppen met wat Mijn woning echt doet
// (app, digitale tweeling fase 1 t/m 3, 10-10-2026): deuren, gietvloer en kast staan
// erin; per onderdeel de stand van de offerte; wijzigen mag altijd, met een nieuwe
// offerte als er iets wezenlijks verandert; één tijdlijn. De site is de voorproef
// zonder account; aanvragen, aanpassen en bestellen gebeurt in de app.

const URL = 'https://www.bylder.com/ontwerpen/'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '56px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' }
const OOG: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700, margin: '0 0 8px' }

export const metadata: Metadata = {
  title: 'Zelf ontwerpen: deuren, kast, gietvloer en badkamer in je eigen woning | Bylder',
  description: 'Zet je woning in 3D uit je bouwtekening en ontwerp zelf je deuren, kast op maat en gietvloer, met maten en prijs. Je ontwerp is meteen de offerteaanvraag.',
  alternates: { canonical: URL },
  openGraph: { title: 'Zelf ontwerpen in je eigen woning', description: 'Je woning in 3D uit je tekening. Deuren, kast, gietvloer en badkamer met maten en prijs.', url: URL, type: 'website', images: [{ url: 'https://www.bylder.com/img/og/mijn-woning.jpg', width: 1200, height: 630, alt: 'Voorbeeldwoning als maquette, van bovenaf' }] },
}

const PRODUCTEN = [
  {
    naam: 'Kozijnloze deuren', href: '/kozijnloze-deuren/configurator/', knop: 'Stel je deuren samen', meer: '/kozijnloze-deuren/',
    img: '/img/winkel/deuren/origin-6005-sm.webp', alt: 'Kozijnloze deur in mosgroen, vlak in een wand in dezelfde kleur',
    prijs: `Vanaf ${euroRond(VANAF)} per deur, exclusief montage`,
    wat: 'Per deur kies je de hoogte, de kleur of fineer, het groefpatroon, de draairichting en de kruk. Je ziet de deur in 3D en de prijs loopt mee.',
    daarna: 'Bylder maakt de offerte op jouw specificatie, met het aantal deuren uit je tekening. Classic Next maakt de deuren, een vakbedrijf monteert ze.',
  },
  {
    naam: 'Kast op maat', href: '/kasten-op-maat/ontwerpen/', knop: 'Ontwerp je kast', meer: '/kasten-op-maat/',
    img: '/img/kasten/hoekkast-3d-sm.jpg', alt: 'Hoekkast op maat in 3D, uit de kastontwerper',
    prijs: 'Gratis ontwerpen en inmeten',
    wat: 'Je beschrijft je kast of uploadt een foto van een kast die je mooi vindt. Je ziet hem in 3D op jouw wand, met maten, een tekening en een zaaglijst.',
    daarna: 'Je geeft aan wanneer de kast geplaatst moet worden. Wij sturen je ontwerp naar hooguit drie timmerbedrijven, die allemaal op hetzelfde ontwerp rekenen.',
  },
  {
    naam: 'Gietvloer', href: '/gietvloer/ontwerpen/', knop: 'Ontwerp je gietvloer', meer: '/gietvloer/',
    img: '/img/gietvloer/dr-schutz-gietvloer-ruimte.jpg', alt: 'Lichtgrijze gietvloer van Dr. Schutz in een ruimte met twee okergele fauteuils',
    prijs: `€ ${GIET_PRIJS_M2[0]} tot € ${GIET_PRIJS_M2[1]} per m²`,
    wat: `Je kiest per ruimte waar de vloer komt, het type (${TYPES.map(t => t.naam).join(', ')}) en de kleur. De vierkante meters komen uit je tekening.`,
    daarna: 'Tot drie stalen komen gratis bij je thuis. Je geeft aan wanneer de vloer gelegd moet worden, en wij sturen je ontwerp naar hooguit drie verwerkers.',
  },
  {
    naam: 'Badkamer', href: '/badkamer-ontwerpen/', knop: 'Bekijk de badkamer', meer: '/nieuwbouw-afwerken/sanitair/',
    maquette: true, alt: '',
    prijs: 'Indicatie € 7.000 tot € 20.000 compleet',
    wat: 'Badkamer en toilet staan met hun maten in je woning in 3D. De ontwerper waarin je zelf sanitair en tegels plaatst, is in de maak.',
    daarna: 'Nu al: één offerte uit je tekening, met tegels, sanitair en werk elk apart. Bylder neemt de opdracht aan.',
  },
]

const ANDERS = [
  { t: 'Het zijn jouw maten', p: 'Je uploadt de plattegrond van je aannemer. Wij lezen de verdiepingen, de ruimtes en de deuren eruit. Elke ontwerper rekent daarna met jouw vierkante meters, jouw wanden en jouw aantal deuren.' },
  { t: 'Je ontwerp is de aanvraag', p: 'Een bedrijf krijgt geen omschrijving maar het ontwerp zelf: maten, kleuren, tekening en zaaglijst. Je legt niets opnieuw uit, en offertes zijn te vergelijken omdat ze over hetzelfde ontwerp gaan.' },
  { t: 'Je ziet de prijs terwijl je kiest', p: 'Bij de deuren en de gietvloer loopt de prijs mee met je keuzes. Je weet dus wat een andere kleur, een hogere deur of een extra ruimte doet voordat je iets aanvraagt.' },
  { t: 'Alles staat in één huis', p: 'Deur, vloer en kast komen van verschillende makers. In je woning in 3D staan ze bij elkaar, zodat je ziet of het klopt, en per onderdeel hoe ver de offerte is.' },
]

const STAPPEN = [
  { t: 'Tekening', p: 'Upload de plattegrond van je aannemer. Heb je die nog niet, dan begin je met de voorbeeldwoning of vul je de maten zelf in.' },
  { t: 'Ontwerpen', p: 'Gratis en zonder account. Je kiest, ziet het in 3D en ziet wat het kost.' },
  { t: 'Offerte', p: 'Met een gratis account vraag je de offerte aan. Je ontwerp gaat mee, met je maten en de periode waarin het klaar moet zijn.' },
  { t: 'Uitvoering', p: 'Na inmeten of stalen krijg je de definitieve prijs. In je account zie je per onderdeel wat er besteld is en wanneer het komt.' },
]

const FOTO = [
  { naam: 'Gietvloer in je eigen kamer', href: '/gietvloer/#kf-kop' },
  { naam: 'Deur zonder kozijn in je eigen gang', href: '/kozijnloze-deuren/' },
  { naam: 'Kast op je eigen wand', href: '/kasten-op-maat/' },
  { naam: 'Je wanden in een andere kleur', href: '/nieuwbouw-afwerken/schilderwerk/' },
  { naam: 'Je badkamer met andere tegels', href: '/nieuwbouw-afwerken/tegelwerk/' },
]

const VRAGEN = [
  { v: 'Kan ik bij Bylder zelf mijn deuren, kast of vloer ontwerpen?', a: 'Ja. Voor kozijnloze deuren, een kast op maat en een gietvloer is er een eigen ontwerper. Je kiest zelf, ziet het resultaat in 3D en vraagt met dat ontwerp de offerte aan. Voor de badkamer maak je nu al een offerte uit je tekening; de ontwerper in 3D is in de maak.' },
  { v: 'Wat kost zelf ontwerpen?', a: 'Niets. De ontwerpers zijn gratis, ook zonder account. Een account heb je pas nodig als je een offerte aanvraagt of je ontwerpen wilt bewaren in je woning in 3D.' },
  { v: 'Heb ik een bouwtekening nodig?', a: 'Nee, maar het helpt. Met de plattegrond van je aannemer rekenen de ontwerpers met jouw ruimtes, vierkante meters en deuren. Zonder tekening vul je de maten zelf in. Komt je tekening later, dan sluiten je ontwerpen erop aan.' },
  { v: 'Wat gebeurt er met mijn ontwerp nadat ik een offerte aanvraag?', a: 'Bij de deuren maakt Bylder de offerte. Bij een kast op maat en een gietvloer kiezen wij hooguit drie bedrijven die het werk kunnen doen in de periode die je opgeeft. Zij rekenen allemaal op hetzelfde ontwerp, zodat je de offertes naast elkaar kunt leggen.' },
  { v: 'Kan ik meerdere producten tegelijk ontwerpen?', a: 'Ja. Elk ontwerp krijgt zijn eigen offerte. In je woning in 3D staan ze bij elkaar op je eigen plattegrond, zodat je ziet of deur, vloer en kast bij elkaar passen.' },
  { v: 'Kan ik mijn ontwerp nog aanpassen als ik al een offerte heb?', a: 'Ja. Verandert er iets wezenlijks, zoals de maten van een kast, een extra ruimte met gietvloer of een ander groefpatroon op een deur, dan vraag je met één klik een nieuwe offerte aan. De verschillen gaan mee. Een kleine wijziging, zoals een andere kleur, geven we door.' },
  { v: 'Wat is het verschil met de fototools op de site?', a: 'Een fototool laat in je eigen foto zien hoe iets eruit kan zien: een indruk, zonder maten en zonder prijs. In de ontwerper kies je de echte uitvoering, met maten en prijs, en dat ontwerp wordt de offerteaanvraag.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Zelf ontwerpen', item: URL },
    ] },
    { '@type': 'ItemList', name: 'Ontwerpers van Bylder', itemListElement: PRODUCTEN.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.naam, url: `https://www.bylder.com${p.href}` })) },
    { '@type': 'HowTo', name: 'Van tekening naar uitvoering bij Bylder',
      step: STAPPEN.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.p })) },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

export default function OntwerpenPage() {
  const LIJN = `1px solid ${INKT}0.14)`
  const PIJL: React.CSSProperties = { color: GROEN, fontWeight: 800, fontSize: 15.5, textDecoration: 'underline', textUnderlineOffset: 3 }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style dangerouslySetInnerHTML={{ __html:
        '.ow-kop{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:40px;align-items:center}'
        + '.ow-rij{display:grid;grid-template-columns:220px minmax(0,1fr) minmax(0,1fr);gap:28px;padding:26px 0;align-items:start}'
        + '.ow-vier{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 48px}'
        + '.ow-stappen{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;list-style:none;padding:0;margin:0}'
        + '@media(max-width:900px){.ow-kop{grid-template-columns:minmax(0,1fr);gap:18px}.ow-rij{grid-template-columns:120px minmax(0,1fr);gap:16px}.ow-rij>div:last-child{grid-column:1 / -1}.ow-vier{grid-template-columns:minmax(0,1fr)}.ow-stappen{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}'
        + '@media(max-width:520px){.ow-stappen{grid-template-columns:minmax(0,1fr)}}' }} />
      <div style={{ background: '#F5F0E8', color: '#1A1208' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 16px 72px' }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 18px' }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <span aria-current="page">Zelf ontwerpen</span>
          </nav>

          <div className="ow-kop">
            <div>
              <p style={OOG}>Zelf ontwerpen</p>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', textWrap: 'balance', maxWidth: '18ch' }}>
                Ontwerp het zelf, in je eigen woning.
              </h1>
              <p style={{ ...P, fontSize: 18 }}>
                Uit je bouwtekening maken wij je woning in 3D. Daarin ontwerp je je deuren, je kast en je vloer, met jouw
                maten en met de prijs erbij. Dat ontwerp is meteen de offerteaanvraag.
              </p>
              <a href="/mijn-woning/" data-meet="ontwerpen-woning" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, marginTop: 8, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '0 22px', borderRadius: 12, textDecoration: 'none' }}>Zet je woning in 3D</a>
              <p style={{ margin: '14px 0 0' }}><a href="/mijn-woning/?voorbeeld" style={PIJL}>Bekijk eerst de voorbeeldwoning &rarr;</a></p>
            </div>
            <Maquette accent="geen" bijschrift="Voorbeeldwoning, begane grond" />
          </div>

          <h2 style={H2}>Wat je zelf ontwerpt</h2>
          <div style={{ borderBottom: LIJN }}>
            {PRODUCTEN.map(p => (
              <article key={p.naam} className="ow-rij" style={{ borderTop: LIJN }}>
                <a href={p.href} tabIndex={-1} aria-hidden="true" style={{ display: 'block', aspectRatio: '4 / 3', background: '#EDE6D8', borderRadius: 12, overflow: 'hidden' }}>
                  {p.maquette
                    ? <Maquette accent="sanitair" />
                    : <img src={p.img} alt="" width={440} height={330} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </a>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{p.naam}</h3>
                  <p className="maat" style={{ fontSize: 14, color: `${INKT}0.7)`, margin: '0 0 10px' }}>{p.prijs}</p>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, color: `${INKT}0.78)`, margin: 0 }}>{p.wat}</p>
                </div>
                <div>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, color: `${INKT}0.78)`, margin: '0 0 12px' }}><b style={{ color: '#1A1208' }}>Daarna:</b> {p.daarna}</p>
                  <a href={p.href} data-meet={`ontwerpen-${p.naam.toLowerCase().replace(/[^a-z]+/g, '-')}`} style={PIJL}>{p.knop} &rarr;</a>
                  <span style={{ color: `${INKT}0.35)`, margin: '0 10px' }}>·</span>
                  <a href={p.meer} style={{ ...PIJL, fontWeight: 600, color: `${INKT}0.75)` }}>Meer over {p.naam.toLowerCase()}</a>
                </div>
              </article>
            ))}
          </div>

          <h2 style={H2}>Waarom dit anders is dan een showroom of een offertesite</h2>
          <div className="ow-vier">
            {ANDERS.map(x => (
              <div key={x.t} style={{ borderTop: LIJN, padding: '16px 0 10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>{x.t}</h3>
                <p style={{ ...P, fontSize: 15.5, margin: 0 }}>{x.p}</p>
              </div>
            ))}
          </div>

          <h2 style={H2}>Van tekening naar uitvoering</h2>
          <ol className="ow-stappen">
            {STAPPEN.map((s, i) => (
              <li key={s.t} style={{ borderTop: `2px solid #1A1208`, paddingTop: 12 }}>
                <span className="maat" style={{ fontSize: 13, color: ROEST, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0 6px' }}>{s.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: `${INKT}0.78)`, margin: 0 }}>{s.p}</p>
              </li>
            ))}
          </ol>

          <h2 style={H2}>Weet je nog niet wat je wilt? Begin met een foto</h2>
          <p style={P}>
            Met een foto van je eigen kamer zie je in twintig seconden hoe een vloer, een deur, een kast, een wandkleur of
            een tegel er bij jou uit kan zien. Dat is een indruk, zonder maten en zonder prijs. Bevalt het, dan maak je
            het in de ontwerper echt.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px 22px' }}>
            {FOTO.map(f => <li key={f.href}><a href={f.href} style={{ ...PIJL, fontWeight: 600 }}>{f.naam} &rarr;</a></li>)}
          </ul>

          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ maxWidth: 812, borderBottom: LIJN }}>
            {VRAGEN.map(q => (
              <details key={q.v} style={{ borderTop: LIJN, padding: '16px 0' }}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
                <p style={{ ...P, margin: '10px 0 0', fontSize: 15.5 }}>{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
