##### DEPENDENCIES
FROM --platform=linux/amd64 node:20-alpine3.18 AS deps
RUN apk add --no-cache libc6-compat openssl openssl1.1-compat
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER
FROM --platform=linux/amd64 node:20-alpine3.18 AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
ARG AUTH_SECRET

# Promote them to ENV so Next.js sees them
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn prisma generate --schema=./prisma/schema.prisma && yarn build; \
    elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm i -g prisma && npx prisma generate --schema=./prisma/schema.prisma && npm run build; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && SKIP_ENV_VALIDATION=1 pnpm prisma generate --schema=./prisma/schema.prisma && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### RUNNER
FROM --platform=linux/amd64 node:20-alpine3.15 AS runner
WORKDIR /app

# Install OpenSSL 1.1 for Prisma
RUN apk add --no-cache openssl openssl1.1-compat libc6-compat curl

# Copy node_modules for Prisma
COPY --from=builder /app/node_modules ./node_modules

# Environment variables for runtime
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
ARG AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV NEXT_PUBLIC_CLIENTVAR=$NEXT_PUBLIC_CLIENTVAR
ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
ENV PORT 3001
CMD ["server.js"]
