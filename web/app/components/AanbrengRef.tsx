'use client'

import { useEffect } from 'react'
import { legRefVast, metRef } from './aanbreng'

// Op elke pagina: een ?ref= uit het adres vastleggen, en een klik op een link naar
// app.bylder.com de ref laten meenemen. Rendert niets. Zie ./aanbreng.ts.
export default function AanbrengRef() {
  useEffect(() => {
    try { legRefVast(new URLSearchParams(window.location.search).get('ref')) } catch { /* oude browser */ }
    const klik = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (a && /^https:\/\/app\.bylder\.com\//.test(a.href)) a.href = metRef(a.href)
    }
    document.addEventListener('click', klik, true)
    document.addEventListener('auxclick', klik, true)
    return () => { document.removeEventListener('click', klik, true); document.removeEventListener('auxclick', klik, true) }
  }, [])
  return null
}
