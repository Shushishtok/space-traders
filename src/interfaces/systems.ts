export interface Waypoint {
	systemSymbol: string;
	waypointSymbol: string;
}

export interface Waypoints {
	systemSymbol: string;
	page: number;
	limit: number;
}

export interface SystemRequest {
	systemSymbol: string;
}