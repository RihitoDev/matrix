import { Pencil } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EditSectionLinkProps } from "../types/edit-section-link-props.types";

export function EditSectionLink({ href, sectionName }: EditSectionLinkProps) {
  return (
    <Link
      href={href}
      aria-label={`Editar ${sectionName}`}
      className={cn(buttonVariants({ variant: "outline" }), "h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft", "h-10 px-4")}
    >
      <Pencil aria-hidden="true" />
      Editar
    </Link>
  );
}
