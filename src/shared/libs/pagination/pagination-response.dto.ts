import { ApiProperty } from '../../../decorators';

export class PaginationResponseDto<T> {
  @ApiProperty({
    description: 'Current page number',
    type: 'number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Number of records skipped',
    type: 'number',
    example: 0,
  })
  skippedRecords: number;

  @ApiProperty({
    description: 'Total number of pages',
    type: 'number',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    type: 'boolean',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Array of items',
    isArray: true,
    type: 'object', // Será substituído pelo tipo específico quando usado
  })
  items: T[];

  @ApiProperty({
    description: 'Number of items in current page',
    type: 'number',
    example: 10,
  })
  itemsLength: number;

  @ApiProperty({
    description: 'Total number of records',
    type: 'number',
    example: 50,
  })
  totalRecords: number;
}
