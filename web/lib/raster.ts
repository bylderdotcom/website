/**
 * Clusterpagina's op het raster van het menu.
 *
 * De sjablonen van de vakbedrijfclusters openen met een container die in het
 * midden staat, elk met een eigen breedte. Het menu staat op een raster van
 * 1200px; daardoor begon de tekst per paginasoort op een andere plek, en nergens
 * onder het logo (21 verschillende inhoudsbreedtes op de site, gemeten
 * 11-09-2026).
 *
 * Besluit Daniel, 11-09-2026: alle inhoud op het raster van het menu, lopende
 * tekst op leesbare breedte maar links uitgelijnd. Per opening: de container
 * wordt het menuraster, de inhoud erin houdt de breedte die ze had (via
 * --bv-inhoud) — alleen niet meer gecentreerd. De stijl staat in de layout
 * (.bv-raster). De sjablonen zelf blijven onaangeroerd.
 */
const OPENINGEN: { oud: string; main: string; inhoud: string }[] = [
  // Vakbedrijfprofielen (125 sjablonen, 8 clusters): 920px gecentreerd.
  { oud: '<main style="padding:40px 0 20px;"><div class="container" style="max-width:920px;">',
    main: 'padding:40px 0 20px;', inhoud: '824px' },
  // Stadspagina's (2 sjablonen per cluster): 1000px gecentreerd.
  { oud: '<main style="padding:48px 0 20px;"><div class="container" style="max-width:1000px;">',
    main: 'padding:48px 0 20px;', inhoud: '904px' },
  // Overzichtspagina's (/aannemer/, /schilder/ …): container 1180px met 48px
  // marge; de tekst erin is al links uitgelijnd en mag de volle breedte houden.
  { oud: '<main style="padding:56px 0 20px;"><div class="container">',
    main: 'padding:56px 0 20px;', inhoud: 'none' },
]

export function opRaster(html: string): string {
  for (const o of OPENINGEN) {
    if (html.includes(o.oud)) {
      return html.replace(o.oud,
        `<main style="${o.main}"><div class="container bv-raster" style="--bv-inhoud:${o.inhoud}">`)
    }
  }
  return html
}

/**
 * Kopen en project (~38.600 pagina's) regelen hun breedte niet in de opening
 * maar in de sjabloonstijl: .c of .container, 1060px (op één na 1100px) met 5%
 * zijmarge, gecentreerd. Op 1440px begon de tekst daardoor 118px rechts van het
 * logo. Deze regels komen ná de sjabloonstijl en maken de container het
 * menuraster; de inhoud erin houdt de breedte die ze op desktop had (916px),
 * alleen links. Zelfde zijmarges per schermbreedte als het menu.
 */
export const RASTER_SJABLOON_CSS =
  '.c,.container{max-width:1200px;margin:0 auto;padding:0 24px;box-sizing:border-box}'
  + '.c>*,.container>*{max-width:916px}'
  + '@media(max-width:1020px){.c,.container{padding:0 16px}}'
  + '@media(max-width:420px){.c,.container{padding:0 14px}}'
  + '@media(max-width:359px){.c,.container{padding:0 10px}}'
