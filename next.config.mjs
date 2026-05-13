/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // required for static export (Capacitor / PWA)
  },
}

export default nextConfig
