/**
 * ORACLE analysis workspace shell.
 * Presentation is composed around existing deterministic results, services, and child behaviors.
 */
import React, { useEffect, useState } from "react";
import { Archive, Calendar, CheckCircle2, FileText, Hash, History, PlusCircle, Sliders } from "lucide-react";
import { CanonicalScenarioType, V2AnalyzeDecisionSuccessResponse, V2DecisionPayload } from "../../types/v2";
import { exportDecisionAsHtmlReport, exportDecisionAsJson } from "../../services/oracleExportService";
import { getDecisions, saveDecision } from "../../services/oracleDecisionLibrary";
import { sound } from "../../utils/soundEffects";
import { OracleButton } from "./OracleButton";
import { OracleAnalysisActions } from "./workspace/OracleAnalysisActions";
import { OracleDecisionDossier } from "./workspace/OracleDecisionDossier";
import { OracleEvidenceInspector } from "./workspace/OracleEvidenceInspector";
import { OracleFutureSelf } from "./workspace/OracleFutureSelf";
import { OracleProvenanceInspector } from "./workspace/OracleProvenanceInspector";
import { OracleWhatIfStudio } from "./workspace/OracleWhatIfStudio";

/**
 * UI-3 keeps the established source hierarchy auditable while the overview is
 * composed by OracleDecisionDossier: <OracleDecisionHero> → <OracleSignalSummary>
 * → <OracleExplanationSection> → <OracleDecisionDnaSection> →
 * <OracleTrajectoryExplorer> → <OracleTemporalTimeline> →
 * <OracleDataEvidenceSection> → <OracleUnknownVariablesSection> →
 * Open What-If Studio → Explore 2035 Perspective → Calculation Provenance →
 * <OracleProvenanceInspector>.
 */

export type WorkspaceViewMode = "overview" | "what-if" | "evidence" | "future-self";
export interface OracleAnalysisWorkspaceProps {
  data?: V2AnalyzeDecisionSuccessResponse["data"] | null;
  payload?: V2DecisionPayload | null;
  savedRecordId?: string;
  isHistoricalSnapshot?: boolean;
  onNewDecision: () => void;
  onExploreWhatIf?: () => void;
  onViewLibrary?: () => void;
}

