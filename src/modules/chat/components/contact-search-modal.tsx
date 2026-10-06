'use client';

/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useContactSearch } from '../hooks/use-contact-search';
import { getInitials } from '../utils/date-formatter';
import { User } from '../types/user.types';

interface ContactSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (user: User) => void;
}

export function ContactSearchModal({ isOpen, onClose, onSelectContact }: ContactSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { results, isSearching } = useContactSearch(searchTerm);
  
  // Referencias para hacer auto-scroll a los elementos seleccionados por teclado
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
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectUser(results[selectedIndex]);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-heading text-base font-medium">
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
          className="flex flex-col gap-1 max-h-[320px] overflow-y-auto mt-2 pr-1 pb-4"
          role="listbox"
          aria-label="Lista de contactos"
        >
          {isSearching ? (
            <div className="text-center text-slate-500 py-6 text-sm" role="status">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            results.map((user, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={user.id}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectUser(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 ring-2 ring-slate-400/50'
                      : 'hover:bg-slate-50 focus-visible:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400'
                  }`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-slate-800 text-sm truncate">
                      {user.fullName}
                    </span>
                    {user.headline && (
                      <span className="text-xs text-slate-500 truncate">
                        {user.headline}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            searchTerm.trim().length >= 2 && (
              <div className="text-center text-slate-500 py-6 text-sm">
                No se encontraron usuarios
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}