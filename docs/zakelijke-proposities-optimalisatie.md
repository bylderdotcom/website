# Zakelijke proposities — optimalisatieplan

Status: plan, klaar voor besluit. Laatst bijgewerkt: 25 juli 2026.
Volgorde: eerst dit plan vaststellen, daarna content aanpassen, daarna functies bouwen.

---

## 1. Automatische verlenging en incasso — kan Pay.nl dit?

**Ja.** Pay.nl ondersteunt terugkerende SEPA-incasso via de API-call
`Transaction:createDirectDebit`, en daarnaast handmatig via het Admin Panel of met
een batchbestand. Er zijn geen extra kosten voor recurring SEPA of recurring
creditcard.

**Drie dingen om te regelen vóór we dit bouwen:**

1. **Pakket.** Recurring incasso is beschikbaar vanaf het Professional-pakket.
   Onze huidige koppeling doet alleen eenmalige transacties
   (`rest.pay.nl/v2/transactions`, velden amount/customer/description/reference/
   returnUrl/exchangeUrl). Check of ons pakket dit al dekt.
2. **Terugboekrisico.** Bij SEPA-incasso mag de betaler tot **56 kalenderdagen**
   terugboeken, met of zonder handtekening. Bij een jaarbedrag van €149 tot
   €1.495 is dat een reëel risico. Mitigatie: incasseer op een aankondigingstermijn
   (kondig 14 dagen vooraf per e-mail aan wat en wanneer wordt afgeschreven), en
   houd de dienst pas actief zodra de incasso 56 dagen oud is óf werk met
   iDEAL-verlenging voor nieuwe deelnemers en incasso pas vanaf jaar twee.
   Voor B2B bestaat ook SEPA B2B-incasso zonder terugboekrecht, maar dat vereist
   registratie van de machtiging bij de bank van de deelnemer — meer drempel bij
   aanmelding. Advies: begin met gewone SEPA-incasso plus aankondiging.
3. **Transparantie.** Automatische verlenging bij zakelijke contracten mag (de
   beperkingen op stilzwijgende verlenging gelden voor consumenten), maar het moet
   glashelder op de pagina en in de bevestigingsmail staan: welk bedrag, welke
   datum, hoe opzeggen. Dat is geen juridische verplichting-met-tegenzin maar een
   verkoopargument: wie het netjes regelt, wordt vertrouwd.

**Gevolg voor de propositie:** "wordt niet automatisch verlengd" verdwijnt van de
pagina's. In plaats daarvan: *"jaarlijks automatisch verlengd, altijd per jaar
opzegbaar, je krijgt 14 dagen vóór de afschrijving bericht."*

---

## 2. Het nieuwe onderscheid: D2C versus merk zonder eigen verkoop

Dit is de belangrijkste wijziging in de segmentatie. De huidige pagina
`/deelnemer-worden/woonwinkels-merken/` propt twee volstrekt verschillende kopers
in één tekst, en daarom is die tekst vaag.

### Waarom het onderscheid essentieel is

| | **D2C — winkel/webshop** | **Merk zonder eigen verkoop** |
|---|---|---|
| Wil | verkopen | dat de klant zijn merk vráágt bij de dealer |
| Kan leveren | productfeed, voorraad, checkout | productdata, beeld, dealernetwerk |
| Koopt bij ons | feed-plaatsing + voucher | plaatsing in de ontwerptools + merkpagina + dealerlocator |
| Verwacht attributie | zou het willen, kan het niet | **verwacht het niet** — dit is merkadvertising |
| Budget komt uit | winkelmarge (krap) | marketingbudget (ruimer) |

**Het merk zonder eigen verkoop is de makkelijkste klant die we hebben.** Ze
verwachten geen verkoopattributie, want die bestaat in hun hele kanaal niet — ze
verkopen via dealers en meten op merkvoorkeur. Precies het probleem waar we bij
D2C tegenaan liepen (winkel meldt niets, attributie is de moeite niet) bestaat
hier niet, omdat niemand het vraagt.

### Wat we ze verkopen: het specificatiemoment

