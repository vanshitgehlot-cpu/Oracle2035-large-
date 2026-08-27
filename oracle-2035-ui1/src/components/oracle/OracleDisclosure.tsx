/** Evidence Ledger disclosure: preserves controlled/uncontrolled expansion behavior for review sections. */
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export interface OracleDisclosureProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (nextOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const OracleDisclosure: React.FC<OracleDisclosureProps> = ({ title, subtitle, badge, defaultOpen = false, isOpen: controlledOpen, onToggle, children, className = "" }) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isExpanded = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = () => {
    const next = !isExpanded;
    if (controlledOpen === undefined) setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <div className={`w-full border-y border-[var(--oracle-border)] bg-transparent ${className}`}>
      <div className="flex items-center justify-between gap-3 px-1 py-4 text-left sm:px-2">
        <button type="button" onClick={handleToggle} aria-expanded={isExpanded} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
          <span className="grid h-6 w-6 shrink-0 place-items-center border border-[var(--oracle-border-strong)] text-[var(--oracle-action)]"><ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></span>
          <span className="min-w-0"><span className="block text-sm font-extrabold text-[var(--oracle-text-primary)]">{title}</span>{subtitle && <span className="mt-0.5 block text-[11px] text-[var(--oracle-text-muted)]">{subtitle}</span>}</span>
        </button>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden"><div className="border-t border-[var(--oracle-border-subtle)] px-1 py-5 sm:px-2">{children}</div></motion.div>}
      </AnimatePresence>
    </div>
  );
};
