import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { aantalMerken } from '@/lib/merken'
import AanbodStrook from '../../components/AanbodStrook'
import ConfiguratorCTA from '../../components/ConfiguratorCTA'
import GietvloerCTA from '../../components/GietvloerCTA'
import KastCTA from '../../components/KastCTA'
import VoucherCTA from '../../components/VoucherCTA'
import { CATEGORIEEN, categorie, type Categorie } from '../categorieen'
import GEMEENTEN from '../gemeenten.json'
import { BIJGEWERKT, GROEN, H2, H3, INKT, KAART, KNOP, KNOP2, LABEL, P, PAGINA, ROEST } from '../stijl'

/**
 * /renovatiekosten/<onderdeel>/ (herbouwd 11-10-2026). Was een statische pagina met één zin,
 * een knop naar /betalen/ en 281 gemeentelinks in één blok. Nu: prijs, wat erin zit, wat de
 * prijs bepaalt, het juiste moment, de commerciële stap die bij dit onderdeel hoort, de
 * gemeenten per provincie en de andere onderdelen. De gemeentepagina's zelf blijven statisch
 * (renovatiekosten/<onderdeel>/<gemeente>/) en staan op noindex.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORIEEN.map(c => ({ categorie: c.slug }))
}

const url = (c: Categorie) => `https://www.bylder.com/renovatiekosten/${c.slug}/`
const prijs = (c: Categorie) => `${c.van} – ${c.tot}${c.eenheid === 'per m²' ? ' per m²' : ''}`

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const c = categorie((await params).categorie)
  if (!c) return {}
  const titel = `${c.naam} kosten 2026: eerlijke prijs ${c.eenheid === 'per m²' ? 'per m²' : 'en offerte check'} | Bylder`
  const beschrijving = `Wat kost ${c.zin} in 2026? Eerlijke marktprijs ${prijs(c)}. Wat erin zit, wat de prijs bepaalt en de prijs in jouw gemeente.`
  return {
    title: titel,
    description: beschrijving,
    alternates: { canonical: url(c) },
    openGraph: { title: `${c.naam} kosten 2026: ${prijs(c)}`, description: beschrijving, url: url(c), type: 'website' },
  }
}

function Aanbod({ c, merken }: { c: Categorie; merken: number }) {
  const aanleiding = c.aanleiding.replace('{merken}', String(merken))
  if (c.aanbod === 'gietvloer') return <GietvloerCTA aanleiding={aanleiding} marge="36px 0 0" />
  if (c.aanbod === 'kast') return <KastCTA aanleiding={aanleiding} marge="36px 0 0" titel="Maak van je zolder een kamer met bergruimte" />
  if (c.aanbod === 'deuren') return <ConfiguratorCTA aanleiding={aanleiding} marge="36px 0 0" />
  return <VoucherCTA aanleiding={aanleiding} merken={merken} marge="36px 0 0" />
}

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const c = categorie((await params).categorie)
  if (!c) notFound()
  const merken = aantalMerken()
  const provincies = [...new Set(GEMEENTEN.map(g => g.provincie))].sort((a, b) => a.localeCompare(b, 'nl'))
  const anderen = CATEGORIEEN.filter(x => x.slug !== c.slug)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
        { '@type': 'ListItem', position: 2, name: 'Renovatiekosten', item: 'https://www.bylder.com/renovatiekosten/' },
        { '@type': 'ListItem', position: 3, name: c.naam, item: url(c) },
      ] },
      { '@type': 'WebPage', '@id': url(c), url: url(c), name: `${c.naam} kosten 2026`, inLanguage: 'nl-NL', dateModified: '2026-10-11',
        isPartOf: { '@type': 'WebSite', name: 'Bylder', url: 'https://www.bylder.com/' },
        publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' } },
      { '@type': 'FAQPage', mainEntity: c.vragen.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    ],
  }

  return (
    <div style={PAGINA}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Kruimelpad" style={LABEL}>
        <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <a href="/renovatiekosten/" style={{ color: 'inherit' }}>Renovatiekosten</a> / {c.naam}
      </nav>
      <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 14px', textWrap: 'balance', maxWidth: '24ch' }}>
        {c.naam} kosten 2026: wat is een eerlijke prijs?
      </h1>
      <p style={{ ...P, fontSize: 18 }}>
        {c.naam === 'Schilderwerk' || c.naam === 'Zonnepanelen' ? `${c.naam} kost` : `${c.zin.charAt(0).toUpperCase()}${c.zin.slice(1)} kost`} in 2026 meestal{' '}
        <strong>{prijs(c)}</strong>. Hieronder wat erin zit, waar het prijsverschil vandaan komt en wanneer je moet beslissen.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', margin: '22px 0 0' }}>
        {[[prijs(c), 'eerlijke marktprijs 2026, indicatie'],
          [String(c.watErIn.length), 'posten in een complete offerte'],
          [String(GEMEENTEN.length), 'gemeenten met een eigen prijspagina']].map(([g, t]) => (
          <div key={t} style={{ ...KAART, padding: '18px 20px' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: GROEN }}>{g}</div>
            <div style={{ fontSize: 13.5, color: `${INKT}0.65)`, lineHeight: 1.5, marginTop: 4 }}>{t}</div>
          </div>
        ))}
      </div>

      <Aanbod c={c} merken={merken} />

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', marginTop: 44 }}>
        <section style={KAART} aria-labelledby="wat-erin">
          <h2 id="wat-erin" style={{ ...H3, fontSize: '1.2rem' }}>Wat zit erin</h2>
          <ul style={{ ...P, margin: 0, paddingLeft: 20, fontSize: 15 }}>
            {c.watErIn.map(w => <li key={w}>{w}</li>)}
          </ul>
        </section>
        <section style={KAART} aria-labelledby="bepalers">
          <h2 id="bepalers" style={{ ...H3, fontSize: '1.2rem' }}>Wat de prijs bepaalt</h2>
          <ul style={{ ...P, margin: 0, paddingLeft: 20, fontSize: 15 }}>
            {c.bepalers.map(w => <li key={w}>{w}</li>)}
          </ul>
        </section>
      </div>

      <section aria-labelledby="moment" style={{ ...KAART, marginTop: 12, borderColor: GROEN, borderWidth: 1.5 }}>
        <p style={{ ...LABEL, color: ROEST, margin: '0 0 6px' }}>Het juiste moment</p>
        <h2 id="moment" style={{ ...H3, fontSize: '1.2rem' }}>Waar je op tijd bij moet zijn</h2>
        <p style={{ ...P, margin: 0 }}>{c.moment}</p>
      </section>

      <h2 style={H2}>Is jouw offerte eerlijk?</h2>
      <p style={P}>
        Leg je offerte naast de posten hierboven. Ontbreekt er een post, of staat er een stelpost in, vraag dan door. De
        offerte-check van Bylder vergelijkt elke post met de markt en geeft groen, oranje of rood.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href="/offerte-check/" style={KNOP}>Laat je offerte gratis checken</a>
        <a href={c.vak.href} style={KNOP2}>{c.vak.label}</a>
      </div>

      <h2 style={H2}>{c.naam} kosten per gemeente</h2>
      <p style={P}>Tarieven verschillen per regio. Kies je provincie en daarna je gemeente.</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 900 }}>
        {provincies.map(p => {
          const lijst = GEMEENTEN.filter(g => g.provincie === p)
          return (
            <details key={p} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14, padding: '14px 18px' }}>
              <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{p} <span style={{ fontWeight: 600, color: `${INKT}0.55)`, fontSize: 14 }}>({lijst.length})</span></summary>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 2px', display: 'grid', gap: '6px 16px', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
                {lijst.map(g => (
                  <li key={g.slug}><a href={`/renovatiekosten/${c.slug}/${g.slug}/`} style={{ color: GROEN, fontSize: 14.5, fontWeight: 600 }}>{c.naam} {g.naam}</a></li>
                ))}
              </ul>
            </details>
          )
        })}
      </div>

      <AanbodStrook merken={merken} titel="Meer regelen via Bylder" />

      <h2 style={H2}>Andere onderdelen</h2>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        {anderen.map(a => (
          <a key={a.slug} href={`/renovatiekosten/${a.slug}/`} style={{ ...KAART, padding: '14px 18px', textDecoration: 'none', display: 'grid', gap: 2 }}>
            <span style={{ fontWeight: 800, color: '#1A1208' }}>{a.naam}</span>
            <span style={{ fontSize: 14, color: GROEN, fontWeight: 700 }}>{prijs(a)}</span>
          </a>
        ))}
      </div>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 812 }}>
        {c.vragen.map(q => (
          <details key={q.v} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
            <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>
      <p style={{ ...P, fontSize: 13.5, marginTop: 24 }}>
        Prijzen zijn indicaties voor een gemiddelde woning. De prijs in jouw offerte hangt af van de woning, de regio en de keuzes. Bijgewerkt {BIJGEWERKT}.
      </p>
    </div>
  )
}
