#!/usr/bin/env python3
"""Herstelt de m²-prijs op de gemeentepagina's (nieuwbouw/<provincie>/<gemeente>/).

Gevonden in de gebruikerstest van 20-10-2026: op 347 van de 383 gemeentepagina's stond
"In Almere is de gemiddelde nieuwbouwprijs €4 per m²". Een eerdere bewerking had van
"€4.500" een getal 4 gemaakt (de punt als decimaalteken gelezen). Alles wat daarvan afhing
klopte ook niet meer: "€4.796 onder het landelijk gemiddelde", een aanneemsom van €440.

De juiste waarde staat nog in de oudere versie van dezelfde pagina (output/nieuwbouw/…),
en anders in gemeenten_data_v2.csv (kolom m2_prijs) — dezelfde bron. Zonder één van
beide (89 kleinere gemeenten) geldt de mediaan van de provincie, en zegt de tekst er eerlijk
bij dat het om de regio gaat ("In de regio rond Ameland …").

Idempotent: een pagina zonder "€4 per m²" wordt overgeslagen.
"""
import csv
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LANDELIJK = 4800
KAPOT = re.compile(r'nieuwbouwprijs <strong[^>]*>€4 per m²')


def eu(n):
    return '€' + f'{int(round(n)):,}'.replace(',', '.')


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def csv_waarden():
    p = os.path.join(ROOT, 'gemeenten_data_v2.csv')
    uit = {}
    for r in csv.DictReader(open(p, encoding='utf-8')):
        if r.get('m2_prijs', '').isdigit():
            uit.setdefault(norm(r['gemeente']), int(r['m2_prijs']))
    return uit


def waarde(pad_rel, gem, csvw):
    oud = os.path.join(ROOT, 'output', pad_rel)
    if os.path.isfile(oud):
        m = re.search(r'nieuwbouwprijs <strong[^>]*>€(\d)\.(\d{3}) per m²', open(oud, encoding='utf-8').read())
        if m:
            return int(m.group(1) + m.group(2))
    return csvw.get(norm(gem))


def herstel(h, v, regio_van=None):
    w = eu(v)
    if regio_van:
        g = regio_van
        h = h.replace(f'In {g} is de gemiddelde nieuwbouwprijs', f'In de regio rond {g} is de gemiddelde nieuwbouwprijs')
        h = h.replace(f'De gemiddelde nieuwbouwprijs in {g} ligt op', f'De gemiddelde nieuwbouwprijs in de regio rond {g} ligt op')
    h = re.sub(r'€4( per m²|/m²)', lambda m: w + m.group(1), h)
    h = re.sub(r'>€4</', '>' + w + '</', h)
    verschil = LANDELIJK - v
    zin = (f'{eu(verschil)} onder het landelijk gemiddelde' if verschil > 0 else
           f'{eu(-verschil)} boven het landelijk gemiddelde' if verschil < 0 else 'gelijk aan het landelijk gemiddelde')
    h = re.sub(r'€[\d.]+ (?:onder|boven) het landelijk gemiddelde', zin, h)
    som = 110 * v
    h = re.sub(r'aanneemsom van ca\. €[\d.]+\. Het depot bedraagt dan ca\. €[\d.]+',
               f'aanneemsom van ca. {eu(som)}. Het depot bedraagt dan ca. {eu(som * 0.05)}', h)
    return h


def main():
    csvw = csv_waarden()
    gedaan, zonder = 0, []
    perprov = {}
    basis = os.path.join(ROOT, 'nieuwbouw')
    for prov in sorted(os.listdir(basis)):
        pd = os.path.join(basis, prov)
        if not os.path.isdir(pd):
            continue
        for gem in sorted(os.listdir(pd)):
            f = os.path.join(pd, gem, 'index.html')
            if not os.path.isfile(f):
                continue
            h = open(f, encoding='utf-8').read()
            if not KAPOT.search(h):
                m = re.search(r'nieuwbouwprijs <strong[^>]*>€(\d)\.(\d{3}) per m²', h)
                if m:
                    perprov.setdefault(prov, []).append(int(m.group(1) + m.group(2)))
                continue
            v = waarde(os.path.relpath(f, ROOT), gem, csvw)
            if not v:
                zonder.append((prov, gem, f, h))
                continue
            open(f, 'w', encoding='utf-8').write(herstel(h, v))
            perprov.setdefault(prov, []).append(v)
            gedaan += 1
    regio = 0
    for prov, gem, f, h in zonder:
        lijst = sorted(perprov.get(prov, []))
        if not lijst:
            print('   geen provinciewaarde:', prov, gem)
            continue
        v = lijst[len(lijst) // 2]
        naam = re.search(r'<h1[^>]*>\s*Nieuwbouw in ([^<:]+)', h)
        open(f, 'w', encoding='utf-8').write(herstel(h, v, naam.group(1).strip() if naam else None))
        regio += 1
    print(f'hersteld: {gedaan} met de eigen gemeenteprijs, {regio} met de mediaan van de provincie')


if __name__ == '__main__':
    main()
