// Het eerste blok onder de bedrijfskaart op een vakbedrijfprofiel (besluit Daniel, 3-11-2026).
//
// WAAROM
// Wie op een profiel landt, zoekt op de bedrijfsnaam, vaak met "reviews" erachter: hij trekt
// een bedrijf na waar hij al een offerte van heeft of wil. Op die plek stond een configurator
// (een kast bij een dakkapelbedrijf), en verderop nog vijf andere verzoeken. Nulmeting GA4,
// 28 dagen tot 3-11-2026: 8 klikken op de stap, 1 offerteformulier geopend, 0 aanvragen.
//
// WAT
// Eén vraag die past bij waarom hij er is: "Offerte van <bedrijf>? Leg hem naast de marktprijs,
// en naast een offerte van Bylder." Hoofdknop naar de afwerkaanvraag (het onderdeel van dit vak),
// tweede knop naar de prijscheck op dezelfde pagina. Daaronder drie vragen om te stellen voordat
// je tekent, per vak. Geen reviews overnemen; de score en de link naar Google staan op de kaart.
//
// Nergens een relatie met een uitvoerder of klusbedrijf noemen (besluit Daniel, 28-10-2026).

type Vak = {
  kop: string
  tekst: string
  /** Onderdeel van /nieuwbouw-afwerken/, of '' voor de hele afwerking. */
  onderdeel: string
  wie: string
  vragen: [string, string, string]
}

const VAKKEN: Record<string, Vak> = {
  schilder: {
    kop: 'Leg hem naast de marktprijs, en naast een offerte van Bylder.',
    tekst: 'Bylder maakt ook offertes voor schilderwerk binnen, en als je wilt voor de rest van de afwerking erbij: stucwerk, vloeren, deuren. Eén offerte, één planning, één aanspreekpunt.',
    onderdeel: 'schilderwerk', wie: 'een schilder',
    vragen: ['Staat erin hoeveel lagen, en met welke verf?',
      'Is het voorwerk meegerekend: plamuren, schuren, kitten?',
      'Wie dekt vloeren en meubels af, en wie ruimt op?'],
  },
  stukadoor: {
    kop: 'Leg hem naast de marktprijs, en naast een offerte van Bylder.',
    tekst: 'Bylder maakt ook offertes voor stucwerk, en als je wilt voor de rest van de afwerking erbij: tegels, schilderwerk, vloeren. Eén offerte, één planning, één aanspreekpunt.',
    onderdeel: 'stucwerk', wie: 'een stukadoor',
    vragen: ['Welke afwerking: behangklaar, sausklaar of spuitwerk?',
      'Zit het voorwerk erin: hoekprofielen, gaten dichten, afplakken?',
      'Hoe lang moet het drogen voordat je kunt schilderen?'],
  },
  badkamer: {
    kop: 'Leg hem naast de marktprijs, en naast een offerte van Bylder.',
    tekst: 'Bylder maakt ook offertes voor een badkamer: sanitair en tegelwerk in één offerte, met één planning en één aanspreekpunt.',
    onderdeel: 'sanitair', wie: 'een badkamerbedrijf',
    vragen: ['Zit het slopen en afvoeren van de oude badkamer erin?',
      'Wie doet het leidingwerk, de elektra en het tegelwerk?',
      'Hoeveel dagen zit je zonder badkamer of toilet?'],
  },
  loodgieter: {
    kop: 'Gaat het om je badkamer of toilet? Leg je offerte naast een offerte van Bylder.',
    tekst: 'Bylder maakt offertes voor sanitair en tegelwerk, in één offerte met één planning en één aanspreekpunt. Voor een lekkage of storing bel je het bedrijf hierboven.',
    onderdeel: 'sanitair', wie: 'een loodgieter',
    vragen: ['Is het een vaste prijs, of uurloon plus materiaal?',
      'Staan voorrijkosten en materiaal apart in de offerte?',
      'Wie herstelt tegels of wanden na het hak- en breekwerk?'],
  },
  gietvloer: {
    kop: 'Leg hem naast de marktprijs, en naast een offerte van Bylder.',
    tekst: 'Bylder maakt ook offertes voor vloeren, gietvloeren ook, en voor de afwerking eromheen. Eén offerte, één planning, één aanspreekpunt.',
    onderdeel: 'vloeren', wie: 'een gietvloerbedrijf',
    vragen: ['Hoe dik wordt de vloer, en past dat bij je deuren en drempels?',
      'Zit de voorbereiding erin: egaliseren, primer, kitvoegen?',
      'Hoe lang kun je er niet op lopen, en wanneer mag de vloerverwarming aan?'],
  },
  dakkapel: {
    kop: 'Een dakkapel is pas af als de zolder af is.',
    tekst: 'Stucwerk, vloer, deur en kast: Bylder maakt daar één offerte voor, met één planning en één aanspreekpunt. Leg hem naast wat je al hebt.',
    onderdeel: '', wie: 'een dakkapelspecialist',
    vragen: ['Is de vergunning (of vergunningvrij) uitgezocht, en door wie?',
      'Zit de afwerking binnen erin: stucwerk, vensterbank, aftimmeren?',
      'Staat de opleverdatum erin, en wat er gebeurt bij uitloop?'],
  },
  aannemer: {
    kop: 'Leg hem naast de marktprijs, en naast een offerte van Bylder.',
    tekst: 'Voor de afwerking van je woning (stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk, kasten) maakt Bylder één offerte, met één planning en één aanspreekpunt. Nieuwbouw, bestaande bouw of renovatie.',
    onderdeel: '', wie: 'een aannemer',
    vragen: ['Wat valt onder stelposten, en hoe hoog zijn die?',
      'Hoe werkt meerwerk: vooraf schriftelijk akkoord?',
      'Is er een planning met opleverdatum, en wat gebeurt bij uitloop?'],
  },
  elektricien: {
    kop: 'Na de elektra komt de afwerking.',
    tekst: 'Stucwerk, schilderwerk, vloeren en deuren: Bylder maakt er één offerte voor, met één planning en één aanspreekpunt. Leg hem naast wat je al hebt.',
    onderdeel: '', wie: 'een elektricien',
    vragen: ['Hoeveel groepen komen erbij, en is de meterkast groot genoeg?',
      'Zit het hak- en breekwerk en het dichtmaken erin?',
      'Krijg je een tekening van wat waar loopt?'],
  },
}

