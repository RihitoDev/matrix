import type { PresentationValues } from "./presentation-values.types";
import type { PresentationErrors } from "./presentation-errors.types";

export interface PresentationFormProps {
  initialValues: PresentationValues;
  fullName: string;
  photoUrl?: string | null;
  isSaving?: boolean;
  serverErrors?: PresentationErrors;
  onEdit?: (field?: keyof PresentationValues) => void;
  onSubmit: (values: PresentationValues) => void;
}
