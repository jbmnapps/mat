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

export const metadata: Metadata = {
  title: "FP9 Matematik",
  description: "Træn til FP9 Matematik uden hjælpemidler",
  // PWA: meta-tags for iOS hjemskærm-installation. Android læser primært
  // app/manifest.ts. apple-touch-icon kommer fra public/apple-icon.png.
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
