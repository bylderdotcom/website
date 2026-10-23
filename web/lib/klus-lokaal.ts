// Lokale inhoud op de klus-per-gemeentepagina's (/project/<klus>/<gemeente>/, 23-10-2026).
//
// Waarom: "Badkamer renovatie in Utrecht" en "… in Aa en Hunze" deelden 92% van hun tekst; op
// de plaatsnaam na waren het 281 kopieën per klus, en geen enkele haalde in drie maanden drie
// klikken. Wat een pagina per gemeente echt anders maakt, ligt al in de repo:
//   - de vakbedrijven voor die klus in die gemeente, met rating (de profielen van de vakken);
//   - de winkels en showrooms voor dat producttype in de buurt (data/winkels-publiek.json) — het
//     showroomoverzicht per producttype uit de propositie in CLAUDE.md;
//   - de nieuwbouwprojecten in die gemeente, met een link naar hun projectpagina.
// Niets hiervan is geschat. Ontbreekt een gegeven, dan valt dat stuk weg.
//
// Alleen voor de klussen die bij nieuwbouwkopers horen (KLUSSEN); de klussen van bestaande bouw
// staan op noindex (besluit Daniel, 23-10-2026) en blijven zoals ze zijn.
// Build/server-only (fs).

import fs from 'node:fs'
import path from 'node:path'

const REPO = path.join(process.cwd(), '..')
const lees = (...p: string[]) => JSON.parse(fs.readFileSync(path.join(REPO, ...p), 'utf8'))

type Vak = { vak: string; wie: string }
export type Klus = { naam: string; vakken: Vak[]; winkels: string[]; winkelsLabel: string; gids?: string }

export const KLUSSEN: Record<string, Klus> = {
  'badkamer-renovatie': { naam: 'Badkamer renovatie', vakken: [{ vak: 'badkamer', wie: 'badkamerspecialisten' }, { vak: 'loodgieter', wie: 'loodgieters' }], winkels: ['sanitair', 'tegel'], winkelsLabel: 'sanitair en tegels' },
  'badkamer-tegelen': { naam: 'Badkamer tegelen', vakken: [{ vak: 'badkamer', wie: 'badkamerspecialisten' }], winkels: ['tegel', 'sanitair'], winkelsLabel: 'tegels en sanitair' },
  'gietvloer-leggen': { naam: 'Gietvloer leggen', vakken: [{ vak: 'gietvloer', wie: 'gietvloerspecialisten' }], winkels: ['vloeren'], winkelsLabel: 'vloeren', gids: 'gietvloeren' },
  'vloerverwarming-installeren': { naam: 'Vloerverwarming installeren', vakken: [{ vak: 'loodgieter', wie: 'installateurs' }], winkels: ['vloeren'], winkelsLabel: 'vloeren' },
  'parket-leggen': { naam: 'Parket leggen', vakken: [], winkels: ['vloeren'], winkelsLabel: 'vloeren' },
  'traprenovatie': { naam: 'Traprenovatie', vakken: [], winkels: ['vloeren'], winkelsLabel: 'vloeren en trapbekleding' },
  'keuken-monteren': { naam: 'Keuken monteren', vakken: [], winkels: ['keuken'], winkelsLabel: 'keukens', gids: 'keukens' },
  'raamdecoratie-plaatsen': { naam: 'Raamdecoratie plaatsen', vakken: [], winkels: ['raamdecoratie', 'zonwering'], winkelsLabel: 'raamdecoratie' },
  'zonwering-installeren': { naam: 'Zonwering installeren', vakken: [], winkels: ['zonwering', 'raamdecoratie'], winkelsLabel: 'zonwering' },
  'slaapkamer-inrichten': { naam: 'Slaapkamer inrichten', vakken: [], winkels: ['bedden', 'meubelwinkel'], winkelsLabel: 'bedden en meubels', gids: 'bedden' },
  'verlichting-installeren': { naam: 'Verlichting installeren', vakken: [{ vak: 'elektricien', wie: 'elektriciens' }], winkels: ['verlichting'], winkelsLabel: 'verlichting' },
  'schilderwerk-binnen': { naam: 'Schilderwerk binnen', vakken: [{ vak: 'schilder', wie: 'schilders' }], winkels: ['verf', 'muurdecoratie'], winkelsLabel: 'verf en wandafwerking' },
  'stucwerk': { naam: 'Stucwerk', vakken: [{ vak: 'stukadoor', wie: 'stukadoors' }], winkels: [], winkelsLabel: '' },
}

