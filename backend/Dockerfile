# syntax=docker/dockerfile:1

# Raspberry Pi : docker build --platform linux/arm64 -t miambookv2-backend .
FROM node:22-alpine AS build

WORKDIR /app

# Dépendances natives requises par argon2
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER nestjs

EXPOSE 3333

CMD ["node", "dist/main"]
