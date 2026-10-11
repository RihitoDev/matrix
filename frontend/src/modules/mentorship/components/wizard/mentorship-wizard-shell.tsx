import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MentorshipStep } from "../../types/mentorship-step.types";
import { ProgressStepper } from "./progress-stepper";

type MentorshipWizardShellProps = {
  currentStep: MentorshipStep;
  canGoBack: boolean;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function MentorshipWizardShell({
  currentStep,
  canGoBack,
  canAdvance,
  onBack,
  onNext,
  children,
}: MentorshipWizardShellProps) {
  return (
    <main className="min-h-full bg-surface-soft px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
        <ProgressStepper currentStep={currentStep} />

        <Card className="gap-6 overflow-visible rounded-lg border border-border bg-surface py-0 shadow-sm ring-0">
          <CardHeader className="gap-0 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle
              role="heading"
              aria-level={1}
              className="font-tight text-xl font-bold text-ink sm:text-2xl"
            >
              Participa como mentor
            </CardTitle>

            <p className="mt-1 text-sm text-text-secondary">
              Configura tu participación como mentor.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <div className="min-h-48 rounded-md border border-border bg-surface-soft p-4 sm:p-6">
              {children}
            </div>
          </CardContent>

          <CardFooter
            className={`border-0 bg-transparent px-4 pb-4 pt-0 sm:px-6 sm:pb-6 ${
              currentStep < 4
                ? "items-stretch flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
                : ""
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={!canGoBack}
              className="h-auto rounded-md border-border-strong bg-transparent px-4 py-2.5 text-sm font-semibold text-ink hover:bg-transparent hover:text-ink active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent dark:hover:bg-transparent"
            >
              ← Volver
            </Button>

            {currentStep < 4 && (
              <Button
                type="button"
                onClick={onNext}
                disabled={!canAdvance}
                className="h-auto rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar →
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
