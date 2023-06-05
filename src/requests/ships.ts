import { PaginatedRequest } from "../interfaces/pagination";
import { Logger } from "../logger/logger";
import { FleetApi, PurchaseCargoRequest, SellCargoRequest, ShipNavFlightMode, ShipType, Survey } from "../../packages/spacetraders-sdk";
import { AgentModel, ExtractionModel, ShipModel, SurveyModel, TransactionModel } from "../sequelize/models";
import { calculateTimeUntilArrival, isErrorCodeData, tryApiRequest, validatePagination } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";
import { shipSurveyExhaustedError, shipSurveyExpirationError } from "../consts/error-codes";
import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from "../consts/general";
import { ShipActionRole } from "../consts/ships";

function getFleetApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new FleetApi(configuration, undefined, axiosInstance);
}

export async function getShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.getMyShip(shipSymbol);
		const { data } = result;		
		return data;
	}, "Could not get ships"); 
	
	if (isErrorCodeData(data)) return data;

	Logger.info(`Got ship details: ${JSON.stringify(data, undefined, 4)}`);
	await ShipModel.upsert({ ...data.data, symbol: data.data.symbol });	

	return data;
}

export async function listShips(pagination: PaginatedRequest) {	
	const { page = DEFAULT_PAGINATION_PAGE, limit = DEFAULT_PAGINATION_LIMIT } = pagination;
	validatePagination(page, limit);
	
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.getMyShips(page, limit);
		const { data } = result;		
		return data;
	}, "Could not list ships");	

	if (isErrorCodeData(data)) return data;
	
	Logger.info(`Listing ${limit} ships in page ${page}: ${JSON.stringify(data, undefined, 4)}`);

	const promises: Promise<[ShipModel, boolean | null]>[] = [];
	for (const ship of data.data) {
		promises.push(ShipModel.upsert({ ...ship }));
	}
	await Promise.all(promises);	

	return data;
}

export async function purchaseShip(shipType: ShipType, waypointSymbol: string) {
	const shipsApi = getFleetApi();
	
	const data = await tryApiRequest(async () => {
		const result = await shipsApi.purchaseShip({ shipType, waypointSymbol });
		const { data } = result;		
		return data;
	}, "Could not purchase ship");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Purchased ship of type ${shipType} at waypoint ${waypointSymbol} for ${data.data.transaction.price}$. Remaining balance: ${data.data.agent.credits} The new ship's symbol is ${data.data.ship.symbol}.`);	
	const shipCreatePromise = ShipModel.create({ ...data.data.ship });
	const agentUpdatePromite = AgentModel.update({ ...data.data.agent }, { where: { symbol: data.data.agent.symbol } });
	await Promise.all([shipCreatePromise, agentUpdatePromite]);	

	return data;
}

export async function navigateShip(shipSymbol: string, waypointSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.navigateShip(shipSymbol, { waypointSymbol });
		const { data } = result;		
		return data;
	}, "Could not navigate ship");

	if (isErrorCodeData(data)) return data;
	
	const { humanReadableTimestamp } = calculateTimeUntilArrival(data.data.nav.route.arrival);		
	Logger.info(`Ship with symbol ${shipSymbol} is currently navigating to ${waypointSymbol} in flight mode ${data.data.nav.flightMode}. Expected time until arrival: ${data.data.nav.route.arrival} (${humanReadableTimestamp}).`);

	await ShipModel.update({ ...data.data }, { where: { symbol: shipSymbol } } );	

	return data;
} 

export async function dockShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.dockShip(shipSymbol);
		const { data } = result;		
		return data;
	}, "Could not dock ship");	

	if (isErrorCodeData(data)) return data;

	Logger.info(`Ship with symbol ${shipSymbol} is now docked in waypoint symbol ${data.data.nav.waypointSymbol}.`);
	await ShipModel.update({ nav: data.data.nav }, { where: { symbol: shipSymbol } });

	return data;
}

