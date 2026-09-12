import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { showroomTypes, showroomType, showroomsVanType, datumNl } from '@/lib/showrooms'

/**
 * /showrooms/<type>/ — de gids voor één producttype.
 *
 * Elke vermelding heeft drie lagen, in deze volgorde: de reden om te gaan (in
 * onze woorden), de feiten van de showroom zelf (oppervlakte, merken, wat je er
 * kunt), en de praktische regel (adres, uren, website). De reden staat voorop
 * omdat dat het enige is wat een gids onderscheidt van een adressenlijst.
 *
 * Zie /showrooms/page.tsx voor waarom de gids bestaat.
 */

const SITE = 'https://www.bylder.com'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export function generateStaticParams() {
  return showroomTypes().map(t => ({ type: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  const t = showroomType(type)
  if (!t) return {}
  const lijst = showroomsVanType(type)
  const plaatsen = [...new Set(lijst.map(s => s.plaats))].join(', ')
  return {
    title: `${t.naam}: showrooms die het bezoek waard zijn | Bylder`,
    description: `${lijst.length === 1 ? 'Eén showroom' : `${lijst.length} showrooms`} voor ${t.naam.toLowerCase()} in ${plaatsen} — met de reden waarom je erheen gaat en wat je meeneemt.`,
    alternates: { canonical: `${SITE}/showrooms/${type}/` },
  }
}

const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}
const P: React.CSSProperties = { fontSize: 15.5, maxWidth: '68ch', lineHeight: 1.75, color: `${INKT}0.78)`, margin: 0 }

export default async function ShowroomTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const t = showroomType(type)
  if (!t) notFound()
  const lijst = showroomsVanType(type)
  const andere = showroomTypes().filter(x => x.slug !== type)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Showrooms voor ${t.naam.toLowerCase()}`,
    itemListElement: lijst.map((s, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'LocalBusiness', name: s.naam, address: s.adres, url: s.website, telephone: s.telefoon },
    })),
  }

  return (
    <main style={{ maxWidth: 1200, boxSizing: 'border-box', margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, marginBottom: 14 }}>
        <a href="/showrooms/" style={{ color: 'inherit' }}>Showroomgids</a> <span aria-hidden="true">›</span> {t.naam}
      </nav>
      <p style={LABEL}>Showroomgids · {t.naam}</p>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        {t.naam}: waar je echt iets ziet
      </h1>
      <p style={{ ...P, fontSize: 17, maxWidth: '62ch', marginBottom: 8 }}>{t.intro}</p>
      <p style={{ ...P, fontSize: 14, color: `${INKT}0.6)`, marginBottom: 36 }}>
        {lijst.length === 1 ? 'Eén adres' : `${lijst.length} adressen`}, gekozen omdat we er zelf heen zouden gaan. Wil je
        weten wat het kost? <a href={t.kopen} style={{ color: GROEN, fontWeight: 700 }}>Onze prijzen en keuzehulp voor {t.naam.toLowerCase()}</a>.
      </p>

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 18 }}>
        {lijst.map(s => (
          <li key={s.id} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '26px 28px', display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 14px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{s.naam}</h2>
              <span style={{ fontSize: 14.5, color: `${INKT}0.6)` }}>{s.plaats}</span>
            </div>

            <div>
              <p style={LABEL}>Waarom hierheen</p>
              <p style={{ ...P, fontSize: 16.5, color: '#1A1208', marginTop: 6, maxWidth: '64ch' }}>{s.tip}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              <div>
                <p style={LABEL}>Wat er staat</p>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'grid', gap: 4, fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.78)` }}>
                  {s.feiten.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div>
                <p style={LABEL}>Praktisch</p>
                <p style={{ ...P, fontSize: 14.5, marginTop: 6 }}>
                  {s.adres}<br />
                  {s.uren && <>{s.uren}<br /></>}
                  {s.telefoon && <>{s.telefoon}<br /></>}
                  <a href={s.website} rel="noopener" style={{ color: GROEN, fontWeight: 700 }}>Website van {s.naam}</a>
                </p>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: 0 }}>
              Gegevens van de website van de showroom, gecontroleerd op {datumNl(s.bron_datum)}. Uren kunnen afwijken; bel bij twijfel.
            </p>
          </li>
        ))}
      </ol>

      {andere.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <p style={LABEL}>Ook in de gids</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {andere.map(x => (
              <a key={x.slug} href={`/showrooms/${x.slug}/`} style={{ fontSize: 14.5, fontWeight: 700, color: GROEN, textDecoration: 'none', border: `1px solid ${INKT}0.14)`, borderRadius: 999, padding: '8px 14px', background: '#fff' }}>
                {x.naam}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
