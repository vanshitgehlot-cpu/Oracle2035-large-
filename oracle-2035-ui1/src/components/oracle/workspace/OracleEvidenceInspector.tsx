import React, { useState } from "react";
import {
  DataCoverageSummary,
  EvidenceConfidenceClassification,
  EvidenceConfidenceMeasurements,
  EvidenceItem,
  AssumptionItem,
} from "../../../types/v2";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  ExternalLink,
  Layers,
  Search,
} from "lucide-react";
import { OracleStatus, OracleStatusType } from "../OracleStatus";
import { OracleButton } from "../OracleButton";
import { sound } from "../../../utils/soundEffects";

export interface OracleEvidenceInspectorProps {
  dataCoverage: DataCoverageSummary;
  evidenceClassification: EvidenceConfidenceClassification;
  evidenceMeasurements: EvidenceConfidenceMeasurements;
  evidenceList?: EvidenceItem[];
  assumptionsList?: AssumptionItem[];
  criticalUnknownVariables?: string[];
  overallSufficiencyStatus?: string;
  onBackToAnalysis?: () => void;
}

export const OracleEvidenceInspector: React.FC<OracleEvidenceInspectorProps> = ({
  dataCoverage,
  evidenceClassification,
  evidenceMeasurements,
  evidenceList = [],
  assumptionsList = [],
  criticalUnknownVariables = [],
  overallSufficiencyStatus,
  onBackToAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "evidence" | "assumptions" | "unknowns">("all");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const getEvidenceStatusType = (classification: string): OracleStatusType => {
    if (classification === "STRONGLY_EVIDENCED") return "favorable";
    if (classification === "MODERATELY_EVIDENCED") return "baseline";
    if (classification === "ASSUMPTION_HEAVY" || classification === "UNVERIFIED_ASSERTION") return "attention";
    return "unknown";
  };

  const getVerificationStatusType = (status: string): OracleStatusType => {
    if (status === "VERIFIED_EXTERNAL") return "favorable";
    if (status === "USER_PROVIDED") return "baseline";
    return "attention";
  };

  const coveragePct = Math.round(dataCoverage.coverageRatio * 100);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/8 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-[11px] font-mono uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Epistemic Evidence & Assumptions Inspector</span>
          </div>
          <h2 className="text-2xl font-light text-[#F1F5F9] tracking-tight">
            Evidence Quality & Assumptions
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed font-sans">
            Inspect the grounding verification depth, active heuristic assumptions, and epistemic boundaries underlying this decision analysis.
          </p>
        </div>

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

      {/* Mandatory Epistemic Boundary Notice */}
      <div className="p-4 rounded-xl bg-[#38BDF8]/5 border border-[#38BDF8]/20 text-xs text-[#94A3B8] flex items-start gap-3.5">
        <ShieldCheck className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono text-[#F1F5F9] font-bold block text-[11px] uppercase tracking-wider">
            Epistemic Boundary Notice
          </span>
          <p className="leading-relaxed font-sans">
            Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct.
          </p>
        </div>
      </div>

      {/* High-Level Evidence Quality & Data Coverage Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Classification */}
        <div className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-2">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Evidence Classification
          </span>
          <OracleStatus
            type={getEvidenceStatusType(evidenceClassification)}
            label={evidenceClassification.replace(/_/g, " ")}
            size="md"
          />
          <span className="text-[11px] text-[#94A3B8] block pt-1">
            Verification rigor profile
          </span>
        </div>

        {/* Card 2: Grounded Evidence Count */}
        <div className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-1">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Grounded Evidence Records
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#F1F5F9]">
              {evidenceMeasurements.totalEvidenceCount || 0}
            </span>
            <span className="text-xs font-mono text-[#34D399]">
              ({evidenceMeasurements.verifiedExternalCount || 0} external)
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] block">
            {evidenceMeasurements.userProvidedCount || 0} user-provided records
          </span>
        </div>

        {/* Card 3: Active Assumptions */}
        <div className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-1">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Active Assumptions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#FBBF24]">
              {evidenceMeasurements.totalAssumptionCount || 0}
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">
              ({evidenceMeasurements.heuristicAssumptionCount || 0} heuristic)
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] block">
            Assumed premises under review
          </span>
        </div>

        {/* Card 4: Data Coverage */}
        <div className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-1">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            Intake Data Coverage
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#38BDF8]">
              {coveragePct}%
            </span>
            <span className="text-xs font-mono text-[#64748B]">
              ({dataCoverage.knownVariableCount}/{dataCoverage.requiredVariableCount})
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] block">
            {dataCoverage.unknownVariableCount} unknown, {dataCoverage.notProvidedVariableCount} unprovided
          </span>
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-3 text-xs font-mono">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab("all");
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "all"
              ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold"
              : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
          }`}
        >
          All Items ({evidenceList.length + assumptionsList.length + criticalUnknownVariables.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab("evidence");
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "evidence"
              ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold"
              : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
          }`}
        >
          Evidence ({evidenceList.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab("assumptions");
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "assumptions"
              ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold"
              : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
          }`}
        >
          Assumptions ({assumptionsList.length})
        </button>
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab("unknowns");
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "unknowns"
              ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 font-bold"
              : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
          }`}
        >
          Unknown Data ({criticalUnknownVariables.length})
        </button>
      </div>

      {/* Inspection Sections */}
      <div className="space-y-8">
        {/* SECTION 1: GROUNDED EVIDENCE RECORDS */}
        {(activeTab === "all" || activeTab === "evidence") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                <span>Grounded Evidence Records</span>
              </h3>
              <span className="text-xs font-mono text-[#64748B]">
                {evidenceList.length} items recorded
              </span>
            </div>

            {evidenceList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evidenceList.map((item, idx) => (
                  <div
                    key={item.id || item.evidenceId || idx}
                    className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-3 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono text-[#38BDF8] font-bold">
                        {item.id || item.evidenceId || `EV-${idx + 1}`}
                      </span>
                      <OracleStatus
                        type={getVerificationStatusType(item.verificationStatus || item.sourceVerificationStatus || "USER_PROVIDED")}
                        label={(item.verificationStatus || item.sourceVerificationStatus || "USER_PROVIDED").replace(/_/g, " ")}
                        size="sm"
                      />
                    </div>

                    <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#64748B]">
                      <span>
                        Source: <strong className="text-[#94A3B8]">{item.sourceType || "User Statement"}</strong>
                      </span>
                      {item.supportsVariables && item.supportsVariables.length > 0 && (
                        <span>Supports: {item.supportsVariables.join(", ")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#11141A] border border-white/8 text-center text-xs text-[#94A3B8] space-y-1">
                <p>No standalone evidence records were provided during intake.</p>
                <p className="text-[#64748B]">
                  Analysis is grounded in direct user statements and verified financial baselines.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: ACTIVE ASSUMPTIONS */}
        {(activeTab === "all" || activeTab === "assumptions") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FBBF24]" />
                <span>Active Model Assumptions</span>
              </h3>
              <span className="text-xs font-mono text-[#64748B]">
                {assumptionsList.length} assumptions tracked
              </span>
            </div>

            {assumptionsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assumptionsList.map((asm, idx) => (
                  <div
                    key={asm.id || asm.assumptionId || idx}
                    className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-3 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono text-[#FBBF24] font-bold">
                        {asm.id || asm.assumptionId || `ASM-${idx + 1}`}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          asm.isHeuristic
                            ? "bg-[#64748B]/10 text-[#94A3B8] border-[#64748B]/20"
                            : "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20"
                        }`}
                      >
                        {asm.isHeuristic ? "DEFAULT HEURISTIC" : "USER ASSERTION"}
                      </span>
                    </div>

                    <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                      {asm.statement}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#64748B]">
                      <span>
                        Impact: <strong className="text-[#FBBF24]">{asm.impactLevel || asm.impactIfChanged || "MODERATE"}</strong>
                      </span>
                      {asm.relatedVariable && (
                        <span>Variable: {asm.relatedVariable}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#11141A] border border-white/8 text-center text-xs text-[#94A3B8] space-y-1">
                <p>No explicit user assumptions were logged.</p>
                <p className="text-[#64748B]">
                  Model utilizes standard conservative financial heuristics for unspecified growth deltas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: UNKNOWN & INCOMPLETE DATA BOUNDARIES */}
        {(activeTab === "all" || activeTab === "unknowns") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#94A3B8]" />
                <span>Epistemic Incomplete Data Boundaries</span>
              </h3>
              <span className="text-xs font-mono text-[#64748B]">
                UNKNOWN ≠ Assumption
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#11141A] border border-white/8 space-y-3">
              <p className="text-xs text-[#94A3B8] font-sans leading-relaxed">
                ORACLE maintains strict semantic separation between what is assumed versus what is unknown.
                Missing variables (<strong className="text-[#F1F5F9]">UNKNOWN</strong> or <strong className="text-[#F1F5F9]">NOT_PROVIDED</strong>) are never silently coerced into assumptions or zero values.
              </p>

              {criticalUnknownVariables.length > 0 ? (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-mono text-[#F87171] font-bold block uppercase">
                    Critical Missing Variables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {criticalUnknownVariables.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-[#CBD5E1] flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-[#34D399] pt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No critical blocking variables missing from current context.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
