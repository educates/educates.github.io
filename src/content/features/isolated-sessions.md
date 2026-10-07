---
name: Isolated Sessions
job: delivering
sentence: Each Session gets its own Kubernetes namespace with quotas and RBAC, its own virtual cluster, or a virtual machine.
docs: https://docs.educates.dev/en/stable/project-details/platform-architecture.html#workshop-environment-options
flagship: true
order: 11
homepage: 1
page:
  headline: Every Session in a space of its own, up to cluster admin
  what: Every Session runs in a container of its own. On top of that, each workshop chooses how much of Kubernetes its Sessions get, from none at all to a namespace with quotas and RBAC, a virtual cluster with cluster admin, or a virtual machine. One Session cannot see another's namespace, and what a workshop creates for a Session is deleted with it.
  loop:
    alt: Two Sessions of the same workshop side by side, each listing only the pods in its own namespace.
  things:
    - title: A namespace for each Session
      text: Each Session gets a Kubernetes namespace of its own, with admin access to it by default, or edit or view when the workshop needs less. A workshop can add more namespaces per Session when it needs them.
    - title: Quotas sized to the workshop
      text: Pick a budget, from small, at 1 CPU and 1 GiB of memory, to xxx-large, at 8 CPUs and 16 GiB, and each Session's namespace gets the matching quota and container defaults. Or choose custom and write your own.
    - title: Cluster admin in a virtual cluster
      text: Turn on a virtual cluster, and each Session gets what looks like a cluster of its own, with cluster admin, to install operators and do what a namespace does not allow, without a real cluster for each person.
    - title: A virtual machine when a container is not enough
      text: Create a VM on the cluster's nodes with KubeVirt, or a remote one through an operator such as Crossplane, alone or beside a namespace, for a complete Linux environment with administrator access.
    - title: No Kubernetes at all
      text: For a workshop about a programming language or a command line tool, block access to the cluster, and the Session is its container and nothing more.
  limits:
    - title: No quota until you set one
      text: A Session's namespace has no limits or quotas by default, so one Session can take as much of the cluster as it wants. Set a budget on any workshop that people you do not know will run.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#resource-budget-for-namespaces
    - title: A namespace is not a cluster
      text: In a namespace, nobody can create namespaces or do what a cluster admin does, and containers run as a non-root user unless the workshop selects the baseline policy. Many images from Docker Hub expect root.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#running-user-containers-as-root
    - title: A virtual cluster is not a real one
      text: In the docs' own words, a virtual cluster "doesn't allow you to do everything you could do with a Kubernetes cluster". Its control plane runs outside the Session's budget and reserves memory of its own, 1 GiB for its syncer by default.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#provisioning-a-virtual-cluster
    - title: KubeVirt is yours to install
      text: Educates does not install KubeVirt or Crossplane. A Session with a virtual machine needs the operator running in the cluster first, and the docs show a VM only as an example of what a Session can create.
      docs: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#creation-of-session-resources
    - title: Isolation needs Kyverno, and a cluster of its own
      text: RBAC and quotas limit what people create, not what their containers may do. Educates enforces that through Kyverno policies, and without Kyverno the docs say never to let untrusted users in. They also recommend a cluster used only for Educates and its workshops.
      docs: https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html#workshop-security-enforcement
  hubWorkshops:
    - lab-session-namespace
    - lab-virtual-cluster
  reading:
    - kind: Docs
      title: Workshop environment options
      href: https://docs.educates.dev/en/stable/project-details/project-overview.html#workshop-environment-options
    - kind: Docs
      title: Resource budget for namespaces
      href: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#resource-budget-for-namespaces
    - kind: Docs
      title: Provisioning a virtual cluster
      href: https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#provisioning-a-virtual-cluster
    - kind: Docs
      title: Cluster requirements
      href: https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html
---

A namespace for each Session is the default, with no quota. A resource budget
in the workshop definition gives it one:

```yaml title="resources/workshop.yaml"
spec:
  session:
    namespaces:
      budget: small
```

Access to the namespace is `admin` unless `role`, beside the budget, sets
`edit` or `view`.

For cluster admin, the workshop turns on a virtual cluster instead:

```yaml title="resources/workshop.yaml"
spec:
  session:
    applications:
      vcluster:
        enabled: true
```

The Session's `kubeconfig` then points at the virtual cluster, where the
person working in it is cluster admin, with no access to the cluster
underneath. The budget, if any, applies to the virtual cluster as a whole.

A virtual machine is a KubeVirt `VirtualMachine` among the resources the
workshop creates for each Session, which the
[docs show in full](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#creation-of-session-resources).
