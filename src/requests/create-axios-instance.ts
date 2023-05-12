import axios, { AxiosError, AxiosInstance } from "axios";
import { sleep } from "../utils";

export function createAxiosInstance() {
	const axiosInstance = axios.create({});

	// Add middlewares to the instance before returning it
	addMiddlewares(axiosInstance);	

	return axiosInstance;
}

function addMiddlewares(axiosInstance: AxiosInstance) {
	addRateLimitMiddleware(axiosInstance);
}

function addRateLimitMiddleware(axiosInstance: AxiosInstance) {
	// Rate limit retry mechanism
	axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
		if (error.response?.status === 429) { // rate limit
			if (!error.config) return;

			const retryAfter = error.response.headers['retry-after'];			
			await sleep(retryAfter);
			return axiosInstance.request(error.config);
		} 

		throw error;
	});
}