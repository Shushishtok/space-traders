// General Error Codes
export const cooldownConflictError = 4000;
export const waypointNoAccessError = 4001;

// Account Error Codes
export const tokenEmptyError = 4100;
export const tokenMissingSubjectError = 4101;
export const tokenInvalidSubjectError = 4102;
export const missingTokenRequestError = 4103;
export const invalidTokenRequestError = 4104;
export const invalidTokenSubjectError = 4105;
export const accountNotExistsError = 4106;
export const agentNotExistsError = 4107;
export const accountHasNoAgentError = 4108;
export const registerAgentExistsError = 4109;

// Ship Error Codes
export const navigateInTransitError = 4200;
export const navigateInvalidDestinationError = 4201;
export const navigateOutsideSystemError = 4202;
export const navigateInsufficientFuelError = 4203;
export const navigateSameDestinationError = 4204;
export const shipExtractInvalidWaypointError = 4205;
export const shipExtractPermissionError = 4206;
export const shipJumpNoSystemError = 4207;
export const shipJumpSameSystemError = 4208;
export const shipJumpMissingModuleError = 4210;
export const shipJumpNoValidWaypointError = 4211;
export const shipJumpMissingAntimatterError = 4212;
export const shipInTransitError = 4214;
export const shipMissingSensorArraysError = 4215;
export const purchaseShipCreditsError = 4216;
export const shipCargoExceedsLimitError = 4217;
export const shipCargoMissingError = 4218;
export const shipCargoUnitCountError = 4219;
export const shipSurveyVerificationError = 4220;
export const shipSurveyExpirationError = 4221;
export const shipSurveyWaypointTypeError = 4222;
export const shipSurveyOrbitError = 4223;
export const shipSurveyExhaustedError = 4224;
export const shipRefuelDockedError = 4225;
export const shipRefuelInvalidWaypointError = 4226;
export const shipMissingMountsError = 4227;
export const shipCargoFullError = 4228;
export const shipJumpFromGateToGateError = 4229;
export const waypointChartedError = 4230;
export const shipTransferShipNotFound = 4231;
export const shipTransferAgentConflict = 4232;
export const shipTransferSameShipConflict = 4233;
export const shipTransferLocationConflict = 4234;
export const warpInsideSystemError = 4235;
export const shipNotInOrbitError = 4236;
export const shipInvalidRefineryGoodError = 4237;
export const shipInvalidRefineryTypeError = 4238;
export const shipMissingRefineryError = 4239;
export const shipMissingSurveyorError = 4240;
 
// Contract Error Codes
export const acceptContractNotAuthorizedError = 4500;
export const acceptContractConflictError = 4501;
export const fulfillContractDeliveryError = 4502;
export const contractDeadlineError = 4503;
export const contractFulfilledError = 4504;
export const contractNotAcceptedError = 4505;
export const contractNotAuthorizedError = 4506;
export const shipDeliverTermsError = 4508;
export const shipDeliverFulfilledError = 4509;
export const shipDeliverInvalidLocationError = 4510;
 
// Market Error Codes
export const marketTradeInsufficientCreditsError = 4600;
export const marketTradeNoPurchaseError = 4601;
export const marketTradeNotSoldError = 4602;
export const marketNotFoundError = 4603;
export const marketTradeUnitLimitError = 4604;