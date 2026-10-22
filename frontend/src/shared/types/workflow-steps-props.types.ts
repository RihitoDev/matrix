export interface WorkflowStepsProps {
  steps: readonly { id: number; label: string }[];
  currentStep: number;
  label: string;
}
