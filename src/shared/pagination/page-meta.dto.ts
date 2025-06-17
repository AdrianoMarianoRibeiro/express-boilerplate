import { ApiProperty } from '../../decorators';

export interface PageMetaDtoParameters {
  pageOptionsDto: any;
  itemCount: number;
}

export class PageMetaDto {
  @ApiProperty({
    description: 'Current page number',
    type: 'number',
    example: 1,
  })
  readonly page: number;

  @ApiProperty({
    description: 'Number of items per page',
    type: 'number',
    example: 10,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'Total number of items',
    type: 'number',
    example: 100,
  })
  readonly itemCount: number;

  @ApiProperty({
    description: 'Total number of pages',
    type: 'number',
    example: 10,
  })
  readonly pageCount: number;

  @ApiProperty({
    description: 'Whether there is a previous page',
    type: 'boolean',
    example: false,
  })
  readonly hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Whether there is a next page',
    type: 'boolean',
    example: true,
  })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = parseInt(pageOptionsDto.page);
    this.limit = parseInt(pageOptionsDto.limit);
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
