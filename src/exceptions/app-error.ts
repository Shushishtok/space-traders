export enum ErrorNames {
	BAD_PARAMETER = "Bad Parameter",
	API_ERROR = "API Error",
	MISSING_PARAMETER = "Missing Parameter",
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
  }
  
export class AppError extends Error {
	public readonly name: string;
	public readonly httpCode: HttpCode;
	public readonly isOperational: boolean = true;

	constructor(args: AppErrorArgs) {
		const { description, httpCode, isOperational, name } = args;
		super(description);

		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name ?? 'Error';
		this.httpCode = httpCode;

		if (isOperational !== undefined) {
			this.isOperational = isOperational;
		}

		Error.captureStackTrace(this);
	}
}