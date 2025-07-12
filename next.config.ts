// next.config.js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Not recommended for production
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
