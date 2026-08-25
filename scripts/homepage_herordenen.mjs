import fs from 'node:fs'

/**
 * Herordent de homepage: leest web/app/homeHtml.ts, knipt hem op zijn <section>-
 * grenzen en schrijft web/app/homeSections.ts in de volgorde van de funnel.
 *
 * Het knippen zat eerst in een tweede script dat een tussenbestand achterliet.
 * Eén keer vergeten dat script te draaien en de generator bouwde stilzwijgend op
 * verouderde inhoud — een merkkaart die ik net had vervangen stond nog gewoon op
 * de pagina. Daarom doet dit script het knippen nu zelf: er is geen tussenbestand
 * meer dat achter kan lopen.
 */
const BRON = 'web/app/homeHtml.ts'

/** Haalt één JS-stringliteral op zonder hem als code te interpreteren. */
function literal(src, naam) {
  const kop = `export const ${naam} = "`
  const start = src.indexOf(kop)
  if (start < 0) return null
  const open = src.indexOf('"', start + kop.length - 1)
  let i = open + 1
  while (i < src.length) {
    if (src[i] === '\\') { i += 2; continue }
    if (src[i] === '"') break
    i++
  }
  return JSON.parse(src.slice(open, i + 1))
}

function knip() {
  const src = fs.readFileSync(BRON, 'utf8')
  const html = ['HOME_HTML_TOP', 'HOME_HTML_MID', 'HOME_HTML_BOTTOM']
    .map(n => literal(src, n)).filter(Boolean).join('\n')
  const pos = [...html.matchAll(/<section\b/g)].map(m => m.index)
  pos.push(html.length)
  const uit = []
  for (let i = 0; i < pos.length - 1; i++) uit.push({ i, blok: html.slice(pos[i], pos[i + 1]) })
  if (pos[0] > 0) uit[0].blok = html.slice(0, pos[0]) + uit[0].blok
  return uit
}

const S = knip()
const bij = (i) => S.find(s => s.i === i).blok

// Volgorde volgt de funnel: welke woning → wat koop je → hulp bij keuzes.
// De weggelaten nummers (3, 4, 8, 13, 14, 15) zijn vervangen of verhuisd naar
// /hoe-het-werkt/. 4 was een tweede exemplaar van dezelfde merkenstrook.
const VOLGORDE = [
  ['hero',            0],
  // De merkenstrook (sectie 1) is er 26 aug uitgehaald op verzoek van Daniel:
  // direct eronder begint de vouchersectie al met dezelfde merken — het was
  // twee keer hetzelfde bericht boven elkaar.
  ['stappen',      null],   // nieuw
  // Eerst het tastbare: welke merken meedoen, welke korting je krijgt, welke
  // keuzes er echt op je afkomen. Dat is te controleren en het bestaat vandaag.
  // Software die iets belooft komt daarna — anders vraag je vertrouwen vóór je
  // iets hebt laten zien.
  ['vouchers',        7],
  ['producten',       6],
  ['kopen',           16],
  ['opmaat',          17],
  ['eerlijkeprijzen', 11],
  // Van de vijf gereedschapssecties blijft er één over: de demo. Die laat het
  // zien op de woning uit de hero, in plaats van het te beloven. De andere vier
  // zeiden alle vier een variant van "upload je tekening, wij rekenen het uit"
  // en stonden samen op 6.191 pixels — 42% van de pagina. /functies/ beschrijft
  // ze allemaal al, per woningtype, dus er verdwijnt niets van de site.
  //    5  3D-impressie          → /functies/ "Inrichten & 3D-impressie"
  //    9  fase-strip            → /functies/ "Wanneer heb je wat nodig?"
  //   10  begeleider-chat       → /functies/ "AI-Kopersbegeleider"
  //   12  bouwtekening-analyse  → /functies/ "Woning- & offerte-analyse"
  ['demo',            2],
  ['projecten',       18],
  ['kortuitleg',   null],   // nieuw
  ['voetlinks',       19],
]

