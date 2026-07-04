import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bylder.com'),
}

// Minimale root-layout voor Fase 0. In Fase 1 komt hier de gedeelde chrome
// (Nav/Footer/SEO-head) als componenten — de kern van "menu op één plek".
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
