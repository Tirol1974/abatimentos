FROM node:22-alpine AS base

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN npm install -g tsx
RUN pnpm install

# DEV

FROM base AS dev

COPY . .

EXPOSE 3333

CMD ["sh", "-c", "pnpm dlx prisma migrate deploy && pnpm dlx prisma db seed && pnpm dlx prisma generate && tsx watch src/server.ts"]

# BUILD

FROM base AS build

COPY . .

RUN pnpm run build
RUN pnpm dlx prisma generate

# PROD

FROM node:22-alpine AS prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/services/email/templates ./dist/src/services/email/templates
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=build /usr/src/app/package.json ./package.json

RUN corepack enable
RUN pnpm install

EXPOSE 3333

CMD ["sh", "-c", "pnpm dlx prisma migrate deploy && pnpm dlx prisma generate && pnpm dlx prisma db seed && node dist/src/server.js"]
