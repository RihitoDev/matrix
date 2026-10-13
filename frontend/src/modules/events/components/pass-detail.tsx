import { Card } from '@/components/ui/card';
import { MapPin, QrCode, Check } from 'lucide-react';

import {
  formatRegistrationDate,
  formatRegistrationTime,
} from '../utils/registration-format';
import type { PassDetailProps } from '../types/pass-detail-props.types';

export function PassDetail({ registration }: PassDetailProps) {
  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      <Card className="border-0 bg-ink text-surface p-8 rounded-[24px] flex flex-col gap-6 shadow-sm">
        <div className="flex items-center gap-2 text-gold text-[11px] font-bold tracking-widest uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
          Pase UMSS - Oficial
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-[22px] font-bold leading-tight break-words [overflow-wrap:anywhere]">
            {registration.eventName}
          </h2>
          <p className="text-surface-soft/70 text-sm">
            {formatRegistrationDate(registration.date)} ·{' '}
            {formatRegistrationTime(registration.startTime)} -{' '}
            {formatRegistrationTime(registration.endTime)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-surface-soft/70 text-sm">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {registration.location}
          </span>
        </div>

        <div className="bg-surface rounded-3xl p-6 mt-2 flex items-center justify-center">
          <QrCode
            aria-label="Vista ilustrativa de QR"
            className="w-full h-auto max-w-[220px] text-ink opacity-90"
            strokeWidth={1}
          />
        </div>

        <p className="text-xs text-surface-soft/70">
          El QR de esta vista es ilustrativo; aún no está habilitado para
          validar asistencia.
        </p>

        <div className="flex flex-wrap justify-between items-start gap-4 mt-2 border-t border-white/10 pt-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[10px] text-surface-soft/50 uppercase tracking-widest">
              ID Inscripción
            </span>
            <span className="font-bold text-sm break-all">
              {registration.id}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] text-surface-soft/50 uppercase tracking-widest">
              Estado
            </span>
            <span className="font-bold text-gold text-sm flex items-center gap-1 justify-end">
              <Check className="w-4 h-4" /> {registration.status}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
