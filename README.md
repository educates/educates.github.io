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
