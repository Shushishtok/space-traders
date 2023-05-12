import { Router } from 'express';
import { getWaypoint } from '../requests/system';
import { validateMissingParameters } from '../utils';

export const systemsRouter = Router();

systemsRouter.get("/waypoint", async (req, res) => {
	const { systemSymbol, waypointSymbol } = req.body;
	validateMissingParameters({ systemSymbol, waypointSymbol });

	const result = await getWaypoint(systemSymbol, waypointSymbol);
	res.status(200).send(result);
});