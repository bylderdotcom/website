# Onafhankelijke prefab-configurator — specificatie (2026-07-14)

Aanleiding: configureren.prefabmaat.com (5-staps wizard van één producent, live prijs,
403 voor crawlers/AI). Bylder bouwt het neutrale alternatief: één configuratie →
meerdere producenten offreren → marktbenchmark ernaast. Motor onder het
deelnemer-segment prefab-productie (€149 per gerealiseerde match).

## Propositie

"Configureer je aanbouw, dakopbouw of dakkapel één keer. Ontvang prijzen van
meerdere prefab-producenten en zie direct of je binnen de marktprijs zit — en of
je een vergunning nodig hebt."

Onderscheid t.o.v. producent-configurators:
1. **Neutraal**: meerdere producenten, geen verkoopkanaal.
2. **Marktbenchmark**: producentindicatie náást de Bylder-marktrange (eerlijke-prijzen-data).
3. **Vergunningvrij-check in de flow** (koppeling bouwvergunning-hub; bij producenten
   ontdekt de koper dit pas ná de offerte).
4. **Transparante prijsopbouw**: element / transport / montage / btw.
5. **Loop gesloten**: ontvangen offertes → AI offerte-check.
6. **Indexeerbaar**: statische pagina met schema, in sitemap + llms.txt (hun subdomein
   geeft 403 aan crawlers = onzichtbaar voor Google/AI).

## MVP-flow (prototype gebouwd op /tools/prefab-configurator/)

1. **Wat bouw je?** — aanbouw/uitbouw · dakopbouw plat dak · dakopbouw schuin dak · dakkapel · bijgebouw
2. **Maten** — breedte × diepte (m, sliders + invoer) → m²; dakkapel: breedte in dakvlak
3. **Afwerking & opties** — gevel (stucwerk/hout/steenstrips), kozijnen (kunststof/hout/alu),
   isolatie (standaard/plus), opties (openslaande deuren, lichtkoepel/dakraam, zonwering, groen dak)
4. **Situatie** — postcode (fase 2: BAG-voorinvulling), voor-/achterzijde, bouwjaar-indicatie →
   **vergunningsindicatie** (regels: aanbouw ≤4 m diep achtererf vaak vergunningvrij;
   dakopbouw vrijwel altijd vergunningplichtig; dakkapel achterzijde binnen regels vaak
   vergunningvrij, voorzijde vergunningplichtig) + link naar /bouwvergunning/
5. **Resultaat** — live prijsrange (producentindicatie) + Bylder-marktbenchmark,
   transparante opbouw, levertijd-indicatie, CTA offerte-aanvraag + offerte-check-verwijzing

Sticky samenvattingspaneel met live prijs bij elke keuze. Voortgangsbalk. Mobiel-eerst.
Geen account nodig; config serialiseert naar URL-hash (delen/hervatten).

## Prijslogica (MVP, uit site-data + publieke ranges)

| Product | Basis per m² | Opmerking |
|---|---|---|
| Aanbouw/uitbouw | €1.800–€3.500 | conform renovatiekosten-hub |
| Dakopbouw (plat/schuin) | €1.900–€2.900 | publieke marktrange |
| Dakkapel | vanaf €7.000–€9.000 + €900–1.200/m¹ extra breedte | stuksprijs |
| Bijgebouw | €900–€1.600 | eenvoudiger schil |

Opties als opslagfactoren/vaste bedragen (in de prototype-JS als PRIJS-object,
later API). Alles nadrukkelijk "indicatie".

## Fase 2 (na validatie + ≥1 aangesloten producent)

- BAG/PDOK-adreslookup → woningtype/dakvorm/bouwjaar voorinvullen
- Gevel-visualisatie (koppeling 3D-sfeerimpressie-pipeline)
- Echte producent-routing (lead-API, match-fee-afrekening), reviews per producent
- Stap-analytics + A/B; opslaan-per-mail

## Homepage-uitlichting (voorstel — nog niet doorgevoerd)

Sectieblok "Configureer je aanbouw of dakopbouw — onafhankelijk" direct onder de
QuickScan-sectie: 3 USP-bullets (meerdere producenten · marktprijs-benchmark ·
vergunningcheck) + mini-preview van de configurator + CTA. Zie sessieverslag voor copy.

## Status prototype

- /tools/prefab-configurator/ — zelfstandige statische pagina, vanilla JS, noindex
  tot lancering (geen valse beloftes richting producenten die nog niet zijn aangesloten;
  CTA in prototype: aanvraag via e-mail + duidelijke "indicatie"-disclaimers).
- Livegang-checklist: ≥1 producent aangesloten → CTA naar echte lead-flow →
  noindex eraf → sitemap + llms.txt → homepage-blok live.
