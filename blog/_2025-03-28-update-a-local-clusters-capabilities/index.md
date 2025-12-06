---
slug: update-a-local-clusters-capabilities
title: Update a local cluster's capabilities
authors: [jorge]
tags: [getting-started, educates, kind, local]
---

When you create a local cluster as explained in [Getting Started on Kind](/blog/getting-started-on-kind), the cluster comes configured with some additional capabilities based on the provided configuration (or the default if none is provided), namely [Contour](https://projectcontour.io) as `Ingress controller` and [Kyverno](https://kyverno.io/) as `policy management`, and then, obviously, Educates Training Platform.

<!-- truncate -->

These capabilities are from the specific version that Educates provides and configured in an opinionated way. In order to see what are the values used by the installer to configure these capabilities, run:

```
$ educates admin platform values --local-config
---
clusterPackages:
  contour:
    enabled: true
    settings:
      infraProvider: kind
      contour:
        replicas: 1
      configFileContents:
        defaultHttpVersions:
        - HTTP/1.1
      service:
        type: ClusterIP
        useHostPorts: true
  cert-manager:
    enabled: false
    settings: {}
  external-dns:
    enabled: false
    settings: {}
  certs:
    enabled: false
    settings: {}
  kyverno:
    enabled: true
    settings: {}
  kapp-controller:
    enabled: false
    settings: {}
  educates:
    enabled: true
    settings:
      imageVersions:
      - name: session-manager
        image: ghcr.io/educates/educates-session-manager:3.2.0
      - name: training-portal
        image: ghcr.io/educates/educates-training-portal:3.2.0
      - name: docker-registry
        image: ghcr.io/educates/educates-docker-registry:3.2.0
      - name: pause-container
        image: ghcr.io/educates/educates-pause-container:3.2.0
      - name: base-environment
        image: ghcr.io/educates/educates-base-environment:3.2.0
      - name: jdk8-environment
        image: ghcr.io/educates/educates-jdk8-environment:3.2.0
      - name: jdk11-environment
        image: ghcr.io/educates/educates-jdk11-environment:3.2.0
      - name: jdk17-environment
        image: ghcr.io/educates/educates-jdk17-environment:3.2.0
      - name: jdk21-environment
        image: ghcr.io/educates/educates-jdk21-environment:3.2.0
      - name: conda-environment
        image: ghcr.io/educates/educates-conda-environment:3.2.0
      - name: secrets-manager
        image: ghcr.io/educates/educates-secrets-manager:3.2.0
      - name: tunnel-manager
        image: ghcr.io/educates/educates-tunnel-manager:3.2.0
      - name: image-cache
        image: ghcr.io/educates/educates-image-cache:3.2.0
      - name: assets-server
        image: ghcr.io/educates/educates-assets-server:3.2.0
      - name: lookup-service
        image: ghcr.io/educates/educates-lookup-service:3.2.0
      - name: debian-base-image
        image: debian:sid-20230502-slim
      - name: docker-in-docker
        image: docker:27.5.1-dind
      - name: rancher-k3s-v1.27
        image: rancher/k3s:v1.27.14-k3s1
      - name: rancher-k3s-v1.28
        image: rancher/k3s:v1.28.10-k3s1
      - name: rancher-k3s-v1.29
        image: rancher/k3s:v1.29.5-k3s1
      - name: rancher-k3s-v1.30
        image: rancher/k3s:v1.30.1-k3s1
      - name: loftsh-vcluster
        image: loftsh/vcluster:0.18.1
      clusterIngress:
        domain: educates.test
        tlsCertificateRef:
          namespace: educates-secrets
          name: educates.test-tls
        caCertificateRef:
          namespace: educates-secrets
          name: educates.test-ca
      clusterSecurity:
        policyEngine: kyverno
      workshopSecurity:
        rulesEngine: kyverno
```

__NOTE__: This configuration presents values that were introduced in our [previous blog](/blog/how-to-best-work-locally/)

The `clusterPackages` section is the one that contains the configuration Educates installer will use when creating the cluster, but also when deploying the platform to remote clusters, but that's for another blog.
As you will notice, only the `enabled` packages are installed, and the configuration in `settings` is the
one that will be provided to the installer mechanism.

Let's say that for some reason, you want to test a different version of contour, or contour configured in a
different way, but you have already created the cluster. What do you do?

Let's create a cluster so that you can test this yourself.

```
$ educates local cluster create
```

Once the cluster is created, we will go ahead and modify the configuration of our contour installation so that it uses `2 replicas`. For that we will copy and paste the whole output of our previous `educates admin platform values --local-config` command and paste it in our local configuration file, via:

```
$ educates local config edit
clusterPackages:
  contour:
    enabled: true
    settings:
      configFileContents:
        defaultHttpVersions:
        - HTTP/1.1
      contour:
        replicas: 2
      infraProvider: kind
      service:
        type: ClusterIP
        useHostPorts: true
  cert-manager:
    enabled: false
    settings: {}
  external-dns:
    enabled: false
    settings: {}
  certs:
    enabled: false
    settings: {}
  kyverno:
    enabled: true
    settings: {}
  kapp-controller:
    enabled: false
    settings: {}
  educates:
    enabled: true
    settings:
      imageVersions:
      - name: session-manager
        image: ghcr.io/educates/educates-session-manager:develop
      - name: training-portal
        image: ghcr.io/educates/educates-training-portal:develop
      - name: docker-registry
        image: ghcr.io/educates/educates-docker-registry:develop
      - name: pause-container
        image: ghcr.io/educates/educates-pause-container:develop
      - name: base-environment
        image: ghcr.io/educates/educates-base-environment:develop
      - name: jdk8-environment
        image: ghcr.io/educates/educates-jdk8-environment:develop
      - name: jdk11-environment
        image: ghcr.io/educates/educates-jdk11-environment:develop
      - name: jdk17-environment
        image: ghcr.io/educates/educates-jdk17-environment:develop
      - name: jdk21-environment
        image: ghcr.io/educates/educates-jdk21-environment:develop
      - name: conda-environment
        image: ghcr.io/educates/educates-conda-environment:develop
      - name: secrets-manager
        image: ghcr.io/educates/educates-secrets-manager:develop
      - name: tunnel-manager
        image: ghcr.io/educates/educates-tunnel-manager:develop
      - name: image-cache
        image: ghcr.io/educates/educates-image-cache:develop
      - name: assets-server
        image: ghcr.io/educates/educates-assets-server:develop
      - name: lookup-service
        image: ghcr.io/educates/educates-lookup-service:develop
      - name: debian-base-image
        image: debian:sid-20230502-slim
      - name: docker-in-docker
        image: docker:27.5.1-dind
      - name: rancher-k3s-v1.27
        image: rancher/k3s:v1.27.14-k3s1
      - name: rancher-k3s-v1.28
        image: rancher/k3s:v1.28.10-k3s1
      - name: rancher-k3s-v1.29
        image: rancher/k3s:v1.29.5-k3s1
      - name: rancher-k3s-v1.30
        image: rancher/k3s:v1.30.1-k3s1
      - name: loftsh-vcluster
        image: loftsh/vcluster:0.18.1
      - image: ghcr.io/educates/educates-session-manager:develop
        name: session-manager
      - image: ghcr.io/educates/educates-training-portal:develop
        name: training-portal
      - image: ghcr.io/educates/educates-docker-registry:develop
        name: docker-registry
      - image: ghcr.io/educates/educates-pause-container:develop
        name: pause-container
      - image: ghcr.io/educates/educates-base-environment:develop
        name: base-environment
      - image: ghcr.io/educates/educates-jdk8-environment:develop
        name: jdk8-environment
      - image: ghcr.io/educates/educates-jdk11-environment:develop
        name: jdk11-environment
      - image: ghcr.io/educates/educates-jdk17-environment:develop
        name: jdk17-environment
      - image: ghcr.io/educates/educates-jdk21-environment:develop
        name: jdk21-environment
      - image: ghcr.io/educates/educates-conda-environment:develop
        name: conda-environment
      - image: ghcr.io/educates/educates-secrets-manager:develop
        name: secrets-manager
      - image: ghcr.io/educates/educates-tunnel-manager:develop
        name: tunnel-manager
      - image: ghcr.io/educates/educates-image-cache:develop
        name: image-cache
      - image: ghcr.io/educates/educates-assets-server:develop
        name: assets-server
      - image: ghcr.io/educates/educates-lookup-service:develop
        name: lookup-service
      - image: debian:sid-20230502-slim
        name: debian-base-image
      - image: docker:27.5.1-dind
        name: docker-in-docker
      - image: rancher/k3s:v1.27.14-k3s1
        name: rancher-k3s-v1.27
      - image: rancher/k3s:v1.28.10-k3s1
        name: rancher-k3s-v1.28
      - image: rancher/k3s:v1.29.5-k3s1
        name: rancher-k3s-v1.29
      - image: rancher/k3s:v1.30.1-k3s1
        name: rancher-k3s-v1.30
      - image: loftsh/vcluster:0.18.1
        name: loftsh-vcluster
      clusterIngress:
        caCertificateRef:
          name: educates.test-ca
          namespace: educates-secrets
        domain: educates.test
        tlsCertificateRef:
          name: educates.test-tls
          namespace: educates-secrets
      clusterSecurity:
        policyEngine: kyverno
      workshopSecurity:
        rulesEngine: kyverno
```

We will then add the following snippet, so that the installer understands we're providing customized configuration to the opinionated installers.

```
clusterInfrastructure:
  provider: custom
```

Now that the configuration in our local file has been modified, we can run the installer to apply the changes:

```
$ educates admin platform deploy --local-config
```

