#!/usr/bin/env python3
"""Bulk-helper voor de Amazon-affiliate productbibliotheek.

Plak Amazon-URL's (of kale ASIN's) — één per regel — en dit script:
  1. haalt de ASIN uit elke URL,
  2. print kant-en-klare JSON-entries om in producten.json te plakken
     (titel/omschrijving/categorie vul je zelf nog in),
  3. print de getagde affiliate-links (handig om te controleren).

Gebruik:
  # vanuit een bestand met URL's:
  python3 _scripts/amazon_producten.py urls.txt
  # of via stdin (plak, dan Ctrl-D):
  python3 _scripts/amazon_producten.py

Er wordt NIETS automatisch weggeschreven — je houdt de controle.
Wil je direct laten toevoegen aan producten.json? Draai met --append <categorie>.
"""
import sys, re, os, json

AMAZON_TAG = 'bylder05-21'
AMAZON_DOM = 'www.amazon.nl'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRODUCTEN = os.path.join(ROOT, 'data', 'clusters', 'kennisbank', 'producten.json')

ASIN_PATRONEN = [
    re.compile(r'/dp/([A-Z0-9]{10})', re.I),
    re.compile(r'/gp/product/([A-Z0-9]{10})', re.I),
    re.compile(r'/product/([A-Z0-9]{10})', re.I),
    re.compile(r'\basin=([A-Z0-9]{10})', re.I),
    re.compile(r'^\s*([A-Z0-9]{10})\s*$', re.I),
]

def asin_uit(regel):
    for pat in ASIN_PATRONEN:
        m = pat.search(regel)
        if m:
            return m.group(1).upper()
    return None

def link(asin):
    return f'https://{AMAZON_DOM}/dp/{asin}/?tag={AMAZON_TAG}'

def main():
    args = sys.argv[1:]
    append_cat = None
    if args and args[0] == '--append':
        append_cat = args[1] if len(args) > 1 else ''
        args = args[2:]

    if args and os.path.exists(args[0]):
        regels = open(args[0], encoding='utf-8').read().splitlines()
    else:
        print('Plak Amazon-URL\'s (één per regel), sluit af met Ctrl-D:', file=sys.stderr)
        regels = sys.stdin.read().splitlines()

    asins, gezien = [], set()
    for r in regels:
        if not r.strip():
            continue
        a = asin_uit(r)
        if not a:
            print(f'  ! geen ASIN gevonden in: {r}', file=sys.stderr)
            continue
        if a in gezien:
            continue
        gezien.add(a)
        asins.append(a)

    if not asins:
        print('Geen ASIN\'s gevonden.', file=sys.stderr)
        sys.exit(1)

    entries = [{"asin": a, "titel": "", "omschrijving": "", "categorie": append_cat or ""} for a in asins]

    print('\n=== JSON-entries (vul titel/omschrijving/categorie in) ===')
    print(json.dumps(entries, ensure_ascii=False, indent=2))
    print('\n=== Controleer de links ===')
    for a in asins:
        print(f'  {a}  ->  {link(a)}')

    if append_cat is not None:
        data = json.load(open(PRODUCTEN, encoding='utf-8'))
        data.extend(entries)
        json.dump(data, open(PRODUCTEN, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        print(f'\n{len(entries)} entries toegevoegd aan producten.json (categorie "{append_cat}"). '
              f'Vul titel/omschrijving aan en draai generate_kennisbank.py.', file=sys.stderr)

if __name__ == '__main__':
    main()
