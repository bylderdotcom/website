// De Auping-voucher als venster met foto, in dezelfde vorm als KastCTA en ConfiguratorCTA.
// Wens Daniel (11-10-2026): Auping overal tonen zoals op de homepage, mét het beeld van het
// bed. Zelfde foto als de bovenste rij van het merkenblok op de homepage (HomeHeld.tsx).
//
// Voorwaarden zoals op /vouchers/auping/: 10% op het reguliere assortiment bij vier winkels,
// niet bovenop een sale; gratis leenbed vanaf €5.000.

export default function AupingCTA({
  aanleiding = 'Met een gratis Bylder-account krijg je 10% korting op het reguliere Auping-assortiment, en vanaf €5.000 een gratis leenbed zolang je nieuwe bed wordt gemaakt.',
  titel = 'Auping: 10% korting en een gratis leenbed',
  label = 'Voucher · Auping',
  marge = '44px 0',
}: { aanleiding?: string; titel?: string; label?: string; marge?: string }) {
  return (
    <aside aria-label="Auping-voucher" style={{
      background: '#1A1208', borderRadius: 20, margin: marge, overflow: 'hidden',
      display: 'grid', alignItems: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
    }}>
      <div style={{ padding: '28px 28px 26px' }}>
        <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10 }}>{label}</div>
        <h2 style={{ fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', letterSpacing: '-0.022em', textWrap: 'balance' }}>{titel}</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 16px', maxWidth: '56ch' }}>{aanleiding}</p>
        <a href="/vouchers/auping/" style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>Bekijk het Auping-voordeel &rarr;</a>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(245,240,232,0.6)', margin: '12px 0 0' }}>
          Bij Auping Rotterdam, Den Haag, Zoetermeer en Leidschendam. Niet bovenop een lopende actie.
        </p>
      </div>
      <a href="/vouchers/auping/" tabIndex={-1} aria-hidden="true" style={{ display: 'block', padding: '4px 22px 22px' }}>
        <img src="/img/auping-noble-solid-oak.webp"
          srcSet="/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w"
          sizes="(max-width: 900px) 100vw, 520px" alt="" width={1000} height={1000} loading="lazy" decoding="async"
          style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }} />
      </a>
    </aside>
  )
}