Bylders ontwerptools zijn een **specificatiemoment**. Als de agent een tuin
ontwerpt en daarin een specifieke schutting van merk X voorstelt, loopt de koper
daarna naar een dealer en vraagt om merk X. Dat is exact hoe merken in de bouw en
interieur al decennia adverteren: zorgen dat je wordt voorgeschreven.

Concreet aanbod aan zo'n merk:
- **Materiaal-/productplaatsing in de ontwerptools** — jouw schutting, vloer,
  kozijn of tegel als optie in het ontwerp van de koper
- **Eigen merkpagina** op bylder.com met verhaal, specificaties en beeld
- **Dealerlocator**: de koper ziet in zijn ontwerp jouw product en daarna waar hij
  het in zijn eigen regio kan kopen

Die dealerlocator is een drievoudige winst: het merk betaalt, de lokale dealer
krijgt bezoek, en de koper krijgt een echt verkrijgbaar product. En het geeft ons
een tweede ingang bij de lokale retailer — die staat er dan al op.

### Prijs

Merkplaatsing is geen staffel op mediane productprijs (een merk levert vaak één
productlijn). Dit is een jaarcontract op categorie-exclusiviteit of -zichtbaarheid.
Voorstel: **vanaf €1.495 per jaar per categorie**, met een hoger bedrag voor
prominente of exclusieve plaatsing. Dit is een marketingbudget-gesprek, niet een
webshop-margegesprek — en dus per definitie een gesprek, geen zelfbedieningsprijs.

### Pagina-splitsing

`/deelnemer-worden/woonwinkels-merken/` splitst in:
- `/deelnemer-worden/woonwinkels/` — D2C, met de staffel uit
  `prijsmodel-woonwinkels-feed.md`
- `/deelnemer-worden/merken/` — merkzichtbaarheid en specificatie

De oude URL redirect naar de D2C-pagina (die houdt de meeste inkomende links) met
bovenaan een verwijzing naar de merken-pagina.

---

## 3. De onderbouwing hoort op de pagina

Nu staat de rekensom in interne documenten en de pagina zegt alleen wat het kost.
Dat is precies verkeerd om: **de prijs is niet het argument, de vergelijking is
het argument.**

Elke zakelijke landingspagina krijgt daarom een blok "Wat het je oplevert" met de
concrete rekensom voor dát segment. Voor woonwinkels bijvoorbeeld:

> Op een bankstel van €2.000 is je brutomarge grofweg €800 tot €1.000. Staffel C
> kost €795 per jaar — dat is terugverdiend bij ongeveer één extra verkoop.
> Ter vergelijking: één verkoop via Google Ads kost in deze categorie al snel
> €100 tot €300 aan advertentiekosten, en dat is een kost per verkoop, elke keer
> opnieuw. Bij ons is het een jaarbedrag.

Zelfde structuur per segment, met hun eigen cijfers:
- **Vakbedrijf** — €79 per jaar tegenover de kosten van één leadveiling-lead
- **Interieurbouw** — één maatwerkopdracht tegenover €79
- **Merk** — bereik op het specificatiemoment tegenover de kosten van
  vakbladadvertenties of beurzen
- **Ontwikkelaar** — €49 per woning tegenover de kosten van eigen
  kopersbegeleiding

### En het David-tegen-Goliath-argument, op elke relevante pagina

Dit is het sterkste dat we hebben en het staat nergens:

> Een lokale woonwinkel kan Bol, Coolblue of IKEA niet overbieden op Google Ads.
> Op Bylder hoeft dat niet. Plaatsing gaat op geschiktheid — ruimte, stijl,
> categorie, budget — niet op advertentiebudget. Wie het juiste product heeft voor
> deze woning, wint van wie het grootste budget heeft.

Dat is structureel waar en verifieerbaar, en het is de reden dat een kleine
partij hier iets kan wat elders onmogelijk is. Het hoort in de H1-omgeving van
de woonwinkel- en merken-pagina, niet in een FAQ.

---

## 4. Vaste architectuur voor elke zakelijke pagina

