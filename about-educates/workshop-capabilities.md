---
sidebar_position: 3
title: Workshop Capabilities
---

Educates provides a rich set of capabilities that can be enabled for workshops:

### Web Terminal

The **Web Terminal** provides a browser-based terminal interface that allows users to:
- Execute commands directly in the workshop environment
- Run scripts and tools
- Interact with Kubernetes clusters
- Execute commands from workshop instructions with a single click

The terminal runs in a container within the workshop session namespace and provides full shell access to the workshop environment.

### VS Code Editor

The **VS Code Editor** (or compatible editor) provides a full-featured code editing experience:
- Edit files directly in the browser
- Syntax highlighting for multiple languages
- Support for VS Code extensions
- Integrated terminal access
- Git integration
- Debugging capabilities

This allows users to write and modify code as part of the workshop without leaving the browser.

### Kubernetes Web Console

The **Kubernetes Web Console** provides a visual interface for:
- Viewing Kubernetes resources
- Managing deployments, services, and pods
- Inspecting logs and events
- Executing commands in containers
- Monitoring resource usage

This makes it easier for users to understand and interact with Kubernetes resources during workshops.

### vCluster (Virtual Cluster)

**vCluster** provides isolated virtual Kubernetes clusters for each user session. This is useful for:
- Workshops requiring cluster-admin access
- Testing cluster-level operations
- Isolating users completely from each other
- Providing a full Kubernetes cluster experience

vCluster runs as a lightweight virtual cluster within the host cluster, providing complete isolation while sharing the underlying infrastructure.

### File Server

The **File Server** provides HTTP access to files in the workshop environment:
- Serving static files and assets
- Downloading workshop resources
- Accessing generated files and outputs
- Sharing files between components

### Git Server

The **Git Server** provides Git repository access within the workshop:
- Cloning repositories
- Pushing and pulling changes
- Managing branches and tags
- Integrating with Git workflows

This enables workshops that involve Git operations and version control.

### Container Registry

The **Container Registry** provides container image storage and distribution:
- Storing workshop-specific images
- Building and pushing images during workshops
- Pulling images for deployments
- Managing image versions

For local development, Educates provides a local registry that simplifies the workflow.

### Docker Runtime

The **Docker Runtime** enables:
- Building container images
- Running containers
- Pushing images to registries
- Testing containerized applications

This is essential for workshops that involve containerization and Docker operations.