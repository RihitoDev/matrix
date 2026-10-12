export interface EventDetailStateProps {
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  retry: () => void;
}
