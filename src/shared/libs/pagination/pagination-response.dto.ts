export class PaginationResponseDto<T> {
  currentPage: number;
  skippedRecords: number;
  totalPages: number;
  hasNext: boolean;
  items: T[];
  itemsLength: number;
  totalRecords: number;
}
