import { WorkflowSteps } from "@/shared/components/layout/workflow-steps";
import { MENTORSHIP_STEPS } from "../../constants/mentorship-steps.constants";
import type { MentorshipStep } from "../../types/mentorship-step.types";
interface ProgressStepperProps { currentStep: MentorshipStep; }
export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return <WorkflowSteps steps={MENTORSHIP_STEPS} currentStep={currentStep} label="Progreso de configuración de mentoría" />;
}
