import * as Ships from './ships';
import * as Systems from './system';
import { Logger } from '../logger/logger';
import { AutomatedActions } from '../automation/automated-action';
import { Ship, ShipNavStatus, Survey } from '../packages/spacetraders-sdk';
import { canShipSurvey, isErrorCodeData, sleep } from '../utils';
import { MarketModel, ShipModel, SurveyModel } from '../sequelize/models';
import { PaginatedRequest } from '../interfaces/pagination';

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
	} else {
		Logger.error(`Ship had no space in its cargo to purchase additional units of ${tradeSymbol}.`);
		return null;
	}
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

export async function startAutomatedExtraction(shipSymbol: string) {
	const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
	let shouldRemoveFromAutomation = false; // would not remove from automation until we go into the mining loop.
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

export function stopAutomatedExtraction(shipSymbol: string) {
	try {
		const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
		AutomatedActions.stopAutomatedAction(automatedActionName);
	} catch (err) {
		Logger.error(`An error occurred while stopping automated extraction for ship ${shipSymbol}.`);
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
		if (isErrorCodeData(result)) { // shouldn't occur, but just in case
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

	//const ships = await paginateResults(Ships.listShips);
	Logger.info(`Got a total of ${ships.length} ships.`);
	return ships;
}

export async function cacheAllSystems() {
	const cachedSystems = [];
	const pagination: PaginatedRequest = { limit: 20, page: 1 };
	let paginationFinished = false;	
	while (!paginationFinished) {		
		const result = await Systems.listSystems(pagination);
		if (isErrorCodeData(result)) { // shouldn't occur, but just in case
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