import express, { Request, Response } from 'express';
import 'express-async-errors';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { agentRoutes, contractRoutes, defaultRoutes, shipsRoutes, systemRoutes } from './routes';
import dotenv from 'dotenv';
import { ErrorHandler } from './exceptions/error-handler';
import connection from './sequelize/connection';

async function bootstrap() {
	dotenv.config();

	process.on('unhandledRejection', (reason: Error) => {
		console.log(`Unhandled Rejection: ${reason?.message ?? reason}`);
		throw new Error(reason?.message ?? reason);
	});

	process.on('uncaughtException', (error: Error) => {
		console.log(`Uncaught Exception: ${error.message}`);  
		ErrorHandler.handleError(error);
	});

	const app = express();
	const port = 3000;

	// Middlewares
	app.use(bodyParser.json());

	// Routes
	app.use('/', defaultRoutes);
	app.use('/agent', agentRoutes);
	app.use('/systems', systemRoutes);
	app.use('/ships', shipsRoutes);
	app.use('/contracts', contractRoutes);

	// Error handler: must be last!
	app.use((error: Error, req: Request, res: Response) => {
		ErrorHandler.handleError(error, res);
	});

	await connection.sync({ alter: true });

	app.listen(port, () => {
		console.log(`Server is running in port: ${port}`);
	});
}

bootstrap();