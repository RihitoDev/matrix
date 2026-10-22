"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { MenuIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV_LABELS, PUBLIC_NAV_LINKS, PUBLIC_SLANT_BUTTON_CLASS } from "@/shared/constants/public-navigation.constants";

export function PublicMobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger aria-label={PUBLIC_NAV_LABELS.openMenu} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-surface hover:bg-surface/10 hover:text-surface xl:hidden")}>
        <MenuIcon className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="border-none bg-accent text-surface">
        <SheetHeader><SheetTitle className="font-tight text-lg font-extrabold text-surface uppercase">{PUBLIC_NAV_LABELS.menuTitle}</SheetTitle></SheetHeader>
        <nav aria-label={PUBLIC_NAV_LABELS.navigation} className="flex flex-col px-2">
          {PUBLIC_NAV_LINKS.map((link) => <Link key={link.href} href={link.href} onClick={close} className="border-b border-surface/15 px-2 py-4 font-tight text-lg font-extrabold uppercase hover:text-surface/75">{link.label}</Link>)}
        </nav>
        <SheetFooter className="gap-3">
          <Link href="/login" onClick={close} className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "bg-surface text-ink hover:bg-surface/85")}>{PUBLIC_NAV_LABELS.login}</Link>
          <Link href="/request-access" onClick={close} className={cn(buttonVariants({ size: "lg" }), PUBLIC_SLANT_BUTTON_CLASS, "bg-danger text-surface hover:bg-danger/85")}>{PUBLIC_NAV_LABELS.requestAccess}</Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
