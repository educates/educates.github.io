# educates.dev

The Educates project's website, built with [Astro](https://astro.build/) as
a static site and published to GitHub Pages at <https://educates.dev>.

## Requirements

Node.js 26, pinned in `package.json` through [Volta](https://volta.sh/), and
npm.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs the dependencies. |
| `npm run dev` | Starts the dev server at `http://localhost:4321`. |
| `npm run build` | Builds the site into `dist/`, then runs the site check over it. |
| `npm run site-check` | Checks the build in `dist/` again without rebuilding it. |
| `npm run preview` | Serves the build in `dist/` locally. |
| `npm run check` | Type-checks the project with `astro check`. |
| `npm run format:check` | Checks the formatting of code files with Prettier; content Markdown is excluded. |
| `npm test` | Runs the unit tests. |

The site check, in `scripts/site-check/`, reads the build the way GitHub
Pages serves it and reports what is wrong: errors fail the build, warnings
are listed. Its rules are in `scripts/site-check/rules/`, and
`scripts/site-check/must-resolve.txt` lists every URL the site must keep
serving.

## Building the Docker image

```
docker build --target <target> -t <tag> .
```

The Dockerfile has two targets:

- `dev` runs the Astro dev server over a mounted source:

  ```
  docker run --rm -p 4321:4321 -v "$(pwd)":/opt/site <tag>
  ```

- `serve` builds the site and serves it with nginx:

  ```
  docker run --rm -p 8080:80 <tag>
  ```

## Publishing workflow for GitHub

- Develop your changes in branch `develop`.
- Once you're done with your changes, commit them, push them and create a PR to incorporate the changes in `main`.
  ```
  git commit -m "Message"
  git push origin develop
  ```
- A workflow checks that the site builds. Once it passes, you can merge the PR into `main`.
- A workflow publishes the site built from `main` to GitHub Pages.
- Pull `main` and merge it into `develop` locally for your next iteration.
  ```
  git checkout main
  git pull origin main
  git checkout develop
  git merge main
  git push origin develop
  ```
