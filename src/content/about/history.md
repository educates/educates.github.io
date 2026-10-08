---
title: History
description: "Where Educates came from: a tool for a team of developer advocates at VMware, then an independent open source project with its own GitHub organization."
order: 3
---

Educates began as a tool for one team: developer advocates who needed to
train people in Kubernetes and show developer tools running on it. Today it
is an independent open source project, and it teaches any topic that
benefits from a live environment.

```mermaid
---
config:
  timeline:
    disableMulticolor: true
---
timeline
    Dec 2019 : First commit
    Sep 2020 : SpringOne 2020
    Early 2021 : Learning Center fork
    Jun 2022 : Educates 2.0
    Aug 2024 : Educates 3.0
    Oct 2024 : Independent project
    Jun 2025 : Educates Hub
```

## A tool for developer advocates

The first commit to the Educates repository dates from December 2019.
[Graham Dumpleton](https://github.com/GrahamDumpleton) and
[Jorge Morales](https://github.com/jorgemoralespou) developed it while
working at VMware, for a team of developer advocates who needed to train
people in Kubernetes and show developer tools running on it.

The online SpringOne 2020 conference ran its workshops on Educates: over
5,000 were delivered, for an AWS bill of about $200, as VMware's
[Open Sourcing Educates](https://blogs.vmware.com/tanzu/open-sourcing-educates-platform/)
post recounts.

## Learning Center

At the beginning of 2021, VMware took a fork of Educates 1.x into the Tanzu
Application Platform as Learning Center. Workshops need changes to move
between the two, as the
[migration notes](https://docs.educates.dev/en/stable/workshop-migration/learning-center.html)
explain.

## Educates 2.0

Educates 2.0, released in June 2022, brought much of what defines Educates
today: installation with Carvel packages, a local Educates environment for
writing workshops, new workshop templates with GitHub actions to publish
them, Kyverno to enforce security policies, support for OpenShift, a
virtual cluster or a Git server for each Session, and an operator of its own
to copy secrets between namespaces.
The [release notes](https://docs.educates.dev/en/stable/release-notes/version-2.0.0.html)
list it all.

## Educates 3.0

Educates 3.0, released in August 2024, overhauled how the `educates` CLI
installs Educates and creates a local Kind cluster: kapp-controller was no
longer needed in the cluster, and the CLI gained opinionated installs to
cloud providers.

## An independent project

VMware became part of Broadcom in
[November 2023](https://investors.broadcom.com/news-releases/news-release-details/broadcom-completes-acquisition-vmware),
and in 2024 Broadcom's cuts left the project without active maintainers. Broadcom agreed to hand Educates over
to the community, and in October 2024 it
[became an independent project](/blog/educates-independent): it moved to
its own GitHub organization, [github.com/educates](https://github.com/educates),
and educates.dev became its website.

## Educates Hub

In June 2025, [Educates Hub](/blog/announcing-educates-hub) opened at
[hub.educates.dev](https://hub.educates.dev): a catalog of workshops, and of
extension packages for them, that you deploy on your own Educates.

## Who runs Educates

Two maintainers look after the project, as its
[MAINTAINERS](https://github.com/educates/educates-training-platform/blob/develop/MAINTAINERS.md)
file lists: Graham Dumpleton and Jorge Morales.

Five organizations have added themselves to its
[ADOPTERS](https://github.com/educates/educates-training-platform/blob/develop/ADOPTERS.md)
file: Broadcom, for Spring Academy, Kube Academy and Tanzu Academy;
NETWAYS, for the NWS Playground, internal learning platforms and workshops
on demand; 12F APS, for customer workshops and an internal sandbox;
TeraSky, for internal training, customer workshops and demo environments;
and Viam, for Viam Education's robotics courses. If you use Educates too, adding your organization to
that file helps the project more than you might think.

To follow what comes next, watch the
[releases](https://github.com/educates/educates-training-platform/releases),
or find the community on the [Community](/community) page.
