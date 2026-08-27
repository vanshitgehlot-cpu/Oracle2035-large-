import React from "react";

export interface OracleMarkProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

/**
 * ORACLE identity mark: two weighted paths converge on a cobalt decision node,
 * held inside a temporal orbit. It stays legible as a small icon and is built
 * from SVG primitives so it can later be animated without replacing the mark.
 */
export const OracleMark: React.FC<OracleMarkProps> = ({
  size = "md",
  showWordmark = false,
  className = "",
  label = "ORACLE 2035",
}) => {
  const decorative = !label;

  return (
    <span className={`oracle-brand-lockup ${className}`}>
      <span
        className={`oracle-mark ${sizeClasses[size]}`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative ? true : undefined}
      >
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <path d="M7 14.5C14.3 14.5 17.2 18.1 21 23.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M41 14.5C33.7 14.5 30.8 18.1 27 23.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M7 33.5C14.3 33.5 17.2 29.9 21 24.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.62" />
          <path d="M41 33.5C33.7 33.5 30.8 29.9 27 24.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.62" />
          <circle cx="24" cy="24" r="5.5" fill="var(--oracle-action)" stroke="var(--oracle-action-bright)" strokeWidth="2" />
          <circle cx="24" cy="24" r="1.5" fill="var(--oracle-surface-elevated)" />
        </svg>
      </span>
      {showWordmark && (
        <span className="oracle-wordmark">
          <span className="oracle-wordmark-name">ORACLE</span>
          <span className="oracle-wordmark-meta">2035 / DECISION INSTRUMENT</span>
        </span>
      )}
    </span>
  );
};

OracleMark.displayName = "OracleMark";
