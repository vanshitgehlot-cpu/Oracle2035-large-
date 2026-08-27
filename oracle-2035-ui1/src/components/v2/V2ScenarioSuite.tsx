import React, { useState } from 'react';
import {
  ScenarioSuiteResult,
  CanonicalScenarioType,
  ScenarioContract,
} from '../../types/v2';
import {
  GitCommit,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Clock,
  DollarSign,
  AlertTriangle,
  FileCheck2,
  Table,
} from 'lucide-react';

interface V2ScenarioSuiteProps {
  scenarios: ScenarioSuiteResult;
  onInspectProvenance: (name: string, hash: string) => void;
}

export const V2ScenarioSuite: React.FC<V2ScenarioSuiteProps> = ({
  scenarios,
  onInspectProvenance,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<CanonicalScenarioType>('BASE_CASE');
  const [showMatrix, setShowMatrix] = useState(false);

  const scenarioMap: Record<CanonicalScenarioType, ScenarioContract> = {
    BASE_CASE: scenarios.baseCase,
    DOWNSIDE_STRESS_CASE: scenarios.downsideStressCase,
    UPSIDE_CASE: scenarios.upsideCase,
  };

  const current = scenarioMap[selectedScenario];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-mono">
              Scenario Engine 2.0 (Conditional Trajectories)
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Deterministic conditional models based on explicit mathematical parameters — not probabilistic bets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
              showMatrix
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Comparison Matrix</span>
          </button>
        </div>
      </div>

      {/* Scenario Type Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Base Case Tab */}
        <button
          type="button"
          onClick={() => {
            setSelectedScenario('BASE_CASE');
            setShowMatrix(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedScenario === 'BASE_CASE' && !showMatrix
              ? 'bg-blue-500/15 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-blue-400">BASE CASE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              {scenarios.baseCase.dataSufficiency}
            </span>
          </div>
          <p className="text-xs text-gray-300 font-sans truncate">{scenarios.baseCase.scenarioName}</p>
        </button>

        {/* Downside Stress Case Tab */}
        <button
          type="button"
          onClick={() => {
            setSelectedScenario('DOWNSIDE_STRESS_CASE');
            setShowMatrix(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedScenario === 'DOWNSIDE_STRESS_CASE' && !showMatrix
              ? 'bg-rose-500/15 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-rose-400">DOWNSIDE STRESS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
              {scenarios.downsideStressCase.dataSufficiency}
            </span>
          </div>
          <p className="text-xs text-gray-300 font-sans truncate">{scenarios.downsideStressCase.scenarioName}</p>
        </button>

        {/* Upside Case Tab */}
        <button
          type="button"
          onClick={() => {
            setSelectedScenario('UPSIDE_CASE');
            setShowMatrix(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedScenario === 'UPSIDE_CASE' && !showMatrix
              ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400">UPSIDE CASE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              {scenarios.upsideCase.dataSufficiency}
            </span>
          </div>
          <p className="text-xs text-gray-300 font-sans truncate">{scenarios.upsideCase.scenarioName}</p>
        </button>
      </div>

      {/* Mandatory Scenario Epistemic Label */}
      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2">
        <FileCheck2 className="w-4 h-4 shrink-0" />
        <span>
          <strong>Deterministic Conditional Scenario:</strong> Calculated from explicit mathematical assumptions, not a predictive certainty or probability.
        </span>
      </div>

      {/* Matrix View vs Detailed View */}
      {showMatrix ? (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-x-auto space-y-6">
          <h3 className="text-base font-bold text-white font-mono">Scenario Comparison Matrix</h3>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 pr-4">Scenario</th>
                <th className="pb-3 px-4">Post-Commitment Capital</th>
                <th className="pb-3 px-4">Monthly Net Cash</th>
                <th className="pb-3 px-4">Runway Duration</th>
                <th className="pb-3 px-4">Weekly Time Gap</th>
                <th className="pb-3 pl-4">Key Risk Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {scenarios.comparisonMatrix.scenarios.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-4 font-bold text-white">
                    {s.scenarioType}
                  </td>
                  <td className="py-3.5 px-4 text-cyan-400">
                    {s.postCommitmentCapital !== undefined ? `$${s.postCommitmentCapital.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {s.monthlyNetCash !== undefined ? (
                      <span className={s.monthlyNetCash < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {s.monthlyNetCash < 0 ? '-' : '+'}${Math.abs(s.monthlyNetCash).toLocaleString()}/mo
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.runwayMonths === 'SURPLUS_OR_NON_BURN'
                      ? 'Surplus / Non-Burn'
                      : s.runwayMonths !== undefined
                      ? `${s.runwayMonths} months`
                      : 'N/A'}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.weeklyTimeGap !== undefined ? `${s.weeklyTimeGap > 0 ? '+' : ''}${s.weeklyTimeGap} hrs/wk` : 'Balanced'}
                  </td>
                  <td className="py-3.5 pl-4 text-amber-300 truncate max-w-xs">
                    {s.keyRiskFactor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Divergence Factors */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
              Identified Divergence Factors:
            </span>
            <div className="flex flex-wrap gap-2">
              {scenarios.comparisonMatrix.divergenceFactors.map((f, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Scenario Card */
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                {current.scenarioType} • {current.horizonMonths} MONTH HORIZON
              </div>
              <h3 className="text-2xl font-bold text-white font-mono">{current.scenarioName}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onInspectProvenance(current.scenarioType, current.deterministicComputationHash)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono transition-all cursor-pointer"
              >
                Inspect Hash ({current.deterministicComputationHash.slice(0, 8)}...)
              </button>
            </div>
          </div>

          {/* Quantitative Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400">Monthly Net Cash:</span>
              <div className="text-lg font-bold font-mono">
                {current.calculations.monthlyNetCashPosition !== undefined ? (
                  <span className={current.calculations.monthlyNetCashPosition < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {current.calculations.monthlyNetCashPosition < 0 ? '-' : '+'}${Math.abs(current.calculations.monthlyNetCashPosition).toLocaleString()}/mo
                  </span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">State: {current.calculations.monthlyNetCashPositionState}</span>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400">Runway Duration:</span>
              <div className="text-lg font-bold text-white font-mono">
                {current.calculations.runwayStatus === 'SURPLUS_OR_NON_BURN'
                  ? 'Surplus / Non-Burn'
                  : current.calculations.runwayMonths !== undefined
                  ? `${current.calculations.runwayMonths} months`
                  : 'Insufficient Data'}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">Status: {current.calculations.runwayStatus}</span>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400">Post-Commitment Capital:</span>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {current.calculations.postCommitmentLiquidCapital !== undefined
                  ? `$${current.calculations.postCommitmentLiquidCapital.toLocaleString()}`
                  : 'N/A'}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">State: {current.calculations.postCommitmentLiquidCapitalState}</span>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400">Surplus Accumulation:</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {current.calculations.surplusCapitalAccumulation !== undefined
                  ? `$${current.calculations.surplusCapitalAccumulation.toLocaleString()}`
                  : '$0'}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">State: {current.calculations.surplusCapitalAccumulationState}</span>
            </div>
          </div>

          {/* Temporal Milestones */}
          {current.temporalMilestones && current.temporalMilestones.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
                Calculated Temporal Milestones:
              </span>
              <div className="space-y-2">
                {current.temporalMilestones.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <strong className="text-white">Month {m.elapsedMonths}:</strong>
                      <span className="text-gray-300">{m.label}</span>
                    </div>
                    <span className="text-gray-500 text-[11px]">
                      Trigger: {m.triggeringEvent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applied Assumptions for this Scenario */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
              Applied Scenario Assumptions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.appliedAssumptions.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-cyan-400 font-bold">{a.assumptionId}</span>
                    <span className={`px-2 py-0.5 rounded ${a.isHeuristic ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {a.source}
                    </span>
                  </div>
                  <p className="text-gray-300 font-sans">{a.statement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
