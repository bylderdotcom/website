# Bylder.com — website-repo

Statische/getemplatede pSEO-site voor nieuwbouwkopers in NL, gedeployed op Vercel.
Het koper-dashboard + betalingen zitten in een **aparte** repo (`~/Documents/GitHub/app`, app.bylder.com). Deze repo = de publieke site.

## Propositie: meerdere winkels, één traject — en bewust geen eigen showrooms

Een koper koopt zijn gietvloer, zijn binnendeuren en zijn gordijnen vrijwel nooit in
dezelfde winkel. Dat is geen ongemak dat we wegpoetsen, het is de reden dat Bylder
bestaat: bij ons shopt iemand bij meerdere winkels binnen één traject, in plaats van
bij elke winkel opnieuw te beginnen.

Daar komt bovenop wat een losse winkel niet kan bieden:
- **Prijs door volume.** We kopen namens veel kopers in, dus prijs en voorwaarden zijn
  beter dan wat iemand alleen bedingt.
- **Een adviseur die tussen winkels beweegt.** Wil je in een gietvloershowroom je
  favoriete gordijnstaal naast de vloer houden om te zien of het klopt? Dan regelt onze
  adviseur dat. Dat is precies het werk dat geen enkele winkel voor de winkel van een
  ander doet — en het is niet na te maken met software alleen.

**Geen eigen showrooms — bewust besluit.** Eigen Huis, Decorette en soortgelijke ketens
draaien dezelfde business op eigen vastgoed en eigen voorraad. Te kapitaalintensief. Wij
gaan naar dezelfde omzet, maar slimmer: we ontsluiten de showrooms die er al staan in
plaats van ze te bouwen.

**Consequentie voor de navigatie.** Er hoort een showroomoverzicht **per producttype** in
de site: wil je gietvloeren zien, dan zijn dít de winkels om te bezoeken; voor
binnendeuren die andere. Dat is tegelijk de inspiratielaag en de reden dat een koper bij
ons begint in plaats van bij Google.

**Wat er al ligt (gemeten 11-09-2026).** `data/winkels-publiek.json` bevat 1.841 winkels
met categorie, rating, reviews en coördinaten — waaronder vloeren (123), keuken (182),
verlichting (127), sanitair (114), tegel (100), verf (87), zonwering (86), bedden (66) en
raamdecoratie (62, = gordijnen). Wat ontbreekt zijn juist de categorieën van onze eigen
vlaggenschepen: **gietvloer en binnendeuren bestaan nog niet als categorie.** In de
navigatie staat alleen `/showroomsale/` — geen showroomoverzicht. Het gat zit dus in de
taxonomie en de navigatie, niet in het ontbreken van data.

## Bylder als hoofdaannemer voor de afwerking (besluit Daniel, 28-10-2026)
Bylder neemt zelf de opdracht aan voor de hele afwerking van een nieuwbouwwoning: stucwerk,
tegelwerk, sanitair/badkamer, vloeren, binnendeuren, schilderwerk en kasten. Eén offerte (uit de
tekening van de koper), één contract, één planning, één aanspreekpunt. **Geen eigen ploegen:** het
werk doen vakbedrijven uit het netwerk als onderaannemer; bij elk onderdeel in de offerte staat wie
uitvoert. Tegelwerk en sanitair kunnen vanaf dag één. **Noem nergens (site, mail, teksten) welke
relatie Bylder heeft met een klusbedrijf of uitvoerder (besluit Daniel, 28-10-2026).**
- **Regio: Den Bosch** ('s-Hertogenbosch, Rosmalen, Vught, Sint-Michielsgestel, Heusden, Oss,
  Maasdriel). Andere regio's pas als er uitvoerders zijn; regiopagina's daar op noindex tot dan.
- **Elk bezoek moet het weten.** Pagina's: `/nieuwbouw-afwerken/` + 7 onderdeelpagina's (inhoud:
  `web/lib/afwerken.ts`, bedragen uit de prijsbenchmark). `AfwerkpakketCTA` staat onder elke
  `CommercieleStap`, op de homepage, als eerste kaart in de AanbodStrook en in het menu (Diensten).
  Aanvragen: product `afwerking-nieuwbouw` in de app (`BYLDER_AANNEMER`).
