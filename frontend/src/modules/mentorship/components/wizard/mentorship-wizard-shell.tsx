import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/layout/page-heading";
import type { MentorshipStep } from "../../types/mentorship-step.types";
import { ProgressStepper } from "./progress-stepper";
interface MentorshipWizardShellProps {
  currentStep: MentorshipStep;
  canGoBack: boolean;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  children: ReactNode;
}
export function MentorshipWizardShell({ currentStep, canGoBack, canAdvance, onBack, onNext, children }: MentorshipWizardShellProps) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeading title="Participa como mentor" description="Configura tu participación como mentor." />
      <ProgressStepper currentStep={currentStep} />
      <section className="rounded-lg border border-border bg-surface">
        <div className="min-h-64 p-6 lg:p-8">{children}</div>
        {canGoBack || currentStep < 4 ? <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-5 lg:px-8">
          {canGoBack ? <Button type="button" variant="outline" onClick={onBack}><ArrowLeft aria-hidden="true" />Volver</Button> : <span className="text-sm text-text-secondary">Paso {currentStep} de 4</span>}
          {currentStep < 4 ? <Button type="button" onClick={onNext} disabled={!canAdvance}>Continuar<ArrowRight aria-hidden="true" /></Button> : null}
        </footer> : null}
      </section>
    </main>
  );
}
