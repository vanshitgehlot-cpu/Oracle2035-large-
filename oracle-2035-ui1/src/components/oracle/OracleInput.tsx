/** ORACLE shared form controls: presentation-only treatment around existing data-state semantics. */
import React from "react";
import { ValueState } from "../../types/v2";

export interface OracleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const OracleInput = React.forwardRef<HTMLInputElement, OracleInputProps>(
  ({ label, hint, error, prefixElement, suffixElement, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const descriptionId = inputId ? `${inputId}-description` : undefined;

    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="mb-2 block text-[11px] font-extrabold tracking-[0.06em] text-[var(--oracle-text-primary)]">{label}</label>}
        <div className="relative flex items-center">
          {prefixElement && <div className="pointer-events-none absolute left-3 text-sm text-[var(--oracle-text-muted)]">{prefixElement}</div>}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={hint || error ? descriptionId : undefined}
            className={`min-h-[48px] w-full rounded-[var(--oracle-radius-sm)] border bg-[var(--oracle-surface)] py-3 text-sm text-[var(--oracle-text-primary)] shadow-[0_1px_0_rgba(16,24,33,0.04)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[var(--oracle-text-muted)] focus:border-[var(--oracle-action)] focus:outline-none focus:ring-2 focus:ring-[var(--oracle-action-subtle)] disabled:cursor-not-allowed disabled:bg-[var(--oracle-surface-subtle)] disabled:text-[var(--oracle-text-muted)] ${error ? "border-[var(--oracle-risk-border)] focus:border-[var(--oracle-risk)] focus:ring-[var(--oracle-risk-bg)]" : "border-[var(--oracle-border-strong)]"} ${prefixElement ? "pl-9" : "pl-3.5"} ${suffixElement ? "pr-9" : "pr-3.5"} ${className}`}
            {...props}
          />
          {suffixElement && <div className="pointer-events-none absolute right-3 text-sm text-[var(--oracle-text-muted)]">{suffixElement}</div>}
        </div>
        {hint && !error && <p id={descriptionId} className="mt-1.5 text-[11px] leading-5 text-[var(--oracle-text-muted)]">{hint}</p>}
        {error && <p id={descriptionId} role="alert" className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--oracle-risk)]">{error}</p>}
      </div>
    );
  },
);

OracleInput.displayName = "OracleInput";

export interface OracleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const OracleTextarea = React.forwardRef<HTMLTextAreaElement, OracleTextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const descriptionId = inputId ? `${inputId}-description` : undefined;
    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="mb-2 block text-[11px] font-extrabold tracking-[0.06em] text-[var(--oracle-text-primary)]">{label}</label>}
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? descriptionId : undefined}
          className={`min-h-[112px] w-full resize-y rounded-[var(--oracle-radius-sm)] border bg-[var(--oracle-surface)] p-3.5 text-sm leading-6 text-[var(--oracle-text-primary)] shadow-[0_1px_0_rgba(16,24,33,0.04)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[var(--oracle-text-muted)] focus:border-[var(--oracle-action)] focus:outline-none focus:ring-2 focus:ring-[var(--oracle-action-subtle)] disabled:cursor-not-allowed disabled:bg-[var(--oracle-surface-subtle)] disabled:text-[var(--oracle-text-muted)] ${error ? "border-[var(--oracle-risk-border)] focus:border-[var(--oracle-risk)] focus:ring-[var(--oracle-risk-bg)]" : "border-[var(--oracle-border-strong)]"} ${className}`}
          {...props}
        />
        {hint && !error && <p id={descriptionId} className="mt-1.5 text-[11px] leading-5 text-[var(--oracle-text-muted)]">{hint}</p>}
        {error && <p id={descriptionId} role="alert" className="mt-1.5 text-[11px] font-semibold leading-5 text-[var(--oracle-risk)]">{error}</p>}
      </div>
    );
  },
);

OracleTextarea.displayName = "OracleTextarea";

export interface OracleValueStateSelectorProps {
  state: ValueState;
  onChange: (nextState: ValueState) => void;
  label?: string;
  className?: string;
}

export const OracleValueStateSelector: React.FC<OracleValueStateSelectorProps> = ({ state, onChange, label, className = "" }) => {
  const options: Array<{ value: ValueState; label: string; description: string; tone: string }> = [
    { value: "KNOWN", label: "KNOWN", description: "I can provide this value.", tone: "border-[var(--oracle-immutable-border)] bg-[var(--oracle-immutable-bg)] text-[var(--oracle-immutable)]" },
    { value: "UNKNOWN", label: "UNKNOWN", description: "Information is currently unavailable.", tone: "border-[var(--oracle-unknown-border)] bg-[var(--oracle-unknown-bg)] text-[var(--oracle-unknown)]" },
    { value: "NOT_PROVIDED", label: "NOT PROVIDED", description: "I have not supplied this information.", tone: "border-[var(--oracle-border-strong)] bg-[var(--oracle-surface-subtle)] text-[var(--oracle-text-secondary)]" },
  ];

  return (
    <div className={`w-full ${className}`}>
      {label && <span className="mb-2 block text-[11px] font-extrabold tracking-[0.06em] text-[var(--oracle-text-primary)]">{label}</span>}
      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label={label || "Value state"}>
        {options.map((opt) => {
          const isSelected = state === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)} aria-pressed={isSelected} className={`min-h-[58px] rounded-[var(--oracle-radius-sm)] border-l-2 px-3 py-2 text-left transition-[border-color,background-color,color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oracle-action)] ${isSelected ? opt.tone : "border-[var(--oracle-border)] bg-transparent text-[var(--oracle-text-muted)] hover:border-[var(--oracle-border-strong)] hover:bg-[var(--oracle-surface)]"}`}>
              <span className="block text-[10px] font-extrabold tracking-[0.08em]">{opt.label}</span>
              <span className="mt-1 block text-[10px] leading-4">{opt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
