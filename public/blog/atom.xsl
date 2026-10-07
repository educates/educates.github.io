<?xml version="1.0" encoding="utf-8"?>
<!--
  Shows the blog's Atom feed, /blog/atom.xml, as a page when a browser
  opens it: what the feed is, how to subscribe, and its posts. atom.css
  styles it with the site's tokens. rss.xsl does the same for the RSS feed.
-->
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="atom">
  <xsl:output method="html" encoding="utf-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Atom feed | <xsl:value-of select="atom:feed/atom:title" /></title>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="stylesheet" href="/blog/atom.css" />
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="/">
            <img src="/img/logo.svg" alt="" width="30" height="30" />
            <span>Educates</span>
          </a>
        </header>
        <main>
          <p class="eyebrow">Atom feed</p>
          <h1><xsl:value-of select="atom:feed/atom:title" /></h1>
          <p class="lede"><xsl:value-of select="atom:feed/atom:subtitle" /></p>
          <aside class="callout" role="note">
            <p class="callout-title">This is an Atom feed</p>
            <p>
              Subscribe by copying the URL from the address bar into your feed
              reader. New to feeds? <a href="https://aboutfeeds.com/">About
              Feeds</a> explains how to get started, for free.
            </p>
          </aside>
          <h2>Recent posts</h2>
          <ol class="posts">
            <xsl:for-each select="atom:feed/atom:entry">
              <li class="post">
                <h3>
                  <a href="{atom:link[not(@rel) or @rel = 'alternate']/@href}">
                    <xsl:value-of select="atom:title" />
                  </a>
                </h3>
                <!-- updated reads "2026-02-28T00:00:00.000Z". -->
                <p class="date">
                  <time datetime="{substring(atom:updated, 1, 10)}">
                    <xsl:value-of select="concat(number(substring(atom:updated, 9, 2)), ' ', substring('JanFebMarAprMayJunJulAugSepOctNovDec', (number(substring(atom:updated, 6, 2)) - 1) * 3 + 1, 3), ' ', substring(atom:updated, 1, 4))" />
                  </time>
                </p>
                <p><xsl:value-of select="atom:summary" /></p>
              </li>
            </xsl:for-each>
          </ol>
          <p>
            <a class="arrow-link" href="{atom:feed/atom:link[@rel = 'alternate']/@href}">Read the blog on educates.dev</a>
          </p>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
