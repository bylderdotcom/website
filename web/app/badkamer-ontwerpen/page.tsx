import type { Metadata } from 'next'
import Maquette, { MAQUETTE_ALT } from '../components/Maquette'
import BadkamerFoto from '../components/BadkamerFoto'
import { onderdeel, prijsTekst } from '@/lib/afwerken'

// Badkamer zelf ontwerpen (13-11-2026, besluit Daniel): de ingang voor de badkamer onder "Zelf ontwerpen".
// De ontwerper in 3D met echt assortiment bestaat nog niet; deze pagina zegt dat eerlijk en laat zien wat nu al kan:
// badkamer en toilet met maten in je woning in 3D, één offerte uit je tekening, en de badkamerfoto als indruk.
// Geen maten of normen uit de conceptlijst met regels: die zijn nog niet door een vakman nagekeken.

const URL = 'https://www.bylder.com/badkamer-ontwerpen/'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const LIJN = `1px solid ${INKT}0.14)`
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '56px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' }
const OOG: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700, margin: '0 0 8px' }
const PIJL: React.CSSProperties = { color: GROEN, fontWeight: 800, fontSize: 15.5, textDecoration: 'underline', textUnderlineOffset: 3 }
const AANVRAAG = '/nieuwbouw-afwerken/sanitair/#aanvraag'

const san = onderdeel('sanitair')
const PRIJS = san?.prijs ? prijsTekst(san.prijs) : ''

export const metadata: Metadata = {
  title: 'Badkamer zelf ontwerpen uit je bouwtekening | Bylder',
  description: 'Je badkamer en toilet met maten in je woning in 3D, en één offerte uit je tekening met tegels, sanitair en werk apart. De ontwerper in 3D met echt assortiment is in de maak.',
  alternates: { canonical: URL },
  openGraph: { title: 'Badkamer zelf ontwerpen uit je bouwtekening', description: 'Badkamer en toilet uit je tekening, in één offerte. De ontwerper in 3D volgt.', url: URL, type: 'website', images: [{ url: 'https://www.bylder.com/img/og/afwerken-sanitair.jpg', width: 1200, height: 630, alt: MAQUETTE_ALT.sanitair }] },
}

const NU = [
  { t: 'Je badkamer in 3D, met maten', p: 'Upload de plattegrond van je aannemer. Badkamer en toilet staan in je woning in 3D, met de afmetingen uit de tekening.', href: '/mijn-woning/', knop: 'Zet je woning in 3D' },
  { t: 'Eén offerte uit je tekening', p: 'Wij rekenen badkamer en toilet uit: tegels, sanitair en werk elk op een eigen regel. Bylder neemt de opdracht aan en je betaalt de prijs in de offerte.', href: AANVRAAG, knop: 'Vraag een offerte aan' },
  { t: 'Een indruk in je eigen foto', p: 'Met een foto van je huidige badkamer zie je hoe andere tegels en nieuw sanitair eruit kunnen zien. Een indruk, zonder maten en prijs.', href: '#bf-kop', knop: 'Probeer het met een foto' },
]

const STRAKS = [
  'Je begint in je eigen badkamer uit de tekening, met de afvoeren en leidingen op hun plek. Je tekent geen muren.',
  'Je plaatst douche, bad, toilet en wastafel, en ziet meteen of het past: de deur die open moet kunnen, de ruimte voor het toilet, de afstand tot de afvoer.',
  'Je kiest tegels en sanitair uit een assortiment dat te koop is, met de prijs erbij.',
  'Je ziet hoeveel tegels je nodig hebt, inclusief snijverlies.',
  'Je ontwerp wordt de offerte. Een vakman kijkt het na voordat er iets wordt besteld of uitgevoerd.',
]

const AANNEMER = [
  'Tot welke datum kun je de plek van afvoeren, waterleidingen en stopcontacten nog laten aanpassen?',
  'Zit er een standaardbadkamer in de koopsom, en wat krijg je terug als je casco laat opleveren?',
  'Blijft de garantie van de aannemer op leidingen en vloer gelden als een ander de badkamer afwerkt?',
  'Hoe dik is de dekvloer, en ligt er vloerverwarming in de badkamer?',
  'In welke wanden lopen leidingen, en welke wanden zijn dragend of woningscheidend?',
  'Welke warmwaterinstallatie komt er, en hoe groot is het boilervat?',
]

