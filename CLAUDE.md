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
- **Landelijk actief; marketing zet in op de regio Den Bosch** ('s-Hertogenbosch, Rosmalen, Vught,
  Sint-Michielsgestel, Heusden, Oss, Maasdriel). **Noem "regio Den Bosch" nergens op de site** (besluit
  Daniel, 29-10-2026). Pagina's over een plaats in die regio krijgen wel het grote blok met de plaatsnaam.
- **Niet uitleggen waar Bylder aan verdient** (besluit Daniel, 29-10-2026): kopers interesseert het niet.
  Wel: wat gratis is, en dat je bij de afwerking alleen de prijs in de offerte betaalt.
- **CTA: "Vraag een offerte aan"**, niet "Start gratis" (29-10-2026).
- **Ook bestaande bouw en renovatie** (besluit Daniel, 29-10-2026); nieuwbouw blijft de focus. Het
  aanvraagformulier vraagt het soort woning; product en URL blijven `afwerking-nieuwbouw` / `/nieuwbouw-afwerken/`.
- **Elk bezoek moet het weten.** Pagina's: `/nieuwbouw-afwerken/` + 7 onderdeelpagina's (inhoud:
  `web/lib/afwerken.ts`, bedragen uit de prijsbenchmark). `AfwerkpakketCTA` staat onder elke
  `CommercieleStap`, op de homepage, als eerste kaart in de AanbodStrook, in het menu (Diensten) en als
  balk boven de footer van elke pagina.
  Aanvragen: product `afwerking-nieuwbouw` in de app (`BYLDER_AANNEMER`).
- **De gids met vakbedrijven** blijft, en is ook de werving van uitvoerders (pull, geen koude mail):
  `/uitvoerder-worden/` (aanmelding naar de app, `feature_requests` segment `uitvoerder`), een blok op
  `/voor-vakbedrijven/` en een kaart in het vakbedrijf-dashboard na het claimen.
- **In de regio** (plaatsen in `plaatsInRegio`, `web/lib/afwerken.ts`) staat de afwerkstap groot vóór
  de gewone commerciële stap; elders klein eronder. Pagina's over een onderdeel linken naar dat onderdeel.
