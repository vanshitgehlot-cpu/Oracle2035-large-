import React from 'react';
import { V2NarrativeExplanation } from '../../types/v2';
import { Sparkles, AlertCircle, HelpCircle, Compass, ShieldAlert } from 'lucide-react';

interface V2ExplanationSectionProps {
  explanation?: V2NarrativeExplanation | null;
  explanationStatus?: 'AVAILABLE' | 'UNAVAILABLE';
}

export const V2ExplanationSection: React.FC<V2ExplanationSectionProps> = ({
  explanation,
  explanationStatus,
}) => {
  if (explanationStatus === 'UNAVAILABLE' || !explanation) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">Explanation Unavailable</h3>
            <p className="text-xs text-gray-400 font-sans">
              AI contextual synthesis is currently unavailable. Deterministic decision analysis remains complete, verified, and unaffected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
      {/* Header with Neutral Model Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">AI Contextual Synthesis & Narrative</h3>
            <p className="text-xs text-cyan-300/80 font-mono">
              AI-generated contextual explanation based on the deterministic server analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-3">
        <h4 className="text-base font-bold text-white font-mono">
          {explanation.executiveSummary.headline}
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed font-sans">
          {explanation.executiveSummary.coreTradeoffSummary}
        </p>
        <p className="text-xs text-cyan-400 font-mono">
          Epistemic Stance: {explanation.executiveSummary.epistemicStatusSummary}
        </p>
      </div>

      {/* Dimensional Narratives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Financial Exposure Narrative</span>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">{explanation.dimensionExplanations.financialExposure}</p>
        </div>

        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-purple-400 font-bold uppercase">Reversibility Narrative</span>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">{explanation.dimensionExplanations.reversibility}</p>
        </div>

        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-blue-400 font-bold uppercase">Resource Fit Narrative</span>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">{explanation.dimensionExplanations.resourceFit}</p>
        </div>

        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-1.5">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase">Opportunity Cost Narrative</span>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">{explanation.dimensionExplanations.opportunityCost}</p>
        </div>
      </div>

      {/* Recommendations / Data Gaps */}
      {explanation.dataGapsAndNextSteps && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {explanation.dataGapsAndNextSteps.recommendedInformationToCollect.length > 0 && (
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <Compass className="w-4 h-4" />
                <span>Recommended Verification Steps:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                {explanation.dataGapsAndNextSteps.recommendedInformationToCollect.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {explanation.assumptionsAudit && explanation.assumptionsAudit.criticalAssumptionsToValidate.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                <HelpCircle className="w-4 h-4" />
                <span>Critical Assumptions to Validate:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                {explanation.assumptionsAudit.criticalAssumptionsToValidate.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Epistemic Disclaimer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-gray-400 text-xs font-mono flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {explanation.epistemicDisclaimer}
        </p>
      </div>
    </div>
  );
};
