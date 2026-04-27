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

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist
COPY docker-entrypoint.sh ./
COPY package*.json ./

RUN chown -R nestjs:nodejs /app

USER nestjs

RUN sed -i 's/\r$//' ./docker-entrypoint.sh && \
  chmod +x ./docker-entrypoint.sh

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]
# CMD ["node", "dist/src/main"]