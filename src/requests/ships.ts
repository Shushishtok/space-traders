import { PaginatedRequest } from "../interfaces/pagination";
import { FleetApi, PurchaseCargoRequest, SellCargoRequest, ShipType, Survey } from "../packages/spacetraders-sdk";
import { tryApiRequest, validatePagination } from "../utils";
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
		return result.data;
	}, "Could not get ships"); 
}

export async function listShips(pagination: PaginatedRequest) {	
	const { page, limit } = pagination;
	validatePagination(page, limit);
	
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.getMyShips(page, limit);
		return result.data;
	}, "Could not list ships");
}

export async function purchaseShip(shipType: ShipType, waypointSymbol: string) {
	const shipsApi = getFleetApi();
	
	return await tryApiRequest(async () => {
		const result = await shipsApi.purchaseShip({ shipType, waypointSymbol });
		return result.data;
	}, "Could not purchase ship");
}

export async function navigateShip(shipSymbol: string, waypointSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.navigateShip(shipSymbol, { waypointSymbol });
		return result.data;
	}, "Could not navigate ship");
} 

export async function dockShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.dockShip(shipSymbol);
		return result.data;
	}, "Could not dock ship");
}

export async function refuelShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.refuelShip(shipSymbol);
		return result.data;
	}, "Could not refuel ship");
}

export async function orbitShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.orbitShip(shipSymbol);
		return result.data;
	}, "Could not refuel ship");
}

export async function extractResources(shipSymbol: string, survey?: Survey) {
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.extractResources(shipSymbol, { survey })
		return result.data;
	}, "Could not extract resources");
}

export async function sellCargo(shipSymbol: string, sellObject: SellCargoRequest) {
	const shipsApi = getFleetApi();	

	return await tryApiRequest(async () => {
		const result = await shipsApi.sellCargo(shipSymbol, sellObject)
		return result.data;
	}, "Could not sell ship cargo");
}

export async function purchaseCargo(shipSymbol: string, purchaseObject: PurchaseCargoRequest) {
	const shipsApi = getFleetApi();	

	return await tryApiRequest(async () => {
		const result = await shipsApi.sellCargo(shipSymbol, purchaseObject);
		return result.data;
	}, "Could not purchase into ship cargo");
}