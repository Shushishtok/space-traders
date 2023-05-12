import { SystemsApi } from "../packages/spacetraders-sdk";
import { tryApiRequest } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getSystemApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new SystemsApi(configuration, undefined, axiosInstance);
}

export async function getWaypoint(systemSymbol: string, waypointSymbol: string) {
	const systemsApi = getSystemApi();

	return await tryApiRequest(async () => {
		const result = await systemsApi.getWaypoint(systemSymbol, waypointSymbol);
		return result.data;
	}, "Could not get waypoint");	
}