---
sidebar_position: 4
---
# Startup and Interactivity

Two things are very important for great workshops:

- a **proper environment**, with basic tooling and configuration
   already installed
- **flexibility** to try out (and break) things in a **fast feedback loop**,
   while still being able to follow a golden path **golden path** and being set
   up for success.

Educates can help with both concerns out of the box, in multiple ways -
let's see how!

## Preparing a Workshop Session

Educates provides a mechanism for ensuring a proper workshop environment,
with configuration and installation of additional tools needed for a workshop
already installed: `workshop/setup.d/`.

Educates will bundle all scripts matching `workshop/setup.d/*.sh` within your
workshop repository for later use in the workshop session.

Upon startup, these scripts get executed from inside `/home/eduk8s/`, and have
access to a wide range of so-called _data variables_, specific environment
variables containing information about the workshop session.

This way, we can do things like...

- ...generating Kubernetes manifests with session-specific information
   (e.g. Ingress Hostnames)
- ...install additional tools not included in the workshop session image
   by default
- fetch additional files or information from 3rd-party APIs

upon session start.

:::warning[Setup scripts and session restarts]
    If a user e.g. closes their browser and resumes the session at a later
    point (made possible with session cookies), **all scripts** in
    `workshop/setup.d` get **executed again**.

    Thus it's important to keep **idempotency** in mind when creating your
    scripts.
:::

### Generating Manifests on Session Start

Building on the mentioned use-cases above, let's look at an example setup
script and include it in our demo-workshop:

1. Create the `workshop/setup.d` directory.   
   ```sh title="Create the setup directory"
   mkdir -p workshop/setup.d
   ```
2. Create a new script `workshop/setup.d/write-ingress.sh`.
   ``` sh title="Create the script"
   vim workshop/setup.d/write-ingress.sh
   ```
3. Copy-paste the script's content.
   ```sh title="Contents of the script"
   #! /bin/sh

   # Create Ingress manifest template
   cat << EOF > ~/ingress.in.yaml  # = /home/eduk8s/ingress.in.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
      name: ${SESSION_NAME}
      namespace: ${SESSION_NAMESPACE}
   spec:
   rules:
   - host: ${SESSION_HOSTNAME}
     http:
       paths:
       - path: /
         pathType: Prefix
         backend:
           service:
             name: app1-service
             port:
               number: 80
   EOF

   # Generate templated manifest
   envsubst < ~/ingress.in.yaml > ~/ingress.yaml

   # Cleanup
   rm ~/ingress.in.yaml
   ```
4. Publish and redeploy the new version of the demo workshop.
   ``` sh title="Redeploy the demo workshop"
   educates publish-workshop
   educates deploy-workshop
   ```
5. Start a new workshop session and take a look at `~/ingress.yaml`.   

## Guiding Users with Clickable Actions

A properly setup environment goes a long way already, but what if users break
things, misconfigure their environments as they go, or get stuck otherwise?

Great workshops find ways to mitigate such situations or bring users back
on the golden path to follow throughout the workshop, and Educates includes
a few different features enabling us to do exactly that - **clickable actions**.

### How Clickable Actions Work

On the authoring side, clickable actions are equal to **annotated fenced code blocks**
with a **special syntax** depending on the **type** of clickable action.

There are different categories of clickable actions:

- `terminal`: execute or terminate commands, collect input
- `workshop`: collection of utilities, e.g. copying to the clipboard
- `dashboard`: adding, reloading, and deleting tabs to the dashboard
- `editor`: opening and searching through files in the editor
- `files`: up/download of files to/from the session
- `examiner`: automatically evaluated tests/quizzes within the session
- `section`: toggling sections to hide/show

An example of a clickable action that executes a command in the session's terminal
would look like this:

~~~md title="Clear terminal and curl google.com"
```terminal:execute
prefix: Run
title: cURL google.com
command: curl https://google.com
clear: true
```
~~~

The resulting block in the rendered instructions would look like this, clearly
color-coded depending of its state:

![Screenshot of a clickable action pre-execution](img/clickable-action.png)
![Screenshot of a succeeded action](img/clickable-action-success.png)
![Screenshot of a failed action](img/clickable-action-failure.png)

### Quizzing Users

Let's add a clickable action to our workshops that checks a user's basic Linux
knowledge by having them create a file with a specific content in a given directory.

`examiner` clickable actions rely on executable scripts in `workshop/examiner/tests/`
that which evaluate the condition to be checked by the test/quiz. Thus, we will have
to create a short script as well as the markdown block for the clickable action.

1. Create the directory `workshop/examiner/tests`.
   ```sh title="Create workshop/examiner/tests"
   mkdir -p workshop/examiner/tests
   ```
2. Create a new file `workshop/examiner/tests/test-hello-world-file`.
3. Copy-paste the following content to the file.
   ```sh title="Create test script"
   #! /bin/sh
   [ -f ~/hello/world ] && grep "It's me!" ~/hello/world > /dev/null
   ```
4. Make the script executable.
   ```sh title="Make test script executable"
   chmod +x workshop/examiner/tests/test-hello-world-file
   ```
5. Copy-paste the following action block to the workshop instructions.
   ~~~
   ```examiner:execute-test
   title: Create a file ~/hello/world with content "It's me!"
   name: test-hello-world-file
   retries: .INF
   ```
   ~~~

In addition, we will have to **enable the `examiner` feature** for
our workshop in `resources/workshop.yaml`:

```yaml title="Enable the examiner for the workshop" hl_lines="25-26"
apiVersion: training.educates.dev/v1beta1
kind: Workshop
metadata:
  name: "demo-workshop"
spec:
  title: "Workshop"
  description: "Workshop description."
  publish:
    image: "$(image_repository)/demo-workshop-files:$(workshop_version)"
  workshop:
    files:
      - image:
          url: "$(image_repository)/demo-workshop-files:$(workshop_version)"
        includePaths:
          - /workshop/**
          - /exercises/**
          - /README.md
  session:
    namespaces:
      budget: medium
    applications:
      terminal:
        enabled: true
        layout: split
      examiner:
        enabled: true
      editor:
        enabled: true
      console:
        enabled: false
      docker:
        enabled: false
      registry:
        enabled: false
      vcluster:
        enabled: false
```

Once this is done, we can **publish and deploy** the workshop again using the Educates CLI.
Afterwards, we should be able to spot the clickable examiner action in the rendered
instructions. Observe what happens when you click it before and after you create the file
as required!