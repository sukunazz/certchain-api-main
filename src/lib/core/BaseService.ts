import { Prisma } from '@prisma/client';
import { DbService } from '../db/db.service';
import { Pagination } from '../pagination/paginate';

export abstract class BaseService<T> {
  constructor(
    protected readonly db: DbService,
    protected readonly model: Lowercase<Prisma.ModelName>,
  ) {}

  public async create<K extends Partial<T>>(data: K): Promise<T> {
    return await this.db[this.model].create({
      data,
    });
  }

  public async all(params: Pagination): Promise<[T[], number]> {
    const [items, count] = await this.db.$transaction([
      this.db[this.model].findMany({
        ...params,
        where: params.where,
      }),
      this.db[this.model].count({
        where: params.where,
      }),
    ]);
    return [items, count];
  }

  public async one(id: string): Promise<T | null> {
    return await this.db[this.model].findUnique({
      where: { id },
    });
  }

  public async update<K extends Partial<T>>(id: string, data: K): Promise<T> {
    return await this.db[this.model].update({
      where: { id },
      data,
    });
  }

  public async remove(id: string): Promise<T> {
    return await this.db[this.model].delete({
      where: { id },
    });
  }
}
