"use client";

import { USER_TYPE_SELECT_OPTIONS } from "../constants/registered-users.constants";
import type { UserTypeFilterProps } from "../types/user-type-filter-props.types";
import { ReportFilterSelect } from "./report-filter-select";

export function UserTypeFilter({ value, onChange }: UserTypeFilterProps) {
  return (
    <ReportFilterSelect label="Tipo de usuario" allLabel="Todos" options={USER_TYPE_SELECT_OPTIONS} value={value} onChange={onChange} />
  );
}
