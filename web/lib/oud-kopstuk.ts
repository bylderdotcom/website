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
    .replace(/<nav[^>]*glass-nav[\s\S]*?<\/nav>/g, '')
    .replace(/<div class="mobile-nav"[\s\S]*?<\/div>/g, '')
    .replace(/<script>[\s\S]{0,200}?function toggleMobile[\s\S]*?<\/script>/g, '')
}
