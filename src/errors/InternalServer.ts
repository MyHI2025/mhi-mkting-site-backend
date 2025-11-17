/**
 * InternalServerError class extends the AppError class to represent an internal server error.
 * It sets the status code to 500 and provides a default error message.
 */

import AppError from "./AppError";

export default class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}