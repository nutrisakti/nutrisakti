# ── Stage 1: Build React client ───────────────────────────────────────────────
FROM --platform=linux/amd64 node:18-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps && npm install ajv@^8 --legacy-peer-deps
COPY client/ ./
RUN DISABLE_ESLINT_PLUGIN=true CI=false npm run build

# ── Stage 2: Production server ────────────────────────────────────────────────
FROM --platform=linux/amd64 node:18-alpine AS production

WORKDIR /app/server

# Install server deps first (layer cache)
COPY server/package*.json ./
RUN npm install --production

# Copy server source
COPY server/ ./

# Copy React build from stage 1 — placed where index.js expects it
COPY --from=client-build /app/client/build /app/client/build

WORKDIR /app

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/src/index.js"]
