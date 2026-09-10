// Beslag: deurkrukken, magneetsloten en het verdekte scharnier.
//
// Afgeleid uit het fotopakket van Classic Next (3 september 2026). De
// bestandsnamen waren Pools — klamka is deurkruk, czarny zwart, zloty goud — en
// zijn hier vertaald naar wat een Nederlandse koper leest.
//
// Elke variant draagt een schermkleur naast zijn foto. De foto is de waarheid;
// die kleur is alleen voor de weergave in 3D, waar de kruk een vereenvoudigde
// vorm is en geen ingescand model. Dat staat ook bij de configurator.

export type BeslagVariant = { afwerking: string; hex: string; beeld: string }
export type KrukModel = { id: string; naam: string; merk: string; varianten: BeslagVariant[] }

export const KRUKKEN: KrukModel[] = [
  { id: 'carlina', naam: 'Carlina', merk: 'Aprile',
    varianten: [{ afwerking: 'Chroom gepolijst', hex: '#C9CDD1', beeld: 'kruk-carlina-chroom-gepolijst' }, { afwerking: 'Chroom satijn', hex: '#AFB4B8', beeld: 'kruk-carlina-chroom-satijn' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-carlina-zwart' }, { afwerking: 'Grafiet', hex: '#54585B', beeld: 'kruk-carlina-grafiet' }] },
  { id: 'fragola', naam: 'Fragola', merk: 'Aprille',
    varianten: [{ afwerking: 'Chroom gepolijst', hex: '#C9CDD1', beeld: 'kruk-fragola-chroom-gepolijst' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-fragola-zwart' }, { afwerking: 'Goud', hex: '#C9A24B', beeld: 'kruk-fragola-goud' }] },
  { id: 'guava', naam: 'Guava', merk: 'Aprile',
    varianten: [{ afwerking: 'Grafiet', hex: '#54585B', beeld: 'kruk-guava-grafiet' }] },
  { id: 'lima', naam: 'Lima', merk: 'Stile',
    varianten: [{ afwerking: 'Chroom satijn', hex: '#AFB4B8', beeld: 'kruk-lima-chroom-satijn' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-lima-zwart' }, { afwerking: 'Nikkel', hex: '#B9B4A8', beeld: 'kruk-lima-nikkel' }, { afwerking: 'Titanium', hex: '#8A8C8E', beeld: 'kruk-lima-titanium' }] },
  { id: 'molinia', naam: 'Molinia', merk: 'Aprille',
    varianten: [{ afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-molinia-zwart' }, { afwerking: 'Goud', hex: '#C9A24B', beeld: 'kruk-molinia-goud' }, { afwerking: 'Goud mat', hex: '#B79A63', beeld: 'kruk-molinia-goud-mat' }] },
  { id: 'oma-q-slim', naam: 'Oma Q slim', merk: 'Stile',
    varianten: [{ afwerking: 'Chroom gepolijst', hex: '#C9CDD1', beeld: 'kruk-oma-q-slim-chroom-gepolijst' }, { afwerking: 'Chroom satijn', hex: '#AFB4B8', beeld: 'kruk-oma-q-slim-chroom-satijn' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-oma-q-slim-zwart' }, { afwerking: 'Nikkel', hex: '#B9B4A8', beeld: 'kruk-oma-q-slim-nikkel' }, { afwerking: 'Titanium', hex: '#8A8C8E', beeld: 'kruk-oma-q-slim-titanium' }] },
  { id: 'oval-1741', naam: 'Oval 1741', merk: 'Sterk',
    varianten: [{ afwerking: 'Basalt', hex: '#4A4C4E', beeld: 'kruk-oval-1741-basalt' }, { afwerking: 'Goud mat', hex: '#B79A63', beeld: 'kruk-oval-1741-goud-mat' }, { afwerking: 'Koper', hex: '#A9704B', beeld: 'kruk-oval-1741-koper' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-oval-1741-zwart' }] },
  { id: 'oval-1743', naam: 'Oval 1743', merk: 'Sterk',
    varianten: [{ afwerking: 'Basalt', hex: '#4A4C4E', beeld: 'kruk-oval-1743-basalt' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-oval-1743-zwart' }, { afwerking: 'Goud mat', hex: '#B79A63', beeld: 'kruk-oval-1743-goud-mat' }, { afwerking: 'Koper', hex: '#A9704B', beeld: 'kruk-oval-1743-koper' }] },
  { id: 'oval-1750', naam: 'Oval 1750', merk: 'Sterk',
    varianten: [{ afwerking: 'RVS', hex: '#B4B8BB', beeld: 'kruk-oval-1750-rvs' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-oval-1750-zwart' }, { afwerking: 'Goud', hex: '#C9A24B', beeld: 'kruk-oval-1750-goud' }, { afwerking: 'Wit', hex: '#E8E6E1', beeld: 'kruk-oval-1750-wit' }] },
  { id: 'sorella', naam: 'Sorella', merk: 'Aprile',
    varianten: [{ afwerking: 'Zwart', hex: '#1F2123', beeld: 'kruk-sorella-zwart' }, { afwerking: 'Grafiet', hex: '#54585B', beeld: 'kruk-sorella-grafiet' }, { afwerking: 'Nikkel', hex: '#B9B4A8', beeld: 'kruk-sorella-nikkel' }, { afwerking: 'Goud mat', hex: '#B79A63', beeld: 'kruk-sorella-goud-mat' }] },
  { id: 'viola', naam: 'Viola', merk: 'Aprile',
    varianten: [{ afwerking: 'Chroom gepolijst', hex: '#C9CDD1', beeld: 'kruk-viola-chroom-gepolijst' }, { afwerking: 'Chroom geborsteld', hex: '#A9AEB2', beeld: 'kruk-viola-chroom-geborsteld' }, { afwerking: 'Grafiet', hex: '#54585B', beeld: 'kruk-viola-grafiet' }, { afwerking: 'Nikkel', hex: '#B9B4A8', beeld: 'kruk-viola-nikkel' }] },
]

export type SlotType = { id: string; naam: string; uitleg: string; varianten: BeslagVariant[] }

export const SLOTEN: SlotType[] = [
  { id: 'loop', naam: 'Loop',
    uitleg: 'Zonder slot: de deur valt dicht en gaat weer open. Voor kamers waar je niet op slot hoeft.',
    varianten: [{ afwerking: 'RVS', hex: '#B4B8BB', beeld: 'slot-loop-rvs' }, { afwerking: 'Titanium', hex: '#8A8C8E', beeld: 'slot-loop-titanium' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'slot-loop-zwart' }, { afwerking: 'Brons', hex: '#8A6A44', beeld: 'slot-loop-bronze' }] },
  { id: 'dag-nacht', naam: 'Dag- en nachtslot',
    uitleg: 'Met sleutel af te sluiten. Voor een werkkamer, berging of slaapkamer.',
    varianten: [{ afwerking: 'RVS', hex: '#B4B8BB', beeld: 'slot-dag-nacht-rvs' }, { afwerking: 'Titanium', hex: '#8A8C8E', beeld: 'slot-dag-nacht-titanium' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'slot-dag-nacht-zwart' }] },
  { id: 'vrij-bezet', naam: 'Vrij/bezet',
    uitleg: 'Met een draaiknop en een rood-wit venster aan de buitenzijde. Verplicht gevoel bij een badkamer of toilet.',
    varianten: [{ afwerking: 'RVS', hex: '#B4B8BB', beeld: 'slot-vrij-bezet-rvs' }, { afwerking: 'Titanium', hex: '#8A8C8E', beeld: 'slot-vrij-bezet-titanium' }, { afwerking: 'Zwart', hex: '#1F2123', beeld: 'slot-vrij-bezet-zwart' }] },
]

// Het DX38 is het verdekte scharnier dat bij dit systeem hoort: van buiten
// onzichtbaar, in drie richtingen verstelbaar.
export const SCHARNIEREN: BeslagVariant[] = [{ afwerking: 'Alu-look', hex: '#B7BABD', beeld: 'scharnier-alu' }, { afwerking: 'Zwart', hex: '#1B1C1D', beeld: 'scharnier-zwart' }]
