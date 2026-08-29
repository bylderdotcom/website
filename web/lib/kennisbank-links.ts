// Interne links naar de Kennisbank, geïnjecteerd in de clusters die daadwerkelijk
// gecrawld worden.
//
// Aanleiding (31 jul 2026): van 25 gemeten kennisbank-URL's was 36% "onbekend bij
// Google" en 40% "gevonden, niet geïndexeerd" — slechts 24% zat in de index. Niet
// door de inhoud (888 woorden per pagina, 91% uniek), maar door vindbaarheid.
// 25.697 van de 28.615 pagina's die naar de kennisbank linkten waren de
// vakbedrijf-profielen, en die staan sinds vandaag op noindex; hun links dragen op
// termijn niets meer.
//
// Daarom linken vanaf de secties die in de laatste 90 dagen echt vertoningen kregen:
// kopen (23.135), kortingscode (3.326), project (1.765) en nieuwbouw-project. Dat is
// waar Google al komt — een link daar wordt ook echt gevolgd.
//
// Bewust geen link naar álles: per cluster een handvol secties die inhoudelijk
// aansluiten, zodat het voor een lezer een vervolg is en niet een linkblok.

type Link = { href: string; label: string }

// Alleen bestaande hub-URL's (geverifieerd tegen kennisbank-sitemap.xml).
const SECTIES: Record<string, Link> = {
  materialen: { href: '/kennisbank/materialen/', label: 'Materialen' },
  vloeren: { href: '/kennisbank/vloeren/', label: 'Vloeren & afwerking' },
  keuken: { href: '/kennisbank/keuken/', label: 'Keuken kiezen' },
  badkamer: { href: '/kennisbank/badkamer/', label: 'Badkamer kiezen' },
  installaties: { href: '/kennisbank/installaties/', label: 'Installaties & duurzaam wonen' },
  bouwtechniek: { href: '/kennisbank/bouwtechniek/', label: 'Bouwproces & techniek' },
  geldRecht: { href: '/kennisbank/geld-recht/', label: 'Geld & recht' },
  begrip: { href: '/kennisbank/begrip/', label: 'Bouwbegrippen' },
  besparen: { href: '/kennisbank/kosten-besparen-nieuwbouw/', label: 'Kosten besparen bij nieuwbouw' },
  rapport: { href: '/kennisbank/verbouwprijzen-rapport/', label: 'Verbouwprijzen 2026' },
}

// Per cluster de secties die inhoudelijk aansluiten.
export const KENNISBANK_SETS: Record<string, string[]> = {
  // interieur kopen → productkeuze
  kopen: ['materialen', 'vloeren', 'keuken', 'badkamer'],
  // korting op merken → zelfde koopmoment, plus prijsduiding
  kortingscode: ['materialen', 'keuken', 'badkamer', 'rapport'],
  // nieuwbouwkopers → proces, geld en installaties
  project: ['bouwtechniek', 'geldRecht', 'installaties', 'besparen'],
  nieuwbouwProject: ['bouwtechniek', 'geldRecht', 'besparen', 'begrip'],
}

// Het blok wordt ná </div></div> vóór </main> ingevoegd en staat dus BUITEN de
// container van het cluster. Zonder eigen max-width en marges liep het over de
// volle schermbreedte en begon de tekst tegen de linkerrand — op een scherm van
// 1440px zag dat eruit als afgesneden tekst. Zelfde breedte als de kolom
// erboven, zodat het uitlijnt met de rest van de pagina.
function blok(keys: string[]): string {
  const links = keys
    .map(k => SECTIES[k])
    .filter(Boolean)
    .map(
      l =>
        `<a href="${l.href}" style="display:inline-flex;align-items:center;padding:7px 12px;border-radius:9px;background:#fff;border:1px solid rgba(61,46,30,0.1);color:#1A1208;font-size:13px;font-weight:600;text-decoration:none;">${l.label}</a>`,
    )
    .join('')
  return (
    `<section style="max-width:820px;margin:40px auto 0;padding:24px 24px 0;border-top:1px solid rgba(61,46,30,0.1);">` +
    `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3D5A3E;margin-bottom:6px;">Verder lezen</h2>` +
    `<p style="font-size:13px;color:rgba(61,46,30,0.72);margin:0 0 12px;max-width:680px;">Achtergrond en uitleg in de <a href="/kennisbank/" style="color:#3D5A3E;font-weight:600;">Bylder Kennisbank</a>.</p>` +
    `<div style="display:flex;flex-wrap:wrap;gap:8px;">${links}</div>` +
    `</section>`
  )
}

/**
 * Voegt het kennisbank-blok toe aan een <main>-fragment.
 * Sommige clusters leveren een fragment mét </main> (kortingscode,
 * nieuwbouw-project), andere zonder (kopen, project) — vandaar beide paden.
 */
export function metKennisbank(html: string, setKey: string): string {
  const keys = KENNISBANK_SETS[setKey]
  if (!keys || !keys.length) return html
  const b = blok(keys)
  return html.includes('</main>') ? html.replace('</main>', `${b}</main>`) : html + b
}

/**
 * Eén gerichte verwijzing, gekoppeld aan de slug van de pagina.
 *
 * Waarom niet in de footer-template: die is gedeeld met twaalf andere categorieën,
 * dus een deurlink zou ook op zonnepanelen- en tuinpagina's belanden. En niet in de
 * content-templates: dan moet je 25 bestanden bijhouden voor één link.
 *
 * Hier staat per regel welke pagina's hem krijgen. Nu alleen de deurpagina's, die
 * naar de kozijnloze deuren wijzen — 2.822 pagina's die op positie 40 staan en één
 * klik per kwartaal opleveren, met een link naar de pagina die het onderwerp echt
 * uitlegt.
 */
type Wijzer = { past: (slug: string) => boolean; href: string; kop: string; tekst: string; label: string }

const WIJZERS: Wijzer[] = [
  {
    past: (s) => s.startsWith('binnendeuren') || s.startsWith('buitendeuren'),
    href: '/kozijnloze-deuren/',
    kop: 'Ook een optie',
    tekst: 'Een kozijnloze deur verdwijnt in de wand: geen kozijn, geen architraaf, alleen een '
      + 'schaduwvoeg. Let op — dit ligt vast vóór de stukadoor komt, dus het is meerwerk en geen inrichting.',
    label: 'Kozijnloze deuren: prijzen en wanneer je kiest',
  },
]

export function metWijzer(html: string, slug: string): string {
  const w = WIJZERS.find((x) => x.past(slug))
  if (!w) return html
  const b =
    `<section style="margin-top:32px;padding:20px 22px;border:1px solid rgba(61,90,62,0.3);border-radius:14px;background:#fff;">` +
    `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#3D5A3E;margin:0 0 8px;">${w.kop}</h2>` +
    `<p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,0.78);margin:0 0 12px;max-width:70ch;">${w.tekst}</p>` +
    `<a href="${w.href}" style="font-size:14px;font-weight:700;color:#3D5A3E;text-decoration:none;">${w.label} &rarr;</a>` +
    `</section>`
  return html.includes('</main>') ? html.replace('</main>', `${b}</main>`) : html + b
}
