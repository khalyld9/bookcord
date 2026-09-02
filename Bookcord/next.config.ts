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

export default nextConfig;
