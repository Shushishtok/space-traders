import { Logger } from '../logger/logger';
import { DefaultApi } from '../packages/spacetraders-sdk';
import { AgentModel, ContractModel, ExtractionModel, MarketModel, ShipModel, SurveyModel, SystemModel, TransactionModel, WaypointModel } from '../sequelize/models';
import { isErrorCodeData, tryApiRequest } from '../utils';
import { createAxiosInstance } from './create-axios-instance';
import { createConfiguration } from './create-configuration';

export async function register(symbol: string, faction: string) {
	const configuration = createConfiguration(false);
	const axiosInstance = createAxiosInstance();

	const defaultApi = new DefaultApi(configuration, undefined, axiosInstance);

	const data = await tryApiRequest(async () => {
		const result = await defaultApi.register({
			faction,
			symbol,
		});		
		return result.data;
	}, "Could not register new agent");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Registered successfully with agent callsign ${symbol}. The agent belongs to the ${faction} faction!`);
	const agentCreatePromise = AgentModel.create({ ...data.data.agent, token: data.data.token });	
	const contractCreatePromise = ContractModel.create({ ...data.data.contract });
	const shipCreatePromise = ShipModel.create({ ...data.data.ship });
	await Promise.all([agentCreatePromise, contractCreatePromise, shipCreatePromise]);

	// Update the active token
	process.env["ACCESS_TOKEN"] = data.data.token;
	
	return data;
}

export async function wipeDB() {
	await AgentModel.sync({ force: true });
	await ContractModel.sync({ force: true });
	await ExtractionModel.sync({ force: true });
	await MarketModel.sync({ force: true });
	await ShipModel.sync({ force: true });	
	await SurveyModel.sync({ force: true });
	await SystemModel.sync({ force: true });
	await TransactionModel.sync({ force: true });
	await WaypointModel.sync({ force: true });
}