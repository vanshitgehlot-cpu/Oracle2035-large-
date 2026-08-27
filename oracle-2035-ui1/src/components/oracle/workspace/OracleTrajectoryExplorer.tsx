import React, { useState } from "react";
import {
  ScenarioSuiteResult,
  CanonicalScenarioType,
  ScenarioContract,
  ValueState,
} from "../../../types/v2";
import {
  SlidersHorizontal,
  DollarSign,
  Clock,
  AlertTriangle,
  FileCheck2,
  ChevronDown,
  Hash,
  Activity,
  Layers,
  Table,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
} from "lucide-react";
import { OracleStatus, OracleStatusType } from "../OracleStatus";
import { OracleDisclosure } from "../OracleDisclosure";
import { sound } from "../../../utils/soundEffects";
import { motion, AnimatePresence } from "motion/react";

interface OracleTrajectoryExplorerProps {
  scenarios: ScenarioSuiteResult;
  onInspectProvenance: (name: string, hash: string) => void;
  selectedScenarioType?: CanonicalScenarioType;
  onSelectScenarioType?: (type: CanonicalScenarioType) => void;
  selectedMilestoneId?: string | null;
  onSelectMilestone?: (milestoneId: string | null) => void;
}

export const OracleTrajectoryExplorer: React.FC<OracleTrajectoryExplorerProps> = ({
  scenarios,
  onInspectProvenance,
  selectedScenarioType: externalScenarioType,
  onSelectScenarioType: externalOnSelectScenarioType,
  selectedMilestoneId,
  onSelectMilestone,
}) => {
  const [internalScenarioType, setInternalScenarioType] = useState<CanonicalScenarioType>("BASE_CASE");
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const selectedScenarioType = externalScenarioType || internalScenarioType;
  const handleSelectScenario = (type: CanonicalScenarioType) => {
    sound.playClick();
    if (externalOnSelectScenarioType) {
      externalOnSelectScenarioType(type);
    } else {
      setInternalScenarioType(type);
    }
  };

  const scenarioConfigs: Array<{
    type: CanonicalScenarioType;
    label: string;
    sublabel: string;
    contract: ScenarioContract;
    statusType: OracleStatusType;
    statusLabel: string;
    accentColor: string;
    strokeColor: string;
  }> = [
    {
      type: "BASE_CASE",
      label: "BASE CASE",
      sublabel: "Standard operational conditions with stated baseline assumptions",
      contract: scenarios.baseCase,
      statusType: "baseline",
      statusLabel: "Base Case",
      accentColor: "text-[var(--oracle-action)]",
      strokeColor: "#2457F5",
    },
    {
      type: "UPSIDE_CASE",
      label: "UPSIDE CASE",
      sublabel: "High execution velocity and accelerated target adoption",
      contract: scenarios.upsideCase,
      statusType: "favorable",
      statusLabel: "Upside Case",
      accentColor: "text-[var(--oracle-provenance)]",
      strokeColor: "#356A58",
    },
    {
      type: "DOWNSIDE_STRESS_CASE",
      label: "DOWNSIDE STRESS CASE",
      sublabel: "Adverse market friction, reduced revenue, or elevated runway burn",
      contract: scenarios.downsideStressCase,
      statusType: "stress",
      statusLabel: "Downside Stress Case",
      accentColor: "text-[var(--oracle-risk)]",
      strokeColor: "#AF4B39",
    },
  ];

  const activeConfig = scenarioConfigs.find((c) => c.type === selectedScenarioType) || scenarioConfigs[0];
  const activeContract = activeConfig.contract;
  const calc = activeContract.calculations;

  // Helper to format values respecting ValueState without coercing to zero
  const formatValueState = (
    val: number | undefined,
    state: ValueState | undefined,
    prefix = "$",
    suffix = ""
  ) => {
    if (state === "UNKNOWN") return "Unknown";
    if (state === "NOT_PROVIDED") return "Not provided";
    if (state === "INSUFFICIENT_DATA") return "Insufficient Data";
    if (val === undefined) return "Not specified";
    return `${prefix}${val.toLocaleString()}${suffix}`;
  };

  // Build clean deterministic graph data from server temporal milestones
  const validMilestonesWithCapital = (activeContract.temporalMilestones || []).filter(
    (m) => typeof m.projectedLiquidCapital === "number"
  );

  const hasGraphData = validMilestonesWithCapital.length >= 2;
  const maxHorizon = Math.max(1, activeContract.horizonMonths || 12);

  // Derive bounds for SVG coordinates
  const capitalValues = validMilestonesWithCapital.map((m) => m.projectedLiquidCapital as number);
  const minCap = capitalValues.length > 0 ? Math.min(0, ...capitalValues) : 0;
  const maxCap = capitalValues.length > 0 ? Math.max(1000, ...capitalValues) : 10000;
  const capRange = Math.max(1, maxCap - minCap);

  const svgWidth = 800;
  const svgHeight = 220;
  const padX = 60;
  const padY = 30;

  const points = validMilestonesWithCapital.map((m) => {
    const x = padX + (m.elapsedMonths / maxHorizon) * (svgWidth - padX * 2);
    const y = svgHeight - padY - (((m.projectedLiquidCapital as number) - minCap) / capRange) * (svgHeight - padY * 2);
    return { x, y, milestone: m };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, "")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(svgHeight - padY).toFixed(1)} L ${points[0].x.toFixed(1)} ${(svgHeight - padY).toFixed(1)} Z`
    : "";

  return (
    <section className="space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--oracle-border)] pb-4">
        <div>
          <span className="oracle-technical text-[var(--oracle-action)] block mb-1">CONDITIONAL MODELS</span>
          <h2 className="oracle-display text-4xl leading-none text-[var(--oracle-text-primary)]">Conditional Trajectories</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowComparisonMatrix(!showComparisonMatrix);
            }}
            className={`min-h-[40px] px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
              showComparisonMatrix
                ? "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40"
                : "bg-white/5 text-[#94A3B8] hover:text-[#F1F5F9] border-white/8 hover:border-white/15"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showComparisonMatrix ? "Hide Comparison" : "Compare Scenarios"}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector: Quiet Editorial Rail */}
      <div className="border-b border-[var(--oracle-border)] pb-2">
        <div
          role="tablist"
          aria-label="Conditional Trajectory Scenarios"
          className="flex flex-wrap items-center gap-2 sm:gap-4"
        >
          {scenarioConfigs.map((config) => {
            const isSelected = selectedScenarioType === config.type;
            return (
              <button
                key={config.type}
                role="tab"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelectScenario(config.type)}
                className={`group relative min-h-[48px] px-4 py-2.5 border-b-2 text-xs font-mono transition-all text-left flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--oracle-action-subtle)] text-[var(--oracle-action)] border-[var(--oracle-action)]"
                    : "bg-transparent text-[var(--oracle-text-secondary)] border-transparent hover:border-[var(--oracle-border-strong)] hover:text-[var(--oracle-text-primary)]"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isSelected ? config.strokeColor === "#356A58" ? "bg-[var(--oracle-provenance)]" : config.strokeColor === "#AF4B39" ? "bg-[var(--oracle-risk)]" : "bg-[var(--oracle-action)]" : "bg-[var(--oracle-border-strong)] group-hover:bg-[var(--oracle-text-muted)]"
                  }`}
                />
                <span className="font-medium tracking-wide">{config.label}</span>
                <span className="text-[10px] text-[#64748B] hidden md:inline">
                  • {config.contract.horizonMonths} mo
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="activeTrajectoryIndicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--oracle-action)]"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Comparison Matrix (Conditional View) */}
      <AnimatePresence>
        {showComparisonMatrix && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/8 bg-[#11141A] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-mono font-bold uppercase text-[#F1F5F9] tracking-wider">
                    Difference Between Conditional Paths
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Mathematical sensitivity comparison across modeled operational states
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/8 text-[#64748B] uppercase text-[10px]">
                      <th className="pb-2.5 pr-4">Conditional Path</th>
                      <th className="pb-2.5 px-4">Post-Commit Capital</th>
                      <th className="pb-2.5 px-4">Monthly Net Cash</th>
                      <th className="pb-2.5 px-4">Solvency Runway</th>
                      <th className="pb-2.5 px-4">Weekly Time Gap</th>
                      <th className="pb-2.5 pl-4">Key Risk Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#F1F5F9]/90">
                    {scenarios.comparisonMatrix.scenarios.map((s, idx) => {
                      const isCurrent = s.scenarioType === selectedScenarioType;
                      return (
                        <tr
                          key={idx}
                          onClick={() => handleSelectScenario(s.scenarioType)}
                          className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                            isCurrent ? "bg-white/[0.04]" : ""
                          }`}
                        >
                          <td className="py-3 pr-4 font-bold">
                            <span className={isCurrent ? "text-[#38BDF8]" : "text-[#F1F5F9]"}>
                              {s.scenarioType === "BASE_CASE"
                                ? "Baseline Scenario"
                                : s.scenarioType === "UPSIDE_CASE"
                                ? "Favorable Scenario"
                                : "Stress Scenario"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#F1F5F9]">
                            {s.postCommitmentCapital !== undefined
                              ? `$${s.postCommitmentCapital.toLocaleString()}`
                              : "Not Specified"}
                          </td>
                          <td className="py-3 px-4">
                            {s.monthlyNetCash !== undefined ? (
                              <span className={s.monthlyNetCash < 0 ? "text-[#EF4444]" : "text-[#10B981]"}>
                                {s.monthlyNetCash >= 0 ? "+" : ""}${s.monthlyNetCash.toLocaleString()}/mo
                              </span>
                            ) : (
                              "Not Specified"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {s.runwayMonths === "SURPLUS_OR_NON_BURN"
                              ? "Surplus (Non-Burn)"
                              : s.runwayMonths !== undefined
                              ? `${s.runwayMonths.toFixed(1)} mo`
                              : "Insufficient Data"}
                          </td>
                          <td className="py-3 px-4">
                            {s.weeklyTimeGap !== undefined
                              ? `${s.weeklyTimeGap >= 0 ? "+" : ""}${s.weeklyTimeGap} hrs`
                              : "Balanced"}
                          </td>
                          <td className="py-3 pl-4 text-[#F59E0B] truncate max-w-xs">
                            {s.keyRiskFactor}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {scenarios.comparisonMatrix.divergenceFactors && scenarios.comparisonMatrix.divergenceFactors.length > 0 && (
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-[#64748B]">
                    Observed Input Divergence Factors:
                  </span>
                  {scenarios.comparisonMatrix.divergenceFactors.map((factor, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white/5 border border-white/8 text-[11px] font-mono text-[#94A3B8]"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Trajectory Deep View */}
      <div className="rounded-xl border border-white/8 bg-[#11141A] p-5 sm:p-6 space-y-6">
        {/* Trajectory Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono uppercase tracking-widest ${activeConfig.accentColor}`}>
                {activeConfig.label}
              </span>
              <span className="text-xs font-mono text-[#64748B]">•</span>
              <span className="text-xs font-mono text-[#94A3B8]">
                Horizon: {activeContract.horizonMonths} months
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {activeConfig.sublabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <OracleStatus
              type={activeConfig.statusType}
              label={activeConfig.statusLabel}
              size="sm"
            />
            <button
              type="button"
              onClick={() => onInspectProvenance(activeConfig.label, activeContract.deterministicComputationHash)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-mono text-[#38BDF8] flex items-center gap-1.5 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Audit Hash</span>
            </button>
          </div>
        </div>

        {/* Deterministic Quantitative Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Post-Commit Capital</span>
            <span className="text-sm font-mono font-medium text-[#F1F5F9]">
              {formatValueState(calc.postCommitmentLiquidCapital, calc.postCommitmentLiquidCapitalState)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Monthly Net Cash</span>
            <span
              className={`text-sm font-mono font-medium ${
                calc.monthlyNetCashPosition && calc.monthlyNetCashPosition < 0 ? "text-[#EF4444]" : "text-[#10B981]"
              }`}
            >
              {calc.monthlyNetCashPositionState === "UNKNOWN"
                ? "Unknown"
                : calc.monthlyNetCashPositionState === "NOT_PROVIDED"
                ? "Not provided"
                : calc.monthlyNetCashPosition !== undefined
                ? `${calc.monthlyNetCashPosition >= 0 ? "+" : ""}$${calc.monthlyNetCashPosition.toLocaleString()}/mo`
                : "Not specified"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Solvency Runway</span>
            <span className="text-sm font-mono font-medium text-[#F1F5F9]">
              {calc.runwayStatus === "SURPLUS_OR_NON_BURN"
                ? "Surplus (Non-Burn)"
                : calc.runwayMonths !== undefined
                ? `${calc.runwayMonths.toFixed(1)} mo`
                : "Insufficient Data"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Time Budget Gap</span>
            <span className="text-sm font-mono font-medium text-[#F1F5F9]">
              {calc.weeklyTimeGapState === "UNKNOWN"
                ? "Unknown"
                : calc.weeklyTimeGap !== undefined
                ? `${calc.weeklyTimeGap >= 0 ? "+" : ""}${calc.weeklyTimeGap} hrs gap`
                : "Stated Fit"}
            </span>
          </div>
        </div>

        {/* Deterministic Trajectory Visualization (Clean SVG) */}
        <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Projected Capital Trajectory (Deterministic Milestones)
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              Authoritative server points only • Zero synthetic interpolation
            </span>
          </div>

          {hasGraphData ? (
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-44 sm:h-52 select-none"
              >
                {/* Subtle Gridlines */}
                <line
                  x1={padX}
                  y1={svgHeight - padY}
                  x2={svgWidth - padX}
                  y2={svgHeight - padY}
                  stroke="rgba(23,32,40,0.18)"
                  strokeWidth="1"
                />
                <line
                  x1={padX}
                  y1={padY}
                  x2={padX}
                  y2={svgHeight - padY}
                  stroke="rgba(23,32,40,0.18)"
                  strokeWidth="1"
                />

                {/* Shaded Area under path */}
                <path
                  d={areaD}
                  fill={activeConfig.strokeColor}
                  fillOpacity="0.06"
                />

                {/* Trajectory Path Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={activeConfig.strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Milestone Node Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredPointIndex === idx;
                  const isSelectedMilestone = selectedMilestoneId === p.milestone.milestoneId;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                      onClick={() => {
                        sound.playClick();
                        if (onSelectMilestone) {
                          onSelectMilestone(p.milestone.milestoneId);
                        }
                      }}
                    >
                      {/* Pulse circle for selected or hovered */}
                      {(isHovered || isSelectedMilestone) && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="10"
                          fill={activeConfig.strokeColor}
                          fillOpacity="0.2"
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered || isSelectedMilestone ? "5.5" : "4"}
                        fill="#FFFDF8"
                        stroke={activeConfig.strokeColor}
                        strokeWidth="2"
                      />
                      {/* Month Label */}
                      <text
                        x={p.x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        fill="#59656C"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        M{p.milestone.elapsedMonths}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                <div className="absolute top-2 right-2 border border-[var(--oracle-border-strong)] bg-[var(--oracle-surface)] p-2.5 text-xs font-mono space-y-1 shadow-sm pointer-events-none">
                  <div className="text-[#38BDF8] font-bold">
                    {points[hoveredPointIndex].milestone.label}
                  </div>
                  <div className="text-[#F1F5F9]">
                    Projected Capital: ${points[hoveredPointIndex].milestone.projectedLiquidCapital?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">
                    Trigger: {points[hoveredPointIndex].milestone.triggeringEvent}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center space-y-1.5 border border-dashed border-white/8 rounded-lg">
              <span className="text-xs font-mono text-[#94A3B8] block">
                Insufficient continuous data for full trajectory curve
              </span>
              <p className="text-[11px] text-[#64748B]">
                Discrete calculated checkpoints are available in the temporal timeline below.
              </p>
            </div>
          )}
        </div>

        {/* Applied Constraints & Trigger Conditions Progressive Disclosure */}
        <OracleDisclosure
          title="Applied Constraints & Trigger Conditions"
          subtitle="Specific structural boundaries governing this conditional trajectory"
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Trigger conditions */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8] block">Trigger Conditions</span>
              {activeContract.triggerConditions && activeContract.triggerConditions.length > 0 ? (
                <div className="space-y-1.5">
                  {activeContract.triggerConditions.map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs text-[#F1F5F9]/90 space-y-0.5">
                      <div className="font-mono font-bold text-[11px] text-[#38BDF8]">{t.parameterName} {t.operator} {t.thresholdValue}</div>
                      <p className="text-[11px] text-[#94A3B8]">{t.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#64748B] italic">No custom triggers active</span>
              )}
            </div>

            {/* Active Constraints */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#94A3B8] block">Active Constraints</span>
              {activeContract.activeConstraints && activeContract.activeConstraints.length > 0 ? (
                <div className="space-y-1.5">
                  {activeContract.activeConstraints.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-white/[0.02] border border-white/5 text-xs text-[#F1F5F9]/90 space-y-0.5">
                      <div className="font-mono text-[10px] text-[#F59E0B] uppercase">{c.category} • {c.bindingLevel}</div>
                      <p className="text-[11px] text-[#94A3B8]">{c.statement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#64748B] italic">No binding constraints recorded</span>
              )}
            </div>
          </div>
        </OracleDisclosure>
      </div>
    </section>
  );
};