const STAPPEN = `<section style="padding:56px 24px;background:#F5F0E8;">
  <div style="max-width:1100px;margin:0 auto;">
    <p style="font-family:monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:rgba(61,46,30,.55);font-weight:700;margin:0 0 10px;">In drie stappen</p>
    <h2 style="font-size:1.9rem;font-weight:800;letter-spacing:-.025em;margin:0 0 8px;text-wrap:balance;color:#1A1208;">Zo regelt Bylder het</h2>
    <p style="font-size:16px;line-height:1.7;color:rgba(61,46,30,.72);margin:0 0 28px;max-width:60ch;">Verbouwing, afwerking of inrichting &mdash; de volgorde is altijd dezelfde.</p>
    <ol style="list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));"><li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;"><span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">1</span><h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Vul je adres in</h3><p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Wij zien wat er rond jouw woning speelt en welke keuzes eraan komen &mdash; rechtstreeks uit het Kadaster. Adres nog onbekend? Je plaats is genoeg.</p><a href="https://app.bylder.com/woningscan" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Maak je stappenplan &rarr;</a></li><li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;"><span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">2</span><h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Kies je producten</h3><p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Eerlijke marktprijzen per categorie, korting bij 61 woonmerken, en winkels bij jou in de buurt die meedoen.</p><a href="/assortiment/" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Bekijk het assortiment &rarr;</a></li><li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;"><span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">3</span><h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Vind de handen</h3><p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Vakbedrijven uit jouw regio met beoordelingen &mdash; en een offerte-check die zegt of de prijs klopt v&oacute;&oacute;r je tekent.</p><a href="/offerte-check/" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Check je offerte &rarr;</a></li></ol>
  </div>
</section>`

const KORT = `<section style="padding:56px 24px;background:#EDE6D8;">
  <div style="max-width:760px;margin:0 auto;">
    <h2 style="font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin:0 0 12px;text-wrap:balance;color:#1A1208;">Wat is Bylder?</h2>
    <p style="font-size:16.5px;line-height:1.75;color:rgba(61,46,30,.78);margin:0 0 14px;">Bylder regelt verbouwing, afwerking en inrichting. Deels met eigen assortiment, deels met partners die wij selecteren &mdash; en bij elk aanbod staat wie het levert.</p>
    <p style="font-size:16.5px;line-height:1.75;color:rgba(61,46,30,.78);margin:0 0 18px;">Aan de basis ligt een slimme tool die jouw woning kent: hij ziet welke keuzes eraan komen, checkt offertes tegen marktprijzen en regelt korting bij winkels in de buurt. Gratis voor bewoners.</p>
    <a href="/hoe-het-werkt/" style="font-weight:700;color:#3D5A3E;font-size:15px;text-decoration:none;">Hoe Bylder werkt, in het lang &rarr;</a>
  </div>
</section>`

const NIEUW = { stappen: STAPPEN, kortuitleg: KORT }

const delen = VOLGORDE.map(([naam, i]) => i === null ? NIEUW[naam] : bij(i))

// Controle vóór het wegschrijven: geen interne link mag van de site verdwijnen.
//
// "Van de site", niet "van dit bestand": de voettekst en de navigatie staan op
// élke pagina, dus een link die daarheen verhuist is niet weg. Hetzelfde geldt
// voor de functiepagina, waar de fase-strip nu staat. Die drie tellen dus mee.
// In HTML staat het als href="…", in TSX-datalijsten als href: '…'. Beide tellen.
const links = (t) => [...t.matchAll(/href\s*[=:]\s*["']([^"']+)/g)]
  .map(m => m[1]).filter(l => l.startsWith('/'))
const elders = ['web/app/components/Footer.tsx', 'web/app/components/Nav.tsx',
                'web/app/functies/FunctiesClient.tsx']
  .flatMap(f => links(fs.readFileSync(f, 'utf8')))

const oud = new Set(S.flatMap(s => links(s.blok)))
const nieuw = new Set([...delen.flatMap(links), ...elders])
const kwijt = [...oud].filter(l => !nieuw.has(l))
console.log(`interne links: ${oud.size} oud → ${nieuw.size} bereikbaar · ${kwijt.length} kwijt`)
if (kwijt.length) { console.log('KWIJT:\n  ' + kwijt.join('\n  ')); process.exit(1) }

const kop = `// GEGENEREERD door scripts/homepage_herordenen.mjs — niet met de hand bijwerken.
//
// De homepage in stukken, in de volgorde van de funnel: welke woning → wat koop
// je → hulp bij je keuzes. Elk deel is byte-gelijk aan wat er stond, zodat de
// woningtekening, de goedkeur-demo en alle 83 interne links intact blijven.
//
// Weggelaten ten opzichte van de oude pagina:
//   3  oude "in 3 stappen" — vervangen door STAPPEN hieronder
//   4  tweede exemplaar van dezelfde merkenstrook (stond er twee keer op)
//   8  "Wat is Bylder?"        → /hoe-het-werkt/ (hier nog kort samengevat)
//   13 "Waar komt die €4.200"  → /hoe-het-werkt/
//   14 prijsblok "waarom gratis" → /hoe-het-werkt/ en /prijzen/
//   15 geo-facts + vraag-en-antwoord → /hoe-het-werkt/

export const HOME_DELEN: string[] = [
`
fs.writeFileSync('web/app/homeSections.ts',
  kop + delen.map(d => '  ' + JSON.stringify(d) + ',\n').join('') + ']\n')
console.log('web/app/homeSections.ts geschreven —', delen.length, 'delen')
