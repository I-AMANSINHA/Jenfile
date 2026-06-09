# 1. Grab the official Docker binary safely from the official image
FROM docker:latest AS docker-cli

# 2. Build our Jenkins core 
FROM jenkins/jenkins:lts-jdk17
USER root

# Install Maven normally
#RUN apt-get update && apt-get install -y maven && apt-get clean && rm -rf /var/lib/apt/lists/*
#Install System Tools, Java compilers (Maven), and Python environments
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    maven \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

#Install Node.js & npm (Required for React, Angular, and Node testing frameworks)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*



# Copy the working docker tool from step 1 right into Jenkins system path
COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker

# Map user group permissions to talk to the host machine
RUN groupadd -g 999 docker || true && usermod -aG docker jenkins
USER jenkins

