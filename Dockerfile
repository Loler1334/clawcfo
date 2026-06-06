FROM node:22-slim

WORKDIR /app

COPY packages/agent/package.json ./
RUN npm install && npm cache clean --force

COPY packages/agent/src ./src
COPY packages/agent/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

EXPOSE 3847

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3847)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npx", "tsx", "src/index.ts"]
