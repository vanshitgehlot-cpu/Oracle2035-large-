import React from 'react';
import {
  DataCoverageSummary,
  EvidenceConfidenceClassification,
  EvidenceConfidenceMeasurements,
} from '../../types/v2';
import { Database, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

interface V2DataCoveragePanelProps {
  dataCoverage: DataCoverageSummary;
  evidenceClassification: EvidenceConfidenceClassification;
  evidenceMeasurements: EvidenceConfidenceMeasurements;
}

export const V2DataCoveragePanel: React.FC<V2DataCoveragePanelProps> = ({
  dataCoverage,
  evidenceClassification,
  evidenceMeasurements,
}) => {
  return (
    <div className="space-y-6">
      {/* Explicit Epistemic Boundary Notice (Mandatory Phase 3.8 Rule) */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-mono flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block uppercase tracking-wider">Epistemic Boundary Notice:</strong>
          <p className="leading-relaxed">
            Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PANEL 1: DATA COVERAGE */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Data Coverage</h3>
              <p className="text-xs text-gray-400">How much required information is available.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">Coverage Ratio:</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {(dataCoverage.coverageRatio * 100).toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, dataCoverage.coverageRatio * 100))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block">Required</span>
                <span className="text-sm font-mono font-bold text-white">{dataCoverage.requiredVariableCount}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block">Known</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{dataCoverage.knownVariableCount}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block">Unknown</span>
                <span className="text-sm font-mono font-bold text-amber-400">{dataCoverage.unknownVariableCount}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block">Not Provided</span>
                <span className="text-sm font-mono font-bold text-gray-400">{dataCoverage.notProvidedVariableCount}</span>
              </div>
            </div>

            {dataCoverage.criticalUnknownVariables.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Critical Unknown Variables:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                  {dataCoverage.criticalUnknownVariables.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2: EVIDENCE CONFIDENCE */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">Evidence Confidence</h3>
              <p className="text-xs text-gray-400">How strongly the available evidence is supported.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">Rigor Classification:</span>
              <span className="text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                {evidenceClassification}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Evidence</span>
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {evidenceMeasurements.verifiedExternalCount} / {evidenceMeasurements.totalEvidenceCount}
                </div>
              </div>

              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Heuristic Assumptions</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400">
                  {evidenceMeasurements.heuristicAssumptionCount} / {evidenceMeasurements.totalAssumptionCount}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 text-xs font-mono text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>User Provided Facts:</span>
                <span className="text-white font-bold">{evidenceMeasurements.userProvidedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unverified Assertions:</span>
                <span className="text-rose-400 font-bold">{evidenceMeasurements.unverifiedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Sensitivity Assumptions:</span>
                <span className="text-amber-400 font-bold">{evidenceMeasurements.criticalAssumptionCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
