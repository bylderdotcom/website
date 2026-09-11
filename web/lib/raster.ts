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
