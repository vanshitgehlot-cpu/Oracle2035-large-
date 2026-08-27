/** Evidence Ledger intake frame: existing draft, stage-navigation, and canonical-submission handlers are retained unchanged. */
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, X } from "lucide-react";
import { V2DecisionPayload } from "../../types/v2";
import { sound } from "../../utils/soundEffects";
import { IntakeFormData, IntakeStageId, INITIAL_INTAKE_STATE, buildCanonicalPayload } from "./intake/types";
import { OracleIntakeProgress } from "./intake/OracleIntakeProgress";
import { OracleDecisionCore } from "./intake/OracleDecisionCore";
import { OracleFinancialReality } from "./intake/OracleFinancialReality";
import { OracleExecutionCapacity } from "./intake/OracleExecutionCapacity";
import { OracleCommitments } from "./intake/OracleCommitments";
import { OracleEvidenceBaseline } from "./intake/OracleEvidenceBaseline";
import { OracleDecisionReview } from "./intake/OracleDecisionReview";
import { OracleStateBadge } from "./OracleInstrumentPrimitives";

export interface OracleIntakeFlowProps {
  onSubmit: (payload: V2DecisionPayload) => void;
  onCancel: () => void;
  serverError?: { code: string; message: string; details?: Array<{ field: string; issue: string }> } | null;
}

const STORAGE_KEY = "oracle_intake_draft_v2";

export const OracleIntakeFlow: React.FC<OracleIntakeFlowProps> = ({ onSubmit, onCancel, serverError }) => {
  const [draftRestored, setDraftRestored] = useState<boolean>(false);
  const [formData, setFormData] = useState<IntakeFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.decisionStatement || parsed.desiredOutcome || parsed.recurringMonthlyExpenses?.value)) return { ...INITIAL_INTAKE_STATE, ...parsed };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_INTAKE_STATE;
  });
  const [currentStage, setCurrentStage] = useState<IntakeStageId>(1);
  const [maxVisitedStage, setMaxVisitedStage] = useState<number>(1);
  const [showDraftBanner, setShowDraftBanner] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.decisionStatement?.trim() || parsed.desiredOutcome?.trim())) {
          setDraftRestored(true);
          setShowDraftBanner(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const updateForm = useCallback((updates: Partial<IntakeFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage quota fallback */ }
      return next;
    });
  }, []);

  const handleClearDraft = () => {
    sound.playClick();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setFormData(INITIAL_INTAKE_STATE);
    setCurrentStage(1);
    setMaxVisitedStage(1);
    setDraftRestored(false);
    setShowDraftBanner(false);
  };

  const handleGoToStage = (stage: IntakeStageId) => {
    sound.playClick();
    if (typeof stage === "number" && stage > maxVisitedStage) setMaxVisitedStage(stage);
    else if (stage === "review") setMaxVisitedStage(5);
    setCurrentStage(stage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (currentStage === 1) handleGoToStage(2);
    else if (currentStage === 2) handleGoToStage(3);
    else if (currentStage === 3) handleGoToStage(4);
    else if (currentStage === 4) handleGoToStage(5);
    else if (currentStage === 5) handleGoToStage("review");
  };

  const handleBack = () => {
    if (currentStage === "review") handleGoToStage(5);
    else if (currentStage === 5) handleGoToStage(4);
    else if (currentStage === 4) handleGoToStage(3);
    else if (currentStage === 3) handleGoToStage(2);
    else if (currentStage === 2) handleGoToStage(1);
    else if (currentStage === 1 && onCancel) onCancel();
  };

  const handleSubmit = () => {
    sound.playClick();
    const payload = buildCanonicalPayload(formData);
    onSubmit(payload);
  };

  const activeStageLabel = currentStage === "review" ? "REVIEW" : `STAGE 0${currentStage}`;
  const activeStageTitle = currentStage === "review" ? "Review & submit" : ["Decision core", "Financial reality", "Execution capacity", "Commitments", "Evidence & baseline"][currentStage - 1];
  const progressLabel = currentStage === "review" ? "06 / 06" : `${String(currentStage).padStart(2, "0")} / 06`;

  const renderStage = (key: string, content: React.ReactNode) => (
    <motion.div key={key} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="oracle-intake-context-bar" aria-label={`Active intake stage: ${activeStageTitle}`}>
          <div className="min-w-0"><span className="oracle-kicker">ACTIVE INSTRUMENT / {activeStageLabel}</span><span className="oracle-intake-context-title">{activeStageTitle}</span></div>
          <div className="flex shrink-0 items-center gap-3"><span className="oracle-technical hidden text-[var(--oracle-text-muted)] sm:inline">{progressLabel}</span><OracleStateBadge state="KNOWN" label="Draft saved locally" compact /></div>
        </div>
      </div>
      {content}
    </motion.div>
  );

  return (
    <div className="oracle-intake-shell flex min-h-[calc(100vh-72px)] w-full flex-1 flex-col bg-[var(--oracle-canvas)] pb-16">
      <OracleIntakeProgress currentStage={currentStage} onSelectStage={handleGoToStage} maxVisitedStage={maxVisitedStage} />
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8"><div className="border-b border-[var(--oracle-border)] pb-3 oracle-technical text-[var(--oracle-text-muted)]">{activeStageLabel} <span className="mx-2 text-[var(--oracle-border-strong)]">/</span> YOUR INPUTS ARE SAVED LOCALLY AS A DRAFT</div></div>

      <AnimatePresence>
        {showDraftBanner && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="mx-auto mt-5 flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-4 border-l-2 border-[var(--oracle-provenance)] bg-[var(--oracle-provenance-bg)] px-4 py-3 text-xs sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="flex min-w-0 items-center gap-3 text-[var(--oracle-provenance)]"><FileText className="h-4 w-4 shrink-0" /><span className="truncate">Draft decision restored from this device/browser.</span><OracleStateBadge state="KNOWN" label="Saved on device" compact /></div>
          <div className="flex shrink-0 items-center gap-3"><button type="button" onClick={handleClearDraft} className="text-[11px] font-bold text-[var(--oracle-provenance)] underline underline-offset-2">Clear draft &amp; start fresh</button><button type="button" onClick={() => setShowDraftBanner(false)} aria-label="Dismiss draft notice" className="grid h-7 w-7 place-items-center text-[var(--oracle-provenance)]"><X className="h-4 w-4" /></button></div>
        </motion.div>}
      </AnimatePresence>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentStage === 1 && renderStage("stage-1", <OracleDecisionCore formData={formData} updateForm={updateForm} onNext={handleNext} onCancel={onCancel} />)}
          {currentStage === 2 && renderStage("stage-2", <OracleFinancialReality formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} />)}
          {currentStage === 3 && renderStage("stage-3", <OracleExecutionCapacity formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} />)}
          {currentStage === 4 && renderStage("stage-4", <OracleCommitments formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} />)}
          {currentStage === 5 && renderStage("stage-5", <OracleEvidenceBaseline formData={formData} updateForm={updateForm} onNext={handleNext} onBack={handleBack} />)}
          {currentStage === "review" && renderStage("stage-review", <OracleDecisionReview formData={formData} onEditStage={handleGoToStage} onSubmit={handleSubmit} onBack={handleBack} serverError={serverError} />)}
        </AnimatePresence>
      </div>
    </div>
  );
};
