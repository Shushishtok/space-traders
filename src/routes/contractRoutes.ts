import { Router } from 'express';
import * as Contracts from '../requests/contracts';
import * as CustomRequests from "../requests/custom-requests";
import { sendSuccessResultResponse, validateMissingParameters } from '../utils';
import { PaginatedRequest } from '../interfaces/pagination';
import { ContractID, DeliverAllContracts, DeliverContact } from '../interfaces/contracts';

export const contractRouter = Router();

contractRouter.post("/accept", async (req, res) => {
	const { contractId }: ContractID = req.body;
	validateMissingParameters({ contractId });

	const result = await Contracts.acceptContract(contractId);
	sendSuccessResultResponse(res, result);
});

contractRouter.get("/list", async (req, res) => {
	const { page, limit }: PaginatedRequest = req.body;	

	const result = await Contracts.listContracts(page, limit);
	sendSuccessResultResponse(res, result);
});

contractRouter.get("/", async (req, res) => {
	const { contractId }: ContractID = req.body;
	validateMissingParameters({ contractId });

	const result = await Contracts.getContract(contractId);
	sendSuccessResultResponse(res, result);
});

contractRouter.post("/deliver", async (req, res) => {
	const { contractId, shipSymbol, tradeSymbol, units }: DeliverContact = req.body;
	validateMissingParameters({ contractId, shipSymbol, tradeSymbol, units });

	const result = await Contracts.deliverContract(contractId, shipSymbol, tradeSymbol, units);
	sendSuccessResultResponse(res, result);
});

// contractRouter.post("/allDeliveryTerms", async (req, res) => {
// 	const { shipSymbol, contractId }: DeliverAllContracts = req.body;
// 	validateMissingParameters({ shipSymbol, contractId });

// 	CustomRequests.deliverGoodsToContract(shipSymbol, contractId);
// 	res.status(200).send("Started delivery process, check logs for details");
// });