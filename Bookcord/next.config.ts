import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Book covers are served from the project's Supabase storage bucket
    // (`book-covers`, see supabase/migrations/0002_seed.sql).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/book-covers/**",
      },
    ],
  },
};

export default nextConfig;
