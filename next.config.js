/**
 * Đọc .env.local / .env tại thư mục gốc (walk-up từ cwd) và gán process.env.
 * Inline ở đây để Docker build không cần COPY scripts/ (scripts bị .dockerignore).
 */
const fs = require("fs");
const path = require("path");

(function ensureRatingDefaultProviderEnv() {
  const KEYS = [
    "RATING_DEFAULT_PROVIDER_ID",
    "DEFAULT_RATING_PROVIDER_ID",
    "NEXT_PUBLIC_DEFAULT_RATING_PROVIDER_ID",
  ];

  function findProjectRoot(start) {
    let dir = path.resolve(start);
    for (let i = 0; i < 12; i++) {
      const nextCfg =
        fs.existsSync(path.join(dir, "next.config.js")) ||
        fs.existsSync(path.join(dir, "next.config.mjs")) ||
        fs.existsSync(path.join(dir, "next.config.ts"));
      const pkg = fs.existsSync(path.join(dir, "package.json"));
      if (nextCfg && pkg) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return path.resolve(start);
  }

  function parseDotEnv(absPath) {
    if (!fs.existsSync(absPath)) return {};
    const text = fs.readFileSync(absPath, "utf8");
    const out = {};
    for (const line of text.split(/\r\n|\n|\r/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (k) out[k] = v;
    }
    return out;
  }

  const root = findProjectRoot(process.cwd());
  const files = [path.join(root, ".env.local"), path.join(root, ".env")];

  let id = null;
  for (const f of files) {
    const obj = parseDotEnv(f);
    for (const key of KEYS) {
      const raw = obj[key];
      if (raw == null || raw === "") continue;
      const s = String(raw).replace(/^\uFEFF/, "").trim();
      if (!/^\d+$/.test(s)) continue;
      const n = parseInt(s, 10);
      if (!Number.isNaN(n)) {
        id = n;
        break;
      }
    }
    if (id != null) break;
  }

  if (id == null) return;

  if (!process.env.RATING_DEFAULT_PROVIDER_ID) {
    process.env.RATING_DEFAULT_PROVIDER_ID = String(id);
  }
  if (!process.env.NEXT_PUBLIC_DEFAULT_RATING_PROVIDER_ID) {
    process.env.NEXT_PUBLIC_DEFAULT_RATING_PROVIDER_ID = String(id);
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone", // Enable standalone output for Docker
  // Optimize for faster builds
  swcMinify: true, // Use SWC minifier (faster than Terser)
  // Allow .ts files in pages/api/ for API routes, but only .js/.jsx/.tsx for regular pages
  // This prevents non-component .ts files (constants, types, request helpers) from being treated as pages
  pageExtensions: ["js", "jsx", "tsx", "ts"],
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true, // Ignore all TypeScript errors during build
  },
  // Disable source maps in production for faster build
  productionBrowserSourceMaps: false,
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
      config.externals = [...(config.externals || []), "pg", "pg-native", "pg-connection-string"];
    }
    return config;
  },
};

module.exports = nextConfig;
