---
title: Next steps
description: Deploy a workshop from the Hub, find the reference docs, and get help.
order: 4
---

You have Educates running on your machine and a workshop of your own in it.
From here, try workshops other people wrote, go deeper in the docs, and ask
when you get stuck.

## Deploy a workshop from the Hub

The [Educates Hub](https://hub.educates.dev) is the project's catalog of
ready-made workshops. Each workshop's install command loads its definition
straight from the workshop's GitHub release into your cluster. For example,
the Kubernetes fundamentals workshop:

```sh title="Deploy a workshop from its release"
educates deploy-workshop -f https://github.com/educates/lab-k8s-fundamentals/releases/latest/download/workshop.yaml
```

The workshop joins yours on the same training portal, so open the portal as
before:

```sh title="Open the training portal"
educates browse-workshops
```

The first Session of a workshop can take a while to start, while the
cluster pulls the workshop's container image. Every workshop on the Hub has
its source on GitHub, so reading one is also a good way to see how others
build theirs.

When you are done with it, delete the workshop with the same URL:

```sh title="Delete the workshop"
educates delete-workshop -f https://github.com/educates/lab-k8s-fundamentals/releases/latest/download/workshop.yaml
```

## Clean up

When you no longer need the local cluster, delete it, and create it again
whenever you want it back:

```sh title="Delete the local cluster"
educates delete-cluster
```

The local image registry, with the workshops you published to it, stays
until you add `--all`, which also deletes the registry.

## Go deeper

[About Educates](/about-educates) explains how Educates is put together and
how a workshop goes from its source to a running Session. The
[Educates docs](https://docs.educates.dev) are the reference, and these
pages pick up where the guides stop:

- [Workshop instructions](https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html):
  every clickable action, and what your instructions can do.
- [Workshop definition](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html):
  every setting of `resources/workshop.yaml`, from the dashboard's
  applications to the resources each Session gets.
- [Hosting workshops on GitHub](https://docs.educates.dev/en/stable/getting-started/workshop-templates.html#hosting-workshops-on-github):
  publishing each tagged version of a workshop as a GitHub release, with
  the GitHub action the project provides.
- [Installation instructions](https://docs.educates.dev/en/stable/installation-guides/installation-instructions.html):
  installing Educates on a Kubernetes cluster of your own, for other people
  to use.

## Get help

Ask the community in the Educates channel on the
[Kubernetes Slack](https://kubernetes.slack.com/archives/C05UWT4SKRV), where
the team and other users answer, and report bugs as
[issues on GitHub](https://github.com/educates/educates-training-platform/issues).
[Get help](/get-help) has both, and how to hire the team when you need it
done for you.
