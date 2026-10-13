'use client';

import React from 'react';
import { MatchScoreProps } from '../types/match-score.types';

export const MatchScoreBar: React.FC<MatchScoreProps> = ({
  score,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  const sizeClasses = {
    sm: 'h-2 text-xs',
    md: 'h-3 text-sm',
    lg: 'h-4 text-base',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-800">
          <span>Compatibilidad</span>
          <span className="font-semibold text-slate-900">{normalizedScore}%</span>
        </div>
      )}
      <div
        className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={normalizedScore}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-red-700 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
};