export async function refuelShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.refuelShip(shipSymbol);
		const { data } = result;		
		return data;
	}, "Could not refuel ship");
	if (isErrorCodeData(data)) return data;

	Logger.info(`Ship with symbol ${shipSymbol} refueled. Gained ${data.data.transaction.units} units of fuel, paying ${data.data.transaction.totalPrice}. Current balance: ${data.data.agent.credits}.`);	
	await ShipModel.update({ fuel: data.data.fuel }, { where: { symbol: shipSymbol } });

	return data;
}

export async function orbitShip(shipSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.orbitShip(shipSymbol);
		const { data } = result;		
		return data;
	}, "Could not orbit ship");

	if (isErrorCodeData(data)) return data;
	
	Logger.info(`Ship with symbol ${shipSymbol} is orbiting waypoint ${data.data.nav.waypointSymbol}.`);
	await ShipModel.update({ nav: data.data.nav }, { where: { symbol: shipSymbol } });	

	return data;
}

export async function extractResources(shipSymbol: string, survey?: Survey) {
	const shipsApi = getFleetApi();
	const allowedErrorCodes = [shipSurveyExpirationError, shipSurveyExhaustedError];

	const result = await tryApiRequest(async () => {
		const result = await shipsApi.extractResources(shipSymbol, { survey });
		const { data } = result;
		return data;
	}, "Could not extract resources",
	allowedErrorCodes
	);

	if (isErrorCodeData(result)) {
		if (result === shipSurveyExpirationError || result === shipSurveyExhaustedError) {
			if (survey) {
				const surveyData = await SurveyModel.getSurvey(survey.signature);
				if (surveyData) {
					await surveyData.destroy();
					Logger.info(`Survey with signature ${surveyData.signature} is exhausted or expired. Cleared the survey from the DB.`);
				}
			}
		}
	} else {
		Logger.info(`Ship with symbol ${shipSymbol} made an ${survey ? 'surveyed extraction' : 'normal extraction'} and extracted ${result.data.extraction.yield.units} units of ${result.data.extraction.yield.symbol} and entered a cooldown of ${result.data.cooldown.totalSeconds} seconds. Current cargo space: ${result.data.cargo.units}/${result.data.cargo.capacity}`);
		const shipUpdatePromise = ShipModel.update({ cargo: result.data.cargo }, { where: { symbol: shipSymbol } });	
		const extractionCreatePromise = ExtractionModel.create({ ...result.data.extraction });
		await Promise.all([shipUpdatePromise, extractionCreatePromise]);		
	}

	return result;
}

export async function sellCargo(shipSymbol: string, sellObject: SellCargoRequest) {
	const shipsApi = getFleetApi();	

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.sellCargo(shipSymbol, sellObject);
		const { data } = result;
		return data;
	}, "Could not sell ship cargo");

	if (isErrorCodeData(data)) return data;
	
	Logger.info(`Ship with symbol ${shipSymbol} sold ${sellObject.units} units of ${sellObject.symbol} successfully for ${data.data.transaction.totalPrice}$. Current balance: ${data.data.agent.credits}`);
	const shipUpdatePromise = ShipModel.update({ ...data.data.cargo }, { where: { symbol: shipSymbol } });
	const agentUpdatePromise = AgentModel.update({ credits: data.data.agent.credits }, { where: { symbol: data.data.agent.symbol } });
	const transctionCreatePromise = TransactionModel.create({ ...data.data.transaction });
	await Promise.all([shipUpdatePromise, transctionCreatePromise, agentUpdatePromise]);

	return data;
}

