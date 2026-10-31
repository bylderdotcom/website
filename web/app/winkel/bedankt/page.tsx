import type { Metadata } from 'next'
import Status from './Status'
import { S } from '../stijl'

// Terugkeer na de iDEAL-betaling (31-10-2026). Persoonlijk, dus niet in Google.
export const metadata: Metadata = {
  title: 'Je bestelling | Bylder',
  robots: { index: false, follow: false },
}

export default function Pagina() {
  return (
    <main style={{ ...S.main, maxWidth: 720 }}>
      <p style={S.oog}>Bylder-winkel</p>
      <Status />
    </main>
  )
}
