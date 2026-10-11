import type { TrajectoryStepId } from "./trajectory-step-id.types";

export interface TrajectoryStep {
  id: TrajectoryStepId;
  number: string;
  label: string;
  href: string;
}
