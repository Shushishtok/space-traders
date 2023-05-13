import * as Ships from './ships';
import * as Systems from './system';
import * as Contracts from "./contracts";
import { areWaypointsInSameSystem, calculateTimeUntilArrival, getInventoryUnitFromCargo, hasInventoryUnitInCargo, isSameWaypoint, sleep, sortContractDeliveries } from '../utils';
import { AppError, ErrorNames, HttpCode } from '../exceptions/app-error';

export async function getMarketAtShipsLocation(shipSymbol: string) {
	const ship = await Ships.getShip(shipSymbol);
	const { systemSymbol, waypointSymbol } = ship.data.nav;

	const marketAtShipLocation = await Systems.getMarket(systemSymbol, waypointSymbol);
	return marketAtShipLocation.data;
}

export async function purchaseFullCargo(shipSymbol: string, unitSymbol: string) {
	const ship = await Ships.getShip(shipSymbol);
	const { capacity, units } = ship.data.cargo;
	const remainingCapacity = capacity - units;
	
	if (remainingCapacity > 0) {
		await Ships.purchaseCargo(shipSymbol, { symbol: unitSymbol, units: remainingCapacity });		
	}
}

export async function deliverGoodsToContract(shipSymbol: string, contractId: string) {
	let ship = await Ships.getShip(shipSymbol);
	const shipWaypoint = ship.data.nav.waypointSymbol;

	const contract = await Contracts.getContract(contractId);
	const deliveryTerms = contract.data.terms.deliver;
	if (!deliveryTerms) {
		throw new AppError({
			description: `Contract has no delivery terms`,
			httpCode: HttpCode.BAD_REQUEST,
			name: ErrorNames.LOGICAL_FAILURE,
		});
	}

	// Remove delivery terms that we cannot handle now (missing items in cargo etc)
	const validDeliveryTerms = deliveryTerms.filter(deliveryTerm => {
		const { tradeSymbol } = deliveryTerm;		
		return hasInventoryUnitInCargo(ship, tradeSymbol);
	});
	
	// Sort deliveries
	const sortedDeliveries = sortContractDeliveries(validDeliveryTerms, shipWaypoint);

	// Start handling deliveries
	for (const deliveryTerm of sortedDeliveries) {
		// verify we still have relevant cargo after previous iterations		
		const cargoForContract = getInventoryUnitFromCargo(ship, deliveryTerm.tradeSymbol);		
		if (!cargoForContract) continue;

		if (!areWaypointsInSameSystem(shipWaypoint, deliveryTerm.destinationSymbol)) {
			// TODO: add jump gate navigation, handle multi-system deliveries, remove continue
			continue;
		}

		// Check if we need to move to the delivery waypoint in the same system
		if (!isSameWaypoint(shipWaypoint, deliveryTerm.destinationSymbol)) {
			const navigation = await Ships.navigateShip(shipSymbol, deliveryTerm.destinationSymbol);
			const arrivalTime = navigation.data.nav.route.arrival;
			await sleep(calculateTimeUntilArrival(arrivalTime));
			await Ships.dockShip(shipSymbol);
			await Ships.refuelShip(shipSymbol);			
		}

		// Deliver goods
		await Contracts.deliverContract(contractId, shipSymbol, deliveryTerm.tradeSymbol, cargoForContract.units);
	}
}