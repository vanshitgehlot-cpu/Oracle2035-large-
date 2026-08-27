/**
 * ORACLE 2035 — Phase 5F Decision Library Service
 * Deterministic local storage and persistence for saved decision snapshots.
 * Epistemic Invariant: Stored snapshots preserve original authoritative hashes and data.
 * Zero client recomputation on retrieval.
 */

import {
  V2DecisionPayload,
  V2AnalyzeDecisionSuccessResponse,
} from "../types/v2";

export interface SavedDecisionRecord {
  id: string;
  schemaVersion: "2.0.0";
  methodologyVersion: "2.0.0-LOCKED";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastExploredAt: string; // ISO 8601
  title: string;
  category: string;
  timeHorizon: string;
  desiredOutcome?: string;
  isBookmarked: boolean;
  userNotes?: string;
  tags?: string[];
  payload: V2DecisionPayload;
  data: V2AnalyzeDecisionSuccessResponse["data"];
  provenance: {
    dnaHash: string;
    scenarioBaseHash: string;
    scenarioDownsideHash: string;
    scenarioUpsideHash: string;
    unifiedPipelineHash: string;
  };
}

export type DecisionFilterType = "all" | "bookmarked" | "recent";
export type DecisionSortType = "recent_updated" | "recent_created" | "alphabetical";

export const LIBRARY_STORAGE_KEY = "oracle_decision_library_v2";
const LEGACY_STORAGE_KEY = "oracle_decision_history_v1";

// In-memory fallback for test or SSR environments
let inMemoryStore: SavedDecisionRecord[] = [];
let isolatedCorruptCount = 0;

// Event listeners for reactive updates
type LibraryChangeListener = () => void;
const listeners = new Set<LibraryChangeListener>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener error
    }
  });
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Returns the number of corrupted or unparseable records isolated during the last load.
 */
export function getCorruptedRecordsCount(): number {
  return isolatedCorruptCount;
}

/**
 * Validate that a loaded object complies with the minimal SavedDecisionRecord structure.
 */
export function validateSavedRecord(item: any): item is SavedDecisionRecord {
  if (!item || typeof item !== "object") return false;
  if (typeof item.id !== "string" || !item.id.trim()) return false;
  if (typeof item.title !== "string" && typeof item.title !== "undefined") return false;
  if (typeof item.payload !== "object" || !item.payload) return false;
  if (typeof item.data !== "object" || !item.data) return false;
  if (!item.data.decisionDNA || !item.data.scenarios || !item.data.auditTrail) return false;
  return true;
}

/**
 * Deduplicate records by unique ID, keeping the latest updated version.
 */
