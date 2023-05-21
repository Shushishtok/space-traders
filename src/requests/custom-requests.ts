import * as Ships from './ships';
import * as Systems from './system';
import * as Contracts from "./contracts";
import { areWaypointsInSameSystem, calculateTimeUntilArrival, getInventoryUnitFromCargo, hasInventoryUnitInCargo, isSameWaypoint, sleep, sortContractDeliveries } from '../utils';
import { AppError, ErrorNames, HttpCode } from '../exceptions/app-error';
import { Logger } from '../logger/logger';
import { AutomatedActions } from '../automation/automated-action';
import { Survey } from '../packages/spacetraders-sdk';

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

export async function startAutomatedExtraction(shipSymbol: string, survey?: Survey) {
	const automatedActionName = `AutomatedExtraction-${shipSymbol}`;
	let shouldRemoveFromAutomation = false; // would not remove from automation until we go into the mining loop.
	try {
		AutomatedActions.startAutomatedAction(automatedActionName);
		Logger.debug(`Started automated mining operation for ship symbol ${shipSymbol}`);
	
		shouldRemoveFromAutomation = true;
		while (AutomatedActions.isAutomationActive(automatedActionName)) {
			// Orbit
			await Ships.orbitShip(shipSymbol);		
	
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

// export async function deliverGoodsToContract(shipSymbol: string, contractId: string) {
// 	let ship = await Ships.getShip(shipSymbol);
// 	const shipWaypoint = ship.data.nav.waypointSymbol;

// 	const contract = await Contracts.getContract(contractId);
// 	const deliveryTerms = contract.data.terms.deliver;
// 	if (!deliveryTerms) {
// 		throw new AppError({
// 			description: `Contract has no delivery terms`,
// 			httpCode: HttpCode.BAD_REQUEST,
// 			name: ErrorNames.LOGICAL_FAILURE,
// 		});
// 	}

// 	// Remove delivery terms that we cannot handle now (missing items in cargo etc)
// 	const validDeliveryTerms = deliveryTerms.filter(deliveryTerm => {
// 		const { tradeSymbol } = deliveryTerm;		
// 		return hasInventoryUnitInCargo(ship, tradeSymbol);
// 	});
	
// 	// Sort deliveries
// 	const sortedDeliveries = sortContractDeliveries(validDeliveryTerms, shipWaypoint);

// 	// Start handling deliveries
// 	for (const deliveryTerm of sortedDeliveries) {
// 		// verify we still have relevant cargo after previous iterations		
// 		const cargoForContract = getInventoryUnitFromCargo(ship, deliveryTerm.tradeSymbol);		
// 		if (!cargoForContract) continue;

// 		if (!areWaypointsInSameSystem(shipWaypoint, deliveryTerm.destinationSymbol)) {
// 			// TODO: add jump gate navigation, handle multi-system deliveries, remove continue
// 			continue;
// 		}

// 		// Check if we need to move to the delivery waypoint in the same system
// 		if (!isSameWaypoint(shipWaypoint, deliveryTerm.destinationSymbol)) {
// 			const navigation = await Ships.navigateShip(shipSymbol, deliveryTerm.destinationSymbol);
// 			const arrivalTime = navigation.data.nav.route.arrival;
// 			await sleep(calculateTimeUntilArrival(arrivalTime));
// 			await Ships.dockShip(shipSymbol);
// 			await Ships.refuelShip(shipSymbol);			
// 		}

// 		// Deliver goods
// 		await Contracts.deliverContract(contractId, shipSymbol, deliveryTerm.tradeSymbol, cargoForContract.units);
// 	}
// }