# syntax=docker/dockerfile:1

### 1) 의존성만 설치 (dev deps 제외)
FROM node:18-slim AS deps
WORKDIR /app
COPY package*.json ./
# CI 환경이면 npm ci, 아니면 fallback
RUN npm ci --omit=dev || npm install --omit=dev

### 2) 런타임 이미지
FROM node:18-slim
ENV NODE_ENV=production
WORKDIR /app

# node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
# 앱 소스 복사
COPY . .

# 보안상 non-root 권장
USER node

# Cloud Run 이 PORT를 넣어줌(사용자 지정 금지). 노출만 8080
EXPOSE 8080

# 선택: 헬스체크 ( /health 엔드포인트 )
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD node -e "http=require('http');http.get({host:'127.0.0.1',port:process.env.PORT||8080,path:'/health'},r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# dotenv는 코드에서 ENV_PATH를 읽지만, 컨테이너내 .env 파일은 사용하지 않는걸 권장
# (Cloud Run에서 환경변수로 주입)
CMD ["node","src/index.js"]