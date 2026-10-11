# Backlog: content, SEO en GEO rond onzichtbare plinten

Vastgelegd 11-10-2026 op verzoek van Daniel ("help onthouden dit binnenkort te maken").
Status: **nog niet gebouwd.**

## Wat er al is (gemeten 11-10-2026)

- **Eén kennisbankartikel:** `/kennisbank/vloeren/plintloos-afwerken/`, met de titel "Onzichtbare plint of plintloos
  afwerken: kosten". Het staat in `kennisbank-sitemap.xml` en is ongeveer 2.400 woorden lang, inclusief opmaak.
- **Losse vermeldingen** in de templates van de clusters gietvloer en stukadoor, en op `/deelnemer-worden/`.
- **In de app bestaat het product al.** De koper kan "Onzichtbare plinten" aanvragen, in meters, en partners kunnen het
  product voeren. Er is alleen geen pagina die bezoekers naar die aanvraag brengt.

## Wat ontbreekt

1. **Een productpagina**, bijvoorbeeld `/onzichtbare-plinten/`, in dezelfde opzet als `/kozijnloze-deuren/` en `/gietvloer/`.
   Daarop:
   - wat een onzichtbare plint is: een schaduwvoeg of een verdiepte plint;
   - de systemen en hun verschillen;
   - wanneer het moet gebeuren: vóór de stukadoor, net als bij kozijnloze deuren;
   - kosten per meter;
   - combinaties: plintloos, kozijnloos en gietvloer samen geven het strakke beeld;
   - een knop "Vraag een offerte aan" naar de bestaande aanvraag in de app.
2. **Een pagina over kosten**, met een rekenvoorbeeld per woning op basis van eigen data. Een gemiddelde
   nieuwbouwwoning heeft zoveel strekkende meter wand. Geen verzonnen gemiddelden.
3. **Meters uit de tekening.** In Mijn woning kennen we per ruimte de wanden. Dan is "x meter plint, zonder de
   deuropeningen" uit te rekenen, zoals we nu m² gietvloer uitrekenen. Dat is een blok in Mijn woning en op de
   voorproef op de site. Op die manier wordt de plint een vierde onderdeel in de digitale tweeling.
4. **Structured data:**
   - FAQPage met de echte vragen ("Wat kost een onzichtbare plint per meter?", "Kan het in een bestaande woning?",
     "Wat is het verschil met een schaduwvoeg?");
   - HowTo voor de volgorde in de bouw;
   - BreadcrumbList.
5. **GEO.** Korte, citeerbare antwoorden bovenaan elke sectie: één zin met de kern en een getal uit eigen data.
6. **Interne links:**
   - vanaf de gietvloerpagina's en de gietvloerontwerper;
   - vanaf de kozijnloze deuren en de configurator ("ook kozijnloos? Dan past een onzichtbare plint erbij");
   - vanaf het kennisbankartikel en de clusters stukadoor en gietvloer;
   - in het menu Ontwerpen of Assortiment;
   - op `/ontwerpen/`.
7. **Partners:** wie plaatst het? Dat zijn stukadoors en afbouwbedrijven, met een systeemleverancier erachter. In de
   admin bestaat het product al; de partners moeten er nog aan worden gekoppeld.

## Eerst checken, vóór het bouwen

- **De termen die mensen zoeken:** "onzichtbare plint", "schaduwvoeg plint", "plintloos", "verdiepte plint",
  "inbouwplint" en "plint in de muur". Zoekvolume en concurrentie per term opvragen in Search Console en een
  keywordtool. Niet gokken.
- **De terminologie per markt** (standing order): in Vlaanderen heet het mogelijk anders.
- **Prijzen per meter** alleen uit offertes of van partners, met de datum erbij.
- **Indexatie:** de pagina gaat pas live als er echte inhoud en een werkende aanvraagroute zijn. Zolang het dun is:
  noindex, en hij staat dan niet in de sitemap.

## Volgorde voorstel

1. Termen en zoekvolume checken, en de partners voor plaatsing vastleggen.
2. De productpagina met FAQ en een kostensectie, gekoppeld aan de bestaande aanvraag in de app.
3. Interne links en een plek in het menu.
4. Meters uit de tekening in Mijn woning: de plint als element in de tweeling, met status en momentopname.
