# Mijn woning en de app samenvoegen

**Status:** voorstel om tegen te beslissen.
**Datum:** 23-09-2026. Gebaseerd op het lezen van `bylderdotcom/app` (commit `836381c`) en
`/mijn-woning/` op de site (PR #204). De app is gelezen, niet gedraaid.

---

## 1. De uitkomst in één alinea

De app heeft de ruggengraat: account, opslag, dossier met fases en deadlines, meerwerkadvies,
offertes, garantie. De nieuwe omgeving heeft de haak: een tekening erin, binnen tien seconden
je eigen woning met exacte maten, geteld en benoemd, en direct gekoppeld aan wat we
verkopen. Samen wordt het: **één gemeten woningmodel als middelpunt van de app, en alles
wat de app al kan hangt eraan.** De publieke pagina blijft de voordeur zonder account.

## 2. Wat de app al heeft

| Onderdeel | Wat het doet | Oordeel |
|---|---|---|
| Tekeningen & 3D (`/dashboard/tekeningen`) | Upload, bewaren, **versies vergelijken** (verschil in stopcontacten, lichtpunten, deuren tussen twee tekeningversies) | Sterk: dat versieverschil is meerwerk zichtbaar maken |
| Tekening-analyse (`/api/tekening-analyse`) | Stuurt de PDF naar een taalmodel dat oppervlaktes en aantallen **schat**, afgerond op hele m². Alleen voor leden | Zwak punt, zie §4 |
| 3D-sfeerimpressie (`/api/tekening-render`) | Generatief beeld (fal.ai) van de tekening in een stijl; quotum per maand | Emotioneel sterk, maar de indeling kan verzonnen zijn |
| Inrichten (`/dashboard/inrichten`) | Meubels slepen op de tekening, met voucherhints per categorie. **Schaal handmatig** instellen | Goed idee, onhandige schaal |
| Bylder regelt (`/dashboard/woningdossier`) | Voorstellen per fase (nu, binnenkort, later): product, vakbedrijf, meerwerk | Precies de plek waar onze aanbevelingen moeten landen |
| Meerwerk (`meerwerk_opties`, `dossier_meerwerk_keuzes`) | Per optie advies **via de bouwer of achteraf**, prijzen van de ontwikkelaar, sluitingsdatum in het dossier | Dit is de Classic Next-timingvraag, al gemodelleerd |
| Dossier en documentanalyse | Documenten bewaren; AI-analyse als lopende tekst | Nuttig, maar ongestructureerd |
| Mijn adres | Locatie en zonnestand op het adres | Kan het licht in de 3D gaan sturen |
| Garantie (`warranty_items`) | Apparaten, registratie, garantie tot | De basis voor het onderhoudsspoor na oplevering |
| Deur-CTA (`KozijnlozeDeurCTA`) | Link naar de configurator op bylder.com met UTM | Stuurt iemand weg zonder zijn deuren mee te geven |
| Bewaarde ontwerpen (`bewaarde_ontwerpen`) | Configuraties op e-mailadres | Niet gekoppeld aan een woning of account |

## 3. Wat de nieuwe omgeving toevoegt

1. **Meten in plaats van schatten.** Wanden, ruimtes, deuren en kap komen exact uit de
   vectoren van de PDF. Op de proeftekening: woonkamer en keuken 53,7 m² (met de hand 54,5),
   11 van 11 binnendeuren gevonden én benoemd naar de kamer die ze afsluiten.
2. **Een 3D-weergave die klopt.** Schematisch, maar elke wand staat waar hij hoort.
3. **Direct aan de verkoop gekoppeld.** Deuren gaan met hun namen naar de configurator en
   komen terug; de vloer is per ruimte aan te zetten en kleurt mee, met een rekenvoorbeeld.
4. **Geen drempel.** Geen account, geen upload naar een server, resultaat in seconden.
5. **Geen kosten per gebruik.** Meten draait in de browser; er gaat geen modelaanroep af.

## 4. Waar de twee botsen

**Twee waarheden over dezelfde tekening.** De app bewaart `drawing_metrics` uit een
taalmodel; de site rekent zelf. Voor dezelfde woning krijg je twee verschillende getallen.
Besluit: **gemeten gaat voor.** Het taalmodel blijft voor wat vectoren niet geven: foto's en
scans van tekeningen, en symbolen die we nog niet tellen (lichtpunten, stopcontacten).

**De haak zit achter de betaalmuur.** In de app is de berekening een ledenfunctie. Dat is
de omgekeerde volgorde van wat werkt: de gratis Pascal-editor wint de gebruiker, de
transactie komt daarna. Meten is bij ons gratis te geven, want het kost niets per keer.
Zet de muur op wat echt geld of mensen kost: sfeerimpressies boven een quotum, de
adviseur, offertebegeleiding.

**Configuraties zweven.** Een ontwerp uit de configurator komt op een e-mailadres terecht,
niet bij een woning. De deur-CTA in de app stuurt iemand naar een lege configurator, terwijl
de app zijn tekening al heeft.

**Twee versies van pdf.js.** De app gebruikt `pdfjs-dist` 4 via npm, de site 3.11 via cdnjs.
Bij het verhuizen van de lezer naar de app: één versie, uit npm.

**Klein, wel in strijd met de huisstijl:** de documentanalyse gebruikt emoji als kopjes, en
de site-regel is lijn-iconen, geen emoji in de interface.

## 5. De nieuwe opzet: één woningmodel in het midden

```
                bylder.com/mijn-woning          (publiek, geen account)
                tekening erin → woning in 3D → deuren, vloer
                              │  "Bewaar mijn woning"
                              ▼
   app.bylder.com ─────────  WONINGMODEL  ─────────────────────────────
   (uit de tekening gemeten: verdiepingen, wanden, ruimtes, deuren, kap)
       │            │               │               │              │
   Mijn woning   Bylder regelt   Configurators   Inrichten      Na oplevering
   3D + keuzes   voorstellen      deuren, vloer   meubels op     garantie en
   per ruimte    uit model +      schrijven terug de echte       onderhoud uit de
                 sluitingsdatum   naar de woning  plattegrond    technische omschr.
```

**Wat dat per onderdeel betekent:**

1. **Tekeningen & 3D wordt Mijn woning.** Bovenaan de gemeten 3D. Per verdieping en per
   ruimte: oppervlakte, wat er vastligt (meerwerk), wat nog open is, en de gekozen producten.
   Versievergelijking blijft, maar dan op gemeten getallen.
2. **Bylder regelt vult zichzelf.** Uit het model plus de sluitingsdatum ontstaan de
   voorstellen vanzelf: *"11 binnendeuren, Classic Next, nu, vóór de sluitingsdatum van je
   meerwerk"* (advies uit `meerwerk_opties`: via de bouwer), *"≈ 56 m² gietvloer, DRT,
   na oplevering"*, *"7 armaturen voor je lichtpunten"*.
3. **Configurators schrijven terug naar de woning, niet naar een e-mailadres.** Dezelfde
   heen-en-terugroute die nu op de site werkt, maar bewaard in het account. De offerte-
   aanvraag krijgt de woning als context mee: welke deur, welke kamer, welke maat.
4. **Sfeerimpressie op de echte indeling.** Het gemeten isometrische beeld wordt de input
   van de fal-render in plaats van de ruwe tekening. Dan houdt het mooie plaatje de wanden
   op hun plek.
5. **Inrichten zonder schaal instellen.** De schaal komt uit het model. Meubels vallen op
   de echte plattegrond, met de voucherhints die er al zijn.
6. **Licht uit het adres.** Mijn adres kent de locatie en de zonnestand; met de oriëntatie
   van de woning valt het zonlicht in de 3D door de echte ramen.
7. **Opdrachtbevestiging en technische omschrijving gestructureerd lezen**, niet als
   lopende tekst. Uit de opdrachtbevestiging komen de gekozen opties
   (`dossier_meerwerk_keuzes`), uit de technische omschrijving de afwerkstaat per ruimte en
   de installaties (`warranty_items`). Het verschil met het woningmodel is de lijst die
   Bylder vult.

## 6. Datamodel, zo klein mogelijk

- **`woning_modellen`**: `user_id`, `document_id` (de tekening), `versie`, `model` (jsonb:
  verdiepingen, wanden, ruimtes met vloerstroken, deuren, kap), `bron` (`vector` of
  `beeld`), `gevalideerd`. Eén rij per tekeningversie.
- **`woning_keuzes`**: `user_id`, `model_id`, `element` (stabiele sleutel, bv. `deur:1:0`
  of `ruimte:0:3`), `product` (`kozijnloze-deur`, `gietvloer`, …), `configuratie` (jsonb,
  exact wat de configurator in zijn adres zet), `status`. Vervangt op termijn het losse
  `bewaarde_ontwerpen` voor ingelogde gebruikers.
- `dossier_voorstellen.bron_tool = 'woningmodel'` voor voorstellen die uit het model komen.

## 7. Bouwvolgorde

| # | Stap | Klaar wanneer |
|---|---|---|
| 1 | **De lezer naar de app**, één gedeelde module op `pdfjs-dist` 4. `tekening-analyse` meet eerst; het taalmodel alleen als de PDF geen vectoren heeft | De proeftekening geeft in de app dezelfde 11 deuren en 53,7 m² als op de site |
| 2 | **"Bewaar mijn woning"** op de site: account aanmaken of inloggen, model en tekening gaan mee | Wie op de site begint, vindt zijn woning terug in de app, op elk apparaat |
| 3 | **Mijn woning in de app**: 3D, ruimtes, deuren, vloer; configurator-terugweg schrijft naar `woning_keuzes` | Een deur gekozen op de telefoon staat ook op de laptop |
| 4 | **Voorstellen uit het model**, met fase uit de sluitingsdatum | Bylder regelt toont de deuren en de vloer zonder dat iemand iets invult |
| 5 | **Opdrachtbevestiging en technische omschrijving gestructureerd** | Per ruimte staat wat vastligt en wat open is |
| 6 | **Sfeerimpressie en inrichten op het model** | De render klopt met de indeling; inrichten vraagt geen schaal meer |
| 7 | **Onderhoud na oplevering** uit de installaties | Warmtepomp, ventilatie en panelen staan met een onderhoudsmoment in de garantielijst |

Stap 1 en 2 samen zijn de eerste oplevering die telt: wat nu op de site werkt, werkt dan
ook ingelogd en blijft bewaard.

## 8. Beslissingen

1. **Meten gratis, ook in de app?** Voorstel: ja. Betaald wordt wat per keer geld kost of
   mensenwerk is.
2. **Waar woont de lezer?** Voorstel: één module in de app, die de site importeert of
   kopieert bij elke release. Nooit twee versies die uit elkaar groeien.
3. **Naam in het menu:** "Tekeningen & 3D" wordt "Mijn woning", dezelfde naam als de
   publieke pagina. "Mijn adres" blijft wat het is.
