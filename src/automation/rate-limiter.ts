import { AppError } from "../exceptions/app-error";
import { RateLimit, RateLimitConst } from "../interfaces/rate-limit";

const rateLimitsConst: RateLimitConst[] = [
	{ tokens: 2, interval: 1 },
	{ tokens: 10, interval: 10 }
];

export class RateLimiter {
	private static initialized = false;
	private static rateLimits: RateLimit[] = [];
	private static queue: ((value: RateLimit) => void)[] = [];
	private static isQueueConsuming = false;

	static init() {
		// Initialize rate limit queue
		for (const { tokens, interval } of rateLimitsConst) {
			this.rateLimits.push({
				currentTokens: tokens,
				maxTokens: tokens,
				interval,
				timeout: null,
			});
		}

		this.initialized = true;
	}
	
	static consumeQueue() {
		if (this.isQueueConsuming) return;
		this.isQueueConsuming = true;

		while (this.queue.length > 0 && this.doesTokenExist()) {
			const queuedPromise = this.queue.shift();
			if (queuedPromise) {
				const consumedRateLimit = this.consumeToken();
				queuedPromise(consumedRateLimit);
			}
		}

		this.isQueueConsuming = false;
	}

	private static doesTokenExist() {
		return this.rateLimits.some(ratelimit => !this.isRateLimitEmpty(ratelimit));		
	}

	private static isRateLimitEmpty(rateLimit: RateLimit) {
		return rateLimit.currentTokens === 0;
	}

	static addToQueue(): Promise<RateLimit> {
		if (!this.initialized) this.init();

		const promise: Promise<RateLimit> = new Promise((resolve) => {
			this.queue.push(resolve);
		});
		
		this.consumeQueue();

		return promise;
	}

	private static consumeToken() {
		for (const rateLimit of this.rateLimits) {
			if (!this.isRateLimitEmpty(rateLimit)) {
				rateLimit.currentTokens -= 1;				
				return rateLimit;
			}
		}

		// Should never reach this code
		throw new AppError({
			description: `No token was consumed, all rate limits are empty`,
			httpCode: 500,
			isOperational: false,
		});
	}

	static startTokenReplenishTimeout(rateLimit: RateLimit) {
		if (rateLimit.timeout !== null) return;

		rateLimit.timeout = setTimeout(() => {
			rateLimit.timeout = null;
			rateLimit.currentTokens = rateLimit.maxTokens;
			this.consumeQueue();
		}, rateLimit.interval * 1000);
	}
}
