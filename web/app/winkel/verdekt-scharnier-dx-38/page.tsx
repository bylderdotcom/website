import type { Metadata } from 'next'
import ScharnierBestel from './ScharnierBestel'
import BestelMoment from '../BestelMoment'
import Vinkje from '../Vinkje'
import { PLINT, SCHARNIER } from '@/lib/winkel'
import { S, GROEN } from '../stijl'

/**
 * Winkel: het verdekte scharnier Basys DX-38 Design (31-10-2026), uit het assortiment van Dutch Doors
 * Company (Classic Next). Gegevens uit hun productblad; foto's van de leverancier.
 */

const URL = 'https://www.bylder.com/winkel/verdekt-scharnier-dx-38/'

export const metadata: Metadata = {
  title: 'Verdekt scharnier Basys DX-38 Design bestellen | Bylder',
  description: 'Verborgen scharnier voor kozijnloze en strakke binnendeuren. Tot 80 kg per set, in drie richtingen verstelbaar, met magnetische afdekplaatjes. Duitse productie.',
  alternates: { canonical: URL },
  openGraph: { title: 'Verdekt scharnier Basys DX-38 Design', url: URL, type: 'website', images: ['https://www.bylder.com/img/winkel/dx38.webp'],
    description: 'Verborgen scharnier tot 80 kg per set, 3D verstelbaar.' },
}

