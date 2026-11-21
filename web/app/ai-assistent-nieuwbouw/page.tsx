import type { Metadata } from 'next'
import Maquette from '../components/Maquette'

// Bylder regelt: de assistent die je nieuwbouwwoning kent (19-11-2026, besluit Daniel).
// De propositiepagina bij de agent in de app (app /dashboard/woningdossier, src/lib/agent/).
// Alles wat hier staat, kan de agent vandaag (rekenen met onze prijzen sinds 19-11-2026). Wat nog komt staat apart, zonder datum.
// Hij noemt zich niet onafhankelijk en er staat niet waar Bylder aan verdient (besluiten Daniel).
// Het voorbeeldgesprek noemt geen prijzen: de agent noemt alleen prijzen uit onze eigen gegevens.

const URL = 'https://www.bylder.com/ai-assistent-nieuwbouw/'
const APP = 'https://app.bylder.com/dashboard/woningdossier?utm_source=bylder-site&utm_campaign=bylder-regelt'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const LIJN = `1px solid ${INKT}0.14)`
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '56px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' }
const OOG: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700, margin: '0 0 8px' }
const PIJL: React.CSSProperties = { color: GROEN, fontWeight: 800, fontSize: 15.5, textDecoration: 'underline', textUnderlineOffset: 3 }

export const metadata: Metadata = {
  title: 'AI-assistent voor je nieuwbouwwoning: Bylder regelt | Bylder',
  description: 'Een AI-assistent die je nieuwbouwwoning kent: je ruimtes, vierkante meters, deuren en opleverdatum. Hij zoekt uit wat er te regelen is en zet het klaar; jij keurt goed. Ook voor verbouwen en renoveren. Gratis.',
  alternates: { canonical: URL },
  openGraph: { title: 'Bylder regelt: de assistent die je nieuwbouwwoning kent', description: 'Hij kent je woning uit je bouwtekening, zet offertes en ontwerpen klaar, en jij keurt goed.', url: URL, type: 'website', images: [{ url: 'https://www.bylder.com/img/og/mijn-woning.jpg', width: 1200, height: 630, alt: 'Voorbeeldwoning als maquette, van bovenaf' }] },
}

const DOET = [
  { t: 'Hij kent je woning', p: 'Je uploadt de plattegrond van je aannemer. Daarna weet hij je verdiepingen, elke ruimte met vierkante meters, je aantal deuren en je opleverdatum. Je hoeft niets opnieuw uit te leggen.' },
  { t: 'Hij zegt wat nu aan de beurt is', p: 'Nieuwbouw heeft een harde klok: contract, sluitingsdatum voor meerwerk, oplevering. Hij zet op een rij wat je nu moet beslissen, wat binnenkort en wat later kan.' },
  { t: 'Hij loopt je meerwerk na', p: 'Per onderdeel hoor je of je het beter via de bouwer regelt of na de oplevering, met de marktprijs erbij. Constructief werk en leidingen horen bij de bouwer; afwerking kan vaak daarna.' },
  { t: 'Hij rekent met jouw aantallen', p: 'Wat kosten je deuren, je gietvloer of je tegelvloer ongeveer? Hij rekent met onze prijzen en met de aantallen uit je tekening, en zegt erbij wat er niet in zit. Voor de rest van de afwerking geeft hij de marktprijs.' },
  { t: 'Hij zet de offerte klaar', p: 'Wil je stucwerk, tegelwerk, een badkamer, vloeren, deuren, schilderwerk of kasten laten doen? Hij maakt de aanvraag met jouw onderdelen en je woonoppervlakte. Jij keurt goed, dan is hij verstuurd.' },
  { t: 'Hij wijst je de juiste ontwerper', p: 'Voor kozijnloze deuren, een kast op maat of een gietvloer opent hij de ontwerper waarin je het zelf samenstelt, met de maten uit je tekening.' },
  { t: 'Hij onthoudt wat loopt', p: 'Hij ziet welke aanvragen je al hebt gedaan en hoe ver ze zijn. Hij stelt niet voor wat je al geregeld hebt.' },
]

