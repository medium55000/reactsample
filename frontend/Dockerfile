# ---------- Build Stage ----------
FROM node:18-alpine AS builder

# 작업 디렉터리 생성
WORKDIR /app

# 의존성만 먼저 복사하여 캐시 최적화
COPY package*.json ./

# 프로덕션 모드로 설치 (npm ci 우선)
RUN npm ci || npm install

# 소스 복사
COPY . .

# Cloud Build나 GitHub Actions에서 전달될 빌드 모드 (기본 production)
ARG BUILD_MODE=production
ENV NODE_ENV=$BUILD_MODE

# Vite 빌드 실행
RUN npm run build -- --mode=$BUILD_MODE


# ---------- Run Stage ----------
FROM nginx:alpine

# Cloud Run은 반드시 8080 포트를 사용해야 함 (nginx 기본 80 → 8080으로 교체)
RUN sed -i 's/listen\s\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 8080

# Nginx 실행 (데몬 비활성화)
CMD ["nginx", "-g", "daemon off;"]