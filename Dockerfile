FROM oven/bun:alpine AS base
RUN apk --no-cache add curl
WORKDIR /app

FROM base AS install
COPY package.json bun.lockb ./
RUN bun install

FROM install AS run
COPY . /app
CMD ["bun", "run", "src/index.ts"]