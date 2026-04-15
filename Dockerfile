FROM node:25-alpine AS builder

RUN  apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci


COPY . .

RUN npx prisma generate
RUN npm run build 
RUN npm prune --production

# step 2: production
FROM node:25-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma

RUN ls -la
RUN ls -la scripts/ || echo "scripts/ no existe"
RUN find . -name "docker-entrypoint.sh" 2>/dev/null || echo "No encontrado"

RUN sed -i 's/\r$//' ./scripts/docker-entrypoint.sh && \
  chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]