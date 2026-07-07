# Multi-stage Dockerfile for API Gateway

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY services/api-gateway ./
RUN pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY services/api-gateway/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
