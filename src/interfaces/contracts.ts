export interface ContractID {
	contractId: string;
}

export interface DeliverContact extends ContractID {
	shipSymbol: string;
	tradeSymbol: string;
	units: number;
}

export interface DeliverAllContracts extends ContractID {
	shipSymbol: string;		
}