import ConfiguratorCTA from '../components/ConfiguratorCTA'
import HeldToneel, { type Regel } from './HeldToneel'
import { HOME_DELEN } from '../homeSections'
import { aantalMerken, deelnemers, type Deelnemer } from '@/lib/merken'
import { HELD_STIJL } from './stijl'
import { DEMO_TEKST, HUIS_TEKST, vervang, kostenBlok } from './demo'

// De homepage rond één held: het uitlezen van tekeningen en planning, zodat de
// koper op het juiste moment de beste keuze maakt — en zijn aankopen alvast
// samenstelt, nog voordat de woning is opgeleverd (Daniel, 27-09-2026).
//
// Wat hier staat is óf uit data, óf uit wat de site vandaag doet. Geen bedrag
// dat we niet kunnen staven; de kortingen komen uit deelnemers.json, het aantal
// projectpagina's uit het cluster, en de gidsen voor ná de sleutel bestaan.
//
// Van de oude homepage blijven vier blokken letterlijk staan: de offerte-check,
// de goedkeur-demo (met de woningtekening die er bij hoort), de kosten per
// gemeente en de gidsen/steden-voet. Die zijn af, of hun links zijn te veel om
// te verliezen.

const REGISTREER = 'https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=homepage-held'
const CONFIGURATOR = '/kozijnloze-deuren/configurator/'

// De voorbeeldwoning in de kop. Hoeveelheden zijn na te tellen op de tekening
// (78 m² is 10,40 × 7,80); merk en korting worden hieronder uit de data gelezen.
const VOORBEELD: Array<Omit<Regel, 'korting'> & { zoek: string; vast?: string }> = [
  { hoeveel: '12', eenheid: 'stuks', wat: 'Binnendeuren', toelichting: 'Plafondhoog, zonder kozijn, elke RAL-kleur', merk: 'ClassicNext', zoek: 'Classic Next', vast: 'configurator' },
  { hoeveel: '78', eenheid: 'm² vloer', wat: 'Gietvloer', toelichting: 'Over de hele begane grond, zonder naden', merk: 'DRT Flooring', zoek: 'DRT Contemporary Flooring' },
  { hoeveel: '9', eenheid: 'ramen', wat: 'Raamdecoratie', toelichting: 'Opgemeten voordat de steiger weg is', merk: 'Berg & Berg', zoek: 'Berg & Berg Den Haag' },
  { hoeveel: '3', eenheid: 'slaapkamers', wat: 'Bedden', toelichting: 'Met leenbed tijdens de levertijd', merk: 'Auping', zoek: 'Auping' },
  { hoeveel: '34', eenheid: 'lichtpunten', wat: 'Verlichting', toelichting: 'Op de punten die al in de tekening staan', merk: 'Lamp en Licht', zoek: 'Lamp en Licht' },
]

function regels(lijst: Deelnemer[]): Regel[] {
  const per = new Map(lijst.map(d => [d.naam, d.aanbod]))
  return VOORBEELD.map(({ zoek, vast, ...r }) => ({ ...r, korting: vast ?? per.get(zoek) ?? 'korting' }))
}

// Een dwarsdoorsnede van de merken, twaalf stuks. Eerst de vier die in de kop
// al langskwamen, dan per categorie de beste — in de volgorde waarin een koper
// ze tegenkomt (vloer, deuren, licht, raam, zonwering …). Op korting alleen
// sorteren zette een wijnhuis met verhuiskado op plek twee.
// Auping en Classic Next staan al met foto in de bovenste rij, dus niet nog
// eens in het raster. De merken met een logo in img/logos/ komen eerst.
const IN_FOTORIJ = new Set(['Auping', 'Classic Next'])
const VAST = ['DRT Contemporary Flooring', 'Lamp en Licht', 'Goossens', 'Tables by Tim', 'Whoon']

// Logo's van de oude homepage (img/logos/), zelfde bestanden. Alleen waar er
// een logo is vervangt het de naam; anders blijft de naam staan.
const LOGOS: Record<string, [string, number]> = {
  'Classic Next': ['/img/logos/classic-next.png', 22],
  Auping: ['/img/logos/auping-blue.svg', 24],
  'Tables by Tim': ['/img/logos/tablesbytim.png', 26],
  Whoon: ['/img/logos/whoon.png', 24],
  'DRT Contemporary Flooring': ['/img/logos/drt.svg', 22],
  Goossens: ['/img/logos/goossens.svg', 22],
}

