/** Evidence Ledger semantic classification label. This component only presents existing status types. */
import React from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";

export type OracleStatusType = "verified" | "attention" | "unknown" | "unavailable" | "processing" | "favorable" | "baseline" | "stress";
export interface OracleStatusProps { type: OracleStatusType; label: string; explanation?: string; size?: "sm" | "md"; className?: string; }

export const OracleStatus: React.FC<OracleStatusProps> = ({ type, label, explanation, size = "md", className = "" }) => {
  const configs: Record<OracleStatusType, { icon: React.ReactNode; text: string; border: string; bg: string }> = {
    verified: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "text-[var(--oracle-immutable)]", border: "border-[var(--oracle-immutable)]", bg: "bg-[var(--oracle-immutable-bg)]" },
    attention: { icon: <AlertCircle className="h-3.5 w-3.5" />, text: "text-[var(--oracle-unknown)]", border: "border-[var(--oracle-unknown)]", bg: "bg-[var(--oracle-unknown-bg)]" },
    unknown: { icon: <HelpCircle className="h-3.5 w-3.5" />, text: "text-[var(--oracle-unknown)]", border: "border-[var(--oracle-unknown)]", bg: "bg-[var(--oracle-unknown-bg)]" },
    unavailable: { icon: <XCircle className="h-3.5 w-3.5" />, text: "text-[var(--oracle-text-secondary)]", border: "border-[var(--oracle-border-strong)]", bg: "bg-[var(--oracle-surface-subtle)]" },
    processing: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "text-[var(--oracle-text-secondary)]", border: "border-[var(--oracle-border-strong)]", bg: "bg-[var(--oracle-surface-subtle)]" },
    favorable: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "text-[var(--oracle-provenance)]", border: "border-[var(--oracle-provenance)]", bg: "bg-[var(--oracle-provenance-bg)]" },
    baseline: { icon: <span className="h-2 w-2 rounded-full bg-[var(--oracle-action)]" />, text: "text-[var(--oracle-action)]", border: "border-[var(--oracle-action)]", bg: "bg-[var(--oracle-action-subtle)]" },
    stress: { icon: <AlertCircle className="h-3.5 w-3.5" />, text: "text-[var(--oracle-risk)]", border: "border-[var(--oracle-risk)]", bg: "bg-[var(--oracle-risk-bg)]" },
  };
  const current = configs[type];
  const padding = size === "sm" ? "min-h-[28px] px-2 py-1 text-[10px]" : "min-h-[32px] px-2.5 py-1 text-[11px]";
  return <span title={explanation} className={`inline-flex items-center gap-1.5 border-l-2 font-extrabold tracking-[0.03em] ${current.text} ${current.border} ${current.bg} ${padding} ${className}`}><span className="shrink-0">{current.icon}</span><span>{label}</span></span>;
};
