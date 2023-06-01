import { AppError } from "../exceptions/app-error";
import { RateLimit, RateLimitConst } from "../interfaces/rate-limit";

const rateLimitsConst: RateLimitConst[] = [
	{ tokens: 2, interval: 1 },
	{ tokens: 10, interval: 10 }
];

export class RateLimiter {
	private static initialized = false;
	private static rateLimits: RateLimit[] = [];
	private static queue: ((value: void) => void)[] = [];
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
				this.consumeToken();
				queuedPromise();
			}
		}

		this.isQueueConsuming = false;
	}

	private static doesTokenExist() {
		for (const rateLimit of this.rateLimits) {
			if (!this.isRateLimitEmpty(rateLimit)) return true;
		}

		return false;
	}

	private static isRateLimitEmpty(rateLimit: RateLimit) {
		return rateLimit.currentTokens === 0;
	}

	static addToQueue() {
		if (!this.initialized) this.init();

		const promise = new Promise((resolve) => {
			this.queue.push(resolve);
		});
		
		this.consumeQueue();

		return promise;
	}

	private static consumeToken() {
		for (const rateLimit of this.rateLimits) {
			if (!this.isRateLimitEmpty(rateLimit)) {
				rateLimit.currentTokens -= 1;
				if (rateLimit.timeout === null) {
					this.startTokenReplenishTimeout(rateLimit);
				}
				return;
			}
		}

		// Should never reach this code
		throw new AppError({
			description: `No token was consumed, all rate limits are empty`,
			httpCode: 500,
			isOperational: false,
		});
	}

	private static startTokenReplenishTimeout(rateLimit: RateLimit) {
		if (rateLimit.timeout !== null) throw new AppError({ description: "Replenish timeout was triggered while a timeout already exists", httpCode: 500, isOperational: false });

		rateLimit.timeout = setTimeout(() => {
			rateLimit.timeout = null;
			rateLimit.currentTokens = rateLimit.maxTokens;
			this.consumeQueue();
		}, rateLimit.interval * 1000 + 250); // 250ms - to allow the server enough time to reply. Reduces chances of hitting a rate limit block.
	}
}
