import type { AcademicPeriod } from "./registered-user.types";

export interface ManagementMenuProps {
  value?: AcademicPeriod;
  onChange: (period?: AcademicPeriod) => void;
}
