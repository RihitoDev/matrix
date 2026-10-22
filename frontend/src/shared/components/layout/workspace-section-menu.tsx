"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { WorkspaceSectionMenuProps } from "@/shared/types/workspace-section-props.types";
import { getWorkspaceSection } from "@/shared/utils/get-workspace-section";

export function WorkspaceSectionMenu({ pathname, roles }: WorkspaceSectionMenuProps) {
  const section = getWorkspaceSection(pathname, roles);
  if (!section) return <span className="text-sm font-semibold text-ink">Mi espacio</span>;
  const Icon = section.icon;
  if (section.items.length < 2) {
    return <div className="flex items-center gap-3 px-3 text-sm font-semibold text-ink"><Icon className="size-4 text-ink-soft" aria-hidden="true" />{section.label}</div>;
  }
  const groups = [...new Set(section.items.map(({ group }) => group ?? "Secciones"))];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" aria-label={`Secciones de ${section.label}`} className="gap-3 px-3" />}>
        <Icon className="size-4 text-ink-soft" aria-hidden="true" />
        {section.label}
        <ChevronDown className="size-3.5 text-text-secondary" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={12} className="w-72 p-2">
        {groups.map((group) => (
          <DropdownMenuGroup key={group}>
            <DropdownMenuLabel className="px-3 pb-1 pt-3 text-xs">{group}</DropdownMenuLabel>
            {section.items.filter((item) => (item.group ?? "Secciones") === group).map((item) => (
              <DropdownMenuItem key={item.href} render={<Link href={item.href} />} aria-current={pathname === item.href ? "page" : undefined} className="min-h-10 gap-3 px-3 py-2 text-sm aria-[current=page]:bg-interaction aria-[current=page]:font-semibold aria-[current=page]:text-accent">
                <span className="flex-1">{item.label}</span>
                {pathname === item.href ? <Check className="size-4" aria-hidden="true" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
