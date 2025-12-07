---
sidebar_position: 5
title: Local Development
---

For local development, Educates provides a streamlined experience using **kind** (Kubernetes in Docker):

- **Fully Configured Cluster**: The Educates CLI creates a complete Kubernetes cluster with all necessary components.
- **Container Registry**: A local container registry is automatically set up for publishing and pulling workshop images.
- **Local DNS Resolver**: A local DNS resolver improves the development workflow by providing proper DNS resolution for local services.
- **Container Registry Mirrors**: Container registry mirrors can be configured to mirror upstream registries to optimize download speed times on local clusters.
- **Wildcard TLS certificate and Certificate Authority**: A local wildcard TLS certificate and Certificate Authority can be registered to allow secure communication within the cluster.

This setup allows developers to:
- Test workshops locally before deploying to production
- Iterate quickly on workshop content
- Develop and test Educates features
- Experiment with different configurations

The local development environment mirrors the production setup, making it easy to transition from development to production.

