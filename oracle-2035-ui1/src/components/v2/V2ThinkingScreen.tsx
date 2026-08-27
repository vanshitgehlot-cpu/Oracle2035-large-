import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/soundEffects';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { V2DecisionPayload, V2AnalyzeDecisionSuccessResponse } from '../../types/v2';
import { analyzeDecisionV2 } from '../../services/v2ApiClient';

interface V2ThinkingScreenProps {
  payload: V2DecisionPayload;
  onSuccess: (data: V2AnalyzeDecisionSuccessResponse['data']) => void;
  onError: (error: { code: string; message: string; details?: Array<{ field: string; issue: string }> }) => void;
}

export const V2ThinkingScreen: React.FC<V2ThinkingScreenProps> = ({
  payload,
  onSuccess,
  onError,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    '01 Validating decision',
    '02 Evaluating structural dimensions',
    '03 Mapping conditional trajectories',
    '04 Building temporal milestones',
    '05 Sealing calculation provenance',
    '06 Preparing analysis',
  ];

  useEffect(() => {
    let active = true;

    const runAnalysis = async () => {
      try {
        sound.playPing();
        const statementText = payload.decision.decisionStatement || '';
        setLogs([`Decision statement: "${statementText.slice(0, 48)}${statementText.length > 48 ? '...' : ''}"`]);

        // Launch API request immediately without artificial delay
        const apiPromise = analyzeDecisionV2(payload);

        // Smoothly progress visual indicators while computation resolves
        const timer1 = setTimeout(() => {
          if (active) {
            setCurrentStep(1);
            setLogs((prev) => [...prev, 'Evaluating 6 orthogonal Decision DNA dimensions...']);
          }
        }, 120);

        const timer2 = setTimeout(() => {
          if (active) {
            setCurrentStep(2);
            setLogs((prev) => [...prev, 'Mapping Baseline, Favorable, and Stress conditional trajectories...']);
          }
        }, 280);

        const timer3 = setTimeout(() => {
          if (active) {
            setCurrentStep(3);
            setLogs((prev) => [...prev, 'Building temporal progression milestones...']);
          }
        }, 440);

        const response = await apiPromise;
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);

        if (!active) return;

        if (response.success && response.data) {
          setCurrentStep(4);
          setLogs((prev) => [...prev, 'Deterministic SHA-256 calculation provenance sealed.']);
          sound.playWarp();

          setCurrentStep(5);
          setLogs((prev) => [...prev, 'Preparing analysis workspace.']);

          // Transition directly to analysis
          onSuccess(response.data);
        } else {
          sound.playClick();
          onError(response.error || {
            code: 'SERVER_ERROR',
            message: 'Server failed to calculate deterministic decision analysis.',
          });
        }
      } catch (err: unknown) {
        sound.playClick();
        const message = err instanceof Error ? err.message : 'Unexpected runtime execution error';
        onError({
          code: 'CLIENT_RUNTIME_ERROR',
          message: `Analysis execution failed: ${message}`,
        });
      }
    };

    runAnalysis();

    return () => {
      active = false;
    };
  }, [payload, onSuccess, onError]);

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16 max-w-xl mx-auto selection:bg-[#38BDF8]/20">
      {/* Calm Status Minimal Badge */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171B24] border border-white/10 text-xs font-mono text-[#94A3B8] mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
        <span>EVALUATION IN PROGRESS</span>
      </motion.div>

      {/* Primary Transition Heading */}
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-light text-[#F1F5F9] tracking-tight">
          {steps[currentStep]}
        </h2>
        <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
          Executing deterministic mathematical models across your provided financial, capacity, and commitment constraints.
        </p>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#11141A] border border-white/8 rounded-2xl p-6 mb-6 space-y-4">
        <div className="space-y-3">
          {steps.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between py-1.5 text-xs transition-colors duration-200 ${
                  isDone
                    ? 'text-[#94A3B8]'
                    : isCurrent
                    ? 'text-[#F1F5F9] font-medium'
                    : 'text-[#64748B]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    )}
                  </div>
                  <span>{stepText}</span>
                </div>

                <span className="font-mono text-[10px] text-[#64748B]">
                  {isDone ? 'COMPLETED' : isCurrent ? 'PROCESSING' : 'QUEUED'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
          <motion.div
            className="bg-[#38BDF8] h-full rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Quiet Execution Ledger */}
      <div className="w-full bg-[#0A0C10] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-[#94A3B8] max-h-32 overflow-y-auto space-y-1.5">
        <div className="flex items-center justify-between text-[#64748B] border-b border-white/5 pb-1.5 mb-1 text-[10px] tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#38BDF8]" />
            <span>Deterministic Audit Trail</span>
          </span>
          <span>SHA-256</span>
        </div>
        {logs.map((log, i) => (
          <div key={i} className="leading-relaxed text-[#94A3B8] text-[11px]">
            <span className="text-[#64748B] select-none mr-2">›</span>
            {log}
          </div>
        ))}
      </div>

      {/* Epistemic Notice */}
      <div className="mt-8 flex items-center gap-2 text-[11px] text-[#64748B] text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
        <span>Strictly deterministic calculations · Zero predictive assertions</span>
      </div>
    </div>
  );
};
