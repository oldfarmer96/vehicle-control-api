FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:24-alpine AS production-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

FROM node:24-alpine AS production

LABEL maintainer="Jos3lo"
LABEL version="1.0.0"
LABEL description="Vehicle control api"

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

WORKDIR /app


COPY --chown=nestjs:nodejs --from=production-deps /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=development /app/dist ./dist
COPY --chown=nestjs:nodejs package*.json ./

USER nestjs

EXPOSE 4000

CMD ["node", "dist/src/main"]