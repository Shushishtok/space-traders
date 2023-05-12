import { Router } from 'express';
import { register } from '../requests/start-game';

export const defaultRouter = Router();

defaultRouter.get("/", (req, res) => {
	res.send("Testing router");
});

defaultRouter.post("/start-game", async (req, res) => {
	//const { symbol } = req.body;
	res.send(`Requested to start game with symbol: none`);

	// const registerResultData = await register(symbol);
	// res.status(200).send(registerResultData);
});