- **De gids met vakbedrijven** blijft, en is ook de werving van uitvoerders (pull, geen koude mail):
  `/uitvoerder-worden/` (aanmelding naar de app, `feature_requests` segment `uitvoerder`), een blok op
  `/voor-vakbedrijven/` en een kaart in het vakbedrijf-dashboard na het claimen.
- **In de regio** (plaatsen in `plaatsInRegio`, `web/lib/afwerken.ts`) staat de afwerkstap groot vóór
  de gewone commerciële stap; elders klein eronder. Pagina's over een onderdeel linken naar dat onderdeel.
- **Geloofwaardigheid:** de offerte-check vergelijkt ook onze eigen offertes met marktprijzen. Geen
  claims over garantie of verzekering op de site zolang die niet zijn vastgelegd. Btw 21% (nieuwbouw).

## Koers (besluit Daniel, 21-10-2026)
- **VS: lanceren met een premium-model.** Gebruikers betalen daar een premiumbedrag. Bedrag en
  vorm liggen nog niet vast; markt-terminologie eerst checken (zie standing orders).
- **NL: een webshop bouwen.** Ontwerp en details nog open. Sluit aan op wat er al ligt: de
  configurators (deuren, gietvloer, kast), de offerteflow en de ledenkorting in `web/lib/aanbod.ts`.
