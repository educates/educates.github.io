#!/bin/sh
# Builds a target of the Dockerfile, `serve` unless named, as the image
# `educates-dev:<target>`, with Node.js at the Volta pin in package.json.
#
# Usage: npm run docker-build [-- <target> [docker buildx build options]]
#
# The image is for the host's architecture. TARGET_PLATFORMS, a
# comma-separated list such as `linux/amd64,linux/arm64`, builds for those
# platforms instead.
set -eu

cd "$(dirname "$0")/.."

target=serve
case "${1:-}" in
  "" | -*) ;;
  *)
    target=$1
    shift
    ;;
esac

node_version=$(node -p "require('./package.json').volta.node")

if [ -n "${TARGET_PLATFORMS:-}" ]; then
  set -- --platform "$TARGET_PLATFORMS" "$@"
fi

exec docker buildx build \
  --target "$target" \
  --build-arg "NODE_VERSION=$node_version" \
  --tag "educates-dev:$target" \
  "$@" .
