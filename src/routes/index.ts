import express from 'express';
import { defaultRouter } from './defaultRoute';
import { systemsRouter } from './systemsRoutes';

export const routes = express.Router();

// Register routes
routes.use(defaultRouter);
routes.use(systemsRouter);