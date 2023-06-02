import { Logger } from "../logger/logger";
import { AgentsApi } from "../packages/spacetraders-sdk";
import { AgentModel } from "../sequelize/models";
import { isErrorCodeData, tryApiRequest } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getAgentApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new AgentsApi(configuration, undefined, axiosInstance);
}

export async function myAgent() {
	const agentApi = getAgentApi();

	const data = await tryApiRequest(async () => {
		const result = await agentApi.getMyAgent();
		const { data } = result;
		return data;
	}, "Could not agent details");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Got agent data: ${JSON.stringify(data, undefined, 4)}`);
	await AgentModel.upsert({ ...data.data, token: process.env.ACCESS_TOKEN });

	return data;
}