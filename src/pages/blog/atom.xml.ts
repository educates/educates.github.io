// The blog's Atom feed; src/lib/blog-feed.ts defines it.
import type { APIRoute } from "astro";
import { blogFeed } from "../../lib/blog-feed.ts";

export const GET: APIRoute = async () =>
  new Response(await blogFeed("atom"), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
