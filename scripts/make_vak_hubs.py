#!/usr/bin/env python3
# ============================================================================
# EENMALIGE BOOTSTRAP: vak-hubpagina's voor offerte-check en renovatiekosten.
#
# De homepage en de cluster-footers linken naar /offerte-check/<vak>/ en
# /renovatiekosten/<vak>/, maar die hubs bestonden nooit (404's, zie
# invariantenrapport + GSC). Dit script maakt ze aan VIA het generator-model:
# content-fragment + pages.json-entry per vak. Copy wordt geoogst uit de
# bestaande leaf-templates zodat prijzen/terminologie consistent blijven;
# het stedengrid komt uit vaksteden.json. Idempotent: bestaande slugs worden
# overgeslagen. Daarna: generate_cluster.py build <cluster>.
# ============================================================================
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CLUSTERS = {
    "offerte-check": {
        "crumb": "Offerte-check",
        "faq": lambda vak, prijs, n: [
            (f"Hoe werkt de {vak.lower()}-offerte-check?",
             "Upload je offerte als PDF in je Bylder-account. De AI vergelijkt elke post met actuele marktdata "
             "voor jouw gemeente en geeft per post groen, oranje of rood — met concrete onderhandelingstips. Gratis voor bewoners."),
            ("Voor welke gemeenten werkt de check?",
             f"Voor alle {n} gemeenten hieronder. De marktdata wordt per gemeente en provincie bepaald, "
             "zodat de beoordeling past bij jouw regio."),
        ],
    },
    "renovatiekosten": {
        "crumb": "Renovatiekosten",
        "faq": lambda vak, prijs, n: [
            (f"Wat kost {vak.lower()} in 2026?",
             (f"Indicatief {prijs} (2026), afhankelijk van omvang en afwerking. " if prijs else "")
             + "Kies hieronder je gemeente voor de lokale marktprijs."),
            ("Hoe weet ik of mijn offerte eerlijk is?",
             "Upload je offerte in je Bylder-account; de AI vergelijkt elke post met de marktprijs "
             "voor jouw gemeente en geeft per post groen, oranje of rood. Gratis voor bewoners."),
        ],
    },
}


def harvest(cluster: str, vak: str) -> dict:
    """Oogst h1, intro, icoon en prijsindicatie uit het leaf-template van dit vak."""
    tpl = (ROOT / "templates" / "clusters" / cluster / f"content.vakstad.{vak}.default.html").read_text()
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", tpl, re.S).group(1)
    h1 = h1.replace(" in {{city}}", "").replace(" {{city}}", "")
    h1 = h1.replace("kosten kosten", "kosten")  # dubbele-"kosten"-bug uit de bron niet overnemen
    intro_m = re.search(r"</h1>\s*<p[^>]*>(.*?)</p>", tpl, re.S)
    intro = intro_m.group(1) if intro_m else ""
    intro = intro.replace("in {{city}} in 2026", "in 2026").replace(" in {{city}}", "").replace(" {{city}}", "")
    icon_m = re.search(r"ph-thin (ph-[a-z-]+)", tpl)
    prijs_m = re.search(r"<strong[^>]*>(€[^<]*)</strong>", intro)
    return {
        "h1": h1.strip(),
        "intro": intro.strip(),
        "icon": icon_m.group(1) if icon_m else "ph-house",
        "prijs": prijs_m.group(1).strip() if prijs_m else None,
    }


