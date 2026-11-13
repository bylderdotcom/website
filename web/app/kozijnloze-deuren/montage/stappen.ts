// De montage van een kozijnloze deur in acht stappen (11-11-2026), voor de animatie en de tekst op /kozijnloze-deuren/montage/.
//
// LET OP: dit is de volgorde in grote lijnen, op basis van wat Classic Next en de leveranciers van het systeem tot nu toe
// aanleverden (kozijn AGS TST50 vóór het stucwerk, verdekte scharnieren DX-38 die in drie richtingen verstelbaar zijn,
// magneetslot, gegrond of afgelakt deurblad) en de montagetijd van Daniel (ongeveer 2,5 uur per deur). Bewust geen maten,
// schroefafstanden of producten voor bevestiging: die komen uit de montagehandleiding van Classic Next zodra die er is.
// Het is een uitleg voor de koper, geen werkinstructie voor de monteur.

export type Stap = { kop: string; wie: string; tekst: string }

// Tekst nagekeken en aangevuld door Thijs van Classic Next (13-11-2026): het kozijn kan op de smeervloer of op een
// afgewerkte vloer, de krukhoogte is 1050 mm vanaf de afgewerkte vloer, het kozijn heeft al krozingen voor de scharnieren
// en een voorgefreesde uitsparing voor de sluitplaat.
export const STAPPEN: Stap[] = [
  { kop: 'De sparing controleren', wie: 'Timmerman',
    tekst: 'In de ruwe wand zit een opening voor het kozijn. Het kozijn kan op de smeervloer of op een afgewerkte vloer worden geplaatst. Op de smeervloer houdt de timmerman rekening met de krukhoogte: 1050 mm, gemeten vanaf de afgewerkte vloer.' },
  { kop: 'Het kozijn plaatsen', wie: 'Timmerman',
    tekst: 'Het aluminium kozijn gaat in de sparing. De monteur stelt het waterpas en te lood, en meet de diagonalen: zijn die gelijk, dan staat het kozijn haaks. Dat bepaalt of de kier rondom het deurblad straks overal even breed is.' },
  { kop: 'Het kozijn vastzetten', wie: 'Timmerman',
    tekst: 'Het kozijn wordt vast in de wand gezet, zonder dat het verschuift of krom trekt. De zichtkant blijft afgeplakt, zodat er geen stuc op komt.' },
  { kop: 'Stucen tot tegen het kozijn', wie: 'Stukadoor',
    tekst: 'De stukadoor werkt de wand strak af tot aan de rand van het kozijn. Daarna zie je geen kozijn meer: wand en kozijn lopen in elkaar over. Hier hangt het resultaat het meest van af.' },
  { kop: 'Het deurblad hangen', wie: 'Timmerman',
    tekst: 'Als het stucwerk droog is, gaat het deurblad op de verdekte scharnieren: drie bij een gewone deur, vier bij een hoge of plafondhoge deur. Het kozijn heeft daarvoor al de uitsparingen voor de scharnieren.' },
  { kop: 'De deur afstellen', wie: 'Timmerman',
    tekst: 'De scharnieren zijn in drie richtingen verstelbaar: in hoogte, breedte en diepte. De monteur stelt het deurblad zo af dat de kier rondom gelijk is en de deur vlak ligt met de wand.' },
  { kop: 'Slot en kruk', wie: 'Timmerman',
    tekst: 'Het kozijn heeft een voorgefreesde uitsparing voor de sluitplaat, dus die is snel gemonteerd. Daarna komt de kruk erop en is de deur af.' },
  { kop: 'Schilderen', wie: 'Schilder of jijzelf',
    tekst: 'Het deurblad wordt gegrond of afgelakt geleverd. Een gegronde deur schilder je na de montage in de kleur die je wilt, bijvoorbeeld mee met de wand. Een afgelakte deur is meteen klaar.' },
]
