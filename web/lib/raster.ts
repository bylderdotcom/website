/**
 * Vakbedrijfprofielen op het raster van het menu.
 *
 * Alle 125 profielsjablonen (8 clusters) openen met een container van 920px die
 * in het midden staat. Het menu staat op een raster van 1200px; daardoor begon
 * de tekst op desktop ~165px rechts van het logo, en sprong de linkerrand per
 * paginasoort (21 verschillende inhoudsbreedtes op de site, gemeten 11-09-2026).
 *
 * Besluit Daniel, 11-09-2026: alle inhoud op het raster van het menu, lopende
 * tekst op leesbare breedte maar links uitgelijnd. Voor de profielen betekent
 * dat: de container wordt het menuraster, de inhoud erin blijft 824px — even
 * breed als voorheen, alleen niet meer gecentreerd. De stijl staat in de layout
 * (.bv-raster).
 */
const OUD = '<main style="padding:40px 0 20px;"><div class="container" style="max-width:920px;">'
const NIEUW = '<main style="padding:40px 0 20px;"><div class="container bv-raster">'

export function opRaster(html: string): string {
  return html.replace(OUD, NIEUW)
}