const VRAGEN = [
  { v: 'Hoeveel scharnieren per deur?', a: `${SCHARNIER.perDeur} bij een deur tot 231,5 cm hoog. Is de deur hoger of kamerhoog, dan zijn het er ${SCHARNIER.perDeurHoog}. Een set draagt deuren tot ${SCHARNIER.draagvermogenKg} kg.` },
  { v: 'Past het in elk kozijn?', a: `Het past op deuren vanaf ${SCHARNIER.deurdikteMm} mm dik, ook in een bestaand houten kozijn. Het scharnier wordt verdekt in deur en kozijn gefreesd; kozijnloze kozijnen worden voorgefreesd geleverd. Freest je timmerman zelf, dan is er een freesmal bij te bestellen.` },
  { v: 'Wat kost het?', a: 'De prijs per scharnier staat bij Bestellen, inclusief btw en de magnetische afdekplaatjes. Per deur heb je er drie nodig.' },
  { v: 'Zitten de afdekplaatjes erbij?', a: 'Ja. Ze klikken magnetisch over de bevestiging. De schroeven zijn dan niet meer te zien, ook niet als de deur openstaat.' },
  { v: 'Welke kleuren zijn er?', a: 'Velours vernikkeld, zwart mat en donker brons liggen op voorraad. RVS en aluminium-look zijn er op aanvraag.' },
  { v: 'Moet het na een tijd opnieuw worden afgesteld?', a: 'Nee. Je stelt de deur bij de montage in drie richtingen af, en het scharnier houdt die stand.' },
  { v: 'Wie is de verkoper?', a: 'Bylder. Je bestelling en de betaling lopen via ons; de leverancier levert rechtstreeks bij je af.' },
  { v: 'Kan ik het terugsturen?', a: 'Ja, binnen 14 dagen na ontvangst, zonder reden. Hoe dat gaat staat op de pagina Verzending en retour in de winkel (bylder.com/winkel/verzending-en-retour).' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Product', name: `${SCHARNIER.merk} ${SCHARNIER.naam}`, brand: { '@type': 'Brand', name: SCHARNIER.merk },
      description: SCHARNIER.kort, url: URL, image: ['https://www.bylder.com/img/winkel/dx38.webp', 'https://www.bylder.com/img/winkel/dx38-afdekplaat.webp'],
      category: 'Deurbeslag', seller: { '@type': 'Organization', name: 'Bylder' },
      // Zelfde aanbod als de productlijst voor Google (app /api/winkel/feed.xml): een set van 3 voor één deur.
      offers: { '@type': 'Offer', name: 'Set van 3 scharnieren voor één deur tot 231,5 cm hoog', price: '150.66', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: URL,
        shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '6.95', currency: 'EUR' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'NL' } },
        seller: { '@type': 'Organization', name: 'Bylder' } } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: 'https://www.bylder.com/winkel/' },
      { '@type': 'ListItem', position: 3, name: 'Verdekt scharnier DX-38', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › Verdekt scharnier DX-38</nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Winkel · {SCHARNIER.merk}</p>
          <h1 style={S.h1}>Verdekt scharnier DX-38 Design. Je ziet het niet, je merkt het niet.</h1>
          <p style={S.lead}>{SCHARNIER.kort} Gemaakt in Duitsland van massief en roestvast staal.</p>
          {[`Draagt tot ${SCHARNIER.draagvermogenKg} kg per set`, 'In drie richtingen verstelbaar, en het blijft staan', 'Magnetische afdekplaatjes inbegrepen: geen schroef in zicht', `Past op deuren vanaf ${SCHARNIER.deurdikteMm} mm, ook in een bestaand houten kozijn`, 'Velours vernikkeld, zwart mat of donker brons, op voorraad'].map(t => (
            <p key={t} style={S.feit}><Vinkje />{t}</p>
          ))}
          <a href="#bestellen" style={{ display: 'inline-block', marginTop: 10, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Bestellen</a>
        </div>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1.3fr 1fr' }}>
          <div style={{ ...S.beeld, gridRow: 'span 2', background: '#fff' }}>
            <img src="/img/winkel/dx38.webp" width="1000" height="1366" alt="Verdekt scharnier Basys DX-38 Design, open, velours vernikkeld" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div style={S.beeld}><img src="/img/winkel/dx38-afdekplaat.webp" width="900" height="900" loading="lazy" alt="DX-38 met magnetische afdekplaatjes, van opzij" style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
          <div style={{ ...S.beeld, padding: 10 }}><img src="/img/winkel/dx38-zonder-afdekplaat.webp" width="700" height="1916" loading="lazy" alt="DX-38 zonder afdekplaatjes, met de bevestiging zichtbaar" style={{ height: 180, width: 'auto', display: 'block' }} /></div>
        </div>
      </div>

      <h2 style={S.h2}>Gegevens</h2>
      <div style={{ ...S.kaart, padding: 0, overflow: 'hidden' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {[
              ['Draagvermogen', `tot ${SCHARNIER.draagvermogenKg} kg per set`],
              ['Aantal per deur', `${SCHARNIER.perDeur} tot 231,5 cm hoog, ${SCHARNIER.perDeurHoog} bij hogere en kamerhoge deuren`],
              ['Verstelling', '3D, in hoogte, zijwaarts en in diepte'],
              ['Lengte', '180 mm'],
              ['Materiaal', 'massief staal, roestvast staal en hoogwaardige legeringen'],
              ['Deurdikte', `vanaf ${SCHARNIER.deurdikteMm} mm`],
              ['Kozijn', 'kozijnloos kozijn (voorgefreesd) of een bestaand houten kozijn'],
              ['Kleuren', SCHARNIER.kleuren.map(k => k.naam).join(', ') + ' (op voorraad); RVS en aluminium-look op aanvraag'],
              ['Afwerking', 'magnetische afdekplaatjes inbegrepen'],
              ['Gewicht', `ongeveer ${SCHARNIER.gewichtGram} gram per scharnier`],
              ['Freesmal', 'Basys Pivotica DX, 3-delig dubbel op strip, los te bestellen'],
              ['Herkomst', 'Duitsland'],
            ].map(([k, v]) => (
              <tr key={k}><th scope="row" style={{ ...S.tabelCel, width: '34%' }}>{k}</th><td style={S.tabelCel}>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <section id="bestellen" aria-labelledby="bestellen-kop" style={{ scrollMarginTop: 110 }}>
        <h2 id="bestellen-kop" style={S.h2}>Bestellen</h2>
        <div style={{ marginBottom: 14 }}><BestelMoment wat="Een kozijnloze deur met verdekte scharnieren" /></div>
        <div style={S.bestel}><ScharnierBestel /></div>
      </section>

      <h2 style={S.h2}>Vragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={{ ...S.kaart, padding: '14px 18px' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...S.p, fontSize: 15, margin: '10px 0 0' }}>{q.a}</p>
          </details>
        ))}
      </div>

      <div style={{ ...S.kaart, marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: '12px 24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...S.p, margin: 0 }}><strong style={{ color: '#1A1208' }}>Hoort erbij: de onzichtbare plint.</strong> Ook die gaat vóór het stucwerk de wand in, en we rekenen het pakket uit je plattegrond.</p>
        <a href={`/winkel/${PLINT.slug}/`} style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '11px 16px', borderRadius: 10, textDecoration: 'none' }}>Naar de onzichtbare plint</a>
      </div>
    </main>
  )
}
