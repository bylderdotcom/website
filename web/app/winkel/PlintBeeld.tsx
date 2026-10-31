import { GROEN } from './stijl'

/** Doorsnede onderaan de wand: het aluminium profiel zit in de wand, de plint valt erin, vlak met het stucwerk. */
export default function PlintBeeld({ hoogte = 46 }: { hoogte?: number }) {
  const h = 30 + hoogte * 0.9
  return (
    <svg viewBox="0 0 500 300" width="100%" role="img" style={{ display: "block", maxWidth: 520 }}
      aria-label={`Doorsnede: aluminium profiel in de wand met een plint van ${hoogte} mm erin, vlak met het stucwerk, boven de vloer`}>
      <defs>
        <pattern id="pb-steen" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={GROEN} strokeWidth="0.8" opacity="0.3" />
        </pattern>
      </defs>
      <rect x="60" y="20" width="130" height="230" fill="url(#pb-steen)" stroke={GROEN} strokeWidth="1.6" />
      <rect x="190" y="20" width="16" height={230 - h} fill="#EDE7DC" stroke={GROEN} strokeWidth="1.2" />
      <path d={`M172 ${250 - h} h34 v${h - 6} h-34 z`} fill="#C9CDD1" stroke="#5E6670" strokeWidth="1.4" />
      <rect x="190" y={254 - h} width="16" height={h - 14} fill="#F7F3EA" stroke="#8A7A62" strokeWidth="1.2" />
      <rect x="40" y="252" width="420" height="22" fill="#D9CDB6" stroke={GROEN} strokeWidth="1.2" />
      <line x1="206" y1={254 - h} x2="300" y2={254 - h - 30} stroke="#B85C38" strokeWidth="1" />
      <text x="304" y={254 - h - 32} fontSize="12" fontFamily="Space Mono, monospace" fill="#1A1208">plint, vlak met de wand</text>
      <line x1="180" y1={250 - h / 2} x2="300" y2={200} stroke="#B85C38" strokeWidth="1" />
      <text x="304" y="204" fontSize="12" fontFamily="Space Mono, monospace" fill="#1A1208">aluminium profiel</text>
      <line x1="198" y1="60" x2="300" y2="60" stroke="#B85C38" strokeWidth="1" />
      <text x="304" y="64" fontSize="12" fontFamily="Space Mono, monospace" fill="#1A1208">stucwerk</text>
      <text x="304" y="268" fontSize="12" fontFamily="Space Mono, monospace" fill="#1A1208">vloer</text>
    </svg>
  )
}
