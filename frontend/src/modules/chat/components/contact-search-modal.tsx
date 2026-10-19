
'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useContactSearch } from '../hooks/use-contact-search';
import { getInitials } from '../utils/date-formatter';
import type { User } from '../types/user.types';

interface ContactSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (user: User) => void;
}

export function ContactSearchModal({
  isOpen,
  onClose,
  onSelectContact,
}: ContactSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const { results, isSearching } = useContactSearch(searchTerm);

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (selectedIndex >= 0 && optionRefs.current[selectedIndex]) {
      optionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  const handleClose = () => {
    setSearchTerm('');
    setSelectedIndex(-1);
    onClose();
  };

  const handleSelectUser = (user: User) => {
    onSelectContact(user);
    handleClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectUser(results[selectedIndex]);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-search-title"
      >
        <DialogHeader>
          <DialogTitle
            id="contact-search-title"
            className="font-heading text-base font-medium text-slate-900"
          >
            Nueva conversación
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Input
            autoFocus
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full"
            aria-label="Buscar contactos"
          />
        </div>

        <div
          className="mt-2 flex max-h-[320px] flex-col gap-1 overflow-y-auto pr-1 pb-4"
          role="listbox"
          aria-label="Lista de contactos"
        >
          {isSearching ? (
            <div
              className="py-6 text-center text-sm text-slate-500"
              role="status"
            >
              Buscando...
            </div>
          ) : results.length > 0 ? (
            results.map((user, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Button
                  key={user.id}
                  type="button"
                  variant="ghost"
                  size="default"
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`h-auto w-full justify-start gap-3 rounded-lg p-2.5 text-left font-normal transition-colors outline-none ${
                    isSelected
                      ? 'bg-slate-100 ring-2 ring-slate-400/50'
                      : 'hover:bg-slate-50 focus-visible:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400'
                  }`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                      {getInitials(user.fullName)}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-slate-800">
                      {user.fullName}
                    </span>

                    {user.headline && (
                      <span className="truncate text-xs text-slate-500">
                        {user.headline}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })
          ) : (
            searchTerm.trim().length >= 2 && (
              <div className="py-6 text-center text-sm text-slate-500">
                No se encontraron usuarios
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
