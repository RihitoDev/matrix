'use client';

import React from 'react';

export function ConversationSkeleton() {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <div className="divide-y divide-gray-100">
      {skeletonItems.map((_, index) => (
        <div key={index} className="p-3.5 flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}