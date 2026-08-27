/** Evidence Ledger Stage 01: presentation-only decision record composition. */
import React, { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { DecisionCategory, TimeHorizon } from "../../../types/v2";
import { OracleButton } from "../OracleButton";
import { OracleInput } from "../OracleInput";
import { IntakeFormData } from "./types";

export interface OracleDecisionCoreProps { formData: IntakeFormData; updateForm: (updates: Partial<IntakeFormData>) => void; onNext: () => void; onCancel?: () => void; }

const CATEGORIES: Array<{ value: DecisionCategory; label: string; description: string }> = [
  { value: "CAREER_TRANSITION", label: "Career Transition", description: "Job shift, resignation, starting independent work" },
  { value: "BUSINESS_STARTUP", label: "Business or Startup", description: "Launching or pivoting a venture or commercial product" },
  { value: "CAPITAL_ALLOCATION", label: "Capital Allocation", description: "Substantial investment, acquisition, or asset deployment" },
  { value: "RELOCATION_GEO", label: "Relocation & Geography", description: "Moving cities, changing tax domicile, or remote base" },
  { value: "HIGHER_EDUCATION", label: "Education & Specialization", description: "Degrees, intensive training, or domain retraining" },
  { value: "PARTNERSHIP_COLLAB", label: "Partnership & Co-founding", description: "Entering joint ventures or equity agreements" },
  { value: "PRODUCT_STRATEGY", label: "Product & Operations", description: "Core feature bets, architecture overhauls, or tooling" },
  { value: "PERSONAL_LIFESTYLE", label: "Personal & Lifestyle", description: "Work-life restructuring, sabbatical, or family choices" },
  { value: "STRATEGIC_OTHER", label: "Other Strategic Choice", description: "Custom multi-factor strategic crossroads" },
];

const TIME_HORIZONS: Array<{ value: TimeHorizon; label: string; sub: string }> = [
  { value: "LESS_THAN_6_MONTHS", label: "< 6 Months", sub: "Tactical short-term" },
  { value: "6_TO_12_MONTHS", label: "6–12 Months", sub: "Annual horizon" },
  { value: "1_TO_3_YEARS", label: "1–3 Years", sub: "Medium-term thesis" },
  { value: "3_TO_5_YEARS", label: "3–5 Years", sub: "Compounding cycle" },
  { value: "5_TO_10_YEARS", label: "5–10 Years", sub: "Decade trajectory" },
  { value: "10_PLUS_YEARS", label: "10+ Years", sub: "Generational commitment" },
];

export const OracleDecisionCore: React.FC<OracleDecisionCoreProps> = ({ formData, updateForm, onNext, onCancel }) => {
  const [showAdvanced, setShowAdvanced] = useState(Boolean(formData.currentSituation || formData.alternatives));
  const [error, setError] = useState<string | null>(null);
  const handleContinue = () => {
    if (!formData.decisionStatement.trim()) { setError("Describe the decision you are evaluating so ORACLE can model its financial exposure, execution constraints, and reversibility."); return; }
    if (!formData.desiredOutcome.trim()) { setError("Specify the condition or milestone that defines success so the trajectory engine can measure alignment against your objective."); return; }
    setError(null); onNext();
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-20 lg:px-8">
      <main className="min-w-0">
        <header className="border-b border-[var(--oracle-border)] pb-9">
          <p className="oracle-kicker">01 / The Decision Core</p>
          <h1 className="oracle-display mt-4 max-w-[16ch] text-4xl leading-[1.02] sm:text-5xl">Name the decision before measuring it.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--oracle-text-secondary)]">State the choice in clear terms. This creates the central sentence of the decision record; later stages supply its financial, execution, and reversibility context.</p>
        </header>

        <section className="mt-9 space-y-9" aria-label="Decision core inputs">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-4"><label htmlFor="decision-statement" className="text-[11px] font-extrabold tracking-[0.05em] text-[var(--oracle-text-primary)]">PRIMARY DECISION STATEMENT</label><span className="oracle-technical text-[var(--oracle-text-muted)]">WHAT ORACLE WILL EXAMINE</span></div>
            <textarea id="decision-statement" value={formData.decisionStatement} onChange={(e) => { updateForm({ decisionStatement: e.target.value }); if (error) setError(null); }} placeholder="e.g. Resign from Lead Data Engineer role to bootstrap B2B Decision Intelligence SaaS..." rows={4} className="oracle-display min-h-[150px] w-full resize-y border border-[var(--oracle-border-strong)] bg-[var(--oracle-surface)] p-5 text-2xl leading-[1.25] text-[var(--oracle-text-primary)] placeholder:font-sans placeholder:text-sm placeholder:text-[var(--oracle-text-muted)] focus:border-[var(--oracle-action)] focus:outline-none focus:ring-1 focus:ring-[var(--oracle-action)] sm:text-3xl" />
            <p className="mt-2 text-[11px] leading-5 text-[var(--oracle-text-muted)]">Write the choice as a specific action or commitment, not a general topic.</p>
          </div>

          <div className="border-t border-[var(--oracle-border)] pt-7">
            <label htmlFor="desired-outcome" className="mb-2 block text-[11px] font-extrabold tracking-[0.05em] text-[var(--oracle-text-primary)]">DESIRED OUTCOME</label>
            <p className="mb-3 text-[11px] leading-5 text-[var(--oracle-text-muted)]">Why this matters: the deterministic model needs the condition that defines alignment with your aim.</p>
            <input id="desired-outcome" type="text" value={formData.desiredOutcome} onChange={(e) => { updateForm({ desiredOutcome: e.target.value }); if (error) setError(null); }} placeholder="e.g. Achieve $15k/month ARR and personal financial independence within 24 months" className="w-full border-b border-[var(--oracle-border-strong)] bg-transparent px-0 py-3 text-base text-[var(--oracle-text-primary)] placeholder:text-[var(--oracle-text-muted)] focus:border-[var(--oracle-action)] focus:outline-none" />
          </div>

          <div className="border-t border-[var(--oracle-border)] pt-7">
            <div className="mb-4"><p className="text-[11px] font-extrabold tracking-[0.05em] text-[var(--oracle-text-primary)]">DECISION DOMAIN</p><p className="mt-1 text-[11px] text-[var(--oracle-text-muted)]">Select the context that best describes the structural decision.</p></div>
            <div className="grid divide-y divide-[var(--oracle-border)] border-y border-[var(--oracle-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {CATEGORIES.map((cat) => { const isSelected = formData.decisionCategory === cat.value; return <button key={cat.value} type="button" onClick={() => updateForm({ decisionCategory: cat.value })} className={`min-h-[72px] border-l-2 px-4 py-3 text-left transition-colors ${isSelected ? "border-[var(--oracle-action)] bg-[var(--oracle-action-subtle)]" : "border-transparent hover:bg-[var(--oracle-surface)]"}`}><span className="block text-xs font-extrabold text-[var(--oracle-text-primary)]">{cat.label}</span><span className="mt-1 block text-[10px] leading-4 text-[var(--oracle-text-muted)]">{cat.description}</span></button>; })}
            </div>
          </div>

          <div className="border-t border-[var(--oracle-border)] pt-7">
            <p className="text-[11px] font-extrabold tracking-[0.05em] text-[var(--oracle-text-primary)]">PRIMARY TIME HORIZON</p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1 border-y border-[var(--oracle-border)] py-1 sm:grid-cols-3">
              {TIME_HORIZONS.map((item) => { const isSelected = formData.timeHorizon === item.value; return <button key={item.value} type="button" onClick={() => updateForm({ timeHorizon: item.value })} className={`min-h-[58px] border-l-2 px-3 py-2 text-left ${isSelected ? "border-[var(--oracle-action)] text-[var(--oracle-action)]" : "border-transparent text-[var(--oracle-text-secondary)] hover:border-[var(--oracle-border-strong)] hover:text-[var(--oracle-text-primary)]"}`}><span className="block text-xs font-extrabold">{item.label}</span><span className="mt-1 block text-[10px] text-[var(--oracle-text-muted)]">{item.sub}</span></button>; })}
            </div>
          </div>

          <div className="border-t border-[var(--oracle-border)] pt-6">
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex min-h-[44px] items-center gap-2 text-xs font-bold text-[var(--oracle-text-secondary)] hover:text-[var(--oracle-text-primary)]"><span>{showAdvanced ? "Hide additional context" : "Add current baseline & alternative options (optional)"}</span>{showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
            {showAdvanced && <div className="mt-4 grid gap-5 border-l-2 border-[var(--oracle-border-strong)] pl-4 sm:grid-cols-2"><OracleInput label="Current Situation / Baseline Context" hint="Your present operational and professional position" value={formData.currentSituation} onChange={(e) => updateForm({ currentSituation: e.target.value })} placeholder="e.g. Currently employed with 8 years experience in distributed systems" /><OracleInput label="Alternatives Under Consideration" hint="Comma-separated alternative paths" value={formData.alternatives} onChange={(e) => updateForm({ alternatives: e.target.value })} placeholder="Stay at current role, Transition to part-time consulting" /></div>}
          </div>

          {error && <div className="border-l-2 border-[var(--oracle-risk)] bg-[var(--oracle-risk-bg)] px-4 py-3 text-xs leading-5 text-[var(--oracle-risk)]">{error}</div>}
          <footer className="flex items-center justify-between border-t border-[var(--oracle-border)] pt-8">{onCancel ? <button type="button" onClick={onCancel} className="min-h-[44px] text-xs font-bold text-[var(--oracle-text-secondary)] hover:text-[var(--oracle-text-primary)]">Cancel</button> : <span /> }<OracleButton variant="primary" size="lg" onClick={handleContinue} rightIcon={<ArrowRight className="h-4 w-4" />}>Continue to Financials</OracleButton></footer>
        </section>
      </main>
      <aside className="hidden border-l border-[var(--oracle-border)] pl-6 lg:block"><div className="sticky top-40"><p className="oracle-kicker">Stage intent</p><p className="oracle-display mt-3 text-2xl leading-tight">A precise statement creates a precise record.</p><dl className="mt-7 space-y-5 text-xs leading-5"><div><dt className="font-extrabold text-[var(--oracle-text-primary)]">WHAT</dt><dd className="mt-1 text-[var(--oracle-text-muted)]">The consequential choice under examination.</dd></div><div><dt className="font-extrabold text-[var(--oracle-text-primary)]">WHY</dt><dd className="mt-1 text-[var(--oracle-text-muted)]">The target outcome anchors later structural trade-offs.</dd></div><div><dt className="font-extrabold text-[var(--oracle-text-primary)]">HOW</dt><dd className="mt-1 text-[var(--oracle-text-muted)]">Use concrete actions, boundaries, and time frames.</dd></div></dl></div></aside>
    </div>
  );
};
