import React, { useState } from "react";
import {
  ScenarioSuiteResult,
  CanonicalScenarioType,
  ScenarioContract,
  TemporalMilestone,
  ValueState,
} from "../../../types/v2";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Activity,
  Layers,
  ArrowDown,
  Info,
} from "lucide-react";
import { OracleStatus } from "../OracleStatus";
import { sound } from "../../../utils/soundEffects";
import { motion, AnimatePresence } from "motion/react";

interface OracleTemporalTimelineProps {
  scenarios: ScenarioSuiteResult;
  selectedScenarioType?: CanonicalScenarioType;
  selectedMilestoneId?: string | null;
  onSelectMilestone?: (milestoneId: string | null) => void;
  onInspectProvenance?: (name: string, hash: string) => void;
}

// Canonical standard chronological stages for temporal reference
interface ChronoStage {
  stageId: string;
  stageNumber: string;
  timeLabel: string;
  monthEquivalent: number;
  stageTitle: string;
  temporalPhase: "START" | "EARLY_CONDITIONS" | "COMPOUNDING_EFFECTS" | "LONGER_TERM";
  phaseDescription: string;
}

const CANONICAL_CHRONO_STAGES: ChronoStage[] = [
  {
    stageId: "stage_m1",
    stageNumber: "01",
    timeLabel: "Month 1",
    monthEquivalent: 1,
    stageTitle: "Initial Deployment & Capital Allocation",
    temporalPhase: "START",
    phaseDescription: "Initial commitment, immediate upfront outlay, and operational setup",
  },
  {
    stageId: "stage_m6",
    stageNumber: "02",
    timeLabel: "Month 6",
    monthEquivalent: 6,
    stageTitle: "Near-Term Solvency & Operating Friction",
    temporalPhase: "EARLY_CONDITIONS",
    phaseDescription: "Early burn observation, resource adjustment, and initial execution velocity",
  },
  {
    stageId: "stage_y1",
    stageNumber: "03",
    timeLabel: "Year 1 (Month 12)",
    monthEquivalent: 12,
    stageTitle: "First Annual Checkpoint & Break-Even Evaluation",
    temporalPhase: "EARLY_CONDITIONS",
    phaseDescription: "Assessment of initial return delta against baseline operating expenses",
  },
  {
    stageId: "stage_y3",
    stageNumber: "04",
    timeLabel: "Year 3 (Month 36)",
    monthEquivalent: 36,
    stageTitle: "Compounding Effects & Structural Lock-In",
    temporalPhase: "COMPOUNDING_EFFECTS",
    phaseDescription: "Accumulation of cumulative gains or sustained runway depletion",
  },
  {
    stageId: "stage_y5",
    stageNumber: "05",
    timeLabel: "Year 5 (Month 60)",
    monthEquivalent: 60,
    stageTitle: "Mature Strategic Trajectory",
    temporalPhase: "LONGER_TERM",
    phaseDescription: "Full manifestation of opportunity costs, skill capital, and market posture",
  },
  {
    stageId: "stage_y9",
    stageNumber: "06",
    timeLabel: "Year 9 (Month 108)",
    monthEquivalent: 108,
    stageTitle: "Extended Terminal Horizon",
    temporalPhase: "LONGER_TERM",
    phaseDescription: "Long-range structural baseline and durable institutional position",
  },
];

