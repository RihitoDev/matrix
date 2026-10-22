import { UserRoundPen } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileCompletionBannerProps {
  hasContactInfo?: boolean;
}

export function ProfileCompletionBanner({ hasContactInfo = false }: ProfileCompletionBannerProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-6 rounded-lg bg-interaction px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <UserRoundPen aria-hidden="true" className="size-5 shrink-0 text-accent" />
        <p className="text-[15px] text-ink">
          Completa tu perfil para que la comunidad te conozca.
        </p>
      </div>
      <Link
        href={hasContactInfo ? "/profile/presentation" : "/profile/personal-info"}
        className={cn(buttonVariants(), "h-10 bg-accent px-4 text-sm text-white hover:bg-brand-hover", "h-10 shrink-0 px-5")}
      >
        Completar perfil
      </Link>
    </div>
  );
}
