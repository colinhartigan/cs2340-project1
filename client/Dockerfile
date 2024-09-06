FROM node:18.18.2-bullseye-slim as dev

ARG UID=1000
RUN userdel node && useradd django-bridge-project --uid ${UID} -l --create-home && mkdir /client && chown django-bridge-project /client

WORKDIR /client
USER django-bridge-project
