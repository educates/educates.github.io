---
sidebar_position: 2
---

# Core Concepts

This page explains the fundamental concepts that make up the Educates platform.

## Workshop

A **Workshop** is the fundamental unit of training content in Educates. It represents a complete, self-contained learning experience that includes:

- **Content**: Markdown or AsciiDoc files containing instructions, exercises, and explanations
- **Configuration**: Workshop-specific settings, resource requirements, and capabilities
- **Resources**: Kubernetes manifests for deploying applications and services needed for the workshop
- **Container Image**: The workshop content is packaged as an OCI image, typically stored in a container registry

Workshops are defined using the `Workshop` Custom Resource Definition (CRD), which specifies:
- The location of the workshop content (Git repository or container image)
- Resource quotas and limits for workshop sessions
- RBAC permissions required
- Additional capabilities needed (web terminal, editor, etc.)
- Shared resources that should be deployed for all sessions
- Per-session resources that should be created for each user

### Workshop Lifecycle

1. **Definition**: A `Workshop` resource is created in the cluster
2. **Content Distribution**: Workshop content is packaged and published to a container registry
3. **Environment Setup**: When a Training Portal references the workshop, a `WorkshopEnvironment` is created
4. **Session Creation**: Individual `WorkshopSession` resources are created as users access the workshop

## Training Portal

A **Training Portal** is the web-based interface that provides access to one or more workshops. It serves as the entry point for users to:

- Browse available workshops
- Register for workshops
- Access their workshop sessions
- View their progress and history

The Training Portal consists of:

- **Web UI**: A user-friendly interface built with React
- **REST API**: A programmatic interface for integration with external systems
- **Authentication**: User registration and login mechanisms
- **Session Management**: Automatic allocation and management of workshop sessions

Training Portals are defined using the `TrainingPortal` CRD, which specifies:
- Which workshops should be available
- Authentication configuration
- Portal branding and customization
- Access control policies

### Portal Types

Educates supports different portal deployment scenarios:

- **Supervised Workshops**: Time-limited workshops for conferences or customer sites
- **Temporary Learning Portal**: Short-duration demos at conferences or vendor booths
- **Permanent Learning Portal**: Long-running public websites for continuous learning
- **Personal Training**: Individual use for learning or product demos

## Controllers

Educates uses Kubernetes controllers to manage the platform's resources. The main controllers are:

### Session Manager Controller

The **Session Manager Controller** is responsible for managing workshop sessions. It:

- Watches for `WorkshopSession` resources
- Creates and manages namespaces for each session
- Allocates resources according to workshop requirements
- Applies RBAC policies and resource quotas
- Manages the lifecycle of session resources
- Handles session cleanup when sessions are deleted

The Session Manager ensures that each user gets an isolated environment with the appropriate permissions and resource limits.

### Secrets Manager Controller

The **Secrets Manager Controller** handles secret management across the platform. It:

- Manages secrets for workshop sessions
- Injects secrets into workshop environments
- Copies secrets between namespaces when needed
- Ensures secure secret distribution
- Manages secret lifecycle

This controller uses several CRDs:
- `SecretInjector`: Injects secrets into specific resources
- `SecretCopier`: Copies secrets between namespaces
- `SecretExporter`: Exports secrets for external use
- `SecretImporter`: Imports secrets from external sources

## Additional Capabilities

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

### Image Registry

The **Image Registry** provides container image storage and distribution:
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

## Infrastructure Requirements

Educates relies on several infrastructure components that should be installed in the Kubernetes cluster:

### Kyverno

**Kyverno** is used for advanced policy management:
- Enforcing security policies
- Validating resource configurations
- Mutating resources to meet standards
- Managing network policies

Kyverno policies can be used to ensure workshop sessions comply with organizational security requirements.

### kapp-controller

**kapp-controller** is used for deploying additional workloads:
- Managing application deployments
- Handling package installations
- Coordinating multi-resource deployments
- Managing application lifecycle

kapp-controller enables Educates to deploy complex applications and dependencies as part of workshop environments.

### external-dns

**external-dns** provides DNS name integration (primarily for cloud providers):
- Automatically creating DNS records
- Managing subdomain routing
- Integrating with cloud DNS services
- Providing user-friendly URLs for workshops

This component is optional and mainly used in cloud deployments.

### cert-manager

**cert-manager** handles certificate management:
- Integration with Let's Encrypt for automatic HTTPS
- Creating and managing TLS certificates
- Certificate renewal
- Custom certificate authorities

cert-manager ensures that workshop portals and services can be accessed securely over HTTPS.

## Local Development

For local development, Educates provides a streamlined experience using **kind** (Kubernetes in Docker):

- **Fully Configured Cluster**: The Educates CLI creates a complete Kubernetes cluster with all necessary components
- **Image Registry**: A local container registry is automatically set up for publishing and pulling workshop images
- **Local DNS Resolver**: A local DNS resolver improves the development workflow by providing proper DNS resolution for local services

This setup allows developers to:
- Test workshops locally before deploying to production
- Iterate quickly on workshop content
- Develop and test Educates features
- Experiment with different configurations

The local development environment mirrors the production setup, making it easy to transition from development to production.

