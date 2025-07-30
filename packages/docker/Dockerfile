# syntax=docker/dockerfile:1
FROM nikolaik/python-nodejs:python3.13-nodejs22-bullseye
LABEL org.opencontainers.image.authors="motia.dev"

# Environment variables
ENV MOTIA_DOCKER=true

# System packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends ruby-full && \
    rm -rf /var/lib/apt/lists/*

# Setup Ruby bundler
RUN gem install bundler

# Verify toolchain
RUN node -v && npm -v && python3.13 --version && ruby --version

# Working directory
WORKDIR /app

## Default command which will be overwritten in the Dockerfile implementing this image
CMD ["echo", "Please implement a Dockerfile using this image as a base"]