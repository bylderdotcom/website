import type { Metadata } from 'next'
import ProjectFilm from '../nieuwbouw-project/ProjectFilm'
import EigenVakmanMeekijken from '../components/EigenVakmanMeekijken'
import { VANAF, euroRond } from '../kozijnloze-deuren/configurator/prijs'
import { GIET_PRIJS_M2 } from '../components/gietvloer/gegevens'

/**
 * VOORBEELD van een nieuwe homepage (UX-audit 11-11-2026, verzoek Daniel: "eerst als voorbeeld bouwen").
 * De echte homepage is op een telefoon 22 schermen met 15 blokken en 101 links. Dit voorstel heeft zes
 * blokken en één doel: de bezoeker zet zijn woning in 3D. Vanuit daar volgen deuren, vloer, kast en de offerte.
 *
 * Niet in Google (noindex) en nergens gelinkt. Keurt Daniel het goed, dan vervangt dit app/page.tsx en
 * verhuizen de blokken die hier niet staan (merken, prijscheck, na de oplevering, kosten per gemeente,
 * op maat laten maken, tijdlijn) naar hun eigen pagina's.
 */

export const metadata: Metadata = {
  title: 'Voorbeeld nieuwe homepage | Bylder',
  robots: { index: false, follow: false },
}

const INKT = 'rgba(26,18,8,'
const GROEN = '#3D5A3E'
const WONING = '/mijn-woning/'
const H2: React.CSSProperties = { fontSize: 'clamp(1.5rem, 3.4vw, 2.1rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 10px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 17, lineHeight: 1.65, color: `${INKT}0.72)`, margin: 0, maxWidth: '60ch' }
const KNOP: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', minHeight: 48, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '0 22px', borderRadius: 12, textDecoration: 'none' }
const KNOP2: React.CSSProperties = { ...KNOP, background: 'transparent', color: GROEN, border: `1.5px solid ${GROEN}` }

const PRODUCTEN = [
  { naam: 'Deuren zonder kozijn', tekst: 'Plafondhoog en vlak in de wand. Kies kleur, groefpatroon en kruk.', prijs: `Vanaf ${euroRond(VANAF)} per deur`, href: '/kozijnloze-deuren/configurator/', knop: 'Stel je deur samen',
    img: '/img/winkel/deuren/origin-6005-sm.webp', alt: 'Kozijnloze deur in mosgroen, vlak in een wand in dezelfde kleur', meet: 'home-deuren' },
  { naam: 'Gietvloer', tekst: 'Eén vloer zonder naden. Zie de kleur in je eigen kamers en vraag drie stalen aan.', prijs: `€ ${GIET_PRIJS_M2[0]} tot € ${GIET_PRIJS_M2[1]} per m²`, href: '/gietvloer/ontwerpen/', knop: 'Ontwerp je gietvloer',
    img: '/img/klusseniers/gietvloer-foto.jpg', alt: 'Lichtgrijze gietvloer in een ruimte met twee okergele fauteuils', meet: 'home-gietvloer' },
  { naam: 'Kast op maat', tekst: 'Beschrijf je kast of upload een foto. Je ziet hem in 3D, met maten.', prijs: 'Gratis ontwerpen en inmeten', href: '/kasten-op-maat/ontwerpen/', knop: 'Ontwerp je kast',
    img: '/img/kasten/hoekkast-3d-sm.jpg', alt: 'Hoekkast op maat in 3D, uit de kastontwerper', meet: 'home-kast' },
]

// Zes beelden uit zes hoeken van het aanbod, elk naar zijn eigen pagina.
const GALERIJ = [
  { titel: 'Deuren zonder kozijn', tekst: 'Geplaatst in een woning, vlak in de wand', img: '/img/classic-next/portfolio-wit-bad-sm.webp', alt: 'Witte kozijnloze deur naast een vrijstaand bad', href: '/kozijnloze-deuren/' },
  { titel: 'Gietvloer', tekst: 'Naadloos door de hele verdieping', img: '/img/klusseniers/gietvloer-foto.jpg', alt: 'Lichtgrijze gietvloer met twee okergele fauteuils', href: '/gietvloer/' },
  { titel: 'Kast op maat', tekst: 'Ontworpen in 3D, gemaakt door een timmerbedrijf', img: '/img/kasten/hoekkast-3d-sm.jpg', alt: 'Blauwe hoekkast op maat in 3D', href: '/kasten-op-maat/' },
  { titel: 'Slaapkamer', tekst: 'Auping, met korting tot 10%', img: '/img/auping-noble-solid-oak-sm.webp', alt: 'Auping bed van massief eiken in een lichte slaapkamer', href: '/vouchers/auping/' },
  { titel: 'Tuin', tekst: 'Schutting die niet elk jaar geolied hoeft', img: '/img/gardenwall-weo35-sm.webp', alt: 'Composiet schutting in teakkleur langs een tuinpad', href: '/tuin-aanleggen/schutting-schermen/' },
  { titel: 'Ventilatie', tekst: 'Weggewerkt in het plafond', img: '/img/noshow-ventilatie-sm.webp', alt: 'Ventilatierooster als dunne ring in een badkamerplafond', href: '/woning-verduurzamen/ventilatie/' },
]

const VRAGEN: [string, string][] = [
  ['Wat doet Bylder?', 'Je uploadt de tekening van je woning. Bylder maakt er je woning in 3D van, met de maten per ruimte. Daarin kies je deuren, vloer en kasten, en je vraagt één offerte aan voor de afwerking.'],
  ['Wat kost het?', 'Ontwerpen is gratis en kan zonder account. Laat je iets maken of afwerken, dan betaal je de prijs in de offerte. Je beslist pas na een definitieve prijs.'],
  ['Werkt het ook bij een bestaand huis?', 'Ja. Een plattegrond van de makelaar of een bouwtekening is genoeg, voor nieuwbouw en voor een verbouwing.'],
  ['Kan mijn eigen vakman meedoen?', 'Ja. Je nodigt hem uit met zijn e-mailadres. Hij ziet je woning met je keuzes en zet zijn offerte ernaast.'],
]

export default function Voorbeeld() {
  return (
    <main style={{ background: '#F5F0E8', color: '#1A1208' }}>
      <style>{`
        .hv{max-width:1120px;margin:0 auto;padding:0 20px}
        .hv-held{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:40px;align-items:center;padding-top:48px;padding-bottom:56px}
        .hv-drie{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
        .hv-gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
        @media(max-width:860px){.hv-gal{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}
        .hv-afw{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:28px;align-items:center}
        .hv-blok{padding-top:56px}
        @media(max-width:860px){.hv-held{grid-template-columns:minmax(0,1fr);gap:24px;padding-top:28px;padding-bottom:36px}.hv-drie{grid-template-columns:minmax(0,1fr)}.hv-afw{grid-template-columns:minmax(0,1fr)}.hv-blok{padding-top:40px}}
        .hv-vr{border-top:1px solid ${INKT}0.12)}.hv-vr:last-of-type{border-bottom:1px solid ${INKT}0.12)}
        .hv-vr>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:56px;font-weight:700;font-size:17px}
        .hv-vr>summary::-webkit-details-marker{display:none}
        .hv-vr>summary::after{content:"";flex:none;width:10px;height:10px;border-right:2px solid ${GROEN};border-bottom:2px solid ${GROEN};transform:rotate(45deg);margin-right:6px}
        .hv-vr[open]>summary::after{transform:rotate(-135deg)}
      `}</style>

      <p style={{ margin: 0, padding: '8px 20px', background: '#1A1208', color: '#F5F0E8', fontSize: 13.5, textAlign: 'center' }}>
        Voorbeeld van de nieuwe homepage. Niet zichtbaar voor bezoekers en niet in Google.
      </p>

      {/* 1. Kop: één belofte, één knop. */}
      <section className="hv hv-held" aria-labelledby="hv-kop">
        <div>
          <h1 id="hv-kop" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.03, margin: '0 0 16px', textWrap: 'balance' }}>
            Van sleutel tot ingericht huis.
          </h1>
          <p style={{ ...P, fontSize: 19, marginBottom: 22 }}>
            Upload je tekening en zie je woning in 3D. Kies je deuren, vloer en kasten op hun plek, en laat het afwerken in één offerte.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href={WONING} data-meet="home-3d" style={KNOP}>Zet je woning in 3D</a>
            <a href="/mijn-woning/?voorbeeld" data-meet="home-voorbeeld" style={KNOP2}>Bekijk een voorbeeld</a>
          </div>
          <p style={{ fontSize: 14, color: `${INKT}0.6)`, margin: '12px 0 0' }}>Gratis, zonder account. Voor nieuwbouw en bestaande bouw.</p>
        </div>
        {/* 2. De film: tekening, muren, vloer, deuren, kast. Laadt pas als hij in beeld komt. */}
        <div id="sleutel-film" style={{ position: 'relative', aspectRatio: '1200 / 712', borderRadius: 20, overflow: 'hidden', background: '#E9E4DA', border: `1px solid ${INKT}0.1)` }}>
          <img src="/img/voorbeeldwoning-3d-v2.webp" srcSet="/img/voorbeeldwoning-3d-v2-sm.webp 600w, /img/voorbeeldwoning-3d-v2.webp 1200w" sizes="(max-width:860px) 100vw, 560px"
            width={1200} height={712} fetchPriority="high" alt="Een woning in 3D met witte muren, een gietvloer, deuren zonder kozijn en een kast op maat"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </section>
      <ProjectFilm />

      {/* 3. Drie producten. */}
      <section className="hv" aria-labelledby="hv-prod">
        <h2 id="hv-prod" style={H2}>Kies wat er in je woning komt</h2>
        <p style={{ ...P, marginBottom: 20 }}>Elk met prijs, in je eigen maten.</p>
        <div className="hv-drie">
          {PRODUCTEN.map(p => (
            <a key={p.href} href={p.href} data-meet={p.meet} style={{ background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 18, overflow: 'hidden', textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'block', position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', background: '#E9E4DA' }}>
                <img src={p.img} alt={p.alt} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
              <span style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <strong style={{ fontSize: 20, letterSpacing: '-0.01em' }}>{p.naam}</strong>
                <span style={{ fontSize: 15.5, lineHeight: 1.55, color: `${INKT}0.72)`, flex: 1 }}>{p.tekst}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{p.prijs}</span>
                <span style={{ color: GROEN, fontWeight: 800, fontSize: 15.5 }}>{p.knop} →</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 4. Afwerken door Bylder. */}
      <section className="hv hv-blok" aria-labelledby="hv-afw">
        <div className="hv-afw" style={{ background: GROEN, color: '#F5F0E8', borderRadius: 20, padding: 'clamp(24px, 5vw, 44px)' }}>
          <div>
            <h2 id="hv-afw" style={{ ...H2, color: '#F5F0E8' }}>Laat het afwerken door Bylder</h2>
            <p style={{ ...P, color: '#DCE6D8' }}>Stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten. Eén offerte uit je tekening, één planning, één aanspreekpunt.</p>
          </div>
          <div><a href="/nieuwbouw-afwerken/#aanvraag" data-meet="home-afwerken" style={{ ...KNOP, background: '#F5F0E8', color: GROEN }}>Vraag een offerte aan</a></div>
        </div>
      </section>

      {/* 5. Bewijs, breder dan deuren (Daniel, 11-11-2026: "we zijn veel meer dan dat"). */}
      <section className="hv hv-blok" aria-labelledby="hv-breed">
        <h2 id="hv-breed" style={H2}>Van vloer tot tuin</h2>
        <p style={{ ...P, marginBottom: 20 }}>Wat je bij Bylder kiest en laat maken, voor in huis en eromheen.</p>
        <div className="hv-gal">
          {GALERIJ.map(g => (
            <a key={g.href + g.titel} href={g.href} data-meet="home-galerij" style={{ textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ display: 'block', position: 'relative', aspectRatio: '4 / 3', borderRadius: 14, overflow: 'hidden', background: '#E9E4DA' }}>
                <img src={g.img} alt={g.alt} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
              <span style={{ fontSize: 15.5, lineHeight: 1.4 }}><strong>{g.titel}</strong><br /><span style={{ color: `${INKT}0.65)`, fontSize: 14.5 }}>{g.tekst}</span></span>
            </a>
          ))}
        </div>
        <EigenVakmanMeekijken campagne="homepage-voorbeeld" marge="40px 0 0" />
      </section>

      {/* 6. Vier vragen. */}
      <section className="hv hv-blok" aria-labelledby="hv-vr" style={{ paddingBottom: 72 }}>
        <h2 id="hv-vr" style={{ ...H2, marginBottom: 16 }}>Kort en eerlijk</h2>
        <div style={{ maxWidth: 760 }}>
          {VRAGEN.map(([v, a]) => (
            <details key={v} className="hv-vr"><summary>{v}</summary><p style={{ ...P, fontSize: 16, padding: '0 0 18px' }}>{a}</p></details>
          ))}
        </div>
      </section>
    </main>
  )
}
