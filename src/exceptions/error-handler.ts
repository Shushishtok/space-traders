import { Response } from 'express';
import { AppError, HttpCode } from './app-error';
import { AxiosError, isAxiosError } from 'axios';

class ErrorHandler {
  private isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  }

  public handleError(error: Error, response?: Response): void {
    if (this.isTrustedError(error)) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }

  private handleTrustedError(error: AppError, response?: Response): void {
	if (response) {		
		response.status(error.httpCode).json({ name: error.name, message: error.message });
	} else {
		console.log(`An error occurred, error code: ${error.httpCode}, error message: ${error.message}`);
	}
  }

  private handleCriticalError(error: Error, response?: Response): void {
    if (response) {
      response.sendStatus(HttpCode.INTERNAL_SERVER_ERROR);
    }

    console.log(`Application encountered a critical error. Exiting. Error message: ${error.message}.`);
    process.exit(1);
  }  
}

export const errorHandler = new ErrorHandler();