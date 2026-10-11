import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileCompletionBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-6 rounded-2xl border border-accent/30 bg-interaction px-8 py-5"
    >
      <div className="flex items-center gap-3">
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-accent" />
        <p className="text-[15px] text-ink">
          Completa tu perfil para que egresados, mentores y empresas puedan identificarte y contactarte.
        </p>
      </div>
      <Link
        href="/profile/personal-info"
        className={cn(buttonVariants(), "h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger", "h-10 shrink-0 px-5")}
      >
        Completar perfil
      </Link>
    </div>
  );
}