// De vier productfoto's van de oude homepage ("Vier keuzes die je vóór de
// oplevering maakt"), nu de bovenste rij van het merkenblok. Zelfde beelden,
// zelfde links, kortere tekst.
const FOTOS = [
  { href: '/kozijnloze-deuren/configurator/', img: '/img/classic-next/deur-eiken-fineer.jpg', sm: '/img/classic-next/deur-eiken-fineer-sm.jpg 600w, /img/classic-next/deur-eiken-fineer.jpg 800w',
    alt: 'Plafondhoge binnendeur in eikenfineer, vlak in een witte wand met een smalle schaduwvoeg eromheen',
    merk: 'Classic Next', titel: 'Onzichtbaar kozijn', tekst: 'Plafondhoog, zonder architraaf. Stel hem samen in 3D en vraag direct een offerte aan.', cta: 'Stel je deur samen' },
  { href: '/vouchers/auping/', img: '/img/auping-noble-solid-oak.webp', sm: '/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w',
    alt: 'Auping Noble Solid Oak bed van massief eiken in een slaapkamer met raam over de volle breedte',
    merk: 'Auping', titel: 'Noble Solid Oak', tekst: 'Massief eiken bedframe met geïntegreerd nachtkastje, voor een slaapkamer die krapper is dan de verkooptekening leek.', cta: 'Auping-voordeel' },
  { href: '/tuin-aanleggen/schutting-schermen/', img: '/img/gardenwall-weo35.webp', sm: '/img/gardenwall-weo35-sm.webp 500w, /img/gardenwall-weo35.webp 1000w',
    alt: 'Fiberdeck Gardenwall WEO35 composiet schutting in teakkleur langs een tuinpad van grind',
    merk: 'Fiberdeck', titel: 'Gardenwall WEO35', tekst: 'Composiet schutting die niet elk jaar geolied hoeft. Bij een kavel zonder erfafscheiding de eerste grote tuinpost.', cta: 'Schutting kiezen' },
  { href: '/woning-verduurzamen/ventilatie/', img: '/img/noshow-ventilatie.webp', sm: '/img/noshow-ventilatie-sm.webp 500w, /img/noshow-ventilatie.webp 1000w',
    alt: 'NoShow ventilatierooster vlak weggewerkt in een badkamerplafond, zichtbaar als een dunne ring',
    merk: 'NoShow', titel: 'Weggewerkte ventilatie', tekst: 'Een vlakke ring in plaats van een kunststof rooster. Vervangt de standaardventielen van de aannemer.', cta: 'Over ventilatie' },
]
const VOLGORDE = ['PVC vloer', 'Deuren', 'Verlichting', 'Raamdecoratie', 'Zonwering', 'Sanitair',
  'Kitchen', 'Kasten', 'Smart home', 'Meubelen', 'Behang', 'Tuin', 'Tuinmeubelen', 'Vloertegels',
  'Wandtegels', 'Trapbekleding', 'Stucwerk', 'Groen dak']
function uitgelicht(lijst: Deelnemer[], n = 12): Deelnemer[] {
  const pct = (a: string) => { const m = a.match(/^(\d+)%/); return m ? +m[1] : (a.startsWith('€') ? 8 : 0) }
  const uit: Deelnemer[] = VAST.map(naam => lijst.find(d => d.naam === naam)).filter((d): d is Deelnemer => !!d)
  for (const cat of VOLGORDE) {
    if (uit.length >= n) break
    const kandidaten = lijst.filter(d => d.cat === cat && !uit.includes(d) && !IN_FOTORIJ.has(d.naam)).sort((a, b) => pct(b.aanbod) - pct(a.aanbod))
    if (kandidaten[0]) uit.push(kandidaten[0])
  }
  return uit.slice(0, n)
}


