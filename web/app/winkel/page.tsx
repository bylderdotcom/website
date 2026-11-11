import type { Metadata } from 'next'
import PlintBeeld from './PlintBeeld'
import Tijdlijn from './Tijdlijn'
import { PLINT, SCHARNIER, DEURSET, SET_KLEUREN } from '@/lib/winkel'
import { S, INKT, GROEN } from './stijl'

/**
 * De Bylder-winkel (31-10-2026). Bylder verkoopt zelf; eerste producten: onzichtbare plint en verdekt
 * scharnier. Wat deze winkel anders maakt staat in de drie punten: hoeveelheden uit je plattegrond,
 * op het juiste moment in de bouw, en wie het monteert.
 */

const URL = 'https://www.bylder.com/winkel/'

export const metadata: Metadata = {
  title: 'Winkel: kozijnloze deuren, onzichtbare plinten en scharnieren | Bylder',
  description: 'Kozijnloze deuren als complete set, gegrond of in zes kleuren, plus onzichtbare plinten en verdekte scharnieren. Besteld bij Bylder, op tijd voor de stukadoor.',
  alternates: { canonical: URL },
}

// Alle deuren apart in beeld (11-11-2026, Daniel: "ik zie in de winkel maar 1 deur"): gegrond en de zes kleuren,
// elk met de render en de eigen pagina, zoals ze ook in de productlijst voor Google staan.
const DEUREN = [
  { href: `/winkel/${DEURSET.slug}/`, naam: 'Gegrond', sub: 'Meeschilderen in je wandkleur', beeld: 'gegrond' },
  ...SET_KLEUREN.map(k => ({ href: `/winkel/${DEURSET.slug}/ral-${k.ral}/`, naam: k.naam[0].toUpperCase() + k.naam.slice(1), sub: `Afgelakt RAL ${k.ral}`, beeld: k.ral })),
]

