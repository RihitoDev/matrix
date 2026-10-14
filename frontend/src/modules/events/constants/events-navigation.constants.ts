import { CalendarDays, Ticket } from 'lucide-react';
import type { NavigationItem } from '@/shared/types/navigation-item.types';
export const EVENTS_NAVIGATION: NavigationItem[] = [
  { label: 'Talleres disponibles', icon: CalendarDays, href: '/events' },
  { label: 'Mis inscripciones', icon: Ticket, href: '/events/my-passes' },
];
