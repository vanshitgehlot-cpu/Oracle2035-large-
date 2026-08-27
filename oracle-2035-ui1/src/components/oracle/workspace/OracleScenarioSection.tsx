import React, { useState } from "react";
import {
  ScenarioSuiteResult,
  CanonicalScenarioType,
  ScenarioContract,
} from "../../../types/v2";
import {
  TrendingUp,
  SlidersHorizontal,
  DollarSign,
  Clock,
  AlertTriangle,
  FileCheck2,
  ChevronDown,
  Hash,
  Activity,
  Layers,
} from "lucide-react";
import { OracleStatus, OracleStatusType } from "../OracleStatus";
import { OracleDisclosure } from "../OracleDisclosure";
import { motion, AnimatePresence } from "motion/react";

interface OracleScenarioSectionProps {
  scenarios: ScenarioSuiteResult;
  onInspectProvenance: (name: string, hash: string) => void;
}

export const OracleScenarioSection: React.FC<OracleScenarioSectionProps> = ({
  scenarios,
  onInspectProvenance,
}) => {
  const [selectedScenarioType, setSelectedScenarioType] = useState<CanonicalScenarioType>("BASE_CASE");

  const scenarioConfigs: Array<{
    type: CanonicalScenarioType;
    label: string;
    sublabel: string;
    contract: ScenarioContract;
    statusType: OracleStatusType;
    statusLabel: string;
  }> = [
    {
      type: "BASE_CASE",
      label: "Baseline Scenario",
      sublabel: "Standard operational conditions with stated baseline assumptions",
      contract: scenarios.baseCase,
      statusType: "baseline",
      statusLabel: "Baseline Trajectory",
    },
    {
      type: "UPSIDE_CASE",
      label: "Favorable Scenario",
      sublabel: "High execution velocity and accelerated target adoption",
      contract: scenarios.upsideCase,
      statusType: "favorable",
      statusLabel: "Favorable Trajectory",
    },
    {
      type: "DOWNSIDE_STRESS_CASE",
      label: "Stress Scenario",
      sublabel: "Adverse market friction, reduced revenue, or elevated runway burn",
      contract: scenarios.downsideStressCase,
      statusType: "stress",
      statusLabel: "Stress Trajectory",
    },
  ];

  const activeScenario = scenarioConfigs.find((c) => c.type === selectedScenarioType) || scenarioConfigs[0];
  const activeContract = activeScenario.contract;
  const calc = activeContract.calculations;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/8 pb-3">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#94A3B8] block mb-1">
            DETERMINISTIC PROJECTIONS
          </span>
          <h2 className="text-xl sm:text-2xl font-light text-[#F1F5F9] tracking-tight">
            Conditional Trajectories
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] font-mono">
          Strictly deterministic conditional math • Zero speculative probabilities
        </p>
      </div>

      {/* Editorial 3-Scenario Comparative Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarioConfigs.map((item) => {
          const isSelected = selectedScenarioType === item.type;
          const scCalc = item.contract.calculations;

          const runwayDisplay =
            scCalc.runwayStatus === "SURPLUS_OR_NON_BURN"
              ? "Surplus (Non-Burn)"
              : scCalc.runwayMonths !== undefined
              ? `${scCalc.runwayMonths.toFixed(1)} months`
              : "Insufficient Data";

          const netCashDisplay =
            scCalc.monthlyNetCashPosition !== undefined
              ? `${scCalc.monthlyNetCashPosition >= 0 ? "+" : ""}$${scCalc.monthlyNetCashPosition.toLocaleString()}/mo`
              : "Unspecified";

          return (
            <div
              key={item.type}
              onClick={() => setSelectedScenarioType(item.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedScenarioType(item.type);
                }
              }}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "bg-[#161B22] border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-[#38BDF8]"
                  : "bg-[#11141A] border-white/8 hover:border-white/15"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-[#F1F5F9] uppercase tracking-wider">
                    {item.label}
                  </span>
                  <OracleStatus
                    type={item.statusType}
                    label={item.statusLabel}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                  {item.sublabel}
                </p>
              </div>

              {/* High-level metrics snippet */}
              <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#64748B] block uppercase">Monthly Net</span>
                  <span className={`font-medium ${scCalc.monthlyNetCashPosition && scCalc.monthlyNetCashPosition < 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                    {netCashDisplay}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block uppercase">Runway</span>
                  <span className="text-[#F1F5F9] font-medium truncate block">
                    {runwayDisplay}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Trajectory Detail View */}
      <div className="rounded-xl border border-white/8 bg-[#11141A] p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#38BDF8]">
                Trajectory Blueprint
              </span>
              <span className="text-xs font-mono text-[#64748B]">•</span>
              <span className="text-xs font-mono text-[#94A3B8]">
                Horizon: {activeContract.horizonMonths} months
              </span>
            </div>
            <h3 className="text-lg font-medium text-[#F1F5F9]">
              {activeScenario.label} Analysis
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onInspectProvenance(activeScenario.label, activeContract.deterministicComputationHash)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-mono text-[#38BDF8] flex items-center gap-1.5 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Inspect Hash</span>
            </button>
          </div>
        </div>

        {/* Quantitative Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Post-Commit Capital</span>
            <span className="text-sm font-mono font-medium text-[#F1F5F9]">
              {calc.postCommitmentLiquidCapital !== undefined
                ? `$${calc.postCommitmentLiquidCapital.toLocaleString()}`
                : "Not Specified"}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Monthly Net Cash</span>
            <span className={`text-sm font-mono font-medium ${calc.monthlyNetCashPosition && calc.monthlyNetCashPosition < 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
              {calc.monthlyNetCashPosition !== undefined
                ? `${calc.monthlyNetCashPosition >= 0 ? "+" : ""}$${calc.monthlyNetCashPosition.toLocaleString()}/mo`
                : "Not Specified"}
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
            <span className="text-[10px] font-mono uppercase text-[#64748B] block">Weekly Time Budget</span>
            <span className="text-sm font-mono font-medium text-[#F1F5F9]">
              {calc.weeklyTimeGap !== undefined
                ? `${calc.weeklyTimeGap >= 0 ? "+" : ""}${calc.weeklyTimeGap} hrs gap`
                : "Stated Fit"}
            </span>
          </div>
        </div>

        {/* Temporal Milestones Progressive Disclosure */}
        {activeContract.temporalMilestones && activeContract.temporalMilestones.length > 0 && (
          <OracleDisclosure
            title="Temporal Milestones & Causal Progression"
            subtitle={`${activeContract.temporalMilestones.length} sequential milestone checkpoints modeled across horizon`}
            defaultOpen={false}
          >
            <div className="space-y-3 pt-2">
              {activeContract.temporalMilestones.map((m, idx) => (
                <div
                  key={m.milestoneId || idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="px-2 py-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] text-[11px] font-mono font-bold shrink-0">
                    Month {m.elapsedMonths}
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-medium text-[#F1F5F9] block">{m.label}</span>
                    <p className="text-[11px] text-[#94A3B8]">{m.triggeringEvent}</p>
                    {m.projectedLiquidCapital !== undefined && (
                      <span className="text-[10px] font-mono text-[#64748B] block">
                        Projected Capital: ${m.projectedLiquidCapital.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </OracleDisclosure>
        )}

        {/* Applied Assumptions & Constraints Progressive Disclosure */}
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
