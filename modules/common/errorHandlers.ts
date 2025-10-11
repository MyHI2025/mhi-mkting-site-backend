import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Standard Error Response Format
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  status: number;
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Async Route Handler Wrapper
 * Catches errors from async route handlers and passes them to error middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Standard Error Response Helper
 * Sends consistent error responses
 */
export function sendErrorResponse(
  res: Response,
  error: any,
  defaultMessage: string = 'Internal server error'
): void {
  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors,
      status: 400,
    });
    return;
  }

  // Custom API errors
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: error.message,
      details: error.details,
      status: error.status,
    });
    return;
  }

  // Errors with status property
  if (error.status) {
    res.status(error.status).json({
      error: error.message || defaultMessage,
      status: error.status,
    });
    return;
  }

  // Generic errors
  console.error('Unexpected error:', error);
  res.status(500).json({
    error: defaultMessage,
    status: 500,
  });
}

/**
 * Not Found Error Helper
 */
export function notFound(resource: string, id?: string): ApiError {
  const message = id 
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;
  return new ApiError(message, 404);
}

/**
 * Conflict Error Helper
 */
export function conflict(message: string, details?: any): ApiError {
  return new ApiError(message, 409, details);
}

