import { Router } from 'express';
import * as Systems from '../requests/system';
import * as CustomRequests from '../requests/custom-requests';
import { sendResultResponse, validateMissingParameters, validatePagination } from '../utils';
import { SystemRequest, Waypoint, Waypoints } from "../interfaces/systems";
import { ShipSymbols } from '../interfaces/ships';
import { PaginatedRequest } from '../interfaces/pagination';

export const systemsRouter = Router();

systemsRouter.get("/waypoint", async (req, res) => {
	const { systemSymbol, waypointSymbol }: Waypoint = req.body;
	validateMissingParameters({ systemSymbol, waypointSymbol });

	const result = await Systems.getWaypoint(systemSymbol, waypointSymbol);
	sendResultResponse(res, result);
});

systemsRouter.get("/waypoints", async (req, res) => {
	const { systemSymbol, page, limit }: Waypoints = req.body;
	validateMissingParameters({ systemSymbol });
	validatePagination(page, limit);

	const result = await Systems.listWaypointsInSystem(systemSymbol, { page, limit });
	sendResultResponse(res, result);
});

systemsRouter.get("/shipyard", async (req, res) => {
	const { systemSymbol, waypointSymbol }: Waypoint = req.body;
	validateMissingParameters({ systemSymbol, waypointSymbol });	

	const result = await Systems.getShipyard(systemSymbol, waypointSymbol);
	sendResultResponse(res, result);
});

systemsRouter.get("/market", async (req, res) => {
	const { systemSymbol, waypointSymbol }: Waypoint = req.body;
	validateMissingParameters({ systemSymbol, waypointSymbol });	

	const result = await Systems.getMarket(systemSymbol, waypointSymbol);
	sendResultResponse(res, result);
});

systemsRouter.get("/market/ship", async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });		

	const result = await CustomRequests.getMarketAtShipsLocation(shipSymbols);
	sendResultResponse(res, result);
});

systemsRouter.get('/', async (req, res) => {
	const { page, limit }: PaginatedRequest = req.body;
	validatePagination(page, limit);	

	const result = await Systems.listSystems({ page, limit });
	sendResultResponse(res, result);
});

systemsRouter.get('/cache/all', async (req, res) => {
	const result = await CustomRequests.cacheAllSystems();
	sendResultResponse(res, result);
});

systemsRouter.get('/cache/waypoints/all', async (req, res) => {
	const result = await CustomRequests.cacheAllWaypoints();
	sendResultResponse(res, result);
});

systemsRouter.get('/waypoints/with/markets', async (req, res) => {
	const result = await CustomRequests.findAllWaypointsWithMarkets();
	sendResultResponse(res, result);
});

systemsRouter.get('/nearby/jumpgates', async (req, res) => {
	const { systemSymbol }: SystemRequest = req.body;
	validateMissingParameters({ systemSymbol });

	const result = await CustomRequests.findNearbySystemsWithJumpGates(systemSymbol);
	sendResultResponse(res, result);
});