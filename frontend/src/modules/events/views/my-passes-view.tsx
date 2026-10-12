'use client';

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
    <div className="flex flex-col lg:flex-row h-full w-full min-h-screen bg-transparent">
      <div className="min-w-0 flex-1 p-8 pt-4 lg:p-12 lg:pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink mb-1">
            Mis Inscripciones
          </h1>
          <p className="text-text-secondary text-sm">
            {registrations.length}{' '}
            {registrations.length === 1 ? 'pase' : 'pases'}
          </p>
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
          <div className="max-w-md space-y-4">
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
        <div className="w-full lg:w-[480px] border-l border-border bg-surface-soft/30 p-8 pt-4 lg:p-12 lg:pt-6 shrink-0">
          <PassDetail registration={selected} />
        </div>
      )}
    </div>
  );
}
