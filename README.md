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
| `npm run link-check` | Checks the internal links in the build in `dist/`, offline. Needs [lychee](https://lychee.cli.rs/), for example from `brew install lychee`. |
| `npm run docker-build` | Builds the Docker image; see below. |

The site check, in `scripts/site-check/`, reads the build the way GitHub
Pages serves it and reports what is wrong: errors fail the build, warnings
are listed. Its rules are in `scripts/site-check/rules/`, and
`scripts/site-check/must-resolve.txt` lists every URL the site must keep
serving. It also fetches the live site's sitemap and fails when the build
does not serve a URL it lists, such as a blog post published since; when
the sitemap cannot be fetched, it skips that comparison with a warning.
`npm run site-check -- --live-sitemap <url>` compares with another
sitemap.

The link check uses the settings in `lychee.toml`.

## Building the Docker image

```
npm run docker-build [-- <target>]
```

The script builds a target of the Dockerfile, `serve` unless you name
another, as the image `educates-dev:<target>`, with Node.js at the Volta
pin. Arguments after the target go to `docker buildx build`. The image is
for your machine's architecture; to build other platforms, list them in
`TARGET_PLATFORMS`:

```
TARGET_PLATFORMS=linux/amd64,linux/arm64 npm run docker-build
```

A platform other than your machine's builds under emulation, and an image
for more than one platform needs an image store that supports
multi-platform images, as the containerd image store, Docker Desktop's
default, does.

The Dockerfile has two targets:

- `serve` builds the site, runs the site check, and serves the result with
  nginx the way GitHub Pages serves it: `/page` serves `page.html`, `/page/`
  is a 404, a directory URL serves its `index.html`, and the redirect pages
  work. Run it and open `http://localhost:8080`:

  ```
  docker run --rm -p 8080:80 educates-dev:serve
  ```

- `dev` runs the Astro dev server over your checkout, mounted into the
  container. The second volume keeps the image's dependencies, which are
  built for Linux, in place of yours. Run it and open
  `http://localhost:4321`:

  ```
  npm run docker-build -- dev
  docker run --rm -it -p 4321:4321 -v "$(pwd)":/opt/site -v /opt/site/node_modules educates-dev:dev
  ```

## Continuous integration

Workflows in `.github/workflows/`:

- **Checks** runs on every pull request to `develop` and `main`: the type
  check, the formatting check, the build, the site check, the unit tests,
  the internal link check, and Lighthouse on a mobile profile, the median of
  three runs, on the pages listed in `lighthouserc.yml`. Accessibility or
  SEO below 90 fails the checks; performance below 90 warns.
- **Deploy to GitHub Pages** builds `main` and publishes it, on every push
  to `main` and by hand.
- **External links** checks the links to other sites every week and keeps
  one issue, "Dead external links", listing the dead ones. It never blocks
  a pull request.

All of them run Node.js at the Volta pin in `package.json`. Dependabot
opens a weekly pull request with the minor and patch updates for npm, one
for GitHub Actions, and a pull request of its own for each major update.

## Publishing workflow for GitHub

- Develop your changes in branch `develop`.
- Once you're done with your changes, commit them, push them and create a PR to incorporate the changes in `main`.
  ```
  git commit -m "Message"
  git push origin develop
  ```
- The checks workflow runs on the PR. Once it passes, you can merge the PR into `main`.
- A workflow publishes the site built from `main` to GitHub Pages.
- Pull `main` and merge it into `develop` locally for your next iteration.
  ```
  git checkout main
  git pull origin main
  git checkout develop
  git merge main
  git push origin develop
  ```
