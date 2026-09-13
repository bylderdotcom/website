// Het verleiderblok op de vakbedrijfprofielen.
//
// WAAROM
// 72% van al het zoekverkeer landt op een vakbedrijfprofiel — in de laatste
// meting 1.849 van de 2.427 klikken. Op die pagina's stond niets dat naar een
// product van Bylder wees. De bezoeker las een profiel, zag een offerteknop
// voor het vak zelf, en ging weg. Dit blok is de enige ingreep die verkeer dat
// er al is omzet in een aanvraag.
//
// WAAR
// Onder het prijsblok, boven het groene "in één keer geregeld"-blok. Bewust
// niet boven de vouw: wie een bedrijf bij naam zoekt, wil eerst dat bedrijf
// zien. Boven de vouw kost het vertrouwen, en vertrouwen is waarom hij hier is.
//
// WAT ER NIET IN STAAT
// Geen prijs (die komt uit de offerte), geen besparingsbedrag (dat kunnen we
// niet laten zien), en nergens het woord "onafhankelijk" — daar krijgen we
// provisie voor, en dan mag je dat niet zeggen.
//
// PER VAK EEN EIGEN AANLEIDING
// Dezelfde zin op acht clusters leest als een banner en wordt overgeslagen. De
// aanleiding moet uit het vak zelf komen: de stukadoor moet weten dat het
// kozijn vóór hem de wand in gaat, de loodgieter dat een gietvloer ook in een
// badkamer kan. Past er geen product bij een vak, dan komt het blok er niet —
// een verwijzing die niet klopt kost meer dan hij oplevert.

type Verleider = {
  /** Waar dit blok over gaat, in de woorden van dit vak. */
  kop: string
  /** De aanleiding: waarom lees je dit hier, op déze pagina. */
  tekst: string
  href: string
  knop: string
  /** Wat de bezoeker krijgt als hij klikt — geen belofte die we niet waarmaken. */
  belofte: string
}

const VERLEIDERS: Record<string, Verleider> = {
  schilder: {
    kop: 'Een deur die in de wandkleur verdwijnt',
    tekst: 'Een kozijnloze deur wordt meegestuukt in de wand en krijgt dezelfde verf als het stucwerk '
      + 'eromheen. Geen omlijsting, geen kleurverschil — alleen een naad waar hij opengaat.',
    href: '/kozijnloze-deuren/configurator/',
    knop: 'Stel je deur samen',
    belofte: 'Je ziet meteen wat een kleur met het patroon doet, en je kunt er een offerte op aanvragen.',
  },
  stukadoor: {
    kop: 'Het kozijn gaat de wand in vóór de stukadoor komt',
    tekst: 'Een kozijnloze deur bestaat uit een aluminium frame dat wordt meegestuukt. Dat betekent '
      + 'beslissen vóórdat er gestuukt wordt — achteraf kan het niet meer.',
    href: '/kozijnloze-deuren/',
    knop: 'Lees wanneer je moet kiezen',
    belofte: 'Met de volgorde van het werk erbij, zodat je niet achter de feiten aanloopt.',
  },
  aannemer: {
    kop: 'Kozijnloze deuren en onzichtbare plinten',
    tekst: 'Twee dingen die in het meerwerk thuishoren en er meestal niet in staan: een deur zonder '
      + 'omlijsting en een plint die in de wand verdwijnt. Allebei moeten ze vroeg besloten worden.',
    href: '/kozijnloze-deuren/configurator/',
    knop: 'Stel je deur samen',
    belofte: 'Je krijgt een sluitende specificatie waarmee je een offerte kunt aanvragen.',
  },
  elektricien: {
    kop: 'Wat vóór de stukadoor vastligt',
    tekst: 'Leidingen liggen in de wand voordat er gestuukt wordt. Voor het frame van een kozijnloze '
      + 'deur geldt precies hetzelfde — die beslissing valt in dezelfde week.',
    href: '/kozijnloze-deuren/',
    knop: 'Lees wanneer je moet kiezen',
    belofte: 'Met de volgorde van het werk erbij, zodat je niet achter de feiten aanloopt.',
  },
  badkamer: {
    kop: 'Een gietvloer in de badkamer',
    tekst: 'Naadloos, geen voegen om schoon te houden, en met een antislip-afwerking ook onder de '
      + 'douche te gebruiken. Wel een keuze die vóór het tegelwerk valt.',
    href: '/kopen/vloeren/',
    knop: 'Wat kost een gietvloer',
    belofte: 'Met marktprijzen per m² en de vloerenzaken die Bylder-leden korting geven.',
  },
  loodgieter: {
    kop: 'Een gietvloer in de badkamer',
    tekst: 'Naadloos en zonder voegen, dus makkelijker schoon te houden dan tegels. Met vloerverwarming '
      + 'eronder werkt hij goed — maar de ondergrond moet het wel toelaten.',
    href: '/kopen/vloeren/',
    knop: 'Wat kost een gietvloer',
    belofte: 'Met marktprijzen per m² en de vloerenzaken die Bylder-leden korting geven.',
  },
  gietvloer: {
    kop: 'Voordat je een gietvloer laat leggen',
    tekst: 'De prijs hangt af van de ondergrond, en dát is waar offertes uiteenlopen. Egaliseren is de '
      + 'post die het vaakst pas op de dag zelf ter sprake komt.',
    href: '/kopen/vloeren/',
    knop: 'Wat kost een gietvloer',
    belofte: 'Met marktprijzen per m² en de vloerenzaken die Bylder-leden korting geven.',
  },
  dakkapel: {
    kop: 'Van zolder naar kamer',
    tekst: 'Een dakkapel maakt van je zolder een echte ruimte. Daarna komt de afwerking: een vloer die '
      + 'doorloopt en een deur die bij de rest van het huis past.',
    href: '/kozijnloze-deuren/configurator/',
    knop: 'Stel je deur samen',
    belofte: 'Je krijgt een sluitende specificatie waarmee je een offerte kunt aanvragen.',
  },
}

