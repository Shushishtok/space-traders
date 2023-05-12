import { AppError, ErrorNames, HttpCode } from "../exceptions/app-error";
import { AgentsApi } from "../packages/spacetraders-sdk";
import { tryApiRequest } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getAgentApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new AgentsApi(configuration, undefined, axiosInstance);
}

export async function myAgent() {
	const agentApi = getAgentApi();

	return await tryApiRequest(async () => {
		const result = await agentApi.getMyAgent();
		return result.data;
	}, "Could not agent details");
}