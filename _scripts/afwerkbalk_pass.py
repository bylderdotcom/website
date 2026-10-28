#!/usr/bin/env python3
"""Zet de balk "Bylder als aannemer" boven de footer van elke statische pagina (28-10-2026).

Besluit Daniel: elk bezoek moet weten dat Bylder de hele afwerking van een nieuwbouwwoning
kan aannemen. De Next-pagina's krijgen de balk uit web/app/components/Footer.tsx; dit script
doet hetzelfde voor de statische pagina's, in de build-output (web/build.sh), zoals het menu.
De balk zelf staat op één plek: web/app/components/afwerkbalk.html.

Regels: alleen pagina's met een <footer>, niet de Next-pagina's (lijst van build.sh), niet
/en-us/ (andere markt). Idempotent: een bestaande balk tussen de markeringen wordt vervangen.

Gebruik: afwerkbalk_pass.py --stempel <outdir> <lijst-met-next-html>
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BALK = open(os.path.join(ROOT, 'web', 'app', 'components', 'afwerkbalk.html'), encoding='utf-8').read().strip()
OUD = re.compile(r'<!--bylder:afwerkbalk-->.*?<!--/bylder:afwerkbalk-->', re.S)


def zet(h):
    if '<footer' not in h:
        return h, False
    if '<!--bylder:afwerkbalk-->' in h:
        nh = OUD.sub(lambda _: BALK, h, count=1)
        return nh, nh != h
    i = h.index('<footer')
    return h[:i] + BALK + '\n' + h[i:], True


def stempel(outdir, next_lijst):
    outdir = os.path.abspath(outdir)
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
            nh, ch = zet(h)
            if ch:
                open(f, 'w', encoding='utf-8').write(nh)
                aangepast += 1
    print(f'afwerkbalk: {gezien} statische pagina\'s bekeken, {aangepast} bijgewerkt')


if __name__ == '__main__':
    if '--stempel' in sys.argv:
        i = sys.argv.index('--stempel')
        stempel(sys.argv[i + 1], sys.argv[i + 2])
    else:
        print(__doc__)
