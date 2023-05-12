import { ContractsApi } from "../packages/spacetraders-sdk";
import { tryApiRequest } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getContractsApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new ContractsApi(configuration, undefined, axiosInstance);
}

export async function acceptContract(contractId: string) {
	const contractsApi = getContractsApi();
	
	return await tryApiRequest(async () => {
		const result = await contractsApi.acceptContract(contractId);
		return result.data;
	}, "Could not accept contract");
}

export async function listContracts(page: number, limit: number) {
	const contractsApi = getContractsApi();
	
	return await tryApiRequest(async () => {
		const result = await contractsApi.getContracts(page, limit);
		return result.data;
	}, "Could not list contracts");
}