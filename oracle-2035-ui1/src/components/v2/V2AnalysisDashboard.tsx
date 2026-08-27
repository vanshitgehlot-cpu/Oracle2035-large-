import React, { useState } from 'react';
import { V2AnalyzeDecisionSuccessResponse } from '../../types/v2';
import { V2DecisionDnaGrid } from './V2DecisionDnaGrid';
import { V2ScenarioSuite } from './V2ScenarioSuite';
import { V2DataCoveragePanel } from './V2DataCoveragePanel';
import { V2ExplanationSection } from './V2ExplanationSection';
import { V2ProvenanceDrawer } from './V2ProvenanceDrawer';
import {
  FileText,
  RotateCcw,
  Hash,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { sound } from '../../utils/soundEffects';

interface V2AnalysisDashboardProps {
  data: V2AnalyzeDecisionSuccessResponse['data'];
  onNewDecision: () => void;
}

export const V2AnalysisDashboard: React.FC<V2AnalysisDashboardProps> = ({
  data,
  onNewDecision,
}) => {
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [highlightDim, setHighlightDim] = useState<string | null>(null);

  const handleOpenProvenance = (dimName: string) => {
    sound.playClick();
    setHighlightDim(dimName);
    setProvenanceOpen(true);
  };

  const handleExportJson = () => {
    sound.playClick();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oracle-2035-v2-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto space-y-12">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono uppercase tracking-widest mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deterministic V2 Server Analysis Locked</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
            ORACLE 2035 V2 Analysis
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-sans max-w-2xl">
            Mathematical Decision DNA 2.0, multi-scenario conditional models, and epistemic contextual synthesis.
          </p>
        </div>

        {/* Global Dashboard Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenProvenance('General')}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Audit Hashes</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onNewDecision}
            className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Decision</span>
          </button>
        </div>
      </div>

      {/* Warnings if any */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Analysis Warnings & Limitations</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200/80 pl-2">
            {data.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Decision DNA 2.0 */}
      <V2DecisionDnaGrid
        dna={data.decisionDNA}
        onInspectProvenance={handleOpenProvenance}
      />

      {/* Section 2: Scenario Suite 2.0 */}
      <V2ScenarioSuite
        scenarios={data.scenarios}
        onInspectProvenance={handleOpenProvenance}
      />

      {/* Section 3: Data Coverage & Evidence Confidence */}
      <V2DataCoveragePanel
        dataCoverage={data.decisionDNA.dataCoverage}
        evidenceClassification={data.decisionDNA.evidenceConfidence.classification}
        evidenceMeasurements={data.decisionDNA.evidenceConfidence.measurements}
      />

      {/* Section 4: AI Contextual Narrative Synthesis */}
      <V2ExplanationSection
        explanation={data.explanation}
        explanationStatus={data.explanationStatus}
      />

      {/* Drawer: Cryptographic Provenance & Multi-Hash Inspector */}
      <V2ProvenanceDrawer
        isOpen={provenanceOpen}
        onClose={() => setProvenanceOpen(false)}
        auditTrail={data.auditTrail}
        highlightDimension={highlightDim}
      />
    </div>
  );
};
