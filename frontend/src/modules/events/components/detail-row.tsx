import type { DetailRowProps } from '../types/detail-row-props.types';
export function DetailRow({ icon: Icon, value, label }: DetailRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-2 text-sm text-text-secondary">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}
