/** Evidence Ledger empty and no-results states: preserves the existing clear and new-decision callbacks. */
import React from "react";
import { OracleButton } from "../OracleButton";

export interface OracleLibraryEmptyStateProps { type: "empty_library" | "no_search_results" | "no_bookmarks"; searchQuery?: string; onNewDecision?: () => void; onClearFilters?: () => void; }
export const OracleLibraryEmptyState: React.FC<OracleLibraryEmptyStateProps> = ({ type, searchQuery, onNewDecision, onClearFilters }) => {
  const empty = type === "empty_library";
  const title = empty ? "There are no preserved decisions yet." : type === "no_bookmarks" ? "No bookmarked decisions yet." : "No saved decision matches the current criteria.";
  const body = empty ? "Completed analyses you save will appear here as preserved local snapshots." : type === "no_bookmarks" ? "Bookmark a record to keep it at hand for a later review." : searchQuery ? `No archive records match “${searchQuery}”. Clear the search or adjust the active filter.` : "Clear the active filter to return to the complete decision archive.";
  return <div className="border-y border-[var(--oracle-border-strong)] py-16 sm:py-20"><div className="max-w-xl border-l-2 border-[var(--oracle-border-strong)] pl-5"><p className="oracle-kicker !text-[var(--oracle-text-muted)]">{empty ? "Archive status" : "Search state"}</p><h3 className="oracle-display mt-3 text-4xl leading-[1.05] text-[var(--oracle-text-primary)]">{title}</h3><p className="mt-4 text-sm leading-6 text-[var(--oracle-text-secondary)]">{body}</p><div className="mt-7">{empty && onNewDecision ? <OracleButton variant="primary" size="lg" onClick={onNewDecision}>Start a Decision</OracleButton> : onClearFilters ? <OracleButton variant="secondary" size="md" onClick={onClearFilters}>{type === "no_bookmarks" ? "View All Decisions" : "Clear filters"}</OracleButton> : null}</div></div></div>;
};
