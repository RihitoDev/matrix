"use client";

import Link from "next/link";
import { ChevronDown, UserRound } from "lucide-react";
import { SessionLogoutMenuItem, getRolesLabel } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
import type { AccountMenuProps } from "@/shared/types/account-menu-props.types";

export function AccountMenu({ roles }: AccountMenuProps) {
  const canViewProfile = roles.some((role) => getRouteRoles("/profile").includes(role));
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-3" />}>
        <UserRound aria-hidden="true" />Mi cuenta<ChevronDown className="size-3.5 text-text-secondary" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} className="w-60 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-xs">{getRolesLabel(roles)}</DropdownMenuLabel>
          {canViewProfile ? <DropdownMenuItem render={<Link href="/profile" />} className="gap-3 px-3 py-2.5"><UserRound aria-hidden="true" />Mi perfil</DropdownMenuItem> : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SessionLogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
