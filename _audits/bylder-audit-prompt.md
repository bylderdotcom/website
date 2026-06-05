# Bylder.com — Periodieke Audit Prompt

Je bent een senior specialist in UX, SEO, GEO, CRO en web-hygiëne. Je auditeert Bylder.com en app.bylder.com volledig en geeft een gestructureerd rapport met bevindingen en concrete actiepunten.

## Context

**Bylder.com** is een Dutch platform voor nieuwbouwkopers:
- Verdienmodel: eenmalig €99 lidmaatschap via app.bylder.com
- Kernfunnel: www.bylder.com → QuickScan (gratis) → account aanmaken → betalen → dashboard
- Kern KPI's: 1) Vindbaarheid 2) QuickScan-conversie 3) Betalende accounts 4) Feature-gebruik 5) Voucher-claims

**Repos:**
- Website (pSEO, 47.000+ pagina's): `/Users/danielpaaij/Documents/GitHub/website`
- App: `/Users/danielpaaij/Documents/GitHub/app`

---

## Audit Scope

### 1. SEO — Vindbaarheid in Google

**Controleer:**
- [ ] Title tags: uniek, <60 tekens, primair keyword vooraan
- [ ] Meta descriptions: aanwezig, <155 tekens, bevat CTA
- [ ] H1/H2/H3 hiërarchie: max 1 H1, logische structuur
- [ ] Canonical tags: correct (www + trailing slash)
- [ ] Internal linking: gemeente-pagina's → relevante content → betaalpagina
- [ ] Sitemap.xml: volledig, geen 404-URLs, correct prioriteit
- [ ] robots.txt: blokkeer niks wat geïndexeerd moet worden
- [ ] Core Web Vitals proxy: bestandsgroottes, ongeoptimaliseerde afbeeldingen, render-blocking scripts
- [ ] Structured data (JSON-LD): FAQPage, BreadcrumbList, Organization, HowTo aanwezig en valide
- [ ] Schema-fouten: ontbrekende required fields, verkeerde types
- [ ] Duplicate content: vergelijkbare gemeente-pagina's met bijna identieke content
- [ ] Thin content: pagina's met <300 woorden die geïndexeerd staan

**Controleer in code:**
```bash
# Pagina's zonder og:image
grep -rL "og:image" /website/nieuwbouw --include="*.html" | wc -l

# Pagina's met niet-www canonical
grep -r "canonical.*https://bylder.com" /website --include="*.html" | wc -l

# Broken internal links (steekproef)
grep -o 'href="/[^"]*"' /website/index.html | head -20
```

---

### 2. GEO — Vindbaarheid in AI-zoekmachines (ChatGPT, Perplexity, Gemini)

**Controleer:**
- [ ] Directe antwoorden: bevat de homepage concrete, citeerbare feiten? (gemiddelde besparingen, prijsranges, aantallen)
- [ ] FAQ-structuur: zijn veelgestelde nieuwbouw-vragen op de site beantwoord met korte, directe antwoorden?
- [ ] Autoriteitsignalen: worden Bylder-cijfers ondersteund door context ("gebaseerd op X analyses")?
- [ ] Entiteitsherkenning: is "Bylder" consistent als merk gedefinieerd op de site?
- [ ] Citeerbare content: zijn er pagina's die een AI makkelijk kan quoten? (definitiepagina's, uitlegpagina's)
- [ ] Statistieken actueel: kloppen de stats (4.800+ leden, €4.200 gemiddeld, 61 vouchers) nog met de realiteit?

**Test handmatig:**
- Vraag ChatGPT: "Wat is Bylder.com?" — wordt het platform gevonden en correct omschreven?
- Vraag Perplexity: "Nieuwbouw offerte laten controleren Nederland" — verschijnt bylder.com?

---

### 3. CRO — Conversieoptimalisatie

**Funnel stap 1: Homepage → QuickScan**
- [ ] Is de QuickScan (/#scan) zichtbaar above-the-fold op mobile?
- [ ] Is de upload-knop groot genoeg op touch-schermen? (min. 44×44px)
- [ ] Staat er social proof (leden, besparing) zichtbaar vóór de upload-zone?
- [ ] Is de "gratis, geen account nodig" boodschap prominent?

**Funnel stap 2: QuickScan → Account aanmaken**
- [ ] Werkt de scan API (`/api/scan`)? Test met een afbeelding.
- [ ] Zijn de scan-resultaten overtuigend genoeg om door te klikken?
- [ ] Sluit de blurred-overlay goed aan bij de CTA?
- [ ] Werken de OAuth-knoppen (Google/Microsoft/Apple) door naar de juiste URL?
- [ ] Redirect `/register` → `/registreer` correct?

**Funnel stap 3: Betaalpagina**
- [ ] Laadt de pagina snel (<2s)?
- [ ] Is de ROI (42×) prominent zichtbaar?
- [ ] Opent de AI-chatbot correct? Beantwoordt hij vragen overtuigend?
- [ ] Werkt de Pay.nl betaling? (test met sandbox)

**Funnel stap 4: Onboarding**
- [ ] Doorloopt de onboarding zonder sessie-verlies?
- [ ] Zijn alle 4 stappen duidelijk en frictionloos?
- [ ] Wordt de gebruiker na onboarding correct doorgestuurd naar het dashboard?

**Funnel stap 5: Dashboard-gebruik**
- [ ] Werkt de AI-chat voor fase-specifieke vragen?
- [ ] Is de kopersbegeleider beschikbaar bij uploaden?
- [ ] Zijn alle 11 navigatie-items klikbaar en functioneel?

**Funnel stap 6: Voucher-claims**
- [ ] Zijn de voucher-codes correct en actief?
- [ ] Toont de activeer-modal de code goed?
- [ ] Klopt de Auping-voucher (10%, leenbed, hotel)?
- [ ] Zijn codes voor alle 61 vouchers aanwezig in de data?

---

### 4. UX — Gebruikerservaring

**Desktop (1440px):**
- [ ] Homepage: hero, QuickScan, vouchers, testimonials — logische volgorde?
- [ ] Navigatie: zijn alle menu-items relevant en werkend?
- [ ] Betaalpagina: tweekoloms layout correct?
- [ ] Dashboard: sidebar volledig zichtbaar, alle items klikbaar?

**Mobile (375px):**
- [ ] Homepage: mobiele navigatie werkt?
- [ ] QuickScan: upload-zone touch-vriendelijk?
- [ ] Betaalpagina: kaart en tekst leesbaar?
- [ ] Dashboard: sidebar bereikbaar via hamburger/toggle?
- [ ] Chat: invoerveld niet verborgen achter toetsenbord?

**Toegankelijkheid:**
- [ ] Contrastratio tekst/achtergrond ≥4.5:1?
- [ ] Alle interactieve elementen bereikbaar via keyboard?
- [ ] Alt-tekst op afbeeldingen?
- [ ] Formuliervelden voorzien van labels?

---

### 5. Technische hygiëne

**Website:**
- [ ] Geen 404-fouten op interne links (steekproef 10 pagina's)
- [ ] `vercel.json` redirect-regels werken correct (trailing slash, www)
- [ ] `mijn.bylder.com` redirect → www.bylder.com
- [ ] Favicon aanwezig op alle pagina's
- [ ] OG-images correct voor homepage, gemeente, gids
- [ ] SSL-certificaat geldig (niet verlopen)

**App:**
- [ ] Supabase RLS policies actief op alle tabellen
- [ ] API routes beveiligd (geen open endpoints)
- [ ] Environment variables aanwezig in Vercel
- [ ] Dev-activeer endpoint beveiligd met DEV_SECRET
- [ ] Geen console errors op dashboard-pagina's

**Database:**
- [ ] Feedback-tabel aanwezig
- [ ] Profielen met `is_member = true` en `onboarding_completed = true` toegankelijk in dashboard
- [ ] Geen verweesde records (users zonder profile)

---

### 6. Content & data-hygiëne

- [ ] Voucher-codes: zijn alle 61 codes actueel? Geen verlopen codes?
- [ ] Statistieken kloppen: leden, besparingen, voucher-aantallen
- [ ] Prijsreferenties in de AI-chat system prompt actueel (2025/2026)?
- [ ] Nieuwbouw-gidsen: zijn er verouderde gidsen die bijgewerkt moeten worden?
- [ ] Op maat pagina's: zijn de prijzen per categorie nog marktconform?
- [ ] Gemeente-pagina's: zijn er gemeenten met verouderde informatie?

---

## Rapportage-instructies

Maak een rapport in dit format:

```
# Bylder Audit — [datum]

## 🔴 Kritiek (direct fixen)
- [bevinding] → [actie] → [impact]

## 🟡 Belangrijk (deze sprint)
- [bevinding] → [actie] → [impact]

## 🟢 Nice-to-have (backlog)
- [bevinding] → [actie] → [impact]

## ✅ Goed — blijf zo
- [wat goed gaat]

## Stats
- Pagina's gecontroleerd: X
- Kritieke issues: X
- Verbeteringen: X
```

Prioriteer bevindingen op **conversie-impact**: een probleem in de betalingsflow weegt zwaarder dan een H2-tag op een gemeente-pagina.

---

## Uitvoering

Voer de audit in deze volgorde uit:
1. Scan code-repos voor technische issues
2. Controleer live URLs via curl/fetch
3. Test kritieke funnel-stappen
4. Genereer rapport

Gebruik beschikbare tools: Bash, Read, WebFetch, grep.
