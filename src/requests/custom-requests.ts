import * as Ships from './ships';
import * as Systems from './system';
import { Logger } from '../logger/logger';
import { AutomatedActions } from '../automation/automated-action';
import { Ship, ShipNavStatus, Survey } from '../../packages/spacetraders-sdk';
import { canShipExtract, canShipSurvey, isErrorCodeData, sleep } from '../utils';
import { MarketModel, ShipModel, SurveyModel, SystemModel, WaypointModel } from '../sequelize/models';
import { PaginatedRequest } from '../interfaces/pagination';
import { Op } from 'sequelize';
import { AppError, ErrorNames } from '../exceptions/app-error';

export async function getMarketAtShipsLocation(shipSymbol: string) {
	const ship = await ShipModel.getShip(shipSymbol);		
	const { systemSymbol, waypointSymbol } = ship.nav;
	Logger.info(`Getting market at ship symbol ${shipSymbol} waypoint ${waypointSymbol}.`);

	const marketAtShipLocation = await Systems.getMarket(systemSymbol, waypointSymbol);
	if (isErrorCodeData(marketAtShipLocation)) return null;
	return marketAtShipLocation.data;
}

export async function purchaseFullCargo(shipSymbol: string, tradeSymbol: string) {
	const ship = await ShipModel.getShip(shipSymbol);	
	if (isErrorCodeData(ship)) return null;

	const { capacity, units } = ship.cargo;
	const remainingCapacity = capacity - units;
	Logger.info(`Ship's cargo is ${units}/${capacity}, with additional space for ${remainingCapacity} units of ${tradeSymbol}.`);
	
	if (remainingCapacity > 0) {
		const purchaseResult = await Ships.purchaseCargo(shipSymbol, { symbol: tradeSymbol, units: remainingCapacity });
		if (isErrorCodeData(purchaseResult)) return null;
		return purchaseResult;
	} 
	Logger.error(`Ship had no space in its cargo to purchase additional units of ${tradeSymbol}.`);
	return null;
	
}

export async function sellAllCargo(shipSymbol: string) {
	const ship = await ShipModel.getShip(shipSymbol);	
	if (ship.nav.status !== ShipNavStatus.Docked) {
		await Ships.dockShip(shipSymbol);
	}

	const market = await MarketModel.getMarket(ship.nav.waypointSymbol);

	const soldItems = [];
	const unacceptedItems = [];

	Logger.info(`Selling all items in ship with symbol ${shipSymbol}'s cargo`);
	const { inventory } = ship.cargo;	
	if (inventory.length === 0) {
		Logger.info(`Ship with symbol ${shipSymbol} has no cargo to sell.`);		
	}

	for (const item of inventory) {
		const { symbol, units } = item;
		if (market.tradeGoods.some(tradeGood => tradeGood.symbol === symbol)) {
			const result = await Ships.sellCargo(shipSymbol, { symbol, units });
			soldItems.push(result);
		} else {
			Logger.info(`Trade good with symbol ${symbol} is not accepted for sale in the market's trade goods list.`);
			unacceptedItems.push(symbol);
		}
	}
	return { soldItems, unacceptedItems };
}

export async function startAutomatedExtraction(ship: Ship) {
	const shipSymbol = ship.symbol;

	if (!canShipExtract(ship)) {
		Logger.info(`Ship with ship symbol ${shipSymbol} cannot extract as it has no mining mounts. Skipping extract automation.`);
		return;
	}

	const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
	let shouldRemoveFromAutomation = false; // Would not remove from automation until we go into the mining loop.
	try {
		if (!AutomatedActions.startAutomatedAction(automatedActionName)) {
			Logger.debug(`Could not start automated extraction ${automatedActionName} for ship symbol ${shipSymbol}`);
			return;
		}
		Logger.debug(`Started automated mining operation for ship symbol ${shipSymbol}`);
	
		shouldRemoveFromAutomation = true;	
		
		const ship = await ShipModel.findByPk(shipSymbol) as Ship;
		const currentShipWaypointSymbol = ship.nav.waypointSymbol;

		while (AutomatedActions.isAutomationActive(automatedActionName)) {
			// Orbit
			await Ships.orbitShip(shipSymbol);

			// Search for a survey which symbol's equal to the ship's current location
			let survey = await SurveyModel.findOne({ where: { symbol: currentShipWaypointSymbol } }) as Survey;

			// If there is no survey, check if the ship is able to survey			
			if (!survey && canShipSurvey(ship)) {
				const surveyData = await Ships.createSurvey(ship.symbol);
				if (!isErrorCodeData(surveyData)) {
					survey = surveyData.data.surveys[0];
					const cooldown = surveyData.data.cooldown.totalSeconds;
	
					Logger.info(`Ship symbol ${shipSymbol} surveyed during mining loop and will goes into cooldown.`);
	
					await sleep(cooldown);
					continue;
				}
			}
				
			// Extract (fetch cooldown and mined units)
			const extract = await Ships.extractResources(shipSymbol, survey);
			if (isErrorCodeData(extract)) continue;
			const cooldown = extract.data.cooldown.totalSeconds;
			const minedUnits = extract.data.extraction.yield;
	
			// Dock
			await Ships.dockShip(shipSymbol);
	
			// Sell mined units
			await Ships.sellCargo(shipSymbol, minedUnits);
	
			Logger.info(`Ship symbol ${shipSymbol} finished an automated mining loop. Waiting for cooldown to resume.`);
	
			// Wait cooldown
			await sleep(cooldown);
		}
		Logger.debug(`Stopped mining operation for ship ${shipSymbol}`);
	} catch (err) {
		Logger.error(`An error occurred during ship extraction automation for ship ${shipSymbol}. Error: ${err}`);
		if (shouldRemoveFromAutomation) {
			AutomatedActions.removeAutomatedAction(automatedActionName);
		}
	}
}

