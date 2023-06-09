import { DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_PAGE } from "../consts/general";
import { AppError, ErrorNames } from "../exceptions/app-error";
import { PaginatedRequest } from "../interfaces/pagination";
import { Logger } from "../logger/logger";
import { ContractsApi } from "../../packages/spacetraders-sdk";
import { ContractModel, ShipModel } from "../sequelize/models";
import { isErrorCodeData, tryApiRequest, validatePagination } from "../utils";
import { createAxiosInstance } from "./create-axios-instance";
import { createConfiguration } from "./create-configuration";

function getContractsApi() {
	const configuration = createConfiguration();
	const axiosInstance = createAxiosInstance();
	
	return new ContractsApi(configuration, undefined, axiosInstance);
}

export async function acceptContract(contractId: string) {
	const contractsApi = getContractsApi();
	
	const data = await tryApiRequest(async () => {
		const result = await contractsApi.acceptContract(contractId);
		const { data } = result;		
		return data;
	}, "Could not accept contract");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Successfully accepted contract with ID: ${contractId}. Gained ${data.data.contract.terms.payment.onAccepted} credits. Current balance: ${data.data.agent.credits}`);
	await ContractModel.update({ ...data.data.contract }, { where: { id: data.data.contract.id } });

	return data;
}

export async function listContracts(pagination: PaginatedRequest) {
	const { page = DEFAULT_PAGINATION_PAGE, limit = DEFAULT_PAGINATION_LIMIT } = pagination;
	const contractsApi = getContractsApi();
	validatePagination(page, limit);
	
	const data = await tryApiRequest(async () => {
		const result = await contractsApi.getContracts(page, limit);
		const { data } = result; 		
		return data;
	}, "Could not list contracts");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Listing ${limit} contracts, page ${page}: ${JSON.stringify(data, undefined, 4)}`);

	const promises = [];
	for (const contract of data.data) {
		promises.push(ContractModel.upsert({ ...contract }));
	}
	await Promise.all(promises);

	return data;
}

export async function getContract(contractId: string) {
	const contractsApi = getContractsApi();	

	const data = await tryApiRequest(async () => {
		const result = await contractsApi.getContract(contractId);
		const { data } = result;		
		return data;
	}, "Could not get contract");

	if (isErrorCodeData(data)) return data;

	Logger.info(`Got contract with ID: ${contractId}. Contract details: ${JSON.stringify(data, undefined, 4)}`);
	await ContractModel.update({ ...data.data }, { where: { id: data.data.id } });

	return data;
}

export async function deliverContract(contractId: string, shipSymbol: string, tradeSymbol: string, units: number) {
	const contractsApi = getContractsApi();

	const data = await tryApiRequest(async () => {
		const result = await contractsApi.deliverContract(contractId, { shipSymbol, tradeSymbol, units });
		const { data } = result;
		return data;
	}, `Could not deliver goods to contract id ${contractId}`);

	if (isErrorCodeData(data)) return data;

	const deliveryTerms = data.data.contract.terms.deliver;		
	if (!deliveryTerms) {
		throw new AppError({
			description: `No delivery terms were found for contractId ${contractId}. This is likely to be a server side error.`,
			httpCode: 500,
			isOperational: false,
			name: ErrorNames.LOGICAL_FAILURE,
		});
	}

	const deliveredUnitsTerms = deliveryTerms.find(term => term.tradeSymbol === tradeSymbol);
	if (!deliveredUnitsTerms) {
		throw new AppError({
			description: `No delivery terms for resource of type ${tradeSymbol} were found for contractId ${contractId}. This is likely to be as erver side error.`,
			httpCode: 500,
			isOperational: false,
			name: ErrorNames.LOGICAL_FAILURE,
		});
	}		
	const { unitsFulfilled, unitsRequired } = deliveredUnitsTerms;

	Logger.info(`Delivered ${units} units of ${tradeSymbol} to contract ${contractId}. In total, ${unitsFulfilled} units out of ${unitsRequired} required were delivered.`);
	if (unitsFulfilled >= unitsRequired) {
		Logger.info(`Completed delivery of ${tradeSymbol} for contractId ${contractId}!`);
	}

	if (deliveryTerms.every(deliveryTerm => deliveryTerm.unitsFulfilled >= deliveryTerm.unitsRequired)) {
		Logger.info(`Contract ${contractId} is ready to be fulfilled!! Call the fulfill endpoint to fulfill it.`);
	}

	const updateContractPromise = ContractModel.update({ ...data.data.contract }, { where: { id: contractId } });
	const updateShipPromise = ShipModel.update({ carg: data.data.cargo }, { where: { symbol: shipSymbol } });
	await Promise.all([updateContractPromise, updateShipPromise]);

	return data;
}