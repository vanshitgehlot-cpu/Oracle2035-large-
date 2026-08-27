/** Evidence Ledger Decision Library shell: all search, storage, comparison, and record handlers remain unchanged. */
import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Archive, PlusCircle, Scale, Search, X } from "lucide-react";
import { DecisionFilterType, DecisionSortType, deleteDecision, getCorruptedRecordsCount, getDecisions, SavedDecisionRecord, searchAndFilterDecisions, subscribeToLibrary, toggleBookmark } from "../../../services/oracleDecisionLibrary";
import { sound } from "../../../utils/soundEffects";
import { OracleButton } from "../OracleButton";
import { OracleDecisionCompare } from "./OracleDecisionCompare";
import { OracleDecisionRecord } from "./OracleDecisionRecord";
import { OracleDeleteDecisionModal } from "./OracleDeleteDecisionModal";
import { OracleLibraryEmptyState } from "./OracleLibraryEmptyState";
import { OracleLibraryFilters } from "./OracleLibraryFilters";

export interface OracleDecisionLibraryProps { currentDecisionId?: string; onOpenDecision: (record: SavedDecisionRecord) => void; onNewDecision: () => void; }

export const OracleDecisionLibrary: React.FC<OracleDecisionLibraryProps> = ({ currentDecisionId, onOpenDecision, onNewDecision }) => {
  const [decisions, setDecisions] = useState<SavedDecisionRecord[]>(() => getDecisions());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<DecisionFilterType>("all");
  const [sortType, setSortType] = useState<DecisionSortType>("recent_updated");
  const [dismissedCorruptWarning, setDismissedCorruptWarning] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SavedDecisionRecord | null>(null);
  const corruptCount = getCorruptedRecordsCount();
  useEffect(() => subscribeToLibrary(() => setDecisions(getDecisions())), []);
  const filteredDecisions = useMemo(() => searchAndFilterDecisions({ query: searchQuery, filter: filterType, sort: sortType, items: decisions }), [decisions, searchQuery, filterType, sortType]);
  const bookmarkedCount = useMemo(() => decisions.filter((decision) => decision.isBookmarked).length, [decisions]);
  const handleToggleBookmark = (id: string) => { sound.playClick(); toggleBookmark(id); };
  const handleToggleCompare = (id: string) => { sound.playClick(); setSelectedForCompare((previous) => { if (previous.includes(id)) return previous.filter((item) => item !== id); if (previous.length >= 2) return [previous[0], id]; return [...previous, id]; }); };
  const handleClearCompare = () => { sound.playClick(); setSelectedForCompare([]); setComparing(false); };
  const handleStartCompare = () => { if (selectedForCompare.length === 2) { sound.playClick(); setComparing(true); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const handleDeleteConfirm = (id: string) => { sound.playClick(); deleteDecision(id); setSelectedForCompare((previous) => previous.filter((item) => item !== id)); };
  const handleUpdateNotes = (id: string, notes: string) => setDecisions((previous) => previous.map((decision) => decision.id === id ? { ...decision, userNotes: notes, updatedAt: new Date().toISOString() } : decision));
  const compareRecordA = selectedForCompare[0] ? decisions.find((decision) => decision.id === selectedForCompare[0]) : null;
  const compareRecordB = selectedForCompare[1] ? decisions.find((decision) => decision.id === selectedForCompare[1]) : null;

  return <div className="oracle-library-shell oracle-dossier mx-auto min-h-[calc(100vh-72px)] w-full max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
    {comparing && compareRecordA && compareRecordB ? <OracleDecisionCompare decisionA={compareRecordA} decisionB={compareRecordB} onClose={() => setComparing(false)} onOpenDecision={onOpenDecision} /> : <>
      {corruptCount > 0 && !dismissedCorruptWarning && <div className="mb-7 flex items-start justify-between gap-4 border-l-2 border-[var(--oracle-unknown)] bg-[var(--oracle-unknown-bg)] px-4 py-3 text-xs leading-5 text-[var(--oracle-unknown)]"><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{corruptCount === 1 ? "One saved decision could not be restored. The rest of your Decision Library remains available." : `${corruptCount} saved decisions could not be restored. The rest of your Decision Library remains available.`}</span></div><button type="button" onClick={() => setDismissedCorruptWarning(true)} aria-label="Dismiss storage warning" className="min-h-[36px] shrink-0 text-[11px] font-bold underline underline-offset-2">Dismiss</button></div>}
      <header className="grid gap-7 border-b border-[var(--oracle-border-strong)] pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><p className="oracle-kicker">01 / Evidence Ledger archive</p><h1 className="oracle-display mt-3 text-5xl leading-none text-[var(--oracle-text-primary)] sm:text-6xl">Evidence Ledger</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--oracle-text-secondary)]">A private archive of the decisions you have preserved. Reopen existing snapshots, compare structural trade-offs, or export the record without recalculation.</p></div><OracleButton variant="primary" size="lg" onClick={onNewDecision} leftIcon={<PlusCircle className="h-4 w-4" />}>New Decision</OracleButton></header>
      <section className="mt-9 grid gap-5 border-b border-[var(--oracle-border)] pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><div className="mb-2 flex items-baseline justify-between"><label htmlFor="library-search" className="oracle-dossier-index">02 / Search &amp; filter</label>{decisions.length > 0 && <span className="oracle-technical text-[var(--oracle-text-muted)]">{decisions.length} RECORD{decisions.length === 1 ? "" : "S"}</span>}</div><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--oracle-text-muted)]" /><input id="library-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the archive by statement, target, notes, or category…" className="min-h-[48px] w-full border border-[var(--oracle-border-strong)] bg-[var(--oracle-surface)] py-3 pl-10 pr-11 text-sm text-[var(--oracle-text-primary)] placeholder:text-[var(--oracle-text-muted)] focus:border-[var(--oracle-action)] focus:outline-none focus:ring-1 focus:ring-[var(--oracle-action)]" />{searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear archive search" className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[var(--oracle-text-muted)] hover:bg-[var(--oracle-surface-subtle)] hover:text-[var(--oracle-text-primary)]"><X className="h-4 w-4" /></button>}</div></div>{selectedForCompare.length > 0 && <div className="flex min-h-[48px] items-center gap-3 border-l-2 border-[var(--oracle-action)] bg-[var(--oracle-action-subtle)] px-3"><Scale className="h-4 w-4 text-[var(--oracle-action)]" /><span className="oracle-technical text-[var(--oracle-action)]">{selectedForCompare.length}/2 SELECTED</span>{selectedForCompare.length === 2 && <OracleButton variant="primary" size="sm" onClick={handleStartCompare}>Compare</OracleButton>}<button type="button" onClick={handleClearCompare} aria-label="Clear comparison selection" className="ml-auto grid h-9 w-9 place-items-center text-[var(--oracle-action)] hover:bg-white/50"><X className="h-4 w-4" /></button></div>}</section>
      {decisions.length > 0 && <OracleLibraryFilters currentFilter={filterType} onFilterChange={setFilterType} currentSort={sortType} onSortChange={setSortType} totalCount={decisions.length} bookmarkedCount={bookmarkedCount} />}
      <section className="mt-8"><div className="mb-4 flex items-center justify-between">{decisions.length > 0 && <p className="oracle-dossier-index">03 / Saved decision index</p>}{decisions.length > 0 && <span className="text-[11px] text-[var(--oracle-text-muted)]">{filteredDecisions.length} shown</span>}</div>{decisions.length === 0 ? <OracleLibraryEmptyState type="empty_library" onNewDecision={onNewDecision} /> : filteredDecisions.length === 0 ? filterType === "bookmarked" && !searchQuery ? <OracleLibraryEmptyState type="no_bookmarks" onClearFilters={() => setFilterType("all")} /> : <OracleLibraryEmptyState type="no_search_results" searchQuery={searchQuery} onClearFilters={() => { setSearchQuery(""); setFilterType("all"); }} /> : <div className="divide-y divide-[var(--oracle-border)] border-y border-[var(--oracle-border-strong)]">{filteredDecisions.map((record) => <OracleDecisionRecord key={record.id} record={record} isCurrentlyOpen={record.id === currentDecisionId} isSelectedForCompare={selectedForCompare.includes(record.id)} onToggleCompare={handleToggleCompare} onOpenAnalysis={onOpenDecision} onToggleBookmark={handleToggleBookmark} onRequestDelete={setRecordToDelete} onUpdateNotes={handleUpdateNotes} />)}</div>}</section>
    </>}
    <OracleDeleteDecisionModal isOpen={!!recordToDelete} onClose={() => setRecordToDelete(null)} onConfirmDelete={handleDeleteConfirm} record={recordToDelete} />
  </div>;
};
