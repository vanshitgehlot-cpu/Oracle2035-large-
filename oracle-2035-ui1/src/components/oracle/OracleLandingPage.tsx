/**
 * Evidence Ledger landing surface: presentation-only composition.
 * Existing start and library handlers remain the sole navigation behavior.
 */
import React from "react";
import { motion } from "motion/react";
import {
  Archive,
  ArrowRight,
  Compass,
  Dna,
  FileText,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { OracleButton } from "./OracleButton";
import { OracleMark } from "./OracleMark";
import { OracleVisualizationFrame } from "./OracleVisualizationFrame";
import { OracleInstrumentDisclosure, OracleProvenanceBadge, OracleStateBadge, OracleTimelineRail } from "./OracleInstrumentPrimitives";
import { sound } from "../../utils/soundEffects";

export interface OracleLandingPageProps {
  onStartDecision: () => void;
  onExploreLibrary?: () => void;
  /** Backwards compatibility prop */
  onGetStarted?: () => void;
  /** Backwards compatibility prop */
  onLaunchV2?: () => void;
}

const dimensions = [
  ["01", "Financial exposure", "Capital commitment, monthly cash position, and runway constraints."],
  ["02", "Reversibility", "What can be unwound, at what effort, and over what period."],
  ["03", "Resource fit", "Skills, time, support, and physical capacity available to the decision."],
  ["04", "Opportunity cost", "Alternatives and foregone value made explicit rather than implicit."],
  ["05", "Upside potential", "The stated target and asymmetric conditions—without predictive claims."],
  ["06", "Evidence confidence", "What is verified, user-provided, assumed, unknown, or not provided."],
] as const;

const workflow = [
  ["01", "Define the decision", "State the choice, desired outcome, horizon, and alternatives."],
  ["02", "Ground it in reality", "Record financial and capacity inputs with explicit state."],
  ["03", "Examine structural trade-offs", "Decision DNA makes exposure, reversibility, and fit legible."],
  ["04", "Explore conditional trajectories", "Review Base, Downside Stress, and Upside conditions."],
  ["05", "Preserve the reasoning", "Retain evidence, assumptions, and cryptographic provenance."],
] as const;

const methodSequence = [
  { id: "identity", label: "State the choice", meta: "DECISION IDENTITY", tone: "action" as const },
  { id: "reality", label: "Ground the context", meta: "FINANCIAL / CAPACITY", tone: "evidence" as const },
  { id: "structure", label: "Read the structure", meta: "SIX DNA DIMENSIONS", tone: "temporal" as const },
  { id: "trajectories", label: "Compare conditions", meta: "BASE / DOWNSIDE / UPSIDE", tone: "risk" as const },
  { id: "ledger", label: "Keep the ledger", meta: "EVIDENCE / PROVENANCE", tone: "provenance" as const },
];

export const OracleLandingPage: React.FC<OracleLandingPageProps> = ({
  onStartDecision,
  onExploreLibrary,
  onGetStarted,
  onLaunchV2,
}) => {
  const handleStart = () => {
    sound.playClick();
    if (onStartDecision) onStartDecision();
    else if (onLaunchV2) onLaunchV2();
    else if (onGetStarted) onGetStarted();
  };

  const handleLibrary = () => {
    sound.playClick();
    if (onExploreLibrary) onExploreLibrary();
  };

  return (
    <div className="oracle-landing mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20">
      <section className="grid items-end gap-10 border-b border-[var(--oracle-border)] pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.75fr)] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
          <div className="mb-7 flex items-center gap-3 border-l-2 border-[var(--oracle-action)] pl-3">
            <OracleMark size="sm" label="ORACLE 2035 convergence mark" />
            <span className="oracle-kicker">ORACLE 2035 / DECISION DOSSIER</span>
            <OracleProvenanceBadge label="Deterministic methodology" />
          </div>

          <h1 aria-label="Make consequential choices with clarity." className="oracle-display max-w-[11ch] text-[clamp(3.35rem,7vw,6.85rem)] leading-[0.91] text-[var(--oracle-text-primary)]">
            Make consequential choices <em className="not-italic text-[var(--oracle-action)]">with clarity.</em>
          </h1>

          <p className="mt-8 max-w-[60ch] text-[15px] leading-7 text-[var(--oracle-text-secondary)] sm:text-base">
            ORACLE is a deterministic decision-intelligence instrument for major career, venture, and strategic commitments. It makes financial exposure, reversibility, resource capacity, alternatives, evidence, and assumptions visible before you act.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <OracleButton
              variant="primary"
              size="lg"
              onClick={handleStart}
              aria-label="Start a Decision"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Analyse a decision
            </OracleButton>

            {onExploreLibrary && (
              <OracleButton
                variant="secondary"
                size="lg"
                onClick={handleLibrary}
                aria-label="Explore Decision Library"
                leftIcon={<Archive className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Review saved work
              </OracleButton>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-[var(--oracle-text-muted)]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--oracle-provenance)]" />
            The analysis engine evaluates stated inputs and conditional trajectories. It does not make probability claims.
          </p>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
          className="oracle-landing-ledger relative border-y border-[var(--oracle-border-strong)] bg-[color:rgba(255,253,248,.72)] px-6 py-7 shadow-[var(--oracle-shadow-soft)] sm:px-8"
          aria-label="How ORACLE frames a decision"
                  >
          <div className="absolute left-0 top-0 h-full w-1 bg-[var(--oracle-action)]" aria-hidden="true" />
          <OracleVisualizationFrame compact className="mb-6" />

          <div className="flex items-center justify-between gap-4 border-b border-[var(--oracle-border)] pb-4">
            <span className="oracle-kicker">The decision ledger</span>
            <span className="oracle-technical text-[var(--oracle-provenance)]">V2.0-LOCKED</span>
          </div>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-[30px_1fr] gap-3">
              <span className="oracle-technical text-[var(--oracle-action)]">01</span>
              <div><h2 className="text-sm font-extrabold">What is ORACLE?</h2><p className="mt-1 text-xs leading-5 text-[var(--oracle-text-secondary)]">A structured, deterministic system for examining consequential decisions.</p></div>
            </div>
            <div className="grid grid-cols-[30px_1fr] gap-3">
              <span className="oracle-technical text-[var(--oracle-action)]">02</span>
              <div><h2 className="text-sm font-extrabold">What does it do?</h2><p className="mt-1 text-xs leading-5 text-[var(--oracle-text-secondary)]">It surfaces structural constraints, evidence quality, and conditional trajectories.</p></div>
            </div>
            <div className="grid grid-cols-[30px_1fr] gap-3">
              <span className="oracle-technical text-[var(--oracle-action)]">03</span>
              <div><h2 className="text-sm font-extrabold">Why is it different?</h2><p className="mt-1 text-xs leading-5 text-[var(--oracle-text-secondary)]">Unknowns stay unknown. Calculations retain their inputs and cryptographic provenance.</p></div>
            </div>
          </div>
          <div className="border-t border-[var(--oracle-border)] pt-4 text-[11px] text-[var(--oracle-text-muted)]">
            Begin with the decision. The system will preserve what is known, estimated, unknown, and unprovided.
          </div>
        </motion.aside>
      </section>

      <section className="grid gap-10 border-b border-[var(--oracle-border)] py-14 sm:py-16 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-20" aria-labelledby="oracle-method-title">
        <div>
          <p className="oracle-kicker">How the instrument reads</p>
          <h2 id="oracle-method-title" className="oracle-display mt-3 max-w-[14ch] text-4xl leading-[1.02] sm:text-5xl">From a stated choice to a traceable record.</h2>
          <p className="mt-5 max-w-[42ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">ORACLE keeps the sequence visible: identity, reality, structure, conditional paths, and preserved reasoning.</p>
        </div>
        <OracleTimelineRail points={methodSequence} label="ORACLE methodology sequence" className="self-center" />
      </section>

      <section className="grid gap-12 py-16 lg:grid-cols-[minmax(0,.76fr)_minmax(0,1.24fr)] lg:gap-20">
        <div>
          <p className="oracle-kicker">Six-dimensional structural reading</p>
          <h2 className="oracle-display mt-3 max-w-[13ch] text-4xl leading-[1.02] sm:text-5xl">A decision is more than a single score.</h2>
          <p className="mt-5 max-w-[38ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">
            Decision DNA is an explanatory system. Each dimension describes a different structural feature of the choice; none is an arbitrary 0–100 rating.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[var(--oracle-text-secondary)]">
            <Dna className="h-4 w-4 text-[var(--oracle-action)]" />
            <span>Decision DNA</span>
          </div>
        </div>

        <div className="divide-y divide-[var(--oracle-border)] border-y border-[var(--oracle-border)]">
          {dimensions.map(([number, title, description]) => (
            <article key={number} className="grid grid-cols-[34px_1fr] gap-4 py-4 sm:grid-cols-[42px_minmax(150px,.55fr)_1fr] sm:gap-5">
              <span className="oracle-technical pt-0.5 text-[var(--oracle-action)]">{number}</span>
              <h3 className="text-sm font-extrabold text-[var(--oracle-text-primary)]">{title}</h3>
              <p className="col-start-2 text-xs leading-5 text-[var(--oracle-text-secondary)] sm:col-start-auto">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--oracle-border)] py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <div>
            <p className="oracle-kicker">The decision intelligence workflow</p>
            <h2 className="oracle-display mt-3 text-4xl leading-[1.02] sm:text-5xl">From stated context to auditable reasoning.</h2>
            <p className="mt-5 max-w-[38ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">
              Each stage keeps the distinction between source material, deterministic model output, and optional narrative explanation intact.
            </p>
          </div>
          <ol className="divide-y divide-[var(--oracle-border)] border-t border-[var(--oracle-border)]">
            {workflow.map(([number, title, description]) => (
              <li key={number} className="grid grid-cols-[40px_1fr] gap-4 py-4 sm:grid-cols-[48px_minmax(180px,.65fr)_1fr] sm:gap-5">
                <span className="oracle-technical pt-0.5 text-[var(--oracle-action)]">{number}</span>
                <h3 className="text-sm font-extrabold">{title}</h3>
                <p className="col-start-2 text-xs leading-5 text-[var(--oracle-text-secondary)] sm:col-start-auto">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-20">
        <article className="border-l-2 border-[var(--oracle-action)] pl-5">
          <div className="flex items-center gap-2"><Compass className="h-4 w-4 text-[var(--oracle-action)]" /><h2 className="oracle-kicker">What ORACLE Does</h2></div>
          <p className="oracle-display mt-4 text-3xl leading-[1.08] sm:text-4xl">Clarifies the structure beneath a consequential choice.</p>
          <p className="mt-5 max-w-[54ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">
            ORACLE evaluates financial exposure, reversibility, capacity, alternatives, and evidence through deterministic rules. It presents Base Case, Downside Stress Case, and Upside Case as conditional trajectories.
          </p>
        </article>
        <article className="border-l-2 border-[var(--oracle-provenance)] pl-5">
          <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[var(--oracle-provenance)]" /><h2 className="oracle-kicker !text-[var(--oracle-provenance)]">{"Why It's Different"}</h2></div>
          <p className="oracle-display mt-4 text-3xl leading-[1.08] sm:text-4xl">It preserves uncertainty instead of disguising it.</p>
          <p className="mt-5 max-w-[54ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">
            Unknown and not-provided variables remain explicit. Evidence and assumptions are separated. Calculation fingerprints retain the exact provenance of the deterministic output.
          </p>
        </article>
      </section>

      <section className="border-y border-[var(--oracle-border)] py-7" aria-label="Core Capabilities">
        <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-start">
          <div>
            <p className="oracle-kicker">Core Capabilities</p>
            <p className="mt-2 text-xs leading-5 text-[var(--oracle-text-secondary)]">A connected system of analytical instruments—not a collection of generic features.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-l border-[var(--oracle-border)] pl-4 text-[11px] font-bold text-[var(--oracle-text-secondary)] sm:pl-6">
            <span>Decision DNA</span>
            <span className="text-[var(--oracle-border-strong)]" aria-hidden="true">/</span>
            <span>Conditional Trajectories</span>
            <span className="text-[var(--oracle-border-strong)]" aria-hidden="true">/</span>
            <span>What-If Sensitivity Studio</span>
            <span className="text-[var(--oracle-border-strong)]" aria-hidden="true">/</span>
            <span>Evidence &amp; Data Coverage</span>
            <span className="text-[var(--oracle-border-strong)]" aria-hidden="true">/</span>
            <span>2035 Perspective</span>
            <span className="text-[var(--oracle-border-strong)]" aria-hidden="true">/</span>
            <span>Cryptographic Provenance</span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border border-[var(--oracle-border-strong)] bg-[var(--oracle-surface)] px-6 py-7 sm:px-8 sm:py-9">
        <div className="absolute bottom-0 right-0 h-24 w-24 border-l border-t border-[var(--oracle-border)] bg-[var(--oracle-canvas-muted)]" aria-hidden="true" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[var(--oracle-action)]" /><span className="oracle-kicker">Epistemic Boundary & Deterministic Model</span></div>
            <p className="mt-4 max-w-[78ch] text-sm leading-6 text-[var(--oracle-text-secondary)]">
              Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct. ORACLE models structural constraints and conditional pathways without probabilistic or predictive claims.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-2">
            <OracleStateBadge state="CALCULATED" label="Deterministic" />
            <OracleStateBadge state="KNOWN" label="Provenance retained" />
            <OracleStateBadge state="UNKNOWN" label="Unknown ≠ zero" />
          </div>
          <OracleInstrumentDisclosure label="Open the ORACLE state legend" className="relative mt-5">
            <div className="grid gap-x-5 gap-y-2 text-[11px] sm:grid-cols-2">
              <div><strong className="text-[var(--oracle-text-primary)]">KNOWN</strong><span className="ml-2 text-[var(--oracle-text-secondary)]">supplied input or verified record</span></div>
              <div><strong className="text-[var(--oracle-text-primary)]">CALCULATED</strong><span className="ml-2 text-[var(--oracle-text-secondary)]">authoritative deterministic output</span></div>
              <div><strong className="text-[var(--oracle-text-primary)]">ASSUMED / ESTIMATED</strong><span className="ml-2 text-[var(--oracle-text-secondary)]">explicit but not verified</span></div>
              <div><strong className="text-[var(--oracle-text-primary)]">UNKNOWN / NOT PROVIDED</strong><span className="ml-2 text-[var(--oracle-text-secondary)]">not zero, not silently inferred</span></div>
              <div className="sm:col-span-2"><strong className="text-[var(--oracle-text-primary)]">INSUFFICIENT DATA</strong><span className="ml-2 text-[var(--oracle-text-secondary)]">the model cannot determine the measure from the supplied context</span></div>
            </div>
          </OracleInstrumentDisclosure>
        </div>
      </section>

      <section className="mt-16 flex flex-col justify-between gap-6 border-t border-[var(--oracle-border)] pt-8 sm:flex-row sm:items-center">
        <div>
          <p className="oracle-kicker">Ready to examine a decision?</p>
          <p className="mt-2 text-sm text-[var(--oracle-text-secondary)]">Start with your stated context; the system will make its boundaries visible.</p>
        </div>
        <OracleButton variant="primary" size="lg" onClick={handleStart} aria-label="Start a Decision" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Analyse a decision
        </OracleButton>
      </section>
    </div>
  );
};