// Vragen die een bezoeker op de homepage stelt, in zijn woorden. Zichtbaar op
// de pagina én als FAQPage-schema, zodat een zoekmachine of een taalmodel het
// antwoord kan citeren zonder de hele pagina te hoeven begrijpen.
const VRAGEN: Array<[string, string]> = [
  ['Wat doet Bylder precies?',
   'Bylder leest de plattegrond en de bouwplanning van je nieuwbouwwoning uit. Daaruit volgt wat je moet kiezen (deuren, vloer, verlichting, raamdecoratie), wanneer de bouwer die keuze sluit, en bij welke aangesloten merken je het met korting koopt. Je deuren stel je alvast in 3D samen, met het aantal uit je eigen tekening.'],
  ['Is Bylder gratis?',
   'Ja, voor bewoners. De aangesloten merken en vakbedrijven betalen om vindbaar te zijn; daarom houden we advies en verkoop strikt gescheiden en staat bij elk product wie het levert.'],
  ['Werkt het ook als mijn project nog niet op Bylder staat?',
   'Ja. Vul je adres in: de woningscan leest het Kadaster en werkt op elk adres in Nederland. Een projectpagina is handig, maar niet nodig om je plattegrond te laten uitlezen.'],
  ['Wat heb ik aan Bylder na de oplevering?',
   'Je dossier blijft bestaan: dezelfde tekening, dezelfde merken, dezelfde adviseur. Voor de tuin, de zonwering, de laadpaal en de meubels, en voor garantie (Woningborg of SWK) en onderhoud van installaties.'],
]

const CAT_NL: Record<string, string> = {
  'PVC vloer': 'Vloeren', Meubelen: 'Meubels', Kitchen: 'Keuken', Vakman: 'Klussen', Deuren: 'Binnendeuren',
  Verhuiskado: 'Verhuiskado', 'Smart home': 'Slim slot', 'Groen dak': 'Groen dak',
}

// De woningtekening uit de oude kop: de goedkeur-demo tekent zijn keuzes erop
// in (ghost-1..3, pin-1..3), dus die twee horen bij elkaar.
function woningtekening(): string {
  const h = HOME_DELEN[0]
  // De opmaak van de tekening (lijnen, spelden, schaduwvoorstellen) stond in
  // de oude kop; zonder die regels rendert de SVG als een zwart vlak.
  const st = h.match(/<style>[\s\S]*?<\/style>/g)?.find(x => x.includes('.iso-line')) ?? ''
  const opmaak = '<style>' + st.slice(st.indexOf('.iso-line{'))
  const i = h.indexOf('class="hero-house')
  const start = h.lastIndexOf('<div', i)
  const re = /<div\b|<\/div>/g
  re.lastIndex = start
  let depth = 0, m: RegExpExecArray | null
  while ((m = re.exec(h))) {
    depth += m[0] === '<div' ? 1 : -1
    if (depth === 0) return opmaak + vervang(h.slice(start, m.index + 6), HUIS_TEKST)
  }
  return ''
}

