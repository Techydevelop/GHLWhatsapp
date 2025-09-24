/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.vercel.app', '*.render.com', '*.railway.app'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Ensure proper dynamic rendering for auth pages
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Disable static optimization
  output: 'standalone',
  // Force dynamic rendering
  generateStaticParams: false,
}

module.exports = nextConfig
