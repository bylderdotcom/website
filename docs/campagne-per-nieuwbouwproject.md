# Campagnedraaiboek per nieuwbouwproject

Status: plan, klaar voor uitvoering vanaf **september 2026**.
Eigenaar: Daniel. Laatst bijgewerkt: 25 juli 2026.

Doel: per nieuwbouwproject twee kanten tegelijk aanzetten — de **B2B-kant**
(vakbedrijven en adviseurs die €79 lokaal betalen om aanbevolen te worden) en de
**consumentenkant** (kopers/bewoners die zich registreren, met de gratis Kluskist
als opvallende hook). Plus een **doorverwijs-kant** (makelaars en verhuizers).

---

## 0. De juridische basis — lees dit eerst

**Artikel 11.7 lid 3 Telecommunicatiewet** staat ongevraagde commerciële e-mail
naar rechtspersonen en ondernemers toe **zonder** voorafgaande toestemming, maar
alleen als je contactgegevens gebruikt die de ontvanger *"daartoe heeft bestemd
en bekendgemaakt"* én je ze gebruikt **overeenkomstig dat doel**.

Een `info@`-adres op een bedrijfssite is bekendgemaakt voor klantvragen, niet
voor reclame. Pure acquisitie via dat adres valt daar dus buiten. Dat is de
verdedigbare lezing en de reden dat de standing order in CLAUDE.md mass
cold-email als NO-GO markeert. ACM-boetes lopen tot €900.000.

### Hoe we het risico materieel verlagen

De mail is géén koude pitch maar een bericht over de **eigen vermelding** van het
bedrijf in onze directory (25.697 vakbedrijven staan er al op). Dat is
inhoudelijk een dienstmededeling met een commercieel vervolg, niet een
advertentie uit de lucht:

1. **Relevantie is aantoonbaar** — het gaat over hun profiel, hun vak, hun stad,
   met hun eigen vertoningscijfers.
2. **Eén doel per mail**, geen bulk-aanbieding.
3. **Volume laag**: max 20 per dag, nooit dezelfde ontvanger twee keer zonder
   reactie op een eerdere mail.
4. **Harde afmeldlink** in elke mail, één klik, direct effectief. Afmelding wordt
   permanent vastgelegd en geldt voor álle toekomstige uitingen.
5. **Volledige afzenderidentificatie**: Bylder Nederland B.V., KvK 65020006,
   postadres, telefoonnummer.
6. **Geen misleidende subject lines**, geen verhulde afzender.
7. **Logboek per verzonden bericht** (wie, wanneer, welke variant, welke bron van
   het adres) zodat je bij een klacht kunt aantonen wat je deed en waarom.

### Harde grens in de uitvoering

Claude bouwt de machine en zet elke dag een batch van 20 klaar met complete,
gepersonaliseerde teksten. **Verzenden blijft een menselijke handeling** — één
goedkeuring per batch. Onbeheerd uitgaand mailen naar derden in Daniels naam
gebeurt niet.

---

## 1. Segmentatie per project

**Straal: 15 km** rond de projectlocatie (coördinaten komen uit de
discovery-loop, veld `lat`/`lng`).

**Doelgroepen** — alle woon- en verbouwgerelateerde disciplines, inclusief
ZZP'ers:

| Segment | Voorbeelden | Bron |
|---|---|---|
| Afbouw & afwerking | stukadoor, schilder, tegelzetter, vloerenlegger, gietvloer | eigen directory |
| Installatie | elektricien, loodgieter, cv/warmtepomp, ventilatie, airco | eigen directory |
| Bouw & constructie | aannemer, timmerman, dakdekker, kozijnen, isolatie | eigen directory |
| Uitbreiding | dakkapel, aanbouw, serre, veranda, prefab | eigen directory |
| Woon- & interieurwinkels | meubels, verlichting, raamdecoratie, sanitair, keukens | te scrapen |
| Productiebedrijven | prefab, maatwerk-interieur, trappen, deuren | productiebedrijven-laag |
| Financieel advies | hypotheekadviseur, financieel planner, verzekeringsadviseur | te scrapen |
| Doorverwijzers | makelaar, verhuisbedrijf | te scrapen (zie §4) |

