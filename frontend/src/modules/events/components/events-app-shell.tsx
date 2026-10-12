'use client';

import type { EventsAppShellProps } from '../types/events-app-shell-props.types';
import { usePathname } from 'next/navigation';

import { AppShell } from '@/shared/components/layout';
import { EVENTS_NAVIGATION } from '../constants/events-navigation.constants';

export function EventsAppShell({ children }: EventsAppShellProps) {
  const pathname = usePathname();

  return (
    <AppShell items={EVENTS_NAVIGATION} fullBleed={pathname === '/events'}>
      {children}
    </AppShell>
  );
}