const GROEN = '#1F3A2E'
const ROOM = '#F5F0E8'

export function heeftProfielStap(vak: string) {
  return vak in VAKKEN
}

export default function ProfielStap({ vak, naam, prijscheck }: { vak: string; naam: string; prijscheck: boolean }) {
  const v = VAKKEN[vak]
  if (!v) return null
  const offerte = `/nieuwbouw-afwerken/${v.onderdeel ? v.onderdeel + '/' : ''}#aanvraag`
  // Lange namen vullen op mobiel drie regels; een 'naam' als '.' is geen naam.
  const kort = naam.length <= 28 && /[a-z0-9]{2}/i.test(naam)
  return (
    <>
      <section aria-labelledby="profielstap-kop" style={{ background: GROEN, color: ROOM, borderRadius: 16, padding: 'clamp(20px,3.5vw,28px)', margin: '20px 0 14px' }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
          {kort ? `Offerte van ${naam}?` : 'Al een offerte gekregen?'}
        </p>
        <h2 id="profielstap-kop" style={{ margin: '0 0 10px', fontSize: 'clamp(1.3rem,2.4vw,1.6rem)', lineHeight: 1.2, fontWeight: 800, color: ROOM, letterSpacing: '-0.01em' }}>{v.kop}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.55, opacity: 0.9, maxWidth: '62ch' }}>{v.tekst}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href={offerte} data-meet="profiel" style={{ flex: '1 1 240px', textAlign: 'center', background: ROOM, color: GROEN, fontWeight: 800, fontSize: 15.5, padding: '13px 18px', borderRadius: 11, textDecoration: 'none' }}>
            Vraag een offerte aan bij Bylder
          </a>
          <a href={prijscheck ? '#prijscheck' : '/offerte-check/'} style={{ flex: '1 1 240px', textAlign: 'center', border: `1.5px solid rgba(245,240,232,.6)`, color: ROOM, fontWeight: 700, fontSize: 15, padding: '12px 18px', borderRadius: 11, textDecoration: 'none' }}>
            {kort ? `Check eerst je offerte van ${naam}` : 'Check eerst je offerte'}
          </a>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 13, opacity: 0.78 }}>
          Een offerte aanvragen is gratis. Geef je opdracht, dan betaal je alleen de prijs die in de offerte staat.
        </p>
      </section>
      <section aria-labelledby="profielvragen-kop" style={{ background: '#fff', border: '1px solid rgba(61,46,30,0.12)', borderRadius: 14, padding: '16px 20px', margin: '0 0 4px' }}>
        <h3 id="profielvragen-kop" style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#1A1208' }}>Voordat je tekent bij {v.wie}</h3>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.6, color: 'rgba(61,46,30,0.82)' }}>
          {v.vragen.map(q => <li key={q}>{q}</li>)}
        </ul>
      </section>
    </>
  )
}
