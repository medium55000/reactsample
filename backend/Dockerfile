FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
USER node
EXPOSE 8080
CMD ["node","src/index.js"]