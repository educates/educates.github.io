---
name: Local authoring
job: authoring
sentence: Create a workshop and a local Kind cluster with the educates CLI, then update the content of a running Session as you write.
docs: https://docs.educates.dev/en/stable/getting-started/creating-a-workshop.html
flagship: true
order: 20
homepage: 3
page:
  headline: Write workshops on your own machine, and see each change in a running Session
  what: The educates CLI runs all of Educates on your laptop. One command creates a Kind cluster with Educates in it and an image registry beside it, and another creates a workshop from a template. Publish it to that registry, deploy it, open it in the training portal, and see changes to its instructions as you save them, without publishing anything to a third party site.
  loop:
    alt: An instruction page is edited and saved on the laptop, and the running Session's instructions refresh to show the change.
  things:
    - title: Educates on your laptop in one command
      text: One command, educates create-cluster, creates a Kind cluster, installs Educates in it, and runs an image registry beside it for workshop content and workshop images of your own. Another, educates delete-cluster, removes the cluster when you are done.
    - title: A new workshop from a template
      text: The command educates new-workshop creates a workshop's directory, with instructions in Markdown, the workshop definition in resources/workshop.yaml, and settings to publish it to the local registry. Options set its title, its description and the workshop image it starts from.
    - title: Publish, deploy and open it
      text: The command educates publish-workshop packs the content as an OCI image and pushes it to the local registry, educates deploy-workshop creates the workshop in the cluster, and educates browse-workshops opens the training portal to start a Session.
    - title: See the instructions change as you save
      text: The command educates serve-workshop serves the instructions from your machine to the Sessions in the cluster, and regenerates and refreshes the page each time you save. For other files, update-workshop in the Session's terminal pulls the latest published content and reruns the setup scripts, without a new Session.
    - title: One workshop in Docker, no Kubernetes
      text: To try a workshop, or to show a product on a laptop, run a single workshop in one container on Docker, with no Kubernetes cluster at all.
  limits:
    - title: macOS or Linux, Docker, and free ports
      text: The CLI runs on macOS or Linux, and on Windows only through WSL. It needs a working Docker, tested mostly with Docker Desktop, or Colima on macOS, with memory to spare, no other Kind cluster running, and ports 80, 443 and 5001 free, plus 53 for the local DNS resolver on macOS.
      docs: https://docs.educates.dev/en/stable/getting-started/quick-start-guide.html#host-system-requirements
    - title: No TLS until you bring a domain
      text: By default the cluster answers on a nip.io address with no TLS certificate, and some parts of a Session need one, such as an image registry for each Session. A domain of your own, with DNS pointing at your machine and a wildcard certificate the CLI can install, turns them on. Some home routers also block nip.io addresses.
      docs: https://docs.educates.dev/en/stable/getting-started/local-environment.html#custom-ingress-domain
    - title: Live instructions, not live everything
      text: Only the instructions come from your machine, and serving them needs Hugo installed. Setup scripts and exercise files still need publishing again and a new Session, and the CLI expects the local Kind cluster unless you point Sessions at your machine through a tunnel.
      docs: https://docs.educates.dev/en/stable/workshop-content/working-on-content.html#proxy-to-local-workshop-content
    - title: Reserved Sessions hold old content
      text: A portal with reserved Sessions hands you one created before your last change. While you write, the docs advise a portal with reserved Sessions turned off, so each new Session starts from the latest content.
      docs: https://docs.educates.dev/en/stable/workshop-content/working-on-content.html#disabling-reserved-sessions
    - title: An update does not undo the cluster
      text: Updating a running Session's files does not undo what earlier steps did in the cluster. To replay steps that deployed something, undo it by hand or start a new Session.
      docs: https://docs.educates.dev/en/stable/workshop-content/working-on-content.html#live-updates-to-the-content
    - title: One container, no cluster
      text: A workshop in Docker runs in a single container, with no Kubernetes namespace, virtual cluster or VM. A workshop that needs any of them runs on the Kind cluster instead.
      docs: https://docs.educates.dev/en/stable/project-details/platform-architecture.html#local-deployment
  hubWorkshops:
    - lab-educates-workshop
  reading:
    - kind: Docs
      title: Quick Start Guide
      href: https://docs.educates.dev/en/stable/getting-started/quick-start-guide.html
    - kind: Docs
      title: Creating a Workshop
      href: https://docs.educates.dev/en/stable/getting-started/creating-a-workshop.html
    - kind: Docs
      title: Working on Content
      href: https://docs.educates.dev/en/stable/workshop-content/working-on-content.html
    - kind: Guide
      title: Workshop basics
      href: /getting-started-guides/authoring/basics
    - kind: Guide
      title: Live editing
      href: /getting-started-guides/authoring/live-edit
    - kind: Blog post
      title: Your first workshop
      href: /blog/your-first-workshop
    - kind: Blog post
      title: How to best work locally
      href: /blog/how-to-best-work-locally
---

Create the local cluster once:

```shell
educates create-cluster
```

Then create a workshop, and from its directory, publish it to the local
registry, deploy it and open the training portal:

```shell
educates new-workshop lab-new-workshop
cd lab-new-workshop
educates publish-workshop
educates deploy-workshop
educates browse-workshops
```

The docs recommend workshop names that start with `lab-` and run to 25
characters or fewer, because Educates adds prefixes and suffixes to them.

The workshop definition the template writes pulls its content from the local
registry. Educates fills in `$(image_repository)` and `$(workshop_version)`
when you publish and deploy, so the same definition works for a remote
registry later:

```yaml title="resources/workshop.yaml"
spec:
  workshop:
    files:
    - image:
        url: $(image_repository)/lab-new-workshop-files:$(workshop_version)
      includePaths:
      - /workshop/**
      - /exercises/**
      - /README.md
```

To see changes to the instructions as you save them, serve them from your
machine:

```shell
educates serve-workshop --patch-workshop
```

Start a new Session from the portal, and each page you save shows up in it.
Stop the command with Ctrl-C, and the workshop goes back to its published
content. After a change to `resources/workshop.yaml`, `educates
update-workshop` updates the workshop in the cluster, and
`educates delete-workshop` removes it.

To run one workshop in Docker instead, with no cluster,
`educates docker workshop deploy` starts it in a single container.
