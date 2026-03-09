import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Geliştirme modunda output: export devre dışı (dinamik routing için)
  // Production build için tekrar aktif edilecek
  // output: "export",
  trailingSlash: true,
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
