---
name: Team training
promise: Train your engineers on real environments shaped like production, without touching production.
icon: layers
order: 4
page:
  headline: Engineers learn your stack on real environments shaped like production, without touching production
  reader: For platform teams and engineering managers training their own engineers, new hires included.
  lede: Each engineer gets a Session of their own, with your tools in it and up to a whole cluster to break. The workshops live in Git beside the code they teach, and the portal runs on a cluster you own.
  problems:
    - title: Nothing hands-on
      text: Onboarding is a wiki that was last accurate two reorganizations ago and a recording of someone else's screen. Engineers learn the platform the first time they use it for real.
    - title: The shared sandbox is broken again
      text: Everyone practises in the same sandbox, so one person's experiment breaks it for the next, and nobody is sure what state it is in. People stop trusting it and try things somewhere that matters more.
    - title: Onboarding runs on a senior engineer's time
      text: Every new hire needs someone to walk them through the stack, and that someone is the engineer you can least spare. The walkthrough lives in their head and changes every time they give it.
  capabilities:
    - title: Your stack, not a generic sandbox
      text: Start from the standard workshop image, the Java or conda one, or an image of your own with your tools in it, and add more with extension packages and setup scripts. Each Session can have a Git server of its own to push to, SSH access into its container, and credentials generated for it, or passed in through the REST API for your other systems.
      features: [workshop-environments, built-in-services, portal-rest-api]
    - title: Real environments, up to cluster admin
      text: Give each engineer a Kubernetes namespace with quotas and RBAC, a virtual cluster with cluster admin to install operators in and break, or, with KubeVirt in the cluster, a virtual machine. It runs on a cluster you keep for training, as the docs recommend, away from production.
      features: [isolated-sessions]
    - title: Workshops kept like code
      text: Workshops are Markdown in Git, reviewed in pull requests and versioned with the systems they teach, then deployed from a tag in Git or from an OCI image. A standing portal for the team can replace each workshop environment on a schedule, so it starts clean again.
      features: [publishing-workshops, training-portal]
    - title: On a cluster you own
      text: Educates runs on a Kubernetes cluster you own, on EKS, GKE, OpenShift or any cluster with an ingress controller, so the training, and the internal code and tools it uses, stay on infrastructure you control.
      features: [runs-on-your-cluster]
      educates4Text: Educates runs on a Kubernetes cluster you own, on EKS, GKE, OpenShift or any cluster with an ingress controller, so the training, and the internal code and tools it uses, stay on infrastructure you control. Where the cluster has no internet access, install it air-gapped, from the image list each release publishes, mirrored into your own registry.
      educates4Features: [runs-on-your-cluster, air-gapped-install]
  bring:
    - title: Sign-in through your identity provider
      text: The training portal has its own accounts, or anonymous access, and nothing else. For engineers to sign in with your company's identity provider, a front end of yours handles sign-in and requests Sessions through the REST API.
      docs: https://docs.educates.dev/en/stable/portal-rest-api/client-authentication.html
    - title: A record of who completed what
      text: Nothing keeps a history of who finished which workshop. The portal can post events to your webhook as Sessions start, pages are viewed and Sessions finish; storing them, and turning them into an onboarding report, is a service you build.
      docs: https://docs.educates.dev/en/stable/custom-resources/training-portal.html#collecting-analytics-on-workshops
    - title: No trainer view
      text: There is no view of how far each engineer has got through a workshop. A mentor finds out the usual way, by asking or by looking over a shoulder.
    - title: No video
      text: Educates does not include video or virtual classroom features. For a live session with a remote team, run it beside the meeting tool you already use.
      docs: https://docs.educates.dev/en/stable/project-details/platform-comparison.html#where-educates-fits
  proof:
    content:
      - kind: Blog post
        title: Deploying Educates yourself
        href: /blog/deploying-educates-yourself
      - kind: Blog post
        title: Clickable actions in workshops
        href: /blog/clickable-actions-in-workshops
      - kind: Features
        title: Every Feature, by the job it serves
        href: /features
      - kind: Guide
        title: The Getting Started Guides
        href: /getting-started-guides
    hubWorkshops:
      - lab-virtual-cluster
      - lab-git-repositories
---

A team's training setup has four parts, and all of them are yours.

1. **A cluster for training.** Create a Kubernetes cluster used only for
   Educates, not one that runs anything else, and install Educates on it with
   the `educates` CLI. The
   [cluster requirements](https://docs.educates.dev/en/stable/installation-guides/cluster-requirements.html)
   cover sizing, the ingress controller, wildcard DNS and Kyverno.
2. **Workshops in Git.** Each workshop is a `Workshop` definition and its
   Markdown pages in a Git repository. Start one with `educates new-workshop`
   and write it against a local cluster on your laptop first.
3. **Published by version.** Educates downloads a workshop's content from a
   branch or tag in Git, or from an OCI image that `educates publish-workshop`
   or the GitHub action publishes when you push a version tag.
4. **A standing portal.** A `TrainingPortal` lists the team's workshops.
   Engineers register an account and start a Session when they need one, and
   each Session expires after the time you set.

This workshop starts from the Java 21 image, downloads its content from a tag
in your own Git server, and gives every Session a virtual cluster and a Git
server of its own:

```yaml title="workshop.yaml"
apiVersion: training.educates.dev/v1beta1
kind: Workshop
metadata:
  name: platform-onboarding
spec:
  title: Shipping a service on our platform
  description: Build, deploy and roll back a service the way our teams do
  workshop:
    image: jdk21-environment:*
    files:
      - git:
          url: https://git.example.com/platform/onboarding-workshop
          ref: v1.4
        includePaths:
          - /workshop/**
          - /exercises/**
          - /README.md
  session:
    applications:
      vcluster:
        enabled: true
      git:
        enabled: true
```

The
[Workshop reference](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html)
covers custom images, extension packages, secrets and the rest. To write a
first workshop of your own before any of this, the
[Getting Started Guides](/getting-started-guides) take you from installing
the CLI to a workshop running on your laptop.
