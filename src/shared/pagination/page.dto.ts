// filepath: /var/www/express-app/src/shared/pagination/page.dto.ts
import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';
import { ApiProperty } from '../../decorators';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({
    description: 'Array of items for current page',
    isArray: true,
  })
  readonly items: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: () => PageMetaDto,
  })
  readonly meta: PageMetaDto;

  constructor(items: T[], meta: PageMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}
