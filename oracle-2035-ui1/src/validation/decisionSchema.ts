/**
 * ORACLE 2035 V2 — Decision Data Validation Engine
 * 
 * Strict, pure TypeScript validation layer.
 * Rejects malformed or untrusted inputs rather than silently repairing them.
 * Explicitly preserves UNKNOWN / NOT_PROVIDED states without numerical coercion.
 */

import {
  DataAvailability,
  DataField,
  DecisionCategory,
  DecisionContext,
  TimeHorizon,
  FinancialContext,
  ResourceContext,
  OpportunityContext,
  ReversibilityContext,
  SwitchingEffortLevel,
  EvidenceItem,
  EvidenceSourceType,
  VerificationStatus,
  EvidenceRelevance,
  ConfidenceClassification,
  AssumptionItem,
  AssumptionSource,
  ImpactLevel,
  V2DecisionPayload,
  V2ValidatedDecisionContext,
} from '../types/v2';

export interface ValidationError {
  path: string;
  message: string;
  code: 'REQUIRED_FIELD_MISSING' | 'INVALID_TYPE' | 'INVALID_ENUM' | 'OUT_OF_RANGE' | 'PAYLOAD_TOO_LARGE' | 'MALFORMED_STRUCTURE' | 'UNAUTHORIZED_FIELD';
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: ValidationError[];
  data?: T;
}

// Allowed enum value sets
export const VALID_DECISION_CATEGORIES: ReadonlySet<DecisionCategory> = new Set([
  'CAREER_TRANSITION',
  'BUSINESS_STARTUP',
  'CAPITAL_ALLOCATION',
  'RELOCATION_GEO',
  'HIGHER_EDUCATION',
  'PARTNERSHIP_COLLAB',
  'PRODUCT_STRATEGY',
  'PERSONAL_LIFESTYLE',
  'STRATEGIC_OTHER',
]);

export const VALID_TIME_HORIZONS: ReadonlySet<TimeHorizon> = new Set([
  'LESS_THAN_6_MONTHS',
  '6_TO_12_MONTHS',
  '1_TO_3_YEARS',
  '3_TO_5_YEARS',
  '5_TO_10_YEARS',
  '10_PLUS_YEARS',
]);

export const VALID_DATA_AVAILABILITIES: ReadonlySet<DataAvailability> = new Set([
  'KNOWN',
  'UNKNOWN',
  'NOT_PROVIDED',
  'NOT_APPLICABLE',
  'ESTIMATED_BY_USER',
]);

export const VALID_SWITCHING_EFFORTS: ReadonlySet<SwitchingEffortLevel> = new Set([
  'LOW',
  'MEDIUM',
  'HIGH',
  'EXTREME',
]);

export const VALID_EVIDENCE_SOURCES: ReadonlySet<EvidenceSourceType> = new Set([
  'USER_STATEMENT',
  'DOCUMENT_UPLOAD',
  'THIRD_PARTY_DATA',
  'HISTORICAL_RECORD',
  'BENCHMARK_STUDY',
]);

export const VALID_VERIFICATION_STATUSES: ReadonlySet<VerificationStatus> = new Set([
  'UNVERIFIED',
  'USER_PROVIDED',
  'VERIFIED_EXTERNAL',
  'MULTI_SOURCE_VERIFIED',
]);

export const VALID_EVIDENCE_RELEVANCE: ReadonlySet<EvidenceRelevance> = new Set([
  'DIRECT',
  'INDIRECT',
  'CONTEXTUAL',
]);

export const VALID_CONFIDENCE_CLASSIFICATIONS: ReadonlySet<ConfidenceClassification> = new Set([
  'LOW',
  'MEDIUM',
  'HIGH',
]);

export const VALID_ASSUMPTION_SOURCES: ReadonlySet<AssumptionSource> = new Set([
  'USER_STATED',
  'DEFAULT_HEURISTIC',
  'CALCULATED_INFERENCE',
  'EXTERNAL_REFERENCE',
]);

