---
sidebar_position: 4
title: Workflows
---

This page explains how Educates works from a workflow perspective, covering the lifecycle of workshops and sessions.

## Workshop Deployment Workflow

The following diagram illustrates how workshops are deployed and made available:

```mermaid
sequenceDiagram
    participant Admin
    participant Portal as Training Portal
    participant Operator as Educates Operator
    participant Cluster as Kubernetes Cluster
    
    Admin->>Cluster: Create Workshop Resource
    Operator->>Operator: Watch Workshop CR
    Operator->>Operator: Validate Workshop Definition
    
    Admin->>Cluster: Create TrainingPortal Resource
    Operator->>Operator: Watch TrainingPortal CR
    Operator->>Cluster: Create WorkshopEnvironment
    Operator->>Cluster: Deploy Shared Resources
    Operator->>Portal: Register Workshop
    
    Portal->>Portal: Display Workshop in Catalog
```

### Step-by-Step Process

1. **Workshop Definition**: An administrator creates a `Workshop` Custom Resource that defines:
   - Workshop content location (Git repo or container image)
   - Resource requirements
   - Required capabilities
   - RBAC permissions

2. **Training Portal Creation**: An administrator creates a `TrainingPortal` resource that:
   - References one or more workshops
   - Configures authentication
   - Sets up the web interface

3. **Workshop Environment Setup**: The operator creates a `WorkshopEnvironment` for each workshop:
   - Sets up a namespace for the workshop
   - Deploys shared resources (common to all sessions)
   - Configures the environment according to workshop requirements

4. **Portal Registration**: The workshop becomes available in the Training Portal catalog

## User Session Workflow

When a user accesses a workshop, the following workflow is triggered:

```mermaid
sequenceDiagram
    participant User
    participant Portal as Training Portal
    participant Operator as Educates Operator
    participant SM as Session Manager
    participant SC as Secrets Manager
    participant Session as Workshop Session
    
    User->>Portal: Request Workshop Access
    Portal->>Portal: Check Available Sessions
    alt Session Available
        Portal->>Session: Allocate Existing Session
    else No Session Available
        Portal->>Operator: Create WorkshopSession CR
        Operator->>SM: Create Session Namespace
        SM->>Session: Create Session Resources
        SM->>Session: Apply RBAC & Quotas
        SC->>Session: Inject Required Secrets
        Operator->>Session: Deploy Per-Session Resources
        Operator->>Session: Start Capabilities (Terminal, Editor, etc.)
        Operator->>Portal: Session Ready
        Portal->>Session: Allocate Session to User
    end
    Portal->>User: Redirect to Workshop Session
    User->>Session: Access Workshop Dashboard
```

### Session Creation Process

1. **Session Request**: User selects a workshop from the Training Portal
2. **Session Allocation**: Portal checks for available pre-created sessions or creates a new one
3. **Namespace Creation**: Session Manager creates a dedicated namespace for the session
4. **Resource Setup**: 
   - RBAC policies are applied
   - Resource quotas are set
   - Required secrets are injected
5. **Capability Deployment**: Required capabilities are started:
   - Web terminal
   - VS Code editor
   - Kubernetes console
   - File server, Git server, etc.
6. **Per-Session Resources**: Workshop-specific resources are deployed to the session namespace
7. **Session Access**: User is redirected to the workshop session dashboard

## Workshop Content Workflow

The workflow for creating and publishing workshop content:

```mermaid
graph LR
    A[Write Markdown Content] --> B[Package as OCI Image]
    B --> C[Push to Registry]
    C --> D[Create Workshop CR]
    D --> E[Workshop Available]
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#fff4e1
    style E fill:#e8f5e9
```

### Content Development Process

1. **Content Creation**: Workshop authors write content in Markdown (using Hugo format)
2. **Local Testing**: Content is tested using the local Educates environment
3. **Image Building**: Content is packaged into an OCI container image
4. **Image Publishing**: Image is pushed to a container registry
5. **Workshop Deployment**: Workshop CR is created referencing the image
6. **Content Updates**: For content-only changes, sessions can be updated without recreating

## Session Lifecycle

The lifecycle of a workshop session:

