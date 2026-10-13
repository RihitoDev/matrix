export interface ReportTableFooterProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}