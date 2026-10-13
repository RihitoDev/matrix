export interface ReportFilterOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface ReportFilterSelectProps<TValue extends string> {
  label: string;
  allLabel: string;
  options: ReportFilterOption<TValue>[];
  value?: TValue;
  onChange: (value?: TValue) => void;
}
