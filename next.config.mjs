/**
 * basePath sættes via env var så GitHub Pages-deploy (jbmnapps.github.io/mat/)
 * virker uden at brække local dev (root). Build-job sætter NEXT_PUBLIC_BASE_PATH=/mat.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
