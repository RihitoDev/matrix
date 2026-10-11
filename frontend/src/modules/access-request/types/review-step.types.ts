export type StageState = "done" | "current" | "pending";

export interface Stage {
  label: string;
  detail: string;
  state: StageState;
}
