/**
 * Base Repository Interface
 * Provides common CRUD operations for all repositories
 */
export interface IBaseRepository<T, TInsert> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: TInsert): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<{ success: boolean; message: string }>;
}

/**
 * Repository Error Types
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public details?: any) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class DuplicateError extends RepositoryError {
  constructor(resource: string, field: string) {
    super(`${resource} with this ${field} already exists`, 'DUPLICATE', 409);
    this.name = 'DuplicateError';
  }
}
