import type { Metadata, Viewport } from "next";
import { Inter, Quicksand } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
  weight: ["500", "600", "700"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const liveUrl = "https://jbmnapps.github.io/mat";
const previewImageUrl = `${liveUrl}/share-preview-v2.png`;
const assetPath = (path: string) => `${basePath}${path}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://jbmnapps.github.io"),
  title: "FP9 Matematik",
  description: "Træn til FP9 Matematik uden hjælpemidler",
  alternates: {
    canonical: liveUrl,
  },
  icons: {
    icon: [
      {
        url: assetPath("/favicon.ico"),
        sizes: "any",
      },
      {
        url: assetPath("/favicon-32.png"),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: assetPath("/favicon-16.png"),
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: assetPath("/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: assetPath("/favicon-32.png"),
        type: "image/png",
      },
    ],
    apple: [
      {
        url: assetPath("/apple-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "FP9 Matematik",
    description: "Træn til FP9 Matematik uden hjælpemidler",
    url: liveUrl,
    siteName: "FP9 Matematik",
    locale: "da_DK",
    type: "website",
    images: [
      {
        url: previewImageUrl,
        width: 1024,
        height: 1024,
        alt: "FP9 Matematik",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FP9 Matematik",
    description: "Træn til FP9 Matematik uden hjælpemidler",
    images: [previewImageUrl],
  },
  // PWA: tillad iOS at åbne appen i fullscreen når eleven har tilføjet den
  // til hjemmeskærmen ("Add to Home Screen" → ikon åbner uden Safari-chrome).
  // Android Chrome læser primært app/manifest.ts; apple-touch-icon kommer fra
  // public/apple-icon.png.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FP9 Matematik",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Forhindrer iOS' automatiske zoom på input-fokus (font-size ≥ 16px gør det samme,
  // men dette er en sikker garanti for hele appen).
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // Browser chrome-farve (Android Chrome address bar, splash screen)
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${inter.variable} ${quicksand.variable}`}>
      <body>
        {/*
          Auto-reload når et chunk 404'er. Sker fordi browser har cache'et HTML
          fra en tidligere deploy der refererer til chunk-navne der ikke længere
          findes på serveren. sessionStorage-flag forhindrer reload-loops hvis
          chunken faktisk er broken.
          Ligger i <body> via next/script — manuel <head> bryder rendering på iOS Safari.
        */}
        <Script id="chunk-cache-reload" strategy="beforeInteractive">
          {`
            (function () {
              function looksLikeChunkError(msg) {
                return msg && (/Loading chunk/.test(msg) || /ChunkLoadError/.test(msg));
              }
              function maybeReload(msg) {
                if (!looksLikeChunkError(msg)) return;
                try {
                  if (sessionStorage.getItem('chunkReloaded')) return;
                  sessionStorage.setItem('chunkReloaded', '1');
                  window.location.reload();
                } catch (e) {}
              }
              window.addEventListener('error', function (e) {
                maybeReload((e.error && e.error.message) || e.message);
              });
              window.addEventListener('unhandledrejection', function (e) {
                var r = e.reason;
                maybeReload((r && r.message) || (typeof r === 'string' ? r : ''));
              });
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
