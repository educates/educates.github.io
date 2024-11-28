import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import AsciinemaPlayer from '@site/src/components/AsciinemaPlayer';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  // Map the "<AsciinemaPlayer>" tag to our AsciinemaPlayer component
  // `AsciinemaPlayer` will receive all props that were passed to `<AsciinemaPlayer>` in MDX
  AsciinemaPlayer,
};