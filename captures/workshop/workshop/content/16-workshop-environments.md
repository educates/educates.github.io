---
title: Environments for other workshops
---

Not every workshop runs on the standard image. This one, for a Spring
application, starts from the Java image, adds the Java tools for the editor
as an extension package, and creates a database in each Session's
namespace:

```editor:open-file
file: ~/exercises/environments/lab-spring-petclinic/resources/workshop.yaml
line: 10
```

```editor:select-matching-text
file: ~/exercises/environments/lab-spring-petclinic/resources/workshop.yaml
text: "    image: jdk21-environment:*"
after: 9
```

A setup script clones the application and warms the build cache before the
learner arrives:

```editor:open-file
file: ~/exercises/environments/lab-spring-petclinic/workshop/setup.d/01-build-petclinic.sh
```

A workshop that needs a whole Linux machine creates a virtual machine for
each Session, with KubeVirt:

```editor:open-file
file: ~/exercises/environments/lab-linux-vm/resources/workshop.yaml
line: 35
```

```editor:select-matching-text
file: ~/exercises/environments/lab-linux-vm/resources/workshop.yaml
text: "    - apiVersion: kubevirt.io/v1"
after: 12
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