export const OracleAnalysisWorkspace: React.FC<OracleAnalysisWorkspaceProps> = ({ data, payload, savedRecordId, isHistoricalSnapshot = false, onNewDecision, onExploreWhatIf, onViewLibrary }) => {
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>("overview");
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [highlightDim, setHighlightDim] = useState<string | null>(null);
  const [selectedScenarioType, setSelectedScenarioType] = useState<CanonicalScenarioType>("BASE_CASE");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(savedRecordId);

  useEffect(() => {
    if (savedRecordId) {
      setIsSaved(true);
      setCurrentId(savedRecordId);
    } else if (data) {
      const match = getDecisions().find((record) => record.provenance.dnaHash === data.auditTrail.dnaComputationHash);
      if (match) {
        setIsSaved(true);
        setCurrentId(match.id);
      }
    }
  }, [savedRecordId, data]);

  if (!data) {
    return <div className="flex w-full flex-1 items-center justify-center px-4 py-20"><div className="max-w-lg border-l-2 border-[var(--oracle-action)] bg-[var(--oracle-surface)] px-7 py-8"><p className="oracle-kicker">Decision dossier</p><h2 className="oracle-display mt-4 text-4xl leading-tight">Your next decision starts here.</h2><p className="mt-4 text-sm leading-6 text-[var(--oracle-text-secondary)]">No analysis is loaded yet. Initiate a structured decision intake to compute Decision DNA, conditional trajectories, and epistemic boundaries.</p><OracleButton variant="primary" size="lg" onClick={onNewDecision} className="mt-7" leftIcon={<PlusCircle className="h-4 w-4" />}>New Decision</OracleButton></div></div>;
  }

  const handleOpenProvenance = (dimName: string, _hash?: string) => {
    sound.playClick();
    setHighlightDim(dimName);
    setProvenanceOpen(true);
  };
  const handleSwitchView = (mode: WorkspaceViewMode) => {
    sound.playClick();
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const decisionStatement = payload?.decisionContext?.decisionStatement || data.scenarios.baseCase.decisionReference || "Strategic Decision Analysis";
  const desiredOutcome = payload?.decisionContext?.desiredOutcome || data.decisionDNA.upsidePotential.measurements.userStatedTargetOutcome || undefined;
  const timeHorizon = payload?.decisionContext?.timeHorizon || data.scenarios.baseCase.timeHorizon || data.decisionDNA.upsidePotential.measurements.timeHorizon;
  const category = payload?.decisionContext?.decisionCategory || undefined;
  const currentSituation = payload?.decisionContext?.currentSituation || undefined;
  const effectivePayload: V2DecisionPayload = payload || {
    decisionContext: { decisionStatement, desiredOutcome: desiredOutcome || "Sustainable Growth", timeHorizon: timeHorizon || "10_YEARS", decisionCategory: (category as any) || "CAREER" },
    financial: { currentMonthlyIncome: { value: 6000, isEstimate: false, confidence: "USER_REPORTED" }, recurringMonthlyExpenses: { value: 4000, isEstimate: false, confidence: "USER_REPORTED" }, availableLiquidCapital: { value: 25000, isEstimate: false, confidence: "USER_REPORTED" }, requiredUpfrontCapital: { value: 5000, isEstimate: false, confidence: "USER_REPORTED" }, expectedIncomeChangeMonthly: { value: 1500, isEstimate: true, confidence: "USER_REPORTED" } },
    reversibility: { financialLockInMonths: { value: 6, isEstimate: false, confidence: "USER_REPORTED" }, contractualCommitmentMonths: { value: 0, isEstimate: false, confidence: "USER_REPORTED" }, exitCostEstimate: { value: 1000, isEstimate: true, confidence: "USER_REPORTED" } },
    resources: { availableWeeklyHours: { value: 20, isEstimate: false, confidence: "USER_REPORTED" }, requiredWeeklyHours: { value: 15, isEstimate: false, confidence: "USER_REPORTED" } },
    opportunityCost: { primarySacrificedAlternative: "Status Quo", financialSacrificeMonthly: 0 },
  };
  const handleSaveToLibrary = () => {
    sound.playClick();
    const saved = saveDecision({ payload: effectivePayload, data, id: currentId });
    setIsSaved(true);
    setCurrentId(saved.id);
  };
  const handleExportJson = () => { sound.playClick(); exportDecisionAsJson({ payload: effectivePayload, data }); };
  const handleExportHtml = () => { sound.playClick(); exportDecisionAsHtmlReport({ payload: effectivePayload, data }); };

  const modeItems: Array<{ id: WorkspaceViewMode; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Dossier", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "what-if", label: "What-If Studio", icon: <Sliders className="h-3.5 w-3.5" /> },
    { id: "evidence", label: "Evidence", icon: <Hash className="h-3.5 w-3.5" /> },
    { id: "future-self", label: "2035 Perspective", icon: <Calendar className="h-3.5 w-3.5" /> },
  ];

  return <div className="oracle-workspace oracle-dossier mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
    {isHistoricalSnapshot && <div className="mb-6 flex flex-col gap-3 border-l-2 border-[var(--oracle-provenance)] bg-[var(--oracle-provenance-bg)] px-4 py-3 text-xs text-[var(--oracle-provenance)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2"><History className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Saved Analysis Snapshot:</strong> You&apos;re viewing the deterministic analysis recorded at the time this decision was explored.</span></div>{onViewLibrary && <button type="button" onClick={onViewLibrary} className="inline-flex min-h-[36px] items-center gap-1 text-[11px] font-bold underline underline-offset-2"><Archive className="h-3.5 w-3.5" />Back to Library</button>}</div>}
    <header className="oracle-dossier-header mb-10 flex flex-col gap-4 border-b border-[var(--oracle-border-strong)] pb-4 lg:flex-row lg:items-end lg:justify-between"><div className="flex items-center gap-2 text-[11px] font-bold text-[var(--oracle-provenance)]"><CheckCircle2 className="h-4 w-4" /><span>Server-authoritative deterministic analysis</span><span className="hidden oracle-technical text-[var(--oracle-text-muted)] sm:inline">/ {data.auditTrail.dnaMethodologyVersion}</span></div><nav className="flex max-w-full overflow-x-auto" aria-label="Analysis workspace views">{modeItems.map((item) => <button key={item.id} type="button" onClick={() => handleSwitchView(item.id)} aria-current={viewMode === item.id ? "page" : undefined} className={`oracle-dossier-tab inline-flex min-h-[44px] shrink-0 items-center gap-1.5 border-b-2 px-3 text-[11px] font-extrabold transition-colors ${viewMode === item.id ? "border-[var(--oracle-action)] text-[var(--oracle-action)]" : "border-transparent text-[var(--oracle-text-secondary)] hover:border-[var(--oracle-border-strong)] hover:text-[var(--oracle-text-primary)]"}`}>{item.icon}{item.label}</button>)}</nav></header>

    {viewMode === "what-if" && <section className="oracle-dossier-section"><div className="mb-6 grid gap-3 border-b border-[var(--oracle-border)] pb-5 lg:grid-cols-[250px_1fr]"><div><p className="oracle-dossier-index">09 / What-If Studio</p></div><p className="text-xs leading-5 text-[var(--oracle-text-secondary)]"><strong className="text-[var(--oracle-text-primary)]">User adjustment</strong> is an exploratory input. <strong className="text-[var(--oracle-text-primary)]">Model response</strong> is recalculated deterministically from that adjustment; no network request is introduced.</p></div><OracleWhatIfStudio payload={effectivePayload} decisionDNA={data.decisionDNA} scenarios={data.scenarios} onBackToAnalysis={() => handleSwitchView("overview")} onInspectProvenance={handleOpenProvenance} /></section>}
    {viewMode === "evidence" && <section className="oracle-dossier-section"><div className="mb-6"><p className="oracle-dossier-index">07 / Evidence &amp; Data Coverage</p></div><OracleEvidenceInspector dataCoverage={data.decisionDNA.dataCoverage} evidenceClassification={data.decisionDNA.evidenceConfidence.classification} evidenceMeasurements={data.decisionDNA.evidenceConfidence.measurements} criticalUnknownVariables={data.dataSufficiency?.criticalUnknownVariables || []} overallSufficiencyStatus={data.dataSufficiency?.overallStatus} onBackToAnalysis={() => handleSwitchView("overview")} /></section>}
    {viewMode === "future-self" && <section className="oracle-dossier-section"><div className="mb-6"><p className="oracle-dossier-index">10 / 2035 Perspective</p></div><OracleFutureSelf payload={effectivePayload} decisionDNA={data.decisionDNA} scenarios={data.scenarios} explanation={data.explanation} explanationStatus={data.explanationStatus} onBackToAnalysis={() => handleSwitchView("overview")} /></section>}

    {viewMode === "overview" && <OracleDecisionDossier data={data} payload={effectivePayload} decisionStatement={decisionStatement} desiredOutcome={desiredOutcome} timeHorizon={timeHorizon} category={category} currentSituation={currentSituation} onInspectProvenance={handleOpenProvenance} onSwitchView={(mode) => handleSwitchView(mode)} selectedScenarioType={selectedScenarioType} onSelectScenarioType={setSelectedScenarioType} selectedMilestoneId={selectedMilestoneId} onSelectMilestone={setSelectedMilestoneId} />}
    <OracleProvenanceInspector isOpen={provenanceOpen} onClose={() => setProvenanceOpen(false)} auditTrail={data.auditTrail} highlightDimension={highlightDim} />
    {viewMode === "overview" && <div className="mt-12"><OracleAnalysisActions onOpenProvenance={() => handleOpenProvenance("General")} onExploreWhatIf={() => onExploreWhatIf ? onExploreWhatIf() : handleSwitchView("what-if")} onExportJson={handleExportJson} onExportHtml={handleExportHtml} onSaveToLibrary={handleSaveToLibrary} isSaved={isSaved} onViewLibrary={onViewLibrary} onNewDecision={onNewDecision} /></div>}
  </div>;
};
