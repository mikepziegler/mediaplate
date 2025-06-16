# 1. Build nestjs app
FROM node:20-alpine AS builder

WORKDIR /app
COPY . .

RUN npm install -g @nestjs/cli && npm ci
RUN npm run build --workspace=api

# 2. Runtime nestjs
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["node", "dist/main.js"]
