FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY ./app/package*.json ./
RUN npm ci
COPY ./app ./
RUN npm run build
RUN npm prune --production

FROM node:22-alpine

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /app/node_modules node_modules/

ENV NODE_ENV=production
CMD ["npm", "run", "preview"]