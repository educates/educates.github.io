---
slug: terraform-quickstart
title: Terraform deployment quickstart
authors: [bill]
tags: [educates, terraform]
---

Hi all, we are happy to announce we are now sharing the [Educates Terraform Modules project](https://github.com/educates/educates-terraform-modules) that provides support for deploying Educates on Amazon and Google Cloud providers.

Its [release versions](https://github.com/educates/educates-terraform-modules/releases) are independent from the [Educates Training Platform releases](https://github.com/educates/educates-training-platform/releases);
however, it is currently tested and verified to work on Educates 3.2.x and 3.3.x on Kubernetes version 1.32.

We've provided the quick start here so you can experiment with it and give feedback.

<!-- truncate -->

---

## Why?

If you read the [*Installing Educates on a cloud provider* article](/blog/install-educates-cloud-cli) and/or watched the accompanying [video](https://www.youtube.com/watch?v=C6vCd6Nhf5M),
you would notice that Educates requires a preliminary setup of a Kubernetes cluster before you can install Educates.

You *could* install Kubernetes (K8s) yourself,
especially if are a Certified Kubernetes Administrator (CKA).
But really it is more convenient to automate the K8s cluster provisioning as much as possible.

We selected [Terraform](https://developer.hashicorp.com/terraform) given its widespread use in DevOps and Platform Engineering domains.

---

## What is provided and supported?

The [Educates Terraform Modules project](https://github.com/educates/educates-terraform-modules) include several modules:

1.  **Infrastructure modules**: deploy K8s cluster
    - [EKS cluster for Educates](https://github.com/educates/educates-terraform-modules/tree/main/infrastructure/eks-for-educates): Deploy K8s on Amazon EKS
    - [GKE cluster for Educates](https://github.com/educates/educates-terraform-modules/tree/main/infrastructure/gke-for-educates): Deploy K8s on Google GKE
    - [Kubeconfig generation support](https://github.com/educates/educates-terraform-modules/tree/main/infrastructure/token-sa-kubeconfig): Create a service account and secret for kubeconfig access

1.  **Platform**
    - [Educates](https://github.com/educates/educates-terraform-modules/tree/main/platform/educates): Deploy Educates Ingress related prerequisites, Lookup Service, and Educates Training Platform

1.  **Root Modules**: Reference implementations for installing Educates using Infrastructure and Platform modules
    - [Educates on EKS](https://github.com/educates/educates-terraform-modules/tree/main/root-modules/educates-on-eks)
    - [Educates on GKE](https://github.com/educates/educates-terraform-modules/tree/main/root-modules/educates-on-gke)

The [Educates Terraform Module project](https://github.com/educates/educates-terraform-modules) is released independently from the [Educates Training Platform](https://github.com/educates/educates-training-platform);
however, is currently tested and verified to work on Educates 3.2.x and 3.3.x.

You can see the project releases [here](https://github.com/educates/educates-terraform-modules/releases).

:::note

Consider the **Root Modules** reference implementation only.
You should build your own using the infrastructure and platform modules,
using the reference implementations as inspiration.

We'll discuss limitations later in this article.

:::
---

## Quick start

Getting started is easy.

In this example, we'll walk through deploying Educates on GKE using Terraform,
from your development workstation.

You'll need some set up first.

### What you should know before running it?

We expect that you have a basic understanding of the following:

-   Kubernetes (K8s)

-   Your Cloud Provider (Amazon or Google): You should understand how to manage network,
    compute, storage, IAM users, policies and roles, K8s, and basic billing concepts

-   Terraform

-   Educates installation process - we recommend you have already reviewed the following:
    - [How the installer works](/blog/how-installer-works-part-1)
    - Installing Educates on a cloud provider parts [one](/blog/install-educates-cloud-cli) and [two](/blog/verify-educates-cloud-install).

### How much will running this cost?

If you've followed the instructions in the [Configure Terraform variables](#configure-terraform-variables) section,
and use the `main.tfvars.example` template,
your cluster and compute costs will be low.

You should be able to setup, test, and tear down your Educates cluster within a 24 hour period,
and stay within a $5-10 USD range.

### Prerequisites

You'll need the following before you start:

1.  **Amazon or Google Cloud IAM account**:
    With sufficient privileges to create/update/delete (for this example we use Google):
    - VPC/Network resources
    - K8s cluster
    - Compute and Storage
    - DNS Zones

2.  **Educates Cluster Ingress DNS Zone configuration**:
    You'll need DNS configuration for your Educates cluster.
    You can read more about configuring that:
    - [Prerequisites](/blog/install-educates-cloud-cli#prerequisites)
    - [Cloud DNS Prerequisites](/blog/install-educates-cloud-cli#example-using-google-cloud)

3.  **Developer workstation**:
    - Mac OSX
    - Linux distribution
    - Windows Subsystem for Linux (WSL)

4.  **Cloud provider CLI**:
    For this example, [install and use `gcloud`](https://cloud.google.com/sdk/docs/install).
    You will also need to authenticate via an IAMS per #1 interactively,
    and also for the sdk:

    ```bash
    gcloud auth login
    ... # auth interactively
    gcloud auth application-default login
    ... # auth interactively
    ```

5.  **Terraform CLI**:
    You can install or manage specific versions of terraform with [`tfenv`](https://github.com/tfutils/tfenv).

    The following installs, sets and verifies the version of terraform we are using in the quick start:

    ```bash
    tfenv install 1.12.1
    tfenv use 1.12.1
    terraform version
    ```

    You should see Terraform version successfully installed:

    ```no-highlight
    Terraform v1.12.1
    on {platform}
    ```

6.  [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl):
    We'll need access to the cluster after deployment.

7.  **Educates CLI**:
    We'll need to deploy/manage a workshop to verify the cluster by either method:
    - Download the [Educates CLI directly](https://github.com/educates/educates-training-platform/releases/tag/3.3.2),
    - Use the [Educatesenv tool to manage the installation of Educates](/blog/managing-multiple-versions-of-educates-cli).
    Here we will deploy Educates 3.3.2.

### Root Module Reference implementations

We'll use the GKE reference implementation Terraform plan [here](https://github.com/educates/educates-terraform-modules/tree/main/root-modules/educates-on-gke).
You can read how to run it [here](https://github.com/educates/educates-terraform-modules/blob/main/root-modules/educates-on-gke/README.md).

Alternatively, you could use the one for Amazon Elastic Kubernetes Service (EKS) [here](https://github.com/educates/educates-terraform-modules/tree/main/root-modules/educates-on-eks).

To prepare for running the quick start,
do the following:

1.  Open a bash or zsh terminal.

1.  Set up a project directory of your choice on your developer workstation,
    and change your current directory to it.

    For example:

    ```bash
    mkdir ~/workspace
    cd ~/workspace
    ```

1.  Fork/clone the Educates Terraform modules repo:

    ```bash
    git clone https://github.com/educates/educates-terraform-modules.git
    ```

1.  Change your working directory to the GKE root module directory
    (from where we will run the terraform plan):

    ```bash
    cd educates-terraform-modules/root-modules/educates-on-gke
    ```

### Configure Terraform variables

Review the [Configuration examples](https://github.com/educates/educates-terraform-modules/tree/main?tab=readme-ov-file#configuration-examples).

For this example,
we'll use the [`main.tfvars.example`](https://github.com/educates/educates-terraform-modules/blob/main/root-modules/educates-on-gke/examples/main.tfvars.example) as a template from which to build the `main.tfvars`.

1.  Copy the example template to `main.tfvars` file:

    ```bash
    cp ./examples/main.tfvars.example ./main.tfvars
    ```

1.  Configure the placeholder variables in the `main.tfvars` file:
    - `gcp_project_id`: your Google Cloud project id where you will deploy the cluster
    - `gcp_region`: Google Cloud region where you will deploy the cluster
    - `cluster_name`: Pick a name for your cluster (should be between 6-12 characters)
    - `educates_ingress_domain`: the domain associated with the DNS zone configured for your Educates cluster

1.  Notice the `deploy_educates` configuration flag.
    By default, the root modules assume you want to deploy Educates using the [Educates Platform module](https://github.com/educates/educates-terraform-modules/tree/main/platform/educates).
    It uses the [Carvel *Kapp Controller*](https://carvel.dev/kapp-controller/) for reconciliation of Educates components into the cluster.

    If you prefer to install Educates via the CLI as in [Installing Educates on a cloud provider article](/blog/install-educates-cloud-cli),
    set the `deploy_educates` flag to `false`.
    The Educates module will not be deployed.

### Prepare and run the plan to deploy cluster

1.  Initialize terraform in your development workspace:

    ```bash
    terraform init
    ```

    You can see a similar output:

    <AsciinemaPlayer src="/asciinemas/terraform-init.cast" autoPlay={true} loop={true} />

1.  Run the plan (this step is optional, but useful if you need to cache the plan in a CI/CD workflow):

    ```bash
    terraform plan -var-file ./main.tfvars
    ```

    You can see a similar output:

    <AsciinemaPlayer src="/asciinemas/terraform-plan.cast" autoPlay={true} loop={true} />

1. Apply the plan:

    ```bash
    terraform apply -var-file ./main.tfvars
    ```

    Depending on your network connection speed/bandwidth,
    as well as Google's resource constraints,
    the plan may take 15-20 minutes to apply.

    You can see a similar output:

    <AsciinemaPlayer src="/asciinemas/terraform-apply.cast" autoPlay={true} loop={true} />

:::warning
Note that when running `terraform` cli commands,
you will be caching state of the plan in the working directory on your workstation into the following
directories/files:

- `.terraform`
- `.terraform.lock.hcl`
- `terraform.state`
- `terraform.state.backup`

State of the terraform plan and the associated cluster deployment workflow is not automatically saved elsewhere,
so if you were to modify or delete these resources,
you would not be able to update or destroy your cluster using Terraform.

This is one of the reasons these are just example reference implementations,
and it's up to you to know what you're doing.
You should use the released modules in your own plans,
taking inspiration from these reference implementations,
but guaranteeing to properly save the state of your plan executions.

:::

### Setup K8s access

The terraform plan will generate a kubeconfig file for you,
with a naming pattern of `kubeconfig-${cluster_name}-token.yaml`.
We'll verify K8s access here:


1.  Set KUBECONFIG to point to it in your terminal session:

    ```bash
    export KUBECONFIG=./kubeconfig-YOUR_CLUSTER_NAME-token.yaml
    ```

1.  Verify you can access cluster pods using your existing Google Cloud IAM session
    and provided `kubeconfig` access:

    ```bash
    kubectl get pods -A
    ```

   You can see a similar output:

  <AsciinemaPlayer src="/asciinemas/terraform-verify-k8s-pods.cast" autoPlay={true} loop={true} />

### Deploy a workshop and verify

You can verify the platform installation per the [Installing Educates on a cloud provider (Part 2 - Verification) article](/blog/verify-educates-cloud-install)

### Tear down cluster

When you are done with the cluster,
tear it down as follows:

```bash
terraform destroy -var-file ./main.tfvars
```

Given we are not using `-auto-approve`,
you will be prompted to review the plan.

Confirm with "yes".

You can see a similar output:

<AsciinemaPlayer src="/asciinemas/terraform-destroy.cast" autoPlay={true} loop={true} />


:::warning

If you removed your terraform state files,
you will not be able to run the `terraform destroy` command.

You would need to clean up your cluster resources manually in the following order:

- Educates portals and lookup service configuration resources
- Educates deployment
- Node pools
- GKE cluster
- Volumes
- VPC resources
- Custom policies/roles

:::

---

## Limitations

Note the following limitations of the provided [Educates Terraform root modules](https://github.com/educates/educates-terraform-modules/tree/main/root-modules):

1. Terraform state is not handled explicitly - it relies on the user to handle externally.
1. Continuous integration or continuous delivery pipelines are currently not supported.
1. They have not yet been tested in either commercial, enterprise, or large scale implementations.
1. They are currently considered reference implementation only.
1. Currently only Amazon EKS and Google GKE providers are supported.

We encourage you to give feedback through issues or pull requests so we can improve the deployment automation
experience.

---

## Conclusion

In this article,
we walked through provisioning Educates using Terraform on Google Cloud.

If you are an Amazon user, we encourage you to walk through the EKS root module provisioning.

Hopefully we've shown you the value of using Terraform to streamline your Educates deployment
workflow.
