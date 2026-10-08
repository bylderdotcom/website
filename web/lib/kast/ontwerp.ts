// KOPIE van app/src/lib/kast/ontwerp.ts (bylderdotcom/app). Wijzig beide tegelijk, anders lopen
// de website-ontwerper en wat het timmerbedrijf ziet uit elkaar.
// De ontwerptaal voor kasten op maat.
//
// De koper ziet geen bouwstenen: hij praat met de AI en uploadt foto's. De AI legt
// het ontwerp vast in deze taal, en het rekenmodel (rekenmodel.ts) maakt er platen,
// fronten, beslag, tekeningen en een zaaglijst van. Er zijn geen vaste kastjes of
// standaardmaten: elke breedte, hoogte, verdeling en ronde kop is mogelijk, zolang
// het uit plaatmateriaal te maken is. De vakregels bewaakt het rekenmodel.
//
// Alle maten in centimeters.

export type Inhoud = 'deuren' | 'open' | 'lades' | 'dicht' | 'leeg'

/** Eén vak binnen een zone, als de vakken van elkaar verschillen. */
export type Vak = {
  /** Aantal legplanken in dit vak (0 = geen). */
  planken: number
  /** Vrije hoogte onderin voordat de eerste plank komt, bv. 148 voor een steelstofzuiger. */
  vrijOnder?: number | null
  /** Waar het vak voor is, in gewone taal: 'stofzuiger', 'boeken', 'tv'. */
  functie?: string | null
}

/** Een zone is een laag van een segment, van onder naar boven. Elke zone is een eigen korpus. */
export type Zone = {
  hoogte: number
  inhoud: Inhoud
  /** Bij 'deuren': 1 of 2 deuren naast elkaar. */
  deuren?: 1 | 2 | null
  /** Bij 'lades': aantal lades boven elkaar. */
  lades?: number | null
  /** Legplanken per vak (bij 'deuren' en 'open'). */
  planken?: number | null
  /** Bij 2 deuren: een tussenschot onder de naad (standaard ja). Nee = één breed vak, bv. voor een stofzuiger. */
  tussenschot?: boolean | null
  /** Optioneel per vak (links → rechts, gezien vanaf de voorkant): afwijkende planken of functie. */
  vakken?: Vak[] | null
  functie?: string | null
}

export type Segment = {
  /** Breedte van de voorkant. Bij een ronde kop wordt dit de straal en gelijk aan de diepte. */
  breedte: number
  /** 'rond' = kwartcirkel als kop aan een vrij uiteinde. */
  vorm: 'recht' | 'rond'
  zones: Zone[]
}

export type Been = {
  /** Naam van de muur zoals de koper hem noemt: 'lange muur', 'trapwand'. */
  muur: string
  /** Beschikbare muurlengte, als die bekend is. */
  muurlengte?: number | null
  /** Segmenten van het begin (bij een hoek: vanaf de hoek) naar het eind. */
  segmenten: Segment[]
}

export type Afwerking = {
  soort: 'lak' | 'hout' | 'decor'
  /** Bv. 'RAL 5014 duifblauw' of 'Gerookt eiken'. */
  naam: string
  /** Bv. 'RAL 5014', 'NCS S 3020-B', of een decornummer. */
  code?: string | null
  /** Kleur voor het beeld, #RRGGBB. */
  hex: string
  glans?: 'mat' | 'zijdeglans' | 'hoogglans' | null
}

export type Ontwerp = {
  versie: 1
  naam: string
  /** Vrije hoogte van de ruimte. */
  plafond: number
  diepte: number
  plint: { hoogte: number; terug: number }
  /** Ruimte tussen kast en plafond die de meubelmaker afwerkt met een passtrook. 0 = kast blijft vrij van het plafond. */
  passtrook: number
  /**
   * 'wand': één been tegen een muur, beide uiteinden vrij.
   * 'nis': één been tussen twee muren.
   * 'hoek': twee benen die in een binnenhoek samenkomen. Been 1 loopt door tot in de hoek.
   */
  opstelling: 'wand' | 'nis' | 'hoek'
  /** Alleen bij 'hoek': staat been 1 links als je naar de hoek kijkt? */
  eersteBeenLinks?: boolean | null
  benen: Been[]
  afwerking: Afwerking
  /** Binnenkant van de kast: wit, of dezelfde afwerking als buiten. Open vakken zijn altijd in de afwerking. */
  binnen: 'wit' | 'zelfde'
  greep: 'geen' | 'staaf' | 'knop'
  /** Korte notities van de AI over keuzes, bv. 'kleur afgeleid van foto 1'. */
  notities?: string[] | null
  /**
   * 'gemeten': maten uit een technische tekening of door de koper nauwkeurig gemeten.
   * 'indicatief': geschat (foto, ongeveer-maten). Het timmerbedrijf meet dan in vóór productie.
   */
  maatstatus?: 'gemeten' | 'indicatief' | null
  /** Waar de maten vandaan komen, in gewone taal: 'verkooptekening', 'zelf gemeten', 'geschat uit foto met A4'. */
  maatbron?: string | null
}

