import React from 'react';
import type { ReactNode } from 'react';
import AutoClickableDiagrams from '@site/src/components/AutoClickableDiagrams';

export default function Root({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      {children}
      <AutoClickableDiagrams />
    </>
  );
}

