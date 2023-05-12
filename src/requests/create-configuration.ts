import { Configuration, ConfigurationParameters } from "../../packages/spacetraders-sdk";

export function createConfiguration(includeAccessToken = true) {
	const configurationOptions: ConfigurationParameters = {
		basePath: process.env.BASE_PATH,
	};

	if (includeAccessToken) {
		configurationOptions.accessToken = process.env.ACCESS_TOKEN;
	}

	return new Configuration(configurationOptions);
}