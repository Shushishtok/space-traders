import { Logger } from '../logger/logger';
import { DefaultApi, RegisterRequestFactionEnum } from '../packages/spacetraders-sdk';
import { tryApiRequest } from '../utils';
import { createAxiosInstance } from './create-axios-instance';
import { createConfiguration } from './create-configuration';

export async function register(symbol: string, faction: RegisterRequestFactionEnum) {
	const configuration = createConfiguration(false);
	const axiosInstance = createAxiosInstance();

	const defaultApi = new DefaultApi(configuration, undefined, axiosInstance);

	return await tryApiRequest(async () => {
		const result = await defaultApi.register({
			faction,
			symbol,
		});
		Logger.info(`Registered successfully with agent callsign ${symbol}. The agent belongs to the ${faction} faction!`);
		return result.data;
	}, "Could not register new agent");
}