FROM node:22-slim AS build

WORKDIR /app

COPY packages/agent/package.json packages/agent/tsconfig.json ./
COPY packages/agent/src ./src

RUN npm install
RUN npm run build

FROM node:22-slim

WORKDIR /app

COPY packages/agent/package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

# Railway injects PORT at runtime - agent reads process.env.PORT
EXPOSE 8080

CMD ["node", "dist/index.js"]
