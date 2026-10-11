import type { EducationFormValues } from "./education-form-values.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";

export interface EducationFormProps {
  initialValues?: EducationFormValues;
  allowMissingEndDate?: boolean;
  isPending?: boolean;
  feedback?: Feedback | null;
  onSubmit: (values: EducationFormValues) => void | Promise<void>;
  onCancel: () => void;
}
