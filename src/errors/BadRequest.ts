import AppError from "./AppError"

export default class BadRequestError extends AppError  {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}
