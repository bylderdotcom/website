/**
 * Snijdt het oude, ingebakken paginakopstuk uit een contentfragment.
 *
 * De kopen- en project-hubs komen uit de oudere Fase 1B-generator, die de
 * site-nav zélf in het fragment bakte: <nav class="glass-nav">, een
 * mobile-nav-blok en een toggleMobile-script. Sinds de gedeelde layout de
 * navigatie levert, stond die oude kop er dubbel bovenop — onopgemaakt, want
 * zijn CSS reist niet mee met het fragment. Zo zag Daniel hem op /kopen/:
 * paarse onderstreepte links boven een lege strook.
 *
 * kortingscode.ts loste dit al op door alles vóór <main> weg te snijden; deze
 * fragmenten hébben geen <main>, dus hier verwijderen we de drie blokken
 * gericht. Fragmenten zonder oude kop komen ongewijzigd terug.
 */
export function zonderOudKopstuk(html: string): string {
  return html
    // Elk ingebakken hoofdmenu, in alle drie de generaties die in deze
    // fragmenten voorkomen: de glass-nav van vóór juli, het .ni-menu uit de
    // kopen- en project-sjablonen ("Voordelen · Vouchers · Kopen · Prijzen"),
    // en het huidige byl-nav2026-menu dat de veegronde van 27-08-2026 in data/
    // schreef. De layout levert het echte menu; dat heeft geen aria-label, dus
    // het kan hier niet per ongeluk mee. Kruimelpaden (aria-label="Kruimelpad")
    // blijven staan.
    //
    // Tot 11-09-2026 herkende deze regel alleen de glass-nav. Op /kopen/ en
    // /project/ stond daardoor sinds eind augustus een ongestijld tweede menu,
    // en op alle ~33.000 kopen-pagina's lag het .ni-menu over het echte heen.
    //
    // Met het menu gaat ook het lege afstandsblok erna weg (<div
    // style="padding-top:88px">). Dat hield ruimte vrij onder het oude, vaste
    // menu; het echte menu neemt zijn eigen ruimte in. Het komt in 136
    // fragmenten voor, steeds direct na het menu en nergens anders.
    .replace(/<nav\b[^>]*(?:glass-nav|byl-nav2026|aria-label="Hoofdnavigatie")[^>]*>[\s\S]*?<\/nav>(?:\s*<div style="padding-top:\d+px"><\/div>)?/g, '')
    .replace(/<div class="mobile-nav"[\s\S]*?<\/div>/g, '')
    .replace(/<script>[\s\S]{0,200}?function toggleMobile[\s\S]*?<\/script>/g, '')
}

/**
 * Haalt de kale `nav{...}`-regel uit de sjabloon-CSS.
 *
 * De oudere kopen- en project-sjablonen stijlen hun eigen menu met een
 * tag-selector: nav{position:fixed;height:64px;display:flex;padding:0 5%}.
 * Dat menu knippen we weg, maar de regel bleef staan en greep het échte menu
 * uit de layout: platgedrukt tot 64px hoog, bovenbalk en hoofdbalk naast
 * elkaar, de knop rechts van het scherm af.
 */
export function zonderKaleNavRegel(css: string): string {
  // Alleen een regel waarvan de selector precies 'nav' is (na '}', '{' of aan
  // het begin). 'header nav{…}' of '.mobile-nav{…}' blijven dus staan.
  return css.replace(/(^|[{}])\s*nav\s*\{[^}]*\}/g, '$1')
}
