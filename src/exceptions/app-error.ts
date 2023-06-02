import { Logger } from "../logger/logger";

export enum ErrorNames {
	BAD_PARAMETER = "Bad Parameter",
	API_ERROR = "API Error",
	MISSING_PARAMETER = "Missing Parameter",
	LOGICAL_FAILURE = "Logical Failure",
	DB_ERROR = "DB Error",
}

export enum HttpCode {
	OK = 200,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	NOT_FOUND = 404,
	INTERNAL_SERVER_ERROR = 500,
}

interface AppErrorArgs {
	name?: string;
	httpCode: HttpCode;
	description: string;
	isOperational?: boolean;
	avoidPrintingError?: boolean;
  }
  
export class AppError extends Error {
	public readonly name: string;
	public readonly httpCode: HttpCode;
	public readonly isOperational: boolean = true;
	public readonly avoidPrintingError: boolean = false;

	constructor(args: AppErrorArgs) {
		super(args.description);
		const { description, httpCode, isOperational, name, avoidPrintingError } = args;

		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name ?? 'Error';
		this.httpCode = httpCode;		

		if (isOperational !== undefined) {
			this.isOperational = isOperational;
		}

		if (avoidPrintingError !== undefined) {
			this.avoidPrintingError = avoidPrintingError;
		}

		Error.captureStackTrace(this);

		if (!this.avoidPrintingError) {
			if (this.isOperational) {
				Logger.error(`An error was thrown with code: ${this.httpCode} and message: ${description}`);
			} else {
				Logger.fatal(`A fatal error was thrown with code: ${this.httpCode} and message: ${description}. Will close the program.`);
			}
		}
	}
}