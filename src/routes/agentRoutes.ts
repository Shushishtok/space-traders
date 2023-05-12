import { Router } from 'express';
import { myAgent } from '../requests/agent';

export const agentRouter = Router();

agentRouter.get("/", async (req, res) => {	
	const results = await myAgent();	
	res.status(200).send(results);	
});