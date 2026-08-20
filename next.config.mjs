/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the app has no server routes, no API handlers and no server
  // actions, and Capacitor ships the built `out/` directory inside the iOS app
  // bundle. This is also what lets the PWA be served from any static host.
  output: 'export',
  images: {
    unoptimized: true, // no Image Optimization server exists in a static export
  },
}

export default nextConfig