- **Alle nieuwbouwprojecten met genoeg eigen gegevens krijgen een pagina, en alles staat op index (besluit Daniel,
  3-11-2026: "dan komt het bezoek vanzelf").** Generator-poort `MIN_FEITEN = 4` (533 pagina's, was 289). Bewust
  risico: de meeste pagina's zijn ~21% uniek. Daarom zoekt de feitenronde (`handwerk-schrijver.yml`) eerst de eigen
  projectsite van nieuwe pagina's (`projectsite_oogst.py --max 120`) en schrijft er feiten bij. Een indexpoort staat
  klaar maar uit (`MIN_OPGEZOCHT = 0`; op 2 = nieuwe pagina's op noindex tot twee opgezochte feiten). Volgen in GSC.
- **Elke projectpagina** krijgt direct onder de kop "Van sleutel tot ingericht huis in <project>" (`afwerkBlokProject`, 29-10-2026; sinds 3-11 bovenaan) en een vaste balk met offerteknop (`ProjectBalk.tsx`):
  drie stappen, offerteknop met project en oplevering ingevuld, de voorbeeldwoning in 3D
  (`/mijn-woning/?voorbeeld`, data in `web/app/mijn-woning/voorbeeld.ts`), "je eigen vakman kijkt mee", en de film
  van de homepage (`ProjectFilm.tsx`, laadt pas in beeld; zonder WebGL een stilstaand beeld).
- **Meten (28-10-2026):** elke verstuurde aanvraag = GA4 `generate_lead` (`lead_type` offerte/uitvoerder,
  `product`, `bron`, `pagina`); klikken op een afwerkverwijzing = `afwerk_klik` met `plek` (balk, onder-stap,
  regio:<plaats>, project, offerte-check, homepage). Helper: `web/app/components/meet.ts`. In GA4
  `generate_lead` als key event markeren.
- **Vakbedrijfprofielen (besluit Daniel, 3-11-2026):** direct onder de bedrijfskaart het profielblok
  (`web/app/components/ProfielStap.tsx`, via `MetCommercieleStap`, ook op gietvloerprofielen): "Offerte van <bedrijf>?
  Leg hem naast de marktprijs, en naast een offerte van Bylder", hoofdknop naar het afwerkonderdeel van dat vak
  (`/nieuwbouw-afwerken/<onderdeel>/#aanvraag`), tweede knop naar de prijscheck (`#prijscheck`), plus drie vragen
  "Voordat je tekent bij …" per vak. Vervangt de configurator bovenaan. Meten: `commerciele_stap` plek profiel-boven
  en `afwerk_klik` plek profiel; nulmeting 8 klikken, 0 aanvragen in 28 dagen.
- **Projectkorting (besluit Daniel, 3-11-2026):** korting op de afwerking door Bylder die stijgt met het aantal woningen
  in hetzelfde nieuwbouwproject met een getekende opdracht: 4% vanaf 2, 7% vanaf 4, 10% vanaf 6; ook achteraf, tot het
  werk begint. Treden op twee plekken: `web/lib/projectkorting.ts` en app `src/lib/projectkorting.ts`. Blok met teller
  (vanaf 3) en deelknop op elke projectpagina (`ProjectKorting.tsx`), uitleg op `/projectkorting/`. Het project reist mee
  als `configuratie.project_slug` van de aanvraag; teller: app `/api/projectkorting`; de admin ziet de korting bij de
  aanvraag. Delen = GA4 `projectkorting_delen`; deellink met utm_source=buren.
- **Burenkorting Auping (besluit Daniel, 3-11-2026):** 5% bij 3 woningen in hetzelfde project (jij + 2 buren), 10% bij 5.
  Eén persoonlijke code per koper; de winkel controleert en verzilvert ingelogd in het winkelportaal
  (app `/merchant/verzilveren`, één account per winkel, merken in `merchants.verzilver_merken`). Code in app
  `src/lib/burenkorting.ts`; **aan sinds 3-11-2026** (`BUREN_ACTIEF`); de site zegt overal "tot 10%". Winkels koppelt
  Daniel met een SQL-regel zodra ze een account hebben. Bestaande AUPING2026-codes blijven 10%.
- **Volg je project (besluit Daniel, 3-11-2026):** onder de projectkorting op elke projectpagina (`VolgProject.tsx`):
  e-mailadres, dubbele bevestiging, hooguit één mail per week als oplevering, bouw (Kadaster), projectkorting of
  "Wat je buren kozen" verandert. Status per project: `web/public/data/project-status.json` (generator). App: tabel
  `project_volgers`, `/api/project-volgen`, cron `/api/cron/project-volgers` (maandag). GA4 `project_volgen`.
  Maandrapport (`ga4.py`) telt ook terugkerende bezoekers en betrokkenheid per groep pagina's.
- **Geloofwaardigheid:** de offerte-check vergelijkt ook onze eigen offertes met marktprijzen. Geen
  claims over garantie of verzekering op de site zolang die niet zijn vastgelegd. Btw 21% (nieuwbouw).

## Bylder-winkel (besluit Daniel, 31-10-2026)
- **Bylder is de verkoper**, de leverancier levert rechtstreeks. Pagina's: `/winkel/`, `/winkel/onzichtbare-plint/`
  (AGS Light 46/60, calculator uit Mijn woning), `/winkel/verdekt-scharnier-dx-38/` (Basys). Productgegevens op
  één plek: `web/lib/winkel.ts`. **Winkelmandje (1-11-2026):** productpagina's hebben "In je mandje" (`MandKnop`),
  het mandje staat in localStorage (`web/app/winkel/mand.ts`, `bylder:mand:v1`), winkelwagentje met aantal, altijd zichtbaar in het menu (Nav.tsx
  en het statische menu), afrekenen op `/winkel/mand/` (één betaling; app `berekenMand`: verzending één keer per
  leverancier, bestellijst per leverancier in het seintje). Zonder online prijzen gaat het mandje als bestelling
  (`winkel-mand`) naar het loket en bevestigen wij met een betaallink. Nieuw product = gegevens + prijzen + regels in
  app `src/lib/winkel.ts` (LEVERANCIER, itemRegels) en `productCent` in `web/app/winkel/prijzen.ts`.
- **Prijzen staan alleen in de app** (`src/lib/winkel.ts`, centen incl. btw); de site haalt ze op (`web/app/winkel/prijzen.ts`).
  Alleen invullen als de verkoopprijs is afgesproken. Zijn alle prijzen van een product bekend, dan rekent de klant
  af met iDEAL (Pay.nl, tabel `winkel_bestellingen`, exchange `/api/winkel/paynl-exchange`); anders bevestigen wij met
  een betaallink. Deurprijzen (besluit Daniel, 10-11-2026; Classic Next akkoord): de deurconfigurator toont per deur een prijsindicatie,
  incl. btw en **exclusief montage**, uit één bestand: `web/app/kozijnloze-deuren/configurator/prijs.ts` (kozijn als compleet pakket
  met scharnieren en magneetslot € 650/695 ex btw, deurblad per hoogte en afwerking, freeswerk € 90 per deur, kruk per model;
  houtdecor en Molinia zonder bedrag). Nieuwe keuze Hoogte (plafondhoog of standaard). De vanafprijs op `/kozijnloze-deuren/`,
  de merkpagina en in de FAQ komt uit hetzelfde bestand. Scharnieren: 3 per deur tot 2315 mm, 4 bij hoger of kamerhoog.
  Nog open bij Thijs: onze inkoop op deur en kozijn, en of freeswerk per deur of per lijn is.
- **Standaardset kozijnloze deur in de winkel (besluit Daniel, 11-11-2026):** `/winkel/kozijnloze-deur-set/`, product `winkel-deurset`:
  kozijn tot 2400 mm met 3 scharnieren en magneetslot + gegrond deurblad tot 93 x 231,5 cm, € 1.258,40 incl. btw, excl. kruk, montage en
  levering. Gegrond, zodat de koper hem meeschildert met de wand. Eigen verzendregel `dutch-doors-vracht` (nog zonder bedrag: bestellen
  via betaallink; met een bedrag gaat hij op iDEAL en vanzelf in de Google-productlijst, app `/api/winkel/feed.xml`).
  **In kleur (11-11-2026):** afgelakt in zes RAL-kleuren (6005, 5011, 3005, 7016, 9005, 6021; `SET_KLEUREN` in `web/lib/winkel.ts`, app
  `SET_KLEUR`), standaardhoogte € 1.366,09 of plafondhoog € 1.720,02 (incl. vierde scharnier), pagina per kleur `/winkel/kozijnloze-deur-set/ral-<ral>/`.
  Beelden zijn renders uit de configurator (`web/public/img/winkel/deuren/origin-<ral>.webp`), deur en wand in dezelfde kleur. Vracht € 99 per
  bestelling: alle deursets met iDEAL en in de Google-productlijst. Groefontwerpen volgen zodra de freesprijs bekend is.
  Montage: ongeveer 2,5 uur per deur (`MONTAGE_UUR` in `configurator/prijs.ts`), genoemd bij de deuren, de configurator en de set.
- **Afrekenen zonder drempel (besluit Daniel, 1-11-2026):** nooit een account vragen; na betaling hangt de bestelling
  aan het account op dat e-mailadres (app: Mijn bestellingen) en de mail logt meteen in. Geen verplicht wachtwoord
  meer (ook niet bij offertes): inloggen met Google of een inloglink (`/api/inloglink`). Formulier: "Snel invullen met
  Google" (Client ID van de app; www.bylder.com moet in Google Cloud als herkomst staan), postcode + huisnummer vullen
  straat en plaats (`/api/adres`, BAG), en de browser onthoudt de gegevens (`bylder:klant:v1`).
- **Op tijd voor de bouw:** planner "Wanneer moet je bestellen?" (`BestelMoment.tsx`, datums in localStorage) en de
  tijdlijn op `/winkel/`. Levertijd in de planner: `LEVERTIJD_WEKEN` in `web/lib/winkel.ts` (aanname tot bevestigd).
- **Wat je buren kozen:** per projectpagina, uit `/api/project-keuzes` (app, `src/lib/buren.ts`). Alleen tellingen,
  pas vanaf 3 kopers per regel; anders niets zichtbaar.

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
- **Deuren: Bylder maakt de offerte (besluit Daniel, 3-11-2026).** Niet "een vakbedrijf"; de koper sluit de opdracht
  met Bylder (app: `BYLDER_OFFERTE`). Classic Next maakt, een vakbedrijf monteert; Bylder is het aanspreekpunt.
- **GA4 ingericht (3-11-2026):** serviceaccount `bylder-gsc-reader@bylder-gsc.iam.gserviceaccount.com` (sleutel = repo-secret
  `GSC_KEY_JSON`) is Editor op property 540349275. `scripts/ga4.py inrichten` maakte 7 eigen dimensies (product, stap,
  lead_type, bron, plek, knop, pagina); `ga4.yml` zet elke 2e van de maand de trechter per product als issue.
  Nulmeting 6-10 t/m 3-11: 14.679 paginaweergaven, 1 offerteformulier geopend, 0 aanvragen, 8 klikken op een commerciële stap.
  **Ook in de app (3-11-2026):** dezelfde property in app.bylder.com (`src/lib/meet.ts`); site en app delen het _ga-cookie.
  App-events: `login`, `login_start`, `sign_up`, `generate_lead` (bron app), `offerte_getekend` (value). Site: `purchase` bij een
  betaalde winkelbestelling (`/winkel/bedankt/`). Belangrijke gebeurtenissen: generate_lead, offerte_getekend, purchase.
- **Was OPEN: GA4 inrichten (afgesproken met Daniel, 3-11-2026).** De events bestaan al (`generate_lead`,
  `offerte_formulier_open`, `afwerk_klik`, `menu_klik`, `mand_toevoegen`, `afrekenen_open`, sinds 3-11 ook
  `configurator_stap` met `product` en `stap` voor deuren, gietvloer en kast); nog nodig in GA4 zelf (Daniel): een trechter
  per product (configurator bekeken → formulier geopend → aanvraag verstuurd), key events en een vast rapport.
  Bij elk gesprek over conversie, offertes of bezoek: Daniel herinneren als dit nog niet gedaan is.
- **OPEN, niet vergeten: lijst met volgende producten die kopers in hun woning kunnen toevoegen.**
  Nu: binnendeuren, gietvloer, kast op maat (en plinten via offerte). Bij elk gesprek over de
  tweeling, configuratoren of de VS-lancering: Daniel herinneren dat deze lijst nog gemaakt moet worden.

- **OPEN, niet vergeten: "van AI-ontwerp naar realiteit bij jou in huis" (idee Daniel, 11-11-2026).** Daniel heeft met AI een
  voorraadkast ontworpen die nergens te koop is en wil die laten maken. Dat wordt de eerste proef én een propositie: iemand
  ontwerpt een meubel met AI (of uploadt een AI-beeld), Bylder maakt er een maakbaar ontwerp van (maten, zaaglijst, dxf via de
  kastontwerper), een timmerbedrijf maakt het, een vakman plaatst het. Eerst Daniels eigen kast als voorbeeld met foto's van
  beeld tot geplaatst; daarna een pagina. Bij elk gesprek over de kastontwerper, fabrieken of de visie: Daniel hieraan herinneren.

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
  Rechts in de balk twee knoppen uit `knoppen` in menu.json (besluit Daniel, 29-10-2026): "Vraag een
  offerte aan" (gevuld, ook op mobiel) en "Maak je stappenplan" (omlijnd, desktop); in het mobiele menu
  allebei bovenaan als kaart met uitleg. Klikken = GA4 `menu_klik` met `knop` en `plek` (balk/menu-mobiel).
- **De footer staat ook op één plek: `web/app/components/Footer.tsx` (28-10-2026).** `web/build.sh`
  knipt de footer uit een Next-pagina en zet hem op elke statische pagina (`_scripts/footer_pass.py`),
  inclusief de balk "Bylder als aannemer" (`afwerkbalk.html`). Footer wijzigen = alleen Footer.tsx.
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
slaat preview-builds nu over. Sinds 11-11-2026 maakt Vercel voor `claude/**`-branches helemaal geen deployment meer aan
(`git.deploymentEnabled` in `vercel.json`, ook in de app): geen preview in de rij, geen kosten.

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
- **De projectronde mag zelf naar main (besluit Daniel, 3-11-2026).** `nieuwbouw-discovery.yml` (vrijdag) zet nieuwe
  projecten uit nieuwbouw.nl én Nieuw Wonen Nederland in `data/nieuwbouwprojecten.json` en start daarna de
  publicatieronde, alleen als: de lijst niet krimpt, hooguit 100 nieuwe per ronde, geldige JSON. Anders tak + issue.
  De feitenronde (`handwerk-schrijver.yml`) draait sinds dezelfde dag **elke** zaterdag, en werkt eerst de pagina's
  bij die Google al laat zien. Die cijfers komen maandelijks uit Search Console (`gsc-projectmeting.yml`,
  `scripts/gsc_projectmeting.py` → `gsc-meting.json` + kansenlijst als issue; repo-secret `GSC_KEY_JSON`).
- **Titels met de hand (3-11-2026):** de 25 projectpagina's met veel vertoningen en weinig klikken kregen een eigen
  titel en omschrijving in `data/clusters/nieuwbouw-project/titels.json` (gaat boven de generator, ook op handwerk; met
  de oude titel en doorklik erbij). Meting van 2 december: doorklik vergelijken met `oud`; werkt het, dan de formule aanpassen.
- **De gids met vakbedrijven heeft een wekelijkse ronde die zelf naar main mag (besluit Daniel, 9-11-2026).**
  Aanmelden via `/bedrijf-aanmelden/` (app `/api/bedrijf-aanmelding`, `feature_requests` segment `vermelding`); Daniel keurt
  goed in app `/admin/aanmeldingen` ("Zet in de gids" = rij in `vakbedrijven`, bron `aanmelding`). `vakbedrijven-ronde.yml`
  (woensdag) zet die profielen op de site (`scripts/profiel_toevoegen.py`, sjabloon `content.bedrijf.aanmelding.html`,
  noindex tot geclaimd) en haalt elk bedrijf met `opt_out` eraf (`scripts/profiel_verwijderen.py`, met 301 naar de
  plaatspagina). Alleen bij hooguit 25 nieuw en 40 weg; anders tak + issue. App-cron `/api/cron/gids-online` mailt het
  bedrijf zodra het profiel online staat. Repo-secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Ook de maandelijkse ronde voor woonwinkels uit OpenStreetMap mag zelf naar main (besluit Daniel,
  23-10-2026).** `osm-winkels.yml` ververst `data/winkels-osm.json`, alleen als er minstens 1.500
  winkels zijn en het aantal niet meer dan 20% daalt; anders een tak plus een issue. Google Places
  niet verder opschalen: de voorwaarden staan bewaren langer dan 30 dagen niet toe.

- **Feedbackronde (11-11-2026, verzoek Daniel: configurators en app voortdurend verbeteren op feedback).** Alle meldingen
  in app-tabel `feature_requests`: "Mis je iets?" onderaan elke pagina (`mis-je-iets.js`, `api/feature-request.js`), sinds
  11-11 ook in de drie configurators (`web/app/components/ConfiguratorFeedback.tsx`, met stap, route, scherm en de link met
  keuzes; GA4 `configurator_feedback`), in de app (dashboards) en bij partners per aanvraag ("Had je alles voor een goede
  offerte?", app `AanvraagCompleet.tsx`, alleen "nee" wordt bewaard). App-cron `feedback-clustering` (03:00) groepeert;
  Daniel keurt goed in app `/admin/feedback`; `feedback-pr` schrijft een spec en stuurt die naar `feature-request-pr.yml`
  in de juiste repo (sinds 11-11 ook hier), die een **draft-PR** opent. Nooit automatisch mergen tot Daniel grenzen
  vaststelt en er tests per configurator zijn. Stand van de lijst: `feedback-overzicht.yml` (handmatig, alleen lezen).

- **Homepage ingekort (besluit Daniel, 11-11-2026, na de UX-audit).** Zes blokken met één doel, "Zet je woning in 3D":
  kop met de film, drie producten met prijs, één regel over korting bij merken, afwerken door Bylder, "Van vloer tot tuin"
  met "je eigen vakman kijkt mee", vier vragen (`web/app/home/NieuweHome.tsx`). De vorige homepage (22 schermen, 15 blokken,
  101 links) staat nog in `web/app/held/HomeHeld.tsx` en `HomeClient.tsx` om terug te kunnen. Nulmeting 14-10 t/m 10-11:
  203 bezoekers, 10% scrolt tot onderaan, 41% zonder interactie, 0 aanvragen. **Rond 9 december vergelijken**
  (`ga4.yml` met taak `vanaf:/`). Projectpagina's: blokken na de afwerkkeuzes zijn uitklapbaar (`klapIn` in RenderCluster).
  Ook gedaan (11-11): tekst onder 13px op een telefoon naar 13px (regel in `layout.tsx` en `bn2.css`), footer per groep
  inklapbaar op een telefoon (vinkje zonder script, `Footer.tsx`). Nog open: eigen foto's van stucwerk, tegels en badkamer (Daniel).

- **Eén reislijn en de site die je woning kent (besluit Daniel, 11-11-2026).** Onder het menu staat op de pagina's van de
  reis (homepage, mijn-woning, deuren, gietvloer, kasten, afwerken, winkel, projectpagina's, /via/) een balk met vijf
  stappen: Tekening, Woning in 3D, Kiezen, Offerte, Afgewerkt (`web/app/components/Reisbalk.tsx`, in `layout.tsx`; alleen
  Next-pagina's, verborgen op een telefoon in de configurators). Afgevinkt op basis van de woning in de browser
  (`web/lib/jouw-woning.ts`, leest `bylder:mijn-woning:v1`) en een verstuurde aanvraag (`bylder:aanvraag:v1`, gezet in
  `meetLead`). Met een eigen woning staat er "Jouw woning: 83 m² · 7 deuren" en rekenen de productkaarten op de homepage
  met die aantallen (`JouwRegel.tsx`). Klikken: `data-meet` `reis-<n>`, `reis-woning`, `reis-volgende-<n>`.

- **Stijlboek (besluit Daniel, 11-11-2026): `/stijlboek/` (noindex). Elke nieuwe of aangepaste pagina houdt zich hieraan.**
  1. **Het vaste beeld is de woning als maquette** (`web/app/components/Maquette.tsx`, servercomponent, getekend uit de
     voorbeeldwoning): witte muren, donkere rand, en per onderwerp precies één ding groen (`accent`: stucwerk, tegelwerk,
     sanitair, vloeren, binnendeuren, schilderwerk, kasten). Staat op de zeven onderdeelpagina's van `/nieuwbouw-afwerken/`.
     Nieuw onderwerp = nieuw accent in dat bestand, geen losse illustratie of stockfoto. `maquetteSvg()` geeft de svg voor
     mails en offertes (nog te doen). Deelbeelden (WhatsApp, 1200x630) van de zeven onderdeelpagina's: `web/public/img/og/afwerken-<slug>.jpg`.
  2. **Cijfers, maten en bedragen in de typemachineletter**: klasse `maat` (Space Mono, in `layout.tsx`).
  3. **Eén gevulde groene knop per scherm**, links onder de tekst; een tweede stap is een link met een pijl.
  4. **Wit in plaats van kaders**: ruimte scheidt, een lijn ordent; een wit vlak met rand alleen voor iets wat je aanklikt
     of invult (productkaart, formulier, prijs). Geen kader in een kader.
  5. Groen is schaars: de hoofdactie of het accent in het beeld. Roest alleen voor het kleine label boven een kop.
  Nog door te voeren op bestaande pagina's (per pagina, bij de eerstvolgende wijziging): statische pagina's (`bn2.css`),
  deelafbeeldingen van de overige pagina's, mails en offertes.
- **OPEN, niet vergeten: fotorealistische render ook bij kast op maat (wens Daniel, 11-11-2026).** De gietvloerontwerper
  heeft "Zie het in het echt" (app `/api/gietvloer/render`, ongeveer twintig seconden); de kastontwerper moet hetzelfde
  krijgen: de ontworpen kast fotorealistisch in de eigen kamer. Bij elk gesprek over de kastontwerper of configuratoren:
  Daniel hieraan herinneren tot het gebouwd is.

## Modelgebruik
- Getrapt: mechanisch/volume goedkoop, architectuur/security/copy-met-merkrisico op het sterkste model. Final review vóór productie altijd op het sterkste model.
