# syntax=docker/dockerfile:1
FROM python:3.13-slim-bullseye

# Environment variables
ENV NODE_VERSION=22.17.1\
    MOTIA_DOCKER=true\
    NVM_DIR=/root/.nvm

# System packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libssl-dev \
    libreadline-dev \
    libffi-dev \
    libsqlite3-dev \
    libbz2-dev \
    git \
    wget \
    curl \
    ca-certificates \
    xz-utils \
    ruby-full \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Setup Ruby bundler
RUN gem install bundler

# Download and install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Install Node.js using nvm
RUN . "$NVM_DIR/nvm.sh" && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION

# Add nvm and node to PATH for subsequent RUN commands
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Verify installations
RUN . "$NVM_DIR/nvm.sh" && \
    node -v && \
    nvm current && \
    npm -v

# Working directory
WORKDIR /app

# ## Default command which will be overwritten in the Dockerfile implementing this image
CMD ["echo", "Please implement a Dockerfile using this image as a base"]