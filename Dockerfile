FROM node:22-slim

WORKDIR /app

# Install agent dependencies
COPY packages/agent/package.json ./package.json
RUN npm install --omit=dev && npm install tsx --save-dev

COPY packages/agent/src ./src
COPY packages/agent/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

EXPOSE 3847

HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://localhost:'+(process.env.PORT||3847)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npx", "tsx", "src/index.ts"]
