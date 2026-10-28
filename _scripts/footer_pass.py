#!/usr/bin/env python3
"""Eén footer voor de hele site (besluit Daniel, 28-10-2026).

De statische pagina's hadden twaalf verschillende footers; de Next-pagina's de footer uit
web/app/components/Footer.tsx. Dit script zet in de build-output (web/build.sh, na de overlay)
op elke statische pagina precies de footer die Next net bouwde, inclusief de balk "Bylder als
aannemer" erboven (afwerkbalk.html). Zo is Footer.tsx de enige bron, zoals menu.json voor het menu.

Regels:
- De footer wordt geknipt uit een Next-pagina in de output (/hoe-het-werkt/), van de afwerkbalk
  t/m </footer>. Vindt het script hem niet, dan stopt het zonder iets te wijzigen.
- Alleen statische pagina's (niet in de Next-lijst van build.sh), niet /en-us/ (eigen markt,
  Engelse footer). De laatste <footer>…</footer> van een pagina wordt vervangen; een losse
  afwerkbalk van eerder wordt eerst weggehaald. Pagina's zonder <footer> blijven zoals ze zijn.
- Idempotent: staat de juiste footer er al, dan wordt het bestand niet herschreven.

Gebruik: footer_pass.py --stempel <outdir> <lijst-met-next-html>
"""
import os, re, sys

BALK = re.compile(r'(?:<div>)?<!--bylder:afwerkbalk-->.*?<!--/bylder:afwerkbalk-->(?:</div>)?\n?', re.S)
FOOTER = re.compile(r'<footer\b[^>]*>.*?</footer>', re.S)


def bron(outdir):
    for pad in ('hoe-het-werkt/index.html', 'prijzen/index.html', 'index.html'):
        f = os.path.join(outdir, pad)
        if not os.path.exists(f):
            continue
        h = open(f, encoding='utf-8').read()
        i = h.find('<!--bylder:afwerkbalk-->')
        j = h.find('<footer class="ft"')
        if i < 0 or j < 0:
            continue
        k = h.index('</footer>', j) + len('</footer>')
        start = i - len('<div>') if h[i - 5:i] == '<div>' else i
        return h[start:k]
    return None


def zet(h, blok):
    if blok in h:
        return h, False
    alle = list(FOOTER.finditer(h))
    if not alle:
        return h, False
    zonder = BALK.sub('', h)
    alle = list(FOOTER.finditer(zonder))
    m = alle[-1]
    return zonder[:m.start()] + blok + zonder[m.end():], True


def stempel(outdir, next_lijst):
    outdir = os.path.abspath(outdir)
    blok = bron(outdir)
    if not blok:
        print('⚠ footer: geen Next-footer gevonden in de output; statische footers ongewijzigd')
        return
    with open(next_lijst, encoding='utf-8') as fh:
        van_next = {os.path.abspath(r.strip()) for r in fh if r.strip()}
    gezien = aangepast = 0
    for dp, dns, fns in os.walk(outdir):
        rel = dp[len(outdir):] + '/'
        if rel.startswith('/_next/') or rel.startswith('/en-us/'):
            dns[:] = []
            continue
        for fn in fns:
            if not fn.endswith('.html'):
                continue
            f = os.path.join(dp, fn)
            if f in van_next:
                continue
            try:
                h = open(f, encoding='utf-8').read()
            except (UnicodeDecodeError, OSError):
                continue
            gezien += 1
            nh, ch = zet(h, blok)
            if ch:
                open(f, 'w', encoding='utf-8').write(nh)
                aangepast += 1
    print(f"footer: {gezien} statische pagina's bekeken, {aangepast} kregen de footer uit Footer.tsx")


if __name__ == '__main__':
    if '--stempel' in sys.argv:
        i = sys.argv.index('--stempel')
        stempel(sys.argv[i + 1], sys.argv[i + 2])
    else:
        print(__doc__)
