import { PaginatedRequest } from "../interfaces/pagination";
import { FleetApi } from "../packages/spacetraders-sdk";
import { tryApiRequest, validatePagination } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getFleetApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new FleetApi(configuration, undefined, axiosInstance);
}

export async function listShips(pagination: PaginatedRequest) {	
	const { page, limit } = pagination;
	validatePagination(page, limit);
	
	const shipsApi = getFleetApi();

	return await tryApiRequest(async () => {
		const result = await shipsApi.getMyShips(page, limit);
		return result.data;
	}, "Could not list ships");
}