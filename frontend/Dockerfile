# syntax=docker/dockerfile:1

############################
# 1) Build stage (Vite)
############################
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

ARG BUILD_MODE=production
ARG VITE_API_BASE_URL
ARG VITE_SENTRY_DSN
ARG VITE_ANALYTICS_TOKEN
ARG VITE_PUBLIC_FLAG

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN} \
    VITE_ANALYTICS_TOKEN=${VITE_ANALYTICS_TOKEN} \
    VITE_PUBLIC_FLAG=${VITE_PUBLIC_FLAG}

RUN npm run build -- --mode=${BUILD_MODE}

############################
# 2) Runtime stage (Nginx)
############################
FROM nginx:1.27-alpine

# nginx.conf 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]