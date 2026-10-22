'use client';

import { PageHeading } from '@/shared/components/layout/page-heading';
import { useState } from 'react';
import { useMyPasses } from '../hooks/use-my-passes';
import { RequestFeedback } from '../components/request-feedback';
import Link from 'next/link';
import { PassCard } from '../components/pass-card';
import { PassDetail } from '../components/pass-detail';
import { MyPassesEmptyState } from '../components/my-passes-empty-state';
import { formatRegistrationDate } from '../utils/registration-format';

export function MyPassesView() {
  const { registrations, isLoading, error, retry } = useMyPasses();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected =
    registrations.find((item) => item.id === selectedId) ?? registrations[0];

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-7 bg-transparent lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-8">
          <PageHeading title="Mis inscripciones" description={`${registrations.length} ${registrations.length === 1 ? 'pase' : 'pases'}`} />
        </div>
        {isLoading ? (
          <RequestFeedback message="Cargando tus inscripciones..." />
        ) : error ? (
          <RequestFeedback message={error} isError onRetry={retry}>
            <Link
              href="/login?next=/events/my-passes"
              className="underline mr-4"
            >
              Iniciar sesión
            </Link>
          </RequestFeedback>
        ) : registrations.length === 0 ? (
          <MyPassesEmptyState />
        ) : (
          <div className="space-y-4">
            {registrations.map((item) => (
              <PassCard
                key={item.id}
                title={item.eventName}
                date={formatRegistrationDate(item.date)}
                status={item.status}
                location={item.location}
                registrationId={item.id}
                isSelected={selected?.id === item.id}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
          </div>
        )}
      </div>
      {!isLoading && !error && selected && (
        <div className="w-full shrink-0 self-start rounded-lg border border-border bg-surface p-6 lg:w-[380px]">
          <PassDetail registration={selected} />
        </div>
      )}
    </div>
  );
}
