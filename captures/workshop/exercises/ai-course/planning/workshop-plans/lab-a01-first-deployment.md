# Workshop Plan: Your First Deployment

## Workshop Metadata

- **Name:** lab-a01-first-deployment
- **Title:** Your First Deployment
- **Description:** Deploy a web application to Kubernetes, expose it with a service, and scale it.
- **Duration:** 30m
- **Difficulty:** beginner
- **Type:** core
- **Prerequisites:** None
- **Status:** Mostly complete, [tasks](../tasks.md#workshop-a01-your-first-deployment)

## Workshop Configuration

- **Terminal:** Enabled (split layout)
- **Editor:** Enabled
- **Kubernetes access:** Enabled, with the console
- **Namespace budget:** medium

## Learning Objectives

After completing this workshop, the learner will be able to:

- Deploy an application from a manifest with `kubectl apply`.
- Expose it inside the cluster with a service.
- Scale it and watch Kubernetes keep the replicas running.

## Assumed Knowledge

Building and running a container image locally. No Kubernetes experience.

## Exercise Files to Create

### exercises/deployment.yaml

A deployment of the bookshelf web application, one replica, image
`nginxinc/nginx-unprivileged:1.27-alpine`, with a security context that
passes the restricted policy.

### exercises/service.yaml

A service named `bookshelf` on port 8080, selecting the deployment's pods.

## Page Plan

### 00-workshop-overview.md

What the learner builds, and what Kubernetes gives them that `docker run`
does not.

### 01-deploy-the-application.md

1. Open `deployment.yaml` in the editor and select the container spec.
2. Apply it with `kubectl apply`, then watch the pod start in terminal 2.
3. Examiner check: the deployment has one ready replica.

### 02-scale-the-application.md

1. Set `spec.replicas` to 3 with `editor:set-yaml-value`.
2. Apply, and delete one pod to show it being replaced.
3. Examiner check: three ready replicas.

### 99-workshop-summary.md

Recap, and a pointer to Workshop A02.
