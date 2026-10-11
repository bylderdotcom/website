// Vakmannen met een eigen aanbrenglink (bylder.com/via/<slug>/). De slug is dezelfde als in
// de app (vakbedrijven.slug); daar worden kopers en aanvragen aan hem toegerekend.
// Een nieuwe vakman: hier toevoegen én in de app aanmaken (zie de migratie aanbrengers).

export type Aanbrenger = {
  slug: string
  naam: string
  bedrijf: string
  plaats: string
  website?: string
  /** Wat hij zelf doet, in één zin. */
  vak: string
}

export const AANBRENGERS: Aanbrenger[] = [
  {
    slug: 'mike-van-giesen',
    naam: 'Mike van Giesen',
    bedrijf: 'Klussenier Rosmalen',
    plaats: 'Rosmalen',
    website: 'https://mikevangiesen.klussenier.nl/klusbedrijf/rosmalen/',
    vak: 'Klusbedrijf voor afbouw en verbouw',
  },
]