// Het groene "in één keer geregeld"-blok. Staat in alle 125 bedrijfssjablonen
// precies één keer, gecontroleerd 13-09-2026. Het verleiderblok komt eravóór.
const ANKER = '<div style="background:#3D5A3E;border-radius:18px;padding:34px;text-align:center;margin:32px 0;">'

const INKT = 'rgba(61,46,30,'

function blokHtml(v: Verleider): string {
  return (
    `<aside aria-label="Via Bylder" style="background:#fff;border:1px solid ${INKT}0.12);`
    + 'border-left:4px solid #B85C38;border-radius:14px;padding:22px 24px;margin:28px 0;">'
    + `<p style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;`
    + `letter-spacing:0.09em;color:#B85C38;font-weight:700;margin:0 0 8px;">Via Bylder</p>`
    + `<h2 style="font-size:1.18rem;font-weight:800;color:#1A1208;margin:0 0 8px;letter-spacing:-0.02em;">${v.kop}</h2>`
    + `<p style="font-size:14.5px;line-height:1.65;color:${INKT}0.78);margin:0 0 14px;max-width:64ch;">${v.tekst}</p>`
    + '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;">'
    + `<a href="${v.href}" style="display:inline-block;background:#3D5A3E;color:#F5F0E8;padding:11px 20px;`
    + `border-radius:9px;font-weight:700;font-size:14px;text-decoration:none;">${v.knop} &#8594;</a>`
    + `<span style="font-size:13px;color:${INKT}0.62);line-height:1.5;max-width:42ch;">${v.belofte}</span>`
    + '</div></aside>'
  )
}

/**
 * Zet het verleiderblok in een bedrijfspagina, vlak boven het groene blok.
 * Kent het vak geen verleider, of ontbreekt het anker, dan blijft de pagina
 * ongewijzigd — liever geen blok dan een blok op de verkeerde plek.
 */
export function metVerleider(html: string, vak: string): string {
  const v = VERLEIDERS[vak]
  if (!v) return html
  const i = html.indexOf(ANKER)
  if (i < 0) return html
  return html.slice(0, i) + blokHtml(v) + '\n\n  ' + html.slice(i)
}
