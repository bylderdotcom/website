import type { Metadata } from 'next'
import MandInhoud from './MandInhoud'
import { S } from '../stijl'

// Het winkelmandje (1-11-2026). Persoonlijk, dus niet in Google.
export const metadata: Metadata = {
  title: 'Je mandje | Bylder',
  robots: { index: false, follow: true },
}

export default function Pagina() {
  return (
    <main style={S.main}>
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › Je mandje</nav>
      <h1 style={S.h1}>Je mandje</h1>
      <MandInhoud />
    </main>
  )
}
