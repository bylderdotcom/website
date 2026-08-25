import fs from 'node:fs'
const SCRATCH = '/private/tmp/claude-501/-Users-danielpaaij-Documents-GitHub-website--claude-worktrees-recursing-dubinsky-e64b21/92f00c4e-48d2-4e99-bf93-16ccfa0d7ad5/scratchpad'
const S = JSON.parse(fs.readFileSync(`${SCRATCH}/secties.json`, 'utf8'))
const bij = (i) => S.find(s => s.i === i).blok

// Volgorde volgt de funnel: welke woning → wat koop je → hulp bij keuzes.
// De weggelaten nummers (3, 4, 8, 13, 14, 15) zijn vervangen of verhuisd naar
// /hoe-het-werkt/. 4 was een tweede exemplaar van dezelfde merkenstrook.
const VOLGORDE = [
  ['hero',            0],
  ['merken',          1],
  ['stappen',      null],   // nieuw
  ['depotcalculator', 12],
  ['demo',            2],
  ['visualisatie',    5],
  ['kopen',           16],
  ['producten',       6],
  ['vouchers',        7],
  ['opmaat',          17],
  ['eerlijkeprijzen', 11],
  ['begeleider',      10],
  ['functies',        9],
  ['projecten',       18],
  ['kortuitleg',   null],   // nieuw
  ['voetlinks',       19],
]

const STAPPEN = `<section style="padding:56px 24px;background:#F5F0E8;">
  <div style="max-width:1100px;margin:0 auto;">
    <p style="font-family:monospace;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:rgba(61,46,30,.55);font-weight:700;margin:0 0 10px;">Zo werkt het</p>
    <h2 style="font-size:1.9rem;font-weight:800;letter-spacing:-.025em;margin:0 0 8px;text-wrap:balance;color:#1A1208;">Drie stappen, in deze volgorde</h2>
    <p style="font-size:16px;line-height:1.7;color:rgba(61,46,30,.72);margin:0 0 28px;max-width:60ch;">Alles op Bylder hangt aan je woning. Daarom begint het daar, en niet bij een productcatalogus.</p>
    <ol style="list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
      <li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;">
        <span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">1</span>
        <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Welke woning ga je inrichten?</h3>
        <p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Je adres is genoeg. Wij zoeken op hoe ver de bouw in je buurt is, welk project er ligt en welke winkels in de buurt zitten. Adres nog onbekend? Dan volstaat je plaats.</p>
        <a href="https://app.bylder.com/woningscan" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Doe de woningscan &rarr;</a>
      </li>
      <li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;">
        <span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">2</span>
        <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Wat ga je kopen?</h3>
        <p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Vloer, raamdecoratie, verlichting, keuken, sanitair, tuin. Per categorie de eerlijke prijs in jouw gemeente, de winkels in de buurt en waar ledenkorting geldt.</p>
        <a href="/kopen/" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Alles wat je koopt &rarr;</a>
      </li>
      <li style="background:#fff;border:1px solid rgba(61,46,30,.1);border-radius:16px;padding:24px;">
        <span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:#EBF0E8;color:#3D5A3E;font-weight:800;font-family:monospace;margin-bottom:14px;">3</span>
        <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 8px;color:#1A1208;">Hulp bij de keuzes</h3>
        <p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,.75);margin:0 0 12px;">Meerwerk en offertes tegen marktprijzen gecheckt &mdash; en daarna de aankoopkeuzes zelf: welke vloer bij vloerverwarming, welke raamdecoratie bij een hoge pui, wat je beter vooraf vastlegt.</p>
        <a href="/nieuwbouw-tools/" style="font-weight:700;color:#3D5A3E;font-size:14px;text-decoration:none;">Alle tools &rarr;</a>
      </li>
    </ol>
  </div>
</section>`

const KORT = `<section style="padding:56px 24px;background:#EDE6D8;">
  <div style="max-width:760px;margin:0 auto;">
    <h2 style="font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin:0 0 12px;text-wrap:balance;color:#1A1208;">Wat is Bylder?</h2>
    <p style="font-size:16.5px;line-height:1.75;color:rgba(61,46,30,.78);margin:0 0 14px;">Een onafhankelijk platform voor iedereen die in Nederland een nieuwbouwwoning, bestaande woning of verbouwing heeft. Geen aannemer, geen ontwikkelaar, geen makelaar. Wij checken je offerte en meerwerk tegen marktdata, bevelen producten en vakbedrijven aan, plannen je traject en ontgrendelen korting bij 61 woonmerken.</p>
    <p style="font-size:16.5px;line-height:1.75;color:rgba(61,46,30,.78);margin:0 0 18px;">Gratis voor bewoners, omdat de aanbodkant betaalt &mdash; iedereen hetzelfde bedrag, zodat een aanbeveling op geschiktheid staat en niet op wie het meeste betaalt.</p>
    <a href="/hoe-het-werkt/" style="font-weight:700;color:#3D5A3E;font-size:15px;text-decoration:none;">Hoe Bylder werkt, in het lang &rarr;</a>
  </div>
</section>`

const NIEUW = { stappen: STAPPEN, kortuitleg: KORT }

const delen = VOLGORDE.map(([naam, i]) => i === null ? NIEUW[naam] : bij(i))

// Controle vóór het wegschrijven: geen interne link mag verdwijnen.
const oud = new Set(S.flatMap(s => [...s.blok.matchAll(/href="([^"]+)"/g)].map(m => m[1])).filter(l => l.startsWith('/')))
const nieuw = new Set(delen.flatMap(d => [...d.matchAll(/href="([^"]+)"/g)].map(m => m[1])).filter(l => l.startsWith('/')))
const kwijt = [...oud].filter(l => !nieuw.has(l))
console.log(`interne links: ${oud.size} oud → ${nieuw.size} nieuw · ${kwijt.length} kwijt`)
if (kwijt.length) { console.log(kwijt.join('\n')); process.exit(1) }

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
