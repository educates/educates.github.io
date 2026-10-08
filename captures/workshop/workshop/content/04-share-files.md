---
title: Share files with your machine
---

Copy the application's address to paste it anywhere:

```workshop:copy
text: "{{< param ingress_protocol >}}://frontend-{{< param session_hostname >}}/"
```

Download the kubeconfig for your namespace, to use `kubectl` from your own
machine:

```files:download-file
path: .kube/config
download: bookshelf-kubeconfig.yaml
```

Upload a reading list of your own, and Bookshelf serves it next:

```files:upload-file
path: reading-list.json
```

The file arrives in your uploads directory:

```terminal:execute
command: ls -l ~/uploads
```
