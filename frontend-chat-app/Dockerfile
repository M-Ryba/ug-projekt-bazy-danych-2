FROM node:22.16.0-alpine

ENV NODE_ENV=production

ADD ./app /usr/src/app
WORKDIR /usr/src/app

RUN npm run install
RUN npm run build

ENTRYPOINT ["npm", "run"]
CMD ["preview"]