FROM node:22.16.0-alpine

ENV NODE_ENV=production

ADD ./app /usr/src/app
WORKDIR /usr/src/app

RUN npm ci

ENTRYPOINT ["node"]
CMD ["src/app.js"]