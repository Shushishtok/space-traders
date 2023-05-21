import { SURVEY_CACHE_FILE } from "../consts/general";
import { PaginatedRequest } from "../interfaces/pagination";
import { Logger } from "../logger/logger";
import { FleetApi, PurchaseCargoRequest, SellCargoRequest, ShipType, Survey } from "../packages/spacetraders-sdk";
import { appendToFile, calculateTimeUntilArrival, tryApiRequest, validatePagination } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getFleetApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new FleetApi(configuration, undefined, axiosInstance);
}

export async function getShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.getMyShip(shipSymbol);
		const { data } = result;
		Logger.info(`Got ship details: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not get ships"); 
}

export async function listShips(pagination: PaginatedRequest) {	
	const { page, limit } = pagination;
	validatePagination(page, limit);
	
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.getMyShips(page, limit);
		const { data } = result;
		Logger.info(`Listing ${limit} ships in page ${page}: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not list ships");
}

export async function purchaseShip(shipType: ShipType, waypointSymbol: string) {
	const shipsApi = getFleetApi();
	
	return await tryApiRequest(async () => {
		const result = await shipsApi.purchaseShip({ shipType, waypointSymbol });
		const { data } = result;
		Logger.info(`Purchased ship of type ${shipType} at waypoint ${waypointSymbol} for ${data.data.transaction.price}$. Remaining balance: ${data.data.agent.credits} The new ship's symbol is ${data.data.ship.symbol}.`);
		return data;
	}, "Could not purchase ship");
}

export async function navigateShip(shipSymbol: string, waypointSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.navigateShip(shipSymbol, { waypointSymbol });
		const { data } = result;
		const { humanReadableTimestamp } = calculateTimeUntilArrival(data.data.nav.route.arrival);
		Logger.info(`Ship with symbol ${shipSymbol} is currently navigating to ${waypointSymbol} in flight mode ${data.data.nav.flightMode}. Expected time until arrival: ${data.data.nav.route.arrival} (${humanReadableTimestamp}).`);
		return data;
	}, "Could not navigate ship");
} 

export async function dockShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.dockShip(shipSymbol);
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} is now docked in waypoint symbol ${data.data.nav.waypointSymbol}.`);
		return data;
	}, "Could not dock ship");
}

export async function refuelShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.refuelShip(shipSymbol);
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} refueled. Gained ${data.data.transaction.units} units of fuel, paying ${data.data.transaction.totalPrice}. Current balance: ${data.data.agent.credits}.`);
		return result.data;
	}, "Could not refuel ship");
}

export async function orbitShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.orbitShip(shipSymbol);
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} is orbiting waypoint ${data.data.nav.waypointSymbol}.`);
		return data;
	}, "Could not orbit ship");
}

export async function extractResources(shipSymbol: string, survey?: Survey) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.extractResources(shipSymbol, { survey })
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} extracted ${data.data.extraction.yield.units} units of ${data.data.extraction.yield.symbol} and entered a cooldown of ${data.data.cooldown.totalSeconds} seconds. Current cargo space: ${data.data.cargo.units}/${data.data.cargo.capacity}`);
		return data;
	}, "Could not extract resources");
}

export async function sellCargo(shipSymbol: string, sellObject: SellCargoRequest) {
	const shipsApi = getFleetApi();	

	return await tryApiRequest(async () => {
		const result = await shipsApi.sellCargo(shipSymbol, sellObject)
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} sold ${sellObject.units} units of ${sellObject.symbol} successfully for ${data.data.transaction.totalPrice}$. Current balance: ${data.data.agent.credits}`);
		return data;
	}, "Could not sell ship cargo");
}

export async function purchaseCargo(shipSymbol: string, purchaseObject: PurchaseCargoRequest) {
	const shipsApi = getFleetApi();	

	return await tryApiRequest(async () => {
		const result = await shipsApi.purchaseCargo(shipSymbol, purchaseObject);
		const { data } = result;
		Logger.info(`Ship with symbol ${shipSymbol} purchased ${purchaseObject.units} units of ${purchaseObject.symbol} for ${data.data.transaction.totalPrice}$. Current balance: ${data.data.agent.credits}`);
		return data;
	}, "Could not purchase into ship cargo");
}

export async function createSurvey(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.createSurvey(shipSymbol);
		const { data } = result;
		const surveys = data.data.surveys;
		Logger.info(`Ship with symbol ${shipSymbol} created ${surveys.length} new surveys:`);
		let counter = 1;
		for (const survey of surveys) {
			Logger.info(`Survey #${counter} details: ${JSON.stringify(survey, undefined, 4)}`);
			counter++;
		}
		Logger.info(`Ship with symbol ${shipSymbol} entered a cooldown of ${data.data.cooldown.totalSeconds} seconds.`);
		appendToFile(SURVEY_CACHE_FILE, JSON.stringify(surveys));
		return data;
	}, "Could not survey waypoint.");
}