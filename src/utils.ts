import fs from 'fs';
import { Response } from "express";
import { AppError, HttpCode, ErrorNames } from "./exceptions/app-error";
import { isAxiosError } from "axios";
import { ContractDeliverGood, GetMyShip200Response, Ship } from "./packages/spacetraders-sdk";
import moment from "moment";
import { Logger } from "./logger/logger";
import { PaginatedRequest, PaginatedResult } from './interfaces/pagination';

export async function sleep(seconds: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, seconds * 1000)
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

export async function tryApiRequest<T>(tryFunc: () => T, errorMessage: string, allowedErrorCodes?: number[]): Promise<T | number> {
	try {
		const result = await tryFunc();		
		return result;
	} catch (err) {		
		if (isAxiosError(err)) {
			const errorCode = err.response?.data?.error?.code;
			if (errorCode && allowedErrorCodes && allowedErrorCodes.includes(errorCode)) {
				return errorCode;
			}
		}

		// We couldn't handle, print an error message.
		let description = `${errorMessage}. `;
		description += isAxiosError(err) ? 
			`Error code: ${err.response?.data?.error?.code ?? err.response?.status}, error message: ${err.response?.data?.error?.message ?? err.message}` :
			`Error message: ${err}`;		

		Logger.error(description);

		throw new AppError({
			description,
			httpCode: HttpCode.INTERNAL_SERVER_ERROR,
			name: ErrorNames.API_ERROR,
			avoidPrintingError: true,
		});
	}
}

export async function sendResultResponse<T>(response: Response, result?: T) {
	if (result && result === null) {
		response.status(500).send(null);
	}

	response.status(200).send(result);
}

export function getSystemFromWaypoint(waypoint: string) {
	const [sector, system] = waypoint.split('-');
	return `${sector}-${system}`;
}

export function sortContractDeliveries(deliveryTerms: ContractDeliverGood[], shipWaypoint: string) {
	const deliveriesInSameWaypoint = [];
	const deliveriesInSameSystem = [];
	const remainingDeliveries = [];

	for (const deliveryTerm of deliveryTerms) {
		// Prioritize deliveries that are in the same waypoint the ship is currently in
		if (deliveryTerm.destinationSymbol === shipWaypoint) {
			deliveriesInSameWaypoint.push(deliveryTerm);
		// Then prioritize deliveries in the same system
		} else if (getSystemFromWaypoint(deliveryTerm.destinationSymbol) === getSystemFromWaypoint(shipWaypoint)) {
			deliveriesInSameSystem.push(deliveryTerm);
		} else {
			remainingDeliveries.push(deliveryTerm);
		}
	}

	// Rebuild the array of deliveries
	const sortedDeliveries = [...deliveriesInSameWaypoint, ...deliveriesInSameSystem, ...remainingDeliveries];
	return sortedDeliveries;
}

export function isSameWaypoint(firstWaypoint: string, secondWaypoint: string) {
	return firstWaypoint === secondWaypoint;
}

export function areWaypointsInSameSystem(firstWaypoint: string, secondWaypoint: string) {
	return getSystemFromWaypoint(firstWaypoint) === getSystemFromWaypoint(secondWaypoint);
}

export function getInventoryUnitFromCargo(ship: GetMyShip200Response, tradeSymbol: string) {
	return ship.data.cargo.inventory.find(inventoryUnit => inventoryUnit.symbol === tradeSymbol);
}

export function hasInventoryUnitInCargo(ship: GetMyShip200Response, tradeSymbol: string) {
	return getInventoryUnitFromCargo(ship, tradeSymbol) !== undefined;
}

export function calculateTimeUntilArrival(arrivalTime: string) {	
	const diff = moment(arrivalTime).diff(moment());
	const duration = moment.duration(diff);
	const hours = duration.asHours();
	const minutes = duration.asMinutes();
	const seconds = duration.asSeconds();
	const milliseconds = duration.asMilliseconds();	
	const humanReadableTimestamp = `${Math.round(hours)} hours, ${Math.round(minutes)} minutes and ${Math.round(seconds)} seconds`;
	return { humanReadableTimestamp, hours, minutes, seconds, milliseconds };
}

export function appendToFile(filePath: string, data: string) {
	fs.appendFileSync(filePath, data);
}

export function canShipSurvey(ship: Ship) {
	return ship.mounts.some(mount => mount.symbol.includes("MOUNT_SURVEYOR"));
}

export function isErrorCodeData<T>(data: T | number): data is number {
	return typeof data === "number"; 
}

export async function paginateResults<T>(paginationFunc: (pagination: PaginatedRequest) => T) {
	const items = [];
	let pagination: PaginatedRequest = { limit: 20, page: 1 };
	let paginationFinished = false;
	let attempts = 0;
	while (!paginationFinished || attempts > 500) {
		attempts += 1;
		const result = await paginationFunc(pagination) as PaginatedResult<T>;
		if (isErrorCodeData(result)) { // shouldn't occur, but just in case
			paginationFinished = true;
			continue;
		}

		if (result.meta.total <= (pagination.page * pagination.limit)) {
			paginationFinished = true;
		} else {
			pagination.page += 1;
		}

		items.push(...result.data);
		await sleep(1);
	}

	return items;
}