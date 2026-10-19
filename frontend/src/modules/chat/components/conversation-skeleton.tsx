'use client';

import React from 'react';

export function ConversationSkeleton() {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <div className="divide-y divide-gray-100">
      {skeletonItems.map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 p-3.5">
          <div className="size-12 shrink-0 rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-12 rounded bg-gray-200" />
            </div>
            <div className="h-3 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}