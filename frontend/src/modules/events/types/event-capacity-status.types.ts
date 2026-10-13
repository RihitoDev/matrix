export interface EventCapacityStatus {
  enrolledCount: number;
  capacity: number | null;
  progressPercentage: number | null;
  isFull: boolean;
}
