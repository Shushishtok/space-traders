import * as Ships from './ships';
import * as Systems from './system';
import { Logger } from '../logger/logger';
import { AutomatedActions } from '../automation/automated-action';
import { Ship, Survey } from '../packages/spacetraders-sdk';
import { canShipSurvey, sleep } from '../utils';
import { ShipModel, SurveyModel } from '../sequelize/models';

export async function getMarketAtShipsLocation(shipSymbol: string) {
	const ship = await Ships.getShip(shipSymbol);
	const { systemSymbol, waypointSymbol } = ship.data.nav;
	Logger.info(`Getting market at ship symbol ${shipSymbol} waypoint ${waypointSymbol}.`);

	const marketAtShipLocation = await Systems.getMarket(systemSymbol, waypointSymbol);
	return marketAtShipLocation.data;
}

export async function purchaseFullCargo(shipSymbol: string, tradeSymbol: string) {
	const ship = await Ships.getShip(shipSymbol);
	const { capacity, units } = ship.data.cargo;
	const remainingCapacity = capacity - units;
	Logger.info(`Ship's cargo is ${units}/${capacity}, with additional space for ${remainingCapacity} units of ${tradeSymbol}.`);
	
	if (remainingCapacity > 0) {
		await Ships.purchaseCargo(shipSymbol, { symbol: tradeSymbol, units: remainingCapacity });
	} else {
		Logger.error(`Ship had no space in its cargo to purchase additional units of ${tradeSymbol}.`);
	}
}

export async function startAutomatedExtraction(shipSymbol: string) {
	const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
	let shouldRemoveFromAutomation = false; // would not remove from automation until we go into the mining loop.
	try {
		AutomatedActions.startAutomatedAction(automatedActionName);
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
				survey = surveyData.data.surveys[0];
				const cooldown = surveyData.data.cooldown.totalSeconds;

				Logger.info(`Ship symbol ${shipSymbol} surveyed during mining loop and will goes into cooldown.`);

				await sleep(cooldown);
				continue;
			}
				
			// Extract (fetch cooldown and mined units)
			const extract = await Ships.extractResources(shipSymbol, survey);
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

export async function stopAutomatedExtraction(shipSymbol: string) {
	try {
		const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
		AutomatedActions.stopAutomatedAction(automatedActionName);
	} catch (err) {
		Logger.error(`An error occurred while stopping automated extraction for ship ${shipSymbol}.`);
	}
}