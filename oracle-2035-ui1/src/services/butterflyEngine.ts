import { DecisionDNAResult } from "./decisionDNA";

export interface ButterflyEvent {
  year: "Month 1" | "Month 6" | "Year 1" | "Year 3" | "Year 5" | "Year 9" | string;
  title: string;
  description: string;
  impact: "Low" | "Medium" | "High" | "Maximum" | string;
}

export interface ButterflyInput {
  decision: string;
  goal: string;
  dna: DecisionDNAResult | {
    risk: number;
    growth: number;
    learning: number;
    money: number;
    time: number;
    confidence: number;
  };
  recommendation?: string;
}

/**
 * Deterministic Butterfly Engine
 * Generates a structured, 6-stage causal timeline where every event logically
 * flows from the previous consequence, influenced by Decision DNA scores.
 */
export function generateButterflyTimeline(input: ButterflyInput): ButterflyEvent[] {
  const decision = (input.decision || "Primary Strategic Choice").trim();
  const goal = (input.goal || "Strategic Objective").trim();
  const dna = input.dna || { risk: 50, growth: 50, learning: 50, money: 50, time: 50, confidence: 50 };
  const rec = input.recommendation ? `(${input.recommendation})` : "";

  const isHighRisk = dna.risk >= 65;
  const isHighLearning = dna.learning >= 65;
  const isHighMoney = dna.money >= 65;
  const isHighGrowth = dna.growth >= 65;

  // Causal Chain Construction
  // Event 1: Month 1
  const month1Title = "Initial Commitment & System Setup";
  const month1Desc = `By executing '${decision}', you establish immediate operational focus. Initial systems are set up to support '${goal}', overcoming first-order activation friction and locking in your primary directional vector.`;

  // Event 2: Month 6 (Caused by Month 1)
  const month6Title = isHighRisk 
    ? "Volatility Absorption & Early Beachhead" 
    : isHighLearning 
    ? "Rapid Skill Acquisition & Feedback Loop" 
    : "First Milestone Validation";
  const month6Desc = `Directly stemming from Month 1's momentum, your initial iteration yields tangible data. ${
    isHighRisk 
      ? "You navigate early turbulence, converting initial volatility into a defensible beachhead." 
      : isHighLearning 
      ? "Your accelerated learning curve unlocks key domain mastery, refining how you pursue '" + goal + "'." 
      : "First-stage feedback validates your initial thesis and optimizes resource deployment."
  }`;

  // Event 3: Year 1 (Caused by Month 6)
  const year1Title = isHighMoney
    ? "Capital Acceleration & Revenue Foundation"
    : isHighGrowth
    ? "Network Effects & Footprint Expansion"
    : "Systematization & Compounding Base";
  const year1Desc = `Building upon the Month 6 beachhead, your daily execution becomes systematized. ${
    isHighMoney
      ? "Financial compounding begins as revenue models or capital returns gain measurable velocity."
      : isHighGrowth
      ? "Your expanding reach attracts strategic partners, accelerating trajectory toward '" + goal + "'."
      : "Repeatable processes eliminate operational friction and solidify your core baseline."
  }`;

  // Event 4: Year 3 (Caused by Year 1)
  const year3Title = "Strategic Inflection Point & Structural Moat";
  const year3Desc = `Three years of compounded effort from your 2026 commitment trigger a major inflection point. Alternative paths and competitors lag behind as your operational velocity around '${goal}' creates an unassailable moat.`;

  // Event 5: Year 5 (Caused by Year 3)
  const year5Title = isHighMoney
    ? "Exponential Wealth & Asset Scaling"
    : isHighGrowth
    ? "Category Leadership & Scale Mastery"
    : "High-Leverage Autonomy";
  const year5Desc = `With Year 3's moat established, high-leverage opportunities materialize automatically. ${
    isHighMoney
      ? "Exponential financial yield converts your early commitment into significant liquid sovereignty."
      : isHighGrowth
      ? "You achieve undisputed category leadership, dictating terms within your domain for '" + goal + "'."
      : "You gain full autonomy over time and resources, operating strictly on asymmetric upside."
  }`;

  // Event 6: Year 9 (Caused by Year 5 - Year 2035 Horizon)
  const year9Title = "Temporal Transformation & Complete Legacy";
  const year9Desc = `The ultimate 9-year culmination of deciding to '${decision}' in 2026. Complete realization of '${goal}' achieved in 2035 with total personal, financial, and strategic sovereignty. ${rec}`.trim();

  return [
    {
      year: "Month 1",
      title: month1Title,
      description: month1Desc,
      impact: "Low"
    },
    {
      year: "Month 6",
      title: month6Title,
      description: month6Desc,
      impact: "Medium"
    },
    {
      year: "Year 1",
      title: year1Title,
      description: year1Desc,
      impact: "Medium"
    },
    {
      year: "Year 3",
      title: year3Title,
      description: year3Desc,
      impact: "High"
    },
    {
      year: "Year 5",
      title: year5Title,
      description: year5Desc,
      impact: "High"
    },
    {
      year: "Year 9",
      title: year9Title,
      description: year9Desc,
      impact: "Maximum"
    }
  ];
}
