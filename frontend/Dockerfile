# syntax=docker/dockerfile:1

############################
# 1) Build stage (Vite)
############################
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 메타 먼저 복사 → 캐시 최대화
COPY package*.json ./
RUN npm ci || npm install

# 앱 소스 복사
COPY . .

# 빌드 모드 & 선택적 VITE_* 빌드 인자
ARG BUILD_MODE=production
ARG VITE_API_BASE_URL
ARG VITE_SENTRY_DSN
ARG VITE_ANALYTICS_TOKEN
ARG VITE_PUBLIC_FLAG

# Vite가 build 시점에 읽도록 환경변수로 노출
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_ANALYTICS_TOKEN=$VITE_ANALYTICS_TOKEN \
    VITE_PUBLIC_FLAG=$VITE_PUBLIC_FLAG

# React 17 이어도 문제 없음. Vite가 mode에 맞춰 .env.* 로딩
RUN npm run build -- --mode=${BUILD_MODE}

############################
# 2) Runtime stage (Nginx)
############################
FROM nginx:1.27-alpine

# 포트를 8080으로 (Cloud Run 권장)
# 별도 nginx.conf가 있으면 그걸 사용하고, 없으면 기본 conf의 포트만 교체
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i 's/listen\s\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf || true

# 정적 파일 배포
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx","-g","daemon off;"]