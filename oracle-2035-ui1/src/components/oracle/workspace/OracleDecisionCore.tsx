import React, { useMemo, useState } from "react";
import { ArrowUpRight, Check, CircleHelp, Eye, Hash, ShieldAlert } from "lucide-react";
import { DossierDimensionView } from "../../../presentation/oracleDossierSelectors";
import { OracleProvenanceBadge, OracleStateBadge } from "../OracleInstrumentPrimitives";

export interface OracleDecisionCoreProps {
  decisionStatement: string;
  dimensions: DossierDimensionView[];
  onInspectProvenance: (dimensionName: string) => void;
}

const nodePositions = [
  { left: "50%", top: "9%" },
  { left: "82%", top: "28%" },
  { left: "82%", top: "70%" },
  { left: "50%", top: "91%" },
  { left: "18%", top: "70%" },
  { left: "18%", top: "28%" },
];

const stateForDimension = (dimension: DossierDimensionView): "CALCULATED" | "UNKNOWN" | "INSUFFICIENT_DATA" => {
  if (dimension.status === "INSUFFICIENT_DATA" || dimension.status === "UNDER_DETERMINED") return "INSUFFICIENT_DATA";
  if (dimension.status === "UNKNOWN" || dimension.status === "NOT_PROVIDED") return "UNKNOWN";
  return "CALCULATED";
};

const iconForState = (state: ReturnType<typeof stateForDimension>) => {
  if (state === "INSUFFICIENT_DATA") return <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />;
  if (state === "UNKNOWN") return <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
};

export const OracleDecisionCore: React.FC<OracleDecisionCoreProps> = ({ decisionStatement, dimensions, onInspectProvenance }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => dimensions.find((dimension) => dimension.id === selectedId) || null, [dimensions, selectedId]);

  return (
    <div className={`oracle-decision-core ${selected ? "is-focused" : ""}`}>
      <div className="oracle-decision-core-stage" aria-label="Decision Core spatial view">
        <div className="oracle-decision-core-grid" aria-hidden="true" />
        <div className="oracle-decision-core-orbit oracle-decision-core-orbit-one" aria-hidden="true" />
        <div className="oracle-decision-core-orbit oracle-decision-core-orbit-two" aria-hidden="true" />
        <svg className="oracle-decision-core-links" viewBox="0 0 100 100" role="img" aria-label="Connections from the decision to the existing Decision DNA dimensions" preserveAspectRatio="none">
          <defs><linearGradient id="oracle-core-link" x1="0" x2="1"><stop offset="0" stopColor="var(--oracle-action)" stopOpacity=".18" /><stop offset=".55" stopColor="var(--oracle-action-bright)" stopOpacity=".88" /><stop offset="1" stopColor="var(--oracle-provenance)" stopOpacity=".25" /></linearGradient></defs>
          {dimensions.map((dimension, index) => {
            const point = nodePositions[index] || nodePositions[0];
            const x = Number.parseFloat(point.left);
            const y = Number.parseFloat(point.top);
            return <line key={dimension.id} x1="50" y1="50" x2={x} y2={y} className={`oracle-decision-core-link ${selectedId && selectedId !== dimension.id ? "is-muted" : ""}`} stroke="url(#oracle-core-link)" />;
          })}
        </svg>

        <div className="oracle-decision-core-center" aria-label={`Decision node: ${decisionStatement}`}>
          <span className="oracle-technical">DECISION NODE</span>
          <strong>{decisionStatement}</strong>
          <span className="oracle-decision-core-center-state"><span className="oracle-live-dot" aria-hidden="true" />RECORD UNDER EXAMINATION</span>
        </div>

        {dimensions.map((dimension, index) => {
          const point = nodePositions[index] || nodePositions[0];
          const state = stateForDimension(dimension);
          const isSelected = selectedId === dimension.id;
          return (
            <button
              key={dimension.id}
              type="button"
              className={`oracle-decision-core-node ${isSelected ? "is-selected" : ""} ${selectedId && !isSelected ? "is-receded" : ""}`}
              style={{ left: point.left, top: point.top }}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(isSelected ? null : dimension.id)}
            >
              <span className="oracle-decision-core-node-ring" aria-hidden="true"><span>{iconForState(state)}</span></span>
              <span className="oracle-decision-core-node-copy"><span className="oracle-technical">{String(index + 1).padStart(2, "0")}</span><strong>{dimension.label}</strong><span className="oracle-decision-core-node-classification">{dimension.classification}</span></span>
            </button>
          );
        })}

        <div className="oracle-decision-core-axis oracle-technical" aria-hidden="true"><span>AUTHORITATIVE STRUCTURE</span><span>CONTEXTUAL SIGNAL</span></div>
      </div>

      <aside className={`oracle-decision-core-inspector ${selected ? "is-open" : ""}`} aria-live="polite">
        {selected ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div><p className="oracle-kicker">Focus mode / dimension</p><h3 className="oracle-display mt-2 text-3xl leading-none">{selected.label}</h3></div>
              <button type="button" className="oracle-decision-core-clear" onClick={() => setSelectedId(null)} aria-label="Clear Decision Core focus"><Eye className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2"><OracleStateBadge state={stateForDimension(selected)} label={selected.status.replace(/_/g, " ")} compact /><OracleProvenanceBadge label="Dimension record" /></div>
            <p className="mt-5 border-l-2 border-[var(--oracle-action)] pl-4 text-sm leading-6 text-[var(--oracle-text-secondary)]">{selected.direction || "The record contains no semantic direction for this dimension."}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{selected.metrics.map((metric) => <div key={metric.label} className="oracle-decision-core-detail"><span className="oracle-technical">{metric.label}</span><strong>{metric.value || "Not provided"}</strong><span className="oracle-decision-core-detail-state">{metric.state.replace(/_/g, " ")}</span></div>)}</div>
            <div className="mt-5 grid gap-4 border-t border-[var(--oracle-border)] pt-4 sm:grid-cols-2"><div><span className="oracle-technical">CONTRIBUTING VARIABLES</span><p className="mt-2 text-xs leading-5 text-[var(--oracle-text-secondary)]">{selected.contributingVariables.length ? selected.contributingVariables.join(" · ") : "Not provided"}</p></div><div><span className="oracle-technical">ACTIVE ASSUMPTIONS</span><p className="mt-2 text-xs leading-5 text-[var(--oracle-text-secondary)]">{selected.activeAssumptions.length ? selected.activeAssumptions.join(" · ") : "None recorded"}</p></div></div>
            <button type="button" className="mt-5 inline-flex min-h-[40px] items-center gap-2 text-xs font-bold text-[var(--oracle-action)] hover:underline" onClick={() => onInspectProvenance(selected.label)}><Hash className="h-4 w-4" />Inspect provenance <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <div className="oracle-decision-core-inspector-empty"><span className="oracle-decision-core-inspector-mark"><Hash className="h-4 w-4" /></span><div><p className="oracle-kicker">Focus mode</p><p className="mt-2 text-sm font-bold text-[var(--oracle-text-primary)]">Select a dimension to inspect the record.</p><p className="mt-2 text-xs leading-5 text-[var(--oracle-text-secondary)]">The spatial layer is an orientation aid. The text record remains authoritative and available without spatial interaction.</p></div></div>
        )}
      </aside>
    </div>
  );
};
