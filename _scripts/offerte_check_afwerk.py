"""Zet op de offerte-checkpagina's het blok "Of laat Bylder het doen" (besluit Daniel, 28-10-2026).

Bylder neemt de afwerking van nieuwbouwwoningen aan (regio Den Bosch). Wie een offerte van een
stukadoor, schilder of tegelzetter laat checken, zit precies in die fase. Idempotent: het blok staat
tussen <!--bylder:afwerk--> en <!--/bylder:afwerk--> en wordt bij opnieuw draaien vervangen.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
# vak -> (onderdeel op /nieuwbouw-afwerken/, wat in de zin)
VAKKEN = {
    'stukadoor': ('stucwerk', 'stucwerk'),
    'schilder': ('schilderwerk', 'schilderwerk'),
    'badkamer': ('sanitair', 'je badkamer'),
    'loodgieter': ('sanitair', 'je badkamer en sanitair'),
    'gietvloer': ('vloeren', 'je gietvloer'),
    'aannemer': ('', 'je afwerking'),
}

def blok(onderdeel: str, wat: str) -> str:
    href = f'/nieuwbouw-afwerken/{onderdeel}/' if onderdeel else '/nieuwbouw-afwerken/'
    return f'''<!--bylder:afwerk-->
<aside aria-label="Je hele afwerking door Bylder" style="margin:8px 0 32px;background:#3D5A3E;color:#F5F0E8;border-radius:18px;padding:22px 24px;max-width:860px">
  <p style="font-family:'Space Mono',monospace;font-size:11.5px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:#E8D9B8;margin:0 0 8px">Bylder als aannemer · regio Den Bosch</p>
  <p style="font-size:1.3rem;font-weight:800;line-height:1.25;margin:0 0 8px;color:#F5F0E8">Te duur, of geen zin in losse offertes? Laat Bylder {wat} doen.</p>
  <p style="font-size:15px;line-height:1.65;margin:0 0 16px;color:rgba(245,240,232,0.85);max-width:64ch">Bij een nieuwbouwwoning maken wij zelf één offerte voor stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten, uit je eigen tekening. Die toetsen we net zo streng aan de marktprijzen als jouw offerte hier.</p>
  <a href="{href}" onclick="window.gtag&&gtag('event','afwerk_klik',{{plek:'offerte-check',pagina:location.pathname}})" style="display:inline-block;background:#F5F0E8;color:#1A1208;border-radius:11px;padding:12px 22px;font-weight:800;font-size:15px;text-decoration:none">Vraag een offerte aan &rarr;</a>
</aside>
<!--/bylder:afwerk-->
'''

def zet(pad: pathlib.Path, html: str, nieuw: str, voor: str) -> str:
    html = re.sub(r'<!--bylder:afwerk-->[\s\S]*?<!--/bylder:afwerk-->\n?', '', html)
    i = html.find(voor)
    if i < 0:
        raise SystemExit(f'ankerpunt niet gevonden in {pad}')
    regel = html.rfind('\n', 0, i) + 1
    return html[:regel] + nieuw + html[regel:]

def main():
    # overzicht: onder het raster met de vakken
    p = ROOT / 'offerte-check' / 'index.html'
    h = p.read_text(encoding='utf-8')
    i = h.index('<div class="grid">')
    einde = h.index('\n', i) + 1
    h = re.sub(r'<!--bylder:afwerk-->[\s\S]*?<!--/bylder:afwerk-->\n?', '', h)
    i = h.index('<div class="grid">'); einde = h.index('\n', i) + 1
    p.write_text(h[:einde] + blok('', 'je afwerking') + h[einde:], encoding='utf-8')
    for vak, (onderdeel, wat) in VAKKEN.items():
        p = ROOT / 'offerte-check' / vak / 'index.html'
        if not p.exists():
            continue
        p.write_text(zet(p, p.read_text(encoding='utf-8'), blok(onderdeel, wat), 'Kies je gemeente'), encoding='utf-8')
        print('gezet:', p.relative_to(ROOT))

if __name__ == '__main__':
    main()
