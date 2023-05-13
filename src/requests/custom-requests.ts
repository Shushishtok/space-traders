import * as Ships from './ships';
import * as Systems from './system';

export async function getMarketAtShipsLocation(shipSymbol: string) {
	const ship = await Ships.getShip(shipSymbol);
	const { systemSymbol, waypointSymbol } = ship.data.nav;

	const marketAtShipLocation = await Systems.getMarket(systemSymbol, waypointSymbol);
	return marketAtShipLocation.data;
}