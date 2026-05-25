#!/usr/bin/env python3
"""
Bylder.com — Programmatic SEO Generator
========================================
Genereert per gemeente een volledige HTML-landingspagina, XML-sitemap en
Schema.org JSON-LD op basis van gemeenten_data.csv.

Gebruik:
  pip install jinja2
  python generate.py

Output-structuur:
  /output/nieuwbouw/[provincie]/[gemeente]/index.html
  /output/sitemap.xml

Auteur: Bylder.com
"""

import csv
import json
import os
import re
import shutil
from datetime import date, datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

try:
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    JINJA2 = True
except ImportError:
    JINJA2 = False
    print("[WAARSCHUWING] Jinja2 niet gevonden — valt terug op string-vervanging.")

# ── CONFIGURATIE ────────────────────────────────────────────────────────────
BASE_URL        = "https://bylder.com"
OUTPUT_DIR      = Path("output")
TEMPLATE_FILE   = "template_v2.html"
CSV_FILE        = "gemeenten_data.csv"

import argparse
_parser = argparse.ArgumentParser(description="Bylder pSEO Generator")
_parser.add_argument("--csv", default=CSV_FILE, help="Pad naar CSV-bestand")
_args, _ = _parser.parse_known_args()
CSV_FILE = _args.csv
SITEMAP_FILE    = OUTPUT_DIR / "sitemap.xml"
TODAY           = date.today().isoformat()
PRIORITY        = "0.8"
CHANGEFREQ      = "weekly"


# ── SLUG-HELPER ─────────────────────────────────────────────────────────────
def slugify(text: str) -> str:
    """Omzetten naar URL-vriendelijke slug: 's-Hertogenbosch → s-hertogenbosch"""
    text = text.lower().strip()
    text = re.sub(r"['\u2018\u2019]", "", text)   # apostrofs verwijderen
    text = re.sub(r"[^a-z0-9\-]", "-", text)       # niet-alfanumeriek → koppelteken
    text = re.sub(r"-{2,}", "-", text)              # dubbele koppeltekens → één
    return text.strip("-")


