export interface FindEventsPayload {
  categoryId?: string;
  statusId?: string;
  isPublishedOnly?: boolean;
  search?: string;
  skip: number;
  take: number;
}
