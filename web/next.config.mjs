/** @type {import('next').NextConfig} */
// For GitHub Pages (project site) set NEXT_PUBLIC_BASE_PATH=/<repo>, e.g. /novel-rag.
// Left empty for local dev (npm run dev) so everything serves from "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",              // static HTML export -> ./out (deployable to any static host)
  images: { unoptimized: true }, // no server-side image optimization on static hosts
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  trailingSlash: true,
};

export default nextConfig;
