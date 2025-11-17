import AppError from "./AppError";

export default class NotFoundError extends AppError {
  status: number = 404;
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
