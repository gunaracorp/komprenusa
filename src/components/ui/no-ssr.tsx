'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

const emptySubscribe = () => () => {};

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function NoSSR({ children, fallback = null }: NoSSRProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return mounted ? children : fallback;
}