def build_fragment(cluster: str, vak: str, label: str, hv: dict, cities: list, faq: list) -> str:
    crumb = CLUSTERS[cluster]["crumb"]
    tiles = "\n      ".join(
        f'<a href="/{cluster}/{vak}/{slug}/" style="background:#fff;border:1px solid var(--border);'
        f'border-radius:10px;padding:10px 14px;font-size:13px;font-weight:600;color:#1A1208;'
        f'text-decoration:none">{city}</a>'
        for slug, city in cities
    )
    faq_html = "".join(
        f'<div class="fi"><button class="fq" onclick="this.closest(\'.fi\').classList.toggle(\'fo\')">{q}'
        f'<span style="font-size:18px;flex-shrink:0">+</span></button><div class="fa">{a}</div></div>'
        for q, a in faq
    )
    return f"""
<nav><div class="ni">
  <a href="/" class="nl"><div class="nli">B.</div><span class="nls">Bylder<span class="dot">.com</span></span></a>
  <a href="https://app.bylder.com/registreer?utm_source=bylder-site&amp;utm_campaign={cluster}" class="bp">Start gratis →</a>
</div></nav>
<div style="padding-top:88px"></div>
<section style="padding:32px 0 56px">
  <div class="c">
    <div style="font-size:13px;color:rgba(61,46,30,0.72);margin-bottom:20px"><a href="/" style="color:#3D5A3E;text-decoration:none">Bylder.com</a> › <a href="/{cluster}/" style="color:#3D5A3E;text-decoration:none">{crumb}</a> › {label}</div>
    <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.12em;color:#3D5A3E;font-weight:700;margin-bottom:10px"><i class="ph-thin {hv['icon']}"></i> {crumb} · {label}</div>
    <h1 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:800;color:#1A1208;letter-spacing:-0.03em;line-height:1.1;margin-bottom:14px">{hv['h1']}</h1>
    <p style="font-size:16px;color:rgba(61,46,30,0.72);max-width:640px;line-height:1.65;margin-bottom:28px">{hv['intro']}</p>
    <a href="https://app.bylder.com/registreer?utm_source=bylder-site&amp;utm_campaign={cluster}" style="background:#3D5A3E;color:#F5F0E8;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:800;text-decoration:none;display:inline-flex;margin-bottom:40px">Upload mijn offerte →</a>

    <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.12em;color:#3D5A3E;font-weight:700;margin:24px 0 16px">Kies je gemeente ({len(cities)})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin-bottom:40px">
      {tiles}
    </div>

    <div style="font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.12em;color:#3D5A3E;font-weight:700;margin-bottom:16px">Veelgestelde vragen</div>
    <div style="margin-bottom:40px">{faq_html}</div>
  </div>
</section>
<section style="background:#1A1208;padding:64px 0;text-align:center">
  <div class="c">
    <h2 style="font-size:clamp(1.6rem,2.5vw,2.2rem);font-weight:800;color:#F5F0E8;letter-spacing:-0.03em;margin-bottom:12px">{hv['h1'].split(' — ')[0]}</h2>
    <p style="font-size:15px;color:rgba(245,240,232,0.5);max-width:440px;margin:0 auto 28px">Upload je offerte en ontvang direct groen/oranje/rood. Gratis voor bewoners.</p>
    <a href="https://app.bylder.com/registreer?utm_source=bylder-site&amp;utm_campaign={cluster}" class="bp" style="font-size:15px;padding:14px 32px;display:inline-flex">Start gratis →</a>
  </div>
</section>
"""


def main():
    made = []
    for cluster, cfg in CLUSTERS.items():
        ddir = ROOT / "data" / "clusters" / cluster
        pages = json.loads((ddir / "pages.json").read_text())
        vaksteden = json.loads((ddir / "vaksteden.json").read_text())
        slugs = {p["slug"] for p in pages}

        vakken = sorted({s.split("/")[0] for s in vaksteden})
        for vak in vakken:
            if vak in slugs:
                continue
            cities = sorted(
                ((s.split("/")[1], e["city"]) for s, e in vaksteden.items() if s.startswith(vak + "/")),
                key=lambda x: x[1],
            )
            # Leaf-entry van dit vak = bron voor chrome-variant, footer en title/description.
            leaf = next(p for p in pages if p["slug"].startswith(vak + "/"))
            leaf_city = vaksteden[leaf["slug"]]["city"]
            label = vak.replace("-", " ").capitalize()
            hv = harvest(cluster, vak)
            faq = cfg["faq"](label, hv["prijs"], len(cities))

            title = leaf["title"].replace(f" {leaf_city}", "").replace("kosten kosten", "kosten")
            description = leaf["description"].replace(f"in {leaf_city}", "in jouw gemeente").replace(leaf_city, "jouw gemeente")
            url = f"https://www.bylder.com/{cluster}/{vak}/"
            ldjson = [
                json.dumps({
                    "@context": "https://schema.org", "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Bylder.com", "item": "https://www.bylder.com/"},
                        {"@type": "ListItem", "position": 2, "name": cfg["crumb"], "item": f"https://www.bylder.com/{cluster}/"},
                        {"@type": "ListItem", "position": 3, "name": label, "item": url},
                    ],
                }, ensure_ascii=False),
                json.dumps({
                    "@context": "https://schema.org", "@type": "FAQPage",
                    "mainEntity": [
                        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                        for q, a in faq
                    ],
                }, ensure_ascii=False),
            ]

            fragment = build_fragment(cluster, vak, label, hv, cities, faq)
            (ddir / "content" / f"{vak}.html").write_text(fragment)
            pages.append({
                "slug": vak,
                "file": f"{cluster}/{vak}/index.html",
                "path": f"/{cluster}/{vak}/",
                "title": title,
                "description": description,
                "og_type": "website",
                "robots": "index, follow",
                "template": leaf["template"],
                "footer": leaf["footer"],
                "aside": None,
                "ldjson": ldjson,
                "ldjson_sep": leaf.get("ldjson_sep", "\n"),
            })
            made.append(f"/{cluster}/{vak}/ ({len(cities)} gemeenten)")
        (ddir / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1) + "\n")

    print(f"{len(made)} hubs aangemaakt:")
    for m in made:
        print("  ", m)
    if not made:
        print("  (alles bestond al — niets gedaan)")


if __name__ == "__main__":
    main()
