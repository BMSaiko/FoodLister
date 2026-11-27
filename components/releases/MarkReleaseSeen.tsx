'use client';

import { useEffect } from 'react';
import useUnseenRelease from '@/hooks/releases/useUnseenRelease';

/** Marca a versão como vista ao abrir a sua página. */
export default function MarkReleaseSeen({ version }: { version: string }) {
  const { markSeen } = useUnseenRelease();
  useEffect(() => markSeen(version), [version, markSeen]);
  return null;
}
