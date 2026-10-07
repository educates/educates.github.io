---
name: copy-graham-blog-post
description: Copies blog posts from Graham Dumpleton's blog (grahamdumpleton.me GitHub repo) to the Educates blog in this repo, rewriting first person singular to first person plural (we, the Educates team). Use when the user wants to copy, migrate, or add a post from Graham's blog to the educates site, or when given a GitHub URL to a post folder under GrahamDumpleton/grahamdumpleton.me.
---

# Copy Graham blog post to Educates site

Copy a post (and its images) from [Graham Dumpleton's blog repo](https://github.com/GrahamDumpleton/grahamdumpleton.me) into this repo's posts collection, `src/content/posts/`, and rewrite the text from first person singular (I, my) to first person plural (we, our) as the Educates team.

## Source and target

- **Source**: GitHub repo `GrahamDumpleton/grahamdumpleton.me`, path like `src/posts/YYYY/MM/post-slug/` (e.g. `src/posts/2026/02/deploying-educates-yourself`).
- **Target**: a folder `src/content/posts/YYYY-MM-DD-<slug>/` (e.g. `src/content/posts/2026-02-26-deploying-educates-yourself/`) holding `index.md` and the post's image files. The folder date is the post's `date` from its front matter, or the date in the source path if it has none.
- **Format**: `index.md`. Only a post that uses a component, such as `<AsciinemaPlayer>`, is `index.mdx`.

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

### 4. Write the front matter

The posts collection's schema is in `src/content.config.ts`; the build fails on a post that breaks it. Write these keys:

- `title`: from the source.
- `slug`: the post's slug (e.g. `deploying-educates-yourself`). The post is served at `/blog/<slug>`, and the slug never changes once published.
- `description`: required. Take the source's description; if it has none, write one or two sentences saying what the reader gets from the post.
- `date`: the source's date, as `YYYY-MM-DD`.
- `tags`: keys defined in `src/content/tags.yml` that fit the post's topic (see step 6). A key missing from that file fails the build.
- `authors: [graham]`. Authors are keys of `src/content/authors.yml`.
- `draft: true` only for a post that must not publish yet; it then shows in the dev server only.

Leave out every other key of the source, such as `image`. A post gets a generated cover; a picture of its own goes in `cover`, as the path of an image file next to the post.

The post body carries no truncate marker: lists show the `description`.

### 5. Fix internal links

Replace Graham's post paths with this site's post paths, `/blog/<slug>`, with no trailing slash:

- `/posts/YYYY/MM/slug/` (e.g. `/posts/2026/02/teaching-an-ai-about-educates/`) → `/blog/<slug>` (e.g. `/blog/teaching-an-ai-about-educates`).

GitHub Pages answers `/blog/<slug>/` with a 404, so every internal link ends without a slash.

### 6. Adjust tags

Review the tags against the post's content and the tags defined in `src/content/tags.yml`, and keep only keys from that file.

### 7. Create target folder and files

- Create `src/content/posts/YYYY-MM-DD-<slug>/` (e.g. `src/content/posts/2026-02-26-deploying-educates-yourself/`).
- Write the rewritten content to `index.md` in that folder.
- Download each image from `https://raw.githubusercontent.com/GrahamDumpleton/grahamdumpleton.me/main/src/posts/YYYY/MM/<post-slug>/<filename>` into the same folder. Image references in the markdown are relative (e.g. `training-portal.png`), so they resolve correctly.

### 8. Verify

- Confirm all images are present and paths in markdown match filenames.
- Spot-check that first-person singular in the body has been converted to plural, and that internal links are `/blog/<slug>` without a trailing slash.
- Run `npm run build`: it validates the front matter, renders the post at `/blog/<slug>`, and runs the site check.

## Example

User provides: `https://github.com/GrahamDumpleton/grahamdumpleton.me/tree/main/src/posts/2026/02/deploying-educates-yourself`

- Post slug: `deploying-educates-yourself`.
- List contents → get `index.md`, `training-portal.png`, `workshop-dashboard.png`.
- Fetch `index.md`, rewrite I/my → we/our, write the front matter, change the link to the previous post to `/blog/teaching-an-ai-about-educates`.
- Create `src/content/posts/2026-02-26-deploying-educates-yourself/index.md` and download the two PNGs into that folder.

## Reference: Educates post front matter

```yaml
---
title: "Deploying Educates yourself"
slug: deploying-educates-yourself
description: "Educates is open source, not a SaaS. Deploy it yourself, wherever you want."
date: 2026-02-26
tags: ["educates", "installation", "local"]
authors: [graham]
---
```
