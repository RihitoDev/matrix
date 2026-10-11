"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InboxHeader } from "../components/layout/backoffice-page-header";
import { RequestPagination } from "../components/inbox/request-pagination";
import { RequestTable } from "../components/inbox/request-table";
import { REVIEW_TABS } from "../constants/request-review.constants";
import { useRequestList } from "../hooks/use-request-list";
import { useStatusCounts } from "../hooks/use-status-counts";
import type { ReviewStatus } from "../types/request-review.types";

const ALL_STATUSES: readonly ReviewStatus[] = REVIEW_TABS.map((tab) => tab.value);

export function RequestInboxView() {
  const list = useRequestList();
  const counts = useStatusCounts(ALL_STATUSES);

  return (
    <div className="w-full min-w-0">
      <InboxHeader />

      <section className="flex w-full min-w-0 flex-col gap-6 p-8">
        <div className="w-full min-w-0 overflow-hidden rounded-[10px] border border-border bg-surface">
          <Tabs value={list.status} onValueChange={(value) => list.changeStatus(value as ReviewStatus)} className="px-3">
            <TabsList variant="line" className="h-12 gap-2 p-0">
              {REVIEW_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-12 flex-none px-4 text-[15px] font-semibold text-text-secondary data-active:text-ink after:bottom-0 after:bg-accent"
                >
                  {tab.label}
                  {typeof counts[tab.value] === "number" && (
                    <span
                      className="ml-2 rounded-full bg-surface-soft px-2 text-xs font-semibold text-text-secondary"
                      aria-label={`${counts[tab.value]} solicitudes`}
                    >
                      {counts[tab.value]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {list.error ? (
            <p role="alert" className="border-t border-border p-4 text-sm text-ink">
              {list.error}
            </p>
          ) : !list.isLoading && list.items.length === 0 ? (
            <p className="border-t border-border p-8 text-center text-sm text-text-secondary">
              No hay solicitudes en este estado.
            </p>
          ) : (
            <div className="border-t border-border">
              <RequestTable items={list.items} isLoading={list.isLoading} />
              {!list.isLoading && (
                <RequestPagination
                  from={list.from}
                  to={list.to}
                  total={list.total}
                  hasPrevious={list.hasPrevious}
                  hasNext={list.hasNext}
                  onPrevious={list.goToPrevious}
                  onNext={list.goToNext}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