const VRAGEN = [
  { v: 'Kan ik mijn badkamer bij Bylder zelf in 3D ontwerpen?', a: 'Nog niet helemaal. Je badkamer en toilet staan nu al met maten in je woning in 3D, en je vraagt uit je tekening één offerte aan. De ontwerper waarin je zelf sanitair en tegels plaatst uit een echt assortiment, is in de maak.' },
  { v: 'Wat kost een badkamer in een nieuwbouwwoning?', a: `Als indicatie ${PRIJS} (Bylder-prijsbenchmark, 2026), afhankelijk van grootte, tegels en sanitair. In je offerte staat elk onderdeel apart, zodat je ziet waar het geld heen gaat.` },
  { v: 'Moet ik de badkamer van de aannemer laten vervallen?', a: 'Dat hangt af van wat er standaard in zit en wat je terugkrijgt als je casco laat opleveren. Vraag beide bedragen op bij je aannemer, en ook tot welke datum je nog kunt kiezen. Wij rekenen in de offerte met het bedrag dat je terugkrijgt.' },
  { v: 'Kan ik afvoeren en leidingen nog verplaatsen?', a: 'Bij nieuwbouw alleen via je aannemer en alleen vóór de sluitingsdatum voor meerwerk. Daarna liggen de leidingen vast. Begin daarom op tijd: de indeling van je badkamer bepaalt waar de aansluitpunten moeten komen.' },
  { v: 'Wat is het verschil tussen de badkamerfoto en de offerte?', a: 'De foto laat in je eigen badkamer zien hoe andere tegels of nieuw sanitair eruit kunnen zien: een indruk, zonder maten en zonder prijs. In de offerte meten wij badkamer en toilet uit je tekening en staan tegels, sanitair en werk elk apart.' },
  { v: 'Werkt dit ook voor een bestaande woning?', a: 'Ja. De offerte kan ook voor bestaande bouw en renovatie. Het aanvraagformulier vraagt wat voor woning het is. Zonder bouwtekening geef je de maten van de badkamer zelf door.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Zelf ontwerpen', item: 'https://www.bylder.com/ontwerpen/' },
      { '@type': 'ListItem', position: 3, name: 'Badkamer', item: URL },
    ] },
    { '@type': 'WebPage', name: 'Badkamer zelf ontwerpen uit je bouwtekening', url: URL, inLanguage: 'nl-NL', dateModified: '2026-11-13',
      publisher: { '@type': 'Organization', name: 'Bylder', url: 'https://www.bylder.com/' } },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

export default function BadkamerOntwerpenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style dangerouslySetInnerHTML={{ __html:
        '.bo-kop{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:40px;align-items:center}'
        + '.bo-drie{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}'
        + '.bo-twee{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px}'
        + '@media(max-width:900px){.bo-kop{grid-template-columns:minmax(0,1fr);gap:18px}.bo-drie,.bo-twee{grid-template-columns:minmax(0,1fr);gap:8px}}' }} />
      <div style={{ background: '#F5F0E8', color: '#1A1208' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 16px 72px' }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 18px' }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <a href="/ontwerpen/" style={{ color: 'inherit' }}>Zelf ontwerpen</a> / <span aria-current="page">Badkamer</span>
          </nav>

          <div className="bo-kop">
            <div>
              <p style={OOG}>Zelf ontwerpen · badkamer</p>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', textWrap: 'balance', maxWidth: '17ch' }}>
                Je badkamer, uit je eigen tekening.
              </h1>
              <p style={{ ...P, fontSize: 18 }}>
                Badkamer en toilet staan met hun maten in je woning in 3D. Uit die tekening maken wij één offerte, met
                tegels, sanitair en werk elk apart. De ontwerper waarin je zelf alles plaatst, is in de maak.
              </p>
              <p className="maat" style={{ fontSize: 15, color: `${INKT}0.75)`, margin: '0 0 16px' }}>Indicatie {PRIJS}</p>
              <a href={AANVRAAG} data-meet="badkamer-ontwerpen-offerte" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '0 22px', borderRadius: 12, textDecoration: 'none' }}>Vraag een offerte aan</a>
              <p style={{ margin: '14px 0 0' }}><a href="/mijn-woning/" style={PIJL}>Zet eerst je woning in 3D &rarr;</a></p>
            </div>
            <Maquette accent="sanitair" bijschrift="Voorbeeldwoning, verdieping met badkamer" />
          </div>

          <h2 style={H2}>Wat nu al kan</h2>
          <div className="bo-drie">
            {NU.map(x => (
              <div key={x.t} style={{ borderTop: '2px solid #1A1208', paddingTop: 14 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px' }}>{x.t}</h3>
                <p style={{ ...P, fontSize: 15.5 }}>{x.p}</p>
                <a href={x.href} style={PIJL}>{x.knop} &rarr;</a>
              </div>
            ))}
          </div>

          <div className="bo-twee">
            <div>
              <h2 style={H2}>Wat de ontwerper straks doet</h2>
              <p style={P}>Een showroom tekent je badkamer voor je in. Wij bouwen een ontwerper waarmee je het zelf doet, met de kennis van een vakman erin.</p>
              <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
                {STRAKS.map(x => <li key={x} style={{ ...P, margin: '0 0 8px', fontSize: 15.5 }}>{x}</li>)}
              </ol>
            </div>
            <div>
              <h2 style={H2}>Zes vragen voor je aannemer</h2>
              <p style={P}>Stel ze voordat je iets kiest. De antwoorden bepalen wat er in je badkamer nog kan.</p>
              <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
                {AANNEMER.map(x => <li key={x} style={{ ...P, margin: '0 0 8px', fontSize: 15.5 }}>{x}</li>)}
              </ol>
            </div>
          </div>

          <div style={{ marginTop: 56, borderTop: LIJN, paddingTop: 8 }}>
            <BadkamerFoto onderdeel="sanitair" />
          </div>

          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ maxWidth: 812, borderBottom: LIJN }}>
            {VRAGEN.map(q => (
              <details key={q.v} style={{ borderTop: LIJN, padding: '16px 0' }}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
                <p style={{ ...P, margin: '10px 0 0', fontSize: 15.5 }}>{q.a}</p>
              </details>
            ))}
          </div>

          <p style={{ ...P, marginTop: 40 }}>
            Ook zelf ontwerpen: <a href="/kozijnloze-deuren/configurator/" style={PIJL}>kozijnloze deuren</a>, <a href="/kasten-op-maat/ontwerpen/" style={PIJL}>kast op maat</a> en <a href="/gietvloer/ontwerpen/" style={PIJL}>gietvloer</a>. Of bekijk <a href="/nieuwbouw-afwerken/" style={PIJL}>de hele afwerking in één offerte</a>.
          </p>
        </div>
      </div>
    </>
  )
}
