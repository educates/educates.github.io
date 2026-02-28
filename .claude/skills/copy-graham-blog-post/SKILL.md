---
name: copy-graham-blog-post
description: Copies blog posts from Graham Dumpleton's blog (grahamdumpleton.me GitHub repo) to the Educates blog in this repo, rewriting first person singular to first person plural (we, the Educates team). Use when the user wants to copy, migrate, or add a post from Graham's blog to the educates site, or when given a GitHub URL to a post folder under GrahamDumpleton/grahamdumpleton.me.
---

# Copy Graham blog post to Educates site

Copy a post (and its images) from [Graham Dumpleton's blog repo](https://github.com/GrahamDumpleton/grahamdumpleton.me) into this repo's `blog/` folder, and rewrite the text from first person singular (I, my) to first person plural (we, our) as the Educates team.

## Source and target

- **Source**: GitHub repo `GrahamDumpleton/grahamdumpleton.me`, path like `src/posts/YYYY/MM/post-slug/` (e.g. `src/posts/2026/02/deploying-educates-yourself`).
- **Target**: This repo's `blog/` folder. Create a folder named `YYYY-MM-DD-<slug>/` (e.g. `2026-02-26-deploying-educates-yourself`) containing `index.md` and any image files. Use the post's `date` from frontmatter for the folder date, or the path date if needed. Add `<!--truncate -->` after first paragraph. If first paragraph is too short, do it after the second. Also, review the tags to align with those in `blog/tags.yaml` and the topic in the blog.

## Workflow

### 1. List source files

Call GitHub Contents API to list files in the post folder:

```
GET https://api.github.com/repos/GrahamDumpleton/grahamdumpleton.me/contents/src/posts/YYYY/MM/<post-slug>
```

Or use `curl -sL "https://api.github.com/repos/..."`. From the response, identify `index.md` and any image files (e.g. `.png`, `.jpg`). Ignore `.DS_Store` and non-content files.

### 2. Fetch post content

Download the raw markdown:

```
https://raw.githubusercontent.com/GrahamDumpleton/grahamdumpleton.me/main/src/posts/YYYY/MM/<post-slug>/index.md
```

Use `curl -sL "<url>"` if needed (mcp_web_fetch may timeout).

### 3. Rewrite voice (first person singular → plural)

In the **body** (not code blocks or image alt text unless they are first-person narrative), replace:

| Original (Graham, singular) | Rewritten (Educates team, plural) |
|----------------------------|------------------------------------|
| In my [last/previous] post | In our [last/previous] post |
| I showed / I walked / I pointed / I had to / I find / I have / I'm / I noticed / I tried / I could / I couldn't | we showed / we walked / we pointed / we had to / we find / we have / we're / we noticed / we tried / we could / we couldn't |
| my previous post / my last post | our previous post / our last post |
| being the author of the Educates platform | being the team behind the Educates platform |
| as far as I'm aware | as far as we're aware |
| I'd told it | we'd told it |

Preserve "you" when addressing the reader. Do not change technical wording, code blocks, or link URLs except internal post links.

### 4. Adapt frontmatter

- Keep: `title`, `description`, `date`, `tags`, `image`, `draft`.
- Add: `slug: <post-slug>` (e.g. `deploying-educates-yourself`).
- Add: `authors: [graham]`.
- Remove any frontmatter fields this site does not use (check existing posts in `blog/` for the schema).
- Remove `daft` and `date` frontmatter fields.


### 5. Fix internal links

Replace Graham's post paths with this site's blog paths:

- `/posts/YYYY/MM/slug/` or `/posts/2026/02/teaching-an-ai-about-educates/` → `/blog/<slug>` (e.g. `/blog/teaching-an-ai-about-educates`).
- Use `/blog/<slug>` consistently (no trailing slash required; add one if the site expects it).

### 6. Adjust tags

- Review tags in frontmatter section to align with the contents of the blog post and tags already defined in `blog/tags.yaml`

### 6. Create target folder and files

- Create `blog/YYYY-MM-DD-<slug>/` (e.g. `blog/2026-02-26-deploying-educates-yourself/`).
- Write the rewritten content to `blog/YYYY-MM-DD-<slug>/index.md`.
- Download each image from `https://raw.githubusercontent.com/GrahamDumpleton/grahamdumpleton.me/main/src/posts/YYYY/MM/<post-slug>/<filename>` into the same folder. Image references in the markdown are relative (e.g. `training-portal.png`), so they resolve correctly.

### 7. Verify

- Confirm all images are present and paths in markdown match filenames.
- Spot-check that first-person singular in the body has been converted to plural and internal links use `/blog/...`.

## Example

User provides: `https://github.com/GrahamDumpleton/grahamdumpleton.me/tree/main/src/posts/2026/02/deploying-educates-yourself`

- Post slug: `deploying-educates-yourself`.
- List contents → get `index.md`, `training-portal.png`, `workshop-dashboard.png`.
- Fetch `index.md`, rewrite I/my → we/our, add `slug` and `authors: [graham]`, change link to previous post to `/blog/teaching-an-ai-about-educates`.
- Create `blog/2026-02-26-deploying-educates-yourself/index.md` and download the two PNGs into that folder.

## Reference: existing Educates post frontmatter

```yaml
---
title: "..."
slug: post-slug
description: "..."
date: YYYY-MM-DD
tags: ["educates", "ai"]
authors: [graham]
image: https://opengraph.githubassets.com/1/educates/educates-training-platform
draft: false
---
```

Authors are defined in `blog/authors.yml`; `graham` exists. Use the same structure for new posts.
