/**
 * ORACLE 2035 — Evidence Ledger visual tokens
 * Presentation-only foundation. Domain, calculation, provenance, and persistence semantics are untouched.
 */

export const oracleTokens = {
  colors: {
    ink: "#101821",
    graphite: "#26323D",
    canvas: "#F6F3EC",
    canvasMuted: "#EBE7DD",
    surface: "#FFFDF8",
    surfaceElevated: "#FFFFFF",
    surfaceSubtle: "#F1EEE7",
    surfaceInset: "#E6E9E9",
    surfaceInverse: "#101821",
    surfaceVoid: "#0C131A",

    border: "#D8D5CC",
    borderSubtle: "#E8E5DD",
    borderStrong: "#A8A9A5",
    borderFocus: "#3158E8",

    textPrimary: "#18232D",
    textSecondary: "#58656B",
    textMuted: "#7C8587",
    textInverse: "#FFFDF8",

    action: "#3158E8",
    actionHover: "#2447C8",
    actionBright: "#7593FF",
    actionSubtle: "#E7EDFF",
    actionInk: "#18347F",

    risk: "#AF4B39",
    riskBg: "#F8E6E1",
    riskBorder: "#E8BBB1",

    unknown: "#85641D",
    unknownBg: "#F6EFD7",
    unknownBorder: "#E8D28B",

    estimated: "#7551A2",
    estimatedBg: "#EFE7F8",
    estimatedBorder: "#D4C1E8",

    immutable: "#2457F5",
    immutableBg: "#E8EDFF",
    immutableBorder: "#B9C9FF",

    provenance: "#2F705B",
    provenanceBg: "#E5F2EA",
    provenanceBorder: "#B7D9C4",
    temporal: "#5D58B8",
    temporalBg: "#EBEAFF",
    temporalBorder: "#C7C6EE",
    evidence: "#2F7184",
    evidenceBg: "#E3F1F4",
    evidenceBorder: "#B5D8DF",

    favorable: "#356A58",
    favorableBg: "#E5F1EA",
    favorableBorder: "#B7D7C3",
    baseline: "#2457F5",
    baselineBg: "#E8EDFF",
    baselineBorder: "#B9C9FF",
    stress: "#AF4B39",
    stressBg: "#F8E6E1",
    stressBorder: "#E8BBB1",
    destructive: "#AF4B39",
    destructiveBg: "#F8E6E1",
    destructiveBorder: "#E8BBB1",
  },

  typography: {
    display: '"DM Serif Display", Georgia, serif',
    functional: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    technical: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  radius: {
    xs: "2px",
    sm: "5px",
    md: "8px",
    lg: "14px",
    xl: "20px",
    pill: "9999px",
  },

  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
  },

  motion: {
    durationFast: 0.12,
    durationNormal: 0.18,
    durationSlow: 0.28,
    easeOut: [0.23, 1, 0.32, 1] as const,
    easeInOut: [0.77, 0, 0.175, 1] as const,
  },
} as const;

export type OracleColorToken = keyof typeof oracleTokens.colors;
