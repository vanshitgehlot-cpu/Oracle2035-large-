import React, { useId } from "react";

export interface OracleVisualizationFrameProps {
  className?: string;
  label?: string;
  compact?: boolean;
}

/**
 * Presentation-only visual primitive for future decision-path and evidence
 * visualizations. The accessible label describes the concept; the diagram is
 * intentionally static and has no implied score or prediction.
 */
export const OracleVisualizationFrame: React.FC<OracleVisualizationFrameProps> = ({
  className = "",
  label = "Conceptual diagram showing multiple decision paths converging on a clearly framed decision node.",
  compact = false,
}) => {
  const id = useId().replace(/:/g, "");
  const pathGradientId = `oracle-path-gradient-${id}`;
  const nodeGlowId = `oracle-node-glow-${id}`;

  return (
  <figure className={`oracle-visual-frame ${compact ? "oracle-visual-frame-compact" : ""} ${className}`}>
    <div className="oracle-visual-frame-header">
      <span className="oracle-kicker">STRUCTURAL VIEW</span>
      <span className="oracle-technical">PATHS / NODE / TIME</span>
    </div>
    <div className="oracle-visual-canvas">
      <svg viewBox="0 0 520 260" role="img" aria-label={label} fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={pathGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--oracle-action)" stopOpacity="0.12" />
            <stop offset="0.52" stopColor="var(--oracle-action)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--oracle-action-bright)" stopOpacity="1" />
          </linearGradient>
          <radialGradient id={nodeGlowId}>
            <stop offset="0" stopColor="var(--oracle-action-bright)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--oracle-action-bright)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M26 42H494M26 130H494M26 218H494" stroke="var(--oracle-border)" strokeDasharray="2 8" opacity="0.7" />
        <path d="M42 42C168 42 178 130 258 130C338 130 348 42 478 42" stroke="var(--oracle-border-strong)" strokeWidth="1.25" opacity="0.7" />
        <path d="M42 218C168 218 178 130 258 130C338 130 348 218 478 218" stroke="var(--oracle-border-strong)" strokeWidth="1.25" opacity="0.7" />
        <path d="M42 42C158 42 184 68 258 130C332 192 362 218 478 218" stroke={`url(#${pathGradientId})`} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 218C158 218 184 192 258 130C332 68 362 42 478 42" stroke="var(--oracle-provenance)" strokeWidth="1.5" strokeDasharray="5 7" strokeLinecap="round" opacity="0.75" />
        <circle cx="258" cy="130" r="56" fill={`url(#${nodeGlowId})`} />
        <circle cx="258" cy="130" r="22" fill="var(--oracle-surface-elevated)" stroke="var(--oracle-action)" strokeWidth="1.5" />
        <circle cx="258" cy="130" r="8" fill="var(--oracle-action)" />
        <circle cx="42" cy="42" r="4" fill="var(--oracle-action)" />
        <circle cx="42" cy="218" r="4" fill="var(--oracle-provenance)" />
        <circle cx="478" cy="42" r="4" fill="var(--oracle-action-bright)" />
        <circle cx="478" cy="218" r="4" fill="var(--oracle-provenance)" />
        <text x="30" y="28" fill="var(--oracle-text-muted)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.4">ALTERNATIVE A</text>
        <text x="30" y="245" fill="var(--oracle-text-muted)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.4">ALTERNATIVE B</text>
        <text x="400" y="28" fill="var(--oracle-text-muted)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.4">TRAJECTORY / I</text>
        <text x="400" y="245" fill="var(--oracle-text-muted)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.4">TRAJECTORY / II</text>
        <text x="258" y="170" textAnchor="middle" fill="var(--oracle-text-secondary)" fontSize="9" fontFamily="ui-monospace, monospace" letterSpacing="1.4">DECISION NODE</text>
      </svg>
    </div>
    <figcaption className="oracle-visual-caption">A decision instrument makes structure visible before it makes a recommendation.</figcaption>
  </figure>
  );
};

OracleVisualizationFrame.displayName = "OracleVisualizationFrame";
