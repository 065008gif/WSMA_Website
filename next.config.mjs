/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // /compare always opens on the default pair from the brief.
  async redirects() {
    return [{ source: '/compare', destination: '/compare/india-vs-japan', permanent: false }];
  },
  // The font used by the Open Graph images lives outside /public, so make sure
  // Vercel bundles it with the image routes.
  outputFileTracingIncludes: { '/**/opengraph-image': ['./assets/fonts/*'] },
};
export default nextConfig;