function deduplicateRecords(records: SavedDecisionRecord[]): SavedDecisionRecord[] {
  const map = new Map<string, SavedDecisionRecord>();
  for (const record of records) {
    const existing = map.get(record.id);
    if (!existing) {
      map.set(record.id, record);
    } else {
      const existingTime = new Date(existing.updatedAt || existing.createdAt).getTime();
      const recordTime = new Date(record.updatedAt || record.createdAt).getTime();
      if (recordTime >= existingTime) {
        map.set(record.id, record);
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Retrieve all valid saved decisions from persistent storage.
 * Epistemic Invariant: Corrupted records are isolated without discarding valid decisions.
 */
export function getDecisions(): SavedDecisionRecord[] {
  const storage = getStorage();
  if (!storage) {
    return deduplicateRecords(inMemoryStore.filter(validateSavedRecord));
  }

  try {
    const raw = storage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) {
      // Check legacy migration
      migrateLegacyHistory();
      const afterMigrate = storage.getItem(LIBRARY_STORAGE_KEY);
      if (!afterMigrate) return deduplicateRecords(inMemoryStore.filter(validateSavedRecord));
      const parsed = JSON.parse(afterMigrate);
      if (Array.isArray(parsed)) {
        const valid: SavedDecisionRecord[] = [];
        let corruptCount = 0;
        for (const item of parsed) {
          if (validateSavedRecord(item)) {
            valid.push(item);
          } else {
            corruptCount++;
          }
        }
        isolatedCorruptCount = corruptCount;
        return deduplicateRecords(valid);
      }
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      isolatedCorruptCount = 1;
      return deduplicateRecords(inMemoryStore.filter(validateSavedRecord));
    }

    const valid: SavedDecisionRecord[] = [];
    let corruptCount = 0;
    for (const item of parsed) {
      if (validateSavedRecord(item)) {
        valid.push(item);
      } else {
        corruptCount++;
      }
    }
    isolatedCorruptCount = corruptCount;
    return deduplicateRecords(valid);
  } catch {
    isolatedCorruptCount = 1;
    return deduplicateRecords(inMemoryStore.filter(validateSavedRecord));
  }
}

/**
 * Find a specific saved decision by its unique identifier.
 */
export function getDecisionById(id: string): SavedDecisionRecord | null {
  const all = getDecisions();
  return all.find((d) => d.id === id) || null;
}

/**
 * Save or update a decision snapshot in persistent storage.
 */
export function saveDecision(input: {
  payload: V2DecisionPayload;
  data: V2AnalyzeDecisionSuccessResponse["data"];
  id?: string;
  isBookmarked?: boolean;
  userNotes?: string;
  tags?: string[];
}): SavedDecisionRecord {
  const decisions = getDecisions();
  const now = new Date().toISOString();

  const title =
    input.payload?.decision?.decisionStatement ||
    (input.payload as any)?.decisionContext?.decisionStatement ||
    input.data?.scenarios?.baseCase?.decisionReference ||
    "Strategic Decision Analysis";

  const category =
    input.payload?.decision?.decisionCategory ||
    (input.payload as any)?.decisionContext?.decisionCategory ||
    "GENERAL";

  const timeHorizon =
    input.payload?.decision?.timeHorizon ||
    (input.payload as any)?.decisionContext?.timeHorizon ||
    input.data?.scenarios?.baseCase?.timeHorizon ||
    "10_YEARS";

  const desiredOutcome =
    input.payload?.decision?.desiredOutcome ||
    (input.payload as any)?.decisionContext?.desiredOutcome ||
    input.data?.decisionDNA?.upsidePotential?.measurements?.userStatedTargetOutcome ||
    undefined;

  const provenance = {
    dnaHash: input.data.auditTrail.dnaComputationHash,
    scenarioBaseHash: input.data.auditTrail.scenarioComputationHashes.baseCase,
    scenarioDownsideHash: input.data.auditTrail.scenarioComputationHashes.downsideStressCase,
    scenarioUpsideHash: input.data.auditTrail.scenarioComputationHashes.upsideCase,
    unifiedPipelineHash:
      (input.data.auditTrail as any).unifiedPipelineComputationHash ||
      input.data.auditTrail.dnaComputationHash,
  };

  const existingIndex = input.id ? decisions.findIndex((d) => d.id === input.id) : -1;

  let record: SavedDecisionRecord;

  if (existingIndex >= 0) {
    const existing = decisions[existingIndex];
    record = {
      ...existing,
      updatedAt: now,
      lastExploredAt: now,
      title,
      category,
      timeHorizon,
      desiredOutcome,
      isBookmarked: input.isBookmarked !== undefined ? input.isBookmarked : existing.isBookmarked,
      userNotes: input.userNotes !== undefined ? input.userNotes : existing.userNotes,
      tags: input.tags !== undefined ? input.tags : existing.tags,
      payload: input.payload,
      data: input.data,
      provenance,
    };
    decisions[existingIndex] = record;
  } else {
    const id = input.id || `dec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    record = {
      id,
      schemaVersion: "2.0.0",
      methodologyVersion: "2.0.0-LOCKED",
      createdAt: now,
      updatedAt: now,
      lastExploredAt: now,
      title,
      category,
      timeHorizon,
      desiredOutcome,
      isBookmarked: !!input.isBookmarked,
      userNotes: input.userNotes,
      tags: input.tags || [],
      payload: input.payload,
      data: input.data,
      provenance,
    };
    decisions.unshift(record);
  }

  persistDecisions(decisions);
  return record;
}

/**
 * Update an existing saved decision's metadata (e.g. bookmark, notes, tags).
 */
export function updateDecision(
  id: string,
  updates: Partial<Pick<SavedDecisionRecord, "isBookmarked" | "userNotes" | "tags" | "lastExploredAt">>
): SavedDecisionRecord | null {
  const decisions = getDecisions();
  const index = decisions.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updated: SavedDecisionRecord = {
    ...decisions[index],
    ...updates,
    updatedAt: now,
  };

  decisions[index] = updated;
  persistDecisions(decisions);
  return updated;
}

/**
 * Update user notes for a specific decision record.
 * Epistemic Invariant: Notes do NOT alter mathematical DNA, Scenarios, or hashes.
 */
export function updateDecisionNotes(id: string, userNotes: string): SavedDecisionRecord | null {
  return updateDecision(id, { userNotes });
}

/**
 * Safely save a decision with explicit success feedback.
 * Epistemic Invariant: In-memory store remains updated even if localStorage quota is exceeded.
 */
export function saveDecisionSafe(input: {
  payload: V2DecisionPayload;
  data: V2AnalyzeDecisionSuccessResponse["data"];
  id?: string;
  isBookmarked?: boolean;
  userNotes?: string;
  tags?: string[];
}): { success: boolean; record: SavedDecisionRecord; error?: string } {
  try {
    const record = saveDecision(input);
    return { success: true, record };
  } catch (err) {
    const decisions = getDecisions();
    const existing = input.id ? decisions.find((d) => d.id === input.id) : null;
    const fallbackRecord: SavedDecisionRecord = existing || {
      id: input.id || `dec_${Date.now()}`,
      schemaVersion: "2.0.0",
      methodologyVersion: "2.0.0-LOCKED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastExploredAt: new Date().toISOString(),
      title: input.payload?.decision?.decisionStatement || "Decision Analysis",
      category: input.payload?.decision?.decisionCategory || "GENERAL",
      timeHorizon: input.payload?.decision?.timeHorizon || "10_YEARS",
      desiredOutcome: input.payload?.decision?.desiredOutcome,
      isBookmarked: !!input.isBookmarked,
      userNotes: input.userNotes,
      tags: input.tags || [],
      payload: input.payload,
      data: input.data,
      provenance: {
        dnaHash: input.data.auditTrail.dnaComputationHash,
        scenarioBaseHash: input.data.auditTrail.scenarioComputationHashes.baseCase,
        scenarioDownsideHash: input.data.auditTrail.scenarioComputationHashes.downsideStressCase,
        scenarioUpsideHash: input.data.auditTrail.scenarioComputationHashes.upsideCase,
        unifiedPipelineHash:
          (input.data.auditTrail as any).unifiedPipelineComputationHash ||
          input.data.auditTrail.dnaComputationHash,
      },
    };
    return {
      success: false,
      record: fallbackRecord,
      error: "Unable to save this decision locally. Your current analysis is still available in memory.",
    };
  }
}

/**
 * Toggle the bookmark state of a saved decision.
 */
export function toggleBookmark(id: string): boolean {
  const decisions = getDecisions();
  const item = decisions.find((d) => d.id === id);
  if (!item) return false;

  const nextState = !item.isBookmarked;
  updateDecision(id, { isBookmarked: nextState });
  return nextState;
}

/**
 * Delete a saved decision record by ID.
 * Epistemic Invariant: Isolated to the target record; never affects draft or other decisions.
 */
export function deleteDecision(id: string): boolean {
  const decisions = getDecisions();
  const filtered = decisions.filter((d) => d.id !== id);
  if (filtered.length === decisions.length) return false;

  persistDecisions(filtered);
  return true;
}

/**
 * Clear all records from the library.
 */
export function clearLibrary(): void {
  persistDecisions([]);
}

/**
 * Deterministic local search, filter, and sort.
 * Epistemic Invariant: Strictly deterministic string matching and sorting.
 * Zero AI interpretation or ranking.
 */
export function searchAndFilterDecisions(options: {
  query?: string;
  filter?: DecisionFilterType;
  sort?: DecisionSortType;
  items?: SavedDecisionRecord[];
}): SavedDecisionRecord[] {
  const base = options.items || getDecisions();
  const query = (options.query || "").trim().toLowerCase();
  const filter = options.filter || "all";
  const sort = options.sort || "recent_updated";

  // 1. Filter by category / bookmark / recent
  let filtered = base.filter((item) => {
    if (filter === "bookmarked") {
      return item.isBookmarked === true;
    }
    if (filter === "recent") {
      // Items updated or created in the last 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const itemTime = new Date(item.updatedAt || item.createdAt).getTime();
      return itemTime >= thirtyDaysAgo;
    }
    return true;
  });

  // 2. Search query matching across statement, outcome, category, notes, and tags
  if (query) {
    filtered = filtered.filter((item) => {
      const statement = (item.title || "").toLowerCase();
      const outcome = (item.desiredOutcome || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const notes = (item.userNotes || "").toLowerCase();
      const tags = (item.tags || []).join(" ").toLowerCase();

      return (
        statement.includes(query) ||
        outcome.includes(query) ||
        category.includes(query) ||
        notes.includes(query) ||
        tags.includes(query)
      );
    });
  }

  // 3. Deterministic Sorting with ID tie-breaking for complete stability
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "recent_created") {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    }
    if (sort === "alphabetical") {
      const diff = a.title.localeCompare(b.title);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    }
    // Default: recent_updated / lastExploredAt
    const timeA = new Date(a.lastExploredAt || a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.lastExploredAt || b.updatedAt || b.createdAt).getTime();
    const diff = timeB - timeA;
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  return sorted;
}

/**
 * Subscribe to changes in the decision library.
 */
export function subscribeToLibrary(listener: LibraryChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Helper to persist decisions to localStorage and in-memory store.
 */
function persistDecisions(records: SavedDecisionRecord[]): void {
  inMemoryStore = [...records];
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("ORACLE Decision Library: Failed to save to localStorage.", err);
    }
  }
  notifyListeners();
}

/**
 * Safely adapt legacy history if present.
 */
function migrateLegacyHistory(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const legacy = storage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return;

    const parsed = JSON.parse(legacy);
    if (!Array.isArray(parsed)) return;

    // Migrate valid legacy entries
    const existing = inMemoryStore;
    const migrated: SavedDecisionRecord[] = [];

    parsed.forEach((oldItem) => {
      if (oldItem && oldItem.payload && oldItem.data && validateSavedRecord(oldItem)) {
        migrated.push(oldItem);
      }
    });

    if (migrated.length > 0) {
      const combined = [...existing, ...migrated];
      storage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(combined));
      inMemoryStore = combined;
    }
  } catch {
    // Migration is non-fatal
  }
}
