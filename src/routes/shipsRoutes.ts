import { Router } from 'express';
import * as Ships from '../requests/ships';
import * as CustomRequests from '../requests/custom-requests';
import { sendSuccessResultResponse, validateMissingParameters } from '../utils';
import { PaginatedRequest } from "../interfaces/pagination";
import { ExtractIntoShip, NavigateShip, PurchaseShip, ShipCargoTransaction, ShipExtractionAutomation, ShipFullCargoPurchase, ShipSymbol } from '../interfaces/ships';
import { HttpCode } from '../exceptions/app-error';

export const shipsRouter = Router();

shipsRouter.get("/", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	
	const result = await Ships.getShip(shipSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.get("/all", async (req, res) => {
	const { page, limit }: PaginatedRequest = req.body;
	
	const result = await Ships.listShips({ page, limit });
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/purchase/ship", async (req, res) => {
	const { shipType, waypointSymbol }: PurchaseShip = req.body;
	validateMissingParameters({ shipType, waypointSymbol });

	const result = await Ships.purchaseShip(shipType, waypointSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/navigate", async (req, res) => {
	const { shipSymbol, waypointSymbol }: NavigateShip = req.body;
	validateMissingParameters({ shipSymbol, waypointSymbol });

	const result = await Ships.navigateShip(shipSymbol, waypointSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/dock", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.dockShip(shipSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/refuel", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.refuelShip(shipSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/orbit", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.orbitShip(shipSymbol);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/extract", async (req, res) => {
	const { shipSymbol, survey }: ExtractIntoShip = req.body;
	validateMissingParameters({ shipSymbol });

	// Optional object, but must include all objects inside if provided
	if (survey) {
		const { deposits, expiration, signature, size, symbol } = survey;
		validateMissingParameters({ deposits, expiration, signature, size, symbol });
	}

	const result = await Ships.extractResources(shipSymbol, survey);
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/sell", async (req, res) => {
	const { shipSymbol, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol, unitCount });

	const result = await Ships.sellCargo(shipSymbol, { symbol: unitSymbol, units: unitCount });
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo", async (req, res) => {
	const { shipSymbol, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol, unitCount });

	const result = await Ships.purchaseCargo(shipSymbol, { symbol: unitSymbol, units: unitCount });
	sendSuccessResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo/full", async (req, res) => {
	const { shipSymbol, unitSymbol }: ShipFullCargoPurchase = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol });

	await CustomRequests.purchaseFullCargo(shipSymbol, unitSymbol);
	sendSuccessResultResponse(res);
});

shipsRouter.post('/automate/extraction', async (req, res) => {
	const { shipSymbol, stop }: ShipExtractionAutomation = req.body;
	validateMissingParameters({ shipSymbol });

	if (stop) {
		await CustomRequests.stopAutomatedExtraction(shipSymbol);
		sendSuccessResultResponse(res);
	} else {
		CustomRequests.startAutomatedExtraction(shipSymbol);
		sendSuccessResultResponse(res);
	}
});

shipsRouter.post('/survey', async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.createSurvey(shipSymbol);
	sendSuccessResultResponse(res, result);
});