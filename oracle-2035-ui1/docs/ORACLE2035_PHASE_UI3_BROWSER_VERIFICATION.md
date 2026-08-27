# ORACLE 2035 — UI-3 Browser Verification

## Intake-to-review path

The live application opened Decision Core from the existing header action and advanced through all five intake transitions using the existing controls: Decision Core → Financial Reality → Execution Capacity → Commitments → Evidence & Baseline → Review. No fields were edited and no library record was saved. The purpose was to reach the existing analysis submission boundary for non-persistent visual verification.

## Review submission boundary

The Review screen remained intact after the non-persistent verification attempt; no library save or destructive mutation occurred. The canonical `Execute Analysis` control remained present, and the app retained the existing Review record and provenance boundary. The next verification step uses the non-destructive server analysis flow only to inspect the active dossier renderer.

## Fresh-page dossier load

After re-entering the default intake without changing fields and submitting the existing analysis action, the active Overview rendered the new Decision Dossier. The live page exposed sections 01–14, six separate Decision DNA classifications, the existing base/upside/downside scenario tabs, authoritative milestone markers, evidence and assumption ledgers, and provenance controls. The content retained explicit state labels and the existing server-authoritative boundary; no persistence action was used.

The above-fold desktop render shows a sticky dossier index on the left, editorial identification hero, section headers, and readable instrument surfaces. The browser console on this clean page contained only the React DevTools informational message during this inspection; the prior Vite HMR error was from an intermediate edit and was not reproduced after reloading the final page.

## Scenario interaction

The existing Upside Case tab was selected through its accessible tab element. The trajectory panel updated to the authoritative Upside Case contract, showing its existing conditional description, `Not specified` monthly net cash, `Insufficient Data` runway, no synthetic curve, and two supplied milestones including an `Insufficient data` projected-capital state. This confirms conditional/unknown states remain visible rather than being replaced with invented values.

## DNA progressive disclosure

The first Decision DNA dimension, Financial Exposure, was expanded through its existing button. Its panel exposed the existing six contributing variables, the recorded runway assumption identifier, the authoritative measurements, and the existing `Inspect Provenance` control. No new calculation, score, or probability appeared.

## Provenance drawer

The existing provenance drawer opened from the DNA detail. It displayed the server evaluation timestamp, methodology version, DNA and scenario SHA-256 fingerprints, copy controls, and `Deterministic Invariance Verified` status. No hash or provenance state was modified.

## Alternate workspace navigation

The existing What-If Studio tab opened from the dossier and displayed its existing deterministic sensitivity controls, server-evaluated response values, explicit non-probabilistic boundary copy, and `Return to Analysis` control. No What-If input was changed and no protected calculation behavior was altered. The return control restored the dossier overview with the same live analysis data.

## Responsive screenshots

A temporary Chromium DevTools Protocol check captured the live dossier at 320, 390, 768, 1280, and 1440 CSS-pixel widths. All captures rendered the dossier and all fourteen sections; the sticky index was hidden below the desktop breakpoint and visible at 1280 and 1440. The body width matched the viewport at every width. The first document overflow comparison included the vertical scrollbar width at 320 (`document.scrollWidth` 320 vs `clientWidth` 312), while `body.scrollWidth` equaled `body.clientWidth` 320; this is a scrollbar measurement artifact rather than horizontal content overflow. The 390 screenshot showed a readable mobile single-column hero and horizontally contained contextual tab strip.

The 768 screenshot showed the tablet header and dossier content flowing as a single column with readable large type and no clipped controls. The 1280 screenshot showed the intended asymmetric desktop reading: persistent left dossier index, central editorial hero, and right record-context rail. The 1440 screenshot preserved the same hierarchy with additional breathing room and no visible clipping.

## Keyboard and motion

A Tab action from the live dossier focused the `Skip to main content` link with a visible focus treatment. The page reported a `prefers-reduced-motion` CSS rule; the current browser emulation was not reduced-motion (`matchMedia` false), so content remained visible in the normal-motion run.
