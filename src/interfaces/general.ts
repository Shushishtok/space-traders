import { RegisterRequestFactionEnum } from "../packages/spacetraders-sdk";

export interface RegisterBody {
	symbol: string,
	faction: RegisterRequestFactionEnum,
	wipeDatabase?: boolean;
}