// Namen in de data staan soms al ge-escaped ("Badkamers &amp; Tegels"): eerst terug, dan escapen.
const terug = (s: string) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const E = (s: string) => terug(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const nl = (n: number) => n.toLocaleString('nl-NL')

// --- plaats → gemeente -------------------------------------------------------
// plaats-gemeente.json koppelt op de mediane positie van de bedrijven in een plaats, en zet zo
// bijvoorbeeld "rotterdam" bij Schiedam. Een plaatsnaam die zelf een gemeente is, blijft daarom
// die gemeente; de koppeling geldt alleen voor kernen zonder eigen gemeente (Benschop → Lopik).
let _gem: Record<string, string> | null = null
let _gemeenten: Set<string> | null = null
type Cijfers = { gemeente: string; slug: string; prijs?: number; prijs_vs_nl?: number; gereed?: number; gereed_jaar?: string; verhuizingen?: number }
let _cijfers: Record<string, Cijfers> | null = null
function gemeenteVan(plaats: string): string {
  if (!_gem) {
    _gem = {}; _cijfers = {}
    for (const [k, v] of Object.entries(lees('data', 'plaats-gemeente.json').plaatsen as Record<string, Cijfers>)) {
      _gem[k] = v.slug
      if (!_cijfers[v.slug] || k === v.slug) _cijfers[v.slug] = v
    }
    _gemeenten = new Set([
      ...(lees('data', 'gemeenten.json').gemeenten as { slug: string }[]).map(g => g.slug),
      ...Object.values(lees('data', 'clusters', 'project', 'vaksteden.json') as Record<string, { city_slug: string }>).map(v => v.city_slug),
    ])
  }
  return _gemeenten!.has(plaats) ? plaats : (_gem[plaats] ?? plaats)
}
function cijfersVan(gemeente: string): Cijfers | null {
  gemeenteVan(gemeente)
  const c = _cijfers![gemeente]
  return c && c.slug === gemeente ? c : null
}
const hoortBij = (plaats: string, gemeente: string) => gemeenteVan(plaats) === gemeenteVan(gemeente)

// --- coördinaten van de gemeente -------------------------------------------
// Volgorde: gemeenten.json, dan het midden van de nieuwbouwprojecten met die plaatsnaam, dan de
// gemeente van de plaats. Vijf gemeenten zonder één van die drie staan hier met hun centrum.
const VAST: Record<string, [number, number]> = {
  's-dwest-frysl-n': [53.03, 5.66], 'landerd': [51.75, 5.63], 'mill-en-sint-hubert': [51.69, 5.78],
  'noardeast-frysl-n': [53.33, 5.99], 'onderbanken': [50.96, 6.06],
}
let _coord: Record<string, [number, number]> | null = null
function coordVan(gemeente: string): [number, number] | null {
  if (!_coord) {
    _coord = { ...VAST }
    for (const g of lees('data', 'gemeenten.json').gemeenten as { slug: string; lat?: number; lng?: number }[])
      if (g.lat && g.lng) _coord[g.slug] = [g.lat, g.lng]
    const som: Record<string, [number, number, number]> = {}
    for (const p of projecten()) if (p.lat && p.lng) {
      const s = (som[p.plaats] ??= [0, 0, 0]); s[0] += p.lat; s[1] += p.lng; s[2]++
    }
    for (const [k, [a, b, n]] of Object.entries(som)) if (!(k in _coord)) _coord[k] = [a / n, b / n]
  }
  return _coord[gemeente] ?? _coord[gemeenteVan(gemeente)] ?? null
}
function km(a: [number, number], b: [number, number]): number {
  const r = Math.PI / 180, x = (b[1] - a[1]) * r * Math.cos((a[0] + b[0]) * r / 2), y = (b[0] - a[0]) * r
  return Math.sqrt(x * x + y * y) * 6371
}

// --- vakbedrijven -------------------------------------------------------------
type Bedrijf = { naam: string; pad: string; plaats: string; rating: number; reviews: number }
const _bedrijven: Record<string, Bedrijf[]> = {}
function bedrijvenVan(vak: string): Bedrijf[] {
  if (!_bedrijven[vak]) {
    const geindexeerd = new Set((lees('data', 'clusters', vak, 'pages.json') as { slug: string; robots?: string }[])
      .filter(p => p.slug.startsWith('bedrijf/') && !(p.robots ?? '').includes('noindex')).map(p => p.slug))
    _bedrijven[vak] = Object.entries(lees('data', 'clusters', vak, 'bedrijven.json') as Record<string, { name: string; city_slug?: string; rating_disp?: string; reviews?: string }>)
      .filter(([slug, b]) => geindexeerd.has(slug) && b.city_slug)
      .map(([slug, b]) => ({ naam: b.name, pad: `/${vak}/${slug}/`, plaats: b.city_slug!,
        rating: parseFloat((b.rating_disp ?? '').replace(',', '.')) || 0, reviews: parseInt(String(b.reviews ?? '0').replace(/\D/g, '')) || 0 }))
  }
  return _bedrijven[vak]
}
// Een 5,0 uit 2 reviews zegt minder dan een 4,7 uit 80.
const score = (rating: number, reviews: number) => rating * Math.min(1, Math.log10(1 + reviews) / 2)

// --- winkels en showrooms ---------------------------------------------------
type Winkel = { naam: string; cat: string; rating?: number; reviews?: number; lat: number; lng: number; website?: string }
let _winkels: Winkel[] | null = null
const winkels = () => (_winkels ??= (() => { const w = lees('data', 'winkels-publiek.json'); return (Array.isArray(w) ? w : Object.values(w).find(Array.isArray)) as Winkel[] })())
let _deelnemers: Map<string, string> | null = null
function bylderKorting(naam: string): string | undefined {
  if (!_deelnemers) {
    const d = lees('data', 'deelnemers.json'); const lijst = (Array.isArray(d) ? d : Object.values(d).find(Array.isArray)) as { naam: string; aanbod?: string }[]
    _deelnemers = new Map(lijst.map(x => [x.naam.toLowerCase(), x.aanbod ?? '']))
  }
  return _deelnemers.get(naam.toLowerCase())
}

// --- nieuwbouw ------------------------------------------------------------------
type Proj = { naam: string; plaats: string; woningen?: number | null; lat?: number; lng?: number }
let _proj: Proj[] | null = null
const projecten = () => (_proj ??= lees('data', 'nieuwbouwprojecten.json').projecten as Proj[])
let _projPaginas: Set<string> | null = null
const projSlug = (naam: string, plaats: string) =>
  `${naam} ${plaats}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace(/-{2,}/g, '-')
const heeftPagina = (slug: string) =>
  (_projPaginas ??= new Set((lees('data', 'clusters', 'nieuwbouw-project', 'pages.json') as { slug: string }[]).map(p => p.slug))).has(slug)

// --- samenvatting per pagina ------------------------------------------------
export type Lokaal = {
  klus: Klus; stad: string
  bedrijven: { wie: string; vak: string; totaal: number; top: Bedrijf[] }[]
  winkels: { w: Winkel; km: number; korting?: string }[]; winkelsTotaal: number
  nieuwbouw: { totaal: number; woningen: number; metPagina: { naam: string; pad: string }[] }
  markt: Cijfers | null; gemeente: string; klusSlug: string
}

const _cache: Record<string, Lokaal | null> = {}
export function lokaal(klusSlug: string, gemeente: string, stad: string): Lokaal | null {
  const sleutel = `${klusSlug}/${gemeente}`
  if (sleutel in _cache) return _cache[sleutel]
  const klus = KLUSSEN[klusSlug]
  if (!klus) return (_cache[sleutel] = null)

  const bedrijven = klus.vakken.map(({ vak, wie }) => {
    const hier = bedrijvenVan(vak).filter(b => hoortBij(b.plaats, gemeente))
    return { wie, vak, totaal: hier.length, top: [...hier].sort((a, b) => score(b.rating, b.reviews) - score(a.rating, a.reviews)).slice(0, 5) }
  }).filter(x => x.totaal > 0)

  const c = coordVan(gemeente)
  const dichtbij = c ? winkels().filter(w => klus.winkels.includes(w.cat) && w.lat && w.lng)
    .map(w => ({ w, km: km(c, [w.lat, w.lng]), korting: bylderKorting(w.naam) })).filter(x => x.km <= 15) : []
  dichtbij.sort((a, b) => (b.korting !== undefined ? 1 : 0) - (a.korting !== undefined ? 1 : 0)
    || score(b.w.rating ?? 0, b.w.reviews ?? 0) - score(a.w.rating ?? 0, a.w.reviews ?? 0))

  const hierBouw = projecten().filter(p => hoortBij(p.plaats, gemeente))
  const metPagina = hierBouw.map(p => ({ naam: p.naam, pad: `/nieuwbouw-project/${projSlug(p.naam, p.plaats)}/` }))
    .filter(p => heeftPagina(p.pad.split('/')[2])).slice(0, 6)

  return (_cache[sleutel] = {
    klus, stad, bedrijven,
    winkels: dichtbij.slice(0, 6), winkelsTotaal: dichtbij.length,
    nieuwbouw: { totaal: hierBouw.length, woningen: hierBouw.reduce((s, p) => s + (p.woningen ?? 0), 0), metPagina },
    markt: cijfersVan(gemeente), gemeente, klusSlug,
  })
}

// --- HTML en vragen ------------------------------------------------------------
const kort = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export function vragen(l: Lokaal): [string, string][] {
  const k = kort(l.klus.naam), uit: [string, string][] = []
  for (const b of l.bedrijven) {
    const namen = b.top.slice(0, 3).map(x => x.rating ? `${terug(x.naam)} (${x.rating.toFixed(1).replace('.', ',')} uit ${nl(x.reviews)} reviews)` : terug(x.naam))
    uit.push([`Welke ${b.wie} zijn er in ${l.stad}?`,
      `Bylder kent ${nl(b.totaal)} ${b.wie} in ${l.stad}${namen.length ? `, onder meer ${namen.join(', ')}` : ''}. ` +
      `De scores komen van Google; op elk profiel staat de bron.`])
  }
  if (l.winkels.length) {
    const namen = l.winkels.slice(0, 3).map(x => `${terug(x.w.naam)} (${x.km.toFixed(0)} km)`)
    uit.push([`Waar zie ik ${l.klus.winkelsLabel} in de buurt van ${l.stad}?`,
      `Binnen 15 kilometer van ${l.stad} liggen ${nl(l.winkelsTotaal)} winkels en showrooms voor ${l.klus.winkelsLabel}, onder meer ${namen.join(', ')}. ` +
      `Ga kijken voordat je bestelt: kleur en afwerking zie je pas echt in het echt.`])
  }
  if (l.nieuwbouw.totaal) {
    uit.push([`Hoeveel nieuwbouw komt er in ${l.stad}?`,
      `Bylder volgt ${nl(l.nieuwbouw.totaal)} nieuwbouwprojecten in ${l.stad}${l.nieuwbouw.woningen ? `, samen ${nl(l.nieuwbouw.woningen)} woningen voor zover bekend` : ''}. ` +
      `Wie daar koopt, laat de ${k} meestal in het eerste jaar na de oplevering doen, en dan zoekt iedereen tegelijk een vakman.`])
  }
  return uit
}

export function lokaalHtml(l: Lokaal): string {
  const k = kort(l.klus.naam), h2 = 'font-size:clamp(1.4rem,2.2vw,2rem);font-weight:800;color:var(--bark);letter-spacing:-0.025em;margin:0 0 8px'
  const p = 'font-size:15px;color:var(--bark-3);margin:0 0 16px;max-width:68ch;line-height:1.65'
  const li = 'padding:10px 0;border-bottom:1px solid rgba(61,46,30,0.1);font-size:15px'
  const delen: string[] = []

  for (const b of l.bedrijven) {
    delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:24px 0 6px">${nl(b.totaal)} ${E(b.wie)} in ${E(l.stad)}</h3>` +
      `<ul style="list-style:none;padding:0;margin:0 0 8px">` + b.top.map(x =>
        `<li style="${li}"><a href="${x.pad}" style="font-weight:700">${E(x.naam)}</a>` +
        (x.rating ? ` <span style="color:var(--bark-3)">&#9733; ${x.rating.toFixed(1).replace('.', ',')} uit ${nl(x.reviews)} reviews</span>` : '') + '</li>').join('') +
      `</ul><p style="${p}"><a href="/${b.vak}/">Alle ${E(b.wie)} op Bylder &rarr;</a></p>`)
  }
  if (l.winkels.length) {
    delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:24px 0 6px">${E(l.klus.winkelsLabel.charAt(0).toUpperCase() + l.klus.winkelsLabel.slice(1))} bekijken in de buurt</h3>` +
      `<p style="${p}">${nl(l.winkelsTotaal)} winkels en showrooms binnen 15 kilometer van ${E(l.stad)}. Bij een winkel met Bylder-korting krijg je met een gratis account ledenkorting.</p>` +
      `<ul style="list-style:none;padding:0;margin:0 0 8px">` + l.winkels.map(x =>
        `<li style="${li}"><strong>${E(x.w.naam)}</strong>` +
        (x.korting !== undefined ? ` <span style="background:#3D5A3E;color:#F5F0E8;font-size:12px;font-weight:700;padding:2px 8px;border-radius:999px">Bylder-korting${x.korting ? ': ' + E(x.korting) : ''}</span>` : '') +
        ` <span style="color:var(--bark-3)">&middot; ${x.km.toFixed(0)} km${x.w.rating ? ` &middot; &#9733; ${String(x.w.rating).replace('.', ',')} uit ${nl(x.w.reviews ?? 0)} reviews` : ''}</span>` +
        (x.w.website ? ` &middot; <a href="${E(x.w.website)}" rel="nofollow noopener" target="_blank">website</a>` : '') + '</li>').join('') + '</ul>' +
      (l.klus.gids ? `<p style="${p}"><a href="/showrooms/${l.klus.gids}/">De showrooms die wij aanraden voor ${E(l.klus.winkelsLabel)} &rarr;</a></p>` : ''))
  }
  if (l.nieuwbouw.totaal) {
    delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:24px 0 6px">Nieuwbouw in ${E(l.stad)}</h3>` +
      `<p style="${p}">Bylder volgt ${nl(l.nieuwbouw.totaal)} nieuwbouwprojecten in ${E(l.stad)}. Kopers daar laten de ${E(k)} meestal in het eerste jaar na de sleutel doen.` +
      (l.nieuwbouw.metPagina.length ? ' Per project staat uitgewerkt wat er wanneer beslist moet worden:' : '') + '</p>' +
      (l.nieuwbouw.metPagina.length ? '<ul style="margin:0 0 8px;padding-left:20px">' +
        l.nieuwbouw.metPagina.map(x => `<li style="padding:4px 0"><a href="${x.pad}">${E(x.naam)}</a></li>`).join('') + '</ul>' : ''))
  }
  const m = l.markt
  if (m && (m.verhuizingen || m.gereed || m.prijs)) {
    const ruw = lees('data', 'gemeenten.json') as { jaar_verhuizingen?: string; jaar_prijs?: string }
    const jaar = (s?: string) => (s ?? '').slice(0, 4)
    const jaren = { jaar_verhuizingen: jaar(ruw.jaar_verhuizingen), jaar_prijs: jaar(ruw.jaar_prijs) }
    const zinnen = [
      m.verhuizingen ? `${nl(m.verhuizingen)} verhuizingen${jaren.jaar_verhuizingen ? ` in ${jaren.jaar_verhuizingen}` : ''}` : '',
      m.gereed ? `${nl(m.gereed)} opgeleverde nieuwbouwwoningen in ${m.gereed_jaar ?? 'het laatste jaar'}` : '',
      m.prijs ? `een gemiddelde woningprijs van €${nl(m.prijs)}${m.prijs_vs_nl != null ? ` (${m.prijs_vs_nl > 0 ? '+' : ''}${m.prijs_vs_nl}% tegenover Nederland)` : ''}${jaren.jaar_prijs ? `, ${jaren.jaar_prijs}` : ''}` : '',
    ].filter(Boolean)
    delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:24px 0 6px">De woningmarkt in ${E(m.gemeente)}</h3>` +
      `<p style="${p}">${E(m.gemeente)} telde ${zinnen.map(E).join(', ')}. Wie verhuist of een nieuwe woning krijgt, begint aan de afwerking: ` +
      `daar zit de vraag naar ${E(k)}. Bron: CBS en Kadaster. <a href="/wonen-in/${E(m.slug)}/">Alle cijfers over wonen in ${E(m.gemeente)}</a>.</p>`)
  }
  const ander = Object.entries(KLUSSEN).filter(([s]) => s !== l.klusSlug)
  delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:24px 0 6px">Andere klussen in ${E(l.stad)}</h3>` +
    `<p style="${p}">` + ander.map(([s, x]) => `<a href="/project/${s}/${l.gemeente}/">${E(x.naam.toLowerCase())}</a>`).join(' &middot; ') + '</p>')
  const v = vragen(l)
  if (v.length) delen.push(`<h3 style="font-size:1.15rem;font-weight:800;margin:28px 0 6px">Vragen over ${E(k)} in ${E(l.stad)}</h3>` +
    v.map(([q, a]) => `<details style="border-bottom:1px solid rgba(61,46,30,0.12);padding:12px 0"><summary style="font-weight:700;cursor:pointer">${E(q)}</summary><p style="${p};margin-top:8px">${E(a)}</p></details>`).join(''))
  if (!delen.length) return ''
  return `<section class="section" style="background:var(--cream-2)"><div class="container">` +
    `<h2 style="${h2}">${E(l.klus.naam)} in ${E(l.stad)}: wie, waar en wanneer</h2>` +
    `<p style="${p}">Wie het in ${E(l.stad)} uitvoert, waar je de materialen ziet en hoeveel er in de gemeente gebouwd wordt.</p>` +
    delen.join('') + '</div></section>'
}
