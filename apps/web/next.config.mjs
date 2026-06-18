/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Transpile the workspace design system (ships as TS source).
  transpilePackages: ["@atlas/ui", "@atlas/contracts"],
  experimental: {
    optimizePackageImports: ["@atlas/ui"],
  },
  // Curated fitness imagery is served from Unsplash's CDN (blueprint/01 brand:
  // premium, energetic). next/image optimizes and lazy-loads them.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // Security headers (blueprint/16 - Security.md "Security Headers"). CSP is
  // intentionally conservative; it tightens as integrations are added.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
