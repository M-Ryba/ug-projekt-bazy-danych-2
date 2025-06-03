FROM node:22-alpine

ADD ./app /usr/src/app
WORKDIR /usr/src/app

RUN npm ci

ENV NODE_ENV=production
ENTRYPOINT ["node"]
CMD ["src/app.js"]