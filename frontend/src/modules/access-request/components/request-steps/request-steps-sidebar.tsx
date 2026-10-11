import { Check, ShieldCheck } from "lucide-react";
import type { RequestStepsSidebarProps } from "../../types/request-steps-sidebar-props.types";

const STEPS = [
  { number: 1, label: "Tus datos", description: "Quién eres y cómo contactarte" },
  {
    number: 2,
    label: "Documento de respaldo",
    description: "Diploma académico o título en provisión nacional",
  },
  { number: 3, label: "Revisión de la carrera", description: "Hasta 48 horas hábiles" },
  { number: 4, label: "Activación de cuenta", description: "Código enviado a tu correo" },
];

export function RequestStepsSidebar({ currentStep = 1 }: RequestStepsSidebarProps) {
  return (
    <aside className="flex w-full flex-col justify-between gap-10 bg-ink px-9 py-10 text-surface lg:min-h-screen lg:w-95 2xl:w-110">
      <div>
        <h2 className="text-[22px] font-bold">Solicitud de acceso</h2>
        <p className="mt-2 mb-[22px] max-w-75 text-[13px] text-surface/65">
          Cuatro pasos para unirte a la comunidad verificada de la carrera.
        </p>

        <nav aria-label="Pasos de la solicitud">
          <ol>
            {STEPS.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              const isLast = index === STEPS.length - 1;

              return (
                <li key={step.number} aria-current={isActive ? "step" : undefined}>
                  <div className="flex items-center gap-3.5 py-3">
                    <span
                      className={`flex size-7.5 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                        isActive
                          ? "border-accent bg-accent text-surface"
                          : isCompleted
                            ? "border-surface bg-surface text-ink"
                            : "border-surface/35 text-surface/70"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check aria-hidden="true" className="size-4" />
                          <span className="sr-only">Paso completado</span>
                        </>
                      ) : (
                        step.number
                      )}
                    </span>
                    <div>
                      <p
                        className={`text-[14.5px] font-semibold ${
                          isActive ? "text-surface" : "text-surface/85"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[13px] text-surface/60">{step.description}</p>
                    </div>
                  </div>
                  {isLast ? null : (
                    <span
                      aria-hidden="true"
                      className="ml-3.5 block h-[18px] w-[1.5px] bg-surface/20"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-start gap-3 border-t border-surface/12 pt-[18px]">
        <ShieldCheck aria-hidden="true" className="size-5 shrink-0 text-gold" />
        <p className="text-[13px] text-surface/72">
          Tus documentos se guardan cifrados y solo los revisa el personal autorizado de la
          carrera.
        </p>
      </div>
    </aside>
  );
}
