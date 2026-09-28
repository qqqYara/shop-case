import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: [path.join(__dirname, "src")],
  },
};

export default nextConfig;
