// Echte deuren van Classic Next, geplaatst in woningen (foto's van Thijs, 5-11-2026). Doel: laten zien
// dat wat je in de configurator samenstelt echt gemaakt en geplaatst wordt. Direct onder de configurator,
// waar de koper twijfelt of hij een offerte aanvraagt.

const INKT = 'rgba(61,46,30,'

type Foto = { src: string; w: number; h: number; alt: string; bij: string }

// Kozijnloze deuren voorop: dat is wat de configurator maakt.
const KOZIJNLOOS: Foto[] = [
  { src: 'portfolio-kozijnloos-badkamer', w: 1334, h: 2000,
    alt: 'Kozijnloze deur vlak in een grijze wand tussen badkamer en slaapkamer; alleen een smalle naad en greep zijn zichtbaar',
    bij: 'Tussen badkamer en slaapkamer: de deur gaat op in de wand.' },
  { src: 'portfolio-gang-wit', w: 800, h: 1600,
    alt: 'Witte gang met plafondhoge kozijnloze deuren aan beide kanten en aan het eind, alleen zwarte krukken en dunne naden zichtbaar',
    bij: 'Een gang vol deuren die je pas ziet aan de kruk.' },
  { src: 'portfolio-grijs-raam', w: 1200, h: 1600,
    alt: 'Grijze kozijnloze deur in dezelfde kleur als de wand, naast een raam, met een rvs kruk',
    bij: 'In de wandkleur geschilderd: geen kozijn, geen architraaf.' },
  { src: 'portfolio-gang-grijs', w: 1200, h: 1600,
    alt: 'Kozijnloze deur aan het eind van een smalle gang, in dezelfde grijstint als de wanden',
    bij: 'Aan het eind van de gang: één vlak met de wand.' },
  { src: 'portfolio-zolder-roze', w: 1200, h: 1600,
    alt: 'Kozijnloze deur in een warme roze tint naast een inloopdouche op zolder, met messing kruk',
    bij: 'Elke RAL-kleur kan: hier warm roze, met een messing kruk.' },
  { src: 'portfolio-eiken-gang', w: 1200, h: 1600,
    alt: 'Plafondhoge kozijnloze deuren in zwart eikenfineer in een witte gang, met zwarte krukken',
    bij: 'Zwart eikenfineer, plafondhoog, met zwart beslag.' },
]

const ANDER: Foto[] = [
  { src: 'portfolio-glas-badkamer', w: 1200, h: 1600,
    alt: 'Glazen deur met geribbeld glas en een slanke bronskleurige omlijsting in een badkamer onder een schuin dak',
    bij: 'Glazen deur met geribbeld glas.' },
  { src: 'portfolio-voordeur-open', w: 1404, h: 2000,
    alt: 'Dubbele voordeur van donker eiken tot aan het plafond, met één deur open',
    bij: 'Dubbele voordeur in donker eiken.' },
]

export default function Portfolio({ marge = '46px 0 0' }: { marge?: string }) {
  return (
    <section aria-labelledby="portfolio-kop" style={{ margin: marge }}>
      <style>{'.pf-raster{grid-template-columns:repeat(3,minmax(0,1fr))}.pf-klein{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:640px){.pf-raster{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px!important}}'}</style>
      <h2 id="portfolio-kop" style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#1A1208' }}>
        Gemaakt in Uden, geplaatst in echte woningen
      </h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.65, color: `${INKT}0.75)`, margin: '0 0 16px', maxWidth: '64ch' }}>
        Wat je hierboven samenstelt, wordt op maat gemaakt in de werkplaats van Classic Next en door een vakbedrijf geplaatst.
        Zo ziet het er in een woning uit.
      </p>
      <Raster fotos={KOZIJNLOOS} min={200} />
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '24px 0 10px', color: '#1A1208' }}>Ook ander maatwerk van Classic Next</h3>
      <Raster fotos={ANDER} min={150} klein />
      <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '12px 0 0' }}>Beeld: Classic Next.</p>
    </section>
  )
}

function Raster({ fotos, klein }: { fotos: Foto[]; min?: number; klein?: boolean }) {
  return (
      <div className={klein ? 'pf-raster pf-klein' : 'pf-raster'} style={{ display: 'grid', gap: 14, maxWidth: klein ? 420 : undefined }}>
        {fotos.map(f => (
          <figure key={f.src} style={{ margin: 0 }}>
            <img src={`/img/classic-next/${f.src}.webp`}
              srcSet={`/img/classic-next/${f.src}-sm.webp 500w, /img/classic-next/${f.src}.webp 900w`}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 290px"
              alt={f.alt} width={f.w} height={f.h} loading="lazy" decoding="async"
              style={{ width: '100%', height: 'auto', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12, display: 'block', background: '#EDE6D8' }} />
            <figcaption style={{ fontSize: 13.5, lineHeight: 1.55, color: `${INKT}0.68)`, margin: '8px 0 0' }}>{f.bij}</figcaption>
          </figure>
        ))}
      </div>
  )
}
