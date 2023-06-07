import { ShipMountSymbolEnum, ShipNavFlightMode, ShipType, Survey } from "../../packages/spacetraders-sdk";
import { ShipActionRole } from "../consts/ships";

export interface ShipSymbol {
	shipSymbol: string;
}

export interface ShipSymbols {
	shipSymbols: string[];
}

export interface PurchaseShip {
	shipType: ShipType;
	waypointSymbol: string;
}

export interface NavigateShipsRequest extends ShipSymbols {
	waypointSymbol: string;
}

export interface JumpShipRequestBody extends ShipSymbols {
	systemSymbol: string;
}

export interface ExtractIntoShip extends ShipSymbols {
	survey?: Survey;
}

export interface ShipCargoTransaction extends ShipSymbols {
	unitSymbol: string;
	unitCount: number;
}

export interface ShipFullCargoPurchase extends ShipSymbols {
	unitSymbol: string;
}

export interface ShipExtractionAutomation extends ShipSymbols {
	stop: boolean;	
}

export interface ShipExtractionAutomationAll {
	stop: boolean;
}

export interface SetFlightModeRequestBody extends ShipSymbols {
	flightMode: ShipNavFlightMode;
}

export interface InstallMountRequestBody extends ShipSymbols {
	mountSymbol: ShipMountSymbolEnum;
}

export interface AssignShipRoles extends ShipSymbols {
	addRoles?: ShipActionRole[];
	removeRoles?: ShipActionRole[];
}