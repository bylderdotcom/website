import type { Metadata } from 'next'

/**
 * /beurs/funnel/ — het samenwerkingsschema om met Classic Next te delen.
 *
 * WAAROM DEZE PAGINA BESTAAT
 * Daniel wilde één link kunnen sturen in plaats van een PDF: wat staat er klaar
 * rond de Beurs Eigen Huis, wat moet er nog gebouwd worden, en wat hebben we van
 * Classic Next nodig. Een pagina is bovendien bij te werken zonder opnieuw te
 * versturen — als er iets live gaat, klopt de link vanzelf weer.
 *
 * WAAROM ONDER /beurs/
 * Het adres moet door de telefoon te noemen zijn. /beurs en /beurs/tablet gaan
 * al naar de configurator (tijdelijke omleidingen in vercel.json, exacte paden),
 * dus /beurs/funnel botst daar niet mee en hoort er qua naam wél bij.
 *
 * NOINDEX, EN NIET IN DE SITEMAP
 * Dit is een deelbaar document, geen publieke pagina. Hij staat nergens in de
 * navigatie en wordt nergens naartoe gelinkt; wie de URL heeft, kan hem lezen.
 *
 * ALLES WAT HIER "LIVE" HEET, IS GECONTROLEERD
 * Op 13-09-2026 stuk voor stuk opgevraagd op www.bylder.com. Geen enkel cijfer
 * over bereik of besparing staat erin: alleen dingen die te tellen zijn. Zie
 * het opschonen van 12-09 voor waarom dat hier een harde regel is.
 */

const SITE = 'https://www.bylder.com'

export const metadata: Metadata = {
  title: 'Bylder × Classic Next — wat er klaarstaat',
  description:
    'Van landingspagina tot getekende offerte: welke onderdelen draaien, wat er nog gebouwd wordt, '
    + 'en wat we van Classic Next nodig hebben voor de Beurs Eigen Huis.',
  alternates: { canonical: `${SITE}/beurs/funnel/` },
  robots: { index: false, follow: false },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

const LABEL: React.CSSProperties = {
  fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.09em', color: `${INKT}0.55)`, fontWeight: 700,
}
const H2: React.CSSProperties = {
  fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#1A1208', textWrap: 'balance',
}
const P: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.7, color: `${INKT}0.8)`, margin: 0, maxWidth: '68ch' }
const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14, padding: 22,
  display: 'grid', gap: 9, alignContent: 'start',
}
const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace", fontSize: 12, color: `${INKT}0.55)` }

function Stand({ soort, tekst }: { soort: 'live' | 'komt' | 'bouw'; tekst: string }) {
  const kleur = soort === 'live' ? GROEN : soort === 'komt' ? '#8A6A12' : ROEST
  const vlak = soort === 'live' ? 'rgba(61,90,62,0.10)' : soort === 'komt' ? 'rgba(166,124,31,0.14)' : 'rgba(184,92,56,0.10)'
  return (
    <span style={{
      fontFamily: "'Space Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', padding: '5px 9px', borderRadius: 999, whiteSpace: 'nowrap',
      background: vlak, color: kleur,
    }}>{tekst}</span>
  )
}

function Fase({ titel, wanneer, children }: { titel: string; wanneer: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 14px',
        borderBottom: `2px solid ${INKT}0.13)`, paddingBottom: 10,
      }}>
        <h2 style={{ ...H2, fontSize: '1.32rem' }}>{titel}</h2>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: ROEST }}>{wanneer}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(258px,1fr))', gap: 14 }}>{children}</div>
    </section>
  )
}

function Kaart({ kop, stand, standTekst, children }: {
  kop: string; stand: 'live' | 'komt' | 'bouw'; standTekst: string; children: React.ReactNode
}) {
  return (
    <div style={KAART}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0, color: '#1A1208' }}>{kop}</h3>
        <Stand soort={stand} tekst={standTekst} />
      </div>
      {children}
    </div>
  )
}

