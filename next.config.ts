import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // Supabase Storage (replace 'your-project' with your actual project ref)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Localhost (for development with Flask-served images)
      {
        protocol: "http",
        hostname: "localhost",
      },
      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Picsum
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
