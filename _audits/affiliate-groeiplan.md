# Affiliate-groeiplan — van eerste kaarten naar serieuze inkomstenbron

_Opgesteld 2026-07-23. Doel: het affiliate-kanaal laten uitgroeien tot een structurele
inkomstenbron, zonder Bylders "on your side"-positionering te beschadigen._

## 0. Waar staan we nu

- Bulk-affiliate-systeem live (store-ID `bylder05-21`): productbibliotheek + generator +
  compliant kaarten (`sponsored nofollow`, disclosure).
- 38 gecureerde producten, 9 kennisbank-pagina's tonen kaarten.
- Traffic-asset in opbouw: kennisbank (152 pagina's), /kopen/ pSEO (±33k pagina's),
  tools. GSC: ±739 vertoningen/dag en groeiend, indexatie 5.241 en stijgend.

**Kernconclusie:** product-affiliate alleen wordt nooit "serieus" bij dit verkeer.
De hefboom zit in de **combinatie** van drie dingen: (1) hoogwaardige lead-programma's,
(2) money-pages die op koopintentie mikken, en (3) point-of-decision in de app.

## 1. De economische logica — twee motoren

| Motor | Voorbeeld | Opbrengst/actie | Volume nodig | Marge |
|---|---|---|---|---|
| **Product-affiliate** | Amazon (~3%), Bol.com, ManoMano | €0,05–0,30 per klik (EPC) | Hoog | Laag |
| **Lead-affiliate** | Zonnepanelen, warmtepomp, hypotheek | €20–100+ per aanvraag | Laag | Hoog |

Illustratief rekenvoorbeeld bij 20.000 kennisbank-bezoeken/maand:
- Product: 3% klikt door × €0,15 EPC ≈ **€90/maand**.
- Leads: 0,5% vraagt een offerte aan × €40 ≈ **€4.000/maand**.

→ **Leads en money-pages zijn de multiplier; losse productcommissie is de basislaag.**
Beide bouwen we, maar het zwaartepunt ligt op leads + koopintentie-content, en alles
schaalt automatisch mee met de SEO-autoriteit die we al aan het opbouwen zijn.

## 2. Merkprincipe (niet-onderhandelbaar)

Bylder wint op onafhankelijkheid. Daarom:
- Alleen aanbevelen wat we oprecht aanraden; 2–4 écht goede producten > 6 middelmatige.
- Disclosure altijd zichtbaar; onafhankelijke prijs-/offertecheck blijft gescheiden van
  de aanbeveling.
- Lead-aanbod framen als "vraag een goede offerte aan", niet "koop dit". Dat past bij
  het merk én converteert op termijn beter (vertrouwen = herhaalverkeer).

## 3. Fase A — Fundament & PA-API-unlock (nu)

- **Naar 3 verkopen** → schakelt Amazon PA-API vrij → automatisch foto's, live prijzen en
  voorraad in de kaarten. Dat verhoogt CTR en conversie fors (beeld + prijs = meer klik).
- **Multi-programma maken**: productbibliotheek uitbreiden zodat één product ook een
  Bol.com-/ManoMano-link kan dragen. Eén kaartsysteem, meerdere programma's.
- **Tracking-ID's per surface** (`bylder-kb`, `bylder-app`, `bylder-roundup`) om te meten
  wat converteert.
- **Compliance**: EU/consumentenrecht-disclosure, geen affiliate-links in e-mail/pdf,
  prijzen alleen via PA-API.

## 4. Fase B — Dekking & curatiekwaliteit

- **Bulk-uitrol over de hele kennisbank**: elk relevant artikel koppelen aan de juiste
  productcategorie via het bestaande `affiliate_categorie`-mechanisme. Van 9 → richting
  60+ pagina's met kaarten.
- **"Beste product"-methodiek**: shortlist onderbouwen met reviewbronnen (Tweakers,
  Consumentenbond, Amazon-ratings via PA-API). Seizoensrefresh 2×/jaar; dode/uitverkochte
  ASIN's er automatisch uit (generator slaat lege asin al over).
