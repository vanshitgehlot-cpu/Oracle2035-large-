/** Evidence Ledger shell navigation: preserves screen routing, sound, export, and new-decision handlers. */
import React, { useState } from "react";
import {
  Archive,
  Compass,
  Download,
  Menu,
  PlusCircle,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AppScreen } from "../../types";
import { sound } from "../../utils/soundEffects";
import { OracleButton } from "./OracleButton";
import { OracleMark } from "./OracleMark";
import { OracleProvenanceBadge } from "./OracleInstrumentPrimitives";

export interface OracleHeaderProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  hasAnalysis: boolean;
  onNewDecision: () => void;
  onExport?: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const OracleHeader: React.FC<OracleHeaderProps> = ({
  currentScreen,
  setScreen,
  hasAnalysis,
  onNewDecision,
  onExport,
  soundEnabled,
  setSoundEnabled,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAnalysisScreen =
    currentScreen === "v2-dashboard" ||
    currentScreen === "dashboard" ||
    currentScreen === "results" ||
    currentScreen === "avatar" ||
    currentScreen === "dna";

  const isIntakeScreen =
    currentScreen === "v2-interview" ||
    currentScreen === "interview" ||
    currentScreen === "thinking" ||
    currentScreen === "v2-thinking";

  const handleNav = (screen: AppScreen) => {
    sound.playClick();
    setScreen(screen);
    setMobileMenuOpen(false);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const navItems: Array<{ id: "landing" | "library" | "analysis"; label: string; icon?: React.ReactNode }> = [
    { id: "landing", label: "Overview" },
    { id: "library", label: "Decision Library", icon: <Archive className="h-3.5 w-3.5" /> },
    { id: "analysis", label: "Analysis", icon: <Compass className="h-3.5 w-3.5" /> },
  ];

  const navTarget = (id: "landing" | "library" | "analysis"): AppScreen => {
    if (id === "analysis") return hasAnalysis ? "v2-dashboard" : "v2-interview";
    return id;
  };

  const navIsActive = (id: "landing" | "library" | "analysis") =>
    (id === "landing" && currentScreen === "landing") ||
    (id === "library" && currentScreen === "library") ||
    (id === "analysis" && isAnalysisScreen);

  const navDisabled = (id: "landing" | "library" | "analysis") => id === "analysis" && !hasAnalysis && !isIntakeScreen;

  return (
    <header className="oracle-header sticky top-0 z-40 w-full border-b border-[var(--oracle-border)] bg-[color:rgba(246,243,236,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <button
            type="button"
            onClick={() => handleNav("landing")}
            className="group flex min-h-[44px] items-center gap-3 text-left"
            aria-label="Return to ORACLE overview"
          >
            <OracleMark size="sm" showWordmark={false} label="ORACLE 2035 decision instrument" />
            <span className="oracle-wordmark min-w-0">
              <span className="oracle-wordmark-name">ORACLE</span>
              <span className="oracle-wordmark-meta">2035 / DECISION INTELLIGENCE</span>
            </span>
          </button>

          <div className="hidden border-l border-[var(--oracle-border)] pl-5 lg:flex">
            <OracleProvenanceBadge label="Deterministic methodology" />
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const disabled = navDisabled(item.id);
            const active = navIsActive(item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(navTarget(item.id))}
                disabled={disabled}
                className={`oracle-dossier-tab inline-flex min-h-[44px] items-center gap-1.5 border-b-2 px-3 py-2 text-[11px] font-bold transition-colors ${
                  active
                    ? "border-[var(--oracle-action)] text-[var(--oracle-action)]"
                    : disabled
                      ? "border-transparent text-[var(--oracle-text-muted)] opacity-45"
                      : "border-transparent text-[var(--oracle-text-secondary)] hover:border-[var(--oracle-border-strong)] hover:text-[var(--oracle-text-primary)]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "analysis" && hasAnalysis && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[var(--oracle-provenance)]" />}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute interface sounds" : "Enable interface sounds"}
            title={soundEnabled ? "Mute interface sounds" : "Enable interface sounds"}
            className="grid h-11 w-11 place-items-center border border-transparent text-[var(--oracle-text-muted)] transition-colors hover:border-[var(--oracle-border)] hover:bg-[var(--oracle-surface)] hover:text-[var(--oracle-text-primary)]"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {hasAnalysis && onExport && (
            <OracleButton variant="secondary" size="sm" onClick={onExport} leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export
            </OracleButton>
          )}

          <OracleButton variant="primary" size="sm" onClick={onNewDecision} leftIcon={<PlusCircle className="h-3.5 w-3.5" />}>
            Analyse a decision
          </OracleButton>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-11 w-11 place-items-center border border-[var(--oracle-border)] bg-[var(--oracle-surface)] text-[var(--oracle-text-primary)]"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--oracle-border)] bg-[var(--oracle-surface)] px-4 py-4 sm:hidden">
          <nav className="mx-auto max-w-7xl space-y-1" aria-label="Mobile primary navigation">
            {navItems.map((item) => {
              const disabled = navDisabled(item.id);
              const active = navIsActive(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleNav(navTarget(item.id))}
                  disabled={disabled}
                  className={`flex min-h-[44px] w-full items-center justify-between border-l-2 px-3 text-left text-sm font-bold ${
                    active
                      ? "border-[var(--oracle-action)] bg-[var(--oracle-action-subtle)] text-[var(--oracle-action)]"
                      : disabled
                        ? "border-transparent text-[var(--oracle-text-muted)] opacity-45"
                        : "border-transparent text-[var(--oracle-text-secondary)] hover:bg-[var(--oracle-surface-subtle)] hover:text-[var(--oracle-text-primary)]"
                  }`}
                >
                  <span className="flex items-center gap-2">{item.icon}{item.label}</span>
                  {item.id === "analysis" && hasAnalysis && <span className="oracle-technical text-[var(--oracle-provenance)]">READY</span>}
                </button>
              );
            })}
          </nav>

          <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between gap-3 border-t border-[var(--oracle-border)] pt-4">
            <button type="button" onClick={toggleSound} className="inline-flex min-h-[44px] items-center gap-2 text-xs font-bold text-[var(--oracle-text-secondary)]">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? "Audio on" : "Audio muted"}
            </button>
            {hasAnalysis && onExport && <button type="button" onClick={onExport} className="inline-flex min-h-[44px] items-center gap-2 text-xs font-bold text-[var(--oracle-action)]"><Download className="h-4 w-4" />Export</button>}
          </div>

          <OracleButton
            variant="primary"
            size="md"
            className="mt-3 w-full"
            onClick={() => {
              onNewDecision();
              setMobileMenuOpen(false);
            }}
            leftIcon={<PlusCircle className="h-4 w-4" />}
          >
            Analyse a decision
          </OracleButton>
        </div>
      )}
    </header>
  );
};