export default function ClassicNextPagina() {
  return (
    <main style={{ maxWidth: 1200, boxSizing: 'border-box', margin: '0 auto', padding: '48px 24px 80px', color: '#1A1208', display: 'grid', gap: 54 }}>

      <header style={{ display: 'grid', gap: 16 }}>
        <div style={{ ...MONO, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
          <span>Bylder × Classic Next</span><span>Bijgewerkt 19 september 2026</span>
          <span style={{ color: ROEST, fontWeight: 700 }}>Beurs Eigen Huis: 9–11 oktober</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,4.6vw,2.9rem)', fontWeight: 800, letterSpacing: '-0.028em', lineHeight: 1.05, margin: 0, textWrap: 'balance' }}>
          Wat er voor jullie klaarstaat
        </h1>
        <p style={{ ...P, fontSize: 17.5, maxWidth: '64ch' }}>
          Van de eerste klik tot een getekende offerte. Dit schema laat zien wat er vandaag al draait,
          wat er nog gebouwd wordt vóór de beurs, en wat we van jullie nodig hebben. Eén pagina, altijd
          de laatste stand — hier hoef je geen mail voor terug te zoeken.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Stand soort="live" tekst="Staat live" />
          <Stand soort="komt" tekst="Afgesproken, komt eraan" />
          <Stand soort="bouw" tekst="Nog te bouwen" />
        </div>
      </header>

      <section style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...LABEL, color: GROEN }}>Verwerkt · 15 september</span>
          <h2 style={H2}>Wat er sinds jullie test is veranderd</h2>
          <p style={P}>
            Thijs stuurde op 14 september zijn bevindingen, en op 18 september de CAD-tekeningen.
            Alles hieronder staat inmiddels live en is te bekijken op{' '}
            <a href="/kozijnloze-deuren/configurator/" style={{ color: GROEN, fontWeight: 700 }}>
              de configurator
            </a>.
          </p>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {[
            ['De magneetsloten staan erop.',
             'De foto\u2019s hadden we al, ze stonden alleen niet op het scherm. Je kiest nu eerst het type \u2014 loop, dag- en nacht, vrij/bezet \u2014 en daaronder de afwerking, met foto erbij.'],
            ['Alle dertien ontwerpen nagemeten op jullie eigen tekeningen.',
             'De achttien CAD-tekeningen die Elisa terugvond bevatten alle dertien ontwerpen, plus vijf varianten die nooit in de reeks zijn gekomen. Daarmee hoeft er niets meer geschat te worden: elke groef staat er als twee lijnen op 3 mm van elkaar, op een blad van 900 bij 2315 mm. Elke groefpositie in de configurator komt nu daaruit.'],
            ['De omlijsting stond te ver van de boven- en onderrand.',
             'Bij Solace, Halo, Horizon en Ember. In de tekening ligt de kaderlijn 139,5 mm van de zijkant en 127,5 mm van boven en onder; bij ons werd één marge voor beide richtingen gebruikt, wat op de hoogte ruim 31 cm werd.'],
            ['Horizon en Ember hadden een vormfout.',
             'Horizon bestaat uit twee halve cirkels met hun platte kant tegen de linker kaderlijn, waarvan de buitenste precies de rechter kaderlijn raakt. De visgraat van Ember wijst weer omhoog, loopt onder exact 45 graden van kaderlijn tot kaderlijn, en wordt boven en onder door het kader afgesneden.'],
            ['Acht houtdecors zitten in de configurator.',
             'Het Unilin-materiaal was ruim bruikbaar. Oslo Oak tanned red ging er op 15 september in; de zeven die Thijs op 16 september nastuurde staan er nu ook — Oslo Oak cocoa brown, Valley Ash sunlit brown, Dainty Oak latte, Robinson Oak light natural, Master Oak natural, Master Oak patina en Kivu Wenge. Kies bij Afwerking \u201cFineer\u201d en dan een decor. Elke nerf ligt op ware grootte: de maat staat in het V-Ray-bestand, en die verschilt per decor — van 1300 bij 1300 mm tot 3040 bij 1270 mm, een hele plaat.'],
            ['Het heet geen fineer meer, maar houtdecor.',
             'Bij de afwerking stond \u201cEcht houtfineer\u201d. Dat klopt niet voor HPL: dat is een geperst houtdecor. Thijs bevestigde op 18 september dat Classic Next uitsluitend HPL levert. Op de offerte staat nu de Unilin-naam zonder artikelnummer, zoals jullie het zelf doen.'],
            ['3D is nu de standaardweergave.',
             'Het gerenderde beeld is destijds gemaakt met de oude, verkeerde maten en klopt dus niet meer. De 3D-weergave tekent de groeven uit onze eigen gegevens en is wél juist. Zodra er nieuwe renders zijn, draaien we dit terug.'],
          ].map(([kop, tekst]) => (
            <li key={kop} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 12, padding: '14px 16px', fontSize: 14.5, lineHeight: 1.6 }}>
              <span aria-hidden="true" style={{ color: GROEN, fontWeight: 800, fontSize: 16, lineHeight: '22px' }}>&#10003;</span>
              <span style={{ color: `${INKT}0.8)` }}><b style={{ color: '#1A1208' }}>{kop}</b> {tekst}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={LABEL}>Het geheel in één beeld</span>
          <h2 style={H2}>De route van bezoeker naar geplaatste deur</h2>
          <p style={P}>
            Drie momenten — vóór de beurs, op de beurs, en erna — met onderaan de gezamenlijke afloop:
            elke aanvraag komt in hetzelfde loket, Classic Next offreert, de klant tekent bij Bylder,
            en een vakman plaatst.
          </p>
        </div>
        <figure style={{ margin: 0, display: 'grid', gap: 14, background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24 }}>
          <div style={{ overflowX: 'auto' }}>
            <svg viewBox="0 0 900 590" role="img" style={{ display: 'block', minWidth: 800, width: '100%', height: 'auto', color: '#3D2E1E' }}
              aria-label="Schema in drie fasen. Vóór de beurs staan vijf deurpagina's, een aankondigingsbalk op de hele site, de aanvraag voor 25 gratis kaarten en een ledenvoucher van 5 procent — alles live. Op de beurs: twee korte webadressen voor de eigen telefoon en voor het scherm op de stand, en de configurator met offerteaanvraag — alles live. Na de beurs staat het automatische account met Mijn offertes live; ook de mailing na de beurs staat klaar; alleen de vermelding van showroom Uden en het Bylder-adviespunt in Rotterdam moet nog in de showroomgids. Alle drie de fasen komen uit in het offerteloket, waarna Classic Next offreert, de klant in Bylder tekent en een vakman plaatst.">
              <defs>
                <marker id="cnpijl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
              </defs>
              <g fontFamily="Plus Jakarta Sans, system-ui, sans-serif">
                <g fontFamily="Space Mono, monospace" fontSize="11.5" fontWeight="700">
                  <text x="30" y="22" fill="currentColor">VÓÓR DE BEURS</text>
                  <text x="330" y="22" fill="currentColor">9 · 10 · 11 OKTOBER</text>
                  <text x="630" y="22" fill="currentColor">NA DE BEURS</text>
                </g>
                <g fontSize="11" fill="currentColor" fillOpacity=".6" fontFamily="Space Mono, monospace">
                  <text x="30" y="38">t/m 8 oktober</text>
                  <text x="330" y="38">op de stand</text>
                  <text x="630" y="38">vanaf 12 oktober</text>
                </g>
                <g stroke="currentColor" strokeOpacity=".14">
                  <line x1="310" y1="10" x2="310" y2="470" /><line x1="610" y1="10" x2="610" y2="470" />
                </g>

                {/* Fase 1 */}
                <rect x="30" y="52" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="44" y="74" fontSize="13" fontWeight="700" fill="currentColor">Vijf pagina&apos;s over de deur</text>
                <text x="44" y="92" fontSize="11.5" fill="currentColor" fillOpacity=".78">merk · 13 ontwerpen · prijzen · montage</text>
                <text x="44" y="105" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · ~6.500 woorden</text>

                <rect x="30" y="120" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="44" y="142" fontSize="13" fontWeight="700" fill="currentColor">Balk op élke pagina</text>
                <text x="44" y="160" fontSize="11.5" fill="currentColor" fillOpacity=".78">&#8220;25 gratis kaarten&#8221; &#8594; landingspagina</text>
                <text x="44" y="173" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · 8.747 pagina&apos;s</text>

                <rect x="30" y="188" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="44" y="210" fontSize="13" fontWeight="700" fill="currentColor">Kaarten aanvragen</text>
                <text x="44" y="228" fontSize="11.5" fill="currentColor" fillOpacity=".78">in het Bylder-account, max 2, per post</text>
                <text x="44" y="241" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · sluit 5 oktober</text>

                <rect x="30" y="256" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="44" y="278" fontSize="13" fontWeight="700" fill="currentColor">Ledenvoucher 5%</text>
                <text x="44" y="296" fontSize="11.5" fill="currentColor" fillOpacity=".78">in het assortiment en de rekenhulp</text>
                <text x="44" y="309" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE</text>

                {/* Fase 2 */}
                <rect x="330" y="52" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="344" y="74" fontSize="13" fontWeight="700" fill="currentColor">bylder.com/beurs</text>
                <text x="344" y="92" fontSize="11.5" fill="currentColor" fillOpacity=".78">de telefoon van de bezoeker zelf</text>
                <text x="344" y="105" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · herkomst &#8220;beurs&#8221;</text>

                <rect x="330" y="120" width="258" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="344" y="142" fontSize="13" fontWeight="700" fill="currentColor">Het scherm op de stand</text>
                <text x="344" y="160" fontSize="11.5" fill="currentColor" fillOpacity=".78">laptop of tablet · wisknop per bezoeker</text>
                <text x="344" y="173" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · eigen herkomst</text>

                <rect x="330" y="188" width="258" height="126" rx="9" fill={GROEN} fillOpacity=".08" stroke={GROEN} strokeWidth="2" />
                <text x="344" y="212" fontSize="14" fontWeight="800" fill="currentColor">De configurator</text>
                <text x="344" y="232" fontSize="11.5" fill="currentColor" fillOpacity=".82">13 freesontwerpen · elke RAL-kleur</text>
                <text x="344" y="249" fontSize="11.5" fill="currentColor" fillOpacity=".82">beslag, draairichting, naam per deur</text>
                <text x="344" y="266" fontSize="11.5" fill="currentColor" fillOpacity=".82">3D-beeld dat met het licht meedraait</text>
                <text x="344" y="286" fontSize="11.5" fill="currentColor" fillOpacity=".82">&#8594; offerte met sluitende specificatie</text>
                <text x="344" y="305" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · geen prijs in beeld</text>

                {/* Fase 3 */}
                <rect x="630" y="52" width="240" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="644" y="74" fontSize="13" fontWeight="700" fill="currentColor">Account + Mijn offertes</text>
                <text x="644" y="92" fontSize="11.5" fill="currentColor" fillOpacity=".78">aanvrager krijgt er vanzelf een</text>
                <text x="644" y="105" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE</text>

                <rect x="630" y="120" width="240" height="58" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="644" y="142" fontSize="13" fontWeight="700" fill="currentColor">Mailing na de beurs</text>
                <text x="644" y="160" fontSize="11.5" fill="currentColor" fillOpacity=".78">naar iedereen die iets samenstelde</text>
                <text x="644" y="173" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE · verzendknop klaar</text>

                <rect x="630" y="188" width="240" height="76" rx="9" fill="none" stroke={ROEST} strokeWidth="1.6" strokeDasharray="5 4" />
                <text x="644" y="210" fontSize="13" fontWeight="700" fill="currentColor">Waar je de deur ziet</text>
                <text x="644" y="228" fontSize="11.5" fill="currentColor" fillOpacity=".78">showroom Uden · adviespunt Rotterdam</text>
                <text x="644" y="245" fontSize="11.5" fill="currentColor" fillOpacity=".78">in de showroomgids van Bylder</text>
                <text x="644" y="259" fontSize="10" fontFamily="Space Mono, monospace" fill={ROEST}>TE BOUWEN</text>

                {/* Naar de ruggengraat */}
                <g stroke="currentColor" strokeWidth="1.4" fill="none">
                  <path d="M159,314 L159,400" markerEnd="url(#cnpijl)" />
                  <path d="M459,314 L459,400" markerEnd="url(#cnpijl)" />
                  <path d="M750,264 L750,400" markerEnd="url(#cnpijl)" />
                </g>
                <g fontSize="10.5" fill="currentColor" fillOpacity=".62" fontFamily="Space Mono, monospace">
                  <text x="166" y="360">bezoeker met een plan</text>
                  <text x="466" y="360">bezoeker op de stand</text>
                  <text x="672" y="360">wie terugkomt</text>
                </g>

                {/* Ruggengraat */}
                <rect x="30" y="404" width="840" height="66" rx="12" fill={GROEN} fillOpacity=".12" stroke={GROEN} strokeWidth="1.8" />
                <text x="48" y="428" fontSize="14" fontWeight="800" fill="currentColor">Het offerteloket</text>
                <text x="48" y="448" fontSize="11.5" fill="currentColor" fillOpacity=".82">Elke aanvraag komt hier binnen mét de volledige specificatie — ontwerp, kleur, beslag, aantal, plek in huis.</text>
                <text x="48" y="463" fontSize="10" fontFamily="Space Mono, monospace" fill={GROEN}>LIVE SINDS 11 SEPTEMBER</text>

                {/* Afloop: vier stappen */}
                <g stroke="currentColor" strokeWidth="1.4" fill="none">
                  <path d="M140,470 L140,502" markerEnd="url(#cnpijl)" />
                </g>
                <rect x="30" y="506" width="196" height="52" rx="9" fill="none" stroke="currentColor" strokeOpacity=".45" />
                <text x="42" y="526" fontSize="12" fontWeight="700" fill="currentColor">Classic Next offreert</text>
                <text x="42" y="543" fontSize="10.5" fill="currentColor" fillOpacity=".72">ziet postcode en plaats</text>

                <rect x="248" y="506" width="196" height="52" rx="9" fill="none" stroke="currentColor" strokeOpacity=".45" />
                <text x="260" y="526" fontSize="12" fontWeight="700" fill="currentColor">Klant tekent in Bylder</text>
                <text x="260" y="543" fontSize="10.5" fill="currentColor" fillOpacity=".72">daarna pas contactgegevens</text>

                <rect x="466" y="506" width="196" height="52" rx="9" fill="none" stroke="currentColor" strokeOpacity=".45" />
                <text x="478" y="526" fontSize="12" fontWeight="700" fill="currentColor">Vakman meet in</text>
                <text x="478" y="543" fontSize="10.5" fill="currentColor" fillOpacity=".72">controle vóór productie</text>

                <rect x="684" y="506" width="186" height="52" rx="9" fill="none" stroke={GROEN} strokeWidth="1.6" />
                <text x="696" y="526" fontSize="12" fontWeight="700" fill="currentColor">Vakman plaatst</text>
                <text x="696" y="543" fontSize="10.5" fill="currentColor" fillOpacity=".72">landelijk netwerk</text>

                <g stroke="currentColor" strokeWidth="1.4" fill="none">
                  <path d="M226,532 L244,532" markerEnd="url(#cnpijl)" />
                  <path d="M444,532 L462,532" markerEnd="url(#cnpijl)" />
                  <path d="M662,532 L680,532" markerEnd="url(#cnpijl)" />
                </g>
              </g>
            </svg>
          </div>
          <figcaption style={{ fontSize: 14, color: `${INKT}0.6)` }}>
            Acht van de tien onderdelen draaien vandaag. De twee gestippelde zijn de mailing na de beurs
            en de vermelding van de plekken waar je de deur in het echt kunt zien.
          </figcaption>
        </figure>
      </section>

      <Fase titel="Vóór de beurs" wanneer="nu al live">
        <Kaart kop="De pagina's over de deur" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            Vijf pagina&apos;s, samen ongeveer 6.500 woorden, gericht op iemand die nog niet weet dat een
            kozijnloze deur bestaat.
          </p>
          <ul style={{ margin: 0, paddingLeft: 17, display: 'grid', gap: 4, fontSize: 14, lineHeight: 1.55, color: `${INKT}0.8)` }}>
            <li><strong>Kozijnloze deuren</strong> — prijzen en wanneer je kiest</li>
            <li><strong>Classic Next</strong> — het merk en het systeem</li>
            <li><strong>Freesdeuren</strong> — alle 13 ontwerpen met foto</li>
            <li><strong>Configurator</strong> — zelf samenstellen</li>
            <li><strong>Voor vakbedrijven</strong> — montage, training, commissie</li>
          </ul>
          <span style={MONO}>bylder.com/kozijnloze-deuren/</span>
        </Kaart>

        <Kaart kop="De oproep voor kaarten" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            Bovenaan élke pagina van de site staat een donkere balk: 25 gratis kaarten voor de Beurs
            Eigen Huis, aangeboden via Classic Next. Die balk staat op 8.747 pagina&apos;s, niet alleen op
            de homepage.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Aanvragen gaat in het Bylder-account: maximaal twee per persoon, thuisbezorgd per post,
            sluit 5 oktober. De grens zit in de database, dus de laatste kaart kan niet twee keer weg.
          </p>
          <span style={MONO}>bylder.com/beurs-eigen-huis/</span>
        </Kaart>

        <Kaart kop="De ledenvoucher" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            5% korting op kozijnloze deuren voor Bylder-leden, zichtbaar tussen de 56 woonmerken die
            korting geven.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Op de vouchers-pagina staat sinds deze week een rekenhulp: de bezoeker vult in wat hij aan
            vloer, meubels en binnendeuren denkt uit te geven en ziet wat de korting hem scheelt.
            Binnendeuren staan daar als eigen regel in.
          </p>
          <span style={MONO}>bylder.com/vouchers/</span>
        </Kaart>
      </Fase>

      <Fase titel="Op de beurs" wanneer="9, 10 en 11 oktober">
        <Kaart kop="Twee korte adressen" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            <strong>bylder.com/beurs</strong> — voor de bezoeker die zijn eigen telefoon gebruikt, via
            een QR-code of gewoon ingetikt.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            <strong>bylder.com/beurs/tablet</strong> — voor het scherm dat op de stand ligt, of dat nu
            een laptop of een tablet is. Daar staat bovenaan een knop &#8220;Begin opnieuw voor de
            volgende bezoeker&#8221;, die de deur en de ingevulde velden van de vorige bezoeker wist.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Beide onthouden waar iemand vandaan kwam, ook als hij eerst rondkijkt en pas later een
            offerte aanvraagt. Een beursaanvraag is daardoor te onderscheiden van een aanvraag via Google.
          </p>
        </Kaart>

        <Kaart kop="De configurator" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            Alle 13 freesontwerpen, elke RAL-kleur, beslag en draairichting. Elke deur krijgt een naam —
            &#8220;hal&#8221;, &#8220;slaapkamer&#8221; — zodat de offerte later leesbaar is.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Het beeld is echt 3D: een groef is een schaduw, dus wat in gebroken wit fluistert, roept in
            antraciet. Dat is precies het argument dat op een stand moeilijk uit te leggen is en op een
            scherm vanzelf gaat.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            <strong>Er staat geen prijs in beeld.</strong> De bezoeker stelt samen en vraagt een offerte
            aan; het bedrag komt van Classic Next.
          </p>
        </Kaart>

        <Kaart kop="Wat er van de stand komt" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            Een offerteaanvraag met de volledige specificatie: per deur het ontwerp, de kleur, de
            afwerking, het beslag en de draairichting. Plus naam, e-mail, telefoon, postcode, plaats en
            de planning van de koper.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Geen vrij tekstveld dus, en geen terugbelrondje om te vragen wat iemand ook alweer koos.
          </p>
        </Kaart>
      </Fase>

      <Fase titel="Na de beurs" wanneer="vanaf 12 oktober">
        <Kaart kop="Iedereen houdt zijn ontwerp" stand="live" standTekst="Live">
          <p style={{ ...P, fontSize: 14.5 }}>
            Wie op de beurs een offerte aanvraagt, krijgt automatisch een Bylder-account en ziet zijn
            aanvraag terug onder &#8220;Mijn offertes&#8221;, met de specificatie erbij. Zijn ontwerp is
            dus niet weg zodra hij de Jaarbeurs uitloopt.
          </p>
        </Kaart>

        <Kaart kop="De mailing" stand="bouw" standTekst="Te bouwen">
          <p style={{ ...P, fontSize: 14.5 }}>
            Naar iedereen die op de beurs iets samenstelde maar nog geen offerte aanvroeg: zijn eigen
            ontwerp terug in beeld, met één knop om het alsnog te laten uitrekenen.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Dit bestaat nog niet. Het staat gepland vóór de beurs, want de gegevens moeten tijdens de
            beurs al goed worden vastgelegd — daarna is het te laat.
          </p>
        </Kaart>

        <Kaart kop="Waar je de deur ziet" stand="bouw" standTekst="Te bouwen">
          <p style={{ ...P, fontSize: 14.5 }}>
            Bylder heeft sinds deze week een gids met showrooms die het bezoek waard zijn — per
            producttype, met de reden erbij. Gietvloeren, keukens, bedden, meubelen en tuin staan erin.
          </p>
          <p style={{ ...P, fontSize: 14.5 }}>
            Binnendeuren komen daarbij, met twee adressen: de <strong>showroom van Classic Next in
            Uden</strong> en het <strong>Bylder-adviespunt in het centrum van Rotterdam</strong>, waar
            bezoekers de stalen kunnen bekijken.
          </p>
        </Kaart>
      </Fase>

      <section style={{ background: GROEN, color: '#F5F0E8', borderRadius: 18, padding: '28px 30px', display: 'grid', gap: 12 }}>
        <span style={{ ...LABEL, color: '#F5F0E8', opacity: 0.72 }}>De ruggengraat</span>
        <h2 style={{ ...H2, color: '#F5F0E8', fontSize: 'clamp(1.35rem,3.2vw,1.85rem)' }}>
          Elke aanvraag komt op één plek binnen
        </h2>
        <p style={{ ...P, color: '#F5F0E8', opacity: 0.93, maxWidth: '62ch' }}>
          Of iemand nu op de beurs staat, thuis op de bank zit of via Google binnenkomt: de aanvraag
          landt in hetzelfde loket, mét de configuratie.
        </p>
        <p style={{ ...P, color: '#F5F0E8', opacity: 0.93, maxWidth: '62ch' }}>
          De partner ziet in eerste instantie alleen postcode en plaats — geen naam, geen
          telefoonnummer. Pas als de klant in zijn Bylder-account tekent, komen de contactgegevens vrij
          en wordt het inmeten ingepland. Zo staat de opdracht vast vóórdat er ergens een gesprek is dat
          buiten het systeem omgaat.
        </p>
      </section>

      <section style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={LABEL}>Wie wat doet</span>
          <h2 style={H2}>Levering, plaatsing en waar de klant kijkt</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(258px,1fr))', gap: 14 }}>
          <Kaart kop="Plaatsing door vakmannen" stand="komt" standTekst="In gesprek">
            <p style={{ ...P, fontSize: 14.5 }}>
              De deuren worden geplaatst door vakmannen, niet door de koper zelf. Bylder richt zich
              daarbij op De Klussenier: dat netwerk zit door heel Nederland, dus een beurslead uit
              Groningen en een uit Zeeland kunnen allebei bediend worden.
            </p>
            <p style={{ ...P, fontSize: 14.5 }}>
              Classic Next verzorgt de montagetraining — een dagdeel, gratis voor vakbedrijven — en
              daar staat een commissie tegenover. Dat staat al beschreven op de vakbedrijvenpagina.
            </p>
          </Kaart>

          <Kaart kop="Showroom in Uden" stand="live" standTekst="Bestaat">
            <p style={{ ...P, fontSize: 14.5 }}>
              Classic Next heeft een eigen showroom in Uden. Dat is het adres waar een koper het
              systeem compleet kan zien: het onzichtbare kozijn, de scharnieren, het magneetslot.
            </p>
            <span style={MONO}>Oostwijk 23b, 5406 XT Uden &middot; di t/m vr 10:00&#8211;16:00, op afspraak</span>
          </Kaart>

          <Kaart kop="Adviespunt Rotterdam" stand="komt" standTekst="Komt eraan">
            <p style={{ ...P, fontSize: 14.5 }}>
              Bylder opent een adviespunt in het centrum van Rotterdam, waar bezoekers de stalen van de
              deur kunnen bekijken — kleuren, afwerkingen, de frezing in het echt.
            </p>
            <p style={{ ...P, fontSize: 14.5 }}>
              Dat is geen tweede showroom maar een plek waar de adviseur zit: voor wie de Randstad niet
              uit wil rijden om te zien of antraciet klopt bij zijn hal.
            </p>
          </Kaart>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...LABEL, color: ROEST }}>Wat we nog nodig hebben</span>
          <h2 style={H2}>Zeven dingen, en waarvoor</h2>
          <p style={P}>
            Bijgewerkt op 19 september, na de CAD-tekeningen. Wat beantwoord is staat onderaan
            afgevinkt — daar zijn er vier bij gekomen.
          </p>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {[
            ['Welke van de acht decors zijn fineer en geen HPL?',
             'Thijs schreef dat hij er per ongeluk een paar kan hebben meegestuurd. Welke dat zijn weten we niet, dus staan ze nu allemaal als houtdecor in de configurator. Eén regel volstaat: welke moeten eruit. Dit is het enige punt dat vóór 2 oktober echt moet.'],
            ['Wilt u de reeks aanvullen met meer HPL-decors?',
             'Het aanbod stond in jullie mail van 18 september. Ja graag — in dezelfde vorm als de vorige keer, met het V-Ray-bestand erbij, want daar staat de maat van de nerf in.'],
            ['Horen er varianten uit de tekeningen alsnog bij?',
             'Vijf van de achttien tekeningen zitten niet in de reeks: Drift zonder de verticale lijn, een verticale met één horizontale hoog in het blad, een groevenbundel tegen de krukzijde in plaats van in het midden, en twee keer de omlijsting van Solace met een bredere frees (15 en 18 mm). Voeren jullie die, dan zetten we ze erbij.'],
            ['De structuurkaart van Master Oak patina.',
             'Daar zat alleen een normaalkaart bij, geen structuurkaart. Dat decor is bij ons daarom vlak: de nerf zie je wel, maar je voelt hem niet in het licht. Als die kaart er nog is, zetten we hem er alsnog in.'],
            ['Mogen wij het Unilin-materiaal gebruiken?',
             'Dit zijn beelden van Unilin, niet van Classic Next. Jullie hebben er vermoedelijk gebruiksrecht op voor eigen verkoop, maar wij zetten ze op een commerciële site. Graag bevestigd, en of er een bronvermelding bij moet. Moet dat met Unilin geregeld worden, dan liever nu dan achteraf.'],
            ['Zijn er ook 3D-bestanden, naast de tekeningen?',
             'De achttien tekeningen zijn 2D aanzichten — precies genoeg voor de groeven, en dat is het belangrijkste. Voor het gerenderde beeld zou een 3D-bestand (STEP of het model waar jullie productfoto\u2019s uit komen) het laatste gat dichten. Zolang dat er niet is, blijft 3D de standaardweergave.'],
            ['Een kleinere set materiaalstalen vóór 9 oktober.',
             'Jullie schreven dat de samples ná de beurs komen. Daar wringt het: het adviespunt in Rotterdam is juist bedoeld voor de bezoeker die op de beurs enthousiast wordt en vóór het tekenen iets wil voelen. Wat ons betreft volstaat één gespoten paneel, één invisible scharnier en één magneetslot. De rest mag daarna volgen.'],
          ].map(([kop, tekst]) => (
            <li key={kop} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 12, padding: '14px 16px', fontSize: 14.5, lineHeight: 1.6 }}>
              <span aria-hidden="true" style={{ width: 16, height: 16, border: `2px solid ${INKT}0.45)`, borderRadius: 4, marginTop: 4 }} />
              <span style={{ color: `${INKT}0.8)` }}><b style={{ color: '#1A1208' }}>{kop}</b> {tekst}</span>
            </li>
          ))}
        </ul>

        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <span style={{ ...LABEL, color: GROEN }}>Beantwoord</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {[
            ['Reactietermijn op offertes.', 'Vijf werkdagen, akkoord bevestigd op 14 september.'],
            ['Openingstijden showroom Uden.', 'Dinsdag t/m vrijdag, 10:00\u201316:00, bij voorkeur op afspraak. Gaat zo de showroomgids in.'],
            ['Wie het scherm op de stand bedient.', 'Een tablet met eigen hotspot; Classic Next test dat zelf. Tip: open de configurator vóór de beurs één keer op díé tablet, dan staan de zware onderdelen in het geheugen van het apparaat.'],
            ['De fineerdecors aanleveren.', 'Gedaan. Op 14 september \u00e9\u00e9n decor als proef, op 16 september zeven erbij \u2014 compleet met kleur-, diepte- en glanskaart en het V-Ray-bestand met de maat erin. Precies de vorm die we nodig hadden.'],
            ['Thijs en Machiel testen de configurator.', 'Gedaan op 14 september. Die test leverde zeven meldingen op en bij natekenen tien echte afwijkingen \u2014 zie bovenaan.'],
            ['De CAD-tekeningen van de deuren.', 'Gedaan op 18 september, achttien stuks, via Elisa. Daarmee vervalt de vraag of onze correcties klopten: de groeven zijn er rechtstreeks uit overgenomen.'],
            ['HPL of fineer.', 'Classic Next levert uitsluitend HPL. De site zegt nu “houtdecor” en legt uit wat dat is.'],
            ['Onder welke naam de decors op de offerte komen.', 'De Unilin-benaming, zonder artikelnummer. Staat zo in de offerte.'],
            ['De plaatmaat van 3050 bij 1300 mm.', 'Bevestigd op 18 september. De nerf van Master Oak ligt daarmee op ware grootte op het deurblad.'],
          ].map(([kop, tekst]) => (
            <li key={kop} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 12, background: 'rgba(61,90,62,0.05)', border: `1px solid rgba(61,90,62,0.18)`, borderRadius: 12, padding: '12px 16px', fontSize: 14, lineHeight: 1.6 }}>
              <span aria-hidden="true" style={{ color: GROEN, fontWeight: 800, fontSize: 15, lineHeight: '21px' }}>&#10003;</span>
              <span style={{ color: `${INKT}0.75)` }}><b style={{ color: '#1A1208' }}>{kop}</b> {tekst}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={LABEL}>Tot de beurs</span>
          <h2 style={H2}>Wat er nog gebeurt</h2>
          <p style={P}>Vrijdag 2 oktober gaat alles op slot: wat dan niet werkt, gaat niet mee naar de Jaarbeurs.</p>
        </div>
        <div style={{ overflowX: 'auto', border: `1px solid ${INKT}0.12)`, borderRadius: 14, background: '#fff' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560, fontSize: 14.5 }}>
            <thead>
              <tr>
                {['Week', 'Wat', 'Van wie'].map(k => (
                  <th key={k} scope="col" style={{ textAlign: 'left', padding: '12px 16px', borderBottom: `1px solid ${INKT}0.12)`, background: '#EDE6DA', fontFamily: "'Space Mono',monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${INKT}0.55)` }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['15–19 sep', 'Configuratortest verwerkt en alle dertien ontwerpen nagemeten op de CAD-tekeningen (klaar). Nog: welke decors fineer zijn, en de rechten op het Unilin-materiaal', 'samen'],
                ['22–26 sep', 'Mailing na de beurs staat klaar (klaar). Nog: binnendeuren in de showroomgids, en de gerenderde weergave zodra de modellen er zijn', 'Bylder'],
                ['29 sep – 2 okt', 'QR-code, weergave op beurs-wifi, proefdraaien met het standteam', 'samen'],
                ['5 oktober', 'Aanvragen voor de 25 kaarten sluit', 'bezoekers'],
                ['9–11 oktober', 'Beurs. Elke avond gaan de aanvragen van die dag door naar Classic Next', 'Bylder'],
                ['vanaf 12 okt', 'Elke beurslead binnen vijf werkdagen een offerte; daarna de mailing', 'Classic Next'],
              ].map(([w, wat, wie]) => (
                <tr key={w}>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${INKT}0.12)`, fontWeight: 700, color: '#1A1208', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{w}</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${INKT}0.12)`, verticalAlign: 'top', color: `${INKT}0.8)` }}>{wat}</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${INKT}0.12)`, verticalAlign: 'top', color: `${INKT}0.8)` }}>{wie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer style={{ ...MONO, borderTop: `1px solid ${INKT}0.12)`, paddingTop: 18, lineHeight: 1.6 }}>
        Opgesteld 13 september 2026 door Bylder, voor Classic Next. Bijgewerkt 19 september met de
        dertien ontwerpen zoals ze in jullie CAD-tekeningen staan. Deze pagina is de laatste stand van zaken; wij houden
        hem bij, zodat hij niet uit de mail hoeft te worden opgediept. Hij staat niet in Google en is
        alleen via deze link te vinden.
      </footer>
    </main>
  )
}
