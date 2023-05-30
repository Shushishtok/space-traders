import { Router } from 'express';
import * as Systems from '../requests/system';
import * as CustomRequests from '../requests/custom-requests';
import { sendResultResponse, validateMissingParameters, validatePagination } from '../utils';
import { Waypoint, Waypoints } from "../interfaces/systems";
import { ShipSymbol } from '../interfaces/ships';
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

	const result = await Systems.getSystemsWaypoints(systemSymbol, page, limit);
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
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });	

	const result = await CustomRequests.getMarketAtShipsLocation(shipSymbol);
	sendResultResponse(res, result);
});

systemsRouter.get('/', async (req, res) => {
	const { page, limit }: PaginatedRequest = req.body;
	validatePagination(page, limit);	

	const result = await Systems.getSystems(page, limit);
	sendResultResponse(res, result);
});