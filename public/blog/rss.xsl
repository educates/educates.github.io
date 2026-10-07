<?xml version="1.0" encoding="utf-8"?>
<!--
  Shows the blog's RSS feed, /blog/rss.xml, as a page when a browser opens
  it: what the feed is, how to subscribe, and its posts. rss.css styles it
  with the site's tokens. atom.xsl does the same for the Atom feed.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="utf-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RSS feed | <xsl:value-of select="rss/channel/title" /></title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="stylesheet" href="/blog/rss.css" />
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="/">
            <img src="/img/logo.svg" alt="" width="30" height="30" />
            <span>Educates</span>
          </a>
        </header>
        <main>
          <p class="eyebrow">RSS feed</p>
          <h1><xsl:value-of select="rss/channel/title" /></h1>
          <p class="lede"><xsl:value-of select="rss/channel/description" /></p>
          <aside class="callout" role="note">
            <p class="callout-title">This is an RSS feed</p>
            <p>
              Subscribe by copying the URL from the address bar into your feed
              reader. New to feeds? <a href="https://aboutfeeds.com/">About
              Feeds</a> explains how to get started, for free.
            </p>
          </aside>
          <h2>Recent posts</h2>
          <ol class="posts">
            <xsl:for-each select="rss/channel/item">
              <li class="post">
                <h3><a href="{link}"><xsl:value-of select="title" /></a></h3>
                <!-- pubDate reads "Sat, 28 Feb 2026 00:00:00 GMT". -->
                <p class="date">
                  <xsl:value-of select="concat(number(substring(pubDate, 6, 2)), substring(pubDate, 8, 9))" />
                </p>
                <p><xsl:value-of select="description" /></p>
              </li>
            </xsl:for-each>
          </ol>
          <p>
            <a class="arrow-link" href="{rss/channel/link}">Read the blog on educates.dev</a>
          </p>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
