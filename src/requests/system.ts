import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from "../consts/general";
import { PaginatedRequest } from "../interfaces/pagination";
import { Logger } from "../logger/logger";
import { SystemsApi } from "../packages/spacetraders-sdk";
import { MarketModel, SystemModel, WaypointModel } from "../sequelize/models";
import { isErrorCodeData, tryApiRequest } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getSystemApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new SystemsApi(configuration, undefined, axiosInstance);
}

export async function getWaypoint(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();

	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getWaypoint(systemSymbol, waypointSymbol);
		const { data } = result;		
		return data;
	}, "Could not get waypoint");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Got waypoint: ${JSON.stringify(data, undefined, 4)}`);
	await WaypointModel.upsert({ ...data.data });

	return data;
}

export async function listWaypointsInSystem(systemSymbol: string, pagination: PaginatedRequest) {
	const { page = DEFAULT_PAGINATION_PAGE, limit = DEFAULT_PAGINATION_LIMIT } = pagination;
	const systemsApi = getSystemApi();	
	
	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getSystemWaypoints(systemSymbol, page, limit);
		const { data } = result;		
		return data;
	}, "Could not get all waypoints in the system");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Listing ${limit} waypoints in page ${page} for system ${systemSymbol}: ${JSON.stringify(data, undefined, 4)}`);
	const promises = [];
	for (const waypoint of data.data) {
		promises.push(WaypointModel.upsert({ ...waypoint }));
	}
	await Promise.all(promises);

	return data;
}

export async function getShipyard(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();
	
	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getShipyard(systemSymbol, waypointSymbol);
		const { data } = result;		
		return data;
	}, "Could not get shipyard");

	Logger.info(`Got shipyard at waypoint ${waypointSymbol}: ${JSON.stringify(data, undefined, 4)}`);

	return data;
}

export async function getMarket(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();
	
	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getMarket(systemSymbol, waypointSymbol);
		const { data } = result;		
		return data;
	}, "Could not get market");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Got market at waypoint: ${waypointSymbol}: ${JSON.stringify(data, undefined, 4)}`);
	await MarketModel.upsert({ ...data.data });

	return data;
}

export async function listSystems(pagination: PaginatedRequest) {
	const { page = DEFAULT_PAGINATION_PAGE, limit = DEFAULT_PAGINATION_LIMIT } = pagination;
	const systemsApi = getSystemApi();	
	
	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getSystems(page, limit);
		const { data } = result;		
		return data;
	}, "Could not get list systems");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Listing ${limit} systems in page ${page}: ${JSON.stringify(data, undefined, 4)}`);
	const promises = [];
	for (const system of data.data) {
		promises.push(SystemModel.upsert({ ...system }));
	}
	await Promise.all(promises);

	return data;
}

export async function getJumpGate(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();

	const data = await tryApiRequest(async () => {
		const result = await systemsApi.getJumpGate(systemSymbol, waypointSymbol);
		const { data } = result;
		return data;
	}, "Could not get jump gate");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Got jump gate data: ${JSON.stringify(data, undefined, 4)}`);
	// await WaypointModel.upsert({ ...data.data }); TODO: add JumpgateModel and upsert into it instead

	return data;
}