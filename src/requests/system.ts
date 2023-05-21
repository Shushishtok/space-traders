import { Logger } from "../logger/logger";
import { SystemsApi } from "../packages/spacetraders-sdk";
import { tryApiRequest, validatePagination } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getSystemApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new SystemsApi(configuration, undefined, axiosInstance);
}

export async function getWaypoint(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();

	return await tryApiRequest(async () => {
		const result = await systemsApi.getWaypoint(systemSymbol, waypointSymbol);
		const { data } = result;
		Logger.info(`Got waypoint: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not get waypoint");	
}

export async function getSystemsWaypoints(systemSymbol: string, page: number, limit: number) {
	const systemsApi = getSystemApi();
	validatePagination(page, limit);
	
	return await tryApiRequest(async () => {
		const result = await systemsApi.getSystemWaypoints(systemSymbol, page, limit);
		const { data } = result;
		Logger.info(`Listing ${limit} waypoints in page ${page} for system ${systemSymbol}: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not get all waypoints in the system");
}

export async function getShipyard(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();
	
	return await tryApiRequest(async () => {
		const result = await systemsApi.getShipyard(systemSymbol, waypointSymbol)
		const { data } = result;
		Logger.info(`Got shipyard at waypoint ${waypointSymbol}: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not get shipyard");
}

export async function getMarket(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();
	
	return await tryApiRequest(async () => {
		const result = await systemsApi.getMarket(systemSymbol, waypointSymbol)
		const { data } = result;
		Logger.info(`Got market at waypoint: ${waypointSymbol}: ${JSON.stringify(data, undefined, 4)}`);
		return data;
	}, "Could not get market");
}