/** JSON-schema voor de tool van de AI. Bewust ruim: het rekenmodel doet de echte controle. */
const zoneSchema = {
  type: 'object',
  properties: {
    hoogte: { type: 'number', description: 'Hoogte van de zone in cm.' },
    inhoud: { type: 'string', enum: ['deuren', 'open', 'lades', 'dicht', 'leeg'] },
    deuren: { type: ['integer', 'null'], enum: [1, 2, null] },
    lades: { type: ['integer', 'null'] },
    planken: { type: ['integer', 'null'] },
    tussenschot: { type: ['boolean', 'null'] },
    vakken: {
      type: ['array', 'null'],
      items: {
        type: 'object',
        properties: {
          planken: { type: 'integer' },
          vrijOnder: { type: ['number', 'null'] },
          functie: { type: ['string', 'null'] },
        },
        required: ['planken'],
      },
    },
    functie: { type: ['string', 'null'] },
  },
  required: ['hoogte', 'inhoud'],
}

export const ONTWERP_SCHEMA = {
  type: 'object',
  properties: {
    versie: { type: 'integer', enum: [1] },
    naam: { type: 'string' },
    plafond: { type: 'number' },
    diepte: { type: 'number' },
    plint: { type: 'object', properties: { hoogte: { type: 'number' }, terug: { type: 'number' } }, required: ['hoogte', 'terug'] },
    passtrook: { type: 'number' },
    opstelling: { type: 'string', enum: ['wand', 'nis', 'hoek'] },
    eersteBeenLinks: { type: ['boolean', 'null'] },
    benen: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          muur: { type: 'string' },
          muurlengte: { type: ['number', 'null'] },
          segmenten: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                breedte: { type: 'number' },
                vorm: { type: 'string', enum: ['recht', 'rond'] },
                zones: { type: 'array', items: zoneSchema },
              },
              required: ['breedte', 'vorm', 'zones'],
            },
          },
        },
        required: ['muur', 'segmenten'],
      },
    },
    afwerking: {
      type: 'object',
      properties: {
        soort: { type: 'string', enum: ['lak', 'hout', 'decor'] },
        naam: { type: 'string' },
        code: { type: ['string', 'null'] },
        hex: { type: 'string', description: '#RRGGBB' },
        glans: { type: ['string', 'null'], enum: ['mat', 'zijdeglans', 'hoogglans', null] },
      },
      required: ['soort', 'naam', 'hex'],
    },
    binnen: { type: 'string', enum: ['wit', 'zelfde'] },
    greep: { type: 'string', enum: ['geen', 'staaf', 'knop'] },
    notities: { type: ['array', 'null'], items: { type: 'string' } },
    maatstatus: { type: ['string', 'null'], enum: ['gemeten', 'indicatief', null] },
    maatbron: { type: ['string', 'null'] },
  },
  required: ['versie', 'naam', 'plafond', 'diepte', 'plint', 'passtrook', 'opstelling', 'benen', 'afwerking', 'binnen', 'greep'],
} as const

/** Daniels hoekkast (Rosmalen, hoek C) in deze taal: voorbeeld voor de AI en testgeval voor het rekenmodel. */
export const VOORBEELD_HOEKKAST: Ontwerp = {
  versie: 1,
  naam: 'Hoekkast woonkamer',
  plafond: 260,
  diepte: 40,
  plint: { hoogte: 8, terug: 4 },
  passtrook: 2,
  opstelling: 'hoek',
  eersteBeenLinks: true,
  benen: [
    {
      muur: 'lange muur', muurlengte: null,
      segmenten: [
        { breedte: 114, vorm: 'recht', zones: [
          { hoogte: 186, inhoud: 'deuren', deuren: 2, tussenschot: true,
            vakken: [{ planken: 1, vrijOnder: 148, functie: 'stofzuiger' }, { planken: 4 }] },
          { hoogte: 64, inhoud: 'deuren', deuren: 2, vakken: [{ planken: 0 }, { planken: 1 }] },
        ] },
        { breedte: 40, vorm: 'rond', zones: [
          { hoogte: 60, inhoud: 'dicht' },
          { hoogte: 126, inhoud: 'open', planken: 3 },
          { hoogte: 64, inhoud: 'dicht' },
        ] },
      ],
    },
    {
      muur: 'trapwand', muurlengte: 200,
      segmenten: [
        { breedte: 112, vorm: 'recht', zones: [
          { hoogte: 186, inhoud: 'deuren', deuren: 2, planken: 4 },
          { hoogte: 64, inhoud: 'deuren', deuren: 2, planken: 1 },
        ] },
        { breedte: 40, vorm: 'rond', zones: [
          { hoogte: 60, inhoud: 'dicht' },
          { hoogte: 126, inhoud: 'open', planken: 3 },
          { hoogte: 64, inhoud: 'dicht' },
        ] },
      ],
    },
  ],
  afwerking: { soort: 'lak', naam: 'RAL 5014 duifblauw', code: 'RAL 5014', hex: '#6A84A0', glans: 'mat' },
  binnen: 'wit',
  greep: 'staaf',
  notities: ['Kleur afgeleid van de voorbeeldfoto: mat duifblauw.', 'Stofzuiger in het hoekvak; daar zit de dode hoek toch al.'],
  maatstatus: 'gemeten',
  maatbron: 'verkooptekening, schaal 1:50',
}
