# Navigatie- & deelnemersstructuur — uitgewerkt plan (2026-07-11)

Akkoord gebruiker: primair particulier (klantreis-indeling), secundair één zakelijke
ingang "Deelnemer worden", commercieel vastgoed direct als volwaardig segment.

## 1. Principes

- **Particulier primair**: de consumentenkant ís het product richting deelnemers
  ("sta waar de koper al is"). Zakelijk krijgt één rustige ingang, geen zes menu-items.
- **Eén taal**: "Deelnemer worden" is de overkoepelende term (vervangt het huidige
  versnipperde "voor merken" / "voor vakbedrijven" / "partner worden").
- **Elke segmentpagina is een landingspagina**: propositie → bewijs (cijfers) →
  prijsmodel → CTA → FAQ (met FAQPage-schema). Geen brochures.

## 2. Hoofdnavigatie (particulier)

Desktop-nav:

| Item | Doel-URL | Invulling |
|---|---|---|
| Nieuwbouw kopen | `/nieuwbouw-koper/` | journey-hub: kopersbegeleiding, meerwerk, oplevering |
| Verbouwen | `/verbouwen/` (nieuw; bundelt /renovatie/, /bestaande-bouw/) | offerte-check, eerlijke prijzen, vakbedrijf vinden |
| Inrichten | `/interieur-woning/` | 3D-tools, vouchers, showroomsale |
| Verduurzamen | `/woning-verduurzamen/` | energieadvies, offerte-check verduurzaming |
| Kennisbank | `/kennisbank/` | naslag (groeit per fase 1–5) |
| Tools | `/nieuwbouw-tools/` | calculators, checklists, QuickScan |
| Deelnemer worden | `/deelnemer-worden/` | zakelijke hub (secundair gestileerd) |
| CTA: Start Project | mijn.bylder.com | ongewijzigd |

Footer: zelfde indeling + juridisch. "Deelnemer worden" in footer met de 7 segmenten
uitgeklapt (interne links + SEO).

**Uitvoeringsrisico**: de nav is hardcoded in duizenden statische pagina's én in
Next-componenten. Daarom: nieuwe pagina's + footer/nav-wijziging eerst in de
Next-laag en de generator-templates; de statische massa volgt via een aparte
sed/regeneratie-pass. Niet handmatig per bestand.

## 3. Deelnemer worden — hub en segmenten

Hub **`/deelnemer-worden/`**: één overzicht met 7 segmentkaarten + verwijzers-blok +
gedeelde bewijsvoering (aantal kopers, gem. besparing, koopmomenten-data). Elk
segment een eigen pagina:

### 3.1 `/deelnemer-worden/woonwinkels-merken/`
- Doelgroep: woonwinkels, woonmerken, keuken- & badkamerspeciaalzaken (eigen blok
  met showroom/design-center-propositie).
- Propositie: kortingsvoucher of Showroomsale op het júiste koopmoment in de
  klantreis + **productplaatsing in de ontwerptools** (3D-sfeerimpressie,
  plattegrond-inrichten) + koopmoment-data/inzichten.
- Prijsmodel: gratis instap (voucherplaatsing, bestaand model) · betaalde plus-laag
  voor toolplaatsing & data **[prijs TBD — beslissing Daniël]**.
- Migratie: 301 van `/voor-merken/`.

