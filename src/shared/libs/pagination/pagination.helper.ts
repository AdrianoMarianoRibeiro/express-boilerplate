import { PaginationRequest } from "./interfaces";
import { PaginationResponseDto } from "./pagination-response.dto";

export class Pagination {
  static of<T>(
    { limit, page, skip }: PaginationRequest,
    totalRecords: number,
    dtos: T[]
  ): PaginationResponseDto<T> {
    const totalPages = Math.ceil(totalRecords / limit);
    const currentPage = +page > 0 ? +page : 1;
    const hasNext = currentPage <= totalPages - 1;

    return {
      totalPages: totalPages,
      itemsLength: dtos.length,
      hasNext: hasNext,
      items: dtos,
      currentPage: currentPage,
      skippedRecords: skip,
      totalRecords: totalRecords,
    };
  }
}
