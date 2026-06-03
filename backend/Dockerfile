# backend/Dockerfile — production image
FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Install only production deps from the lockfile (deterministic).
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Persisted upload directory, owned by the non-root runtime user.
RUN mkdir -p uploads && chown -R node:node /usr/src/app

USER node

EXPOSE 8005
CMD ["node", "server.js"]