- **Meerdere categorieën per artikel** ondersteunen (nu 1) zodat bv. een installatie-
  artikel zowel smarthome- als elektra-producten kan tonen.

## 5. Fase C — Money-pages (koopintentie-content)

Een nieuw contenttype, speciaal ontworpen voor affiliate-conversie:
- **"Beste X 2026"-vergelijkingen**: beste slimme thermostaat, beste gietvloer-onderhoud,
  beste tegelboor, beste kitpistool, beste laadpaal thuis, enz.
- Opbouw: vergelijkingstabel + "onze keuze" + per-product kaart + koopgids-FAQ. Dit zijn
  de pagina's met de hoogste EPC; zoekers met "beste/review/kopen" zitten in koopmodus.
- Sluit naadloos aan op de bestaande kennisbank-generator (nieuw sjabloon).

## 6. Fase D — Hoogwaardige programma's

- **Lead-gen (prioriteit)**: zonnepanelen (Zonneplan/Otovo/iChoosr), warmtepomp, isolatie,
  hypotheek (Independer), energie overstappen. Integreren in verduurzaming-, installaties-
  en kopen-content + tools. Dit is waar het "serieuze" geld zit.
- **Bredere product-programma's** via netwerken (Awin, Daisycon, TradeTracker): Gamma,
  Coolblue, sanitairwinkels, verlichting. ⚠️ Vermijd overlap met de eigen 60+ merkdeals
  (Auping e.a.) — affiliate alleen voor de long tail die we niet zelf in huis hebben.

## 7. Fase E — Point-of-decision in app.bylder (unieke hefboom)

Bylders grootste voorsprong: we weten wát iemand ontwerpt en kiest. In `bylderdotcom/app`
(Next.js + Supabase):
- Product-/materiaalsuggesties **per ruimte** in de ontwerptool en 3D-sfeerimpressie.
- De "Shoppen"-pijler: aanbevolen producten op het koopmoment, gekoppeld aan de render.
- Dit is de hoogste koopintentie die er is — een gebruiker die net z'n badkamer ontwerpt
  en meteen de juiste kit/tegelboor/afwerking krijgt aangeboden.

## 8. Fase F — Meten & optimaliseren

- Dashboard: EPC/RPM per programma, per surface (kennisbank/roundup/app), per artikel.
- A/B op plaatsing (in-content vs onderaan), aantal kaarten, copy.
- Maandelijks: winnaars opschalen, verliezers vervangen. Koppelen aan de bestaande
  wekelijkse SEO-monitor.

## 9. Prioritering & roadmap

| Prioriteit | Actie | Effort | Waarom |
|---|---|---|---|
| **1** | Bulk-uitrol kennisbank (9 → 60+ pagina's) | Laag | Meer klikken = sneller 3 verkopen = PA-API |
| **2** | 3–5 "beste X 2026"-money-pages | Middel | Hoogste EPC, koopintentie |
| **3** | 1–2 lead-programma's (zon + hypotheek) | Middel | De echte inkomstenmultiplier |
| **4** | Multi-programma (Bol.com erbij) | Laag | Grotere NL-catalogus, hogere conversie |
| **5** | PA-API na 3 verkopen | Laag | Foto's + prijzen = hogere CTR |
| **6** | app.bylder point-of-decision | Hoog | Hoogste intentie, uniek voor Bylder |

## 10. Realistische verwachting

Bij het huidige verkeer is de opbrengst eerst bescheiden — dit is een machine die
meegroeit met autoriteit en verkeer (precies wat de kennisbank + E-E-A-T-inzet al
opbouwen). De volgorde is bewust: eerst dekking + money-pages (goedkoop, bouwt verkeer
en verkopen op), dan leads (de multiplier), dan de app (de hoogste hefboom). Zo wordt
affiliate een structurele, groeiende inkomstenbron in plaats van een gadget.
