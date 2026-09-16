# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies if needed (e.g. for argon2 native compilation)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for native modules
RUN apk add --no-cache libstdc++

# Copy built application and production modules
COPY --from=builder /app /app

# Prune dev dependencies for lean footprint
RUN npm prune --production

# Create non-root user and group
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Create invoices directory and set permissions
RUN mkdir -p /app/invoices && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
