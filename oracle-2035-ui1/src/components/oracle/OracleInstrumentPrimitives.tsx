import React from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, Download, ExternalLink, HelpCircle, Info, LockKeyhole, ShieldAlert, Timer, XCircle } from "lucide-react";
import { OracleRenderableState, selectEvidenceState } from "../../presentation/oracleSelectors";

export interface OracleStateBadgeProps {
  state: OracleRenderableState;
  label?: string;
  compact?: boolean;
  className?: string;
}

const stateMeta: Record<OracleRenderableState, { tone: string; icon: React.ReactNode }> = {
  KNOWN: { tone: "known", icon: <CheckCircle2 aria-hidden="true" /> },
  CALCULATED: { tone: "calculated", icon: <ArrowUpRight aria-hidden="true" /> },
  ASSUMED: { tone: "assumed", icon: <Info aria-hidden="true" /> },
  ESTIMATED_BY_USER: { tone: "estimated", icon: <Info aria-hidden="true" /> },
  UNKNOWN: { tone: "unknown", icon: <HelpCircle aria-hidden="true" /> },
  NOT_PROVIDED: { tone: "not-provided", icon: <HelpCircle aria-hidden="true" /> },
  NOT_APPLICABLE: { tone: "not-applicable", icon: <XCircle aria-hidden="true" /> },
  INSUFFICIENT_DATA: { tone: "insufficient", icon: <ShieldAlert aria-hidden="true" /> },
};

export const OracleStateBadge: React.FC<OracleStateBadgeProps> = ({ state, label, compact = false, className = "" }) => {
  const meta = stateMeta[state];
  const copy = label || selectEvidenceState(state).label;
  return (
    <span className={`oracle-state-badge oracle-state-badge-${meta.tone} ${compact ? "oracle-state-badge-compact" : ""} ${className}`}>
      <span className="oracle-state-badge-icon">{React.cloneElement(meta.icon as React.ReactElement, { className: "h-3.5 w-3.5" })}</span>
      <span>{copy}</span>
    </span>
  );
};

export interface OracleEvidenceBadgeProps {
  state: OracleRenderableState;
  source?: string;
  className?: string;
}

export const OracleEvidenceBadge: React.FC<OracleEvidenceBadgeProps> = ({ state, source, className = "" }) => (
  <span className={`oracle-evidence-badge ${className}`} title={selectEvidenceState(state).explicitMeaning}>
    <OracleStateBadge state={state} compact />
    {source && <span className="oracle-evidence-source">{source}</span>}
  </span>
);

export interface OracleProvenanceBadgeProps {
  label?: string;
  methodologyVersion?: string;
  className?: string;
}

export const OracleProvenanceBadge: React.FC<OracleProvenanceBadgeProps> = ({ label = "Deterministic provenance", methodologyVersion = "2.0.0-LOCKED", className = "" }) => (
  <span className={`oracle-provenance-badge ${className}`}>
    <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
    <span>{label}</span>
    <span className="oracle-technical">/ {methodologyVersion}</span>
  </span>
);

export interface OracleMetricSignalProps {
  label: string;
  value?: React.ReactNode;
  state?: OracleRenderableState;
  detail?: React.ReactNode;
  accent?: "action" | "risk" | "provenance" | "temporal" | "evidence" | "neutral";
  className?: string;
}

export const OracleMetricSignal: React.FC<OracleMetricSignalProps> = ({ label, value, state, detail, accent = "action", className = "" }) => (
  <article className={`oracle-metric-signal oracle-metric-signal-${accent} ${className}`}>
    <div className="oracle-metric-signal-label">{label}</div>
    {value !== undefined && <div className="oracle-metric-signal-value">{value}</div>}
    {state && <OracleStateBadge state={state} compact />}
    {detail && <div className="oracle-metric-signal-detail">{detail}</div>}
  </article>
);

export interface OracleBoundaryMarkerProps {
  label: string;
  value?: React.ReactNode;
  description?: React.ReactNode;
  tone?: "action" | "risk" | "unknown" | "provenance";
  className?: string;
}

export const OracleBoundaryMarker: React.FC<OracleBoundaryMarkerProps> = ({ label, value, description, tone = "action", className = "" }) => (
  <div className={`oracle-boundary-marker oracle-boundary-marker-${tone} ${className}`}>
    <span className="oracle-boundary-marker-pin" aria-hidden="true" />
    <div className="min-w-0">
      <div className="oracle-boundary-marker-label">{label}</div>
      {value !== undefined && <div className="oracle-boundary-marker-value">{value}</div>}
      {description && <div className="oracle-boundary-marker-description">{description}</div>}
    </div>
  </div>
);

export interface OracleRunwayGaugeProps {
  label?: string;
  value?: React.ReactNode;
  state?: OracleRenderableState;
  position?: number;
  boundaryLabel?: string;
  detail?: React.ReactNode;
  className?: string;
}

