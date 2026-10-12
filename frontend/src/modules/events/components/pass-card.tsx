import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';

import type { PassCardProps } from '../types/pass-card-props.types';

export function PassCard({
  title,
  date,
  status,
  location,
  registrationId,
  isSelected,
  onClick,
}: PassCardProps) {
  return (
    <Card className="gap-0 border-0 bg-transparent p-0 shadow-none">
      <Button
        type="button"
        aria-pressed={Boolean(isSelected)}
        onClick={onClick}
        className={`h-auto items-stretch whitespace-normal w-full min-w-0 text-left p-5 rounded-[20px] transition-all flex flex-col gap-4 ${
          isSelected
            ? 'bg-ink text-surface'
            : 'bg-surface text-ink border border-border hover:border-border-strong'
        }`}
      >
        <div
          className={`text-xs font-semibold px-2.5 py-1 rounded-md w-fit flex items-center gap-1.5 ${
            isSelected
              ? 'bg-white/10 text-gold'
              : 'bg-surface-soft text-text-secondary'
          }`}
        >
          <Check className="w-3 h-3" /> {status}
        </div>

        <div>
          <h3 className="font-bold text-[17px] leading-tight mb-1 break-words [overflow-wrap:anywhere]">
            {title}
          </h3>
          <div
            className={`flex items-center gap-2 text-[13px] ${
              isSelected ? 'text-surface-soft/80' : 'text-text-secondary'
            }`}
          >
            <Calendar className="w-4 h-4 opacity-70" />
            <span className="min-w-0 break-words">{date}</span>
          </div>
          <p className="mt-2 text-sm break-words [overflow-wrap:anywhere]">
            {location}
          </p>
          <p className="mt-2 text-xs break-all">
            ID Inscripción: {registrationId}
          </p>
        </div>
      </Button>
    </Card>
  );
}
