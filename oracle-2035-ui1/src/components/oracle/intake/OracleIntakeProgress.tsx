/** Evidence Ledger intake index: preserves the existing visited-stage and review navigation rules. */
import React from "react";
import { Check } from "lucide-react";
import { IntakeStageId } from "./types";

export interface OracleIntakeProgressProps {
  currentStage: IntakeStageId;
  onSelectStage: (stage: IntakeStageId) => void;
  maxVisitedStage: number;
}

const STAGES: Array<{ id: IntakeStageId; num: string; label: string }> = [
  { id: 1, num: "01", label: "DECISION CORE" },
  { id: 2, num: "02", label: "FINANCIAL REALITY" },
  { id: 3, num: "03", label: "EXECUTION CAPACITY" },
  { id: 4, num: "04", label: "COMMITMENTS" },
  { id: 5, num: "05", label: "EVIDENCE & BASELINE" },
];

export const OracleIntakeProgress: React.FC<OracleIntakeProgressProps> = ({ currentStage, onSelectStage, maxVisitedStage }) => {
  const currentStageMeta = currentStage === "review" ? { label: "Review & submit", num: "06" } : STAGES.find((stage) => stage.id === currentStage) || STAGES[0];

  return (
    <nav aria-label="Intake progress navigation" className="oracle-intake-progress sticky top-[72px] z-30 w-full border-b border-[var(--oracle-border)] bg-[color:rgba(246,243,236,.94)] shadow-[0_8px_20px_rgba(25,35,43,0.04)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto py-3">
          <span className="oracle-technical shrink-0 text-[var(--oracle-text-muted)]">DECISION RECORD</span>
          <span className="h-4 w-px shrink-0 bg-[var(--oracle-border)]" aria-hidden="true" />
          <ol className="flex min-w-max items-stretch gap-1" role="list">
            {STAGES.map((stage) => {
              const isCurrent = currentStage === stage.id;
              const isCompleted = typeof currentStage === "number" ? currentStage > (stage.id as number) : true;
              const isClickable = (stage.id as number) <= maxVisitedStage;
              return (
                <li key={stage.num}>
                  <button
                    type="button"
                    onClick={() => isClickable && onSelectStage(stage.id)}
                    disabled={!isClickable}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${stage.label}: ${isCurrent ? "current stage" : isCompleted ? "completed" : "locked until earlier stages are visited"}`}
                    className={`group flex min-h-[44px] items-center gap-2 border-b-2 px-2.5 text-left text-[10px] font-extrabold tracking-[0.05em] transition-[border-color,color,background-color] duration-150 sm:px-3 ${isCurrent ? "border-[var(--oracle-action)] bg-[var(--oracle-action-subtle)] text-[var(--oracle-action)]" : isCompleted ? "border-transparent text-[var(--oracle-text-secondary)] hover:border-[var(--oracle-border-strong)] hover:bg-[var(--oracle-surface)] hover:text-[var(--oracle-text-primary)]" : "border-transparent text-[var(--oracle-text-muted)] opacity-55"}`}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[9px] ${isCurrent ? "border border-[var(--oracle-action)] bg-[var(--oracle-action)] text-white" : isCompleted ? "border border-[var(--oracle-provenance-border)] bg-[var(--oracle-provenance-bg)] text-[var(--oracle-provenance)]" : "border border-[var(--oracle-border)]"}`}>
                      {isCompleted && !isCurrent ? <Check className="h-3 w-3" /> : stage.num}
                    </span>
                    <span className="hidden whitespace-nowrap lg:inline">{stage.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="ml-auto shrink-0 border-l border-[var(--oracle-border)] pl-2">
            <button
              type="button"
              onClick={() => onSelectStage("review")}
              disabled={maxVisitedStage < 5}
              aria-current={currentStage === "review" ? "step" : undefined}
              className={`min-h-[44px] border-b-2 px-2.5 text-[10px] font-extrabold tracking-[0.06em] transition-colors ${currentStage === "review" ? "border-[var(--oracle-provenance)] text-[var(--oracle-provenance)]" : maxVisitedStage >= 5 ? "border-transparent text-[var(--oracle-text-secondary)] hover:border-[var(--oracle-border-strong)] hover:text-[var(--oracle-text-primary)]" : "border-transparent text-[var(--oracle-text-muted)] opacity-45"}`}
            >
              REVIEW
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--oracle-border-subtle)] py-2.5 sm:hidden" aria-live="polite">
          <span className="oracle-technical text-[var(--oracle-text-muted)]">{currentStageMeta.num} / 06</span>
          <span className="truncate text-xs font-extrabold text-[var(--oracle-text-primary)]">{currentStageMeta.label}</span>
          <span className="oracle-technical shrink-0 text-[var(--oracle-text-muted)]">{maxVisitedStage < 5 ? "IN PROGRESS" : "REVIEW READY"}</span>
        </div>
      </div>
    </nav>
  );
};
