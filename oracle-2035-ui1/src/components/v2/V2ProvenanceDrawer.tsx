import React from 'react';
import {
  DecisionDNAV2Result,
  ScenarioSuiteResult,
  V2NarrativeExplanation,
} from '../../types/v2';
import { Key, ShieldCheck, Hash, Layers, CheckCircle2, X } from 'lucide-react';

interface V2ProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: {
    serverEvaluatedAt: string;
    dnaMethodologyVersion: string;
    scenarioMethodologyVersion: string;
    dnaComputationHash: string;
    scenarioComputationHashes: {
      baseCase: string;
      downsideStressCase: string;
      upsideCase: string;
    };
  };
  highlightDimension?: string | null;
}

export const V2ProvenanceDrawer: React.FC<V2ProvenanceDrawerProps> = ({
  isOpen,
  onClose,
  auditTrail,
  highlightDimension,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#09090B] border-l border-white/10 h-full overflow-y-auto p-6 sm:p-8 space-y-8 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Hash className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">
                Cryptographic Provenance Inspector
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Every calculation in Decision DNA 2.0 and Scenario Engine 2.0 produces an immutable 64-character SHA-256 fingerprint ensuring exact mathematical reproducibility and deterministic invariance.
          </p>

          {/* Individual Hash Registry (Mandatory Phase 3.8 Multi-Hash Rule) */}
          <div className="space-y-4">
            {/* 1. Decision DNA Computation Hash */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">1. Decision DNA 2.0 Hash</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DETERMINISTIC
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-gray-300 break-all select-all">
                {auditTrail.dnaComputationHash}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">
                Methodology: {auditTrail.dnaMethodologyVersion}
              </span>
            </div>

            {/* 2. Base Case Scenario Hash */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-400 font-bold">2. Base Case Scenario Hash</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DETERMINISTIC
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-gray-300 break-all select-all">
                {auditTrail.scenarioComputationHashes.baseCase}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">
                Methodology: {auditTrail.scenarioMethodologyVersion}
              </span>
            </div>

            {/* 3. Downside Stress Case Scenario Hash */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-rose-400 font-bold">3. Downside Stress Case Scenario Hash</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DETERMINISTIC
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-gray-300 break-all select-all">
                {auditTrail.scenarioComputationHashes.downsideStressCase}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">
                Methodology: {auditTrail.scenarioMethodologyVersion}
              </span>
            </div>

            {/* 4. Upside Case Scenario Hash */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">4. Upside Case Scenario Hash</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  DETERMINISTIC
                </span>
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-gray-300 break-all select-all">
                {auditTrail.scenarioComputationHashes.upsideCase}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block">
                Methodology: {auditTrail.scenarioMethodologyVersion}
              </span>
            </div>
          </div>

          {/* Audit Timestamp */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-gray-400 flex items-center justify-between">
            <span>Server Evaluated At:</span>
            <span className="text-white">{new Date(auditTrail.serverEvaluatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          >
            Close Provenance Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
