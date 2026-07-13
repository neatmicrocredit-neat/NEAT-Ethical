import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zsearngwbqgcawzbraca.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  }
};

export default nextConfig;