export const VALID_IMPACT_LEVELS: ReadonlySet<ImpactLevel> = new Set([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

// Maximum safety string length
const MAX_STRING_LENGTH = 5000;
const MAX_ARRAY_LENGTH = 50;

/**
 * Validates safe string fields
 */
function validateString(
  value: unknown,
  path: string,
  errors: ValidationError[],
  options: { required?: boolean; minLength?: number; maxLength?: number } = {}
): string | undefined {
  const { required = true, minLength = 1, maxLength = MAX_STRING_LENGTH } = options;

  if (value === undefined || value === null) {
    if (required) {
      errors.push({
        path,
        message: `${path} is required.`,
        code: 'REQUIRED_FIELD_MISSING',
      });
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    errors.push({
      path,
      message: `${path} must be a string. Received ${typeof value}.`,
      code: 'INVALID_TYPE',
    });
    return undefined;
  }

  const trimmed = value.trim();
  if (required && trimmed.length < minLength) {
    errors.push({
      path,
      message: `${path} must be at least ${minLength} characters long.`,
      code: 'OUT_OF_RANGE',
    });
    return undefined;
  }

  if (value.length > maxLength) {
    errors.push({
      path,
      message: `${path} exceeds maximum length of ${maxLength} characters.`,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return undefined;
  }

  return value;
}

/**
 * Validates string arrays
 */
function validateStringArray(
  value: unknown,
  path: string,
  errors: ValidationError[],
  required: boolean = false
): string[] {
  if (value === undefined || value === null) {
    if (required) {
      errors.push({
        path,
        message: `${path} is required as an array of strings.`,
        code: 'REQUIRED_FIELD_MISSING',
      });
    }
    return [];
  }

  if (!Array.isArray(value)) {
    errors.push({
      path,
      message: `${path} must be an array. Received ${typeof value}.`,
      code: 'INVALID_TYPE',
    });
    return [];
  }

  if (value.length > MAX_ARRAY_LENGTH) {
    errors.push({
      path,
      message: `${path} contains too many items (max ${MAX_ARRAY_LENGTH}).`,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return [];
  }

  const validated: string[] = [];
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (typeof item !== 'string') {
      errors.push({
        path: `${path}[${i}]`,
        message: `${path}[${i}] must be a string.`,
        code: 'INVALID_TYPE',
      });
    } else if (item.length > MAX_STRING_LENGTH) {
      errors.push({
        path: `${path}[${i}]`,
        message: `${path}[${i}] exceeds maximum string length.`,
        code: 'PAYLOAD_TOO_LARGE',
      });
    } else {
      validated.push(item);
    }
  }

  return validated;
}

/**
 * Generic DataField validator for explicit availability states
 */
export function validateDataField<T>(
  raw: unknown,
  path: string,
  valueValidator: (v: unknown, subPath: string, errs: ValidationError[]) => T | undefined,
  errors: ValidationError[],
  defaultState: DataAvailability = 'NOT_PROVIDED'
): DataField<T> {
  if (raw === undefined || raw === null) {
    return {
      state: defaultState,
    };
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({
      path,
      message: `${path} must be a DataField object with a 'state' property.`,
      code: 'INVALID_TYPE',
    });
    return { state: 'UNKNOWN' };
  }

  const fieldObj = raw as Record<string, unknown>;
  const rawState = fieldObj.state;

  if (rawState === undefined || rawState === null) {
    // If value is provided directly without explicit state, infer KNOWN if value valid
    if (fieldObj.value !== undefined) {
      const parsedVal = valueValidator(fieldObj.value, `${path}.value`, errors);
      return {
        value: parsedVal,
        state: 'KNOWN',
        source: typeof fieldObj.source === 'string' ? fieldObj.source : undefined,
        notes: typeof fieldObj.notes === 'string' ? fieldObj.notes : undefined,
      };
    }
    return { state: defaultState };
  }

  if (typeof rawState !== 'string' || !VALID_DATA_AVAILABILITIES.has(rawState as DataAvailability)) {
    errors.push({
      path: `${path}.state`,
      message: `${path}.state must be one of: ${Array.from(VALID_DATA_AVAILABILITIES).join(', ')}.`,
      code: 'INVALID_ENUM',
    });
    return { state: 'UNKNOWN' };
  }

  const state = rawState as DataAvailability;
  let parsedValue: T | undefined = undefined;

  if (state === 'KNOWN' || state === 'ESTIMATED_BY_USER') {
    if (fieldObj.value === undefined || fieldObj.value === null) {
      errors.push({
        path: `${path}.value`,
        message: `${path} is marked as '${state}' but no value was provided.`,
        code: 'REQUIRED_FIELD_MISSING',
      });
    } else {
      parsedValue = valueValidator(fieldObj.value, `${path}.value`, errors);
    }
  } else {
    // If state is UNKNOWN / NOT_PROVIDED / NOT_APPLICABLE, value should not be treated as 0
    parsedValue = undefined;
  }

  return {
    value: parsedValue,
    state,
    source: typeof fieldObj.source === 'string' ? fieldObj.source : undefined,
    notes: typeof fieldObj.notes === 'string' ? fieldObj.notes : undefined,
  };
}

/**
 * Validates a non-negative number
 */
function validateNonNegativeNumber(
  value: unknown,
  path: string,
  errors: ValidationError[],
  maxLimit: number = 1_000_000_000_000
): number | undefined {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    errors.push({
      path,
      message: `${path} must be a valid finite number.`,
      code: 'INVALID_TYPE',
    });
    return undefined;
  }

  if (value < 0) {
    errors.push({
      path,
      message: `${path} must be non-negative (>= 0). Received ${value}.`,
      code: 'OUT_OF_RANGE',
    });
    return undefined;
  }

  if (value > maxLimit) {
    errors.push({
      path,
      message: `${path} exceeds upper boundary limit (${maxLimit}).`,
      code: 'OUT_OF_RANGE',
    });
    return undefined;
  }

  return value;
}

/**
 * Validates a real number (can be positive or negative, e.g. income change)
 */
function validateRealNumber(
  value: unknown,
  path: string,
  errors: ValidationError[],
  minLimit: number = -1_000_000_000,
  maxLimit: number = 1_000_000_000
): number | undefined {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    errors.push({
      path,
      message: `${path} must be a valid finite number.`,
      code: 'INVALID_TYPE',
    });
    return undefined;
  }

  if (value < minLimit || value > maxLimit) {
    errors.push({
      path,
      message: `${path} must be between ${minLimit} and ${maxLimit}.`,
      code: 'OUT_OF_RANGE',
    });
    return undefined;
  }

  return value;
}

/**
 * Validates Decision Context section
 */
export function validateDecisionContext(
  raw: unknown,
  errors: ValidationError[]
): DecisionContext | undefined {
  const path = 'decision';
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({
      path,
      message: 'decision context is required and must be an object.',
      code: 'REQUIRED_FIELD_MISSING',
    });
    return undefined;
  }

  const obj = raw as Record<string, unknown>;

  const statement = validateString(obj.decisionStatement, 'decision.decisionStatement', errors, {
    required: true,
    minLength: 3,
  });

  const rawCat = obj.decisionCategory;
  let category: DecisionCategory = 'STRATEGIC_OTHER';
  if (!rawCat) {
    errors.push({
      path: 'decision.decisionCategory',
      message: 'decision.decisionCategory is required.',
      code: 'REQUIRED_FIELD_MISSING',
    });
  } else if (typeof rawCat !== 'string' || !VALID_DECISION_CATEGORIES.has(rawCat as DecisionCategory)) {
    errors.push({
      path: 'decision.decisionCategory',
      message: `decision.decisionCategory must be one of: ${Array.from(VALID_DECISION_CATEGORIES).join(', ')}.`,
      code: 'INVALID_ENUM',
    });
  } else {
    category = rawCat as DecisionCategory;
  }

  const currentSituation = validateString(obj.currentSituation, 'decision.currentSituation', errors, {
    required: true,
    minLength: 3,
  }) || '';

  const desiredOutcome = validateString(obj.desiredOutcome, 'decision.desiredOutcome', errors, {
    required: true,
    minLength: 3,
  }) || '';

  const alternatives = validateStringArray(obj.alternatives, 'decision.alternatives', errors, false);

  const rawHorizon = obj.timeHorizon;
  let timeHorizon: TimeHorizon = '1_TO_3_YEARS';
  if (!rawHorizon) {
    errors.push({
      path: 'decision.timeHorizon',
      message: 'decision.timeHorizon is required.',
      code: 'REQUIRED_FIELD_MISSING',
    });
  } else if (typeof rawHorizon !== 'string' || !VALID_TIME_HORIZONS.has(rawHorizon as TimeHorizon)) {
    errors.push({
      path: 'decision.timeHorizon',
      message: `decision.timeHorizon must be one of: ${Array.from(VALID_TIME_HORIZONS).join(', ')}.`,
      code: 'INVALID_ENUM',
    });
  } else {
    timeHorizon = rawHorizon as TimeHorizon;
  }

  if (!statement) return undefined;

  return {
    decisionStatement: statement,
    decisionCategory: category,
    currentSituation,
    desiredOutcome,
    alternatives,
    timeHorizon,
  };
}

/**
 * Validates Financial Context section
 */
export function validateFinancialContext(
  raw: unknown,
  errors: ValidationError[]
): FinancialContext {
  const obj = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {};

  return {
    currentMonthlyIncome: validateDataField(
      obj.currentMonthlyIncome,
      'financial.currentMonthlyIncome',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    recurringMonthlyExpenses: validateDataField(
      obj.recurringMonthlyExpenses,
      'financial.recurringMonthlyExpenses',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    availableLiquidCapital: validateDataField(
      obj.availableLiquidCapital,
      'financial.availableLiquidCapital',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    existingFinancialObligations: validateDataField(
      obj.existingFinancialObligations,
      'financial.existingFinancialObligations',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    expectedIncomeChangeMonthly: validateDataField(
      obj.expectedIncomeChangeMonthly,
      'financial.expectedIncomeChangeMonthly',
      (v, p, errs) => validateRealNumber(v, p, errs),
      errors
    ),
    requiredUpfrontCapital: validateDataField(
      obj.requiredUpfrontCapital,
      'financial.requiredUpfrontCapital',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    currency: typeof obj.currency === 'string' ? obj.currency.slice(0, 10) : 'USD',
  };
}

/**
 * Validates Resource Context section
 */
export function validateResourceContext(
  raw: unknown,
  errors: ValidationError[]
): ResourceContext {
  const obj = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {};

  return {
    relevantSkills: validateDataField(
      obj.relevantSkills,
      'resources.relevantSkills',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
    experienceYears: validateDataField(
      obj.experienceYears,
      'resources.experienceYears',
      (v, p, errs) => {
        if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) {
          errs.push({
            path: p,
            message: `${p} must be a valid finite number.`,
            code: 'INVALID_TYPE',
          });
          return undefined;
        }
        if (v < 0 || v > 100) {
          errs.push({
            path: p,
            message: `${p} must be between 0 and 100 years of experience (received ${v}). Out of range values are rejected without silent clamping.`,
            code: 'OUT_OF_RANGE',
          });
          return undefined;
        }
        return v;
      },
      errors
    ),
    availableWeeklyHours: validateDataField(
      obj.availableWeeklyHours,
      'resources.availableWeeklyHours',
      (v, p, errs) => {
        if (typeof v !== 'number' || isNaN(v) || !isFinite(v)) {
          errs.push({
            path: p,
            message: `${p} must be a valid finite number.`,
            code: 'INVALID_TYPE',
          });
          return undefined;
        }
        if (v < 0 || v > 168) {
          errs.push({
            path: p,
            message: `${p} must be between 0 and 168 hours per week (received ${v}). Out of range values are rejected without silent clamping.`,
            code: 'OUT_OF_RANGE',
          });
          return undefined;
        }
        return v;
      },
      errors
    ),
    availableSupportNetwork: validateDataField(
      obj.availableSupportNetwork,
      'resources.availableSupportNetwork',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
    availablePhysicalAssets: validateDataField(
      obj.availablePhysicalAssets,
      'resources.availablePhysicalAssets',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
  };
}

/**
 * Validates Opportunity Context section
 */
export function validateOpportunityContext(
  raw: unknown,
  errors: ValidationError[]
): OpportunityContext {
  const obj = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {};

  const primaryOpportunity = validateString(
    obj.primaryOpportunity,
    'opportunity.primaryOpportunity',
    errors,
    { required: false }
  ) || '';

  const alternativesConsidered = validateStringArray(
    obj.alternativesConsidered,
    'opportunity.alternativesConsidered',
    errors,
    false
  );

  return {
    primaryOpportunity,
    alternativesConsidered,
    opportunityCostSummary: validateDataField(
      obj.opportunityCostSummary,
      'opportunity.opportunityCostSummary',
      (v, p, errs) => validateString(v, p, errs, { required: true }),
      errors
    ),
    foregoneBenefits: validateDataField(
      obj.foregoneBenefits,
      'opportunity.foregoneBenefits',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
  };
}

/**
 * Validates Reversibility Context section
 */
export function validateReversibilityContext(
  raw: unknown,
  errors: ValidationError[]
): ReversibilityContext {
  const obj = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? (raw as Record<string, unknown>) : {};

  return {
    estimatedSwitchingEffort: validateDataField(
      obj.estimatedSwitchingEffort,
      'reversibility.estimatedSwitchingEffort',
      (v, p, errs) => {
        if (typeof v !== 'string' || !VALID_SWITCHING_EFFORTS.has(v as SwitchingEffortLevel)) {
          errs.push({
            path: p,
            message: `${p} must be one of: ${Array.from(VALID_SWITCHING_EFFORTS).join(', ')}.`,
            code: 'INVALID_ENUM',
          });
          return undefined;
        }
        return v as SwitchingEffortLevel;
      },
      errors
    ),
    irreversibleCommitments: validateDataField(
      obj.irreversibleCommitments,
      'reversibility.irreversibleCommitments',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
    sunkCostsAmount: validateDataField(
      obj.sunkCostsAmount,
      'reversibility.sunkCostsAmount',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs),
      errors
    ),
    contractualConstraints: validateDataField(
      obj.contractualConstraints,
      'reversibility.contractualConstraints',
      (v, p, errs) => validateStringArray(v, p, errs, true),
      errors
    ),
    unwindingTimeMonths: validateDataField(
      obj.unwindingTimeMonths,
      'reversibility.unwindingTimeMonths',
      (v, p, errs) => validateNonNegativeNumber(v, p, errs, 240),
      errors
    ),
  };
}

/**
 * Validates Evidence Item list
 */
export function validateEvidenceList(
  raw: unknown,
  errors: ValidationError[]
): EvidenceItem[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    errors.push({
      path: 'evidence',
      message: 'evidence must be an array of EvidenceItem objects.',
      code: 'INVALID_TYPE',
    });
    return [];
  }

  if (raw.length > MAX_ARRAY_LENGTH) {
    errors.push({
      path: 'evidence',
      message: `evidence array exceeds maximum length of ${MAX_ARRAY_LENGTH}.`,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return [];
  }

  const validated: EvidenceItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const path = `evidence[${i}]`;

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push({
        path,
        message: `${path} must be a valid EvidenceItem object.`,
        code: 'MALFORMED_STRUCTURE',
      });
      continue;
    }

    const id = validateString(item.id, `${path}.id`, errors, { required: true });
    const description = validateString(item.description, `${path}.description`, errors, { required: true });

    let sourceType: EvidenceSourceType = 'USER_STATEMENT';
    if (!item.sourceType || typeof item.sourceType !== 'string' || !VALID_EVIDENCE_SOURCES.has(item.sourceType as EvidenceSourceType)) {
      errors.push({
        path: `${path}.sourceType`,
        message: `${path}.sourceType must be one of: ${Array.from(VALID_EVIDENCE_SOURCES).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      sourceType = item.sourceType as EvidenceSourceType;
    }

    let verificationStatus: VerificationStatus = 'UNVERIFIED';
    if (!item.verificationStatus || typeof item.verificationStatus !== 'string' || !VALID_VERIFICATION_STATUSES.has(item.verificationStatus as VerificationStatus)) {
      errors.push({
        path: `${path}.verificationStatus`,
        message: `${path}.verificationStatus must be one of: ${Array.from(VALID_VERIFICATION_STATUSES).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      verificationStatus = item.verificationStatus as VerificationStatus;
    }

    let relevance: EvidenceRelevance = 'DIRECT';
    if (!item.relevance || typeof item.relevance !== 'string' || !VALID_EVIDENCE_RELEVANCE.has(item.relevance as EvidenceRelevance)) {
      errors.push({
        path: `${path}.relevance`,
        message: `${path}.relevance must be one of: ${Array.from(VALID_EVIDENCE_RELEVANCE).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      relevance = item.relevance as EvidenceRelevance;
    }

    let confidenceClassification: ConfidenceClassification = 'MEDIUM';
    if (!item.confidenceClassification || typeof item.confidenceClassification !== 'string' || !VALID_CONFIDENCE_CLASSIFICATIONS.has(item.confidenceClassification as ConfidenceClassification)) {
      errors.push({
        path: `${path}.confidenceClassification`,
        message: `${path}.confidenceClassification must be one of: ${Array.from(VALID_CONFIDENCE_CLASSIFICATIONS).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      confidenceClassification = item.confidenceClassification as ConfidenceClassification;
    }

    const supportsVariables = validateStringArray(item.supportsVariables, `${path}.supportsVariables`, errors, false);

    if (id && description) {
      validated.push({
        id,
        sourceType,
        sourceReference: typeof item.sourceReference === 'string' ? item.sourceReference : undefined,
        description,
        dateRecorded: typeof item.dateRecorded === 'string' ? item.dateRecorded : undefined,
        verificationStatus,
        relevance,
        confidenceClassification,
        supportsVariables,
      });
    }
  }

  return validated;
}

/**
 * Validates Assumption Item list
 */
export function validateAssumptionList(
  raw: unknown,
  errors: ValidationError[]
): AssumptionItem[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    errors.push({
      path: 'assumptions',
      message: 'assumptions must be an array of AssumptionItem objects.',
      code: 'INVALID_TYPE',
    });
    return [];
  }

  if (raw.length > MAX_ARRAY_LENGTH) {
    errors.push({
      path: 'assumptions',
      message: `assumptions array exceeds maximum length of ${MAX_ARRAY_LENGTH}.`,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return [];
  }

  const validated: AssumptionItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    const path = `assumptions[${i}]`;

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push({
        path,
        message: `${path} must be a valid AssumptionItem object.`,
        code: 'MALFORMED_STRUCTURE',
      });
      continue;
    }

    const id = validateString(item.id, `${path}.id`, errors, { required: true });
    const statement = validateString(item.statement, `${path}.statement`, errors, { required: true });
    const relatedVariable = validateString(item.relatedVariable, `${path}.relatedVariable`, errors, { required: true }) || 'general';

    let source: AssumptionSource = 'USER_STATED';
    if (!item.source || typeof item.source !== 'string' || !VALID_ASSUMPTION_SOURCES.has(item.source as AssumptionSource)) {
      errors.push({
        path: `${path}.source`,
        message: `${path}.source must be one of: ${Array.from(VALID_ASSUMPTION_SOURCES).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      source = item.source as AssumptionSource;
    }

    let confidence: ConfidenceClassification = 'MEDIUM';
    if (!item.confidence || typeof item.confidence !== 'string' || !VALID_CONFIDENCE_CLASSIFICATIONS.has(item.confidence as ConfidenceClassification)) {
      errors.push({
        path: `${path}.confidence`,
        message: `${path}.confidence must be one of: ${Array.from(VALID_CONFIDENCE_CLASSIFICATIONS).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      confidence = item.confidence as ConfidenceClassification;
    }

    let impactIfChanged: ImpactLevel = 'MEDIUM';
    if (!item.impactIfChanged || typeof item.impactIfChanged !== 'string' || !VALID_IMPACT_LEVELS.has(item.impactIfChanged as ImpactLevel)) {
      errors.push({
        path: `${path}.impactIfChanged`,
        message: `${path}.impactIfChanged must be one of: ${Array.from(VALID_IMPACT_LEVELS).join(', ')}.`,
        code: 'INVALID_ENUM',
      });
    } else {
      impactIfChanged = item.impactIfChanged as ImpactLevel;
    }

    if (id && statement) {
      validated.push({
        id,
        statement,
        relatedVariable,
        value: typeof item.value === 'string' || typeof item.value === 'number' || typeof item.value === 'boolean' ? item.value : undefined,
        unit: typeof item.unit === 'string' ? item.unit : undefined,
        source,
        confidence,
        impactIfChanged,
      });
    }
  }

  return validated;
}

/**
 * Allowed top-level property keys in V2DecisionPayload
 */
const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'decision',
  'financial',
  'resources',
  'opportunity',
  'reversibility',
  'evidence',
  'assumptions',
  'metadata',
]);

/**
 * Checks for and flags unauthorized client-supplied calculated metrics
 */
function checkForUnauthorizedClientMetrics(rawPayload: unknown, errors: ValidationError[]): void {
  if (!rawPayload || typeof rawPayload !== 'object') return;
  const obj = rawPayload as Record<string, unknown>;

  const forbiddenCalculatedKeys = [
    'calculatedDNA',
    'dnaScores',
    'decisionDNA',
    'calculatedScores',
    'overallScore',
    'probabilities',
    'scenarioProbabilities',
    'simulationProbabilities',
    'futureProbabilities',
    'calculatedVerdict',
    'confidenceScore',
    'scenarioOutcomes',
    'scenarios',
    'deterministicComputationHash',
    'provenance',
    'serverEvaluatedAt',
  ];

  for (const key of forbiddenCalculatedKeys) {
    if (key in obj && obj[key] !== undefined) {
      errors.push({
        path: key,
        message: `Client-supplied calculated metric '${key}' is rejected. The server is the sole authoritative source for calculated metrics.`,
        code: 'UNAUTHORIZED_FIELD',
      });
    }
  }
}

/**
 * Checks for unknown / unrecognized top-level and section properties
 */
function checkForUnknownProperties(rawPayload: unknown, errors: ValidationError[]): void {
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) return;
  const obj = rawPayload as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      // If it is not already flagged as an unauthorized calculated field, flag as unknown field
      const isCalculatedKey = [
        'calculatedDNA', 'dnaScores', 'decisionDNA', 'calculatedScores',
        'overallScore', 'probabilities', 'scenarioProbabilities',
        'simulationProbabilities', 'futureProbabilities', 'calculatedVerdict',
        'confidenceScore', 'scenarioOutcomes', 'scenarios',
        'deterministicComputationHash', 'provenance', 'serverEvaluatedAt',
      ].includes(key);

      if (!isCalculatedKey) {
        errors.push({
          path: key,
          message: `Unrecognized unknown property '${key}' is rejected by strict validation.`,
          code: 'UNAUTHORIZED_FIELD',
        });
      }
    }
  }
}

/**
 * Main Entry Point: Validates an entire V2 decision payload
 */
export function validateV2DecisionPayload(rawPayload: unknown): ValidationResult<V2ValidatedDecisionContext> {
  const errors: ValidationError[] = [];

  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return {
      valid: false,
      errors: [{
        path: 'root',
        message: 'Payload must be a non-null JSON object.',
        code: 'MALFORMED_STRUCTURE',
      }],
    };
  }

  // Check against client-supplied calculations
  checkForUnauthorizedClientMetrics(rawPayload, errors);

  // Check for unexpected unknown properties
  checkForUnknownProperties(rawPayload, errors);

  const payload = rawPayload as V2DecisionPayload;

  const decision = validateDecisionContext(payload.decision, errors);
  const financial = validateFinancialContext(payload.financial, errors);
  const resources = validateResourceContext(payload.resources, errors);
  const opportunity = validateOpportunityContext(payload.opportunity, errors);
  const reversibility = validateReversibilityContext(payload.reversibility, errors);
  const evidence = validateEvidenceList(payload.evidence, errors);
  const assumptions = validateAssumptionList(payload.assumptions, errors);

  if (errors.length > 0 || !decision) {
    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    errors: [],
    data: {
      decision,
      financial,
      resources,
      opportunity,
      reversibility,
      evidence,
      assumptions,
      validatedAt: new Date().toISOString(),
      validationVersion: '2.0.0',
    },
  };
}
