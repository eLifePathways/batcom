FROM cokoapps/base:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm rebuild esbuild

RUN npm run build

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
EXPOSE 5120
CMD ["npm", "run", "start:prod"]