# ── SCHEMA.ORG JSON-LD ──────────────────────────────────────────────────────
def build_json_ld(row: dict) -> str:
    """
    Genereert twee JSON-LD blokken:
      1. FAQPage — veelgestelde vragen
      2. LocalBusiness — Bylder als lokale dienst
    """
    gemeente  = row["gemeente"]
    provincie = row["provincie"]
    slug_gem  = slugify(gemeente)
    slug_prov = slugify(provincie)
    url       = f"{BASE_URL}/nieuwbouw/{slug_prov}/{slug_gem}/"

    faq_data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"Hoe helpt Bylder bij een nieuwbouwwoning in {gemeente}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (
                        f"Bylder biedt geautomatiseerde AI-begeleiding bij het controleren van je "
                        f"bouwtekeningen, aannemersoffertes en garanties, specifiek afgestemd op de "
                        f"normen die gelden in {gemeente} en de provincie {provincie}. Daarnaast "
                        f"activeer je direct collectieve inkoopkorting voor de afwerking en inrichting."
                    )
                }
            },
            {
                "@type": "Question",
                "name": f"Welke nieuwbouwprojecten in {gemeente} worden ondersteund door Bylder?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (
                        f"Bylder ondersteunt momenteel {row['aantal_projecten']} actieve "
                        f"nieuwbouwprojecten in {gemeente}, waaronder projecten in {row['wijken_lijst']}. "
                        f"Kun je jouw project niet vinden? Upload dan je bouwtekening of offerte voor "
                        f"een directe AI-analyse."
                    )
                }
            },
            {
                "@type": "Question",
                "name": f"Hoeveel bespaar ik gemiddeld via Bylder als nieuwbouwkoper in {gemeente}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (
                        f"Kopers in regio {gemeente} besparen gemiddeld {row['gem_besparing']} op de "
                        f"afwerking en inrichting van hun woning via het Bylder-platform. Dit is de "
                        f"gecombineerde besparing via collectieve inkoopkorting, AI-offerte controle "
                        f"en voucheractivaties."
                    )
                }
            },
            {
                "@type": "Question",
                "name": f"Zijn de aannemers via Bylder actief in {provincie}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (
                        f"Ja, het Bylder-netwerk koppelt je uitsluitend aan gecertificeerde, lokale "
                        f"aannemers die actief zijn in regio {gemeente} en de provincie {provincie}. "
                        f"Alle aangesloten vakbedrijven beschikken over de juiste SWK-, BouwGarant- "
                        f"of Woningborg-certificering."
                    )
                }
            },
            {
                "@type": "Question",
                "name": f"Wat kost Bylder voor een nieuwbouwkoper in {gemeente}?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": (
                        f"Bylder kost €99 eenmalig. Dit geeft je toegang tot de AI Kopersbegeleider, "
                        f"alle vouchers voor 40+ partnermerken, de AI QuickScan en de complete "
                        f"nieuwbouwgids. Gezien de gemiddelde besparing van {row['gem_besparing']} "
                        f"in regio {gemeente} betaalt het lidmaatschap zich ruimschoots terug."
                    )
                }
            },
        ]
    }

    local_biz = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Bylder",
        "description": (
            f"AI-platform voor nieuwbouwkopers in {gemeente}. "
            f"Kopersbegeleiding, AI offerte check en collectieve inkoopkorting."
        ),
        "url": url,
        "areaServed": {
            "@type": "City",
            "name": gemeente,
            "containedInPlace": {
                "@type": "State",
                "name": provincie
            }
        },
        "serviceType": "Kopersbegeleiding nieuwbouw",
        "offers": {
            "@type": "Offer",
            "price": "99",
            "priceCurrency": "EUR",
            "description": "Eenmalig lidmaatschap inclusief AI Kopersbegeleider en vouchers"
        }
    }

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Bylder",
                "item": BASE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Nieuwbouw",
                "item": f"{BASE_URL}/nieuwbouw/"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": provincie,
                "item": f"{BASE_URL}/nieuwbouw/{slug_prov}/"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": f"Nieuwbouw {gemeente}",
                "item": url
            }
        ]
    }

    lines = [
        '<script type="application/ld+json">',
        json.dumps(faq_data, ensure_ascii=False, indent=2),
        '</script>',
        '<script type="application/ld+json">',
        json.dumps(local_biz, ensure_ascii=False, indent=2),
        '</script>',
        '<script type="application/ld+json">',
        json.dumps(breadcrumb, ensure_ascii=False, indent=2),
        '</script>',
    ]
    return "\n".join(lines)