export const OracleTemporalTimeline: React.FC<OracleTemporalTimelineProps> = ({
  scenarios,
  selectedScenarioType = "BASE_CASE",
  selectedMilestoneId: externalSelectedMilestoneId,
  onSelectMilestone: externalOnSelectMilestone,
  onInspectProvenance,
}) => {
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Record<string, boolean>>({});
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const activeMilestoneId = externalSelectedMilestoneId !== undefined ? externalSelectedMilestoneId : internalSelectedId;

  // Active scenario selection contract
  const activeContract: ScenarioContract =
    selectedScenarioType === "UPSIDE_CASE"
      ? scenarios.upsideCase
      : selectedScenarioType === "DOWNSIDE_STRESS_CASE"
      ? scenarios.downsideStressCase
      : scenarios.baseCase;

  const serverMilestones = activeContract.temporalMilestones || [];
  const horizonMonths = activeContract.horizonMonths || 12;

  // Format ValueState helper
  const formatCapital = (val: number | undefined, state: ValueState | undefined) => {
    if (state === "UNKNOWN") return "Unknown capital";
    if (state === "NOT_PROVIDED") return "Capital not provided";
    if (state === "INSUFFICIENT_DATA") return "Insufficient data";
    if (val === undefined) return "Not specified";
    return `$${val.toLocaleString()}`;
  };

  const toggleExpand = (id: string) => {
    sound.playClick();
    setExpandedMilestoneIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (externalOnSelectMilestone) {
      externalOnSelectMilestone(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#94A3B8] block mb-1">
            CHRONOLOGICAL MILESTONE CHECKPOINTS
          </span>
          <h2 className="text-xl sm:text-2xl font-light text-[#F1F5F9] tracking-tight">
            Temporal Progression
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] font-mono">
          Sequential checkpoints modeled across the {horizonMonths}-month horizon
        </p>
      </div>

      {/* Storytelling Phase Indicator Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
          <span className="text-[10px] text-[#38BDF8] uppercase font-bold block">Phase 1: Start</span>
          <span className="text-[#F1F5F9] font-medium block">Initial Outlay</span>
          <span className="text-[10px] text-[#64748B]">Month 0 – Month 1</span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
          <span className="text-[10px] text-[#38BDF8] uppercase font-bold block">Phase 2: Early Conditions</span>
          <span className="text-[#F1F5F9] font-medium block">Solvency Check</span>
          <span className="text-[10px] text-[#64748B]">Month 1 – Month 12</span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
          <span className="text-[10px] text-[#38BDF8] uppercase font-bold block">Phase 3: Compounding</span>
          <span className="text-[#F1F5F9] font-medium block">Cumulative Delta</span>
          <span className="text-[10px] text-[#64748B]">Year 1 – Year 3</span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
          <span className="text-[10px] text-[#38BDF8] uppercase font-bold block">Phase 4: Long-Term</span>
          <span className="text-[#F1F5F9] font-medium block">Terminal Posture</span>
          <span className="text-[10px] text-[#64748B]">Year 3 – Year 9</span>
        </div>
      </div>

      {/* Temporal Timeline Visual Track */}
      <div className="rounded-xl border border-white/8 bg-[#11141A] p-5 sm:p-7 space-y-8">
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-white/10">
          {/* Server-Provided Deterministic Milestones */}
          {serverMilestones.map((milestone, idx) => {
            const isExpanded = !!expandedMilestoneIds[milestone.milestoneId || `ms_${idx}`];
            const isSelected = activeMilestoneId === milestone.milestoneId;
            const milestoneKey = milestone.milestoneId || `ms_${idx}`;

            return (
              <div
                key={milestoneKey}
                className="relative group transition-all"
              >
                {/* Node Marker Dot */}
                <div
                  className={`absolute -left-[23px] sm:-left-[27px] top-1.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-[#38BDF8] border-[#38BDF8] ring-4 ring-[#38BDF8]/20"
                      : "bg-[#11141A] border-[#38BDF8]/60 group-hover:border-[#38BDF8]"
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Milestone Summary Header Card */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(milestoneKey);
                    }
                  }}
                  onClick={() => toggleExpand(milestoneKey)}
                  className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected || isExpanded
                      ? "bg-[#161B22] border-white/15 shadow-sm"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] text-[10px] font-mono font-bold uppercase">
                          Month {milestone.elapsedMonths}
                        </span>
                        {milestone.isCalculatedDate && (
                          <span className="text-[10px] font-mono text-[#64748B]">
                            • Derived Boundary
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-[#F1F5F9]">
                        {milestone.label}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* One authoritative key metric displayed immediately */}
                      <div className="text-left sm:text-right font-mono">
                        <span className="text-[10px] text-[#64748B] block uppercase">
                          Projected Capital
                        </span>
                        <span className="text-xs font-bold text-[#F1F5F9]">
                          {formatCapital(
                            milestone.projectedLiquidCapital,
                            milestone.projectedLiquidCapitalState
                          )}
                        </span>
                      </div>

                      <div className="p-1 rounded bg-white/5 text-[#94A3B8] shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Milestone Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pt-4 mt-4 border-t border-white/8 space-y-4"
                      >
                        {/* Narrative / Contextual Trigger */}
                        <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1 text-xs font-sans">
                          <span className="text-[10px] font-mono uppercase text-[#38BDF8] font-bold block">
                            Checkpoint Context (Modeled Trajectory)
                          </span>
                          <p className="text-[#94A3B8] leading-relaxed">
                            At this point in the modeled trajectory: {milestone.triggeringEvent}
                          </p>
                        </div>

                        {/* Quantitative Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-[#64748B] uppercase block">
                              Liquid Capital State
                            </span>
                            <span className="text-[#F1F5F9] font-medium">
                              State: {milestone.projectedLiquidCapitalState || "CALCULATED"}
                            </span>
                          </div>

                          {milestone.projectedCumulativeBurn !== undefined && (
                            <div className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1">
                              <span className="text-[10px] text-[#64748B] uppercase block">
                                Cumulative Outlay
                              </span>
                              <span className="text-[#EF4444] font-medium">
                                ${milestone.projectedCumulativeBurn.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Active Constraints at this checkpoint */}
                        {milestone.activeConstraintsAtMilestone && milestone.activeConstraintsAtMilestone.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                              Active Constraints at Month {milestone.elapsedMonths}:
                            </span>
                            <ul className="list-disc list-inside text-xs text-[#94A3B8] space-y-1 pl-1 font-sans">
                              {milestone.activeConstraintsAtMilestone.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