Bij elk plan dat de VS-markt (`/en-us`) of verkoop in NL raakt: deze koers meenemen.
- **VS, fase 1 (besluit Daniel, 23-10-2026).** Niet concurreren op klus-per-stad (Angi/HomeAdvisor winnen;
  de 373 `/en-us/cost/`-pagina's staan op noindex). Wel: de Amerikaanse nieuwbouwkoper, het moment
  van de builder's **design center**. Eerste test: `/en-us/upgrade-check/`, een wachtlijst met één van
  drie prijzen ($99/$199/$349, willekeurig per bezoeker); meten met GA4 `upgrade_check_view` en
  `upgrade_check_signup` en `feature_requests` met segment `us_wachtlijst`.
  **Termen die kopers zelf gebruiken:** design center (appointment), options / upgrades, structural
  options (eerdere deadline dan finishes), after closing, rough-in, pre-drywall inspection,
  blue-tape walkthrough, punch list, 11-month warranty walkthrough. Niet "meerwerk"-vertalingen.

- **Koper nodigt zelf bedrijven uit (besluit Daniel, 24-10-2026), NL én VS.** Naast onze partners
  nodigt een koper in zijn offerteaanvraag (app) elk bedrijf uit met een e-mailadres. Het kijkt mee in
  de digitale tweeling met de geconfigureerde maatwerkproducten en zet zijn offerte ernaast. USP én de
  manier waarop nieuwe partners ons leren kennen. Afspraken: **partners betalen commissie volgens hun
  afspraak**, ook als de koper ze zelf uitnodigt en op alle leads daarna; **alleen de eerste offerte van
  een bedrijf dat nog geen partner is, is zonder commissie** (in die mail staat "kost je niets"); de uitnodigingsmail is een verzoek van de koper, **geen reclame**, een partneraanbod pas
  ná hun reactie; de koper bepaalt per bedrijf wat het ziet. Op de site: blok
  `web/app/components/EigenVakmanMeekijken.tsx` (homepage, hoe-het-werkt, mijn-woning, deuren,
  gietvloer, kasten). VS-aanbod: uploaden + 3D + configuratoren + eigen bedrijven uitnodigen, $399
  eenmalig vooraf (richtprijs Daniel).
- **OPEN, niet vergeten: lijst met volgende producten die kopers in hun woning kunnen toevoegen.**
  Nu: binnendeuren, gietvloer, kast op maat (en plinten via offerte). Bij elk gesprek over de
  tweeling, configuratoren of de VS-lancering: Daniel herinneren dat deze lijst nog gemaakt moet worden.

## Stack (feiten)
- Pre-rendered HTML-pagina's per content-cluster (mappen in de repo-root, bv. `nieuwbouw-gids/`, `kortingscode/`, `offerte-check/`, `en-us/`).
- Content-generatie via **Python-scripts** in `scripts/` (`nieuwbouw_scraper.py`, `nwn_scraper.py`, `vakbedrijven_pipeline.py`, `winkels_mvp.py`) + JSON-data in `data/`.
- **Twee bronnen voor nieuwbouwprojecten.** Nieuwbouw.nl is een deelnemersmodel en dekt de
  markt maar half; Nieuw Wonen Nederland is de tweede bron. Bij die tweede nemen we
  **uitsluitend feiten** over — geen foto's, geen omschrijvingen — en verwijzen we terug met
  bronvermelding. Dat onderscheid is juridisch de hele zaak: zie de kop van `nwn_scraper.py`.
  Funda scrapen is afgeraden: hun voorwaarden verbieden het woordelijk en ze blokkeren actief.
- Node-deps minimaal: `@anthropic-ai/sdk`, `stripe`. Deploy + redirects via `vercel.json`.
- **Het hoofdmenu staat op één plek: `web/app/components/menu.json`.** Nav.tsx leest het, en
  `web/build.sh` (stap 4) zet het bij elke build op alle statische pagina's. Menu wijzigen =
  alleen dat bestand. Geen veegrondes over de HTML meer.
- Markten als taal-regio-subdir (`/en-us`, `/nl-be`, `/de`). NL staat op root — **niet verplaatsen**.
- **Klus per gemeente staat op één plek: `/project/<klus>/<gemeente>/` (besluit Daniel, 23-10-2026).**
  De stadpagina's van `/renovatiekosten/` en `/offerte-check/<vak>/<stad>/` concurreerden met
  `/project/` op dezelfde zoekopdracht; ze zijn weg en verwijzen door (vercel.json). Het overzicht
  `/renovatiekosten/` en de 8 onderdeelpagina's (`/renovatiekosten/badkamer/` enz., Next) blijven. Draai
  `scripts/generate_cluster.py` of `make_vak_hubs.py` niet voor die twee: dan komen ze terug.
  De klussen van bestaande bouw (aanbouw, dakkapel, isolatie, duurzaam verbouwen, laadpaal,
  tuinbestrating, inductiekookplaat) staan op noindex tot de 11 klussen voor nieuwbouwkopers
  bewijzen dat de aanpak werkt.

## Standing orders (gelden voor elke wijziging hier)
- **Volledige optimalisatie standaard.** Elke nieuwe/aangepaste publieke pagina krijgt ongevraagd SEO/GEO/AEO/structured-data/CRO/CWV/a11y/E-E-A-T. Optimalisatie = onderdeel van "klaar".
- **Elke pagina een commerciële CTA (besluit Daniel, 11-10-2026).** Een vervolgstap waar Bylder aan
  verdient: een configurator/ontwerper (deuren, gietvloer, kast), een offerteaanvraag (plinten) of
  ledenkorting. "Start gratis" of een offerte-check alleen telt niet. Welke stap bij welk onderwerp
  hoort staat op één plek: `web/lib/aanbod.ts`; `<CommercieleStap pad=…>` kiest de vorm. De
  AanbodStrook eronder toont altijd ook Auping met foto, zoals op de homepage.
- **NL-schrijfstijl.** Geen AI-clichés ("naadloos", "ontdek de mogelijkheden", "in de snel veranderende wereld" e.d.). Korte zinnen, concreet, vanuit eigen data. Geen holle intro/outro.
- **Geen emoji als UI-iconen.** Gebruik lijn-iconen; emoji alleen in mail/WhatsApp-tekst.
- **Markt-terminologie checken** vóór bouwen/uitrollen per markt (BE='renting', NO='billån', DE='Gewerbeleasing'). Voorkom schalen van foute termen.
- **Indexatie bewust gaten.** Dunne/onvalideerde clusters op noindex tot bewijs; pas sitemap mee aan.

## Opleveren: Daniel beoordeelt op de gerenderde pagina, niet op code
Daniel leest geen code. Een diff, een terminal-log of een bestandsnaam is voor hem
geen oplevering. Zijn oordeel gaat over wat een bezoeker ziet. Elke wijziging aan een
publieke pagina is daarom pas "klaar" als hij hem kan bekíjken.

**Previews staan standaard uit (besluit Daniel, 29-07-2026).** Elke wijziging bouwde twee
keer — preview bij de PR, productie na de merge — en één build duurt een kwartier. Bij een
reeks wijzigingen op een dag loopt productie daardoor uren achter. `scripts/vercel-ignore.sh`
slaat preview-builds nu over.

**Ook voor visuele wijzigingen geen preview meer (besluit Daniel, 19-09-2026).** "Je mag het
voortaan meteen live zetten, een preview is niet nodig." Dus: branch → PR → mergen → controleren
op productie. Het ontsnappingsluik bestaat nog (een branch die met `preview/` begint bouwt wél
een preview), maar gebruik het alleen als Daniel er expliciet om vraagt.

**Vaste volgorde bij elke inhoudelijke wijziging:**
1. **Werk op een branch, nooit direct op `main`.** De PR is het reviewmoment en de
   ongedaan-maak-knop, ook zonder preview.
2. **Gewone branchnaam, mergen, en daarna op productie controleren.** Alleen als Daniel
   er expliciet om vraagt een `preview/<naam>`-branch.
3. **Lever op met een URL bovenaan** — preview of productie — nooit met een lijst
   gewijzigde bestanden.
4. **Voeg screenshots toe** van de gewijzigde pagina's, twee formaten:
   - mobiel (390px breed) — dit is het doelapparaat voor het grootste deel van het verkeer
   - desktop (1440px breed) — hier zie je de koppenstructuur, tabellen en interne links
   Gebruik de browser-tools (`preview_start` → `navigate` → `resize_window` → `screenshot`).
5. **Beschrijf in gewone taal wat er veranderd is** aan wat de bezoeker ziet. Geen
   bestandsnamen, geen functienamen, geen regelnummers.
6. **Mergen mag meteen.** Daniel beoordeelt op productie; de PR blijft de ongedaan-maak-knop.

**Let op de build-gate.** Hetzelfde script slaat de build óók over als er in de laatste commit
alleen `*.md`, `*.py`, `scripts/`, `_scripts/`, `reports/`, `_audits/` of `.claude/` wijzigde.
Meld dat expliciet in plaats van een link te beloven die niet bestaat — en commit gegenereerde
HTML in dezelfde commit als het script dat hem maakte, anders bouwt Vercel niet.

**Builds staan in de rij.** Vercel bouwt er één tegelijk en één build duurt een kwartier. Merge
je drie dingen achter elkaar, dan staat het derde er pas na drie kwartier op. Beloof geen "over
een kwartier live" zonder `vercel ls website` te checken.

## Compliance (hard)
- **Geen mass cold-email** om bedrijven te werven. Spamverbod (Tw 11.7) geldt B2B; ACM-boetes tot €900k. Wél: gratis listing → claim (pull), eerste touch via post/telefoon, e-mail pas ná opt-in.

## Automatisering / loops (Fase-2 doel, nog greenfield)
- Deze repo heeft twee Actions: `nieuwbouw-discovery.yml` en `project-freshness.yml`. Nog geen
  volledige loop-set zoals de evtrader-repo (13 loops).
- Bij het bouwen ervan: **loops draaien read-only / leveren reviewbare PR's** tot bewezen; geen auto-publish naar productie zonder human-gate. Scoped tokens per service, nooit master-keys.
- **Uitzondering: de feitenronde voor projectpagina's mag zelf naar main (besluit Daniel, 23-10-2026).**
  `handwerk-schrijver.yml` draait om de week en commit zelf, maar alleen als drie controles slagen:
  geen pagina weg, mediaan eigen tekst niet gedaald, hooguit 25% van de feiten weggegooid. Anders een
  tak plus een issue. Reden: de tak-plus-handmatige-PR bleef na 1 oktober drie rondes liggen. Een
  nieuwe loop die zelf publiceert vraagt opnieuw om Daniels akkoord en om zulke controles.
- **Ook de maandelijkse ronde voor woonwinkels uit OpenStreetMap mag zelf naar main (besluit Daniel,
  23-10-2026).** `osm-winkels.yml` ververst `data/winkels-osm.json`, alleen als er minstens 1.500
  winkels zijn en het aantal niet meer dan 20% daalt; anders een tak plus een issue. Google Places
  niet verder opschalen: de voorwaarden staan bewaren langer dan 30 dagen niet toe.

## Modelgebruik
- Getrapt: mechanisch/volume goedkoop, architectuur/security/copy-met-merkrisico op het sterkste model. Final review vóór productie altijd op het sterkste model.
