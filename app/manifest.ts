/**
 * Web App Manifest — gør det muligt at "installere" appen på hjemskærmen
 * og åbne i fuldskærm uden browser-bar.
 *
 * iOS Safari: bruger kun delvist denne fil — Apple-specifikke meta-tags i
 * layout.tsx (apple-touch-icon, apple-mobile-web-app-capable) er det vigtigste.
 *
 * Android Chrome: bruger denne fil fuldt ud, viser "Install app"-prompt
 * automatisk efter brugerens 2. besøg hvis kriterierne er opfyldt.
 *
 * basePath-håndtering: Next.js metadata-API'et prefixer ikke automatisk
 * `src`-stier i icons-arrayet — vi prefixer manuelt for at fungere både i
 * lokal dev (basePath='') og i prod (basePath='/mat').
 */

import type { MetadataRoute } from 'next';

// Krav for static export (output: 'export') i next.config.mjs
export const dynamic = 'force-static';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FP9 Matematik',
    short_name: 'FP9 Matematik',
    description: 'Træn til FP9 Matematik uden hjælpemidler',
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    lang: 'da',
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
