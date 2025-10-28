# build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
RUN npm run build

# run stage - nginx로 정적 서빙
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Cloud Run에서 포트 8080 사용
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]