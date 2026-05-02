import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${inter.variable} ${quicksand.variable}`}>
      <head>
        {/*
          Auto-reload når et chunk 404'er. Sker fordi browser har cache'et HTML
          fra en tidligere deploy der refererer til chunk-navne der ikke længere
          findes på serveren. sessionStorage-flag forhindrer reload-loops hvis
          chunken faktisk er broken.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
