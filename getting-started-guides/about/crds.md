---
sidebar_position: 3
---
# Educates CRDs

As Educates has been written with Kubernetes as deployment target in mind, it has been based largely
on the concept of _Custom Resource Definitions_ (CRDs). This concept allows 3rd party tools to add new
functionality to the Kubernetes API by defining new resource specifications.

The CRDs added by Educates upon installation of the platform can be listed with `kubectl`:

```sh title="Listing Educates' CRDs"
kubectl get crds -o custom-columns=NAME:.metadata.name | grep educates
```

The result is a list of 10 CRDs:

```{ .text .no-copy title="Educates CRDs" }
secretcopiers.secrets.educates.dev
secretexporters.secrets.educates.dev
secretimporters.secrets.educates.dev
secretinjectors.secrets.educates.dev
trainingportals.training.educates.dev
workshopallocations.training.educates.dev
workshopenvironments.training.educates.dev
workshoprequests.training.educates.dev
workshops.training.educates.dev
workshopsessions.training.educates.dev
```

These CRDs can be grouped into 3 areas: **secret management**, **training portals**, and **workshop management**. Let's look at the ones we might interact with manually.

## SecretCopiers

In the [components overview](./components.md) we already talked about the `secrets-manager` deployed
by Educates. One of its task is to constantly look for `SecretCopier` resources within the cluster
and copy secrets from namespace A to namespace B.

This way, secrets can be distributed dynamically to multiple workshops at once, which comes in handy for
things like **certificates, registry credentials**, or other sensitive data.

A `SecretCopier` might look like this:

```yaml title="Example SecretCopier definition"
apiVersion: secrets.educates.dev/v1beta1
kind: SecretCopier
metadata:
  name: internal-tls-certs
spec:
  rules:
    - sourceSecret:
        name: wildcard-workshop-cert
        namespace: kube-system
      targetSecret:
        name: wildcard-workshop
      targetNamespaces:
        nameSelector:
          matchNames:
            - workshop-*
    - sourceSecret:
        name: wildcard-website-cert
        namespace: kube-system
      targetSecret:
        name: wildcard-website
      targetNamespaces:
        nameSelector:
          matchNames:
            - workshop-*
```

This definition will copy two secrets from the `kube-system` namespace to any namespace starting with
`workshop-` whenever they get created, changing the secrets' names in the target namespace in the process.

## TrainingPortals

`TrainingPortals` declaratively define the web apps workshop users will end up navigating. From **defaults**
for all **contained workshops**, to **authentication** and **styling** of the web app, configuration
happens within this CustomResource.

Note that this implies that Educates can manage **multiple indipendent** learning platforms within the same
cluster.

A `TrainingPortal` might look like this:

```yaml title="Example TrainingPortal definition"
apiVersion: training.educates.dev/v1beta1
kind: TrainingPortal
metadata:
  name: example-portal
spec:
  portal:
    logo: data:image/svg+xml;base64,[...]
    title: "Example Portal"
    ingress:
      hostname: portal.example.com
      tlsCertificateRef:
        name: wildcard-website-cert
        namespace: kube-system
    cookies:
      domain: ""
    password: keepthisasecret
    registration:
      type: anonymous
    sessions:
      maximum: 10
    updates:
      workshop: true
    workshop:
      defaults:
        reserved: 1
  workshops:
    - expires: 3h
      initial: 1
      name: workshop-1
      orphaned: 10m
      overdue: 5m
      reserved: 1
```

Note how this CustomResource defines **cosmetic things** like the website's logo as well as title in
the browser, **authentication and network settings**, as well as **defaults** for workshops and a specific
listing of workshops to be hosted by this `TrainingPortal`.

## Workshops

`Workshops` define actual workshops in the same way `TrainingPortals` define the hosting web apps - they
contain information of a workshop's configuration, such as **enabled features** for the workshop
environment, **sources** to pull **workshop resources** from, workshop-specific **overrides** for the
defaults set per `TrainingPortal`, and additional **metadata**.

A `Workshop` might look like this:

```yaml title="Example Workshop definition"
apiVersion: training.educates.dev/v1beta1
kind: Workshop
metadata:
  name: security-workshop
spec:
  authors:
    - John Doe <john.doe@example.com
  description:
    Introduction to advanced Kubernetes security with Cilium, Tetragon,
    and Hubble.
  duration: 8h
  environment:
    secrets:
      - name: license-key
        namespace: kube-system
  session:
    applications:
      console:
        enabled: false
      docker:
        enabled: true
      editor:
        enabled: true
      registry:
        enabled: false
      terminal:
        enabled: true
      vcluster:
        enabled: false
  tags:
    - kubernetes
    - observability
    - cilium
  title: Observing and Securing Kubernetes Workloads
  url: https://example.com/cilium-workshop
  vendor: ACME Corp.
  version: 1.0.0
  workshop:
    files:
      - image:
          url: registry.example.com/workshops/cilium-workshop-workshop-files:1.0.0
        includePaths:
          - /workshop/**
          - /exercises/**
```

When deploying a `Workshop` resource to our cluster and referencing it in one of our existing
`TrainingPortal` definitions, the workshop will be available to be spun up by users in the web app.

## Others

The other CRDs announced by Educates are mainly for platform-internal management of workload sessions
and their secrets - depending on your use-case and how you deploy Educates in production, you might
have to start using them yourself, but looking at all of them closer would be out of scope for this
primer.
