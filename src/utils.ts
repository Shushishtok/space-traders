import { AppError, HttpCode, ErrorNames } from "./exceptions/app-error";

export async function sleep(milliSeconds: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, milliSeconds * 1000)
	});
}

export function validatePagination(page: number, limit: number) {
	if (limit && (isNaN(limit) || limit < 1 || limit > 20)) {
		throw new AppError({
			description: `Parameter 'limit' must be a number between 1 to 20, or omitted. Value provided: ${limit}`,
			httpCode: HttpCode.BAD_REQUEST,
			name: ErrorNames.BAD_PARAMETER,
		});
	}

	if (page && (isNaN(page) || page < 1)) {
		throw new AppError({
			description: `Parameter 'page' must be 1 or above, or omitted. Value provided: ${page}`,
			httpCode: HttpCode.BAD_REQUEST,
			name: ErrorNames.BAD_PARAMETER,
		});
	}
}

export function validateMissingParameters(paramsToCheck: object) {	
	for (const [key, param] of Object.entries(paramsToCheck)) {
		if (!param) {
			throw new AppError({
				description: `Parameter ${key} was not provided`,
				httpCode: HttpCode.BAD_REQUEST,
				name: ErrorNames.MISSING_PARAMETER,
			});
		}
	}
}

export async function tryApiRequest<T>(tryFunc: () => T, errorMessage: string) {
	try {
		const result = await tryFunc();
		return result;
	} catch (e) {
		throw new AppError({
			description: `${errorMessage}. Error: ${e}`,
			httpCode: HttpCode.INTERNAL_SERVER_ERROR,
			name: ErrorNames.API_ERROR,
		});
	}
}