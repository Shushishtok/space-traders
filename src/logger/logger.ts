import fs from 'fs';
import { LOG_LINES_MAX, LOG_PATH, OLD_LOG_PATH } from "../consts/general";
import moment from 'moment';

export class Logger {
	private static formatMessage(key: string, message: string) {
		const date = moment().format('D/M/YYYY HH:mm:ss');
		return `[Timestamp: ${date}] - ${key} - ${message}\n`;
	}

	private static createLog(key: string, message: string) {
		this.cleanUpLogs();
		const log = this.formatMessage(key, message);
		fs.appendFileSync(LOG_PATH, log);
	}

	static info(message: string) {		
		this.createLog('INFO', message);
	}

	static debug(message: string) {
		this.createLog('DEBUG', message);
	}

	static error(message: string) {
		this.createLog('ERROR', message);
	}

	static fatal(message: string) {
		this.createLog('FATAL', message);
	}

	private static cleanUpLogs() {
		const data = fs.readFileSync(LOG_PATH);
		let lines = 0;
		for (const char of data.toString()) {
			if (char === '\n') {
				lines++;
			}
		}

		if (lines >= LOG_LINES_MAX) {
			if (fs.existsSync(OLD_LOG_PATH)) {
				fs.rmSync(OLD_LOG_PATH)
			}
			fs.writeFileSync(OLD_LOG_PATH, data);
			fs.rmSync(LOG_PATH);
		}
	}
}