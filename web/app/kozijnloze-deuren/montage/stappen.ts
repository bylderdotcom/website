// De montage van een kozijnloze deur in acht stappen (11-11-2026), voor de animatie en de tekst op /kozijnloze-deuren/montage/.
//
// LET OP: dit is de volgorde in grote lijnen, op basis van wat Classic Next en de leveranciers van het systeem tot nu toe
// aanleverden (kozijn AGS TST50 vóór het stucwerk, verdekte scharnieren DX-38 die in drie richtingen verstelbaar zijn,
// magneetslot, gegrond of afgelakt deurblad) en de montagetijd van Daniel (ongeveer 2,5 uur per deur). Bewust geen maten,
// schroefafstanden of producten voor bevestiging: die komen uit de montagehandleiding van Classic Next zodra die er is.
// Het is een uitleg voor de koper, geen werkinstructie voor de monteur.

export type Stap = { kop: string; wie: string; tekst: string }

export const STAPPEN: Stap[] = [
  { kop: 'De sparing controleren', wie: 'Timmerman',
    tekst: 'In de ruwe wand zit een opening voor de deur. Die moet de juiste maat hebben en recht zijn: de maten staan in de tekening van het kozijn. Een scheve sparing is nu nog makkelijk op te lossen, na het stucwerk niet meer.' },
  { kop: 'Het kozijn plaatsen', wie: 'Timmerman',
    tekst: 'Het aluminium kozijn gaat in de sparing. De monteur stelt het waterpas en te lood, en meet de diagonalen: zijn die gelijk, dan staat het kozijn haaks. Dit bepaalt of de deur straks met een gelijke kier sluit.' },
  { kop: 'Het kozijn vastzetten', wie: 'Timmerman',
    tekst: 'Het kozijn wordt vast in de wand gezet, zonder dat het verschuift of krom trekt. De zichtkant blijft afgeplakt, zodat er geen stuc op komt.' },
  { kop: 'Stucen tot tegen het kozijn', wie: 'Stukadoor',
    tekst: 'De stukadoor werkt de wand af tot tegen de rand van het kozijn. Daarna zie je geen kozijn meer, alleen een strakke rand waar straks de deur in valt. Hier hangt het resultaat het meest van af.' },
  { kop: 'Het deurblad hangen', wie: 'Timmerman',
    tekst: 'Als het stucwerk droog is, gaat het deurblad op de verdekte scharnieren: drie bij een gewone deur, vier bij een hoge of plafondhoge deur. Het kozijn is daarvoor al voorbereid.' },
  { kop: 'De deur afstellen', wie: 'Timmerman',
    tekst: 'De scharnieren zijn in drie richtingen verstelbaar: in hoogte, zijwaarts en in diepte. De monteur stelt de deur zo af dat de kier rondom gelijk is en het blad vlak ligt met de wand.' },
  { kop: 'Slot en kruk', wie: 'Timmerman',
    tekst: 'Het magneetslot en de sluitplaat worden afgesteld, zodat de deur zacht dichtvalt en niet klappert. Daarna komt de kruk erop.' },
  { kop: 'Schilderen', wie: 'Schilder of jijzelf',
    tekst: 'Een gegronde deur schilder je mee met de wand, in dezelfde kleur. Dan wordt deur en wand één vlak. Een afgelakte deur is meteen klaar.' },
]
