export {
  analyzeDecision,
  runDecisionSimulation,
  askAvatarQuestion
} from "../services/oracleEngine";

export type {
  OracleInput,
  FutureScenario,
  DecisionDNAData,
  OracleRawOutput
} from "../services/oracleEngine";

export { calculateDecisionDNA } from "../services/decisionDNA";
export type { DecisionDNAInput, DecisionDNAResult } from "../services/decisionDNA";

export { generateButterflyTimeline } from "../services/butterflyEngine";
export type { ButterflyEvent, ButterflyInput } from "../services/butterflyEngine";

export { createFutureSelfProfile, generateFutureSelfResponse } from "../services/futureSelfEngine";
export type { FutureSelfProfile, FutureSelfContext, FutureSelfResponseInput } from "../services/futureSelfEngine";

export { speak, stopSpeaking, toggleMute, isSpeaking, isMuted, isVoiceSupported } from "../services/voiceEngine";
