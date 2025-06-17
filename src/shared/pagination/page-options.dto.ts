import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderEnum } from './order.enum';

export class PageOptionsDto {
  @IsEnum(OrderEnum)
  @IsOptional()
  order?: OrderEnum = OrderEnum.ASC;

  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  get skip(): number {
    const pageNum =
      typeof this.page === 'number'
        ? this.page
        : parseInt(String(this.page), 10) || 1;
    const limitNum =
      typeof this.limit === 'number'
        ? this.limit
        : parseInt(String(this.limit), 10) || 10;

    console.log('Skip calculation:', {
      page: pageNum,
      limit: limitNum,
      skip: (pageNum - 1) * limitNum,
    });

    return (pageNum - 1) * limitNum;
  }
}
