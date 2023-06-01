export interface RateLimitConst {
	tokens: number;
	interval: number;
}

export interface RateLimit {
	currentTokens: number;
	maxTokens: number;
	interval: number;
	timeout: NodeJS.Timeout | null;
}