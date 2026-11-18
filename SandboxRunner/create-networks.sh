#!/bin/sh
set -eu

docker network inspect kairos-ai-chat-build-egress >/dev/null 2>&1 || docker network create --driver bridge --internal kairos-ai-chat-build-egress
docker network inspect kairos-ai-chat-preview-internal >/dev/null 2>&1 || docker network create --driver bridge --internal kairos-ai-chat-preview-internal
install -d -m 0700 -o 1000 -g 1000 /srv/kairos-ai-chat-sandboxes