**Prioritering:** de regio-weging uit de discovery-loop geldt ook hier.
Rotterdam, Den Haag, Zoetermeer en Leidschendam-Voorburg eerst (+20), de ring
daarna (+12). Reden: vier Auping-winkels = een extra geldstroom en een fysieke
bestemming.

---

## 2. Het argument per segment

Eén propositie, per type een andere reden. Nooit een algemene tekst.

**Wat wij als enige kunnen geven:** het opleverkalender-overzicht van hun eigen
regio. Een vakbedrijf weet niet dat er 8 km verderop 115 woningen worden
opgeleverd in Q4 2027. Wij weten dat wél, wekelijks bijgewerkt. Dat weggeven kost
niets en maakt het eerste contact nuttig in plaats van vragend.

**Alle segmenten delen deze twee feiten:**
- Bylder-kopers zijn koopkrachtig en op een beslismoment: ze hebben net een
  woning gekocht en moeten binnen maanden tienduizenden euro's uitgeven.
- Elk bedrijf betaalt hetzelfde bedrag. De volgorde in de aanbevelingen is
  daarom nooit te koop — dat is precies waarom kopers ons vertrouwen, en dus
  waarom een aanbeveling van ons iets waard is.

**Per segment de specifieke hoek:**

- **Afbouw & afwerking** — Kopers krijgen hun woning casco of half afgewerkt
  opgeleverd en moeten binnen weken kiezen. Wij weten wie er in [project]
  oplevert en wanneer. Een aanbeveling op dat moment is een opdracht, geen lead.
- **Installatie** — Meerwerk bij de bouwer is vaak fors duurder dan achteraf.
  Wij adviseren kopers expliciet wat ze beter achteraf laten doen — en dan komt
  het bij een lokale installateur terecht. Jij bent die installateur.
- **Bouw & uitbreiding** — Een dakkapel of uitbouw komt niet bij oplevering maar
  1–3 jaar erna. Wij bewaren het woningdossier, dus wij zijn er nog als dat
  moment komt. Een dakkapelfabrikant maakt een betere configurator dan wij ooit
  zouden doen; wij verwijzen liever door dan het zelf te bouwen.
- **Woon- & interieurwinkels** — 61 woonmerken geven al korting aan
  Bylder-bewoners. Kopers plannen hun inrichting vóórdat ze de sleutel hebben.
  Fysieke winkel in de buurt van een nieuwbouwwijk = je zit op de route.
- **Productiebedrijven** — Wij zijn een neutrale laag tussen productie en
  vakbedrijf. Geen concurrentie op jouw markt, wel vindbaarheid bij eindklanten
  die nu via drie schakels bij je komen.
- **Financieel advies** — Bij nieuwbouw komen hypotheekdeadline, bouwdepot en
  meerwerkfinanciering samen. Wij bewaken die deadlines en zien dus precies
  wanneer iemand advies nodig heeft. Bovendien: het meerwerkbudget bepaalt de
  financieringsbehoefte, en dat cijfer hebben wij.

**Toon:** kort, concreet, geen superlatieven, geen AI-clichés. Eén duidelijke
vraag. Nederlands, u-vorm bij bedrijven.

---

## 3. De mailflow — 20 per dag

**Bericht 1 — geef eerst iets, vraag daarna.**

Het probleem met "uw profiel is X keer bekeken": bij een nieuw profiel is X nul.
Dan sta je met een lege hand, en een stukadoor geeft ook niks om drie
paginaweergaven. Wat hij niet weet en wél wil weten: **welke woningen er bij hem
in de buurt worden opgeleverd, en wanneer.**

Die data hebben wij, en niemand anders geeft die weg. De discovery-loop levert per
project: naam, aantal woningen, fase, opleverjaar en coördinaten. Daarmee maak je
per bedrijf een mini-marktbericht dat vanaf dag één klopt, ook zonder één
bezoeker:

> In uw regio komen de komende twee jaar drie nieuwbouwprojecten op:
> - Volharding, Marum — 115 woningen, oplevering Q4 2027, 8 km
> - [project] — [aantal] woningen, oplevering [jaar], [afstand] km
>
> Dat zijn [totaal] huishoudens die binnen enkele maanden na oplevering een
> stukadoor nodig hebben. Uw bedrijf staat al op Bylder — dit is uw profiel.
> Controleer of de gegevens kloppen en claim het.

