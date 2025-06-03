FROM node:22-alpine

ADD ./app /usr/src/app
WORKDIR /usr/src/app

RUN npm ci
RUN npm run build

ENV NODE_ENV=production
ENTRYPOINT ["npm", "run"]
CMD ["preview"]