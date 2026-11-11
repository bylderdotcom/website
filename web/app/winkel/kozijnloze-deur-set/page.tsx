import type { Metadata } from 'next'
import DeursetBestel from './DeursetBestel'
import BestelMoment from '../BestelMoment'
import Vinkje from '../Vinkje'
import { DEURSET, PLINT } from '@/lib/winkel'
import { VANAF, MONTAGE_UUR } from '../../kozijnloze-deuren/configurator/prijs'
import { S, GROEN } from '../stijl'

/**
 * Winkel: de standaardset kozijnloze deur van Classic Next (besluit Daniel, 11-11-2026). Eén vaste
 * samenstelling met een vaste prijs, zodat hij te bestellen is zonder offerte: kozijn tot 2400 mm
 * met bovendorpel, 3 scharnieren en magneetslot, plus een gegrond deurblad tot 93 x 231,5 cm.
 * Gegrond en niet afgelakt: de koper schildert hem mee in de kleur van de wand. De prijs komt uit
 * dezelfde lijst als de configurator (VANAF), en het afrekenbedrag uit de app.
 */

const URL = 'https://www.bylder.com/winkel/kozijnloze-deur-set/'
const PRIJS = VANAF.toFixed(2)
const PRIJS_TEKST = '€ ' + VANAF.toLocaleString('nl-NL', { minimumFractionDigits: 2 })

export const metadata: Metadata = {
  title: `Kozijnloze deur met onzichtbaar kozijn, complete set ${PRIJS_TEKST} | Bylder`,
  description: `Complete kozijnloze binnendeur van Classic Next voor ${PRIJS_TEKST}: onzichtbaar kozijn, deurblad, verdekte scharnieren en magneetslot. Gegrond, schilder hem mee met je wand.`,
  alternates: { canonical: URL },
  openGraph: { title: 'Kozijnloze deur, standaardset gegrond', url: URL, type: 'website', images: ['https://www.bylder.com/img/classic-next/portfolio-gang-wit.webp'],
    description: `Onzichtbaar kozijn, deurblad, scharnieren en magneetslot in één set, ${PRIJS_TEKST} incl. btw.` },
}

