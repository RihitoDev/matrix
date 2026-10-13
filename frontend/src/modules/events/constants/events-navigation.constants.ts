import { CalendarDays, Ticket } from 'lucide-react';
import type { NavigationItem } from '@/shared/types/navigation-item.types';
export const EVENTS_NAVIGATION: NavigationItem[] = [
  { label: 'Talleres', icon: CalendarDays, href: '/events' },
  { label: 'Mis pases', icon: Ticket, href: '/events/my-passes' },
];
