import type { Metadata } from 'next'
import { ONDERDELEN, VOLGORDE, URL_AFWERKEN, prijsTekst } from '@/lib/afwerken'
import AfwerkAanvraag from '../components/AfwerkAanvraag'
import { Stijl as S, Lijn } from './stijl'

/**
 * /nieuwbouw-afwerken/ — Bylder als hoofdaannemer voor de afwerking van een nieuwbouwwoning
 * (besluit Daniel, 28-10-2026). Eén offerte, één contract, één planning; het werk doen
 * vakbedrijven uit de regio als onderaannemer. Landelijk.
 *
 * Inhoud: web/lib/afwerken.ts. Het FAQ-schema herhaalt alleen wat zichtbaar op de pagina staat.
 * Geen claims over garantie of verzekering op de pagina zolang die niet zijn vastgelegd.
 */

export const metadata: Metadata = {
  title: 'Nieuwbouw laten afwerken in één offerte | Bylder',
  description:
    'Stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten in één offerte uit je tekening. '
    + 'Bylder neemt de opdracht aan; vakbedrijven bij jou in de buurt voeren uit.',
  alternates: { canonical: URL_AFWERKEN },
  openGraph: { title: 'Je nieuwbouwhuis afgewerkt, in één offerte', url: URL_AFWERKEN, type: 'website',
    description: 'Van stucwerk tot kasten: één offerte uit je eigen tekening, één planning en één aanspreekpunt.' },
}

const VRAGEN = [
  { v: 'Wie neemt de opdracht aan?', a: 'Bylder. Je sluit één overeenkomst met Bylder voor alles wat je laat doen. Het werk doen vakbedrijven die wij selecteren, inplannen en controleren. Bij elk onderdeel in de offerte staat welk bedrijf het uitvoert.' },
  { v: 'Waarom één offerte in plaats van losse vakbedrijven?', a: 'Omdat de afwerking een volgorde heeft. De stukadoor moet weg voordat de tegelzetter komt, en de vloer komt pas als de schilder klaar is. Met losse bedrijven regel jij die planning zelf. Bij ons heb je één planning, één aanspreekpunt en één prijs.' },
  { v: 'Hoe kunnen jullie een offerte maken zonder eerst te meten?', a: 'We halen de maten uit je tekening: vierkante meters vloer, wand en plafond per ruimte, het aantal deuren en waar de badkamer zit. Daarmee maken we de offerte. Voordat we beginnen, meten we wel in, zodat er niets wordt gemaakt op een maat die niet klopt.' },
  { v: 'Waar werken jullie?', a: 'In heel Nederland. Laat je aanvraag achter met de plaats van je woning; we maken je offerte met vakbedrijven bij jou in de buurt.' },
  { v: 'Welke btw geldt?', a: 'Bij de afwerking van een nieuwbouwwoning rekent iedere aannemer 21% btw. Het lage tarief geldt alleen voor arbeid aan woningen die ouder zijn dan twee jaar. Onze bedragen zijn inclusief btw.' },
  { v: 'Kan ik ook één onderdeel laten doen?', a: 'Ja. Vink in de aanvraag aan wat je wilt. Wil je alleen een vloer of alleen een badkamer, dan maken we daar een offerte voor.' },
  { v: 'Kan ik jullie offerte laten checken?', a: 'Ja. Onze offerte-check vergelijkt elke offerte met marktprijzen, ook die van onszelf. Zo zie je of je een eerlijke prijs betaalt.' },
]

export default function NieuwbouwAfwerkenPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Afwerking van een nieuwbouwwoning', serviceType: 'Afbouw en afwerking nieuwbouw',
      provider: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' },
      areaServed: { '@type': 'Country', name: 'Nederland' }, url: URL_AFWERKEN,
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Onderdelen', itemListElement: ONDERDELEN.map(o => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.naam, url: `${URL_AFWERKEN}${o.slug}/` } })) } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Nieuwbouw laten afwerken', item: URL_AFWERKEN }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › Nieuwbouw laten afwerken</nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Bylder als aannemer</p>
          <h1 style={S.h1}>Je nieuwbouwhuis afgewerkt, in één offerte.</h1>
          <p style={S.lead}>
            Stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten. Wij maken de offerte uit je eigen
            tekening, plannen alles in de goede volgorde en zijn je enige aanspreekpunt. Het werk doen vakbedrijven
            bij jou in de buurt.
          </p>
          <ul style={S.vinkjes}>
            {['Eén prijs voor alles, berekend uit je tekening', 'Eén planning vanaf je opleverdatum', 'Eén aanspreekpunt, van stukadoor tot timmerman'].map(t => (
              <li key={t} style={S.vinkje}><Lijn d="M5 12l5 5 9-10" /> {t}</li>
            ))}
          </ul>
          <a href="#aanvraag" style={S.knop}>Vraag je offerte aan</a>
        </div>
        <aside aria-label="Wat het kost" style={S.prijsKaart}>
          <p style={{ ...S.oog, margin: '0 0 12px' }}>Indicatie per onderdeel</p>
          <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
            {ONDERDELEN.filter(o => o.prijs).map(o => (
              <div key={o.slug} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14.5, borderBottom: '1px solid rgba(61,46,30,0.08)', paddingBottom: 8 }}>
                <dt style={{ fontWeight: 700 }}>{o.naam}</dt><dd style={{ margin: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{prijsTekst(o.prijs!)}</dd>
              </div>
            ))}
          </dl>
          <p style={{ fontSize: 12.5, color: 'rgba(61,46,30,0.6)', margin: '12px 0 0', lineHeight: 1.5 }}>
            Inclusief btw, uit de Bylder-prijsbenchmark (2026). Je echte prijs staat in je offerte, met de maten uit je tekening.
          </p>
        </aside>
      </div>

      <h2 style={S.h2}>Wat we voor je afwerken</h2>
      <ul style={S.raster}>
        {ONDERDELEN.map(o => (
          <li key={o.slug}>
            <a href={`/nieuwbouw-afwerken/${o.slug}/`} style={S.kaartLink}>
              <span style={{ fontWeight: 800, fontSize: 16.5, color: '#1A1208' }}>{o.naam}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.55, color: 'rgba(61,46,30,0.75)' }}>{o.kort}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#3D5A3E', marginTop: 'auto' }}>{o.prijs ? prijsTekst(o.prijs) : 'Prijs in de offerte'} →</span>
            </a>
          </li>
        ))}
      </ul>

      <h2 style={S.h2}>Zo plannen we de afbouw</h2>
      <p style={S.p}>De afwerking heeft een vaste volgorde. Wie die zelf regelt, wacht op de een of betaalt de ander dubbel. Wij plannen vanaf je opleverdatum:</p>
      <ol style={S.stappen}>
        {VOLGORDE.map((s, i) => (
          <li key={s.stap} style={S.stap}>
            <span aria-hidden="true" style={S.nummer}>{i + 1}</span>
            <div><strong style={{ display: 'block', fontSize: 15.5, color: '#1A1208' }}>{s.stap}</strong><span style={{ fontSize: 14.5, color: 'rgba(61,46,30,0.75)' }}>{s.tekst}</span></div>
          </li>
        ))}
      </ol>

      <h2 style={S.h2}>Waarom wij de offerte kunnen maken uit je tekening</h2>
      <p style={S.p}>
        Een gewone aannemer komt eerst meten en stuurt weken later een prijs. Wij lezen je verkooptekening al uit voor
        je woning in 3D: de vierkante meters vloer, wand en plafond per ruimte, het aantal deuren en waar de badkamer
        zit. Kies je je deuren, gietvloer of kast in onze ontwerpers, dan staan die er met maat en kleur in. Zo weten
        de vakbedrijven precies wat ze moeten maken, en staat alles in één offerte.
      </p>
      <p style={S.p}><a href="/mijn-woning/" style={S.link}>Zet je tekening in Mijn woning</a> · <a href="/kozijnloze-deuren/configurator/" style={S.link}>Deuren samenstellen</a> · <a href="/gietvloer/ontwerpen/" style={S.link}>Gietvloer kiezen</a> · <a href="/kasten-op-maat/ontwerpen/" style={S.link}>Kast ontwerpen</a></p>

      <h2 style={S.h2}>Wie het werk doet</h2>
      <p style={S.p}>
        Bylder neemt de opdracht aan, maar heeft geen eigen ploegen. Het werk doen vakbedrijven uit de regio: de
        stukadoor, de tegelzetter, de vloerenlegger, de schilder en het timmerbedrijf. Wij kiezen ze, plannen ze in en
        controleren het werk. In je offerte staat bij elk onderdeel wie het uitvoert. Ken je zelf een goed bedrijf, dan
        kan dat ook: noem het in je aanvraag.
      </p>
      <p style={S.p}>Ben je zelf vakbedrijf? <a href="/uitvoerder-worden/" style={S.link}>Word uitvoerder bij Bylder →</a></p>

      <section id="aanvraag" aria-labelledby="aanvraag-kop" style={S.aanvraag}>
        <h2 id="aanvraag-kop" style={{ ...S.h2, margin: '0 0 8px' }}>Vraag je offerte aan</h2>
        <p style={{ ...S.p, margin: '0 0 18px' }}>Gratis en vrijblijvend. We nemen binnen twee werkdagen contact met je op.</p>
        <AfwerkAanvraag onderdelen={ONDERDELEN.map(o => ({ slug: o.slug, naam: o.naam }))} gekozen={ONDERDELEN.map(o => o.slug)} bron="nieuwbouw-afwerken" />
      </section>

      <h2 style={S.h2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={S.vraag}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16 }}>{q.v}</summary>
            <p style={{ ...S.p, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
