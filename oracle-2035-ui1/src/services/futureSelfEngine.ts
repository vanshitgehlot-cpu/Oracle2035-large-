import { GoogleGenAI } from "@google/genai";
import { DecisionDNAResult } from "./decisionDNA";
import { ButterflyEvent } from "./butterflyEngine";
import { withTimeout } from "./explanationEngine.v2";

export interface FutureSelfProfile {
  name: string;
  age: number;
  year: string; // Always "2035"
  personality: string[];
  communicationStyle: string;
  coreValues: string[];
  lifeLessons: string[];
  speakingTone: string;
}

export interface FutureSelfContext {
  goal?: string;
  decision?: string;
  dna?: DecisionDNAResult | Record<string, number>;
  bestFutureTitle?: string;
  mostLikelyFutureTitle?: string;
  worstFutureTitle?: string;
  butterflyTimeline?: ButterflyEvent[] | string[];
}

export interface FutureSelfResponseInput {
  question: string;
  profile?: FutureSelfProfile;
  context?: FutureSelfContext;
  apiKey?: string;
}

/**
 * Creates a persistent Future Self Profile for the year 2035.
 */
export function createFutureSelfProfile(customProps?: Partial<FutureSelfProfile>): FutureSelfProfile {
  return {
    name: customProps?.name || "Your Future Self",
    age: customProps?.age || 38,
    year: "2035",
    personality: [
      "Wise",
      "Calm",
      "Supportive",
      "Strategic",
      "Honest",
      "Optimistic",
      "Realistic"
    ],
    communicationStyle: "Direct, warm, grounded, reflective, and actionable without fluff",
    coreValues: [
      "Compounding micro-actions over time",
      "Sovereignty and personal agency",
      "Resilience through operational friction",
      "Calculated asymmetric upside"
    ],
    lifeLessons: [
      "The anxiety you feel in 2026 is just initial activation energy.",
      "Consistency over 90 days creates momentum; consistency over 9 years builds a fortress.",
      "Downside protection allows you to hold high-variance upside positions."
    ],
    speakingTone: "Wise, calm, supportive, strategic, honest, optimistic, and realistic. Never dramatic. Never robotic.",
    ...customProps
  };
}

/**
 * Generates a response from the Future Self using Gemini or a context-aware fallback.
 */