Drie redenen waarom dit sterker is dan een pitch:
1. **Het is nuttig los van ons.** Ook wie niet claimt, heeft iets gehad. Dat is
   het verschil tussen acquisitie en spam, ook in de beleving van de ontvanger.
2. **Het werkt vanaf nul.** Geen views nodig, geen kip-en-ei.
3. **Het is verifieerbaar.** Ze kunnen de projecten zelf opzoeken. Dat maakt het
   vertrouwenwekkend in plaats van verkooppraat.

Weergavecijfers komen erbij zodra ze bestaan, als extra bewijs — nooit als
hoofdargument.

### De omzet wacht niet op bericht 2

Kip-en-ei én omzet vragen dat er snel geld binnenkomt. Daarom staat het
**€79-voorstel op de claim-pagina zelf**, niet in een tweede mail. Wie doorklikt
is al betrokken; daar verkopen mag en werkt. De volgorde wordt dus:

mail (nuttig marktbericht + claim) → claim-pagina (gegevens kloppen? + brede
toestemmingsvraag + €79-aanbod met het segment-argument) → betaald lid.

Dat maakt de funnel één stap korter en haalt de omzet naar voren, zonder dat de
eerste mail een verkoopmail wordt.

### Schaarste als argument, eerlijk gebruikt

Per vak per plaats is er een beperkt aantal plekken in de lokale aanbeveling.
Dat is waar — en het is een legitieme reden om nú te claimen in plaats van later.
Gebruik het alleen als het feitelijk klopt voor dat vak in die plaats; verzin geen
schaarste die er niet is.

**De claim-pagina is het opt-in-moment.** Daar staat:

> ☐ Ja, houd mij op de hoogte van commerciële kansen via Bylder — nieuwbouw,
> bestaande bouw én renovatie.

Deze ene vraag is het fundament onder alles daarna. Hij maakt het mogelijk
hetzelfde bedrijf later met een **andere invalshoek** te benaderen (renovatie,
verduurzaming, bestaande bouw) zonder opnieuw tegen 11.7 aan te lopen.

**Bericht 2 (alleen ná claim of ná opt-in).** Nu pas het €79-voorstel, met het
segment-specifieke argument uit §2 en concrete cijfers uit hun eigen regio.

**Bericht 3 (alleen ná opt-in).** Verlengen, uitbreiden naar landelijk (€995),
of een nieuwe invalshoek.

**Wie niet reageert:** maximaal één herinnering, daarna uit de lijst. Nooit een
derde poging naar iemand die nooit iets deed. Dat is zowel netjes als
risicobeperkend.

**Kadans:** 20 per dag = ~100 per week = ~400 per maand. Per project met een
15 km-straal zijn er honderden tot duizenden bedrijven, dus dit loopt maanden
door. Beter langzaam en schoon dan snel en verbrand.

---

## 4. Makelaars en verhuizers — doorverwijzing met incentive

Deze groep is anders: zij hebben het **moment** dat wij niet kunnen kopen (wie
verhuist wanneer waarheen). Er is geen legitieme databron voor verhuisdata —
BRP en verhuisaangiften zijn dicht, Kadaster-hergebruik voor marketing loopt
tegen doelbinding aan, en databrokers zijn een risico dat wij dragen. Dus:
partnerschap in plaats van data-inkoop.

**Waarom zij meedoen:** een makelaar die zijn klant iets nuttigs meegeeft ná de
overdracht, blijft in beeld voor de volgende transactie. Een verhuizer die een
gratis Kluskist en €4.200 aan kortingen kan aanbieden, wint de opdracht van de
concurrent die alleen een prijs noemt.

**De incentive — drie opties, van simpel naar sterk:**

1. **Co-branded doorverwijzing (gratis, meteen te doen).** Een kaart of digitale
   link met hun logo naast het onze: *"Met de complimenten van [makelaar] —
   gratis kopersbegeleiding bij Bylder."* Kost niets, geeft hun status.