Nu verschilt elke pagina in opbouw en compleetheid (de een heeft vier koppen, de
ander een prijsblok zonder termijn). Eén vast skelet:

1. **H1 met het onderscheidende argument** — niet "sta waar de klant al is"
2. **"In het kort"-blok** — citeerbaar, met prijs en termijn erin (AEO/GEO)
3. **Wie de koper is** — met echte cijfers: 12.400 kopers, opleverkalender,
   gemiddeld €4.200 besparing
4. **Waarom dit kanaal anders is** — geschiktheid boven budget
5. **Wat het je oplevert** — de rekensom van §3
6. **Wat het kost** — bedrag, termijn, verlenging, opzegging. Geen dubbelzinnigheid
7. **Hoe je begint** — één primaire actie
8. **FAQ** — met de prijs correct, ook in de JSON-LD
9. **Slot-CTA**

Plus per pagina: Article- en FAQPage-schema, Offer-schema met de juiste prijs,
interne links naar de relevante clusters, en een bijgewerkt-datum.

---

## 5. Prijsoverzicht na dit plan

| Segment | Prijs | Termijn |
|---|---|---|
| Vakbedrijf / ZZP (lokaal) | €79 | per jaar, automatisch verlengd |
| Vakbedrijf / ZZP (landelijk) | €995 | per jaar, automatisch verlengd |
| Interieurbouw | €79 lokaal / €995 landelijk | per jaar, automatisch verlengd |
| Interieurontwerp & architecten | €79 lokaal / €995 landelijk | per jaar, automatisch verlengd |
| Woonwinkel D2C — vermelding + voucher | €79 lokaal / €995 landelijk | per jaar |
| Woonwinkel D2C — feed-plaatsing | €149 / €395 / €795 / €1.495 naar staffel | per jaar |
| Merk zonder eigen verkoop | vanaf €1.495 per categorie | per jaar, op gesprek |
| Ontwikkelaars & bouwers | vanaf €49 per woning | per project |
| Prefab-netwerk / -productie | €149 per gerealiseerde match | per match |
| Commercieel vastgoed | €299 per dossier | per dossier |

**Nog te bevestigen door Daniel:** kloppen €49 per woning, €149 per match en €299
per dossier nog? Die vier pagina's zijn bewust niet aangepast.

---

## 6. Functies die gebouwd moeten worden

In volgorde van afhankelijkheid.

**A. Betalen en verlengen (blokkeert al het andere)**
1. Pay.nl-pakket controleren op recurring incasso
2. Machtiging afgeven in de aanmeldflow (SEPA-mandaat vastleggen)
3. `Transaction:createDirectDebit` in `src/lib/paynl.ts`
4. Verlengcyclus: 14 dagen vooraf aankondigen, incasseren, mislukking opvangen
5. Opzegflow in het deelnemer-dashboard — zichtbaar, niet weggestopt

**B. Feed en staffel (D2C)**
6. Feed-upload via merchant-chat (die chat bestaat nog niet)
7. Import + AI-normalisatie naar het bestaande `producten`-schema
8. Mediaanberekening → staffel A–D, met uitleg in het dashboard
9. Dashboard: welke producten live, hoe vaak getoond, hoeveel activaties

**C. Merken zonder eigen verkoop**
10. Merkpagina-template op bylder.com
11. Dealerlocator: merk → dealers per regio (koppelt aan de bestaande
    vakbedrijven-/winkeldata)
12. Materiaalplaatsing in de ontwerptools

**D. Later, met bewijs**
13. Unieke voucher-codes per gebruiker
14. Prepaid saldo en facturatie per activatie

---

## 7. Volgorde van uitvoering

1. **Dit plan vaststellen** — met name de vier openstaande prijzen en de
   merkplaatsing-prijs
2. **Content** — alle zakelijke pagina's naar het skelet van §4, met de
   onderbouwing van §3, de gesplitste woonwinkel/merken-pagina's en overal de
   juiste prijs en termijn
3. **Functies** — blok A eerst (zonder incasso geen terugkerende omzet), dan B,
   dan C
