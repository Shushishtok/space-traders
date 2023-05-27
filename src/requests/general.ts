import { Logger } from '../logger/logger';
import { DefaultApi, RegisterRequestFactionEnum } from '../packages/spacetraders-sdk';
import { AgentModel, ContractModel, ShipModel } from '../sequelize/models';
import { tryApiRequest } from '../utils';
import { createAxiosInstance } from './create-axios-instance';
import { createConfiguration } from './create-configuration';

export async function register(symbol: string, faction: RegisterRequestFactionEnum) {
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

	Logger.info(`Registered successfully with agent callsign ${symbol}. The agent belongs to the ${faction} faction!`);
	const agentCreatePromise = AgentModel.create({ ...data.data.agent, token: data.data.token });	
	const contractCreatePromise = ContractModel.create({ ...data.data.contract });
	const shipCreatePromise = ShipModel.create({ ...data.data.ship });
	await Promise.allSettled([agentCreatePromise, contractCreatePromise, shipCreatePromise]);
	
	return data;
}