/** Evidence Ledger deletion confirmation: preserves the existing explicit delete callback and close order. */
import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { SavedDecisionRecord } from "../../../services/oracleDecisionLibrary";
import { OracleButton } from "../OracleButton";
import { OracleModal } from "../OracleModal";

export interface OracleDeleteDecisionModalProps { isOpen: boolean; onClose: () => void; onConfirmDelete: (id: string) => void; record: SavedDecisionRecord | null; }
export const OracleDeleteDecisionModal: React.FC<OracleDeleteDecisionModalProps> = ({ isOpen, onClose, onConfirmDelete, record }) => {
  if (!record) return null;
  const handleDelete = () => { onConfirmDelete(record.id); onClose(); };
  return <OracleModal isOpen={isOpen} onClose={onClose} title="Delete this decision?" subtitle="Remove saved analysis record" maxWidth="sm" footer={<><OracleButton variant="secondary" size="md" onClick={onClose}>Cancel</OracleButton><OracleButton variant="destructive" size="md" onClick={handleDelete} leftIcon={<Trash2 className="h-4 w-4" />}>Delete Decision</OracleButton></>}><div className="oracle-dossier space-y-5"><div className="flex gap-3 border-l-2 border-[var(--oracle-risk)] bg-[var(--oracle-risk-bg)] px-4 py-4 text-xs leading-5 text-[var(--oracle-risk)]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>This removes the saved snapshot from this device. The underlying analysis cannot be recovered from the library.</p></div><div className="border-y border-[var(--oracle-border)] py-4"><span className="oracle-technical text-[var(--oracle-text-muted)]">TARGET DECISION</span><p className="oracle-display mt-2 text-xl leading-snug text-[var(--oracle-text-primary)]">{record.title}</p></div></div></OracleModal>;
};