const GRENZEN = [
  { t: 'Hij voert niets uit zonder jou', p: 'Hij legt een voorstel neer als kaart. Er gebeurt pas iets als jij op goedkeuren drukt. Een aanvraag versturen kan alleen jij.' },
  { t: 'Hij verzint geen prijzen', p: 'Hij noemt alleen bedragen die uit onze eigen gegevens komen, als bandbreedte, en zegt of het onze prijs is of een marktindicatie. De definitieve prijs staat in de ontwerper of in de offerte.' },
  { t: 'Hij is van Bylder', p: 'Hij stelt voor wat Bylder voor je kan doen. Elke offerte kun je naast een andere leggen. Een offerte aanvragen is gratis, en je zit nergens aan vast tot je tekent.' },
  { t: 'Hij zegt wat hij niet kan', p: 'Kan hij iets niet, dan zegt hij dat en geeft hij het door aan ons. Zo weten wij wat er ontbreekt.' },
]

const STRAKS = [
  'Deadlines bewaken en er zelf over beginnen, bijvoorbeeld drie weken voor de sluitingsdatum van je meerwerk.',
  'De keuzelijst van je aannemer inlezen en per regel zeggen: nu via de bouwer of later.',
]

const VRAGEN = [
  { v: 'Wat is Bylder regelt?', a: 'Een AI-assistent in je Bylder-account die je nieuwbouwwoning kent. Hij leest je woning uit je bouwtekening, zoekt uit wat er te regelen is en zet het klaar als voorstel. Jij keurt goed of wijst af.' },
  { v: 'Wat kost het?', a: 'Niets. De assistent is gratis voor bewoners. Je hebt een gratis account nodig, zodat hij je woning en je aanvragen kan onthouden. Inloggen kan met Google of met een link in je mail, zonder wachtwoord.' },
  { v: 'Wat is het verschil met ChatGPT of een andere algemene AI?', a: 'Een algemene AI kent je woning niet en kan niets voor je regelen. Bylder regelt werkt met jouw tekening, jouw opleverdatum en onze eigen gegevens over meerwerk en afwerking, en kan een offerteaanvraag voor je klaarzetten die jij met één knop verstuurt.' },
  { v: 'Kan de assistent zelf iets bestellen of aanvragen?', a: 'Nee. Hij zet een voorstel klaar en jij beslist. Pas als je een voorstel voor een offerte goedkeurt, wordt de aanvraag verstuurd. Daarna krijg je een bevestiging per mail en neemt Bylder binnen twee werkdagen contact met je op.' },
  { v: 'Is het advies onafhankelijk?', a: 'De assistent is van Bylder en stelt voor wat Bylder voor je kan doen: de afwerking, de ontwerpers en de winkel. Voor de rest zoekt hij vakbedrijven in de gids. Elke offerte kun je naast een andere leggen; dat raden we ook aan.' },
  { v: 'Heb ik een bouwtekening nodig?', a: 'Nee, maar hij werkt er veel beter mee. Met de plattegrond van je aannemer kent hij je ruimtes en vierkante meters. Zonder tekening kun je vragen stellen over meerwerk en planning, en stelt hij voor de tekening later toe te voegen.' },
  { v: 'Wat gebeurt er met mijn gegevens?', a: 'Om te antwoorden gaan je vraag en de gegevens uit je woningdossier naar het AI-model. Je tekening en je aanvragen staan in je eigen account. Hoe we met gegevens omgaan staat in het privacybeleid.' },
  { v: 'Werkt het ook voor een bestaande woning of een renovatie?', a: 'Ja. De assistent vraagt dan naar bouwjaar, energielabel en eerdere verbouwingen, en bepaalt bij een renovatie eerst de volgorde. Het advies over meerwerk is er alleen voor nieuwbouw.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Bylder regelt', item: URL },
    ] },
    { '@type': 'SoftwareApplication', name: 'Bylder regelt', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web',
      description: 'AI-assistent die een nieuwbouwwoning kent uit de bouwtekening, uitzoekt wat er te regelen is en offertes en ontwerpen klaarzet. De koper keurt goed.',
      url: URL, inLanguage: 'nl-NL', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      publisher: { '@type': 'Organization', name: 'Bylder', url: 'https://www.bylder.com/' } },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

