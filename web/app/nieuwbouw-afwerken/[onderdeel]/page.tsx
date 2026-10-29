import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ONDERDELEN, URL_AFWERKEN, onderdeel, prijsTekst } from '@/lib/afwerken'
import AfwerkAanvraag from '../../components/AfwerkAanvraag'
import { Stijl as S, Lijn } from '../stijl'

// /nieuwbouw-afwerken/<onderdeel>/ — één onderdeel van de afwerking, met dezelfde aanvraag als de
// hoofdpagina, dit onderdeel vooraf aangevinkt. Inhoud: web/lib/afwerken.ts.

export const dynamicParams = false
export function generateStaticParams() {
  return ONDERDELEN.map(o => ({ onderdeel: o.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ onderdeel: string }> }): Promise<Metadata> {
  const o = onderdeel((await params).onderdeel)
  if (!o) return {}
  const url = `${URL_AFWERKEN}${o.slug}/`
  return { title: o.title, description: o.description, alternates: { canonical: url },
    openGraph: { title: o.h1, description: o.description, url, type: 'website' } }
}

export default async function OnderdeelPage({ params }: { params: Promise<{ onderdeel: string }> }) {
  const o = onderdeel((await params).onderdeel)
  if (!o) notFound()
  const url = `${URL_AFWERKEN}${o.slug}/`
  const vragen = [
    ...o.vragen,
    { v: `Wie voert het ${o.naam.toLowerCase()} uit?`, a: 'Bylder neemt de opdracht aan en plant het werk. Het wordt uitgevoerd door een vakbedrijf bij jou in de buurt, dat in je offerte staat. Je hebt één aanspreekpunt: Bylder.' },
  ]
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: `${o.naam} in een nieuwbouwwoning`, serviceType: o.naam, url,
      provider: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' },
      areaServed: { '@type': 'Country', name: 'Nederland' },
      ...(o.prijs && o.prijs.eenheid !== 'totaal' ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: o.prijs.van, highPrice: o.prijs.tot } } : {}) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: vragen.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Nieuwbouw laten afwerken', item: URL_AFWERKEN },
      { '@type': 'ListItem', position: 3, name: o.naam, item: url }] },
  ]
  const anderen = ONDERDELEN.filter(x => x.slug !== o.slug)
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}>
        <a href="/" style={S.kruimelLink}>Home</a> › <a href="/nieuwbouw-afwerken/" style={S.kruimelLink}>Nieuwbouw laten afwerken</a> › {o.naam}
      </nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Onderdeel van je afwerking</p>
          <h1 style={S.h1}>{o.h1}</h1>
          <p style={S.lead}>{o.kort} Bylder maakt de offerte uit je tekening, als los onderdeel of samen met de rest van je afwerking, en plant het op het goede moment.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#aanvraag" style={S.knop}>Vraag je offerte aan</a>
            {o.ontwerper && <a href={o.ontwerper.href} style={S.link}>{o.ontwerper.tekst} →</a>}
          </div>
        </div>
        <aside aria-label="Wat het kost" style={S.prijsKaart}>
          <p style={{ ...S.oog, margin: '0 0 8px' }}>Indicatie</p>
          {o.prijs ? (
            <>
              <p style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px', fontVariantNumeric: 'tabular-nums' }}>{prijsTekst(o.prijs)}</p>
              <p style={{ fontSize: 14, color: 'rgba(61,46,30,0.7)', margin: 0 }}>{o.prijs.tekst}, inclusief btw (Bylder-prijsbenchmark, 2026)</p>
            </>
          ) : (
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>De prijs hangt af van wat je kiest. {o.ontwerper ? <>In de ontwerper stel je het samen; </> : null}in je offerte staat het bedrag.</p>
          )}
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: '14px 0 0' }}><strong>Uit je tekening:</strong> {o.uitTekening}</p>
        </aside>
      </div>

      <h2 style={S.h2}>Wat eronder valt</h2>
      <ul style={{ ...S.vinkjes, maxWidth: 720 }}>
        {o.wat.map(t => <li key={t} style={S.vinkje}><Lijn d="M5 12l5 5 9-10" /> {t}</li>)}
      </ul>

      <h2 style={S.h2}>Wanneer in de afbouw</h2>
      <p style={S.p}>{o.wanneer}</p>

      <h2 style={S.h2}>Waar je op let</h2>
      {o.letOp.map(t => <p key={t} style={S.p}>{t}</p>)}

      <section id="aanvraag" aria-labelledby="aanvraag-kop" style={S.aanvraag}>
        <h2 id="aanvraag-kop" style={{ ...S.h2, margin: '0 0 8px' }}>Vraag je offerte aan</h2>
        <p style={{ ...S.p, margin: '0 0 18px' }}>Alleen {o.naam.toLowerCase()}, of meteen meer? Vink aan wat je wilt; alles staat dan in één offerte.</p>
        <AfwerkAanvraag onderdelen={ONDERDELEN.map(x => ({ slug: x.slug, naam: x.naam }))} gekozen={[o.slug]} bron={`nieuwbouw-afwerken/${o.slug}`} />
      </section>

      <h2 style={S.h2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
        {vragen.map(q => (
          <details key={q.v} style={S.vraag}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16 }}>{q.v}</summary>
            <p style={{ ...S.p, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>

      <h2 style={S.h2}>De rest van je afwerking</h2>
      <ul style={S.raster}>
        {anderen.map(x => (
          <li key={x.slug}>
            <a href={`/nieuwbouw-afwerken/${x.slug}/`} style={S.kaartLink}>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#1A1208' }}>{x.naam}</span>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(61,46,30,0.75)' }}>{x.kort}</span>
            </a>
          </li>
        ))}
      </ul>
      <p style={{ ...S.p, marginTop: 18 }}><a href="/nieuwbouw-afwerken/" style={S.link}>Alles over je nieuwbouwhuis laten afwerken →</a></p>
    </main>
  )
}
