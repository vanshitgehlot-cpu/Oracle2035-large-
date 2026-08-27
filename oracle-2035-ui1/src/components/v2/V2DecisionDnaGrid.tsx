import React from 'react';
import {
  DecisionDNAV2Result,
  FinancialExposureClassification,
  ReversibilityClassification,
  ResourceFitClassification,
  OpportunityCostClassification,
  UpsidePotentialClassification,
  EvidenceConfidenceClassification,
} from '../../types/v2';
import {
  DollarSign,
  Layers,
  Briefcase,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface V2DecisionDnaGridProps {
  dna: DecisionDNAV2Result;
  onInspectProvenance: (dimensionName: string, computationHash: string) => void;
}

export const V2DecisionDnaGrid: React.FC<V2DecisionDnaGridProps> = ({
  dna,
  onInspectProvenance,
}) => {
  const fin = dna.financialExposure;
  const rev = dna.reversibility;
  const res = dna.resourceFit;
  const opp = dna.opportunityCost;
  const ups = dna.upsidePotential;
  const evi = dna.evidenceConfidence;

  // Helper for classification color tags
  const getClassificationBadge = (classification: string, status: string) => {
    if (status === 'INSUFFICIENT_DATA' || classification === 'INSUFFICIENT_DATA') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (
      classification === 'LOW_EXPOSURE' ||
      classification === 'HIGHLY_REVERSIBLE' ||
      classification === 'STRONG_FIT' ||
      classification === 'LOW_FOREGONE_VALUE' ||
      classification === 'HIGH_ASYMMETRIC_UPSIDE' ||
      classification === 'STRONGLY_EVIDENCED'
    ) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (
      classification === 'CRITICAL_EXPOSURE' ||
      classification === 'SUBSTANTIALLY_IRREVERSIBLE' ||
      classification === 'CRITICAL_DEFICIT' ||
      classification === 'HIGH_FOREGONE_VALUE' ||
      classification === 'NEGLIGIBLE_UPSIDE' ||
      classification === 'UNVERIFIED_ASSERTION'
    ) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white font-mono">
            Decision DNA 2.0 (Six Orthogonal Dimensions)
          </h2>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Methodology: <span className="text-cyan-400">{dna.methodologyVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. FINANCIAL EXPOSURE */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">1. Financial Exposure</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(fin.classification, fin.status)}`}>
                {fin.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {fin.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Runway Duration:</span>
                <span className="text-white font-bold">
                  {fin.measurements.runwayStatus === 'SURPLUS_OR_NON_BURN'
                    ? 'Surplus / Non-Burn'
                    : fin.measurements.runwayMonths !== undefined
                    ? `${fin.measurements.runwayMonths.toFixed(1)} mo`
                    : 'Insufficient Data'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Monthly Burn:</span>
                <span className="text-white font-bold">
                  {fin.measurements.monthlyBurn !== undefined
                    ? `$${fin.measurements.monthlyBurn.toLocaleString()}/mo`
                    : 'Insufficient Data'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Capital Coverage:</span>
                <span className="text-cyan-400 font-bold">
                  {fin.measurements.capitalCoverage !== undefined
                    ? `${(fin.measurements.capitalCoverage * 100).toFixed(0)}%`
                    : fin.measurements.capitalCoverageStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{fin.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Financial Exposure', fin.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>

        {/* 2. REVERSIBILITY */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">2. Reversibility</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(rev.classification, rev.status)}`}>
                {rev.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {rev.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Switching Effort:</span>
                <span className="text-white font-bold">{rev.measurements.switchingEffortLevel || 'Not Stated'}</span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Unwinding Horizon:</span>
                <span className="text-white font-bold">
                  {rev.measurements.unwindingTimeMonths !== undefined
                    ? `${rev.measurements.unwindingTimeMonths} months`
                    : 'Not Stated'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Commitments / Constraints:</span>
                <span className="text-purple-400 font-bold">
                  {rev.measurements.irreversibleCommitmentCount} commitments, {rev.measurements.contractualConstraintCount} constraints
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{rev.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Reversibility', rev.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>

        {/* 3. RESOURCE FIT */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">3. Resource Fit</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(res.classification, res.status)}`}>
                {res.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {res.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Available Capacity:</span>
                <span className="text-white font-bold">
                  {res.measurements.availableWeeklyHours !== undefined
                    ? `${res.measurements.availableWeeklyHours} hrs/wk`
                    : 'Not Provided'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Weekly Time Gap:</span>
                <span className="text-blue-400 font-bold">
                  {res.measurements.weeklyTimeGap !== undefined
                    ? `${res.measurements.weeklyTimeGap > 0 ? '+' : ''}${res.measurements.weeklyTimeGap} hrs/wk`
                    : 'Balanced'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Skills / Network:</span>
                <span className="text-white font-bold">
                  {res.measurements.relevantSkillsCount} skills, {res.measurements.supportNetworkCount} network
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{res.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Resource Fit', res.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>

        {/* 4. OPPORTUNITY COST */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">4. Opportunity Cost</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(opp.classification, opp.status)}`}>
                {opp.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {opp.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Foregone Income:</span>
                <span className="text-white font-bold">
                  {opp.measurements.foregoneIncomeOverHorizon !== undefined
                    ? `$${opp.measurements.foregoneIncomeOverHorizon.toLocaleString()}`
                    : 'Not Quantified'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Alternatives Considered:</span>
                <span className="text-white font-bold">
                  {opp.measurements.alternativesConsideredCount} alternatives
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Foregone Benefits:</span>
                <span className="text-amber-400 font-bold">
                  {opp.measurements.foregoneBenefitsCount} benefits stated
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{opp.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Opportunity Cost', opp.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>

        {/* 5. UPSIDE POTENTIAL */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">5. Upside Potential</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(ups.classification, ups.status)}`}>
                {ups.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {ups.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Monthly Target Delta:</span>
                <span className="text-cyan-400 font-bold">
                  {ups.measurements.userStatedTargetDifferenceMonthly !== undefined
                    ? `+$${ups.measurements.userStatedTargetDifferenceMonthly.toLocaleString()}/mo`
                    : 'Qualitative Stated'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Stated Target Outcome:</span>
                <span className="text-white font-bold truncate max-w-[140px]" title={ups.measurements.userStatedTargetOutcome}>
                  {ups.measurements.userStatedTargetOutcome || 'Qualitative Stated'}
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Horizon:</span>
                <span className="text-white font-bold">{ups.measurements.timeHorizon}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{ups.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Upside Potential', ups.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>

        {/* 6. EVIDENCE CONFIDENCE */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-gray-300 font-bold">6. Evidence Confidence</span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase tracking-wider ${getClassificationBadge(evi.classification, evi.status)}`}>
                {evi.classification}
              </span>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              {evi.semanticDirection}
            </p>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Verified Evidence:</span>
                <span className="text-emerald-400 font-bold">
                  {evi.measurements.verifiedExternalCount} of {evi.measurements.totalEvidenceCount} items
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Active Assumptions:</span>
                <span className="text-white font-bold">
                  {evi.measurements.totalAssumptionCount} ({evi.measurements.heuristicAssumptionCount} heuristics)
                </span>
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Critical Assumptions:</span>
                <span className="text-amber-400 font-bold">
                  {evi.measurements.criticalAssumptionCount} critical
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Status: <strong className="text-white">{evi.status}</strong></span>
            <button
              type="button"
              onClick={() => onInspectProvenance('Evidence Confidence', evi.provenance.formulaOrRuleId)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer underline"
            >
              Provenance →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
