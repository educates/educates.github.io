# syntax=docker/dockerfile:1

# The Node.js version; `npm run docker-build` passes the Volta pin from
# package.json.
ARG NODE_VERSION=26

# The project's dependencies, installed from the lockfile.
FROM node:${NODE_VERSION}-slim AS deps
## Disable colour output to make logs easier to read.
ENV FORCE_COLOR=0
WORKDIR /opt/site
COPY package.json package-lock.json ./
RUN npm ci

# The Astro dev server over a source mounted at /opt/site. An anonymous volume
# at /opt/site/node_modules keeps this image's dependencies, which are built
# for Linux, in place of the host's.
FROM deps AS dev
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# The site, built and checked.
FROM deps AS build
COPY . .
RUN npm run build

# The built site behind nginx, serving URLs the way GitHub Pages does.
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /opt/site/dist /usr/share/nginx/html
EXPOSE 80
