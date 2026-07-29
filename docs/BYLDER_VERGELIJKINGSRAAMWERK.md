# Bylder Vergelijkingsraamwerk

Intern document. Legt vast hoe Bylder over merken en producten schrijft. Geldt voor elke
vergelijkende of merkgenoemde pagina, niet alleen voor slaapkamer.

Opgesteld 29 juli 2026, afgeleid uit het slaapkamer-hubplan. Dat plan verwees naar §4, §5 en §6
van dit document terwijl het nog niet bestond — dit is de eerste vastlegging. **Controleer of
dit klopt met wat je bedoelde voordat er content op wordt gebouwd.**

---

## §1 Waarom dit bestaat

Bylder verkoopt niets. Dat is geen bescheidenheid maar het hele bezit: op het moment dat een
lezer vermoedt dat een aanbeveling gekocht is, is elke andere pagina op de site ook verdacht. Een
vergelijking die niet klopt kost je niet die ene pagina, maar het vertrouwen dat de rest draagt.

Deze regels zijn er niet om juridisch veilig te zijn. Ze zijn er omdat een vergelijking die een
concurrent in één alinea kan weerleggen, waardeloos is.

## §2 De scheiding van rollen

Twee soorten pagina's, en ze mogen nooit vermengen.

**Redactioneel.** Legt een categorie uit. Rangschikt geen merken. Er stroomt geen geld. Hier mag
Bylder neutraliteit claimen omdat het waar is.

**Deelnemerspagina's.** Aanbiedingen, vouchers, showroomafspraken. Zichtbaar commercieel — een
merk met een aanbieding betaalt om er te staan, en dat begrijpt iedereen. Hier claim je geen
neutraliteit, dus valt er niets te verzwijgen.

Een redactionele pagina mag naar een deelnemerspagina linken, maar nooit met een aanbeveling.
"Merken die via Bylder een aanbieding hebben" is een feit; "wij raden X aan" is dat niet.

**Nooit:** een merk laten winnen in een vergelijking waar Bylder financieel belang bij heeft.
Zolang dat belang bestaat hoort dat merk niet in die vergelijking.

## §3 De vier vergelijkingsassen

Per categorie vóór de research vastleggen, daarna niet meer wijzigen. Assen achteraf kiezen is
hoe je onbewust naar een gewenste uitkomst toeschrijft.

Voor slaapkamer: **materiaal, ambacht, tijd, design.**

Elke as krijgt dezelfde behandeling bij elk merk. Wint merk A op materiaal, dan staat er ook wat
merk A op tijd verliest.

## §4 Het segmentblok

Elke vergelijking eindigt met profielen: voor wie is welke keuze de juiste.

**Harde eis: in minimaal één profiel komt het goedkoopste of het niet-partnermerk als beste uit
de bus.** Niet als troostprijs ("ook prima als u minder te besteden heeft") maar als het juiste
antwoord voor dat profiel.

Lukt dat niet, dan klopt de vergelijking niet. Er bestaat geen categorie waarin één merk voor
iedereen het beste is; komt die conclusie er toch uit, dan zijn de assen verkeerd gekozen of is
er naar een uitkomst toegeschreven.

## §5 Redactionele regels

**Beschrijf mechanisme, geen belofte.** "Paardenhaar heeft luchtkanalen die vocht afvoeren" is
controleerbaar. "Paardenhaar zorgt voor een betere nachtrust" is een claim waarvoor het
onafhankelijke bewijs dun is. Waar het bewijs dun is, zeg je dat.

**Elke sterkte krijgt zijn nadeel.** Natuurvezel wint op vochtafvoer en einde levensduur, en
verliest op precisie, inklinken, onderhoud en gewicht. Een pagina die alleen de voordelen noemt
is reclame, ook als alles wat er staat waar is.

**Frame een tegenstander op zijn sterkste punt.** Als een merk een test wint doordat het product
naar het testprotocol is ontworpen, noem je dat knappe engineering — niet een trucje. De lezer
trekt zelf de conclusie dat de test het probleem is. Dat is overtuigender én juridisch
onaantastbaar.

**Neem geen insinuaties over.** "Gekochte overwinning" en soortgelijke beweringen uit
affiliate-bronnen gaan er niet in, hoe vaak ze ook online staan. Wel: feitelijk beschrijven hoe
een award tot stand komt — wie betaalt, wie stemt, wat er getest wordt.

**Certificaten zijn een ondergrens, geen kwaliteitsoordeel.** CertiPUR en Oeko-Tex zeggen iets
over schadelijke stoffen, niets over levensduur of recyclebaarheid. Zo benoemen.

**Cijfers met bron en datum.** Testuitslagen veranderen. Elke pagina draagt `lastReviewed` en
`sources[]`; een cijfer zonder herkomst gaat er niet in.

**Fabrikantclaims zijn fabrikantclaims.** "45 dagen handwerk" is wat het merk zegt. Verifiëren
bij de bron vóór publicatie, en als dat niet lukt: zo formuleren dat de herkomst zichtbaar is.

## §6 Vorm

**Vergelijkingen renderen uit data, niet uit losse tekst.** Per categorie één YAML/JSON-bron met
de assen en de waarden per merk; de pagina rendert daaruit. Zo kan één merk niet stilletjes
gunstiger beschreven worden dan een ander, en is een correctie één plek.

**Schema:** `FAQPage` waar er echte vragen staan. **Geen `Product` of `Review`** op
vergelijkingspagina's — Bylder is geen verkoper en geen recensent, en `aggregateRating` van een
ander platform mag sowieso niet als eigen rich-result.

**Disclosure boven de fold** op elke pagina waar een partnermerk genoemd wordt. Formulering
alleen gebruiken zolang hij waar is; verandert de situatie, dan verandert de zin mee.

## §7 Wat dit raamwerk niet oplost

Het maakt een vergelijking eerlijk, niet vindbaar. En het beschermt niet tegen de fout die op
29 juli drie keer achter elkaar gemaakt werd: content aanpassen en vergeten dat metadata en
structured data hetzelfde moeten zeggen. Daar is de claim-bewaker voor.
