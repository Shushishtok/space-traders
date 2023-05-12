import { DefaultApi } from '../../packages/spacetraders-sdk';
import { createAxiosInstance } from './create-axios-instance';
import { createConfiguration } from './create-configuration';

async function register() {
	const configuration = createConfiguration(false);
	const axiosInstance = createAxiosInstance();

	const defaultApi = new DefaultApi(configuration, undefined, axiosInstance);

	const result = await defaultApi.register({
		faction: "COSMIC",
		symbol: "ShushLovesLisa"
	});

	console.log(JSON.stringify(result.data.data, undefined, 4));
}

register();