// Een voorbeeldgesprek, getekend zoals het scherm in de app eruitziet: een vraag en twee kaarten.
function Voorbeeld() {
  const kaart: React.CSSProperties = { background: '#fff', border: LIJN, borderLeft: `3px solid ${ROEST}`, borderRadius: 6, padding: '13px 15px 14px' }
  const label: React.CSSProperties = { fontFamily: "'Space Mono',monospace", fontSize: 11.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: GROEN }
  const knop: React.CSSProperties = { display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 700, padding: '7px 12px', borderRadius: 4, background: ROEST, color: '#FFF6EE' }
  return (
    <figure style={{ margin: 0 }} aria-label="Voorbeeld van een gesprek met Bylder regelt">
      <div style={{ background: '#EFE8DA', borderRadius: 16, padding: 18, display: 'grid', gap: 12 }}>
        <p style={{ margin: 0, justifySelf: 'end', maxWidth: '82%', background: '#1A1208', color: '#F5F0E8', borderRadius: '14px 14px 4px 14px', padding: '10px 14px', fontSize: 14.5, lineHeight: 1.5 }}>
          Wat moet ik regelen voor de oplevering?
        </p>
        <p style={{ margin: 0, maxWidth: '92%', fontSize: 14.5, lineHeight: 1.6, color: '#1A1208' }}>
          Je woning heeft twee verdiepingen en zeven binnendeuren. Je meerwerk sluit eerder dan je oplevering, dus dat gaat voor. Ik heb twee dingen klaargezet.
        </p>
        <div style={kaart}>
          <span style={label}>Offerte van Bylder</span>
          <p style={{ margin: '6px 0 2px', fontSize: 15, fontWeight: 700, color: '#1A1208' }}>Stucwerk, tegelwerk en badkamer</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: `${INKT}0.7)` }}>Eén offerte uit je tekening, met je woonoppervlakte erbij.</p>
          <span style={knop}>Goedkeuren en versturen</span>
        </div>
        <div style={kaart}>
          <span style={label}>Ontwerp</span>
          <p style={{ margin: '6px 0 2px', fontSize: 15, fontWeight: 700, color: '#1A1208' }}>Stel je zeven deuren samen</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: `${INKT}0.7)` }}>Kozijnloze deuren gaan vóór het stucwerk de wand in.</p>
          <span style={{ ...knop, background: 'none', color: GROEN, padding: '7px 0', textDecoration: 'underline' }}>Kozijnloze deuren samenstellen →</span>
        </div>
      </div>
      <figcaption className="maat" style={{ fontSize: 13, color: `${INKT}0.6)`, marginTop: 8 }}>Voorbeeld, met de voorbeeldwoning</figcaption>
    </figure>
  )
}