export async function purchaseCargo(shipSymbol: string, purchaseObject: PurchaseCargoRequest) {
	const shipsApi = getFleetApi();	

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.purchaseCargo(shipSymbol, purchaseObject);
		const { data } = result;		
		return data;
	}, "Could not purchase into ship cargo");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Ship with symbol ${shipSymbol} purchased ${purchaseObject.units} units of ${purchaseObject.symbol} for ${data.data.transaction.totalPrice}$. Current balance: ${data.data.agent.credits}`);
	const shipUpdatePromise = ShipModel.update({ ...data.data.cargo }, { where: { symbol: shipSymbol } });
	const agentUpdatePromise = AgentModel.update({ credits: data.data.agent.credits }, { where: { symbol: data.data.agent.symbol } });
	const transctionCreatePromise = TransactionModel.create({ ...data.data.transaction });
	await Promise.all([shipUpdatePromise, transctionCreatePromise, agentUpdatePromise]);

	return data;	
}

export async function createSurvey(shipSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.createSurvey(shipSymbol);
		const { data } = result;		
		return data;
	}, "Could not survey waypoint.");
	
	if (isErrorCodeData(data)) return data;

	const surveyPromises: Promise<SurveyModel>[] = [];
	const surveys = data.data.surveys;
	Logger.info(`Ship with symbol ${shipSymbol} created ${surveys.length} new surveys:`);
	let counter = 1;
	for (const survey of surveys) {
		Logger.info(`Survey #${counter} details: ${JSON.stringify(survey, undefined, 4)}`);
		surveyPromises.push(SurveyModel.create({ ...survey }));	
		counter++;
	}
	Logger.info(`Ship with symbol ${shipSymbol} entered a cooldown of ${data.data.cooldown.totalSeconds} seconds.`);
	await Promise.all(surveyPromises);

	return data;
}

export async function warpShip(shipSymbol: string, waypointSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.warpShip(shipSymbol, { waypointSymbol });
		const { data } = result;
		return data;
	}, "Could not warp to waypoint");
	
	if (isErrorCodeData(data)) return data;

	const { humanReadableTimestamp } = calculateTimeUntilArrival(data.data.nav.route.arrival);
	Logger.info(`Ship with symbol ${shipSymbol} is currently warping to ${waypointSymbol} in flight mode ${data.data.nav.flightMode}. Expected time until arrival: ${data.data.nav.route.arrival} (${humanReadableTimestamp}).`);
	await ShipModel.update({ fuel: data.data.fuel, nav: data.data.nav }, { where: { symbol: shipSymbol } });

	return data;
}

export async function setFlightMode(shipSymbol: string, flightMode: ShipNavFlightMode) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.patchShipNav(shipSymbol, { flightMode });
		const { data } = result;
		return data;
	}, "Could not set flight mode");
	
	if (isErrorCodeData(data)) return data;
	Logger.info(`Set ship with symbol ${shipSymbol} flight mode to ${flightMode}.`);
	
	await ShipModel.update({ nav: data.data }, { where: { symbol: shipSymbol } });
	
	return data;
}

export async function installMount(shipSymbol: string, mountSymbol: string) {
	const shipsApi = getFleetApi();

	const data = await tryApiRequest(async () => {
		const result = await shipsApi.installMount(shipSymbol, { symbol: mountSymbol });
		const { data } = result;
		return data;
	}, "Could not set mount");
	
	if (isErrorCodeData(data)) return data;

	Logger.info(`Successfully installed mount ${mountSymbol} in ship symbol: ${shipSymbol}.`);
	
	const updateAgentPromise = AgentModel.update({ ...data.data.agent }, { where: { symbol: data.data.agent.symbol } });
	const updateShipPromise = ShipModel.update({ cargo: data.data.cargo, mounts: data.data.mounts }, { where: { symbol: shipSymbol } });
	const createTransactionPromise = TransactionModel.create({ ...data.data.transaction });
	await Promise.all([updateAgentPromise, updateShipPromise, createTransactionPromise]);

	return data;
}

export async function updateRoles(shipSymbol: string, addRoles: ShipActionRole[] = [], removeRoles: ShipActionRole[] = []) {
	if (addRoles.length === 0 && removeRoles.length === 0) {
		Logger.info(`No roles were added or removed. Skipping action.`);
		return;
	}

	const ship = await ShipModel.getShip(shipSymbol);
	let updatedRoles = ship.roles.filter(role => !removeRoles.includes(role)).concat(addRoles);	
	updatedRoles = [...new Set(updatedRoles)]; // dedup

	await ship.update({ roles: updatedRoles });
	Logger.info(`Assigned roles to ship symbol ${shipSymbol}. Current ship's assigned roles: ${JSON.stringify(updatedRoles)}`);	
	return updatedRoles;
}
