const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/QrisSound' : ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}
export default nextConfig

