import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DeursetBestel from '../DeursetBestel'
import KleurTegels from '../KleurTegels'
import BestelMoment from '../../BestelMoment'
import Vinkje from '../../Vinkje'
import { DEURSET, PLINT, SET_KLEUREN, setKleur } from '@/lib/winkel'
import { setPrijs, MONTAGE_UUR } from '../../../kozijnloze-deuren/configurator/prijs'
import { S, GROEN } from '../../stijl'

/**
 * Winkel: kozijnloze deur afgelakt in een kleur (besluit Daniel, 11-11-2026). Zes kleuren, elk in
 * standaardhoogte of plafondhoog, met een render van precies deze uitvoering als beeld (ook in de
 * productlijst voor Google Shopping). Prijzen uit configurator/prijs.ts; het afrekenbedrag uit de app.
 */

export const dynamicParams = false
export function generateStaticParams() { return SET_KLEUREN.map(k => ({ kleur: `ral-${k.ral}` })) }

const eur = (n: number) => '€ ' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2 })
const STD = setPrijs('standaard', 'gelakt'), PLAF = setPrijs('plafond', 'gelakt')

export async function generateMetadata({ params }: { params: Promise<{ kleur: string }> }): Promise<Metadata> {
  const k = setKleur((await params).kleur.replace('ral-', ''))
  if (!k) return {}
  const url = `https://www.bylder.com/winkel/${DEURSET.slug}/ral-${k.ral}/`
  return {
    title: `Kozijnloze deur ${k.naam} (RAL ${k.ral}), complete set vanaf ${eur(STD)} | Bylder`,
    description: `Complete kozijnloze binnendeur van Classic Next, in de fabriek afgelakt in RAL ${k.ral} ${k.naam}: onzichtbaar kozijn, deurblad, verdekte scharnieren en magneetslot. Standaard of plafondhoog.`,
    alternates: { canonical: url },
    openGraph: { title: `Kozijnloze deur ${k.naam}`, url, type: 'website', images: [`https://www.bylder.com/img/winkel/deuren/origin-${k.ral}.webp`],
      description: `Afgelakt in RAL ${k.ral}, vanaf ${eur(STD)} incl. btw.` },
  }
}

