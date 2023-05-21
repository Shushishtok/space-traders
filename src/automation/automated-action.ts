import { AppError, ErrorNames } from "../exceptions/app-error";
import { Logger } from "../logger/logger";

export class AutomatedActions {
	private static readonly automationMap: Map<string, boolean> = new Map();

	static registerAutomatedAction(automatedActionName: string, initialValue = true) {
		if (this.automationMap.has(automatedActionName)) {
			throw new AppError({
				description: `Attempted to register an automated action that was already registered.`,
				httpCode: 500,
				name: ErrorNames.LOGICAL_FAILURE,
			});
		}

		this.automationMap.set(automatedActionName, initialValue);
		Logger.debug(`Registered automated action named ${automatedActionName} to the automated action map.`);
	}

	static stopAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			throw new AppError({
				description: `Attempted to stop an automated action that was not mapped.`,
				httpCode: 500,
				name: ErrorNames.LOGICAL_FAILURE,
			});
		}

		if (this.automationMap.get(automatedActionName) === false) {
			throw new AppError({
				description: `Attempted to stop an automated action that was already stopped.`,
				httpCode: 500,
				name: ErrorNames.LOGICAL_FAILURE,
			});
		}

		this.automationMap.set(automatedActionName, false);
		Logger.debug(`Stopped automated action named ${automatedActionName}.`);
	}

	static startAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			this.registerAutomatedAction(automatedActionName);
		} else {
			if (this.automationMap.get(automatedActionName) === true) {
				throw new AppError({
					description: `Attempted to start an automated action that was already started.`,
					httpCode: 500,
					name: ErrorNames.LOGICAL_FAILURE,
				});
			}
		}

		this.automationMap.set(automatedActionName, true);
		Logger.debug(`Started automated action named ${automatedActionName}.`);
	}

	static removeAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			throw new AppError({
				description: `Attempted to remove an automated action that was not mapped.`,
				httpCode: 500,
				name: ErrorNames.LOGICAL_FAILURE,
			});
		}

		this.automationMap.delete(automatedActionName);
		Logger.debug(`Removed automated action named ${automatedActionName} from the automation map.`);
	}

	static isAutomationActive(automatedActionName: string) {
		const value = this.automationMap.get(automatedActionName);
		if (value === undefined) {
			throw new AppError({
				description: `Attempted to get an automated action that was not mapped.`,
				httpCode: 500,
				name: ErrorNames.LOGICAL_FAILURE,
			});
		}

		return value;
	}
}