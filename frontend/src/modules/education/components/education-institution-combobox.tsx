"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFieldErrorProps } from '@/modules/profile/utils/get-field-error-props';
import { EDUCATION_INSTITUTION_TEXTS } from '../constants/education-institutions.constants';
import type { EducationInstitutionComboboxProps } from '../types/education-institution-combobox-props.types';
import { normalizeEducationText } from '../utils/normalize-education-text';

export function EducationInstitutionCombobox({ id, value, institutions = [], error, disabled = false, onChange }: EducationInstitutionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const query = normalizeEducationText(value ?? '');
  const matches = (institutions ?? []).filter((institution) =>
    [institution.name, ...(institution.aliases ?? [])].some((name) => normalizeEducationText(name).includes(query)),
  );
  const isOpen = open && !disabled;
  const activeOption = isOpen ? matches[activeIndex] : undefined;

  useEffect(() => {
    if (isOpen) listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (matches.length) {
        setActiveIndex((current) => event.key === 'ArrowDown'
          ? (current + 1) % matches.length
          : (current <= 0 ? matches.length - 1 : current - 1));
      }
    } else if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      select(activeOption.name);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative min-w-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }}>
      <Input
        id={id}
        {...getFieldErrorProps(id, error)}
        name="institution"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-options` : undefined}
        aria-activedescendant={activeOption ? `${id}-option-${activeIndex}` : undefined}
        autoComplete="off"
        required
        autoFocus
        value={value ?? ''}
        disabled={disabled}
        placeholder={EDUCATION_INSTITUTION_TEXTS.placeholder}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="h-12 w-full rounded-lg border-border bg-surface px-4 text-[15px] text-ink md:text-[15px]"
      />
      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
          <div id={`${id}-options`} ref={listRef} role="listbox" aria-label={EDUCATION_INSTITUTION_TEXTS.listLabel} className="max-h-60 overflow-y-auto p-1">
            {matches.map((institution, index) => (
              <Button
                key={institution.name}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                tabIndex={-1}
                variant="ghost"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(institution.name)}
                className="h-auto min-h-10 w-full justify-start whitespace-normal break-words px-3 py-2 text-left font-normal aria-selected:bg-surface-soft"
              >
                {institution.name}
              </Button>
            ))}
          </div>
          {!matches.length ? <p role="status" className="px-3 py-2 text-sm text-text-secondary">{EDUCATION_INSTITUTION_TEXTS.noMatches}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
