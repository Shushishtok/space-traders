import { Router } from 'express';
import { register } from '../requests/general';
import { sendSuccessResultResponse } from '../utils';
import { RegisterRequestFactionEnum } from '../packages/spacetraders-sdk';

export const defaultRouter = Router();

defaultRouter.get("/", (req, res) => {
	res.status(200).send("Testing router");
});

defaultRouter.post("/start-game", async (req, res) => {	
	const { symbol, faction }: { symbol: string, faction: RegisterRequestFactionEnum } = req.body;
	const result = await register(symbol, faction);
	sendSuccessResultResponse(res, result);
});