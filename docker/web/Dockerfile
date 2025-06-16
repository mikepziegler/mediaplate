# 1. Build angular app with the respective directory of the artifact
FROM node:20-alpine AS builder

ARG APP_DIR
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build --workspace=${APP_DIR} --configuration=production

# 2. Runtime angular app with nginx as reverse proxy
FROM nginx:alpine

COPY --from=builder /app/dist/${APP_DIR} /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
