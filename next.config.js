/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',  // Enable standalone output for Docker
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,  // Ignore all TypeScript errors during build
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client bundle from trying to polyfill Node built-ins
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
      // Ensure server-only packages are not bundled on the client
      config.externals = [
        ...(config.externals || []),
        "pg",
        "pg-native",
        "pg-connection-string",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
