# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.


## Building the Docker image

To build the docker image you will need to run the following command:

```
docker build --target <target> -t <tag> .
```

To deconstruct the above command:

- docker build - This is the command to build a docker image.
- --target <target> - This is the target to build. The target is the name of the stage in the dockerfile. Valid targets are dev, serve and caddy.
- -t <tag> - This is the name and tag of the image that will be built. The format is <name>:<tag>. The name can be anything you want. The tag is optional. If you do not specify a tag, latest will be used.
- . - This is the path to the build context. In this case we are using the current directory as the build context.

## Running the Docker Image
Depending on stage / target you will need to run the docker image differently.

### Running Dev target
To run the dev target you will need to run the following command:


```
docker run --rm -d -p 3000:3000 -v $(pwd):/opt/docusaurus <tag>
```

If using PowerShell you will need to use ${pwd} instead of $(pwd). On some systems you may need to replace $(pwd) with . or the full path to the directory you want to mount.

To deconstruct the above command:

- docker run - This is the command to run a docker image.
- --rm - This is an optional flag that will remove the container when it exits.
- -d - This is an optional flag that will run the container in detached mode.
- -p 3000:3000 - This is an optional flag that will map port 3000 on the host to port 3000 in the container.
- -v $(pwd):/var/docusaurus - This is an optional flag that will mount the current directory as a volume in the container.
- <tag> - This is the name and tag of the image that will be run. Make sure to use the same tag that you used when building the image.

### Running Serve target

To run the serve target you will need to run the following command:

```
docker run --rm -d -p 3000:3000 <tag>
```

To deconstruct the above command:

- docker run - This is the command to run a docker image.
- --rm - This is an optional flag that will remove the container when it exits.
- -d - This is an optional flag that will run the container in detached mode.
- -p 3000:3000 - This is an optional flag that will map port 3000 on the host to port 3000 in the container.
- <tag> - This is the name and tag of the image that will be run. Make sure to use the same tag that you used when building the image.

### Running Nginx target

To run the nginx target you will need to run the following command:

```
docker run --rm -d -p 8080:80 <tag>
```

If using PowerShell you will need to use ${pwd} instead of $(pwd). On some systems you may need to replace $(pwd) with . or the full path to the directory you want to mount.

To deconstruct the above command:

- docker run - This is the command to run a docker image.
- --rm - This is an optional flag that will remove the container when it exits.
- -d - This is an optional flag that will run the container in detached mode.
- -p 8080:80 - This is an optional flag that will map port 8080 on the host to port 80 in the container.
- <tag> - This is the name and tag of the image that will be run. Make sure to use the same tag that you used when building the image.

## Publishing workflow for GitHub

- Develop your code in branch `develop`
- Once you're done with your changes, commit them, push them and create a PR to incorporate the changes in `main`.
  ```
  git commit -m "Message"
  git push origin develop
  ```
- There's a workflow that will test that everything builds fine, and if everything is ok, you should be able to merge the PR into `main`
- There's a workflow that for the merged PR into `main` will also publish the generated site to `github pages` so that will become online
- You need to pull down `main` branch and merge it into `develop` locally for your next iteration.
  ```
  git checkout main
  git pull
  git checkout develop
  git merge main
  git push
  ```
