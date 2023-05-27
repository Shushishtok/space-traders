import pg from 'pg';
import { Sequelize } from 'sequelize-typescript';
import * as models from "./models";

const connection = new Sequelize({
	dialect: 'postgres',
	host: 'localhost',
	username: 'postgres',
	password: 'zubur1',
	database: 'postgres',
	logging: false,
	models: [...Object.values(models)],
	dialectModule: pg,
});

export default connection;