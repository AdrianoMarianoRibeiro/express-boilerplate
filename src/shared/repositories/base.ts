import { Repository, SelectQueryBuilder } from "typeorm";
import { PageMetaDto } from "../pagination/page-meta.dto";
import { PageDto } from "../pagination/page.dto";
import { PageOptionsDto } from "../pagination/page-options.dto";

// Interface para opções de busca e ordenação
export interface GetAllOptions<T> {
  orderByField?: keyof T;
  filters?: Record<string, any>;
  relations?: string[];
  alias?: string;
  searchTerm?: string;
  searchFields?: Array<keyof T>;
  excludeFields?: Array<keyof T>; // Nova propriedade
}

export abstract class AppBaseRepository<T extends Record<string, any>> {
  constructor(protected readonly repository: Repository<T>) {}

  create(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  bulkCreate(entities: T[]): Promise<T[]> {
    return this.repository.save(entities);
  }

  update(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  delete(id: number | string): Promise<any> {
    return this.repository.delete(id);
  }

  softDelete(id: number | string): Promise<any> {
    return this.repository.softDelete(id);
  }

  find(id: number | string, relations: string[] = []): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as any,
      relations: relations,
    });
  }

  findAll(relations: string[] = []): Promise<T[]> {
    return this.repository.find({
      relations: relations,
    });
  }

  findOneWhere(where: any, relations: string[] = []): Promise<T | null> {
    return this.repository.findOne({
      where,
      relations: relations,
    });
  }

  findWhere(where: any, relations: string[] = []): Promise<T[]> {
    return this.repository.find({
      where,
      relations: relations,
    });
  }

  async getAll(
    pageOptionsDto: PageOptionsDto,
    options: GetAllOptions<T> = {}
  ): Promise<PageDto<T>> {
    const {
      orderByField = "createdAt",
      filters = {},
      relations = [],
      alias = this.repository.metadata.tableName,
      searchTerm,
      searchFields = [],
      excludeFields = [],
    } = options;

    const queryBuilder = this.repository.createQueryBuilder(alias);

    // Seleciona apenas os campos desejados (excluindo os especificados)
    if (excludeFields.length > 0) {
      const allColumns = this.repository.metadata.columns.map(
        (col) => col.propertyName
      );
      const selectedColumns = allColumns.filter(
        (col) => !excludeFields.includes(col as keyof T)
      );

      queryBuilder.select(selectedColumns.map((col) => `${alias}.${col}`));
    }

    // ...resto do código permanece igual...
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
    });

    this.applyFilters(queryBuilder, filters, alias);

    if (searchTerm && searchFields.length > 0) {
      this.applySearchTerm(queryBuilder, searchTerm, searchFields, alias);
    }

    queryBuilder.orderBy(
      `${alias}.${String(orderByField)}`,
      pageOptionsDto.order
    );

    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  // Método auxiliar para aplicar filtros
  private applyFilters<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: Record<string, any>,
    alias: string
  ): void {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "string") {
          queryBuilder.andWhere(`${alias}.${key} LIKE :${key}`, {
            [key]: `%${value}%`,
          });
        } else {
          queryBuilder.andWhere(`${alias}.${key} = :${key}`, {
            [key]: value,
          });
        }
      }
    });
  }

  // Método auxiliar para busca por termo em múltiplos campos
  private applySearchTerm<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    searchTerm: string,
    searchFields: Array<keyof T>,
    alias: string
  ): void {
    if (searchFields.length === 0) return;

    const conditions = searchFields.map(
      (field) => `${alias}.${String(field)} LIKE :searchTerm`
    );

    queryBuilder.andWhere(`(${conditions.join(" OR ")})`, {
      searchTerm: `%${searchTerm}%`,
    });
  }
}
