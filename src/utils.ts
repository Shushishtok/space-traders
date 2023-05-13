import { Response } from "express";
import { AppError, HttpCode, ErrorNames } from "./exceptions/app-error";
import { AxiosError, isAxiosError } from "axios";
import { ContractDeliverGood, GetMyShip200Response } from "./packages/spacetraders-sdk";
import moment from "moment";

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
		let description = `${errorMessage}. `;
		if (isAxiosError(e)) {
			description += `Error code: ${e.response?.status}, error message: ${e.response?.data?.error?.message ?? e.message}`;
		} else {
			description += `Error message: ${e}`;
		}

		throw new AppError({
			description,
			httpCode: HttpCode.INTERNAL_SERVER_ERROR,
			name: ErrorNames.API_ERROR,
		});
	}
}

export async function sendSuccessResultResponse<T>(response: Response, result?: T) {
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
	const now = moment();
	return moment(arrivalTime).diff(now);
}