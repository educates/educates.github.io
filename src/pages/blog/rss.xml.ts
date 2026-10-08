// The blog's RSS 2.0 feed; src/lib/blog-feed.ts defines it.
import type { APIRoute } from "astro";
import { blogFeed } from "../../lib/blog-feed.ts";

export const GET: APIRoute = async () =>
  new Response(await blogFeed("rss"), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
