export type AppScreen = 
  | 'landing' 
  | 'interview' 
  | 'thinking' 
  | 'dashboard'
  | 'results' 
  | 'avatar' 
  | 'dna'
  | 'library'
  | 'v2-interview'
  | 'v2-thinking'
  | 'v2-dashboard';

export interface DecisionInput {
  goal: string;
  decision: string;
  deadline: string;
  resources: string;
  context: string;
}

export interface FutureOutcome {
  title: string;
  probability: number;
  advantages: string[];
  risks: string[];
  confidence: number;
  turningPoint: string;
  summary: string;
}

export interface AvatarLetter {
  salutation: string;
  bodyParagraphs: string[];
  pivotalAdvice: string;
  signature: string;
}

export interface DnaMetrics {
  risk: number;
  growth: number;
  learning: number;
  time: number;
  money: number;
  personalSatisfaction: number;
  confidence: number;
  verdict: string;
}

export interface SimulationResult {
  bestFuture: FutureOutcome;
  mostLikelyFuture: FutureOutcome;
  worstFuture: FutureOutcome;
  avatarLetter: AvatarLetter;
  butterflyTimeline?: Array<{ year: string; title: string; description: string; impact: string }>;
  dnaMetrics: DnaMetrics;
  timestamp: string;
}

// Re-export all ORACLE 2035 V2 and Unified Data Models
export * from './types/v2';
export * from './services/unifiedDecisionEngine';
