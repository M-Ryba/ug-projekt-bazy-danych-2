FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY ./app/package*.json ./
RUN npm ci
COPY ./app ./
RUN npm run build

# Breaks vite preview
#npm prune --production

FROM node:22-alpine

WORKDIR /usr/src/app
#COPY --from=builder /usr/src/app/package.json ./
#COPY --from=builder /usr/src/app/build ./build/
#COPY --from=builder /usr/src/app/node_modules ./node_modules/

# Needed for vite preview
COPY --from=builder /usr/src/app ./

ENV NODE_ENV=production
#CMD [ "node", "build" ]
CMD ["npm", "run", "preview"]