```mermaid
stateDiagram-v2
    [*] --> Requested: User Requests Workshop
    Requested --> Allocating: Portal Processes Request
    Allocating --> Creating: No Session Available
    Creating --> Starting: Resources Created
    Starting --> Ready: Capabilities Started
    Allocating --> Ready: Session Available
    Ready --> Active: User Accesses Session
    Active --> Idle: User Inactive
    Idle --> Active: User Returns
    Active --> Expired: Time Limit Reached
    Expired --> Terminating: Cleanup Initiated
    Ready --> Terminating: Session Not Used
    Terminating --> [*]: Resources Deleted
```

### Session States

- **Requested**: User has requested access to a workshop
- **Allocating**: Portal is finding or creating a session
- **Creating**: Session resources are being created
- **Starting**: Capabilities are being started
- **Ready**: Session is ready but not yet accessed
- **Active**: User is actively using the session
- **Idle**: Session is active but user is inactive
- **Expired**: Session has reached its time limit
- **Terminating**: Session is being cleaned up

## Resource Management Workflow

How resources are managed across the platform:

```mermaid
graph TB
    subgraph "Workshop Level"
        WR[Workshop Resources]
        WE[Workshop Environment]
    end
    
    subgraph "Session Level"
        SR[Session Resources]
        SN[Session Namespace]
    end
    
    subgraph "Shared Resources"
        SH[Shared Applications]
        SHN[Workshop Environment Namespace]
    end
    
    WE --> SHN
    WE --> SH
    SN --> SR
    SN -.->|Access| SHN
    
    style WR fill:#e1f5ff
    style WE fill:#e1f5ff
    style SR fill:#fff4e1
    style SN fill:#fff4e1
    style SH fill:#e8f5e9
    style SHN fill:#e8f5e9
```

### Resource Hierarchy

1. **Workshop Environment Resources**: Deployed once per workshop, shared by all sessions
2. **Session Resources**: Deployed per session, isolated to each user
3. **Resource Quotas**: Applied at the session level to limit resource usage
4. **RBAC Policies**: Applied at the session level to control access

## Authentication and Authorization Workflow

How users are authenticated and authorized:

```mermaid
sequenceDiagram
    participant User
    participant Portal as Training Portal
    participant Auth as Auth Provider
    participant Operator as Educates Operator
    
    User->>Portal: Access Portal
    Portal->>Auth: Authenticate User
    Auth-->>Portal: Authentication Result
    alt Authenticated
        Portal->>Portal: Check User Permissions
        Portal->>User: Show Available Workshops
        User->>Portal: Request Workshop
        Portal->>Operator: Create/Allocate Session
        Operator->>Operator: Apply RBAC to Session
        Operator-->>Portal: Session Ready
        Portal->>User: Grant Access
    else Not Authenticated
        Portal->>User: Show Login/Register
    end
```

## Content Update Workflow

How workshop content updates are handled:

```mermaid
graph LR
    A[Update Content] --> B{Workshop Config Changed?}
    B -->|Yes| C[Rebuild Image]
    B -->|No| D[Update Content Only]
    C --> E[Update Workshop CR]
    E --> F[Recreate Environments]
    D --> G[Update Running Sessions]
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#e8f5e9
    style E fill:#fff4e1
    style F fill:#ffebee
    style G fill:#e8f5e9
```

### Update Scenarios

1. **Content-Only Updates**: When only Markdown content changes:
   - Content can be updated in running sessions
   - No need to recreate workshop environments
   - Faster iteration during development

2. **Configuration Changes**: When workshop configuration changes:
   - New container image must be built
   - Workshop CR must be updated
   - Workshop environments may need to be recreated
   - Existing sessions continue until they expire

## Local Development Workflow

The workflow for developing workshops locally:

```mermaid
graph LR
    A[Write Content] --> B[Test Locally]
    B --> C{Changes OK?}
    C -->|No| A
    C -->|Yes| D[Publish to Local Registry]
    D --> E[Deploy to Local Cluster]
    E --> F[Test Workshop]
    F --> G{Workshop Works?}
    G -->|No| A
    G -->|Yes| H[Publish to Production Registry]
    H --> I[Deploy to Production]
    
    style A fill:#e1f5ff
    style B fill:#e8f5e9
    style D fill:#fff4e1
    style E fill:#fff4e1
    style H fill:#ffebee
    style I fill:#ffebee
```

### Local Development Benefits

- **Fast Iteration**: Content updates can be tested immediately
- **Isolated Environment**: No impact on production
- **Full Feature Set**: Local environment includes all capabilities
- **Easy Debugging**: Direct access to cluster and resources

