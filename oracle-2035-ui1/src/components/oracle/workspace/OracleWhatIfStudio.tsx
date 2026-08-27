import React, { useState, useMemo } from "react";
import {
  V2DecisionPayload,
  DecisionDNAV2Result,
  ScenarioSuiteResult,
} from "../../../types/v2";
import {
  calculateUnifiedWhatIf,
  UnifiedWhatIfParameters,
} from "../../../services/unifiedDecisionEngine";
import {
  Sliders,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Hash,
} from "lucide-react";
import { OracleButton } from "../OracleButton";
import { OracleStatus } from "../OracleStatus";
import { sound } from "../../../utils/soundEffects";

export interface OracleWhatIfStudioProps {
  payload: V2DecisionPayload;
  decisionDNA: DecisionDNAV2Result;
  scenarios: ScenarioSuiteResult;
  onBackToAnalysis?: () => void;
  onInspectProvenance?: (dimension: string, hash?: string) => void;
}

export const OracleWhatIfStudio: React.FC<OracleWhatIfStudioProps> = ({
  payload,
  decisionDNA,
  scenarios,
  onBackToAnalysis,
  onInspectProvenance,
}) => {
  const [params, setParams] = useState<UnifiedWhatIfParameters>({
    monthlyExpenseAdjustment: 0,
    liquidCapitalMultiplier: 1.0,
    weeklyHoursAdjustment: 0,
    expectedIncomeDeltaAdjustment: 0,
  });

  const whatIfResult = useMemo(() => {
    return calculateUnifiedWhatIf(payload, decisionDNA, params);
  }, [payload, decisionDNA, params]);

  const handleReset = () => {
    sound.playClick();
    setParams({
      monthlyExpenseAdjustment: 0,
      liquidCapitalMultiplier: 1.0,
      weeklyHoursAdjustment: 0,
      expectedIncomeDeltaAdjustment: 0,
    });
  };

  const hasAdjustments =
    params.monthlyExpenseAdjustment !== 0 ||
    params.liquidCapitalMultiplier !== 1.0 ||
    params.weeklyHoursAdjustment !== 0 ||
    params.expectedIncomeDeltaAdjustment !== 0;

  // Baseline data extraction
  const baselineRunway = scenarios?.baseCase?.calculations?.runwayMonths;
  const baselineBurn = scenarios?.baseCase?.calculations?.monthlyBurn;
  const upfrontCap = payload?.financial?.requiredUpfrontCapital?.value ?? 0;
  const liquidCap = payload?.financial?.availableLiquidCapital?.value ?? 0;
  const availableHours = payload?.resources?.availableWeeklyHours?.value ?? 0;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-[11px] font-mono uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Deterministic Sensitivity Studio</span>
          </div>
          <h2 className="text-2xl font-light text-[#F1F5F9] tracking-tight">
            What-If Sensitivity Analysis
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed font-sans">
            Explore how changing an input alters the modeled deterministic analysis.
            Under altered input parameters, ORACLE evaluates mathematical sensitivity without probabilistic claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasAdjustments && (
            <OracleButton
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset to Current Analysis
            </OracleButton>
          )}
          {onBackToAnalysis && (
            <OracleButton
              variant="secondary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5 rotate-180" />}
              onClick={onBackToAnalysis}
            >
              Return to Analysis
            </OracleButton>
          )}
        </div>
      </div>

      {/* Epistemic Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 flex items-start gap-3 text-xs text-[#94A3B8]">
        <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div>
          <span className="font-mono text-[#F1F5F9] font-medium block text-[11px] uppercase tracking-wider">
            Sensitivity Boundary
          </span>
          <p className="leading-relaxed font-sans mt-0.5">
            This studio demonstrates how the mathematical model responds to hypothetical input changes.
            It does not forecast future events or calculate likelihoods.
          </p>
        </div>
      </div>

      {/* Main Studio Grid: Inputs vs Model Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controlled Input Adjustments (5 cols) */}
        <div className="lg:col-span-5 space-y-6 rounded-2xl bg-[#11141A] border border-white/8 p-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Adjustable Model Inputs</span>
            </h3>
            <span className="text-[10px] font-mono text-[#64748B]">
              {hasAdjustments ? "Adjusted" : "Baseline"}
            </span>
          </div>

          {/* Control 1: Monthly Expense Adjustment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Monthly Expense Delta:</span>
              <span
                className={
                  params.monthlyExpenseAdjustment > 0
                    ? "text-[#F87171] font-bold"
                    : params.monthlyExpenseAdjustment < 0
                    ? "text-[#34D399] font-bold"
                    : "text-[#F1F5F9]"
                }
              >
                {params.monthlyExpenseAdjustment > 0
                  ? `+$${params.monthlyExpenseAdjustment.toLocaleString()}/mo`
                  : params.monthlyExpenseAdjustment < 0
                  ? `-$${Math.abs(params.monthlyExpenseAdjustment).toLocaleString()}/mo`
                  : "$0 (Baseline)"}
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-3000"
                max="3000"
                step="100"
                aria-label="Adjust monthly expenses delta"
                value={params.monthlyExpenseAdjustment}
                onChange={(e) =>
                  setParams({
                    ...params,
                    monthlyExpenseAdjustment: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/50"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>-$3,000 (Frugal)</span>
              <span>Baseline</span>
              <span>+$3,000 (Expanded)</span>
            </div>
          </div>

          {/* Control 2: Liquid Capital Buffer Multiplier */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Liquid Capital Buffer:</span>
              <span
                className={
                  params.liquidCapitalMultiplier > 1
                    ? "text-[#34D399] font-bold"
                    : params.liquidCapitalMultiplier < 1
                    ? "text-[#FBBF24] font-bold"
                    : "text-[#F1F5F9]"
                }
              >
                {params.liquidCapitalMultiplier.toFixed(2)}x Baseline
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                aria-label="Adjust liquid capital buffer multiplier"
                value={params.liquidCapitalMultiplier}
                onChange={(e) =>
                  setParams({
                    ...params,
                    liquidCapitalMultiplier: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/50"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>0.50x (-50% reserves)</span>
              <span>1.0x (Current)</span>
              <span>2.00x (+100% reserves)</span>
            </div>
          </div>

          {/* Control 3: Expected Monthly Income Delta */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Income Delta Adjustment:</span>
              <span
                className={
                  params.expectedIncomeDeltaAdjustment > 0
                    ? "text-[#34D399] font-bold"
                    : params.expectedIncomeDeltaAdjustment < 0
                    ? "text-[#F87171] font-bold"
                    : "text-[#F1F5F9]"
                }
              >
                {params.expectedIncomeDeltaAdjustment > 0
                  ? `+$${params.expectedIncomeDeltaAdjustment.toLocaleString()}/mo`
                  : params.expectedIncomeDeltaAdjustment < 0
                  ? `-$${Math.abs(params.expectedIncomeDeltaAdjustment).toLocaleString()}/mo`
                  : "$0 (Baseline)"}
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-3000"
                max="5000"
                step="250"
                aria-label="Adjust monthly income delta"
                value={params.expectedIncomeDeltaAdjustment}
                onChange={(e) =>
                  setParams({
                    ...params,
                    expectedIncomeDeltaAdjustment: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/50"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>-$3,000/mo</span>
              <span>$0</span>
              <span>+$5,000/mo</span>
            </div>
          </div>

          {/* Control 4: Weekly Available Hours Adjustment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">Weekly Hours Allocation:</span>
              <span
                className={
                  params.weeklyHoursAdjustment > 0
                    ? "text-[#34D399] font-bold"
                    : params.weeklyHoursAdjustment < 0
                    ? "text-[#FBBF24] font-bold"
                    : "text-[#F1F5F9]"
                }
              >
                {params.weeklyHoursAdjustment > 0
                  ? `+${params.weeklyHoursAdjustment} hrs/wk`
                  : params.weeklyHoursAdjustment < 0
                  ? `${params.weeklyHoursAdjustment} hrs/wk`
                  : "0 hrs/wk (Baseline)"}
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-20"
                max="30"
                step="2"
                aria-label="Adjust weekly hours allocation"
                value={params.weeklyHoursAdjustment}
                onChange={(e) =>
                  setParams({
                    ...params,
                    weeklyHoursAdjustment: Number(e.target.value),
                  })
                }
                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#38BDF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]/50"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
              <span>-20 hrs (Constrained)</span>
              <span>Baseline</span>
              <span>+30 hrs (Full Focus)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Deterministic Model Response (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Comparison Panel */}
          <div className="rounded-2xl bg-[#11141A] border border-white/8 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#38BDF8]/10 text-[#38BDF8]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider">
                  Deterministic Model Response
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">
                SERVER-EVALUATED
              </span>
            </div>

            {/* Metric Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Calculated Runway Metric */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                  Model Runway Response
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-[#F1F5F9]">
                    {whatIfResult.adjustedRunwayMonths !== undefined
                      ? `${whatIfResult.adjustedRunwayMonths} mo`
                      : "Self-Sustaining"}
                  </span>
                  {whatIfResult.originalRunwayMonths !== undefined && (
                    <span className="text-xs font-mono text-[#64748B] line-through">
                      {whatIfResult.originalRunwayMonths} mo
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono flex items-center gap-1.5 pt-1">
                  {whatIfResult.isRunwayExtended ? (
                    <span className="text-[#34D399] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Extended Buffer
                    </span>
                  ) : whatIfResult.adjustedRunwayMonths !== whatIfResult.originalRunwayMonths ? (
                    <span className="text-[#FBBF24] flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Contracted Buffer
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">Baseline Horizon</span>
                  )}
                </div>
              </div>

              {/* Net Monthly Burn Metric */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
                  Adjusted Net Monthly Cash Flow
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-[#F1F5F9]">
                    {whatIfResult.adjustedNetMonthlyBurn !== undefined
                      ? `$${whatIfResult.adjustedNetMonthlyBurn.toLocaleString()}/mo`
                      : "$0/mo (Surplus)"}
                  </span>
                  {whatIfResult.originalNetMonthlyBurn !== undefined && (
                    <span className="text-xs font-mono text-[#64748B] line-through">
                      ${whatIfResult.originalNetMonthlyBurn.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#64748B] block pt-1">
                  Deterministic net drain
                </span>
              </div>
            </div>

            {/* Model Observations & Impacts */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-bold block">
                  Runway Impact
                </span>
                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  {whatIfResult.runwayImpactDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-bold block">
                  Capital Reserve Coverage
                </span>
                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  {whatIfResult.capitalCoverageImpactDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-bold block">
                  Adjusted Weekly Allocation
                </span>
                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  {whatIfResult.timeGapWeeklyAdjusted !== undefined
                    ? `${whatIfResult.timeGapWeeklyAdjusted} available weekly focus hours modeled.`
                    : "Unspecified weekly time allocation."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
