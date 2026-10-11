// De commerciële stap van een pagina: kiest uit web/lib/aanbod.ts welke CTA bij het onderwerp
// hoort en zet er de AanbodStrook onder (alle vijf, Auping met foto). Server-component: de
// merken en kortingen komen bij de build uit data/deelnemers.json.
//
// Gebruik:  <CommercieleStap pad="kopen/sanitair/wastafel/utrecht" />
//           <CommercieleStap pad="..." alleen="stap" />   alleen de stap, zonder strook
//           <CommercieleStap pad="..." alleen="strook" />  alleen de strook

import { aanbodVoor, aantalMerken, kortingenVoor, type Aanbod } from '@/lib/aanbod'
import AanbodStrook from './AanbodStrook'
import AupingCTA from './AupingCTA'
import ConfiguratorCTA from './ConfiguratorCTA'
import GietvloerCTA from './GietvloerCTA'
import KastCTA from './KastCTA'
import VoucherCTA from './VoucherCTA'

function PlintenCTA({ aanleiding, marge }: { aanleiding: string; marge: string }) {
  return (
    <aside aria-label="Onzichtbare plinten" style={{ background: '#1A1208', borderRadius: 20, margin: marge, padding: '28px 28px 26px' }}>
      <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10 }}>Offerte · onzichtbare plinten</div>
      <h2 style={{ fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', letterSpacing: '-0.022em', textWrap: 'balance' }}>Een wand zonder lijst langs de vloer</h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 18px', maxWidth: '62ch' }}>{aanleiding}</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href="/onzichtbare-plinten/#offerte" style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>Vraag een offerte aan &rarr;</a>
        <a href="/kozijnloze-deuren/configurator/" style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14.5 }}>Ook geen kozijnen? Stel je deuren samen</a>
      </div>
    </aside>
  )
}

function Stap({ a, merken, marge }: { a: Aanbod; merken: number; marge: string }) {
  if (a.stap === 'deuren') return <ConfiguratorCTA aanleiding={a.aanleiding ?? 'Een binnendeur zonder zichtbaar kozijn, plafondhoog en vlak in de wand. Stel hem samen in 3D en vraag direct een offerte aan.'} marge={marge} />
  if (a.stap === 'gietvloer') return <GietvloerCTA aanleiding={a.aanleiding ?? 'Upload een foto van een gietvloer die je mooi vindt. Wij lezen de kleur, je kiest de ruimtes en je krijgt tot drie stalen gratis thuis.'} marge={marge} />
  if (a.stap === 'kast') return <KastCTA aanleiding={a.aanleiding ?? 'Begin vanaf een voorbeeldfoto, zie je kast in 3D en vraag een offerte aan bij een timmerbedrijf.'} marge={marge} />
  if (a.stap === 'plinten') return <PlintenCTA aanleiding={a.aanleiding ?? 'Een onzichtbare plint gaat vóór de stukadoor de wand in. Vraag de offerte aan voordat het stucwerk is ingepland.'} marge={marge} />
  if (a.stap === 'auping') return <AupingCTA aanleiding={a.aanleiding} marge={marge} />
  const lijst = kortingenVoor(a.categorieen)
  return (
    <VoucherCTA merken={merken} lijst={lijst} marge={marge}
      titel={a.titel ?? `Korting bij ${merken} merken, met een gratis account`}
      aanleiding={a.aanleiding ?? `Met een gratis Bylder-account krijg je ledenkorting bij ${merken} merken. Deze passen bij dit onderwerp:`} />
  )
}

export default function CommercieleStap({
  pad, alleen, marge = '36px 0',
}: { pad: string; alleen?: 'stap' | 'strook'; marge?: string }) {
  const a = aanbodVoor(pad) ?? { stap: 'auping' as const }
  const merken = aantalMerken()
  return (
    <>
      {alleen !== 'strook' && <Stap a={a} merken={merken} marge={marge} />}
      {alleen !== 'stap' && <AanbodStrook merken={merken} titel="Meer regelen via Bylder" marge={marge} />}
    </>
  )
}
