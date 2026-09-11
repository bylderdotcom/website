// Verwijzing naar de deurconfigurator — als venster, niet als knop.
//
// De configurator was een eiland: hij stond nergens waar iemand hem tegenkomt.
// Daarna stond hij er wel, maar als donkere balk met één knop, halverwege of
// onder de vouw (Daniel, 11-09-2026: "onder de fold een onopvallende button").
// Nu is het een venster met de configurator zelf erin: een echte schermafbeelding
// van een deur in RAL 6009 naast het kleurenraster. Wie het ziet, ziet meteen wat
// het ding doet, en de knop staat boven het beeld zodat hij op een telefoon vroeg
// in beeld komt.
//
// Per pagina een eigen aanleiding: dezelfde zin op vier pagina's leest als een
// banner en wordt overgeslagen.
//
// Het beeld: web/public/img/configurator/configurator-voorbeeld(-sm).jpg,
// gemaakt van /kozijnloze-deuren/configurator/?deuren=shadow~gelakt~6009~~licht~binnen~links~~~~~
// Verandert de configurator zichtbaar, maak dan een nieuwe.

const CONFIGURATOR = '/kozijnloze-deuren/configurator/'

export default function ConfiguratorCTA({
  aanleiding,
  titel = 'Stel je deur samen en vraag direct een offerte aan',
  marge = '44px 0',
  vroeg = false,
}: {
  aanleiding: string
  titel?: string
  marge?: string
  // Staat het venster in het eerste scherm, laad het beeld dan meteen.
  vroeg?: boolean
}) {
  return (
    <aside aria-label="Configurator voor kozijnloze deuren" style={{
      background: '#1A1208', borderRadius: 20, margin: marge, overflow: 'hidden',
      display: 'grid', alignItems: 'center',
      // Twee kolommen pas vanaf ~1000px containerbreedte; in een smallere kolom
      // (de artikelpagina's zijn 860px) staat het venster op volle breedte onder
      // de tekst, anders is de configurator erin te klein om te lezen.
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
    }}>
      <div style={{ padding: '28px 28px 26px' }}>
        <div style={{
          fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10,
        }}>Configurator &middot; offerte</div>
        <h2 style={{
          fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px',
          letterSpacing: '-0.022em', textWrap: 'balance',
        }}>{titel}</h2>
        <p style={{
          fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 16px',
          maxWidth: '56ch',
        }}>{aanleiding}</p>
        <a href={CONFIGURATOR} style={{
          display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800,
          fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none',
        }}>Stel je deur samen &rarr;</a>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(245,240,232,0.6)', margin: '12px 0 0' }}>
          Je krijgt een sluitende specificatie, en wij komen met een offerte terug.
        </p>
        <ul aria-label="Wat je kiest" style={{
          listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {['13 groefpatronen', 'Elke RAL-kleur', 'Altijd plafondhoog', 'Deur en wand in één kleur'].map(t => (
            <li key={t} style={{
              fontSize: 13, fontWeight: 700, color: '#F5F0E8', border: '1px solid rgba(245,240,232,0.25)',
              borderRadius: 999, padding: '5px 12px',
            }}>{t}</li>
          ))}
        </ul>
      </div>

      {/* Het venster: een schermafbeelding van de configurator in een kaal
          vensterkader. Klikbaar, maar met tabIndex -1: de knop hierboven is de
          toegankelijke route, dit is dezelfde link nog eens voor wie op het
          beeld klikt. */}
      <a href={CONFIGURATOR} tabIndex={-1} aria-hidden="true" style={{
        display: 'block', padding: '4px 22px 22px', textDecoration: 'none',
      }}>
        <div style={{
          background: '#F5F0E8', borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px',
            borderBottom: '1px solid rgba(61,46,30,0.1)', background: '#EDE6D8',
          }}>
            {['#D9CFBF', '#D9CFBF', '#D9CFBF'].map((c, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: c, display: 'block' }} />
            ))}
            <span style={{
              marginLeft: 10, fontSize: 11.5, color: 'rgba(61,46,30,0.6)', background: '#F5F0E8',
              borderRadius: 6, padding: '3px 10px', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', minWidth: 0,
            }}>bylder.com/kozijnloze-deuren/configurator</span>
          </div>
          <img
            src="/img/configurator/configurator-voorbeeld.jpg"
            srcSet="/img/configurator/configurator-voorbeeld-sm.jpg 640w, /img/configurator/configurator-voorbeeld.jpg 1200w"
            sizes="(max-width: 900px) 100vw, 600px"
            alt="" width={1200} height={530} loading={vroeg ? 'eager' : 'lazy'} decoding="async"
            style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      </a>
    </aside>
  )
}

export const CTA_STIJL = { INKT: 'rgba(61,46,30,', GROEN: '#3D5A3E' }
