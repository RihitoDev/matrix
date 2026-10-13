"use client";

import { REPORT_TYPE_SELECT_OPTIONS } from "../constants/generated-report.constants";
import type { ReportTypeFilterProps } from "../types/report-type-filter-props.types";
import { ReportFilterSelect } from "./report-filter-select";

export function ReportTypeFilter({ value, onChange }: ReportTypeFilterProps) {
  return (
    <ReportFilterSelect label="Tipo de reporte" allLabel="Todos" options={REPORT_TYPE_SELECT_OPTIONS} value={value} onChange={onChange} />
  );
}
