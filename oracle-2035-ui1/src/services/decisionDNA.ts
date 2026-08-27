export interface DecisionDNAInput {
  decision?: string;
  goal?: string;
  deadline?: string;
  resources?: string;
  riskTolerance?: string | number;
  additionalContext?: string;
  context?: string;
}

export interface DecisionDNAResult {
  risk: number;
  growth: number;
  learning: number;
  money: number;
  time: number;
  confidence: number;
}

/**
 * Deterministic Decision DNA Calculation Engine
 * Analyzes strategic inputs, keyword signals, timeframe urgency, and context density
 * to return weighted score vectors clamped strictly between 0 and 100.
 */
export function calculateDecisionDNA(input: DecisionDNAInput): DecisionDNAResult {
  const decisionText = (input.decision || "").toLowerCase();
  const goalText = (input.goal || "").toLowerCase();
  const resourcesText = (input.resources || "").toLowerCase();
  const contextText = (input.additionalContext || input.context || "").toLowerCase();
  const deadlineText = (input.deadline || "").toLowerCase();

  const combinedText = `${decisionText} ${goalText} ${resourcesText} ${contextText}`;

  // Helper for keyword matching count
  const countMatches = (keywords: string[]): number => {
    let count = 0;
    for (const kw of keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        count++;
      }
    }
    return count;
  };

  // -------------------------------------------------------------
  // 1. RISK SCORE
  // -------------------------------------------------------------
  let riskScore = 50; // Neutral baseline

  const highRiskKeywords = [
    "startup", "investment", "quit", "relocate", "freelance",
    "crypto", "business", "leverage", "debt", "borrow", "bootstrap",
    "pivot", "venture", "fund", "all in", "unfunded", "untested"
  ];

  const lowRiskKeywords = [
    "government", "stable", "secure", "job", "family business",
    "tenure", "safe", "bonds", "corporate", "guaranteed", "pension",
    "low risk", "cautious", "gradual"
  ];

  const highRiskMatches = countMatches(highRiskKeywords);
  const lowRiskMatches = countMatches(lowRiskKeywords);

  riskScore += highRiskMatches * 10;
  riskScore -= lowRiskMatches * 12;

  // Handle explicit risk tolerance parameter
  if (input.riskTolerance !== undefined) {
    const rt = String(input.riskTolerance).toLowerCase();
    if (rt.includes("high") || rt.includes("aggressive") || Number(rt) >= 8) {
      riskScore += 15;
    } else if (rt.includes("low") || rt.includes("conservative") || (Number(rt) <= 3 && Number(rt) > 0)) {
      riskScore -= 15;
    }
  }

  // -------------------------------------------------------------
  // 2. GROWTH SCORE
  // -------------------------------------------------------------
  let growthScore = 45; // Baseline

  const growthKeywords = [
    "ai", "startup", "engineering", "masters", "business",
    "research", "innovation", "leadership", "scale", "expansion",
    "vp", "cto", "ceo", "build", "launch", "global", "tech",
    "product", "market", "breakthrough", "transform"
  ];

  const growthMatches = countMatches(growthKeywords);
  growthScore += growthMatches * 12;

  // -------------------------------------------------------------
  // 3. LEARNING SCORE
  // -------------------------------------------------------------
  let learningScore = 40; // Baseline

  const learningKeywords = [
    "course", "degree", "internship", "mentor", "certification",
    "research", "college", "university", "phd", "study",
    "bootcamp", "skill", "learn", "academy", "training",
    "thesis", "education", "workshop", "upskill"
  ];

  const learningMatches = countMatches(learningKeywords);
  learningScore += learningMatches * 14;

  // -------------------------------------------------------------
  // 4. MONEY SCORE
  // -------------------------------------------------------------
  let moneyScore = 45; // Baseline

  const moneyKeywords = [
    "business", "promotion", "investment", "salary", "startup",
    "freelance", "equity", "revenue", "profit", "raise",
    "capital", "exit", "commercial", "monetize", "sales",
    "wealth", "roi", "stock", "fundraising", "income"
  ];

  const moneyMatches = countMatches(moneyKeywords);
  moneyScore += moneyMatches * 12;

  // -------------------------------------------------------------
  // 5. TIME URGENCY SCORE
  // -------------------------------------------------------------
  let timeScore = 50; // Baseline

  if (deadlineText) {
    if (
      deadlineText.includes("today") ||
      deadlineText.includes("now") ||
      deadlineText.includes("immediate") ||
      deadlineText.includes("asap") ||
      deadlineText.includes("urgent") ||
      deadlineText.includes("1 week") ||
      deadlineText.includes("2 weeks") ||
      deadlineText.includes("1 month") ||
      deadlineText.includes("30 days")
    ) {
      timeScore = 90;
    } else if (
      deadlineText.includes("3 months") ||
      deadlineText.includes("6 months") ||
      deadlineText.includes("quarter") ||
      deadlineText.includes("this year")
    ) {
      timeScore = 70;
    } else if (
      deadlineText.includes("1 year") ||
      deadlineText.includes("2 years") ||
      deadlineText.includes("5 years") ||
      deadlineText.includes("10 years") ||
      deadlineText.includes("long term") ||
      deadlineText.includes("decade")
    ) {
      timeScore = 35;
    } else {
      timeScore = 60;
    }
  }

  // -------------------------------------------------------------
  // 6. CONFIDENCE SCORE
  // -------------------------------------------------------------
  let confidenceScore = 40; // Baseline

  // Goal clarity
  if (goalText.length > 80) confidenceScore += 25;
  else if (goalText.length > 30) confidenceScore += 15;
  else if (goalText.length > 10) confidenceScore += 8;

  // Resource availability detail
  if (resourcesText.length > 50) confidenceScore += 20;
  else if (resourcesText.length > 15) confidenceScore += 10;

  if (
    resourcesText.includes("funding") ||
    resourcesText.includes("savings") ||
    resourcesText.includes("team") ||
    resourcesText.includes("mentor") ||
    resourcesText.includes("experienced") ||
    resourcesText.includes("budget")
  ) {
    confidenceScore += 10;
  }

  // Decision & Context detail
  if (decisionText.length > 40) confidenceScore += 15;
  else if (decisionText.length > 15) confidenceScore += 8;

  if (contextText.length > 30) confidenceScore += 10;

  // Clamp function ensuring every value is strictly between 0 and 100
  const clamp = (val: number) => Math.min(100, Math.max(0, Math.round(val)));

  return {
    risk: clamp(riskScore),
    growth: clamp(growthScore),
    learning: clamp(learningScore),
    money: clamp(moneyScore),
    time: clamp(timeScore),
    confidence: clamp(confidenceScore),
  };
}
