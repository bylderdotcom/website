/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statische export → produceert web/out/ met kant-en-klare HTML.
  // Zo blijft de output crawlbaar (SEO/GEO) en deploybaar naast de bestaande site.
  output: 'export',
  // /prijzen/ → prijzen/index.html, exact zoals de bestaande site-structuur (trailing slash).
  trailingSlash: true,
  images: { unoptimized: true },
  // web/ is de projectroot; voorkomt dat Next de repo-root kiest door de
  // meerdere lockfiles (root heeft er ook één voor stripe/anthropic).
  turbopack: { root: import.meta.dirname },
}

export default nextConfig
