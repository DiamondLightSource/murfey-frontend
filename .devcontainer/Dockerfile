
FROM docker.io/library/node:24.1-bookworm as dev

ENV APP_DIR /app

# install pre-requisites
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean


# COPY . ${APP_DIR}
WORKDIR ${APP_DIR}


# CMD ["npm", "run", "preview"]
CMD bash
