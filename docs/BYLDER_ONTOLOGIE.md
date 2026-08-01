# Bylder-ontologie

Opgesteld 1 augustus 2026. Doel: één samenhangend datamodel achter de publieke pagina's,
het woningdossier, de agent en de commerciële laag — zodat dezelfde bron een projectpagina,
een AI-antwoord, een deadline-herinnering én een leverancierskoppeling voedt.

Dit stuk is een kaart, geen greenfield-ontwerp. Het meeste bestaat al; het benoemt wat
ontbreekt en waar de naden zitten.

---

## 1. Het uitgangspunt: de rand, niet de knoop

Een lijst entiteiten (gemeente → project → woning → ruimte → product → leverancier) is een
boom van zelfstandige naamwoorden. Wat er geld mee verdient is één keten:

> **ruimte × fase → beslissing** (met datum en bedrag) **→ productcategorie → leverancier**
> (binnen straal, actief in die fase)

De beslissing is het object dat de koper vasthoudt en waar een leverancier voor betaalt.
Alles hieronder staat in dienst van die ene keten.

---

## 2. Vier assen

| as | waarden | waar het nu leeft |
|---|---|---|
| **Plaats** | land → gemeente → wijk/buurt → project → woning (bouwnummer) | `nieuwbouwprojecten`, `profiles.new_*`, `new_home_geo` |
| **Tijd** | oriënteren → tekenen → meerwerk → bouwen → opleveren → inrichten → wonen | `data/ruimtes/*.json` veld `momenten`; verder verspreid |
| **Ruimte** | 25 ruimtes, binnen/buiten, met synoniemen | `data/ruimtes/*.json` |
| **Partij** | koper/huishouden, aanbieder, tegenpartij | `profiles`, `vakbedrijven`, `merchants` |

**De tijd-as is de zwakste.** Hij bestaat per ruimte (`momenten`) maar niet als ruggengraat.
Dat is de belangrijkste ingreep: zonder fase is Bylder een gids, met fase een begeleider —
en pas dan is een lead iets waard op het moment dat hij iets waard is.

---

## 3. Wat er al staat

Ruimer dan verwacht. Deze tabellen dekken al een deel van de ontologie:

| entiteit | tabel / bestand | opmerking |
|---|---|---|
| Ruimte | `data/ruimtes/*.json` (25) | rijkst gemodelleerd; bevat al beslissingen, vakken, kosten, meerwerk, producttypen |
| Project | `nieuwbouwprojecten` (18 rijen) + `data/nieuwbouwprojecten.json` (995) | wordt nu verrijkt |
| Woning van de koper | `profiles.new_street/housenumber/postcode/city/lat/lng/project_name`, `new_home_geo` | join-sleutel naar project |
| Woningtype | `woningtype` | |
| Vergunning | `vergunning_dossiers` | koppelt aan de bouwvergunning-hub |
| Documenten | `bylder_ai_dossier`, `document_ai_analysis`, `drawing_metrics`, `drawing_renders` | de AI-invoerlaag |
| Meerwerk | `seed_meerwerk_opties`, `offerte_posten` | |
| Prijs | `price_benchmark` | |
| Aanbod | `vakbedrijven`, `merchants`, `merchant_vouchers`, `prefab_installatiepartner` | |
| Vraaguiting | `aanbestedingen` | koper → leveranciers |
| Inrichting | `inrichtingen` | |
| Buurtgebaar | `kluskisten` | werkt op 500 m — dus op buurt-, niet gemeenteniveau |
| Productgarantie | `warranty_items` | let op: dít is productgarantie (merk, aankoopdatum), **niet** bouwgarantie |

---

## 4. De gaten

Gecontroleerd tegen de migraties: deze begrippen komen er niet in voor.

### 4.1 Fase als eersteklas dimensie — *het belangrijkste gat*

```
fase
  slug              oriënteren | tekenen | meerwerk | bouwen | opleveren | inrichten | wonen
  volgorde          int
  duur_typisch      interval (voor schattingen)
  kern              korte uitleg voor de koper
  ruimtes[]         welke ruimtes in deze fase spelen
  beslistypen[]     welke soorten beslissingen hier vallen
  partijtypen[]     welke aanbieders hier relevant zijn
```

Koppel `profiles` aan een **huidige fase**, afgeleid uit opleverdatum en koopdatum.
Dan weet elke pagina, elke agent en elke leverancierskoppeling waar iemand staat.

### 4.2 Beslissing als object, niet als tekst

De ruimte-JSON heeft `beslissingen` als *content*. Wat ontbreekt is de persoonlijke,
aftellende variant:

