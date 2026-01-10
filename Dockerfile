# Stage 1: Build
FROM node:22-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build argument for Gemini API key (needed at build time for Vite)
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build TypeScript and React frontend (API key is baked into frontend bundle)
RUN npm run build

# Bundle server with esbuild (handles TypeScript and module bundling)
# Banner injects __dirPath for path resolution in CJS
RUN npx esbuild server/index.ts --bundle --platform=node --target=node22 --outfile=server-dist/index.cjs --external:better-sqlite3 --format=cjs --banner:js="const __dirPath = __dirname;"

# Stage 2: Production
FROM node:22-alpine AS runtime

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Rebuild better-sqlite3 for this environment
RUN npm rebuild better-sqlite3

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy compiled server code
COPY --from=builder /app/server-dist ./server

# Create data directory for SQLite
RUN mkdir -p data

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/monitor/status || exit 1

# Start the server
CMD ["node", "server/index.cjs"]