export const OracleRunwayGauge: React.FC<OracleRunwayGaugeProps> = ({ label = "Runway boundary", value = "Data not provided", state, position, boundaryLabel = "SOLVENCY FLOOR", detail, className = "" }) => (
  <figure className={`oracle-runway-gauge ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="oracle-kicker">{label}</div>
        <div className="oracle-runway-gauge-value">{value}</div>
      </div>
      {state && <OracleStateBadge state={state} compact />}
    </div>
    <div className="oracle-runway-gauge-track" aria-hidden="true">
      <span className="oracle-runway-gauge-fill" style={{ width: position === undefined ? "0%" : `${Math.max(0, Math.min(100, position))}%` }} />
      <span className="oracle-runway-gauge-boundary" />
    </div>
    <div className="oracle-runway-gauge-axis"><span>INITIAL RESERVE</span><span>{boundaryLabel}</span></div>
    {detail && <figcaption className="oracle-runway-gauge-detail">{detail}</figcaption>}
  </figure>
);

export interface OracleRailPoint {
  id: string;
  label: string;
  meta?: string;
  position: number;
  tone?: "action" | "risk" | "provenance" | "temporal";
  active?: boolean;
}

export interface OracleTrajectoryRailProps {
  points: OracleRailPoint[];
  label?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const OracleTrajectoryRail: React.FC<OracleTrajectoryRailProps> = ({ points, label = "Trajectory rail", onSelect, className = "" }) => (
  <section className={`oracle-trajectory-rail ${className}`} aria-label={label}>
    <div className="oracle-trajectory-rail-line" aria-hidden="true" />
    {points.map((point) => {
      const pointContent = <><span className={`oracle-trajectory-rail-node oracle-trajectory-rail-node-${point.tone || "action"}`} /><span className="oracle-trajectory-rail-copy"><span className="oracle-trajectory-rail-label">{point.label}</span>{point.meta && <span className="oracle-technical oracle-trajectory-rail-meta">{point.meta}</span>}</span></>;
      return onSelect ? <button key={point.id} type="button" onClick={() => onSelect(point.id)} className={`oracle-trajectory-rail-point ${point.active ? "is-active" : ""}`} style={{ left: `${Math.max(0, Math.min(100, point.position))}%` }}>{pointContent}</button> : <div key={point.id} className={`oracle-trajectory-rail-point ${point.active ? "is-active" : ""}`} style={{ left: `${Math.max(0, Math.min(100, point.position))}%` }}>{pointContent}</div>;
    })}
  </section>
);

export interface OracleTimelineRailProps {
  points: OracleRailPoint[];
  label?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export const OracleTimelineRail: React.FC<OracleTimelineRailProps> = ({ points, label = "Timeline rail", onSelect, className = "" }) => (
  <section className={`oracle-timeline-rail ${className}`} aria-label={label}>
    {points.map((point) => <div key={point.id} className={`oracle-timeline-rail-item ${point.active ? "is-active" : ""}`}><div className={`oracle-timeline-rail-marker oracle-timeline-rail-marker-${point.tone || "temporal"}`} aria-hidden="true"><Timer className="h-3.5 w-3.5" /></div><div className="oracle-timeline-rail-content"><div className="oracle-technical text-[var(--oracle-text-muted)]">{point.meta || "TEMPORAL EVENT"}</div>{onSelect ? <button type="button" onClick={() => onSelect(point.id)} className="oracle-timeline-rail-label">{point.label}</button> : <span className="oracle-timeline-rail-label">{point.label}</span>}</div></div>)}
  </section>
);

export interface OracleCausalGraphNode {
  id: string;
  label: string;
  category?: "cause" | "condition" | "constraint" | "outcome";
  x: number;
  y: number;
}

export interface OracleCausalGraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface OracleCausalGraphProps {
  nodes: OracleCausalGraphNode[];
  edges: OracleCausalGraphEdge[];
  label?: string;
  className?: string;
}

export const OracleCausalGraph: React.FC<OracleCausalGraphProps> = ({ nodes, edges, label = "Causal graph", className = "" }) => {
  const byId = new Map<string, OracleCausalGraphNode>();
  nodes.forEach((node) => byId.set(node.id, node));
  return (
    <figure className={`oracle-causal-graph ${className}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label={label} preserveAspectRatio="none">
        <defs><marker id="oracle-causal-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="var(--oracle-action)" /></marker></defs>
        {edges.map((edge) => { const from = byId.get(edge.from); const to = byId.get(edge.to); if (!from || !to) return null; return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="oracle-causal-edge" markerEnd="url(#oracle-causal-arrow)" />; })}
        {nodes.map((node) => <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`oracle-causal-node oracle-causal-node-${node.category || "condition"}`}><circle r="4.5" /><text y="10" textAnchor="middle">{node.label}</text></g>)}
      </svg>
    </figure>
  );
};

export interface OracleInstrumentDisclosureProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const OracleInstrumentDisclosure: React.FC<OracleInstrumentDisclosureProps> = ({ label, children, defaultOpen = false, className = "" }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return <div className={`oracle-instrument-disclosure ${className}`}><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="oracle-instrument-disclosure-trigger"><span>{label}</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="oracle-instrument-disclosure-content">{children}</div>}</div>;
};

export interface OracleExportMenuProps {
  onExportHtml: () => void;
  onExportJson: () => void;
  className?: string;
}

export const OracleExportMenu: React.FC<OracleExportMenuProps> = ({ onExportHtml, onExportJson, className = "" }) => {
  const [open, setOpen] = React.useState(false);
  return <div className={`oracle-export-menu ${className}`}><button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="oracle-export-menu-trigger"><Download className="h-3.5 w-3.5" />Export<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="oracle-export-menu-popover" role="menu"><button type="button" role="menuitem" onClick={() => { setOpen(false); onExportHtml(); }}><ExternalLink className="h-3.5 w-3.5" />HTML report</button><button type="button" role="menuitem" onClick={() => { setOpen(false); onExportJson(); }}><Download className="h-3.5 w-3.5" />JSON snapshot</button></div>}</div>;
};
