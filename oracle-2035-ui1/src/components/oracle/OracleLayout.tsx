/** Evidence Ledger application shell: presentation-only frame around the existing screen controller. */
import React from "react";
import { AppScreen } from "../../types";
import { OracleHeader } from "./OracleHeader";

export interface OracleLayoutProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  hasAnalysis: boolean;
  onNewDecision: () => void;
  onExport?: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  children: React.ReactNode;
}

export const OracleLayout: React.FC<OracleLayoutProps> = ({
  currentScreen,
  setScreen,
  hasAnalysis,
  onNewDecision,
  onExport,
  soundEnabled,
  setSoundEnabled,
  children,
}) => {
  return (
    <div className="oracle-app-shell relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--oracle-canvas)] text-[var(--oracle-text-primary)]">
      <a className="oracle-skip-link" href="#oracle-main-content">Skip to main content</a>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(23,32,40,0.018) 1px, transparent 1px), linear-gradient(rgba(23,32,40,0.014) 1px, transparent 1px)", backgroundSize: "44px 44px" }}
      />

      <OracleHeader
        currentScreen={currentScreen}
        setScreen={setScreen}
        hasAnalysis={hasAnalysis}
        onNewDecision={onNewDecision}
        onExport={onExport}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <main id="oracle-main-content" tabIndex={-1} className="relative z-10 flex flex-1 flex-col">{children}</main>

      <footer className="oracle-footer relative z-10 mt-16 border-t border-[var(--oracle-border)] bg-[color:rgba(238,233,222,0.62)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[10px] text-[var(--oracle-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-[0.12em] text-[var(--oracle-text-primary)]">ORACLE 2035</span>
            <span aria-hidden="true">/</span>
            <span>Deterministic Decision Intelligence</span>
          </div>
          <div className="flex items-center gap-3 oracle-technical">
            <span>2026 → 2035</span>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--oracle-provenance)]">SHA-256 provenance retained</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