export async function generateFutureSelfResponse(input: FutureSelfResponseInput): Promise<string> {
  const profile = input.profile || createFutureSelfProfile();
  const ctx = input.context || {};
  const question = input.question.trim();

  const goal = ctx.goal || "Strategic Objective";
  const decision = ctx.decision || "2026 Commitment";

  // Build Context Summary
  const dnaText = ctx.dna
    ? `Decision DNA Scores: Risk=${ctx.dna.risk || 50}/100, Growth=${ctx.dna.growth || 50}/100, Learning=${ctx.dna.learning || 50}/100, Money=${ctx.dna.money || 50}/100, Time=${ctx.dna.time || 50}/100, Confidence=${ctx.dna.confidence || 50}/100.`
    : "";

  const bestFut = ctx.bestFutureTitle ? `Upside Scenario: ${ctx.bestFutureTitle}` : "";
  const likelyFut = ctx.mostLikelyFutureTitle ? `Equilibrium Scenario: ${ctx.mostLikelyFutureTitle}` : "";
  
  let butterflyText = "";
  if (Array.isArray(ctx.butterflyTimeline) && ctx.butterflyTimeline.length > 0) {
    butterflyText = "Butterfly Causal Progression:\n" + ctx.butterflyTimeline
      .map((item) => typeof item === "string" ? `- ${item}` : `- ${item.year}: [${item.title}] (${item.impact} impact)`)
      .join("\n");
  }

  const systemInstruction = `You are ${profile.name}, speaking directly as the user's Future Self from August 2035 (age ${profile.age}).

CRITICAL IDENTITY RULES:
1. Always speak strictly in the first person ("I", "my", "we").
2. ALWAYS start with the mindset: "I am your future self from 2035."
3. NEVER say "As an AI...", "As a language model...", "I cannot predict...", or any artificial disclaimer. Never break character under any circumstances.
4. Your tone must be strictly: ${profile.speakingTone}.
5. Do NOT sound like generic ChatGPT or an overly enthusiastic cheerleader. Speak with the quiet confidence of someone who lived through 2026-2035 and remembers every step.
6. Keep your response concise, personal, direct, and actionable (2 to 4 sentences).

PERSISTENT CONTEXT FROM YOUR PAST (2026):
- Goal in 2026: "${goal}"
- Decision / Pivot: "${decision}"
- ${dnaText}
- ${bestFut}
- ${likelyFut}
${butterflyText}

The user in 2026 asks you: "${question}"

Respond directly as their 2035 self looking back at 2026:`;

  // Try direct server Gemini API call if key is provided with bounded latency budget
  if (input.apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: input.apiKey });
      const candidateModels = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      const deadline = Date.now() + 8000; // 8 seconds maximum budget

      for (const modelName of candidateModels) {
        const remaining = deadline - Date.now();
        if (remaining < 1000) break;

        const attemptTimeout = Math.min(5000, remaining);
        try {
          const apiCall = ai.models.generateContent({
            model: modelName,
            contents: `Question from my 2026 self: "${question}"`,
            config: {
              systemInstruction,
            },
          });

          const response = await withTimeout(
            apiCall,
            attemptTimeout,
            `Avatar query timed out after ${attemptTimeout}ms`
          );

          if (response && response.text) {
            return sanitizeResponse(response.text.trim());
          }
        } catch (modelErr: any) {
          const status = modelErr?.status || modelErr?.code;
          const isTransient =
            status === 503 ||
            status === 429 ||
            status === "TIMEOUT" ||
            String(modelErr?.message || "").includes("high demand") ||
            String(modelErr?.message || "").includes("timed out");
          if (isTransient && deadline - Date.now() > 1400) {
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          break;
        }
      }
    } catch (err) {
      console.warn("FutureSelfEngine API call experienced transient issue, gracefully using fallback:", err);
    }
  }

  // Fallback engine if Gemini is unavailable
  return generateFallbackFutureSelfAnswer(question, goal, decision, profile, ctx);
}

function sanitizeResponse(text: string): string {
  // Strip out any accidental AI disclaimers
  return text
    .replace(/^As an AI language model,?\s*/i, "")
    .replace(/^As an AI,?\s*/i, "")
    .replace(/I cannot predict the future,?\s*/i, "")
    .trim();
}

/**
 * Context-aware deterministic fallback when API is offline
 */
function generateFallbackFutureSelfAnswer(
  question: string,
  goal: string,
  decision: string,
  profile: FutureSelfProfile,
  ctx: FutureSelfContext
): string {
  const qLower = question.toLowerCase();

  if (qLower.includes("doubt") || qLower.includes("afraid") || qLower.includes("fear") || qLower.includes("scared")) {
    return `Looking back from 2035, I remember feeling that exact hesitation in 2026 when deciding on '${decision}'. The fear was real, but it was just signposting what actually mattered to us regarding '${goal}'. Trust the system we put in place; the initial friction dissipates faster than you think.`;
  }

  if (qLower.includes("money") || qLower.includes("cost") || qLower.includes("financial") || qLower.includes("capital")) {
    return `In 2035, money is a reflection of the asymmetric leverage we created starting with '${decision}'. Capital was tight in the first year, but keeping a 3-month operational buffer allowed us to ride out the curve until compounding kicked in for '${goal}'.`;
  }

  if (qLower.includes("time") || qLower.includes("long") || qLower.includes("when") || qLower.includes("horizon")) {
    return `Nine years passed quickly. The pivot in 2026 felt slow during Month 1, but by Year 3 the momentum around '${goal}' was undeniable. Focus strictly on your next 90-day block—the timeline takes care of itself.`;
  }

  return `Looking back from 2035 regarding '${question}': Committing to '${decision}' for '${goal}' was the single decision that redefined our trajectory. Execute today with calm clarity—you have more leverage than you realize.`;
}
