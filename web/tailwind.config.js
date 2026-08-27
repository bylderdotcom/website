/**
 * Tailwind bij de build, in plaats van de Play-CDN.
 *
 * Tot 27-08-2026 laadde de homepage Tailwind via cdn.tailwindcss.com met
 * strategy="afterInteractive". De pagina rendert dan eerst zónder Tailwind —
 * `relative`, `overflow-hidden`, `pt-24`, `flex`, `items-center` en
 * `.container` doen op dat moment niets — en springt op zijn plek zodra de CDN
 * binnen is. Dat is het verspringen van de woningtekening in de hero. De
 * Play-CDN is bovendien uitdrukkelijk niet voor productie bedoeld.
 *
 * v3 en niet v4: de Play-CDN serveerde v3. v4 verandert defaults (o.a. de
 * container en preflight), en dit moet een verplaatsing zijn, geen herontwerp.
 *
 * theme.extend is een letterlijke kopie van TW_CONFIG in HomeClient.tsx, zodat
 * de gegenereerde CSS dezelfde klassen oplevert als wat de CDN maakte.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // De hero-markup staat als HTML-string in homeHtml.ts / homeSections.ts.
  // Tailwind scant bestanden als platte tekst, dus die .ts-bestanden moeten
  // meegenomen worden — anders mist elke klasse uit de hero.
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8', 'cream-2': '#EDE6D8', 'cream-3': '#E4DBC8',
        sand: '#C8B89A', 'sand-dark': '#9A866A',
        bark: '#3D2E1E', 'bark-2': '#5C4433', 'bark-3': '#8A7060',
        moss: '#3D5A3E', 'moss-light': '#4E7350', 'moss-bg': '#EBF0E8',
        rust: '#B85C38', 'rust-bg': '#F5EBE5', charcoal: '#1A1208',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
}
