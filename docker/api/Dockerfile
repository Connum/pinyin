FROM node:10

ENV TERM xterm

RUN apt-get update && apt-get install -y \
    libstdc++6 poppler-utils && \
    rm -rf /var/lib/apt/lists/*
