import { AppError, ErrorNames } from "../exceptions/app-error";
import { Logger } from "../logger/logger";

export class AutomatedActions {
	private static readonly automationMap: Map<string, boolean> = new Map();

	static registerAutomatedAction(automatedActionName: string, initialValue = true) {
		if (this.automationMap.has(automatedActionName)) {
			Logger.debug(`Automated action ${automatedActionName} was already registered, skipping action`);
			return;
		}

		this.automationMap.set(automatedActionName, initialValue);
		Logger.debug(`Registered automated action named ${automatedActionName} to the automated action map.`);
	}

	static stopAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			Logger.debug(`Automated action ${automatedActionName} is not registered, skipping action.`);
			return;
		}

		if (this.automationMap.get(automatedActionName) === false) {
			Logger.debug(`Automated action ${automatedActionName} is registered but already stopped. Skipping action.`);
		}

		this.automationMap.set(automatedActionName, false);
		Logger.debug(`Stopped automated action named ${automatedActionName}.`);
	}

	static startAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			this.registerAutomatedAction(automatedActionName);
			return;
		}
		
		if (this.automationMap.get(automatedActionName) === true) {
			Logger.debug(`Automated action ${automatedActionName} was already started, skipping action.`);
			return;
		}

		this.automationMap.set(automatedActionName, true);
		Logger.debug(`Started automated action named ${automatedActionName}.`);
	}

	static removeAutomatedAction(automatedActionName: string) {
		if (!this.automationMap.has(automatedActionName)) {
			Logger.debug(`There was no automated action named ${automatedActionName}. Skipping action.`);
			return;
		}

		this.automationMap.delete(automatedActionName);
		Logger.debug(`Removed automated action named ${automatedActionName} from the automation map.`);
	}

	static isAutomationActive(automatedActionName: string) {
		const value = this.automationMap.get(automatedActionName);
		if (value === undefined) { return false; }

		return value;
	}
}