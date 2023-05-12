import { Router } from 'express';
import { register } from '../requests/general';

export const defaultRouter = Router();

defaultRouter.get("/", (req, res) => {
	res.send("Testing router");
});

defaultRouter.post("/start-game", async (req, res) => {	
	const { symbol } = req.body;		
	const registerResultData = await register(symbol);
	res.status(200).send(registerResultData);
});