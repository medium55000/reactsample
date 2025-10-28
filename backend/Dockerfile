FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
# Cloud Run에서 환경변수로 MONGODB_URI 주입, 포트 8080 권장 → 내부서버 3000을 8080으로 맵핑
ENV PORT=8080
EXPOSE 8080
CMD ["bash","-lc","ENV_PATH=${ENV_PATH:-.env.production} node src/index.js"]