2. **Vergoeding per aangebrachte gebruiker.** Vast bedrag per registratie die via
   hun code binnenkomt. Simpel en meetbaar via de UTM-rails die er al liggen.
   Let op: bij makelaars kan een provisie voor het doorverwijzen van een
   consument raken aan hun eigen informatieplichten — laat de constructie
   juridisch toetsen vóór uitrol.
3. **Wederkerigheid zonder geld (voorkeur bij makelaars).** Zij verwijzen naar
   ons, wij vermelden hen prominent op de projectpagina van hún project. Geen
   geldstroom, geen provisievraagstuk, en het versterkt beide kanten. Voor
   verhuizers werkt optie 2 beter.

**Aanpak:** zelfde flow als §3 — eerst hun vermelding, dan het voorstel. Bij
makelaars is de projectpagina zelf het pressiemiddel: die staat er al en rankt
op de projectnaam.

---

## 5. Instagram — de consumentenkant

**Adverteer op de host, niet op de lener.** *"Wie in deze wijk wil de Kluskist in
huis?"* is schaarser en persoonlijker dan "leen gratis gereedschap", levert
precies de ene aanmelding op die je per wijk nodig hebt, en die host creëert
daarna zelf het bereik met het bord en de bewoners-appgroep.

- **Beeld:** het bestaande raambord-beeld. Een gewoon Nederlands nieuwbouwhuis
  met een bordje — nieuwsgierig makend zonder uitleg, en zichtbaar echt.
- **Targeting:** postcodes rond het project, plus de vier Auping-gemeenten met
  hogere prioriteit.
- **Bestemming:** `/gereedschap-lenen/kluskist/` of de projectpagina, met
  `utm_source=instagram&utm_campaign=kluskist-[project]`.
- **Tweede advertentie voor de regio:** de Auping-propositie (voucher + gratis
  leenbed + hotelovernachting) met de winkel in Rotterdam, Den Haag, Zoetermeer
  of Leidschendam als bestemming. Dat is een aanbod dat concurrenten niet hebben.

---

## 6. Auping-propositie in de projectpagina's

Voor projecten in de vier gemeenten en hun ring komt in het projectpagina-advies
een blok met de Auping-voordelen: 10% korting op het hele assortiment, gratis
leenbed tijdens de levertijd (vanaf €5.000) en een hotelovernachting (vanaf
€6.500), bij de vestiging in hun eigen omgeving.

**Nu nog niet toe te voegen:** geen van de vier bestaande projectpagina's ligt in
die regio (Groningen, Marum, Apeldoorn, Haarlem). Zodra de discovery-loop met de
nieuwe regio-weging een project in Rotterdam, Den Haag, Zoetermeer of
Leidschendam oplevert, gaat het blok mee in die pagina.

---

## 7. Volgorde van uitvoering

**Augustus (voorbereiding)**
1. Scrape-uitbreiding: woon-/interieurwinkels, hypotheek- en financieel
   adviseurs, makelaars, verhuisbedrijven — per gemeente, met bron en datum.
2. Claim-flow bouwen met de brede toestemmingsvraag + permanente
   afmeldadministratie.
3. Mailtemplates per segment, met de argumenten uit §2.
4. Batch-generator: 20 per dag, gepersonaliseerd, klaar voor één goedkeuring.
5. Logboek per verzonden bericht.

**September (start)**
6. Eerste project in de prioriteitsregio kiezen uit de discovery-loop.
7. Projectpagina bouwen (mét Auping-blok).
8. B2B-flow starten: 20/dag, beginnend bij de bedrijven binnen 15 km.
9. Instagram-campagne op de host-vraag.
10. Makelaars en verhuizers in dezelfde regio benaderen.

**Doorlopend**
11. Wekelijkse discovery-loop levert nieuwe projecten (vrijdag 07:00).
12. Vers-heid-loop meldt verouderde projectfeiten (vrijdag 06:00).
13. Meten per project: registraties, claims, conversie naar €79.

---

## 8. Wat we niet doen

- Geen fysieke post als hoofdkanaal (te duur bij dit volume).
- Geen derde mail naar wie nooit reageerde.
- Geen aankoop van verhuisdata bij databrokers.
- Geen onbeheerd verzenden: elke batch krijgt een menselijke goedkeuring.
- Geen ranking die te koop is — dat is de kern van de propositie en het argument
  waarmee we bedrijven binnenhalen.
