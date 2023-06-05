import { ShipMountSymbolEnum, ShipNavFlightMode, ShipType, Survey } from "../../packages/spacetraders-sdk";
import { ShipActionRole } from "../consts/ships";

export interface ShipSymbol {
	shipSymbol: string;
}

export interface PurchaseShip {
	shipType: ShipType;
	waypointSymbol: string;
}

export interface NavigateShip extends ShipSymbol {
	waypointSymbol: string;
}

export interface ExtractIntoShip extends ShipSymbol {
	survey?: Survey;
}

export interface ShipCargoTransaction extends ShipSymbol {
	unitSymbol: string;
	unitCount: number;
}

export interface ShipFullCargoPurchase extends ShipSymbol {
	unitSymbol: string;
}

export interface ShipExtractionAutomation extends ShipSymbol {
	stop: boolean;	
}

export interface ShipExtractionAutomationAll {
	stop: boolean;
}

export interface SetFlightModeRequest extends ShipSymbol {
	flightMode: ShipNavFlightMode;
}

export interface InstallMountRequest extends ShipSymbol {
	mountSymbol: ShipMountSymbolEnum
}

export interface AssignShipRoles extends ShipSymbol {
	addRoles?: ShipActionRole[];
	removeRoles?: ShipActionRole[];
}