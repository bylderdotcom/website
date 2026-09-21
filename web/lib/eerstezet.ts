// De eerste zet op een vakbedrijfprofiel.
//
// WAAROM
// Meting 21-09-2026 (GSC, 3 maanden): 83% van al het zoekverkeer landt op een
// vakbedrijfprofiel — 2.554 van 3.064 klikken in de top-1000. En 86% van die
// bezoekers zoekt op een bedrijfsnaam, vaak met "reviews" erachter. Dat is geen
// dienstvraag; dat is iemand die een bedrijf natrekt waar hij al mee praat.
//
// Wat hij op die pagina aantrof, gemeten als percentage van de paginatekst:
//   3,5-3,9%  website, telefoon, route — drie uitgangen naar buiten
//   10%       "Ben jij loodgieter in X? Sta erbij" — een blok voor het bedrijf
//   31%       "Check je échte offerte gratis" — de eerste knop voor de koper
// Hij kreeg dus gratis wat hij kwam halen en vertrok, en het enige dat op dat
// moment bij hem paste stond op eenderde van de pagina, achter twee blokken die
// niet voor hem bedoeld waren.
//
// WAT DIT DOET
// Twee dingen, meer niet.
// 1. De prijssectie verhuist naar boven, direct onder de bedrijfskaart — boven
//    de neutraliteitsmelding en boven het werf-blok voor het vakbedrijf.
// 2. De rekenhulp krijgt er een veld bij: het bedrag dat in zijn offerte staat.
//    Daarmee wordt het antwoord een oordeel in plaats van een bandbreedte, en
//    dat oordeel staat er vóór het registratieformulier in plaats van erachter.
//    Pas als er een oordeel staat, verschijnt de vervolgstap.
//
// WAT DIT NIET DOET
// De naam, de beoordeling en de contactregel blijven staan waar ze staan. Wie
// een bedrijf bij naam zoekt wil eerst dat bedrijf zien; een widget boven het
// telefoonnummer kost het vertrouwen waarvoor hij juist kwam. De ingreep zet de
// koperskant op het eerste scherm, niet vóór het bedrijf.
//
// HOE
// De 125 bedrijfssjablonen zijn gegenereerde HTML met één vaste vorm. Die vorm
// wordt hier herkend aan drie ankers en omgezet; wijkt een pagina af, dan
// blijft hij onaangeroerd (gecontroleerd 21-09-2026: alle 125 passen).
// De bedrading zit in web/app/components/klusCheck.ts — inline <script> voert
// niet uit via dangerouslySetInnerHTML, dus het oude scriptblok gaat weg.

/** Kop van de prijssectie ("Wat kost een loodgieter zoals X?"). */
const H2 = '<h2 style="font-size:1.5rem;font-weight:800;margin:36px 0 6px;">'

/** Begin van de rekenhulp. */
const CALC = '<div style="background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;'
  + 'padding:22px;margin:24px 0;"><div style="font-weight:800;font-size:1.05rem;color:#1A1208;'
  + 'margin-bottom:4px;">Wat kost jouw klus?</div>'

/** Einde van de bedrijfskaart, vlak voor de neutraliteitsmelding. */
const NA_KAART = '</div>\n\n  <div class="highlight"'

const INKT = 'rgba(61,46,30,'

/** Haalt één veld uit de oude rekenhulp; de opties erin zijn vakeigen. */
function pak(tag: 'select' | 'input', id: string, html: string): string | null {
  const i = html.indexOf(`<${tag} id="${id}"`)
  if (i < 0) return null
  const eind = tag === 'select' ? html.indexOf('</select>', i) + 9 : html.indexOf('>', i) + 1
  return html.slice(i, eind)
}

function veld(binnen: string): string {
  return binnen.replace(
    /style="[^"]*"/,
    `style="padding:11px;border:1.5px solid ${INKT}0.14);border-radius:10px;font-size:15px;`
    + 'background:#fff;color:#1A1208;font-family:inherit;width:100%;box-sizing:border-box;"',
  )
}

/**
 * Bouwt de nieuwe rekenhulp: dezelfde werksoorten, plus het bedrag uit de
 * offerte van de bezoeker en het oordeel daarover.
 */
