import { Router } from 'express';
import * as Ships from '../requests/ships';
import * as CustomRequests from '../requests/custom-requests';
import { sendResultResponse, validateMissingParameters } from '../utils';
import { PaginatedRequest } from "../interfaces/pagination";
import { ExtractIntoShip, NavigateShip, PurchaseShip, ShipCargoTransaction, ShipExtractionAutomation, ShipExtractionAutomationAll, ShipFullCargoPurchase, ShipSymbol } from '../interfaces/ships';
import { ShipModel } from '../sequelize/models';
import moment from 'moment';

export const shipsRouter = Router();

shipsRouter.get("/", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	
	const result = await Ships.getShip(shipSymbol);
	sendResultResponse(res, result);
});

shipsRouter.get("/all", async (req, res) => {
	const { page, limit }: PaginatedRequest = req.body;
	
	const result = await Ships.listShips({ page, limit });
	sendResultResponse(res, result);
});

shipsRouter.post("/purchase/ship", async (req, res) => {
	const { shipType, waypointSymbol }: PurchaseShip = req.body;
	validateMissingParameters({ shipType, waypointSymbol });

	const result = await Ships.purchaseShip(shipType, waypointSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/navigate", async (req, res) => {
	const { shipSymbol, waypointSymbol }: NavigateShip = req.body;
	validateMissingParameters({ shipSymbol, waypointSymbol });

	const result = await Ships.navigateShip(shipSymbol, waypointSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/dock", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.dockShip(shipSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/refuel", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.refuelShip(shipSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/orbit", async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.orbitShip(shipSymbol);
	sendResultResponse(res, result);
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
	sendResultResponse(res, result);
});

shipsRouter.post("/sell", async (req, res) => {
	const { shipSymbol, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol, unitCount });

	const result = await Ships.sellCargo(shipSymbol, { symbol: unitSymbol, units: unitCount });
	sendResultResponse(res, result);
});

shipsRouter.post('/sell/all', async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await CustomRequests.sellAllCargo(shipSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo", async (req, res) => {
	const { shipSymbol, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol, unitCount });

	const result = await Ships.purchaseCargo(shipSymbol, { symbol: unitSymbol, units: unitCount });
	sendResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo/full", async (req, res) => {
	const { shipSymbol, unitSymbol }: ShipFullCargoPurchase = req.body;
	validateMissingParameters({ shipSymbol, unitSymbol });

	const result = await CustomRequests.purchaseFullCargo(shipSymbol, unitSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post('/automate/extraction', async (req, res) => {
	const { shipSymbol, stop }: ShipExtractionAutomation = req.body;
	validateMissingParameters({ shipSymbol });

	if (stop) {
		CustomRequests.stopAutomatedExtraction(shipSymbol);		
	} else {
		CustomRequests.startAutomatedExtraction(shipSymbol);
	}
	sendResultResponse(res);
});

shipsRouter.post('/automate/extraction/all', async (req, res) => {
	const { stop }: ShipExtractionAutomationAll = req.body;
	
	const ships = await ShipModel.findAll();
	for (const ship of ships) {
		if (stop) {
			CustomRequests.stopAutomatedExtraction(ship.symbol);
		} else {
			CustomRequests.startAutomatedExtraction(ship.symbol);			
		}
	}

	sendResultResponse(res);
});

shipsRouter.post('/survey', async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.createSurvey(shipSymbol);
	sendResultResponse(res, result);
});

shipsRouter.get('/testBurst', async (req, res) => {
	const { requests } = req.body;
	const startTime = moment();
	for (let index = 0; index < requests; index++) {
		await Ships.orbitShip("SHUSHLOVELISA-1");
	}
	const diff = moment().diff(startTime);
	const duration = moment.duration(diff);
	res.status(200).send({duration: duration.asSeconds()});
});