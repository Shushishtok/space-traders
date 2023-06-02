import { Router } from 'express';
import * as General from '../requests/general';
import { sendResultResponse, validateMissingParameters } from '../utils';
import { RegisterBody } from '../interfaces/general';

export const defaultRouter = Router();

defaultRouter.get("/", (req, res) => {
	res.status(200).send("Testing router");
});

defaultRouter.post("/start-game", async (req, res) => {	
	const { symbol, faction, wipeDatabase = false }: RegisterBody = req.body;
	validateMissingParameters({ symbol, faction });

	if (wipeDatabase === true) {
		General.wipeDB();
	}

	const result = await General.register(symbol, faction);
	sendResultResponse(res, result);
});

defaultRouter.post('/wipe-database', async (req, res) => {
	const result = await General.wipeDB();
	sendResultResponse(res, result);
});