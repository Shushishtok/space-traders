export interface ContractID {
	contractId: string;
}

export interface DeliverContact extends ContractID {
	shipSymbol: string;
	tradeSymbol: string;
	units: number;
}