```
beslissing
  id, user_id
  ruimte_slug       → data/ruimtes
  fase_slug         → fase
  titel             "Sanitair kiezen"
  deadline          date            ← geschat of door de koper gecorrigeerd
  deadline_bron     schatting | contract | koperscommunicatie
  bedrag_indicatie  numeric range
  status            open | gekozen | vervallen
  productcategorie  → vouchers/kopen
  bron_document_id  → document_ai_analysis
```

Dit is de spil. Het is wat de projectpagina laat aftellen, wat de herinneringsmail
verstuurt, en wat een leverancier op het juiste moment in beeld brengt.

### 4.3 Nutsvoorzieningen en aansluitingen

Volledig afwezig, terwijl iedere nieuwbouwkoper het moet regelen, met deadlines, en het
goed doorverwijsbaar is.

```
aansluiting
  project_id / user_id
  soort             warmte (warmtenet|gas|warmtepomp) | elektra | water | glasvezel | laadpaal
  aanbieder         bv. WarmteStad
  actie_voor        date
  status
```

De Suikerzijde-pagina noemt WarmteStad al in lopende tekst — dat is precies zo'n knoop
die nu content is en data zou moeten zijn.

### 4.4 Bouwgarantie en waarborg

`warranty_items` gaat over productgarantie. Wat mist is de bouwkant:

```
waarborg
  project_id / user_id
  regeling          Woningborg | SWK | geen
  werkbare_werkdagen int        ← uit de aannemingsovereenkomst
  boete_per_dag     numeric
  depot_percentage  numeric      ← standaard 5%, bij de notaris
  opleverpunten[]   → herstel_termijn
```

Angstig terrein waar niemand een goed antwoord geeft; sluit aan op het kennisbank-artikel
over werkbare werkdagen.

### 4.5 Huishouden

Nu is de eenheid de woning. De behoefte zit bij het huishouden: samenstelling, budget,
thuiswerken, kinderwens. Dat bepaalt wélke ruimtes ertoe doen — een tweede badkamer is
voor de één een must en voor de ander niets.

### 4.6 Tegenpartijen

`ontwikkelaar` komt voor, maar **notaris, makelaar en aannemer/bouwer niet**. Ze bepalen
het tempo van de koper en horen in het dossier, ook als je ze nooit benadert.

### 4.7 Wijk en buurt

Onder gemeente ontbreekt een niveau. De Kluskist werkt op 500 meter; de gemeente is voor
lokale relevantie veel te grof. Postcode-4 of CBS-buurtcode volstaat.

### 4.8 Verhuizing als gebeurtenis

Eigen keten met eigen moment: verhuizer, opslag, adreswijziging, abonnementen overzetten.
Sluit aan op de bestaande verhuis-contenthub.

---

## 5. De emergente entiteit: collectieve vraag

Geen knoop maar een gevolg. Zodra project × ruimte × fase gekoppeld is, ontstaat dit vanzelf:

```
collectieve_vraag  (view, geen invoertabel)
  project_id, ruimte_slug, fase_slug
  aantal_huishoudens met dezelfde open beslissing
  venster           periode waarin ze allemaal moeten kiezen
```

Tachtig huishoudens in hetzelfde project die in hetzelfde kwartaal een vloer kiezen, is
een ander gesprek met een leverancier dan €79 voor een vermelding. Dit is wat een gids
nooit kan, en het is de commerciële reden dat de projectlaag zwaarder weegt dan de
gemeentelaag.

---

## 6. Volgorde van bouwen

1. **Fase** — tabel + afleiding uit opleverdatum. Raakt alles, kost het minst.
2. **Beslissing** — de spil; maakt de projectpagina aftellend en de herinnering mogelijk.
3. **Aansluiting** — universeel, deadline-gedreven, direct doorverwijsbaar.
4. **Waarborg** — vult het inhoudelijke gat waar de concurrentie zwijgt.
5. **Buurt** — kleine ingreep, ontgrendelt de Kluskist-straal en lokale matching.
6. **Collectieve vraag** — pas zinvol als 1 en 2 draaien en er echte huishoudens in zitten.

Huishouden, tegenpartijen en verhuizing zijn waardevol maar niet blokkerend; die kunnen
mee met het dossier wanneer het uitkomt.

---

## 7. Randvoorwaarden

- **Publicatiepoort blijft los van het model.** Alles zit in het brein vanaf dag één; een
  pagina komt er pas bij genoeg data en zoekvraag. Dat is de regel uit de ruimte-ontologie
  en hij geldt hier onverkort — zie ook de 25.697 profielpagina's die om die reden op
  noindex staan.
- **Geschatte waarden altijd als schatting markeren**, met de grondslag erbij. Een
  opleverdatum waar iemand een verhuizing omheen plant, mag nooit stelliger staan dan
  hij is. `deadline_bron` is daarom een verplicht veld, geen extraatje.
- **Eén bron per feit.** Waar pagina, metadata en schema hetzelfde beweren, komt dat uit
  hetzelfde veld — de les van de claim-bewaker.
