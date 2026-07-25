# Prijsmodel woonwinkels & merken — feed-plaatsing

Status: voorstel, klaar voor besluit. Laatst bijgewerkt: 25 juli 2026.

## Het probleem

Een bankstel is €2.500, een schroevendraaierset €25. Eén prijs voor
feed-plaatsing is dus óf onbetaalbaar voor de gereedschapswinkel, óf bijna gratis
voor de keukenzaak. En per winkel onderhandelen is niet uitvoerbaar: dat kost
gesprekken die je niet hebt bij honderden winkels.

Daarnaast staat vast (Daniels constatering, 25 juli): **een winkel meldt nooit of
er iets verkocht is, en attributie inbouwen is voor een kleine webshop de moeite
niet.** Elk model dat op medewerking van de winkel leunt, valt daarmee af —
inclusief commissie per verkoop en pixels.

## Het principe

**De feed bepaalt de prijs.** Bij het koppelen van de productfeed berekent Bylder
de **mediane productprijs** en plaatst de winkel automatisch in een staffel. Geen
onderhandeling, geen categorie-discussie, en de winkel kan het niet omlaag praten
zonder zijn eigen prijzen te verlagen.

Waarom mediaan en niet gemiddelde: één designbank van €12.000 in een assortiment
lampen mag de staffel niet omhoog trekken. De mediaan is robuust tegen
uitschieters aan beide kanten.

## Twee producten, niet meer

### 1. Vermelding + kortingsvoucher — ongewijzigd
€79 per jaar lokaal, €995 per jaar landelijk. Wordt niet automatisch verlengd.
Dit is de instap: je staat in de gids, je voucher is claimbaar door bewoners.

### 2. Feed-plaatsing — gestaffeld op mediane productprijs
Je producten staan tussen de keuzes van een koper in de ontwerptools, gematcht op
ruimte, stijl, categorie en budget. Landelijk, want producten worden verzonden.

| Staffel | Mediane productprijs in de feed | Typisch assortiment | Voorstel per jaar |
|---|---|---|---|
| A | tot €150 | gereedschap, verf, accessoires, klein ijzerwaren | €149 |
| B | €150 – €750 | verlichting, raamdecoratie, sanitair-onderdelen, kleine meubels | €395 |
| C | €750 – €2.500 | vloeren, meubels, boxsprings, badkamermeubels | €795 |
| D | boven €2.500 | keukens, complete badkamers, maatwerk-interieur | €1.495 |

**Onderbouwing van de bedragen.** Bij meubels en interieur ligt de brutomarge
grofweg tussen 40 en 50%. Op een bankstel van €2.000 is dat €800 tot €1.000
marge. Staffel C betaalt zich dus terug bij ongeveer één extra verkoop per jaar.
Ter vergelijking: bij Google Ads in deze categorie kost één verkoop al snel €100
tot €300 aan advertentiekosten, en dat is een terugkerende kost per verkoop — geen
jaarbedrag. Wie in staffel D zit verkoopt keukens; daar is €1.495 minder dan 10%
van de marge op één keuken.

**Automatische herindeling.** De staffel wordt bij elke feed-verversing opnieuw
berekend. Verschuift een winkel omhoog, dan geldt dat pas bij de volgende
verlenging — nooit met terugwerkende kracht. Dat voorkomt verrassingen en
discussies.

**Geen automatische verlenging**, net als bij de vermelding.

## Wat we bewust NIET doen

- **Geen commissie per verkoop.** Niet meetbaar zonder medewerking die niet komt.
- **Geen pixel of platformkoppeling.** Te veel drempel voor een kleine webshop, en
  het levert alleen online verkopen op terwijl showroomverkoop het grootste deel
  is.
- **Geen prijs per klik.** Dan concurreer je met Google op hun eigen model en
  verkoop je aandacht in plaats van resultaat.
- **Geen prijs per winkel na onderhandeling.** Niet uitvoerbaar op schaal.

## Fase 2: betalen per activatie (later, met bewijs)

`voucher_activations` legt al per gebruiker vast welke voucher van welk merk
wanneer is geactiveerd. Dat is een sterk intentiesignaal — iemand kiest actief
jouw merk uit 61 opties, ná het kopen van een woning — en het is volledig aan
onze kant meetbaar. Geen medewerking nodig, niet te betwisten.

**Maar niet nu factureren.** Eerst een half jaar meten wat een activatie in de
praktijk waard is per staffel. De data staat er al, dus je kunt achteraf precies
zien wat het opgeleverd zou hebben voordat je het in rekening brengt. Als het
loopt: vast bedrag per activatie, gestaffeld op de prijs van het geactiveerde
product, afgeboekt van een prepaid saldo (geen factuur per transactie, vooraf
betaald, harde bovengrens).

Wat daarvoor nog moet: **unieke codes per gebruiker** in plaats van één gedeelde
code per voucher. Nu is de code gedeeld, dus een activatie is niet te herleiden
tot een specifieke koper bij de winkel.

## Uitvoering

**Wat er al staat**
- `producten`-tabel met categorie, ruimte- en stijl-tags, `prijs_cent`,
  `affiliate_url`, actief-vlag
- `voucher_activations` met user, merk, code en tijdstip
- Merchant-portal met login, onboarding, vouchers en showroomsale
- De agent-tool `zoek_producten` die producten al aanbeveelt met disclosure

**Wat gebouwd moet worden — in deze volgorde**
1. **Feed-upload via de merchant-chat.** De chat vraagt om de Shopping-feed of een
   productbestand; upload landt in een importwachtrij. Er is nu geen chat in de
   merchant-omgeving, dus die komt erbij.
2. **Import + normalisatie.** Feed lezen, per product mappen op het bestaande
   `producten`-schema, AI tagt ruimte, stijl en categorie.
3. **Staffelberekening.** Mediane `prijs_cent` over de actieve producten van die
   merchant → staffel A/B/C/D, zichtbaar in het merchant-dashboard met de uitleg
   erbij ("uw mediaan is €1.850, dat is staffel C").
4. **Facturatie van het jaarbedrag** + verlengherinnering (geen automatische
   verlenging, dus een actieve herinnering is nodig — geldt ook voor de €79/€995).
5. **Merchant-dashboard**: welke producten staan live, hoe vaak zijn ze getoond,
   hoeveel activaties. Transparantie voorkomt discussies.
6. **Fase 2** (later): unieke voucher-codes per gebruiker, prepaid saldo,
   facturatie per activatie.

## Wat er op de publieke pagina komt

De pagina /deelnemer-worden/woonwinkels-merken/ wordt herbouwd rond het argument
dat Daniel zelf formuleerde: **kleine lokale webshops laten winnen van hun grote
concurrenten.** Een lokale winkel kan Bol of IKEA niet overbieden op Google Ads;
op Bylder hoeft dat niet, want plaatsing gaat op geschiktheid en niet op budget.

Prijsblok wordt drie regels:
1. €79 per jaar lokaal (€995 landelijk) — vermelding en kortingsvoucher
2. Feed-plaatsing vanaf €149 per jaar, gestaffeld op je eigen assortiment
3. Geen commissie, geen kosten per klik, geen automatische verlenging

Die derde regel is de sterkste claim die je hebt en hij is volledig waar.