function widget(oud: string, naam: string, vakCta: string): string {
  const sel = pak('select', 'kc-werk', oud)
  if (!sel) return ''
  const m2 = pak('input', 'kc-m2', oud)

  const rij = m2
    ? `<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:10px;margin-bottom:10px;">`
      + `${veld(sel)}${veld(m2)}</div>`
    : `<div style="margin-bottom:10px;">${veld(sel)}</div>`

  return (
    `<div style="background:#fff;border:1px solid ${INKT}0.12);border-radius:16px;`
    + 'padding:22px 24px;margin:20px 0 4px;">'
    + `<h2 style="font-weight:800;font-size:1.12rem;color:#1A1208;margin:0 0 4px;letter-spacing:-0.01em;">`
    // Bij een lange bedrijfsnaam vult de kop op mobiel drie regels en duwt hij de
    // invoer van het scherm. Dan maar zonder naam.
    + (naam.length <= 28 ? `Heb je al een prijs van ${naam}?` : 'Heb je al een prijs gekregen?')
    + '</h2>'
    + `<p style="font-size:13.5px;color:${INKT}0.7);line-height:1.6;margin:0 0 14px;max-width:62ch;">`
    + 'Vul in wat er in je offerte staat. Je ziet meteen of dat bedrag binnen de marktprijs valt '
    + '&mdash; zonder account, zonder je gegevens achter te laten.</p>'
    + rij
    + '<input id="kc-bedrag" inputmode="decimal" placeholder="bedrag uit je offerte in &euro;" '
    + `aria-label="Bedrag uit je offerte in euro" style="padding:11px;border:1.5px solid ${INKT}0.14);`
    + 'border-radius:10px;font-size:15px;background:#fff;color:#1A1208;font-family:inherit;'
    + 'width:100%;box-sizing:border-box;" />'
    + `<div id="kc-out" style="font-size:14px;color:${INKT}0.72);margin-top:12px;min-height:20px;"></div>`
    + '<div id="kc-oordeel" role="status" aria-live="polite" style="margin-top:10px;"></div>'
    + '<div id="kc-na" hidden style="margin-top:14px;display:flex;flex-wrap:wrap;'
    + 'align-items:center;gap:12px;">'
    + `<a href="${vakCta}" style="display:inline-block;background:#3D5A3E;color:#F5F0E8;`
    + 'padding:11px 22px;border-radius:9px;font-weight:700;font-size:14px;text-decoration:none;">'
    + 'Laat de hele offerte nakijken &#8594;</a>'
    + `<span style="font-size:13px;color:${INKT}0.62);line-height:1.5;max-width:40ch;">`
    + 'Post voor post, met de marktprijs ernaast. Ook dat is gratis.</span></div>'
    + '</div>'
  )
}

/**
 * Zet de prijssectie van een bedrijfsprofiel boven aan de pagina en maakt er
 * een offerte-oordeel van. Ontbreekt een van de ankers, dan blijft de pagina
 * ongewijzigd — liever de oude volgorde dan een halve ingreep.
 */
export function metEersteZet(html: string, naam: string, vakCta = '/offerte-check/'): string {
  const ci = html.indexOf(CALC)
  const anker = html.indexOf(NA_KAART)
  if (ci < 0 || anker < 0 || anker > ci) return html
  const hi = html.lastIndexOf(H2, ci)
  if (hi < 0) return html
  const se = html.indexOf('</script>', ci)
  const eind = se < 0 ? html.indexOf('</div>', ci) + 6 : se + 9

  const oud = html.slice(ci, eind)
  const nieuw = widget(oud, naam, vakCta)
  if (!nieuw) return html

  // De kop en de prijsband-alinea blijven waar ze staan: ze horen bij de tekst
  // over dit vak, niet bij de invoer. Alleen de belofte van een rekenhulp die
  // er niet meer staat moet eruit.
  const kop = html.slice(hi, ci)
    .replace(' Reken zelf een indicatie uit &mdash; en check daarna gratis of je échte offerte marktconform is.', '')
    .replace(' Reken zelf een indicatie uit &mdash; en check daarna gratis of je echte offerte marktconform is.', '')

  const zonder = html.slice(0, hi) + kop + html.slice(eind)
  const plek = zonder.indexOf(NA_KAART)
  return zonder.slice(0, plek + '</div>\n'.length) + '\n  ' + nieuw + '\n' + zonder.slice(plek + '</div>\n'.length)
}