export function stopAutomatedExtraction(ship: Ship) {
	if (!canShipExtract(ship)) return;

	try {		
		const automatedActionName = `AutomatedExtraction-${ship.symbol}`;
		AutomatedActions.stopAutomatedAction(automatedActionName);
	} catch (err) {
		Logger.error(`An error occurred while stopping automated extraction for ship ${ship.symbol}.`);
	}
}

export async function getAllShips() {		
	const ships = [];
	const pagination: PaginatedRequest = { limit: 20, page: 1 };
	let paginationFinished = false;
	let attempts = 0;
	while (!paginationFinished || attempts > 500) {
		attempts += 1;
		const result = await Ships.listShips(pagination);
		if (isErrorCodeData(result)) { // Shouldn't occur, but just in case
			paginationFinished = true;
			continue;
		}

		if (result.meta.total <= (pagination.page * pagination.limit)) {
			paginationFinished = true;
		} else {
			pagination.page += 1;
		}

		ships.push(...result.data);
		await sleep(1);
	}	

	//Const ships = await paginateResults(Ships.listShips);
	Logger.info(`Got a total of ${ships.length} ships.`);
	return ships;
}

export async function cacheAllSystems() {
	const cachedSystems = [];
	const pagination: PaginatedRequest = { limit: 20, page: 1 };
	let paginationFinished = false;	
	while (!paginationFinished) {		
		const result = await Systems.listSystems(pagination);
		if (isErrorCodeData(result)) { // Shouldn't occur, but just in case
			paginationFinished = true;
			continue;
		}

		if (result.meta.total <= (pagination.page * pagination.limit)) {
			paginationFinished = true;
		} else {
			pagination.page += 1;
		}

		cachedSystems.push(...result.data.map(system => system.symbol));
	}	
	
	Logger.info(`cached a total of ${cachedSystems.length} systems.`);
	return cachedSystems;
}

export async function cacheAllWaypoints() {
	const cachedWaypoints = [];
	const pagination: PaginatedRequest = { limit: 20, page: 1 };
	const systems = await SystemModel.findAll();
	for (const system of systems) {
		let paginationFinished = false;	
		while (!paginationFinished) {		
			const result = await Systems.listWaypointsInSystem(system.symbol, pagination);
			if (isErrorCodeData(result)) { // Shouldn't occur, but just in case
				paginationFinished = true;
				continue;
			}

			if (result.meta.total <= (pagination.page * pagination.limit)) {
				paginationFinished = true;
			} else {
				pagination.page += 1;
			}

			cachedWaypoints.push(...result.data.map(system => system.symbol));
		}
	}
	
	Logger.info(`cached a total of ${cachedWaypoints.length} waypoints.`);
	return cachedWaypoints;
}

export async function findAllWaypointsWithMarkets() {	
	const allWaypointsWithMarkets = await WaypointModel.findAll({ where: { traits: { [Op.contains]: [{ symbol: "MARKETPLACE" }] } } });
	return allWaypointsWithMarkets;
}

export async function findNearbySystemsWithJumpGates(systemSymbol: string) {
	// Check system has a jump gate in the system's waypoints
	const waypointsInSystem = await WaypointModel.findAll({ where: { systemSymbol: systemSymbol } });
	const jumpGateWaypoint = waypointsInSystem.find(waypoint => waypoint.type === "JUMP_GATE");
	if (!jumpGateWaypoint) {
		throw new AppError({
			description: `No jump gate waypoint was found in system ${systemSymbol}`,
			httpCode: 400,
			name: ErrorNames.BAD_PARAMETER,
		});
	}

	// Get jump gate details
	const jumpGateDetails = await Systems.getJumpGate(systemSymbol, jumpGateWaypoint.symbol);
	if (isErrorCodeData(jumpGateDetails)) {
		throw new AppError({
			description: `Got error code ${jumpGateDetails} while finding jump gate`,
			httpCode: 500,			
		});
	}	

	// Return connected systems list from details
	return jumpGateDetails.data.connectedSystems;
}