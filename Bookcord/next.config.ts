import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Book covers and profile pictures are served from the project's
    // Supabase storage buckets (`book-covers` + `avatars`; the avatars
    // bucket is created by supabase/migrations/0005_reservations_avatars.sql).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/book-covers/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
};

// The sandboxed live preview is proxied under https://{port}-{id}.e2b.app;
// only when developing inside that sandbox do we allow it to reach dev-only
// resources (HMR, error overlays). Kept out of production builds entirely —
// Vercel deployments must never ship this.
if (process.env.ALLOW_E2B_DEV_ORIGINS === "1") {
  nextConfig.allowedDevOrigins = ["*.e2b.app", "**.e2b.app"];
}

export default nextConfig;
