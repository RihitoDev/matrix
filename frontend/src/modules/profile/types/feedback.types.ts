import type { FeedbackType } from "./feedback-type.types";

export interface Feedback {
  type: FeedbackType;
  message: string;
}
