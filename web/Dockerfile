FROM node:22-alpine AS base

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
 && corepack prepare pnpm@10.33.0 --activate

RUN pnpm install --frozen-lockfile --config.minimum-release-age=0

FROM base AS build

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

COPY . .

RUN pnpm run build

FROM node:22-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=build /usr/src/app/.next/standalone ./
COPY --from=build /usr/src/app/.next/static ./.next/static
COPY --from=build /usr/src/app/public ./public

RUN chown -R nextjs:nextjs /app

USER nextjs

HEALTHCHECK CMD node -e "fetch('http://localhost:3000').then(()=>process.exit(0)).catch(()=>process.exit(1))"

EXPOSE 3000

CMD ["node", "server.js"]
