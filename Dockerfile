FROM oven/bun:1.2.19-alpine AS builder
WORKDIR /app

COPY ./package.json ./bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1.2.19-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S copilot && \
    adduser -S copilot -u 1001 -G copilot && \
    mkdir -p /home/copilot/.local/share/copilot-api && \
    chown -R copilot:copilot /home/copilot

COPY ./package.json ./bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts --no-cache

COPY --from=builder /app/dist ./dist

# Copy and set up entrypoint script with proper permissions
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership of app directory
RUN chown -R copilot:copilot /app

# Switch to non-root user
USER copilot

EXPOSE 4141

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:4141/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
