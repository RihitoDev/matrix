'use client';

import type { EventsAppShellProps } from '../types/events-app-shell-props.types';
import { usePathname } from 'next/navigation';

import { AppShell } from '@/shared/components/layout';

export function EventsAppShell({ children }: EventsAppShellProps) {
  const pathname = usePathname();

  return (
    <AppShell fullBleed={pathname === '/events'}>
      {children}
    </AppShell>
  );
}
