FROM registry.hub.docker.com/library/node:24.1-bookworm@sha256:c332080545f1de96deb1c407e6fbe9a7bc2be3645e127845fdcce57a7af3cf56 as dev

ENV APP_DIR /app

# install pre-requisites
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean


# COPY . ${APP_DIR}
WORKDIR ${APP_DIR}


# CMD ["npm", "run", "preview"]
CMD bash