import { DefaultApi } from '../packages/spacetraders-sdk';
import { tryApiRequest } from '../utils';
import { createAxiosInstance } from './create-axios-instance';
import { createConfiguration } from './create-configuration';

export async function register(symbol: string) {
	const configuration = createConfiguration(false);
	const axiosInstance = createAxiosInstance();

	const defaultApi = new DefaultApi(configuration, undefined, axiosInstance);

	return await tryApiRequest(async () => {
		const result = await defaultApi.register({
			faction: "COSMIC",
			symbol,
		});
		return result.data;	
	}, "Could not register new agent");
}