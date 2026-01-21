# Dockerfile for Next.js application
# Optimized with standalone output for faster builds and smaller images

# Stage 1: Builder (needs all dependencies for build)
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for build)
# Use cache mount to speed up rebuilds
# Try npm ci first (faster and more reliable), fallback to npm install if lock file is out of sync
RUN --mount=type=cache,target=/root/.npm \
    (npm ci --legacy-peer-deps --no-audit --loglevel=error || \
     npm install --legacy-peer-deps --no-audit --loglevel=error) && \
    npm cache clean --force

# Copy source code (only what's needed for build)
# Using .dockerignore to exclude large files
COPY next.config.js ./
COPY tsconfig.json ./
COPY postcss.config.js ./
COPY src ./src
# Only copy essential public files (exclude uploads via .dockerignore)
COPY public ./public

# Set environment variables for build (optimized for speed)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
# Disable source maps in production for faster build and smaller size
ENV GENERATE_SOURCEMAP=false
# Use SWC minify (faster than Terser)
ENV SWC_MINIFY=true

# Build the application with standalone output
# Use cache mount for .next to speed up rebuilds
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# Stage 3: Runner (using standalone output - much smaller and faster)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes .next, node_modules, and server.js)
# Standalone only includes production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy only essential public files (uploads should be mounted as volume)
# Exclude uploads directory to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Remove any uploads that might have been copied (they should be in volume)
RUN rm -rf ./public/uploads/* || true

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using standalone server
CMD ["node", "server.js"]