# syntax=docker/dockerfile:1

# TODO: Modify following examples at https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

# Stage 1: Base image.
## Start with a base image containing NodeJS so we can build Docusaurus.
FROM node:lts AS base
## Disable colour output from yarn to make logs easier to read.
ENV FORCE_COLOR=0
## Enable corepack.
RUN corepack enable
## Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus


# Stage 2a: Development mode.
FROM base AS dev
## Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus
## Expose the port that Docusaurus will run on.
EXPOSE 3000
## Run the development server.
CMD [ -d "node_modules" ] && yarn start --host 0.0.0.0 --poll 1000 || yarn install && yarn start --host 0.0.0.0 --poll 1000

# Stage 2b: Production build mode.
FROM base AS prod
## Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus
## Copy over the source code.
COPY . /opt/docusaurus/
## Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable
## Build the static site.
RUN yarn build

# Stage 3a: Serve with `docusaurus serve`.
FROM prod AS serve
## Expose the port that Docusaurus will run on.
EXPOSE 3000
## Run the production server.
CMD ["yarn", "serve", "--host", "0.0.0.0", "--no-open"]

# Stage 3b: Serve with nginx
FROM nginx:alpine AS nginx
## Copy the nginx configuration.
COPY --from=prod /opt/docusaurus/nginx.conf /etc/nginx/conf.d/default.conf
## Copy the Docusaurus build output.
COPY --from=prod /opt/docusaurus/build /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]