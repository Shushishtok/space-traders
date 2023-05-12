import { Router } from 'express';
import { acceptContract, listContracts } from '../requests/contracts';
import { validateMissingParameters, validatePagination } from '../utils';

export const contractRouter = Router();

contractRouter.post("/accept", async (req, res) => {
	const { contractId } = req.body;
	validateMissingParameters({ contractId });

	const result = await acceptContract(contractId);
	res.status(200).send(result);
});

contractRouter.get("/list", async (req, res) => {
	const { page, limit } = req.body;
	validatePagination(page, limit);

	const result = await listContracts(page, limit);
	res.status(200).send(result);
});