const PRODUCTEN = [
  { href: `/winkel/${PLINT.slug}/`, merk: PLINT.merk, naam: PLINT.naam, tekst: 'Inbouwplint vlak met de wand. Het pakket rekenen we uit je plattegrond.', beeld: <div style={{ padding: 16 }}><PlintBeeld /></div> },
  { href: `/winkel/${SCHARNIER.slug}/`, merk: SCHARNIER.merk, naam: SCHARNIER.naam, tekst: `Verborgen scharnier tot ${SCHARNIER.draagvermogenKg} kg per set, 3D verstelbaar.`,
    beeld: <img src="/img/winkel/dx38.webp" width="1000" height="1366" alt="Verdekt scharnier Basys DX-38 Design" style={{ height: 260, width: 'auto', display: 'block', margin: '12px auto' }} /> },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Bylder-winkel', url: URL,
      hasPart: [...DEUREN.map(d => ({ '@type': 'Product', name: `Classic Next kozijnloze deur ${d.naam.toLowerCase()}`, url: `https://www.bylder.com${d.href}` })), ...PRODUCTEN.map(p => ({ '@type': 'Product', name: `${p.merk} ${p.naam}`, url: `https://www.bylder.com${p.href}` }))] },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › Winkel</nav>
      <p style={S.oog}>Bylder-winkel</p>
      <h1 style={S.h1}>De winkel die je woning kent.</h1>
      <p style={S.lead}>Producten voor een strakke woning, besteld bij Bylder. We rekenen uit wat je nodig hebt uit je eigen plattegrond, en zeggen erbij wanneer het er moet zijn.</p>


      <h2 style={{ ...S.h2, marginTop: 20 }}>Kozijnloze deuren, als complete set</h2>
      <p style={{ ...S.p, margin: '0 0 14px' }}>Onzichtbaar kozijn, deurblad, verdekte scharnieren en magneetslot. Standaardhoogte of plafondhoog, exclusief kruk en montage. Levering in ongeveer {DEURSET.levertijdWeken} weken.</p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(min(46%, 136px), 1fr))', margin: '0 0 34px' }}>
        {DEUREN.map(d => (
          <a key={d.href} href={d.href} style={{ ...S.kaart, padding: 0, overflow: 'hidden', textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column' }}>
            <img src={`/img/winkel/deuren/origin-${d.beeld}-sm.webp`} width="400" height="420" loading="lazy" decoding="async" alt={`Kozijnloze deur ${d.naam.toLowerCase()}, ${d.sub.toLowerCase()}`} style={{ width: '100%', height: 'auto', aspectRatio: '400 / 420', objectFit: 'cover', display: 'block' }} />
            <span style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <strong style={{ fontSize: 15 }}>{d.naam}</strong>
              <span style={{ fontSize: 13, color: `${INKT}0.65)` }}>{d.sub}</span>
            </span>
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', margin: '6px 0 34px' }}>
        {[
          ['Uit je plattegrond', 'Staat je woning in Mijn woning, dan berekenen we de hoeveelheden per ruimte. Geen rekenwerk, geen overschot.'],
          ['Op tijd voor de bouw', 'Wat vóór de stukadoor de wand in moet, zeggen we erbij. Zo bestel je niet te laat.'],
          ['Ook gemonteerd', 'Laat je de afwerking door Bylder doen, dan nemen we het mee in dezelfde offerte.'],
        ].map(([t, p]) => (
          <div key={t} style={{ ...S.kaart, padding: '16px 18px' }}><h2 style={{ ...S.h3, fontSize: 16 }}>{t}</h2><p style={{ ...S.p, fontSize: 14.5, margin: 0 }}>{p}</p></div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        {PRODUCTEN.map(p => (
          <a key={p.href} href={p.href} style={{ ...S.kaart, padding: 0, overflow: 'hidden', textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#FAF7F1', borderBottom: `1px solid ${INKT}0.08)`, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.beeld}</div>
            <div style={{ padding: '16px 18px 20px' }}>
              <p style={{ ...S.oog, margin: '0 0 4px' }}>{p.merk}</p>
              <h2 style={{ ...S.h3, fontSize: '1.2rem' }}>{p.naam}</h2>
              <p style={{ ...S.p, fontSize: 15, margin: '0 0 12px' }}>{p.tekst}</p>
              <span style={{ color: GROEN, fontWeight: 800, fontSize: 15 }}>Bekijken en bestellen →</span>
            </div>
          </a>
        ))}
      </div>

      <h2 style={S.h2}>Op maat? Ontwerp het zelf, met prijs.</h2>
      <p style={S.p}>Past een standaardset niet, stel dan je eigen uitvoering samen. Je ziet hem in je woning en krijgt binnen twee werkdagen een offerte van Bylder.</p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        {[
          ['/kozijnloze-deuren/configurator/', 'Kozijnloze deur samenstellen', 'Plafondhoog, freeswerk, elke RAL-kleur of houtdecor. Prijs per deur.'],
          ['/gietvloer/ontwerpen/', 'Gietvloer ontwerpen', 'Kies vloer en kleur, zie hem in je eigen woning en vraag stalen aan.'],
          ['/kasten-op-maat/ontwerpen/', 'Kast op maat ontwerpen', 'Beschrijf je kast of upload een foto: je kast in 3D, met maten.'],
          ['/nieuwbouw-afwerken/#aanvraag', 'Alles in één offerte', 'Stucwerk, vloeren, deuren, tegels en kasten: één offerte, één planning.'],
        ].map(([href, t, p]) => (
          <a key={href} href={href} style={{ ...S.kaart, padding: '16px 18px', textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <strong style={{ fontSize: 16 }}>{t}</strong>
            <span style={{ fontSize: 14.5, color: `${INKT}0.72)`, lineHeight: 1.55, flex: 1 }}>{p}</span>
            <span style={{ color: GROEN, fontWeight: 800, fontSize: 14.5 }}>{href.startsWith('/nieuwbouw') ? 'Vraag een offerte aan →' : 'Begin met ontwerpen →'}</span>
          </a>
        ))}
      </div>

      <h2 style={S.h2}>Wat je wanneer regelt</h2>
      <p style={S.p}>In de volgorde van de bouw. Vul op een productpagina in wanneer de stukadoor komt, dan staan hier je datums bij.</p>
      <Tijdlijn />

      <p style={{ ...S.p, fontSize: 14, marginTop: 30 }}>Bylder is de verkoper. Je bestelling en de betaling lopen via ons; de leverancier levert rechtstreeks bij je af. <a href="/winkel/verzending-en-retour/" style={{ color: 'inherit' }}>Verzending en retour</a>: 14 dagen bedenktijd.</p>
    </main>
  )
}
