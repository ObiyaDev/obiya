# syntax=docker/dockerfile:1

# Use Node.js 22.17.1 slim image (supports linux/amd64 and linux/arm64)
FROM node:22.17.1-slim

# Define environment variables
ENV MOTIA_DOCKER=true
ENV PYTHON_VERSION=3.13

# Install Python, Ruby, and system build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.13 \
    python3.13-dev \
    python3-pip \
    ruby-full \
    build-essential \
    curl \
    ca-certificates \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libffi-dev \
    xz-utils \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Setup Ruby bundler
RUN gem install bundler

# Verify toolchain
RUN node -v && npm -v && python3.13 --version && ruby --version

# Set working directory
WORKDIR /app

# Default command (should be overridden in application Dockerfile)
CMD ["echo", "Base image ready. Override CMD in your application Dockerfile."]