export interface PaginatedRequest {
	limit: number;
	page: number;
}

export interface PaginatedResult<T> {
	meta: {
		total: number;
		page: number;
		limit: number;
	},
	data: T[];
}