import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import AsciinemaPlayer from '@site/src/components/AsciinemaPlayer';
import ClickableDiagram from '@site/src/components/ClickableDiagram';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Map the "<AsciinemaPlayer>" tag to our AsciinemaPlayer component
  // `AsciinemaPlayer` will receive all props that were passed to `<AsciinemaPlayer>` in MDX
  AsciinemaPlayer,
  // Map the "<ClickableDiagram>" tag to our ClickableDiagram component
  ClickableDiagram,
};