export default async function Pagina({ params }: { params: Promise<{ kleur: string }> }) {
  const k = setKleur((await params).kleur.replace('ral-', ''))
  if (!k) notFound()
  const url = `https://www.bylder.com/winkel/${DEURSET.slug}/ral-${k.ral}/`
  const beeld = `/img/winkel/deuren/origin-${k.ral}.webp`
  const Naam = k.naam[0].toUpperCase() + k.naam.slice(1)
  const VRAGEN = [
    { v: 'Wat zit er in de set?', a: `Het onzichtbare kozijn (AGS TST50) met bovendorpel, verdekte scharnieren Basys DX-38 (drie bij standaardhoogte, vier bij plafondhoog), een magneetslot en een deurblad van 50 mm dik, in de fabriek afgelakt in RAL ${k.ral} ${k.naam}. De deurkruk en de montage zitten er niet bij.` },
    { v: 'Wat kost hij?', a: `${eur(STD)} bij standaardhoogte (tot 231,5 cm) en ${eur(PLAF)} plafondhoog (tot 270 cm), per deur en inclusief btw. Levering kost € 99 per bestelling.` },
    { v: 'Klopt de kleur op mijn scherm?', a: `Als richting. RAL ${k.ral} is een vaste kleurstandaard, maar elk scherm toont kleur anders. Twijfel je, bekijk dan een RAL-kaart of vraag ons een staal.` },
    { v: 'Hoe hoog is plafondhoog?', a: 'Je geeft bij het bestellen de hoogte tot je plafond op, tussen 230 en 270 cm. De deur loopt dan door tot het plafond.' },
    { v: 'Wanneer moet ik bestellen?', a: `Vóór de stukadoor komt: het kozijn wordt in de wand gestuct. Reken op een levertijd van ongeveer ${DEURSET.levertijdWeken} weken.` },
    { v: 'Kan ik de deur laten monteren?', a: `Ja. Monteren duurt ongeveer ${MONTAGE_UUR} uur per deur. Laat je de afwerking door Bylder doen, dan nemen we de montage mee in dezelfde offerte.` },
    { v: 'Wie is de verkoper?', a: 'Bylder. Je bestelling en de betaling lopen via ons; Classic Next maakt en levert de deur.' },
  ]
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Product', name: `${DEURSET.merk} kozijnloze deur, afgelakt RAL ${k.ral} ${k.naam}`, brand: { '@type': 'Brand', name: DEURSET.merk },
      color: `RAL ${k.ral} ${k.naam}`, url, image: [`https://www.bylder.com${beeld}`], category: 'Binnendeuren',
      description: `Complete kozijnloze binnendeur, afgelakt in RAL ${k.ral}: onzichtbaar kozijn, deurblad, verdekte scharnieren en magneetslot.`,
      offers: [
        { '@type': 'Offer', name: 'Standaardhoogte, tot 231,5 cm', price: STD.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/BackOrder', url, seller: { '@type': 'Organization', name: 'Bylder' } },
        { '@type': 'Offer', name: 'Plafondhoog, tot 270 cm', price: PLAF.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/BackOrder', url: `${url}?hoogte=plafond`, seller: { '@type': 'Organization', name: 'Bylder' } },
      ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: 'https://www.bylder.com/winkel/' },
      { '@type': 'ListItem', position: 3, name: 'Kozijnloze deur', item: `https://www.bylder.com/winkel/${DEURSET.slug}/` },
      { '@type': 'ListItem', position: 4, name: Naam, item: url }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › <a href={`/winkel/${DEURSET.slug}/`} style={S.kruimelLink}>Kozijnloze deur</a> › {Naam}</nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Winkel · {DEURSET.merk} · RAL {k.ral}</p>
          <h1 style={S.h1}>Kozijnloze deur in {k.naam}. Afgelakt, compleet, klaar.</h1>
          <p style={S.lead}>Onzichtbaar kozijn, deurblad, verdekte scharnieren en magneetslot in één set, in de fabriek afgelakt in RAL {k.ral}. Lak je de wand in dezelfde kleur, dan verdwijnt de deur erin.</p>
          <p style={{ margin: '0 0 16px', fontSize: 15, color: 'rgba(61,46,30,0.75)' }}>
            <strong style={{ fontSize: 28, color: '#1A1208', letterSpacing: '-0.02em' }}>{eur(STD)}</strong> per deur · plafondhoog {eur(PLAF)} · incl. btw, excl. kruk, montage en levering
          </p>
          {[`Afgelakt in RAL ${k.ral} ${k.naam}, harder dan schilderwerk op de bouw`, 'Standaardhoogte tot 231,5 cm of plafondhoog tot 270 cm', 'Onzichtbaar kozijn met bovendorpel en magneetslot', 'Verdekte scharnieren Basys DX-38, in drie richtingen verstelbaar'].map(t => (
            <p key={t} style={S.feit}><Vinkje />{t}</p>
          ))}
          <a href="#bestellen" style={{ display: 'inline-block', marginTop: 10, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Bestellen</a>
        </div>
        <div style={{ ...S.beeld, background: k.hex }}>
          <img src={beeld} width="1200" height="1260" alt={`Kozijnloze deur afgelakt in RAL ${k.ral} ${k.naam}, vlak in een wand in dezelfde kleur`} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>
      <p style={{ ...S.p, fontSize: 13, margin: '10px 0 0' }}>Render van de deur in RAL {k.ral}, met de wand in dezelfde kleur. Kruk niet inbegrepen.</p>

      <section id="bestellen" aria-labelledby="bestellen-kop" style={{ scrollMarginTop: 110 }}>
        <h2 id="bestellen-kop" style={S.h2}>Bestellen</h2>
        <div style={{ marginBottom: 14 }}><BestelMoment wat="Een kozijnloze deur" /></div>
        <div style={S.bestel}><DeursetBestel ral={k.ral} /></div>
      </section>

      <h2 style={S.h2}>Andere kleuren</h2>
      <KleurTegels huidig={k.ral} />
      <p style={{ ...S.p, fontSize: 14.5, marginTop: 14 }}>Liever zelf schilderen in de kleur van je wand? <a href={`/winkel/${DEURSET.slug}/`} style={{ color: GROEN, fontWeight: 700 }}>De gegronde set</a>. Een andere RAL-kleur of freeswerk? <a href="/kozijnloze-deuren/configurator/" style={{ color: GROEN, fontWeight: 700 }}>Stel hem samen in de configurator</a>.</p>

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
