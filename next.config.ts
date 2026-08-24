import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://ai-fitness-app-ten.vercel.app/language",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