### 3.2 Vakbedrijven — blijft op `/voor-vakbedrijven/`
- Doelgroep: stukadoors, schilders, installateurs, tegelzetters e.a.
- Propositie: profiel in de directory (2.100+ plaatspagina's), gekoppeld aan kopers
  op het juiste moment; geen leadveiling.
- Prijsmodel: **€79 eenmalig (bestaand, ongewijzigd)**.
- Subsectie "Installatiepartner voor prefab" met kruislink naar 3.3.
- **Besluit uitvoering 2026-07-11**: URL blijft `/voor-vakbedrijven/` — 27.879 interne links (sitewide footer) verhuizen is onnodige churn; de hub linkt ernaar. Herstijlen naar segmenttemplate kan later in stap C.

### 3.3 `/deelnemer-worden/prefab-productie/`
- Doelgroep: prefab-producenten (aanbouw, dakopbouw, bijgebouw).
- Propositie: vraagzijde (kopers via prefab-contenthubs) + uitvoeringszijde
  (netwerk lokale installatiepartners — bestaand mechanisme van
  /installatiepartner-worden/, maar dan vanaf de producentkant).
- Prijsmodel: **[TBD]** (voorstel: gratis pilot, daarna fee per gerealiseerde match).
- Migratie: `/installatiepartner-worden/` blijft bestaan als vakbedrijf-instap maar
  verhuist onder 3.2; kruislinks beide richtingen.

### 3.4 `/deelnemer-worden/interieurbouw/`
- Doelgroep: interieurbouwers, maatwerk-meubelmakers (sluit aan op bestaande
  /op-maat/-hub en maatwerk-vouchers).
- Propositie: opdrachten uit de inricht-journey + plaatsing in /op-maat/;
  zichtbaarheid in ontwerptools.
- Prijsmodel: **[TBD]** (voorstel: model 3.2, eenmalige activatie).

### 3.5 `/deelnemer-worden/interieurontwerp-architecten/`
- Doelgroep: interieurontwerpers én architecten (verbouw/aanbouw zelfde funnel).
- Propositie: klanten op ontwerp-moment (3D-tools als lead-in: "van AI-schets naar
  professioneel ontwerp"), portfolio-profiel.
- Prijsmodel: **[TBD]**.

### 3.6 `/deelnemer-worden/ontwikkelaars-bouwers/`  ← nieuw kanaal (B2B2C)
- Doelgroep: projectontwikkelaars, bouwers van nieuwbouwprojecten, woningcorporaties.
- Propositie: Bylder als kopersservice per project (meerwerk-flow, digitale
  kopersbegeleiding, opleverondersteuning, 3D/BIM-koppeling — verbindt met
  kennisbank-BIM-cluster). Eén deal = honderden kopers.
- Prijsmodel: **[TBD]** (voorstel: per-project- of per-woning-fee; pilotpartner
  werven via het Verbouwprijzen Rapport / earned media).
- Let op: /partners/ noemt ontwikkelaars al — content daarvan hierin opnemen.

### 3.7 `/deelnemer-worden/commercieel-vastgoed/`  ← nieuw segment (direct mee)
- Doelgroep expliciet benoemd op de pagina: vastgoedbeleggers & -eigenaren,
  **VvE-beheerders** (brug vanaf bestaande /vve-appartement/-hub), retail- &
  horecaketens (zaakinrichting → kruislink interieurbouw), kantoor/hospitality fit-out.
- Propositie: dezelfde diensten als particulier, zakelijk geframed — AI offerte-/
  tender-check, kostenbenchmarks per m² (zakelijke variant van /eerlijke-prijzen/),
  fit-out-visualisatie (3D-tools), gekwalificeerde uitvoerende partijen.
- Prijsmodel: **[TBD]** (voorstel: per-dossier-fee i.p.v. €99-lidmaatschap; enterprise
  op aanvraag).

### Verwijzers (geen eigen segmentpagina)
Blok op de hub voor makelaars & hypotheekadviseurs: verwijs kopers, ontvang
vergoeding per activatie **[fee TBD]**. Vervangt de oude /affiliate-belofte.

## 4. Migratie & redirects

| Oud | Nieuw | Actie |
|---|---|---|
| /voor-merken/ | /deelnemer-worden/woonwinkels-merken/ | 301 + content herbruiken |
| /voor-vakbedrijven/ | blijft (28k interne links) | hub linkt ernaar |
| /partners/ | /deelnemer-worden/ | 301 (content verdelen over hub/3.6) |
| /installatiepartner-worden/ | blijft, gelinkt vanuit 3.2/3.3 | canonical behouden |

Alle bestaande interne links naar de oude URL's omleggen (zelfde aanpak als
oplevering-consolidatie: sed + generator-bronnen fixen).

## 5. SEO/GEO-inrichting

- Schema per segmentpagina: `Service` + `Offer` + `FAQPage` + `BreadcrumbList`;
  hub: `CollectionPage` + `Organization`.
- Segmentpagina's in sitemap.xml; hub + segmenten in llms.txt (sectie "Deelnemen").
- Interne links vanuit de relevante contenthubs (op-maat → interieurbouw,
  vve-appartement → commercieel vastgoed, prefab-hubs → prefab-productie,
  BIM-cluster → ontwikkelaars & bouwers).
- Zoekwoorden secundair: dit zijn conversiepagina's; autoriteit komt uit de
  kennisbank, niet andersom.

## 6. Fasering

| Stap | Inhoud | Wanneer |
|---|---|---|
| A | Hub + 7 segmentpagina's + redirects + footer-link "Deelnemer worden" | na akkoord prijsmodellen (kan direct) |
| B | Journey-hub /verbouwen/ + hoofdnav-wijziging in Next-laag & generator-templates | direct na A |
| C | Sitewide nav-pass over statische massa (sed/regeneratie) | apart, gecontroleerd |
| D | Commercieel-vastgoed-diensten operationeel (zakelijke offerte-check-flow) | product-beslissing, buiten scope website |

## 7. Open beslissingen (Daniël)

1. Prijsmodellen segmenten 3.3 t/m 3.7 en verwijzers-fee (voorstellen hierboven).
2. Naam hoofdnav-item: "Deelnemer worden" vs "Voor bedrijven" (advies: eerste —
   onderscheidend en dekt alle segmenten).
3. Commercieel vastgoed: direct met werkende diensten of eerst als
  lead-capture-pagina ("plan een gesprek") tot de zakelijke flow er is (advies:
  lead-capture eerst — geen beloftes op de site die het product nog niet waarmaakt).

## Uitvoeringslog

- 2026-07-11 — Besluiten gebruiker: commercieel vastgoed DIRECT VOLLEDIG,
  naam "Deelnemer worden", segmentpagina's MET voorstel-prijzen.
- 2026-07-11 — Stap A gebouwd: hub + 6 segmentpagina's via
  `_scripts/generate_deelnemer.py` (bron van waarheid), redirects
  /voor-merken/, /partners/ (+word-retailpartner), interne links omgelegd,
  Footer.tsx (Next), sitemap.xml, llms.txt. Voorstel-prijzen: merken gratis +
  Plus €149/mnd; prefab €149/match; interieurbouw & ontwerp €79 eenmalig;
  ontwikkelaars vanaf €49/woning; commercieel vastgoed €299/dossier;
  verwijzers €25/activatie.
- 2026-07-11 — Stap B+C uitgevoerd: journey-hub /verbouwen/ gebouwd; Nav.tsx
  (canonieke nav voor alle Next-routes) omgezet naar journey-nav; sitewide
  nav-pass via _scripts/nav_journey_pass.py over ±34.600 statische pagina's +
  generator-bronnen (4 patronen: nav-links/nav-mobile-classes, inline-flex,
  class-flex, attribuutvolgorde-tolerant met logo-guard). Bewust overgeslagen:
  /kopen/ en /kortingscode/-statisch (geschaduwd door Next-routes),
  aannemer-matching/offerte-check/renovatiekosten (minimale conversie-nav met
  alleen logo+CTA — geen verouderde links). Eindaudit: 0 gedeployde pagina's
  met verouderd menu.
