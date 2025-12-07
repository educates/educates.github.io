---
sidebar_position: 1
title: Architecture
---

Educates is a Kubernetes-based platform designed to provide interactive workshop environments. This section provides a comprehensive overview of the Educates architecture, its core concepts, and how the system works.

## Architectural Components

The core architecture consists of the **Session Manager**, **Secrets Manager**, which are the main Kubernetes Controllers. These controllers manages a set of **Custom Resource Definitions (CRDs)**, the **Training Portal** and **Workshop**, which are the main Kubernetes Resources a user will deal with. These resources work together to create **Workshop Environments** and **Workshop Sessions**.

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Educates Operator"
            SM[Session Manager]
            SC[Secrets Manager]
        end
        
        subgraph "Training Portal"
            TP[Training Portal Service]
            UI[Web UI]
            API[REST API]
        end
        
        subgraph "Workshop Environment"
            WE[Workshop Environment Namespace]
            WR[Workshop Resources]
        end
        
        subgraph "Workshop Session"
            WS[Workshop Session Namespace]
            WT[Web Terminal]
            VE[VS Code Editor]
            KC[Kubernetes Console]
            FS[File Server]
            GS[Git Server]
            IR[Image Registry]
            DR[Docker Runtime]
            VC[vCluster - Optional]
        end
    end
    
    User[User] -->|Access| UI
    User -->|API Calls| API
    UI --> TP
    API --> TP
    TP -->|Creates| WE
    TP -->|Creates| WS
    SM -->|Manages| WE
    SM -->|Manages| WS
    SC -->|Manages| WS
    WS --> WT
    WS --> VE
    WS --> KC
    WS --> FS
    WS --> GS
    WS --> IR
    WS --> DR
    WS -.->|Optional| VC
```

## Core Components

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Educates Operator"
            SM[Session Manager]
            CM[Secrets Manager]
        end
    end
```

### Session Manager

The Session Manager is responsible for:
- Creating and managing workshop session namespaces
- Allocating resources to sessions
- Managing session lifecycle (creation, updates, deletion)
- Ensuring proper RBAC and resource quotas are applied

### Secrets Manager

The Secrets Manager handles:
- Secret management across workshop sessions
- Secret injection into workshop environments
- Secret copying between namespaces
- Secure secret distribution

### Workshop

Provides the definition of a workshop. Preloaded by an administrator into the cluster, it defines where the workshop content is hosted, or the location of a container image which bundles the workshop content and any additional tools required for the workshop. The definition also lists additional resources that should be created which are to be shared between all workshop sessions, or for each session, along with details of resources quotas and access roles required by the workshop.

```mermaid
---
  config:
    class:
      hideEmptyMembersBox: true
---
classDiagram 
    direction LR
    TrainingPortal *-- "many" Workshop
    class TrainingPortal{
        Title
        Logo
        Authentication
        Access Charactertistics
        Capacity
        Timeouts
        Workshops[]
    }
    class Workshop{
        Title
        Description
        ContentLocation
        Extensions
        Budgets and resource quotas
        Capabilities
        Additional Session Resources
        Additional Environment Resources
    }
```


### Training Portal

Created by an administrator in the cluster to trigger the deployment of a training portal. The training portal can provide access to **one or more** distinct workshops defined by a **Workshop** resource. 

```mermaid
graph TB
    TP1[Training Portal]
    TP2[Training Portal]
    W1[Workshop 1]
    W2[Workshop 2]
    W3[Workshop 3]
    W4[Workshop 4]
    W5[Workshop 5]
    W6[Workshop 6]
    
    
    TP1 --> W1
    TP1 --> W2
    TP1 --> W3
    TP1 --> W4
    TP1 --> W6
    
    TP2 --> W2
    TP2 --> W3
    TP2 --> W5
```

The training portal provides a **web based interface** for registering for workshops and accessing them. 

It also provides a **REST API** for requesting access to workshops, allowing custom front ends to be created which integrate with separate identity providers and which provide an alternate means for browsing and accessing workshops.


## Resource Flow

1. **Workshop Definition**: A `Workshop` resource is created, defining the workshop content and requirements
2. **Training Portal**: A `TrainingPortal` resource is created, which sets up the web interface
3. **Workshop Environment**: The portal creates `WorkshopEnvironment` resources for each workshop
4. **Workshop Session**: When a user requests access, a `WorkshopSession` resource is created
5. **Session Resources**: The operator creates all necessary resources for the session (namespaces, services, etc.)
