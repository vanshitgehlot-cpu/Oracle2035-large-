import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/soundEffects';
import {
  V2DecisionPayload,
  DecisionCategory,
  TimeHorizon,
  SwitchingEffortLevel,
} from '../../types/v2';
import {
  HelpCircle,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

interface V2DecisionInterviewProps {
  onSubmit: (payload: V2DecisionPayload) => void;
  onCancel: () => void;
  serverError?: { code: string; message: string; details?: Array<{ field: string; issue: string }> } | null;
}

export const V2DecisionInterview: React.FC<V2DecisionInterviewProps> = ({
  onSubmit,
  onCancel,
  serverError,
}) => {
  // 1. Core Decision Context
  const [statement, setStatement] = useState('Resign from Lead Data Engineer role to bootstrap B2B Decision Intelligence SaaS');
  const [category, setCategory] = useState<DecisionCategory>('CAREER_TRANSITION');
  const [situation, setSituation] = useState('Currently employed as Lead Data Engineer with 8 years of distributed systems experience');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('1_TO_3_YEARS');
  const [targetOutcome, setTargetOutcome] = useState('Achieve $15k/mo ARR and financial independence within 24 months');

  // 2. Financial Context
  const [currency, setCurrency] = useState('USD');
  const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState<string>('8500');
  const [recurringExpenses, setRecurringExpenses] = useState<string>('3200');
  const [liquidCapital, setLiquidCapital] = useState<string>('45000');
  const [existingObligations, setExistingObligations] = useState<string>('500');
  const [requiredUpfrontCapital, setRequiredUpfrontCapital] = useState<string>('12000');
  const [expectedIncomeChange, setExpectedIncomeChange] = useState<string>('-8500');

  // 3. Resource Context
  const [availableWeeklyHours, setAvailableWeeklyHours] = useState<string>('50');
  const [experienceYears, setExperienceYears] = useState<string>('8');
  const [relevantSkills, setRelevantSkills] = useState<string>('Full-Stack TypeScript, Distributed Systems, ML Engineering, SaaS Architecture');
  const [supportNetwork, setSupportNetwork] = useState<string>('3 SaaS Founder Mentors, 2 Angel Investors, Technical Community');
  const [physicalAssets, setPhysicalAssets] = useState<string>('Home Office Setup, Dedicated Compute Servers');

  // 4. Reversibility Context
  const [switchingEffort, setSwitchingEffort] = useState<SwitchingEffortLevel>('MEDIUM');
  const [unwindingMonths, setUnwindingMonths] = useState<string>('3');
  const [sunkCosts, setSunkCosts] = useState<string>('12000');
  const [irreversibleCommitments, setIrreversibleCommitments] = useState<string>('Public resignation announcement, Brand formation legal filings');
  const [contractualConstraints, setContractualConstraints] = useState<string>('6-month non-solicitation clause for existing client list');

  // 5. Opportunity Context
  const [primaryOpportunity, setPrimaryOpportunity] = useState('B2B Enterprise Decision Simulation Software SaaS');
  const [alternativesConsidered, setAlternativesConsidered] = useState('Stay at current high-paying role, Transition to part-time consulting');
  const [foregoneBenefits, setForegoneBenefits] = useState('Corporate healthcare matching, Annual equity vesting, Predictable bonus');
  const [opportunityCostSummary, setOpportunityCostSummary] = useState('Foregoing approximately $102k in base salary annually plus career stability');

  // Validation state
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (!statement.trim()) {
      setError('Decision statement is required.');
      return;
    }
    if (!targetOutcome.trim()) {
      setError('Stated target outcome is required.');
      return;
    }

    // Build canonical V2 Decision Payload
    const payload: V2DecisionPayload = {
      decision: {
        decisionStatement: statement.trim(),
        decisionCategory: category,
        currentSituation: situation.trim() || statement.trim(),
        desiredOutcome: targetOutcome.trim() || statement.trim(),
        alternatives: alternativesConsidered.split(',').map(s => s.trim()).filter(Boolean),
        timeHorizon,
      },
      financial: {
        currency,
        currentMonthlyIncome: currentMonthlyIncome ? { value: parseFloat(currentMonthlyIncome), state: 'KNOWN' } : { state: 'UNKNOWN' },
        recurringMonthlyExpenses: recurringExpenses ? { value: parseFloat(recurringExpenses), state: 'KNOWN' } : { state: 'UNKNOWN' },
        availableLiquidCapital: liquidCapital ? { value: parseFloat(liquidCapital), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        existingFinancialObligations: existingObligations ? { value: parseFloat(existingObligations), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        requiredUpfrontCapital: requiredUpfrontCapital ? { value: parseFloat(requiredUpfrontCapital), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        expectedIncomeChangeMonthly: expectedIncomeChange ? { value: parseFloat(expectedIncomeChange), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
      },
      resources: {
        availableWeeklyHours: availableWeeklyHours ? { value: parseFloat(availableWeeklyHours), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        experienceYears: experienceYears ? { value: parseFloat(experienceYears), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        relevantSkills: {
          value: relevantSkills.split(',').map(s => s.trim()).filter(Boolean),
          state: relevantSkills ? 'KNOWN' : 'NOT_PROVIDED',
        },
        availableSupportNetwork: {
          value: supportNetwork.split(',').map(s => s.trim()).filter(Boolean),
          state: supportNetwork ? 'KNOWN' : 'NOT_PROVIDED',
        },
        availablePhysicalAssets: {
          value: physicalAssets.split(',').map(s => s.trim()).filter(Boolean),
          state: physicalAssets ? 'KNOWN' : 'NOT_PROVIDED',
        },
      },
      reversibility: {
        estimatedSwitchingEffort: { value: switchingEffort, state: 'KNOWN' },
        unwindingTimeMonths: unwindingMonths ? { value: parseFloat(unwindingMonths), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        sunkCostsAmount: sunkCosts ? { value: parseFloat(sunkCosts), state: 'KNOWN' } : { state: 'NOT_PROVIDED' },
        irreversibleCommitments: {
          value: irreversibleCommitments.split(',').map(s => s.trim()).filter(Boolean),
          state: irreversibleCommitments ? 'KNOWN' : 'NOT_PROVIDED',
        },
        contractualConstraints: {
          value: contractualConstraints.split(',').map(s => s.trim()).filter(Boolean),
          state: contractualConstraints ? 'KNOWN' : 'NOT_PROVIDED',
        },
      },
      opportunity: {
        primaryOpportunity,
        alternativesConsidered: alternativesConsidered.split(',').map(s => s.trim()).filter(Boolean),
        opportunityCostSummary: { value: opportunityCostSummary, state: 'KNOWN' },
        foregoneBenefits: {
          value: foregoneBenefits.split(',').map(s => s.trim()).filter(Boolean),
          state: foregoneBenefits ? 'KNOWN' : 'NOT_PROVIDED',
        },
      },
      assumptions: [
        {
          id: 'asm_fin_runway_baseline',
          statement: 'Living expenses remain capped at $3,200/mo without inflation spike',
          relatedVariable: 'financial.recurringMonthlyExpenses',
          value: 3200,
          unit: 'USD/mo',
          source: 'USER_STATED',
          confidence: 'HIGH',
          impactIfChanged: 'HIGH',
        },
        {
          id: 'asm_saas_mvp_timeline',
          statement: 'MVP development requires 6 months before initial revenue traction',
          relatedVariable: 'decision.timeHorizon',
          value: 6,
          unit: 'months',
          source: 'DEFAULT_HEURISTIC',
          confidence: 'MEDIUM',
          impactIfChanged: 'HIGH',
        },
      ],
      evidence: [
        {
          id: 'ev_bank_verified_capital',
          sourceType: 'DOCUMENT_UPLOAD',
          description: 'Liquid savings verified in primary checking and treasury accounts',
          verificationStatus: 'VERIFIED_EXTERNAL',
          relevance: 'DIRECT',
          confidenceClassification: 'HIGH',
          supportsVariables: ['financial.availableLiquidCapital'],
        },
      ],
      metadata: {
        clientVersion: '2.0.0-PROD',
        submittedAt: new Date().toISOString(),
      },
    };

    onSubmit(payload);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Deterministic Intake Engine 2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            Decision Context & Parameters
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-sans">
            Provide quantitative boundaries and constraints for authoritative Decision DNA & Scenario evaluation.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          onMouseEnter={() => sound.playHover()}
          className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer self-start sm:self-auto"
        >
          Back to Overview
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Server Error: [{serverError.code}] {serverError.message}</span>
          </div>
          {serverError.details && serverError.details.length > 0 && (
            <ul className="list-disc list-inside space-y-1 pl-2 text-rose-200/90 text-[11px]">
              {serverError.details.map((d, i) => (
                <li key={i}>
                  <strong>{d.field}:</strong> {d.issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Decision */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">1. Decision Statement & Scope</h2>
              <p className="text-xs text-gray-400">Define the core fork, category classification, and planning horizon.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Decision Statement <span className="text-cyan-400">*</span>
              </label>
              <textarea
                rows={2}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                required
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                placeholder="e.g., Leave job to start SaaS company"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                  Category Classification <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DecisionCategory)}
                  className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                >
                  <option value="CAREER_TRANSITION">CAREER_TRANSITION (Professional & Employment)</option>
                  <option value="BUSINESS_STARTUP">BUSINESS_STARTUP (Corporate & Venture)</option>
                  <option value="CAPITAL_ALLOCATION">CAPITAL_ALLOCATION (Investments & Purchases)</option>
                  <option value="RELOCATION_GEO">RELOCATION_GEO (Geographic Shift)</option>
                  <option value="HIGHER_EDUCATION">HIGHER_EDUCATION (Training & Credentials)</option>
                  <option value="PARTNERSHIP_COLLAB">PARTNERSHIP_COLLAB (Partnership & Collaboration)</option>
                  <option value="PRODUCT_STRATEGY">PRODUCT_STRATEGY (Product & Technology)</option>
                  <option value="PERSONAL_LIFESTYLE">PERSONAL_LIFESTYLE (Life & Personal)</option>
                  <option value="STRATEGIC_OTHER">STRATEGIC_OTHER (Strategic General)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                  Planning Time Horizon <span className="text-cyan-400">*</span>
                </label>
                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
                  className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                >
                  <option value="LESS_THAN_6_MONTHS">&lt; 6 Months (Immediate Triage)</option>
                  <option value="6_TO_12_MONTHS">6 – 12 Months (Tactical Horizon)</option>
                  <option value="1_TO_3_YEARS">1 – 3 Years (Strategic Trajectory)</option>
                  <option value="3_TO_5_YEARS">3 – 5 Years (Long-Range Growth)</option>
                  <option value="5_TO_10_YEARS">5 – 10 Years (Multi-Year Evolution)</option>
                  <option value="10_PLUS_YEARS">10+ Years (Decadal Transformation)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Stated Target Outcome <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={targetOutcome}
                onChange={(e) => setTargetOutcome(e.target.value)}
                required
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                placeholder="e.g., $15k/mo ARR and financial independence within 24 months"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial Parameters */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">2. Financial Exposure & Capital Realities</h2>
              <p className="text-xs text-gray-400">Quantitative cash flows for deterministic runway and capital coverage calculations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Current Monthly Income ($)
              </label>
              <input
                type="number"
                value={currentMonthlyIncome}
                onChange={(e) => setCurrentMonthlyIncome(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="8500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Monthly Living Expenses ($)
              </label>
              <input
                type="number"
                value={recurringExpenses}
                onChange={(e) => setRecurringExpenses(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="3200"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Available Liquid Capital ($)
              </label>
              <input
                type="number"
                value={liquidCapital}
                onChange={(e) => setLiquidCapital(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="45000"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Existing Monthly Obligations ($)
              </label>
              <input
                type="number"
                value={existingObligations}
                onChange={(e) => setExistingObligations(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Required Upfront Capital ($)
              </label>
              <input
                type="number"
                value={requiredUpfrontCapital}
                onChange={(e) => setRequiredUpfrontCapital(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="12000"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Expected Income Change ($/mo)
              </label>
              <input
                type="number"
                value={expectedIncomeChange}
                onChange={(e) => setExpectedIncomeChange(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="-8500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Resources & Time */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">3. Resource Capacity & Skills</h2>
              <p className="text-xs text-gray-400">Time commitment capacity and supporting asset inventory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Available Weekly Hours
              </label>
              <input
                type="number"
                value={availableWeeklyHours}
                onChange={(e) => setAvailableWeeklyHours(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Years of Relevant Domain Experience
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="8"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Relevant Core Skills (comma-separated)
              </label>
              <input
                type="text"
                value={relevantSkills}
                onChange={(e) => setRelevantSkills(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                placeholder="e.g. TypeScript, Distributed Systems, ML Engineering"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Support Network / Advisors (comma-separated)
              </label>
              <input
                type="text"
                value={supportNetwork}
                onChange={(e) => setSupportNetwork(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                placeholder="e.g. 3 SaaS Mentors, 2 Angel Investors"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Reversibility & Commitments */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">4. Reversibility & Sunk Costs</h2>
              <p className="text-xs text-gray-400">Lock-in mechanisms, contractual constraints, and switching effort.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Switching Effort Level
              </label>
              <select
                value={switchingEffort}
                onChange={(e) => setSwitchingEffort(e.target.value as SwitchingEffortLevel)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
              >
                <option value="LOW">LOW (Simple rollback)</option>
                <option value="MEDIUM">MEDIUM (Moderate restructuring)</option>
                <option value="HIGH">HIGH (Major organizational cost)</option>
                <option value="PROHIBITIVE">PROHIBITIVE (Irreversible break)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Unwinding Time (Months)
              </label>
              <input
                type="number"
                value={unwindingMonths}
                onChange={(e) => setUnwindingMonths(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="3"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Sunk Costs Amount ($)
              </label>
              <input
                type="number"
                value={sunkCosts}
                onChange={(e) => setSunkCosts(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm font-mono focus:outline-none"
                placeholder="12000"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                Irreversible Commitments (comma-separated)
              </label>
              <input
                type="text"
                value={irreversibleCommitments}
                onChange={(e) => setIrreversibleCommitments(e.target.value)}
                className="w-full bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl p-3 text-white text-sm focus:outline-none"
                placeholder="e.g. Public resignation announcement, Lease agreement signed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="text-xs font-mono text-gray-400">
            Authoritative computation executed strictly server-side with zero probabilistic hallucinations.
          </p>

          <button
            type="submit"
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <span>Execute V2 Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
