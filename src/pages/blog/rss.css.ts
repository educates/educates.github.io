// The stylesheet public/blog/rss.xsl links; the same as /blog/atom.css.
import type { APIRoute } from "astro";
import { feedStylesheet } from "../../lib/feed-stylesheet.ts";

export const GET: APIRoute = () =>
  new Response(feedStylesheet, {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
