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

## Stack (feiten)
- Pre-rendered HTML-pagina's per content-cluster (mappen in de repo-root, bv. `nieuwbouw-gids/`, `kortingscode/`, `offerte-check/`, `en-us/`).
- Content-generatie via **Python-scripts** in `scripts/` (`nieuwbouw_scraper.py`, `vakbedrijven_pipeline.py`, `winkels_mvp.py`) + JSON-data in `data/`.
- Node-deps minimaal: `@anthropic-ai/sdk`, `stripe`. Deploy + redirects via `vercel.json`.
- Markten als taal-regio-subdir (`/en-us`, `/nl-be`, `/de`). NL staat op root — **niet verplaatsen**.

## Standing orders (gelden voor elke wijziging hier)
- **Volledige optimalisatie standaard.** Elke nieuwe/aangepaste publieke pagina krijgt ongevraagd SEO/GEO/AEO/structured-data/CRO/CWV/a11y/E-E-A-T. Optimalisatie = onderdeel van "klaar".
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

**Ontsnappingsluik:** een branch die met `preview/` begint bouwt wél een preview. Gebruik dat
voor wijzigingen die Daniel eerst wil zíén — een nieuwe pagina, een andere sectievolgorde, een
ander ontwerp. Voor tekstcorrecties, datawijzigingen en scripts is het overbodig.

**Vaste volgorde bij elke inhoudelijke wijziging:**
1. **Werk op een branch, nooit direct op `main`.** De PR is het reviewmoment en de
   ongedaan-maak-knop, ook zonder preview.
2. **Weegt het visueel?** Dan `preview/<naam>` als branchnaam, en opleveren met de
   preview-URL vóór de merge. Zo niet: gewone branchnaam, mergen, en daarna op
   **productie** controleren.
3. **Lever op met een URL bovenaan** — preview of productie — nooit met een lijst
   gewijzigde bestanden.
4. **Voeg screenshots toe** van de gewijzigde pagina's, twee formaten:
   - mobiel (390px breed) — dit is het doelapparaat voor het grootste deel van het verkeer
   - desktop (1440px breed) — hier zie je de koppenstructuur, tabellen en interne links
   Gebruik de browser-tools (`preview_start` → `navigate` → `resize_window` → `screenshot`).
5. **Beschrijf in gewone taal wat er veranderd is** aan wat de bezoeker ziet. Geen
   bestandsnamen, geen functienamen, geen regelnummers.
6. **Mergen pas na akkoord van Daniel.** Dat geldt nog steeds — zonder preview des te meer,
   want na de merge staat het live.

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

## Modelgebruik
- Getrapt: mechanisch/volume goedkoop, architectuur/security/copy-met-merkrisico op het sterkste model. Final review vóór productie altijd op het sterkste model.