export default function HomeHeld() {
  const lijst = deelnemers()
  const merken = aantalMerken()
  const rijen = regels(lijst)
  const top = uitgelicht(lijst)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HELD_STIJL }} />

      {/* ── 1. De kop: situatie, belofte, adres — en de held in beeld ── */}
      <section className="hh-hero">
        <div className="hh-wrap hh-hero-grid">
          <div className="hh-hero-copy">
            <p className="hh-oog">Voor wie een nieuwbouwhuis kocht</p>
            <h1>Richt je huis in<br /><em>voordat het er staat.</em></h1>
            <p className="hh-lead">
              <b>Wij lezen je plattegrond en de planning van de bouwer.</b> Zo weet je per keuze
              wanneer hij valt — en stel je je deuren, je vloer en je verlichting alvast samen met de
              aantallen en de maten uit jouw eigen tekening. Gratis voor bewoners.
            </p>

            <form id="woningzoek" className="hh-zoek" action="/nieuwbouw-project/" method="get">
              <label htmlFor="woningzoekVeld">Het adres of de naam van je project</label>
              <div className="hh-zoek-rij">
                <input id="woningzoekVeld" name="q" list="woningzoekLijst" autoComplete="off"
                  placeholder="Straat en huisnummer, of je project" />
                <datalist id="woningzoekLijst" />
                <button type="submit">Bekijk wat er op je afkomt →</button>
              </div>
              <p id="woningzoekHint">
                Nog geen adres? Vul je plaats of de naam van je nieuwbouwproject in — of{' '}
                <a href={REGISTREER}>upload direct je plattegrond</a>.
              </p>
            </form>

            <p className="hh-zijpad">
              Geen nieuwbouw? <a href="/functies/#bestaande-bouw">Bestaande bouw</a> · <a href="/functies/#renovatie">Verbouwen</a> · <a href="/functies/#nieuwbouw">Alle functies</a>
            </p>
          </div>

          <div className="hh-hero-toneel">
            <HeldToneel regels={rijen} merken={merken} />
          </div>
        </div>
      </section>

      {/* ── 2. De keten: lezen, timen, samenstellen, kopen — op de tijdas van de bouw ── */}
      <section className="hh-keten">
        <div className="hh-wrap">
          <div className="hh-kop">
            <p className="hh-oog">Wat er gebeurt na je adres</p>
            <h2>Vier dingen, in de volgorde van de bouw.</h2>
            <p className="hh-sub">De bouwer sluit zijn keuzelijsten op vaste data. Wie dan nog niet weet wat hij wil,
              betaalt achteraf meer of krijgt de standaard. Daarom begint alles bij de tekening.</p>
          </div>
          <ol className="hh-stappen">
            <li>
              <span className="hh-tijd">Nu · na de koop</span>
              <h3>Lezen</h3>
              <p>Je plattegrond uitgelezen: ruimtes, deuren, ramen, lichtpunten, vierkante meters. Uit jouw tekening, niet uit een gemiddelde.</p>
              <a href={REGISTREER}>Upload je plattegrond →</a>
            </li>
            <li>
              <span className="hh-tijd">Tot de bouwer sluit</span>
              <h3>Timen</h3>
              <p>Per keuze wanneer hij bij de bouwer valt, en wat je daarna zelf regelt. De bouwstatus komt elke twee weken uit het Kadaster.</p>
              <a href="/nieuwbouw-project/">Zoek je project →</a>
            </li>
            <li>
              <span className="hh-tijd">Vóór de oplevering</span>
              <h3>Samenstellen</h3>
              <p>Je deuren in 3D, in jouw kleur, met het aantal uit je tekening. Vloer en verlichting volgen dezelfde weg.</p>
              <a href={CONFIGURATOR}>Stel je deur samen →</a>
            </li>
            <li>
              <span className="hh-tijd">Wanneer jij wilt</span>
              <h3>Kopen</h3>
              <p>Bij de {merken} merken die meedoen, met de korting die voor jou geldt — en een adviseur die de winkels aan elkaar knoopt.</p>
              <a href="/vouchers/">Alle merken en kortingen →</a>
            </li>
          </ol>
        </div>
      </section>

      {/* ── 3. Het bewijs van "samenstellen": de configurator ── */}
      <section className="hh-conf">
        <div className="hh-wrap">
          <ConfiguratorCTA
            vroeg
            marge="0"
            label="Samenstellen · kozijnloze deuren"
            titel="Je deuren zien staan voordat je huis er staat."
            aanleiding={'Geen kozijn, geen architraaf: deur en wand worden één vlak. '
              + 'Kies het groefpatroon en de kleur, zie de deur in 3D in jouw kleur, '
              + 'en vraag er direct een offerte op aan — met het aantal dat in je tekening staat.'}
          />
        </div>
      </section>

      {/* ── 4. De merken: uit de data, met de korting erbij ── */}
      <section className="hh-merken">
        <div className="hh-wrap">
          <div className="hh-kop hh-kop-rij">
            <div>
              <p className="hh-oog">{merken} aangesloten merken</p>
              <h2>Kopen bij de merken die meedoen.</h2>
              <p className="hh-sub">Deels eigen aanbod, deels aangesloten merken — bij elk product staat wie het levert.
                De korting staat op je account, niet in een mailtje dat je kwijtraakt.</p>
            </div>
            <a className="hh-knop-licht" href="/vouchers/">Alle {merken} merken →</a>
          </div>
          <ul className="hh-fotos" aria-label="Vier keuzes die je vóór de oplevering maakt">
            {FOTOS.map(f => (
              <li key={f.href}>
                <a href={f.href}>
                  <img src={f.img} srcSet={f.sm} sizes="(max-width:720px) 50vw, 280px" alt={f.alt}
                    width={1000} height={1000} loading="lazy" decoding="async" />
                  <span className="hh-foto-merk">{f.merk}</span>
                  <b>{f.titel}</b>
                  <p>{f.tekst}</p>
                  <span className="hh-foto-cta">{f.cta} →</span>
                </a>
              </li>
            ))}
          </ul>
          <ul className="hh-merkraster" aria-label="Uitgelichte merken en hun korting">
            {top.map(d => (
              <li key={d.naam}>
                <span className="hh-cat">{CAT_NL[d.cat] ?? d.cat}</span>
                {LOGOS[d.naam]
                  ? <b className="hh-logo"><img src={LOGOS[d.naam][0]} alt={d.naam} style={{ height: LOGOS[d.naam][1] }} loading="lazy" /></b>
                  : <b>{d.naam}</b>}
                <span className="hh-voordeel">{d.aanbod}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 5. Betaal je een eerlijke prijs? (ongewijzigd) ── */}
      <div dangerouslySetInnerHTML={{ __html: HOME_DELEN[6] }} />

      {/* ── 6. De demo, met de woningtekening waarop hij tekent ── */}
      <section className="hh-demo">
        <div className="hh-wrap">
          <div className="hh-huis" dangerouslySetInnerHTML={{ __html: woningtekening() }} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: vervang(HOME_DELEN[7], DEMO_TEKST) }} />
      </section>

      {/* ── 7. Ook na de sleutel ── */}
      <section className="hh-na">
        <div className="hh-wrap">
          <div className="hh-kop">
            <p className="hh-oog">Na de oplevering</p>
            <h2>De sleutel is niet het einde. Daarna gaat het geld pas echt rollen.</h2>
            <p className="hh-sub">Tuin, zonwering, meubels, laadpaal — en de garantie en het onderhoud die bij een
              nieuwe woning horen. Je dossier blijft bestaan: dezelfde tekening, dezelfde merken, dezelfde adviseur.</p>
          </div>
          <div className="hh-na-grid">
            <div>
              <h3>Garantie</h3>
              <p>Woningborg of SWK, opleveringsgebreken melden, garantie op installaties: wat je waar claimt, en binnen welke termijn.</p>
              <ul>
                <li><a href="/kennisbank/geld-recht/woningborg-swk/">Woningborg en SWK uitgelegd</a></li>
                <li><a href="/kennisbank/geld-recht/opleveringsgebreken-claimen/">Opleveringsgebreken claimen</a></li>
                <li><a href="/kennisbank/geld-recht/garantie-op-installaties/">Garantie op installaties</a></li>
              </ul>
            </div>
            <div>
              <h3>Onderhoud</h3>
              <p>Een nieuwbouwwoning heeft installaties die aandacht vragen: WTW-filters, de warmtepomp, de vloer die je koos.</p>
              <ul>
                <li><a href="/kennisbank/installaties/wtw-ventilatie-woning/">WTW-ventilatie: filters en onderhoud</a></li>
                <li><a href="/kennisbank/vloeren/vloeronderhoud/">Vloeronderhoud per vloertype</a></li>
                <li><a href="/kennisbank/badkamer/badkamer-onderhoud/">Badkamer onderhouden</a></li>
                <li><a href="/woning-verduurzamen/ventilatie/">Ventilatie in een nieuwbouwwoning</a></li>
              </ul>
            </div>
            <div>
              <h3>Wat er nog komt</h3>
              <p>De tuin, de zonwering, de laadpaal: de grote uitgaven van het eerste jaar. Met dezelfde korting als vóór de sleutel.</p>
              <ul>
                <li><a href="/nieuwbouw-gids/tuin-aanleggen/">Tuin aanleggen bij nieuwbouw</a></li>
                <li><a href="/tuin-aanleggen/schutting-schermen/">Schutting en schermen</a></li>
                <li><a href="/kennisbank/installaties/laadpaal-thuis/">Laadpaal thuis</a></li>
                <li><a href="/nieuwbouw-gids/afwerking-na-oplevering/">Afwerking na de oplevering</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Vragen ── */}
      <section className="hh-faq">
        <div className="hh-wrap">
          <div className="hh-kop">
            <p className="hh-oog">Veelgestelde vragen</p>
            <h2>Kort en eerlijk.</h2>
          </div>
          <dl className="hh-vragen">
            {VRAGEN.map(([v, a]) => (
              <div key={v}><dt>{v}</dt><dd>{a}</dd></div>
            ))}
          </dl>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: VRAGEN.map(([v, a]) => ({ '@type': 'Question', name: v,
            acceptedAnswer: { '@type': 'Answer', text: a } })),
        }) }} />
      </section>

      {/* ── 9. Kosten per gemeente + op maat (ongewijzigd) ── */}
      <div dangerouslySetInnerHTML={{ __html: kostenBlok(HOME_DELEN[8]) }} />
      <div dangerouslySetInnerHTML={{ __html: HOME_DELEN[5] }} />

      {/* ── 10. Gidsen, tools, steden + overlays (ongewijzigd) ── */}
      <div dangerouslySetInnerHTML={{ __html: HOME_DELEN[10] }} />
    </>
  )
}