export default function BylderRegeltPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style dangerouslySetInnerHTML={{ __html:
        '.br-kop{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:44px;align-items:center}'
        + '.br-drie{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 36px}'
        + '.br-twee{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 48px}'
        + '.br-naast{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:44px;align-items:center}'
        + '@media(max-width:900px){.br-kop,.br-naast{grid-template-columns:minmax(0,1fr);gap:20px}.br-drie,.br-twee{grid-template-columns:minmax(0,1fr)}}' }} />
      <div style={{ background: '#F5F0E8', color: '#1A1208' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 16px 72px' }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 18px' }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <span aria-current="page">Bylder regelt</span>
          </nav>

          <div className="br-kop">
            <div>
              <p style={OOG}>Bylder regelt · AI-assistent voor nieuwbouw</p>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', textWrap: 'balance', maxWidth: '17ch' }}>
                Een assistent die je nieuwbouwwoning kent.
              </h1>
              <p style={{ ...P, fontSize: 18 }}>
                Hij leest je woning uit je bouwtekening: je ruimtes, je vierkante meters, je deuren en je opleverdatum.
                Jij zegt wat je wilt. Hij zoekt het uit en zet het klaar. Jij keurt goed.
              </p>
              <p className="maat" style={{ fontSize: 15, color: `${INKT}0.75)`, margin: '0 0 16px' }}>Gratis voor bewoners</p>
              <a href={APP} data-meet="bylder-regelt-start" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '0 22px', borderRadius: 12, textDecoration: 'none' }}>Vraag het Bylder</a>
              <p style={{ margin: '14px 0 0' }}><a href="/mijn-woning/" style={PIJL}>Zet eerst je woning in 3D &rarr;</a></p>
            </div>
            <Voorbeeld />
          </div>

          <h2 style={H2}>Wat hij voor je doet</h2>
          <div className="br-drie">
            {DOET.map(x => (
              <div key={x.t} style={{ borderTop: LIJN, padding: '16px 0 10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>{x.t}</h3>
                <p style={{ ...P, fontSize: 15.5, margin: 0 }}>{x.p}</p>
              </div>
            ))}
          </div>

          <div className="br-naast" style={{ marginTop: 56 }}>
            <div>
              <h2 style={{ ...H2, marginTop: 0 }}>Waarom hij je woning moet kennen</h2>
              <p style={P}>
                Een algemene AI geeft een algemeen antwoord. Wat een badkamer kost, hangt af van jouw badkamer. Wanneer
                je moet beslissen, hangt af van jouw sluitingsdatum. Hoeveel deuren je bestelt, staat in jouw tekening.
              </p>
              <p style={P}>
                Daarom begint Bylder regelt bij de plattegrond van je aannemer. Wij lezen de verdiepingen, de ruimtes en
                de deuren eruit en bouwen je woning na in 3D. Alles wat hij daarna voorstelt, rekent met die woning.
              </p>
              <a href="/mijn-woning/?voorbeeld" style={PIJL}>Bekijk de voorbeeldwoning in 3D &rarr;</a>
            </div>
            <Maquette accent="geen" bijschrift="Voorbeeldwoning, begane grond" />
          </div>

          <h2 style={H2}>Ook voor een woning die je verbouwt of renoveert</h2>
          <div className="br-twee">
            <div style={{ borderTop: LIJN, padding: '16px 0 10px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Bestaande woning</h3>
              <p style={{ ...P, fontSize: 15.5, margin: 0 }}>Hij begint bij de staat van het huis: bouwjaar, energielabel en wat er al verbouwd is. Heb je een plattegrond, dan leest hij die net zo in als een bouwtekening. Zonder plattegrond geef je de maten zelf door.</p>
            </div>
            <div style={{ borderTop: LIJN, padding: '16px 0 10px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Renovatie</h3>
              <p style={{ ...P, fontSize: 15.5, margin: 0 }}>Hij zet eerst de volgorde op een rij: casco, dan installaties, dan afbouw. De offerte voor de afwerking werkt hetzelfde als bij nieuwbouw. Het advies over meerwerk is er alleen voor nieuwbouw.</p>
            </div>
          </div>

          <h2 style={H2}>Wat hij niet doet</h2>
          <div className="br-twee">
            {GRENZEN.map(x => (
              <div key={x.t} style={{ borderTop: '2px solid #1A1208', padding: '14px 0 10px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>{x.t}</h3>
                <p style={{ ...P, fontSize: 15.5, margin: 0 }}>{x.p}</p>
              </div>
            ))}
          </div>

          <h2 style={H2}>Wat eraan komt</h2>
          <p style={P}>Dit kan hij nog niet. We bouwen het in deze volgorde.</p>
          <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
            {STRAKS.map(x => <li key={x} style={{ ...P, margin: '0 0 8px', fontSize: 15.5 }}>{x}</li>)}
          </ol>

          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ maxWidth: 812, borderBottom: LIJN }}>
            {VRAGEN.map(q => (
              <details key={q.v} style={{ borderTop: LIJN, padding: '16px 0' }}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
                <p style={{ ...P, margin: '10px 0 0', fontSize: 15.5 }}>{q.a}{q.v.startsWith('Wat gebeurt er met mijn gegevens') && <> <a href="/privacy/" style={{ color: GROEN }}>Lees het privacybeleid</a>.</>}</p>
              </details>
            ))}
          </div>

          <p style={{ ...P, marginTop: 40 }}>
            Liever zelf aan de slag? <a href="/ontwerpen/" style={PIJL}>Zelf ontwerpen</a>, <a href="/nieuwbouw-afwerken/" style={PIJL}>de afwerking in één offerte</a> of <a href="/kopersbegeleiding/sluitingsdata-meerwerk-deadlines/" style={PIJL}>de deadlines van je meerwerk</a>.
          </p>
        </div>
      </div>
    </>
  )
}
