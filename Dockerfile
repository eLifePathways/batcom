FROM cokoapps/base:20

WORKDIR /app

RUN corepack enable

COPY .yarnrc.yml package.json yarn.lock ./

RUN yarn install --immutable

COPY . .

RUN yarn rebuild esbuild

RUN yarn build

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
EXPOSE 5120
CMD ["yarn", "start:prod"]
