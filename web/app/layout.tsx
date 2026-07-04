import type { Metadata } from 'next'
import Nav from './components/Nav'
import Footer from './components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bylder.com'),
}

// Root-layout = de gedeelde chrome op één plek. Elke Next-route krijgt
// automatisch dezelfde Nav + Footer — dé "menu op één plek"-winst van Fase 1.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, background: '#F5F0E8', fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
