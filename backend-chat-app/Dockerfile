FROM node:22-alpine

COPY ./app /usr/src/app/
WORKDIR /usr/src/app

RUN npm ci

ENV NODE_ENV=production
ENTRYPOINT ["node"]
CMD ["src/app.js"]