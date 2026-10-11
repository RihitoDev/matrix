import type { BlockFormMode } from "./block-form-mode.types";
import type { CreateAvailabilityBlockInput } from "./create-availability-block-input.types";

export interface BlockFormProps {
  mode: BlockFormMode;
  initialValues?: Partial<CreateAvailabilityBlockInput>;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitError?: string | null;
  onSubmit: (values: CreateAvailabilityBlockInput) => void;
  onCancel: () => void;
}
