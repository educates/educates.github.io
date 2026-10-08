# Module A: From Container to Kubernetes

The course's goals map onto three workshops. Deploying and exposing the
application come first, since every later step changes a running
deployment. Configuration follows, as the step most learners need next.
Health checks are an elective: useful, but no other workshop depends on
them.

## Workshop Structure Conventions

Each workshop described below includes:

- **Type**: whether this is a core (mandatory prerequisite) or elective workshop.
- **Status**: current workshop status and link to tasks.
- **Prerequisites**: which workshops must be completed first.
- **Learning objectives**: what the learner will be able to do after completing it.
- **Narrative arc**: the progression of the workshop from start to finish.

## Core Workshops

These workshops form the mandatory core sequence. Each one builds directly
on the previous and cannot be skipped.

### Workshop A01: Your First Deployment

**Detailed plan:** [workshop-plans/lab-a01-first-deployment.md](workshop-plans/lab-a01-first-deployment.md)

**Status:** Mostly complete, [tasks](tasks.md#workshop-a01-your-first-deployment)

**Type:** Core

**Prerequisites:** None (first workshop)

**Learning objectives:**

After completing this workshop, the learner will be able to:

- Deploy an application from a manifest with `kubectl apply`.
- Expose it inside the cluster with a service.
- Scale it and watch Kubernetes keep the replicas running.

### Workshop A02: Configuration and Secrets

**Detailed plan:** [workshop-plans/lab-a02-configuration.md](workshop-plans/lab-a02-configuration.md)

**Status:** Incomplete, [tasks](tasks.md#workshop-a02-configuration-and-secrets)

**Type:** Core

**Prerequisites:** Workshop A01: Your First Deployment

## Elective Workshops

These workshops branch off the core and can be taken in any order once
their prerequisites are met.

### Workshop A03: Health Checks and Self-Healing

**Detailed plan:** [workshop-plans/lab-a03-health-checks.md](workshop-plans/lab-a03-health-checks.md)

**Type:** Elective

**Prerequisites:** Workshop A01: Your First Deployment
