import React, { useState, useMemo } from 'react';
import { V2DecisionPayload, DecisionDNAV2Result, ScenarioSuiteResult } from '../types/v2';
import { calculateUnifiedWhatIf, UnifiedWhatIfParameters } from '../services/unifiedDecisionEngine';
import { Sliders, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, Shield, Zap } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface UnifiedWhatIfSimulatorProps {
  payload: V2DecisionPayload;
  decisionDNA: DecisionDNAV2Result;
  scenarios: ScenarioSuiteResult;
}

export const UnifiedWhatIfSimulator: React.FC<UnifiedWhatIfSimulatorProps> = ({
  payload,
  decisionDNA,
  scenarios,
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

  return (
    <div className="space-y-8">
      {/* Header & Epistemic Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono uppercase tracking-widest mb-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deterministic Sensitivity Playground</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            Interactive What-If Simulation
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl font-sans">
            Adjust controlled parameters to observe conditional model responses in real time. Outputs represent modeled mathematical sensitivity, not probabilistic forecasts.
          </p>
        </div>

        {hasAdjustments && (
          <button
            onClick={handleReset}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 space-y-6 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Controlled Parameter Adjustments</span>
          </h3>

          {/* Slider 1: Monthly Expenses Adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Monthly Expense Adjustment:</span>
              <span className={params.monthlyExpenseAdjustment > 0 ? "text-red-400 font-bold" : params.monthlyExpenseAdjustment < 0 ? "text-emerald-400 font-bold" : "text-gray-300"}>
                {params.monthlyExpenseAdjustment > 0 ? `+$${params.monthlyExpenseAdjustment.toLocaleString()}/mo` : params.monthlyExpenseAdjustment < 0 ? `-$${Math.abs(params.monthlyExpenseAdjustment).toLocaleString()}/mo` : "$0/mo (Baseline)"}
              </span>
            </div>
            <input
              type="range"
              min="-2000"
              max="3000"
              step="100"
              value={params.monthlyExpenseAdjustment}
              onChange={(e) => setParams({ ...params, monthlyExpenseAdjustment: Number(e.target.value) })}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>-$2,000 (Frugal)</span>
              <span>Baseline</span>
              <span>+$3,000 (Expanded)</span>
            </div>
          </div>

          {/* Slider 2: Liquid Capital Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Liquid Capital Buffer Multiplier:</span>
              <span className={params.liquidCapitalMultiplier > 1 ? "text-emerald-400 font-bold" : params.liquidCapitalMultiplier < 1 ? "text-amber-400 font-bold" : "text-gray-300"}>
                {params.liquidCapitalMultiplier.toFixed(2)}x Baseline
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={params.liquidCapitalMultiplier}
              onChange={(e) => setParams({ ...params, liquidCapitalMultiplier: Number(e.target.value) })}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>0.50x (-50% reserves)</span>
              <span>1.0x (Current)</span>
              <span>2.00x (+100% reserves)</span>
            </div>
          </div>

          {/* Slider 3: Expected Monthly Income Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Expected Monthly Income Delta:</span>
              <span className={params.expectedIncomeDeltaAdjustment > 0 ? "text-emerald-400 font-bold" : params.expectedIncomeDeltaAdjustment < 0 ? "text-red-400 font-bold" : "text-gray-300"}>
                {params.expectedIncomeDeltaAdjustment > 0 ? `+$${params.expectedIncomeDeltaAdjustment.toLocaleString()}/mo` : params.expectedIncomeDeltaAdjustment < 0 ? `-$${Math.abs(params.expectedIncomeDeltaAdjustment).toLocaleString()}/mo` : "$0/mo"}
              </span>
            </div>
            <input
              type="range"
              min="-2000"
              max="5000"
              step="250"
              value={params.expectedIncomeDeltaAdjustment}
              onChange={(e) => setParams({ ...params, expectedIncomeDeltaAdjustment: Number(e.target.value) })}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>-$2,000/mo</span>
              <span>$0</span>
              <span>+$5,000/mo</span>
            </div>
          </div>

          {/* Slider 4: Weekly Available Hours Adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">Weekly Time Allocation Adjustment:</span>
              <span className={params.weeklyHoursAdjustment > 0 ? "text-emerald-400 font-bold" : params.weeklyHoursAdjustment < 0 ? "text-amber-400 font-bold" : "text-gray-300"}>
                {params.weeklyHoursAdjustment > 0 ? `+${params.weeklyHoursAdjustment} hrs/wk` : params.weeklyHoursAdjustment < 0 ? `${params.weeklyHoursAdjustment} hrs/wk` : "0 hrs/wk"}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="2"
              value={params.weeklyHoursAdjustment}
              onChange={(e) => setParams({ ...params, weeklyHoursAdjustment: Number(e.target.value) })}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>-20 hrs (Constrained)</span>
              <span>Baseline</span>
              <span>+30 hrs (Full Focus)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Conditional Model Response */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-cyan-950/20 via-black to-blue-950/20 border border-cyan-500/20 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Calculated Model Response</span>
            </h3>

            {/* Metric Comparison Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] text-gray-400 font-mono uppercase">Calculated Runway</span>
                <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                  <span>{whatIfResult.adjustedRunwayMonths !== undefined ? `${whatIfResult.adjustedRunwayMonths} mo` : 'Self-Sustaining'}</span>
                  {whatIfResult.originalRunwayMonths !== undefined && (
                    <span className="text-xs font-normal text-gray-500 line-through">
                      {whatIfResult.originalRunwayMonths} mo
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono flex items-center gap-1 mt-1">
                  {whatIfResult.isRunwayExtended ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Extended Buffer
                    </span>
                  ) : whatIfResult.adjustedRunwayMonths !== whatIfResult.originalRunwayMonths ? (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Contracted Buffer
                    </span>
                  ) : (
                    <span className="text-gray-400">Baseline Horizon</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[11px] text-gray-400 font-mono uppercase">Net Monthly Burn</span>
                <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
                  <span>{whatIfResult.adjustedNetMonthlyBurn !== undefined ? `$${whatIfResult.adjustedNetMonthlyBurn.toLocaleString()}/mo` : '$0/mo (Surplus)'}</span>
                  {whatIfResult.originalNetMonthlyBurn !== undefined && (
                    <span className="text-xs font-normal text-gray-500 line-through">
                      ${whatIfResult.originalNetMonthlyBurn.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 font-mono block mt-1">
                  Adjusted cash drain
                </span>
              </div>
            </div>

            {/* Narrative Summaries */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1">
                <span className="text-cyan-300 font-bold uppercase text-[10px] tracking-wider block">Runway Impact:</span>
                <p className="text-gray-200">{whatIfResult.runwayImpactDescription}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1">
                <span className="text-cyan-300 font-bold uppercase text-[10px] tracking-wider block">Capital Reserve Status:</span>
                <p className="text-gray-200">{whatIfResult.capitalCoverageImpactDescription}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1">
                <span className="text-cyan-300 font-bold uppercase text-[10px] tracking-wider block">Adjusted Weekly Capacity:</span>
                <p className="text-gray-200">
                  {whatIfResult.timeGapWeeklyAdjusted !== undefined
                    ? `${whatIfResult.timeGapWeeklyAdjusted} available hours per week allocated.`
                    : 'Unspecified time commitment.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
