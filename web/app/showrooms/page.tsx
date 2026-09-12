import type { Metadata } from 'next'
import { showroomTypes, showroomsVanType } from '@/lib/showrooms'

/**
 * /showrooms/ — de showroomgids, overzicht per producttype.
 *
 * WAAROM DEZE PAGINA BESTAAT
 * Besluit Daniel, 11 en 12 sep 2026: Bylder opent geen eigen showrooms. Eigen
 * Huis en Decorette draaien dezelfde business op eigen vastgoed en voorraad —
 * te kapitaalintensief. Wij ontsluiten de showrooms die er al staan: een
 * reisgids voor wie een woning koopt en nieuwe spullen nodig heeft. Per
 * producttype een kleine selectie, elk met een geschreven reden om erheen te
 * gaan. Deelnemer of niet doet er niet toe voor de plek in de gids.
 *
 * INDEXATIE
 * noindex tot de tips door Daniel zijn geschreven (status 'definitief'). Een
 * gids met twaalf goede vermeldingen is meer waard dan een lijst van honderd;
 * een gids met concepttekst hoort nog niet in Google.
 */

const SITE = 'https://www.bylder.com'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export const metadata: Metadata = {
  title: 'Showrooms die het bezoek waard zijn | Bylder',
  description: 'Per producttype de showrooms waar je echt iets ziet: gietvloeren, tegels, bedden, meubelen en bouwmaterialen. Met de reden waarom, en wat je meeneemt.',
  alternates: { canonical: `${SITE}/showrooms/` },
  robots: { index: false, follow: true },
}

const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}
const P: React.CSSProperties = { fontSize: 15.5, maxWidth: '68ch', lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 12px' }
const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
  display: 'grid', gap: 8, alignContent: 'start', textDecoration: 'none', color: '#1A1208',
}

export default function ShowroomsPage() {
  const types = showroomTypes()
  const totaal = types.reduce((n, t) => n + showroomsVanType(t.slug).length, 0)
  return (
    <main style={{ maxWidth: 1200, boxSizing: 'border-box', margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <p style={LABEL}>Showroomgids</p>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        Showrooms die het bezoek waard zijn
      </h1>
      <p style={{ ...P, fontSize: 17, maxWidth: '62ch' }}>
        Een gietvloer, een bed of een tegel kies je niet van een foto. Dit zijn de {totaal} showrooms
        waar je volgens ons echt iets ziet — per producttype, met de reden waarom en wat je meeneemt.
        Geen volledige lijst, wel een gekozen lijst.
      </p>
      <p style={{ ...P, fontSize: 14, color: `${INKT}0.6)` }}>
        Een vermelding is geen advertentie. Winkels kunnen geen plek in de gids kopen; wat erin staat,
        staat erin omdat wij er zelf heen zouden gaan.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 32 }}>
        {types.map(t => {
          const lijst = showroomsVanType(t.slug)
          return (
            <a key={t.slug} href={`/showrooms/${t.slug}/`} style={KAART}>
              <span style={LABEL}>{lijst.length === 1 ? '1 showroom' : `${lijst.length} showrooms`}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{t.naam}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.72)` }}>
                {lijst.map(s => `${s.naam} (${s.plaats})`).join(' · ')}
              </span>
              <span style={{ fontWeight: 700, color: GROEN, fontSize: 14.5, marginTop: 4 }}>Bekijk de gids →</span>
            </a>
          )
        })}
      </div>

      <section style={{ marginTop: 56, maxWidth: '68ch' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Hoe een showroom in de gids komt</h2>
        <p style={P}>
          Het moet een echte showroom zijn — geen webshop, geen werkplaats. En er moet een reden zijn
          om ervoor in de auto te stappen: iets wat je er ziet dat je elders niet ziet, een adviseur die
          op je tekening meekijkt, merken naast elkaar die nergens anders naast elkaar staan. Die reden
          schrijven we in onze eigen woorden. Beoordelingen op Google helpen ons kiezen, maar staan
          niet in de gids.
        </p>
        <p style={P}>
          Mis je een showroom die er volgens jou in hoort? Laat het weten via{' '}
          <a href="mailto:info@bylder.com?subject=Showroomgids" style={{ color: GROEN, fontWeight: 700 }}>info@bylder.com</a>.
        </p>
      </section>
    </main>
  )
}
