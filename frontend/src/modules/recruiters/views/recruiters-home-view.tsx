import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { RECRUITERS_ROUTES } from "../constants/navigation";

export function RecruitersHomeView() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-2 font-tight text-3xl font-extrabold text-ink">Portal de empresas</h1>
      <p className="mb-6 text-[15px] text-text-secondary">
        Publica vacantes para que los egresados de Ingeniería de Sistemas las vean.
      </p>
      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-[16px] font-bold text-ink">Registrar nueva vacante</h2>
        <p className="mt-1 text-[14px] text-text-secondary">
          Completa la información, los requisitos y revisa la vista previa antes de publicar.
        </p>
        <Link
          href={RECRUITERS_ROUTES.newJobOffer}
          className={cn(
            buttonVariants(),
            "mt-4 h-auto bg-[#E50000] px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700",
          )}
        >
          Registrar nueva vacante
        </Link>
      </div>
    </div>
  );
}
