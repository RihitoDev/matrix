FROM node:22-alpine AS deps

WORKDIR /app
RUN npm install --global pnpm@12.4.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN HUSKY=0 pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN pnpm prune --prod --ignore-scripts

FROM node:22-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js embeds NEXT_PUBLIC_* values in the browser bundle during the build.
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_API_URL_LOCAL
ARG NEXT_PUBLIC_API_URL_DEV
ARG NEXT_PUBLIC_API_URL_PROD
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV} \
    NEXT_PUBLIC_API_URL_LOCAL=${NEXT_PUBLIC_API_URL_LOCAL} \
    NEXT_PUBLIC_API_URL_DEV=${NEXT_PUBLIC_API_URL_DEV} \
    NEXT_PUBLIC_API_URL_PROD=${NEXT_PUBLIC_API_URL_PROD}

RUN ./node_modules/.bin/next build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=prod-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/package.json /app/next.config.ts ./

USER appuser
EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"]
