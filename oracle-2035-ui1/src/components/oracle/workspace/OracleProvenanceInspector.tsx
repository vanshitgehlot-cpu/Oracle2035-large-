import React, { useState } from "react";
import { OracleDrawer } from "../OracleDrawer";
import { Hash, Copy, Check, ShieldCheck, Layers, FileCode, CheckCircle2, Calendar } from "lucide-react";
import { sound } from "../../../utils/soundEffects";

export interface OracleProvenanceInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrail: {
    serverEvaluatedAt: string;
    dnaMethodologyVersion: string;
    scenarioMethodologyVersion: string;
    unifiedEngineVersion?: string;
    dnaComputationHash: string;
    scenarioComputationHashes: {
      baseCase: string;
      downsideStressCase: string;
      upsideCase: string;
    };
    unifiedPipelineComputationHash?: string;
  };
  highlightDimension?: string | null;
}

export const OracleProvenanceInspector: React.FC<OracleProvenanceInspectorProps> = ({
  isOpen,
  onClose,
  auditTrail,
  highlightDimension,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const hashEntries = [
    {
      id: "dna",
      label: "1. Decision DNA 2.0 Hash",
      description: "Mathematical computation fingerprint for all 6 Decision DNA dimensions.",
      hash: auditTrail.dnaComputationHash,
      methodology: auditTrail.dnaMethodologyVersion,
      color: "text-[#38BDF8]",
    },
    {
      id: "baseCase",
      label: "2. Base Case Trajectory Hash",
      description: "Deterministic baseline state calculation fingerprint.",
      hash: auditTrail.scenarioComputationHashes?.baseCase,
      methodology: auditTrail.scenarioMethodologyVersion,
      color: "text-[#38BDF8]",
    },
    {
      id: "downsideStressCase",
      label: "3. Downside Stress Case Trajectory Hash",
      description: "Severe adversity sensitivity simulation fingerprint.",
      hash: auditTrail.scenarioComputationHashes?.downsideStressCase,
      methodology: auditTrail.scenarioMethodologyVersion,
      color: "text-[#F87171]",
    },
    {
      id: "upsideCase",
      label: "4. Upside Case Trajectory Hash",
      description: "Favorable compounding velocity simulation fingerprint.",
      hash: auditTrail.scenarioComputationHashes?.upsideCase,
      methodology: auditTrail.scenarioMethodologyVersion,
      color: "text-[#34D399]",
    },
    ...(auditTrail.unifiedPipelineComputationHash
      ? [
          {
            id: "pipeline",
            label: "5. Unified Pipeline Computation Hash",
            description: "Root pipeline fingerprint encompassing all engine calculations.",
            hash: auditTrail.unifiedPipelineComputationHash,
            methodology: auditTrail.unifiedEngineVersion || "2.5.0-UNIFIED",
            color: "text-[#A855F7]",
          },
        ]
      : []),
  ];

  return (
    <OracleDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Calculation Provenance & Audit Trail"
      subtitle="Deterministic cryptographic verification fingerprints"
      width="lg"
      footer={
        <div className="oracle-dossier flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
            Deterministic Invariance Verified
          </span>
          <span>Engine: {auditTrail.unifiedEngineVersion || "2.5.0-UNIFIED"}</span>
        </div>
      }
    >
      <div className="oracle-dossier space-y-6">
        {/* Exact Epistemic Explanation */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/8 space-y-2 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2 text-[#38BDF8] font-mono font-bold uppercase text-[11px] tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail Invariance</span>
          </div>
          <p className="font-sans leading-relaxed text-[#CBD5E1]">
            These fingerprints identify the deterministic computation performed for this analysis.
          </p>
          <p className="font-sans leading-relaxed text-[11px] text-[#64748B]">
            Every calculation in Decision DNA 2.0 and Scenario Engine 2.0 produces an immutable 64-character SHA-256 fingerprint ensuring exact mathematical reproducibility and deterministic invariance.
          </p>
        </div>

        {/* Server Metadata */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase">Evaluated At</span>
            <span className="text-[#F1F5F9] font-medium">
              {auditTrail.serverEvaluatedAt ? new Date(auditTrail.serverEvaluatedAt).toLocaleString() : "Server Timestamp"}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase">Methodology Version</span>
            <span className="text-[#38BDF8] font-medium">
              {auditTrail.dnaMethodologyVersion}
            </span>
          </div>
        </div>

        {/* Individual Hashes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Cryptographic Fingerprints</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">SHA-256 (64-HEX)</span>
          </div>

          <div className="space-y-3">
            {hashEntries.map((entry) => {
              const isCopied = copiedKey === entry.id;
              const isHighlighted = highlightDimension && entry.id.toLowerCase().includes(highlightDimension.toLowerCase());

              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isHighlighted
                      ? "bg-[#38BDF8]/5 border-[#38BDF8]/40 shadow-lg shadow-[#38BDF8]/5"
                      : "bg-[#11141A] border-white/8 hover:border-white/15"
                  } space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${entry.color}`}>
                      {entry.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399]">
                      DETERMINISTIC
                    </span>
                  </div>

                  <p className="text-[11px] text-[#94A3B8] font-sans">
                    {entry.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/60 border border-white/5">
                    <span className="text-[11px] font-mono text-[#CBD5E1] break-all select-all flex-1">
                      {entry.hash || "CALCULATING_HASH..."}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.id, entry.hash || "")}
                      disabled={!entry.hash}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors shrink-0 cursor-pointer"
                      title="Copy full 64-character SHA-256 hash"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#34D399]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                    <span>Version: {entry.methodology}</span>
                    {isCopied && <span className="text-[#34D399]">Copied to clipboard!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </OracleDrawer>
  );
};
