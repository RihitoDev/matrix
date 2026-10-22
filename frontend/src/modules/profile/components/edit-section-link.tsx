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
      className={cn(buttonVariants({ variant: "outline" }), "h-9 px-3 text-sm")}
    >
      <Pencil aria-hidden="true" />
      Editar
    </Link>
  );
}
