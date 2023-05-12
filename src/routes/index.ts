import express from 'express';
import { defaultRouter } from './defaultRoute';
import { systemsRouter } from './systemsRoutes';
import { agentRouter } from './agentRoutes';
import { shipsRouter } from './shipsRoutes';
import { contractRouter } from './contractRoutes';

export const agentRoutes = express.Router().use(agentRouter);
export const defaultRoutes = express.Router().use(defaultRouter);
export const systemRoutes = express.Router().use(systemsRouter);
export const shipsRoutes = express.Router().use(shipsRouter);
export const contractRoutes = express.Router().use(contractRouter);