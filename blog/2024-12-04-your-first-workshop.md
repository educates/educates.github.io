---
slug: your-first-workshop
title: Your first workshop
authors: [jorge]
tags: [getting-started, authoring, educates]
---

Now that you have [created your local cluster](/blog/getting-started-on-kind) it's time to create your first
workshop. 

Educates CLI provides commands to get you started, and provides you with a skeleton of a workshop. This
workshop is not going to have any addition, but we will be augmenting this workshop's content and capabilities
in later posts.

<!-- truncate -->

Let's get started and create the skeleton of our workshop:

```bash
educates new-workshop my-workshop --name "my-workshop" --title "My first workshop" --description "First workshop using Educates"
```

In the above command we first, give it a path `my-workshop` that will be created on our current directory
where all the workshop files will be created. Then, we provide a few flags that will be part of our
workshop definition.

If we list the contents of this new folder, we see everything that's being created out of the box:

```bash 
$ tree my-workshop
my-workshop
├── README.md
├── resources
│   └── workshop.yaml
└── workshop
    ├── config.yaml
    └── content
        ├── 00-workshop-overview.md
        ├── 01-workshop-instructions.md
        └── 99-workshop-summary.md
```

The definition of the workshop is the `resources/workshop.yaml` file. This is a Custom Resource Definition
(CRD) of kind `Workshop` and apiVersion `training.educates.dev/v1beta1`. This is the key file for Educates as
this is what will provide all the workshop definition (but not the workshop content).

Workshop definition means things like title and description of the workshop, location of the content files,
workshop capabilities that should be present and how (terminal, editor, console/dashboard, docker, registry, vcluster, ...) as well as workshop sandbox sizing. 

Don't worry too much about all of these as we will dig deeper in later posts. The thing that matters most is 
that this is the file that will be applied into your Kubernetes cluster and that will install the workshop
on the cluster (although it will not instantiate it).

Then, we can see that there's a folder named `workshop`, where we will have the `content`, written in Markdown,
following [Hugo](https://gohugo.io) conventions. 

We can now apply this file to the Educates cluster using Kubectl, and see what happens.

```
kubectl apply -f resources/workshop.yaml
```

When you list the workshop resources in the cluster, you will see nothing interesting:

````
$ kubectl get workshop
NAME          URL
my-workshop
```

And a more descriptive description will not give you much info still:
```
$ kubectl describe workshop my-workshop
Name:         my-workshop
Namespace:
Labels:       <none>
Annotations:  <none>
API Version:  training.educates.dev/v1beta1
Kind:         Workshop
Metadata:
  Creation Timestamp:  2024-12-04T18:09:45Z
  Generation:          1
  Resource Version:    3505
  UID:                 e9062380-8964-4041-9955-c74322729390
Spec:
  Description:  First workshop using Educates
  Publish:
    Image:  $(image_repository)/my-workshop-files:$(workshop_version)
  Session:
    Applications:
      Console:
        Enabled:  false
      Docker:
        Enabled:  false
      Editor:
        Enabled:  true
      Registry:
        Enabled:  false
      Terminal:
        Enabled:  true
        Layout:   split
      Vcluster:
        Enabled:  false
    Namespaces:
      Budget:  medium
  Title:       My first workshop
  Workshop:
    Files:
      Image:
        URL:  $(image_repository)/my-workshop-files:$(workshop_version)
      Include Paths:
        /workshop/**
        /exercises/**
        /README.md
      Path:  .
Events:      <none>
```

This is because of 2 reasons:

1. The workshop is just a static definition. There's another resource named `TrainingPortal` which is
actually the one that will instantiate the workshops and make them available for access.
1. The workshop contents are nowhere but your local folder. The cluster can't access them in any way.

Let's solve both problems at once by using Educates CLI capabilities.

Let's first publish the workshop. In the workshop definition file we will find a section that describes
where Kubernetes could find the workshop files

```
  workshop:
    files:
    - image:
        url: "$(image_repository)/my-workshop-files:$(workshop_version)"
      includePaths:
      - /workshop/**
      - /exercises/**
      - /README.md
```

This snippet instructs Kubernetes that the image at the provided `url` is the one that contains the 
workshop contents, and that it should only look at the `workshop` and `exercises` folders.

Educates, when is instantiating a Workshop will pull down this OCI image and extract it and use the content
in those folders as the workshop content. Fine, but that URL looks weird.

This is where the publish section of the workshop definition comes into play.

```
  publish:
    image: "$(image_repository)/my-workshop-files:$(workshop_version)"
```

Educates, when publishing a workshop, will package your local folder up into an OCI image and will push it
into the specified image registry's coordinates.

Fine! But that URL still looks like something not in the Internet. True!

By default, when developing locally, Educates CLI is configured to replace `$(image_repository)` and `$(workshop_version)` and use the local cluster's coordinates, which it knows very well.

So, let's go ahead and publish this workshop and see what happens:

```
$ educates publish-workshop
Processing workshop with name "my-workshop".
Publishing workshop files to "localhost:5001/my-workshop-files:latest".
dir: .
file: .gitignore
file: README.md
dir: resources
file: resources/workshop.yaml
dir: workshop
file: workshop/config.yaml
dir: workshop/content
file: workshop/content/00-workshop-overview.md
file: workshop/content/01-workshop-instructions.md
file: workshop/content/99-workshop-summary.md
Pushed 'localhost:5001/my-workshop-files@sha256:4b6b6e165357f691460c05f6637fa35df649a572ca6ae3b2154bae6e8c4bd2c7'
```

You wll notice that the image name at the second line of the output contains a well formed 
OCI registry's image coordinates. The host is `localhost:5001` and the version is latest.

Educates Training Platform's local cluster provides a local Docker registry, wired up into the cluster,
that is accessible from the outside of the cluster at `localhost:5001`  but internally is located at
`registry.default.svc.cluster.local` as a Kubernetes service.

Let's now push the workshop into the cluster. But this time, we will use the Educates CLI.

```
$ educates deploy-workshop
Loaded workshop "educates-cli--my-workshop-805a574".
Creating new training portal "educates-cli".
Workshop added to training portal.
```

Here, even though the output is not very verbose, it it very interesting. First, a workshop has been
created with a hashed name `educates-cli--my-workshop-805a574`. This hash is made to prevent collisions 
but at the same time to provide reproducibility. The former is achieved by giving a longer name that contains
the name of the TrainingPortal, the workshop and a hash on the configuration file. The latter, given that
the hash is done on the configuration, if you alter the configuration, a new workshop instance will be created,
otherwise, if you just update the content, the same workshop definition will still be applicable.

The second line states that a new Training Portal has been created. Let's verify that:

```
$ kubectl get trainingportal
NAME           URL                                                PORTALPASSWORD   ADMINUSERNAME   ADMINPASSWORD                      STATUS    MESSAGE
educates-cli   http://educates-cli-ui.kind.mac16.tanzu-devs.com   %qKPg:jg5zB9     educates        TPq5pMNr7iDXc8Fg0n2BvZtGK4EVskaI   Running
```

In this output, there's now a single trainingportal with name `educates-cli` and there's a URL now and a portal password. When you click on this URL, you should now see an Educates screen asking you to provide a password.
This is the portal password. Once you input the portal password you have there, you should see the main Training Portal screen with the list of Workshops for that Portal. In this case, that will be your `My workshop`.


