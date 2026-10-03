# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S studylm && adduser -S studylm -G studylm

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

USER studylm

EXPOSE 5000

CMD ["node", "src/server.js"]
