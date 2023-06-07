import { Router } from 'express';
import * as Ships from '../requests/ships';
import * as CustomRequests from '../requests/custom-requests';
import { sendResultResponse, shipHasRole, validateEnum, validateMissingParameters } from '../utils';
import { PaginatedRequest } from "../interfaces/pagination";
import { AssignShipRoles, ExtractIntoShip, InstallMountRequestBody, JumpShipRequestBody, NavigateShipsRequest, PurchaseShip, SetFlightModeRequestBody, ShipCargoTransaction, ShipExtractionAutomation, ShipExtractionAutomationAll, ShipFullCargoPurchase, ShipSymbol, ShipSymbols } from '../interfaces/ships';
import { ShipModel } from '../sequelize/models';
import moment from 'moment';
import { ShipActionRole } from '../consts/ships';

export const shipsRouter = Router();

shipsRouter.get("/", async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	
	const result = await Ships.getShips(shipSymbols);
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
	const { shipSymbols, waypointSymbol }: NavigateShipsRequest = req.body;
	validateMissingParameters({ shipSymbols, waypointSymbol });

	const result = await Ships.navigateShips(shipSymbols, waypointSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post("/dock", async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });

	const result = await Ships.dockShips(shipSymbols);
	sendResultResponse(res, result);
});

shipsRouter.post("/refuel", async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });

	const result = await Ships.refuelShips(shipSymbols);
	sendResultResponse(res, result);
});

shipsRouter.post("/orbit", async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });

	const result = await Ships.orbitShips(shipSymbols);
	sendResultResponse(res, result);
});

shipsRouter.post("/extract", async (req, res) => {
	const { shipSymbols, survey }: ExtractIntoShip = req.body;
	validateMissingParameters({ shipSymbols });

	// Optional object, but must include all objects inside if provided
	if (survey) {
		const { deposits, expiration, signature, size, symbol } = survey;
		validateMissingParameters({ deposits, expiration, signature, size, symbol });
	}

	const result = await Ships.extractResources(shipSymbols, survey);
	sendResultResponse(res, result);
});

shipsRouter.post("/sell", async (req, res) => {
	const { shipSymbols, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbols, unitSymbol, unitCount });

	const result = await Ships.sellCargo(shipSymbols, { symbol: unitSymbol, units: unitCount });
	sendResultResponse(res, result);
});

shipsRouter.post('/sell/all', async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });

	const result = await CustomRequests.sellAllCargo(shipSymbols);
	sendResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo", async (req, res) => {
	const { shipSymbols, unitSymbol, unitCount }: ShipCargoTransaction = req.body;
	validateMissingParameters({ shipSymbol: shipSymbols, unitSymbol, unitCount });

	const result = await Ships.purchaseCargo(shipSymbols, { symbol: unitSymbol, units: unitCount });
	sendResultResponse(res, result);
});

shipsRouter.post("/purchase/cargo/full", async (req, res) => {
	const { shipSymbols, unitSymbol }: ShipFullCargoPurchase = req.body;
	validateMissingParameters({ shipSymbol: shipSymbols, unitSymbol });

	const result = await CustomRequests.purchaseFullCargo(shipSymbols, unitSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post('/automate/extraction', async (req, res) => {
	const { shipSymbols, stop }: ShipExtractionAutomation = req.body;
	validateMissingParameters({ shipSymbols });

	for (const shipSymbol of shipSymbols) {
		const ship = await ShipModel.getShip(shipSymbol);
	
		if (stop) {
			CustomRequests.stopAutomatedExtraction(ship);		
		} else {
			CustomRequests.startAutomatedExtraction(ship);
		}
	}

	sendResultResponse(res);
});

shipsRouter.post('/automate/extraction/all', async (req, res) => {
	const { stop }: ShipExtractionAutomationAll = req.body;
	
	const ships = await ShipModel.findAll();
	const extractorShips = ships.filter(ship => shipHasRole(ship, ShipActionRole.EXTRACTOR) || shipHasRole(ship, ShipActionRole.SURVEYOR));
	for (const ship of extractorShips) {
		if (stop) {
			CustomRequests.stopAutomatedExtraction(ship);
		} else {
			CustomRequests.startAutomatedExtraction(ship);			
		}
	}

	sendResultResponse(res);
});

shipsRouter.post('/survey', async (req, res) => {
	const { shipSymbols }: ShipSymbols = req.body;
	validateMissingParameters({ shipSymbols });

	const result = await Ships.createSurvey(shipSymbols);
	sendResultResponse(res, result);
});

shipsRouter.get('/testBurst', async (req, res) => {
	const { requests } = req.body;
	const startTime = moment();
	for (let index = 0; index < requests; index++) {
		await Ships.orbitShips(["SHUSHLOVELISA-1"]);
	}
	const diff = moment().diff(startTime);
	const duration = moment.duration(diff);
	res.status(200).send({ duration: duration.asSeconds() });
});

shipsRouter.post('/warp', async (req, res) => {
	const { shipSymbols, waypointSymbol }: NavigateShipsRequest = req.body; 
	validateMissingParameters({ shipSymbols, waypointSymbol });
	
	const result = await Ships.warpShips(shipSymbols, waypointSymbol);
	sendResultResponse(res, result);
});

shipsRouter.post('/jump', async (req, res) => {
	const { shipSymbols, systemSymbol }: JumpShipRequestBody = req.body;
	validateMissingParameters({ shipSymbols, systemSymbol });

	const result = await Ships.jumpShips(shipSymbols, systemSymbol);
	sendResultResponse(res, result);
});

shipsRouter.put('/flight-mode', async (req, res) => {
	const { shipSymbols, flightMode }: SetFlightModeRequestBody = req.body;
	validateMissingParameters({ shipSymbols, flightMode });

	const result = await Ships.setFlightMode(shipSymbols, flightMode);
	sendResultResponse(res, result);
});

shipsRouter.post('/install/mount', async (req, res) => {
	const { shipSymbols, mountSymbol }: InstallMountRequestBody = req.body;
	validateMissingParameters({ shipSymbols, mountSymbol });

	const result = await Ships.installMount(shipSymbols, mountSymbol);
	sendResultResponse(res, result);
});

shipsRouter.put('/roles', async (req, res) => {
	const { shipSymbols, addRoles = [], removeRoles = [] }: AssignShipRoles = req.body;
	validateMissingParameters({ shipSymbols });	
	for (const role of [...addRoles, ...removeRoles]) {
		validateEnum(role, ShipActionRole);
	}

	const result = await Ships.updateRoles(shipSymbols, addRoles, removeRoles);
	sendResultResponse(res, result);
});

shipsRouter.post('/chart', async (req, res) => {
	const { shipSymbol }: ShipSymbol = req.body;
	validateMissingParameters({ shipSymbol });

	const result = await Ships.createChart(shipSymbol);
	sendResultResponse(res, result);
});