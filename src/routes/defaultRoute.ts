import { Router } from 'express';
import { register } from '../requests/general';
import { calculateTimeUntilArrival, sendSuccessResultResponse } from '../utils';

export const defaultRouter = Router();

defaultRouter.get("/", (req, res) => {
	res.status(200).send("Testing router");
});

defaultRouter.post("/start-game", async (req, res) => {	
	const { symbol }: { symbol: string } = req.body;
	const result = await register(symbol);
	sendSuccessResultResponse(res, result);
});