import { Response } from 'express';
import { AppError, HttpCode } from './app-error';

export class ErrorHandler {
	private static isTrustedError(error: Error): boolean {
		if (error instanceof AppError) {
			return error.isOperational;
		}

		return false;
	}

	public static handleError(error: Error, response?: Response): void {
		if (ErrorHandler.isTrustedError(error)) {
			ErrorHandler.handleTrustedError(error as AppError, response);
		} else {
			ErrorHandler.handleCriticalError(error, response);
		}
	}

	private static handleTrustedError(error: AppError, response?: Response): void {
		if (response) {		
			response.status(error.httpCode).json({ name: error.name, message: error.message });
		} else {
			console.log(`An error occurred, error code: ${error.httpCode}, error message: ${error.message}`);
		}
	}

	private static handleCriticalError(error: Error, response?: Response): void {
		if (response) {
			response.sendStatus(HttpCode.INTERNAL_SERVER_ERROR);
		}

		console.log(`Application encountered a critical error. Exiting. Error message: ${error.message}.`);
		process.exit(1);
	}  
}