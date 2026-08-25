import fs from 'node:fs'
import path from 'node:path'

/**
 * Klussen die Bylder zelf heeft uitgevoerd, op de projectpagina waar ze bij horen.
 *
 * WAAROM
 * aanhuis.nl heeft 722 pagina's en is de autoriteit in deze categorie. Bylder heeft er
 * 56.649 en is dat niet. Het verschil zit niet in techniek: hun pagina's documenteren
 * werk dat zíj hebben gedaan — 129 vtwonen-afleveringen, 11 keer Kopen Zonder Kijken,
 * 12 projecten — en de onze beschrijven wat anderen misschien gaan doen. Dat is het
 * verschil tussen bewijs en inventaris.
 *
 * Eén afgeronde klus met adres, product, kosten en wat er tegenviel, is een pagina die
 * niemand anders kan schrijven. Duizend gemeente-varianten van dezelfde tekst kan
 * iedereen schrijven, en dat is precies wat /kopen/ laat zien: 33.014 pagina's, zeven
 * AI-vertoningen.
 *
 * LEEG BLIJFT LEEG
 * Er is nog geen klus uitgevoerd, dus dit rendert niets. Bewust: een blok "onze
 * projecten" met een verzonnen voorbeeld erin is erger dan geen blok. Zodra er één
 * echte klus in data/uitgevoerde-klussen.json staat, verschijnt hij vanzelf op de
 * bijbehorende projectpagina.
 */

const BRON = path.join(process.cwd(), '..', 'data', 'uitgevoerde-klussen.json')

export type Klus = {
  project_slug: string
  plaats?: string
  adres?: string
  datum: string
  wat: string
  producten?: { merk: string; product: string; url?: string }[]
  uitvoering?: { rol: string; bedrijf: string; profiel?: string }[]
  kosten?: string
  doorlooptijd?: string
  fotos?: { src: string; alt: string }[]
  wat_we_leerden?: string
}

let _klussen: Klus[] | null = null
function alle(): Klus[] {
  if (_klussen) return _klussen
  try {
    const d = JSON.parse(fs.readFileSync(BRON, 'utf8'))
    _klussen = Array.isArray(d?.klussen) ? d.klussen : []
  } catch {
    _klussen = []
  }
  return _klussen!
}

export function klussenVoor(slug: string): Klus[] {
  return alle()
    .filter((k) => k.project_slug === slug)
    .sort((a, b) => (a.datum < b.datum ? 1 : -1))
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** 2026-09-14 → 14 september 2026 */
function datum(iso: string): string {
  const m = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
             'augustus', 'september', 'oktober', 'november', 'december']
  const d = iso.split('-')
  return d.length === 3 ? `${Number(d[2])} ${m[Number(d[1]) - 1]} ${d[0]}` : iso
}

function kaart(k: Klus): string {
  const regel = (kop: string, waarde: string) =>
    `<div style="display:flex;gap:10px;font-size:13.5px;line-height:1.6;">` +
    `<span style="color:rgba(61,46,30,0.55);min-width:104px;flex:none;">${kop}</span>` +
    `<span style="color:rgba(61,46,30,0.85);">${waarde}</span></div>`

  const producten = (k.producten ?? [])
    .map((p) => p.url
      ? `<a href="${esc(p.url)}" style="color:#3D5A3E;font-weight:600;">${esc(p.merk)} ${esc(p.product)}</a>`
      : `${esc(p.merk)} ${esc(p.product)}`)
    .join(' · ')

  const uitvoering = (k.uitvoering ?? [])
    .map((u) => `${esc(u.rol)}: ` + (u.profiel
      ? `<a href="${esc(u.profiel)}" style="color:#3D5A3E;font-weight:600;">${esc(u.bedrijf)}</a>`
      : esc(u.bedrijf)))
    .join(' · ')

  const fotos = (k.fotos ?? []).length
    ? `<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin:14px 0 4px;">`
      + (k.fotos ?? []).map((f) =>
          `<img src="${esc(f.src)}" alt="${esc(f.alt)}" loading="lazy" decoding="async" ` +
          `style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:11px;display:block;">`).join('')
      + `</div>`
    : ''

  return (
    `<article style="background:#fff;border:1px solid rgba(61,46,30,0.12);border-radius:16px;padding:22px;">` +
    `<div style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.08em;` +
    `text-transform:uppercase;color:rgba(61,46,30,0.5);font-weight:700;">${esc(datum(k.datum))}` +
    (k.adres ? ` · ${esc(k.adres)}` : k.plaats ? ` · ${esc(k.plaats)}` : '') + `</div>` +
    `<h3 style="font-size:1.05rem;font-weight:800;color:#1A1208;margin:6px 0 12px;">${esc(k.wat)}</h3>` +
    fotos +
    `<div style="display:grid;gap:7px;margin-top:12px;">` +
    (producten ? regel('Gebruikt', producten) : '') +
    (uitvoering ? regel('Uitgevoerd door', uitvoering) : '') +
    (k.kosten ? regel('Betaald', esc(k.kosten)) : '') +
    (k.doorlooptijd ? regel('Doorlooptijd', esc(k.doorlooptijd)) : '') +
    `</div>` +
    (k.wat_we_leerden
      ? `<p style="margin:14px 0 0;padding-top:13px;border-top:1px dashed rgba(61,46,30,0.18);` +
        `font-size:14px;line-height:1.7;color:rgba(61,46,30,0.78);">` +
        `<strong style="color:#1A1208;">Wat we hier leerden.</strong> ${esc(k.wat_we_leerden)}</p>`
      : '') +
    `</article>`
  )
}

/** Voegt het klussenblok toe aan een <main>-fragment; zonder klussen verandert er niets. */
export function metKlussen(html: string, slug: string): string {
  const ks = klussenVoor(slug)
  if (!ks.length) return html
  const blok =
    `<section style="margin-top:44px;">` +
    `<h2 style="font-size:1.45rem;font-weight:800;letter-spacing:-.02em;color:#1A1208;margin:0 0 6px;">` +
    `Wat wij hier hebben gedaan</h2>` +
    `<p style="font-size:15px;line-height:1.7;color:rgba(61,46,30,0.72);margin:0 0 18px;max-width:66ch;">` +
    `${ks.length === 1 ? 'Eén klus' : `${ks.length} klussen`} in dit project, met de werkelijk betaalde ` +
    `bedragen en wat er anders liep dan verwacht.</p>` +
    `<div style="display:grid;gap:14px;">${ks.map(kaart).join('')}</div>` +
    `</section>`
  return html.includes('</main>') ? html.replace('</main>', `${blok}</main>`) : html + blok
}