const VRAGEN = [
  { v: 'Wat zit er in de set?', a: 'Het onzichtbare kozijn (AGS TST50, tot 240 cm hoog) met bovendorpel, drie verdekte scharnieren Basys DX-38, een magneetslot en een deurblad van 50 mm dik, gegrond. De deurkruk en de montage zitten er niet bij.' },
  { v: 'Waarom gegrond en niet afgelakt?', a: 'Een gegronde deur is voorbehandeld en klaar om te schilderen. Je schildert hem mee in de kleur van je wand, zodat deur en wand één vlak worden. Wil je hem in de fabriek laten aflakken in een RAL-kleur, stel hem dan samen in de configurator.' },
  { v: 'Welke maten zijn er?', a: 'Deurbladen van 73, 78, 83, 88 of 93 cm breed en 201,5, 211,5 of 231,5 cm hoog. De prijs is voor al deze maten gelijk. Plafondhoog (tot 270 cm) of breder kan via de configurator.' },
  { v: 'Wanneer moet ik bestellen?', a: `Vóór de stukadoor komt: het kozijn wordt in de wand gestuct. Reken op een levertijd van ongeveer ${DEURSET.levertijdWeken} weken.` },
  { v: 'Wat heb je van mij nodig?', a: 'De maat van het deurblad, de kant van de scharnieren en het slot. De wanddikte en eventuele bijzonderheden zet je in de toelichting bij het afrekenen; we controleren je bestelling voordat hij in productie gaat.' },
  { v: 'Wat kost de levering?', a: 'Een deur met kozijn gaat met een aparte vervoerder. De leverkosten staan in onze bevestiging, voordat je betaalt.' },
  { v: 'Kan ik de deur laten monteren?', a: `Ja. Monteren duurt ongeveer ${MONTAGE_UUR} uur per deur. Laat je de afwerking door Bylder doen, dan nemen we de montage mee in dezelfde offerte.` },
  { v: 'Wie is de verkoper?', a: 'Bylder. Je bestelling en de betaling lopen via ons; Classic Next maakt en levert de deur.' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Product', name: `${DEURSET.merk} ${DEURSET.naam}`, brand: { '@type': 'Brand', name: DEURSET.merk },
      description: DEURSET.kort, url: URL, image: ['https://www.bylder.com/img/classic-next/portfolio-gang-wit.webp'],
      category: 'Binnendeuren', seller: { '@type': 'Organization', name: 'Bylder' },
      offers: { '@type': 'Offer', price: PRIJS, priceCurrency: 'EUR', availability: 'https://schema.org/BackOrder', url: URL,
        seller: { '@type': 'Organization', name: 'Bylder' } } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: 'https://www.bylder.com/winkel/' },
      { '@type': 'ListItem', position: 3, name: 'Kozijnloze deur, standaardset', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › Kozijnloze deur, standaardset</nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Winkel · {DEURSET.merk}</p>
          <h1 style={S.h1}>Kozijnloze deur, compleet. Schilder hem mee met je wand.</h1>
          <p style={S.lead}>{DEURSET.kort}</p>
          <p style={{ margin: '0 0 16px', fontSize: 15, color: 'rgba(61,46,30,0.75)' }}>
            <strong style={{ fontSize: 28, color: '#1A1208', letterSpacing: '-0.02em' }}>{PRIJS_TEKST}</strong> per deur, incl. btw · excl. kruk, montage en levering
          </p>
          {['Onzichtbaar kozijn met bovendorpel, tot 240 cm hoog', 'Deurblad 50 mm dik, tot 93 × 231,5 cm', '3 verdekte scharnieren Basys DX-38 en een magneetslot', 'Gegrond: klaar om te schilderen in elke kleur', 'Eén prijs voor alle standaardmaten'].map(t => (
            <p key={t} style={S.feit}><Vinkje />{t}</p>
          ))}
          <a href="#bestellen" style={{ display: 'inline-block', marginTop: 10, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Bestellen</a>
        </div>
        <div style={{ ...S.beeld, maxHeight: 620 }}>
          <img src="/img/classic-next/portfolio-gang-wit.webp" width="800" height="1600" alt="Kozijnloze deur van Classic Next, vlak in een witte wand" style={{ width: '100%', height: '100%', maxHeight: 620, objectFit: 'cover', objectPosition: 'center 72%', display: 'block' }} />
        </div>
      </div>
      <p style={{ ...S.p, fontSize: 13, margin: '10px 0 0' }}>Beeld: Classic Next. De deur op de foto is geschilderd; je ontvangt hem gegrond.</p>

      <h2 style={S.h2}>Wat je krijgt</h2>
      <div style={{ ...S.kaart, padding: 0, overflow: 'hidden' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {[
              ['Kozijn', 'AGS TST50, onzichtbaar instuckozijn met bovendorpel, tot 240 cm hoog'],
              ['Deurblad', '50 mm dik, gegrond'],
              ['Maten', `${DEURSET.breedtes.join(', ')} cm breed · ${DEURSET.hoogtes.join(', ')} cm hoog`],
              ['Scharnieren', '3 × Basys DX-38 Design, verdekt en in drie richtingen verstelbaar'],
              ['Slot', 'Magneetslot: loop, dag- en nachtslot of vrij/bezet'],
              ['Niet inbegrepen', 'Deurkruk, montage en levering'],
              ['Montage', `ongeveer ${MONTAGE_UUR} uur per deur, vóór het stucwerk`],
              ['Levertijd', `ongeveer ${DEURSET.levertijdWeken} weken`],
            ].map(([k, v]) => (
              <tr key={k}><th scope="row" style={{ ...S.tabelCel, width: '34%' }}>{k}</th><td style={S.tabelCel}>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <section id="bestellen" aria-labelledby="bestellen-kop" style={{ scrollMarginTop: 110 }}>
        <h2 id="bestellen-kop" style={S.h2}>Bestellen</h2>
        <div style={{ marginBottom: 14 }}><BestelMoment wat="Een kozijnloze deur" /></div>
        <div style={S.bestel}><DeursetBestel /></div>
      </section>

      <div style={{ ...S.kaart, marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: '12px 24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...S.p, margin: 0 }}><strong style={{ color: '#1A1208' }}>Plafondhoog, afgelakt of met freeswerk?</strong> Stel je deur samen in de configurator en zie de prijs per deur.</p>
        <a href="/kozijnloze-deuren/configurator/" style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '11px 16px', borderRadius: 10, textDecoration: 'none' }}>Naar de configurator</a>
      </div>

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
        <p style={{ ...S.p, margin: 0 }}><strong style={{ color: '#1A1208' }}>Hoort erbij: de onzichtbare plint.</strong> Zonder kozijn valt de plint op. Ook die gaat vóór het stucwerk de wand in.</p>
        <a href={`/winkel/${PLINT.slug}/`} style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '11px 16px', borderRadius: 10, textDecoration: 'none' }}>Naar de onzichtbare plint</a>
      </div>
      <p style={{ ...S.p, fontSize: 13.5, marginTop: 18 }}><a href="/winkel/verzending-en-retour/" style={{ color: 'inherit' }}>Verzending en retour</a></p>
    </main>
  )
}
