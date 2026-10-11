import type { CityOption } from "./city-option.types";
import type { PersonalInfoErrors } from "./personal-info-errors.types";
import type { PersonalInfoValues } from "./personal-info-values.types";
import type { ProfilePhotoFieldProps } from "./profile-photo-field-props.types";

export interface PersonalInfoFormProps {
  initialValues: PersonalInfoValues;
  cities?: CityOption[];
  isSaving?: boolean;
  serverErrors?: PersonalInfoErrors;
  onEdit?: (field?: keyof PersonalInfoValues) => void;
  photo?: ProfilePhotoFieldProps;
  onSubmit: (values: PersonalInfoValues) => void;
}
