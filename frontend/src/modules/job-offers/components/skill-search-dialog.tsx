"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SKILL_SEARCH_TEXT } from "../constants/vacancies.constants";
import type { SkillOption } from "../types/vacancy-conditions.types";
import { normalizeSearchText } from "../utils/normalize-search-text";

interface SkillSearchDialogProps {
  catalog: SkillOption[];
  selected: SkillOption[];
  isDisabled: boolean;
  onAdd: (skill: SkillOption) => void;
}

export function SkillSearchDialog({ catalog, selected, isDisabled, onAdd }: SkillSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<SkillOption | null>(null);

  const normalizedSearch = normalizeSearchText(search);
  const results = normalizedSearch
    ? catalog.filter((skill) => normalizeSearchText(skill.name).includes(normalizedSearch))
    : [];
  const isSelected = (skill: SkillOption) => selected.some((item) => item.id === skill.id);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearch("");
      setChosen(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setChosen(null);
  };

  const handleChoose = (skill: SkillOption) => {
    setChosen(skill);
    setSearch(skill.name);
  };

  const handleAdd = () => {
    if (!chosen) return;
    onAdd(chosen);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className="h-auto rounded-full border-dashed border-amber-400 bg-amber-50 px-4 py-1.5 text-[13px] font-medium text-amber-700 hover:bg-amber-100"
          />
        }
      >
        {SKILL_SEARCH_TEXT.trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{SKILL_SEARCH_TEXT.title}</DialogTitle>
          <DialogDescription>{SKILL_SEARCH_TEXT.description}</DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="skill-search" className="text-[12.5px] font-semibold">
            {SKILL_SEARCH_TEXT.label} <span className="text-danger">*</span>
          </Label>
          <Input
            id="skill-search"
            autoComplete="off"
            placeholder={SKILL_SEARCH_TEXT.placeholder}
            className="mt-1.5"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />

          {normalizedSearch && !chosen && results.length === 0 && (
            <p role="status" className="mt-2 text-[12px] text-text-secondary">
              {SKILL_SEARCH_TEXT.noResults}
            </p>
          )}

          {!chosen && results.length > 0 && (
            <ul aria-label="Resultados de la búsqueda" className="mt-2 max-h-56 overflow-y-auto rounded-md border border-border">
              {results.map((skill) => {
                const isAlreadySelected = isSelected(skill);
                return (
                  <li key={skill.id}>
                    <button
                      type="button"
                      disabled={isAlreadySelected}
                      onClick={() => handleChoose(skill)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-ink hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {skill.name}
                      {isAlreadySelected && <Badge variant="secondary">{SKILL_SEARCH_TEXT.alreadySelected}</Badge>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>{SKILL_SEARCH_TEXT.cancel}</DialogClose>
          <Button
            type="button"
            disabled={!chosen}
            onClick={handleAdd}
            className="bg-[#E50000] text-white hover:bg-red-700"
          >
            {SKILL_SEARCH_TEXT.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
