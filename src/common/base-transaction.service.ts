import { DataSource, EntityManager } from 'typeorm';

export class BaseTransactionService {
  constructor(protected readonly dataSource: DataSource) {}

  protected async runInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
    onSuccess?: (result: T) => Promise<void>,
    onError?: (error: any) => Promise<void>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();

      if (onSuccess) {
        await onSuccess(result);
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (onError) {
        await onError(error);
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
