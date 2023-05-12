import { Router } from 'express';
import { listShips } from '../requests/ships';

export const shipsRouter = Router();

shipsRouter.get("/all", async (req, res) => {
	const { page, limit } = req.body;
	
	const result = await listShips({ page, limit });
	res.status(400).send(result);	
});