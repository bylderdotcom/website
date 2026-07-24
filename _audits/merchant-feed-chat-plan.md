# Plan: merchant-onboarding via chat — "zet je Google Shopping-bestand in deze chat, ik doe de rest"

_Opgesteld 2026-07-24. Doel: een zakelijke gebruiker sluit zijn webshop aan door simpelweg
zijn productfeed in een chat te slepen — en de hele affiliate-loop (5% vlak) werkt én wordt
betaald. Bouwlocatie: `bylderdotcom/app` (Next.js 16 + Supabase + Anthropic SDK + PayNL)._

## Wat er al ligt (herbruikbaar)

| Bouwsteen | Waar | Status |
|---|---|---|
| Chat met bestandsupload + AI | `src/app/api/chat/route.ts` | ✅ werkt (consument) |
| Merchant-portaal met login | `src/app/merchant/(app)` + `(auth)` | ✅ werkt |
| Betalingen (PayNL-exchange) | `api/paynl-exchange`, `api/merchant-voucher/paynl-exchange` | ✅ werkt |
| Verdienmodellen-registry | admin + migratie `20260710140000` | ✅ werkt |
| Kortingscode-infrastructuur | `api/kortingscode/*`, seed | ✅ werkt (basis attributie) |
| Cron-patroon | `api/cron/*` (gsc-sync e.a.) | ✅ patroon voor feed-hersync |
| `producten`-tabel | — | ❌ bestaat nog niet — bouwen |

## De doelervaring (merchant-kant)

> **Bylder:** "Welkom! Zet je Google Shopping-feed hier in de chat (bestand of URL) — ik doe de rest."
> **Merchant:** *sleept products.xml erin*
> **Bylder:** "Ik heb **142 producten** herkend van *Woonwinkel Jansen*: 78 verlichting, 40 meubels, 24 decoratie. 3 producten missen een prijs (overgeslagen). Ik heb alles getagd op ruimte en stijl, zodat ze op het juiste koopmoment worden aanbevolen. Zal ik ze live zetten? Je betaalt alleen 5% bij een echte verkoop."
> **Merchant:** "Ja"
> **Bylder:** "Live! Dit is je unieke ledenkortingscode voor attributie: JANSEN-BYLDER. Je dashboard toont vanaf nu kliks en verkopen."

## Fase 1 — MVP: feed in de chat → producten live (1 bouwronde)

1. **Migratie `producten`**: id, merchant_id, bron ('merchant'|'amazon'), sku/asin, titel,
   omschrijving, categorie, ruimte_tags text[], stijl_tags text[], prijs_cent, affiliate_url,
   beeld_url, actief, feed_id, unique(merchant_id, sku).
2. **Migratie `merchant_feeds`**: merchant_id, type ('upload'|'url'), feed_url, formaat
   ('google-xml'|'csv'), status, aantal_ok/overgeslagen, fouten jsonb, laatste_sync.
3. **`/api/merchant/feed-intake`**: accepteert bestand (XML/CSV) óf een URL in de chattekst.
   Parser voor Google Shopping RSS/Atom (g:id, g:title, g:description, g:price, g:link,
   g:image_link, g:product_type, g:availability) en CSV met kolom-autodetectie.
4. **AI-verrijking (batch)**: per product ruimte_tags + stijl_tags + Bylder-categorie via
   Claude met gestructureerde output (goedkoop klein model, ~50 producten per call);
   normalisatie + dedupe. Feed-taal/rommel is precies waar AI het verschil maakt.
5. **Merchant-chat UI** in het merchant-portaal (hergebruik chatcomponent van de consument):
   welkomstprompt, upload/URL, samenvatting, bevestigen → `actief=true`.
6. **Dashboardlijst**: producten van de merchant met status en tags (bewerken kan later).
7. **Kortingscode-attributie (MVP)**: unieke code per merchant via de bestaande
   kortingscode-infra; getoond in chat + dashboard.

**Klaar wanneer:** een echte webshop kan zonder hulp een feed droppen en binnen 5 minuten
live staan. (Eerste testcase: een van je bestaande deelnemende winkels.)

## Fase 2 — Werkend geld: meten & factureren

1. **Klik-redirect `/uit/{product_id}`**: logt klik (merchant, product, gebruiker/sessie,
   timestamp) en stuurt door naar de shop-URL. Alle productkaarten in de app linken hierdoor.
2. **Migratie `conversies`**: merchant_id, product_id?, order_ref, bedrag_cent,
   commissie_cent (5%), bron ('kortingscode'|'postback'|'rapportage'), status
   ('gemeld'|'gefactureerd'|'betaald').
3. **Verkooprapportage**: maandelijkse zelfrapportage in het merchant-portaal (omzet met
   Bylder-code) + optionele **postback-URL** voor shops die het kunnen (querystring met
   order-ref + bedrag). AI-plausibiliteitscheck (kliks vs gemelde omzet).
4. **Facturatie**: maandelijkse 5%-factuur via PayNL (bestaand exchange-patroon),
   verdienmodellen-registry uitbreiden met `affiliate_5pct`; factuurregel per conversie.
5. **Merchant-dashboard**: kliks, conversies, commissie, factuurstatus.

## Fase 3 — Schalen

- **Cron-hersync** van feed-URL's (dagelijks; prijs/voorraad bijwerken, verdwenen producten
  deactiveren) — patroon `api/cron/*`.
- **Uitspelen in de consument-journey**: aanbevelingen per ruimte/stijl/koopmoment in de
  app (Shoppen-pijler, 3D-tools) — merchant-producten vóór Amazon-fallback ranken op
  geschiktheid (vlakke fee = geen perverse prikkel).
- **Websitekaarten** uit dezelfde `producten`-bron (kennisbank/money-pages: lokale shops
  naast/boven Amazon).
- **Plugins** (Shopify-app, WooCommerce) voor automatische postbacks = sluitende attributie.
- **Zelf-serve upsell** in de chat: showroomsale plannen, voucher aanmaken, statistieken opvragen.

## Beslispunten voor Daniël

1. **Betaalrichting fase 2**: automatische incasso (machtiging bij onboarding) of factuur
   achteraf? (Incasso = minder wanbetaling, iets zwaardere onboarding.)
2. **Merchant-voorwaarden**: kort juridisch document met de 5%-afspraak, rapportageplicht
   en opzegbaarheid — nodig vóór de eerste betaalde conversie.
3. **Eerste pilot-shop**: welke bestaande deelnemer mag als eerste testen?

## Volgorde & doorlooptijd (bouwrondes van mijn kant)

| Ronde | Inhoud | Afhankelijkheid |
|---|---|---|
| 1 | Fase 1 compleet (migraties, intake, AI-tagging, chat-UI, code-attributie) | geen — kan direct |
| 2 | Fase 2 (kliks, conversies, rapportage, PayNL-facturatie) | beslispunt 1 + 2 |
| 3 | Fase 3 (cron, journey-uitspelen, website-kaarten) | fase 1 live + eerste feeds |