# ── HTML GENERATOR ───────────────────────────────────────────────────────────
def render_page(row: dict, template_html: str) -> str:
    """Vervangt alle tokens in de template en injecteert JSON-LD."""
    gemeente      = row["gemeente"]
    provincie     = row["provincie"]
    slug_gem      = slugify(gemeente)
    slug_prov     = slugify(provincie)
    url           = f"{BASE_URL}/nieuwbouw/{slug_prov}/{slug_gem}/"
    json_ld       = build_json_ld(row)

    m2_prijs      = str(row.get("m2_prijs", "4.000")).replace(".", ".") if row.get("m2_prijs") else "4.000"
    # Formateer m2_prijs met punt-scheidingsteken
    try:
        m2_int = int(float(str(m2_prijs).replace(",",".")))
        m2_prijs_fmt = f"{m2_int:,}".replace(",",".")
    except:
        m2_prijs_fmt = str(m2_prijs)

    meerwerk_pct  = str(row.get("meerwerk_pct", "12"))
    risico_score  = str(row.get("risico_score", "5.5"))
    try:
        risico_pct = str(int(float(risico_score) * 10))
    except:
        risico_pct = "55"
    garantie      = str(row.get("garantie_stelsel", "SWK"))
    woningen      = str(row.get("woningen_aanbouw", "500"))
    gebrek_1      = str(row.get("gebrek_1", "Stucwerk oneffenheden"))
    gebrek_2      = str(row.get("gebrek_2", "Kozijnaansluiting"))
    gebrek_3      = str(row.get("gebrek_3", "CV-instelling"))

    # Schatting depot op basis van gem. 110m²
    try:
        aanneemsom_schatting = int(float(str(m2_prijs).replace(",",".")) * 110)
        depot_schatting      = int(aanneemsom_schatting * 0.05)
        aanneemsom_fmt = f"{aanneemsom_schatting:,}".replace(",",".")
        depot_fmt      = f"{depot_schatting:,}".replace(",",".")
    except:
        aanneemsom_fmt = "385.000"
        depot_fmt      = "19.250"

    # Prijsvergelijking tov landelijk gemiddelde
    try:
        m2_val = int(float(str(m2_prijs).replace(",",".")))
        landelijk = 4800
        diff = m2_val - landelijk
        if diff > 200:
            prijs_vgl = f"€{abs(diff):,} boven het landelijk gemiddelde van €4.800/m²".replace(",",".")
        elif diff < -200:
            prijs_vgl = f"€{abs(diff):,} onder het landelijk gemiddelde van €4.800/m²".replace(",",".")
        else:
            prijs_vgl = "vergelijkbaar met het landelijk gemiddelde van €4.800/m²"
    except:
        prijs_vgl = "vergelijkbaar met het landelijk gemiddelde"

    slug_p1 = slugify(row.get("projectnaam_1","project-1"))

    # Dynamische title — max 62 tekens voor Google
    title_lang  = f"Nieuwbouw {gemeente} — offerte check & korting | Bylder"
    title_kort  = f"Nieuwbouw {gemeente} | AI kopersbegeleiding | Bylder"
    title_ultra = f"Nieuwbouw {gemeente} — Bylder"
    if len(title_lang) <= 62:
        page_title = title_lang
    elif len(title_kort) <= 62:
        page_title = title_kort
    else:
        page_title = title_ultra
    slug_p2 = slugify(row.get("projectnaam_2","project-2"))

    tokens = {
        "[Gemeente]":              gemeente,
        "[Provincie]":             provincie,
        "[Aantal_Projecten]":      row["aantal_projecten"],
        "[Wijken_Lijst]":          row["wijken_lijst"],
        "[Gem_Besparing]":         row["gem_besparing"],
        "[Projectnaam_1]":         row.get("projectnaam_1", ""),
        "[Projectnaam_2]":         row.get("projectnaam_2", ""),
        "[Projectnaam_3]":         row.get("projectnaam_3", ""),
        "[Slug_Gemeente]":         slug_gem,
        "[Slug_Provincie]":        slug_prov,
        "[Slug_Project_1]":        slug_p1,
        "[Slug_Project_2]":        slug_p2,
        "[Canonical_URL]":         url,
        "[JSON_LD]":               json_ld,
        "[Datum]":                 TODAY,
        "[Page_Title]":            page_title,
        "[M2_Prijs]":              m2_prijs_fmt,
        "[Meerwerk_Pct]":          meerwerk_pct,
        "[Risico_Score]":          risico_score,
        "[Risico_Pct]":            risico_pct,
        "[Garantie_Stelsel]":      garantie,
        "[Woningen_Aanbouw]":      woningen,
        "[Gebrek_1]":              gebrek_1,
        "[Gebrek_2]":              gebrek_2,
        "[Gebrek_3]":              gebrek_3,
        "[Aanneemsom_Schatting]":  aanneemsom_fmt,
        "[Depot_Schatting]":       depot_fmt,
        "[Prijs_Vergelijking]":    prijs_vgl,
    }

    html = template_html
    for token, value in tokens.items():
        html = html.replace(token, str(value))
    return html


