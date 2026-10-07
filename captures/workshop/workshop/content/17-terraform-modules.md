---
title: A cluster of your own, with Terraform
---

The Educates Terraform modules create an EKS or GKE cluster with what
Educates needs, and install Educates on it. Start from the root module for
your cloud, and put your settings in `environment.tfvars`:

```editor:open-file
file: ~/exercises/terraform/educates-on-eks/environment.tfvars
```

Then create the cluster, with Educates on it:

```workshop:copy
text: terraform apply -var-file environment.tfvars -auto-approve
```

And remove it all when you are done:

```workshop:copy
text: terraform destroy -var-file environment.tfvars -auto-approve
```

```editor:execute-command
command: workbench.action.closeAllEditors
hidden: true
autostart: true
```

```editor:execute-command
command: workbench.files.action.collapseExplorerFolders
hidden: true
autostart: true
```
