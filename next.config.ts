import type { NextConfig } from "next";

const repoName = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\//, "") || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: repoName ? `/${repoName}` : undefined,
  assetPrefix: repoName ? `/${repoName}/` : undefined,
};

export default nextConfig;
