#!/usr/bin/env python3
"""Wekelijkse ronde voor de gids met vakbedrijven (besluit Daniel, 9-11-2026).

  1. Bedrijven die zich zelf aanmeldden en die Daniel in de app goedkeurde ("Zet in de gids",
     app /admin/aanmeldingen → vakbedrijven met bron 'aanmelding') komen op de site.
  2. Bedrijven met opt_out (verwijderverzoek, of door ons uitgezet) gaan van de site af.

WAAROM. De gids is gegenereerde data in deze repo; zonder ronde bleef een verwijderd bedrijf
staan (Jacobs daken: 19 dagen) en kwam een aanmelding nooit online. Werkt alleen met
scripts/profiel_toevoegen.py en scripts/profiel_verwijderen.py.

CONTROLES (zoals de andere rondes die zelf naar main gaan): hooguit MAX_NIEUW nieuwe en
MAX_WEG verwijderde profielen per ronde. Meer = de uitkomst gaat op een tak met een issue,
want zoveel tegelijk wijst op een fout in de bron, niet op een gewone week.

Omgeving: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (repo-secrets).
Schrijft reports/vakbedrijven-ronde.md en, in GitHub Actions, de uitvoer ok/nieuw/weg/geweigerd.
"""
import json
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from profiel_toevoegen import voeg_toe  # noqa: E402
from profiel_verwijderen import clusters, verwijder  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_NIEUW = 25
MAX_WEG = 40


def ophalen(filter_, velden):
    base = os.environ['SUPABASE_URL'].rstrip('/') + '/rest/v1/vakbedrijven'
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    rijen, offset = [], 0
    while True:
        q = f'{base}?select={velden}&{filter_}&order=slug&limit=1000&offset={offset}'
        req = urllib.request.Request(q, headers={'apikey': key, 'Authorization': f'Bearer {key}'})
        with urllib.request.urlopen(req, timeout=60) as r:
            deel = json.load(r)
        rijen += deel
        if len(deel) < 1000:
            return rijen
        offset += 1000


def main():
    aanmeldingen = ophalen('bron=eq.aanmelding&opt_out=eq.false',
                           'slug,naam,vak,stad,website,telefoon,email,claim_email,werkspot_url,status,opt_out,bron')
    uit = ophalen('opt_out=eq.true', 'slug,vak')

    op_site = {vak: set(json.load(open(os.path.join(cdir, 'bedrijven.json')))) for vak, cdir in clusters()}
    doelen = set()
    for r in uit:
        vak, slug = r.get('vak'), r.get('slug') or ''
        if vak in op_site and slug.startswith(vak + '-'):
            key = 'bedrijf/' + slug[len(vak) + 1:]
            if key in op_site[vak]:
                doelen.add((vak, key))
    nieuw_kandidaten = [r for r in aanmeldingen if r.get('vak') in op_site
                        and 'bedrijf/' + (r.get('slug') or '')[len(r['vak']) + 1:] not in op_site[r['vak']]]
    geen_gids = [f'{r.get("naam")}: vak "{r.get("vak")}" heeft geen gids' for r in aanmeldingen if r.get('vak') not in op_site]

    ok = len(nieuw_kandidaten) <= MAX_NIEUW and len(doelen) <= MAX_WEG
    weg = verwijder(doelen)
    nieuw, geweigerd = [], list(geen_gids)
    for r in nieuw_kandidaten:
        gelukt, regel = voeg_toe(r)
        (nieuw if gelukt else geweigerd).append(regel)

    regels = ['# Ronde vakbedrijven', '']
    if not ok:
        regels += [f'**Niet naar main:** {len(nieuw_kandidaten)} nieuw (max {MAX_NIEUW}) en {len(doelen)} weg (max {MAX_WEG}). '
                   'Kijk de tak na en merge hem als het klopt.', '']
    regels += [f'## Nieuw op de site ({len(nieuw)})', *(f'- {x}' for x in nieuw or ['niets']), '',
               f'## Van de site af ({len(weg)})', *(f'- {x}' for x in weg or ['niets']), '']
    if geweigerd:
        regels += [f'## Niet geplaatst ({len(geweigerd)})',
                   'Deze aanmeldingen staan in de app als goedgekeurd, maar konden niet op de site. Zet ze in de app '
                   'onder een ander vak of een plaats met een pagina, of laat het bedrijf weten waarom niet.', '',
                   *(f'- {x}' for x in geweigerd), '']
    os.makedirs(os.path.join(REPO, 'reports'), exist_ok=True)
    open(os.path.join(REPO, 'reports/vakbedrijven-ronde.md'), 'w').write('\n'.join(regels))
    print('\n'.join(regels))

    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
            f.write(f'ok={"ja" if ok else "nee"}\nnieuw={len(nieuw)}\nweg={len(weg)}\ngeweigerd={len(geweigerd)}\n')


if __name__ == '__main__':
    main()
