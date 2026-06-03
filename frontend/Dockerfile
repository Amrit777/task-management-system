# frontend/Dockerfile — multi-stage: build static assets, serve with nginx.
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines env at build time, so the API URL must be a build arg.
ARG VITE_API_URL=http://localhost:8005/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Runtime: static files behind nginx ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
