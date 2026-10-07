// The CSS of the page a browser shows for each blog feed: the site's
// tokens, then the page's own rules, which use them. The tokens come from
// tokens.css as written, so the feed pages follow any change to them.

import feedCss from "../styles/feed.css?raw";
import tokensCss from "../styles/tokens.css?raw";

/** The stylesheet rss.xsl and atom.xsl link. */
export const feedStylesheet = `${tokensCss}\n${feedCss}`;