# ── SITEMAP BUILDER ──────────────────────────────────────────────────────────
def build_sitemap(urls: list[dict]) -> str:
    """Genereert een geformatteerde sitemap.xml string."""
    urlset = Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    urlset.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    urlset.set(
        "xsi:schemaLocation",
        "http://www.sitemaps.org/schemas/sitemap/0.9 "
        "http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    )

    for entry in urls:
        url_el = SubElement(urlset, "url")
        SubElement(url_el, "loc").text         = entry["loc"]
        SubElement(url_el, "lastmod").text     = TODAY
        SubElement(url_el, "changefreq").text  = CHANGEFREQ
        SubElement(url_el, "priority").text    = PRIORITY

    raw_xml   = tostring(urlset, encoding="unicode", xml_declaration=False)
    reparsed  = minidom.parseString(raw_xml)
    pretty    = reparsed.toprettyxml(indent="  ")
    # Verwijder dubbele XML-declaratie die minidom toevoegt
    lines     = pretty.split("\n")
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + "\n".join(lines[1:])


# ── HOOFD-ROUTINE ─────────────────────────────────────────────────────────────
def main():
    # Template inladen
    template_path = Path(TEMPLATE_FILE)
    if not template_path.exists():
        print(f"[FOUT] Template '{TEMPLATE_FILE}' niet gevonden.")
        return

    template_html = template_path.read_text(encoding="utf-8")
    print(f"[OK] Template geladen: {len(template_html):,} tekens")

    # CSV inladen
    csv_path = Path(CSV_FILE)
    if not csv_path.exists():
        print(f"[FOUT] CSV '{CSV_FILE}' niet gevonden.")
        return

    sitemap_urls = []
    generated    = 0
    errors       = 0

    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for i, row in enumerate(reader, 1):
            # Whitespace trimmen
            row = {k: v.strip() for k, v in row.items()}

            gemeente  = row.get("gemeente", "").strip()
            provincie = row.get("provincie", "").strip()

            if not gemeente or not provincie:
                print(f"  [SKIP] Rij {i}: lege gemeente of provincie")
                errors += 1
                continue

            slug_gem  = slugify(gemeente)
            slug_prov = slugify(provincie)

            # Output-map aanmaken
            out_dir = OUTPUT_DIR / "nieuwbouw" / slug_prov / slug_gem
            out_dir.mkdir(parents=True, exist_ok=True)
            out_file = out_dir / "index.html"

            try:
                html = render_page(row, template_html)
                out_file.write_text(html, encoding="utf-8")

                url = f"{BASE_URL}/nieuwbouw/{slug_prov}/{slug_gem}/"
                sitemap_urls.append({"loc": url})

                generated += 1
                print(f"  [OK] {url}")

            except Exception as e:
                print(f"  [FOUT] {gemeente}: {e}")
                errors += 1

    # Sitemap schrijven
    if sitemap_urls:
        SITEMAP_FILE.parent.mkdir(parents=True, exist_ok=True)
        sitemap_xml = build_sitemap(sitemap_urls)
        SITEMAP_FILE.write_text(sitemap_xml, encoding="utf-8")
        print(f"\n[OK] Sitemap: {SITEMAP_FILE} ({len(sitemap_urls)} URL's)")

    print(f"\n{'='*55}")
    print(f"  Gegenereerd : {generated} pagina's")
    print(f"  Fouten      : {errors}")
    print(f"  Output      : {OUTPUT_DIR.resolve()}")
    print(f"{'='*55}")
    print("\nVolgende stap: upload /output/ naar je server en voeg")
    print(f"  {BASE_URL}/sitemap.xml")
    print("toe aan Google Search Console voor bulk-indexatie.")


if __name__ == "__main__":
    main()
