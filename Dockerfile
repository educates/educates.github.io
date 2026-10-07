# syntax=docker/dockerfile:1

# Stage 1: a Node.js image to build the site.
FROM node:26 AS base
## Disable colour output to make logs easier to read.
ENV FORCE_COLOR=0
WORKDIR /opt/site

# Stage 2a: the Astro dev server over a mounted source.
FROM base AS dev
EXPOSE 4321
CMD [ -d "node_modules" ] || npm install; npm run dev -- --host 0.0.0.0

# Stage 2b: the production build.
FROM base AS prod
COPY . /opt/site/
RUN npm ci
RUN npm run build

# Stage 3: the built site behind nginx.
FROM nginx:alpine AS serve
COPY --from=prod /opt/site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=prod /opt/site/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
