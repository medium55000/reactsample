# build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
ARG BUILD_MODE=production
RUN npm run build -- --mode=$BUILD_MODE

# run stage - nginx(8080 for Cloud Run)
FROM nginx:alpine
RUN sed -i 's/listen\s\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]