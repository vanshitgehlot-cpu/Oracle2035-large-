import React, { useState } from "react";
import {
  Hash,
  Download,
  RotateCcw,
  Sliders,
  Bookmark,
  Check,
  FileText,
  Archive,
} from "lucide-react";
import { OracleButton } from "../OracleButton";

export interface OracleAnalysisActionsProps {
  onOpenProvenance: () => void;
  onExploreWhatIf?: () => void;
  onExportJson: () => void;
  onExportHtml?: () => void;
  onSaveToLibrary?: () => void;
  isSaved?: boolean;
  onViewLibrary?: () => void;
  onNewDecision: () => void;
}

export const OracleAnalysisActions: React.FC<OracleAnalysisActionsProps> = ({
  onOpenProvenance,
  onExploreWhatIf,
  onExportJson,
  onExportHtml,
  onSaveToLibrary,
  isSaved = false,
  onViewLibrary,
  onNewDecision,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <section className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenProvenance}
          className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-mono text-[#38BDF8] flex items-center gap-2 transition-all cursor-pointer"
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Audit Hashes</span>
        </button>

        {/* Save to Library CTA */}
        {onSaveToLibrary && (
          <button
            type="button"
            onClick={onSaveToLibrary}
            className={`px-3.5 py-2 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              isSaved
                ? "bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]"
                : "bg-white/5 hover:bg-white/10 border-white/8 text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Library</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Library</span>
              </>
            )}
          </button>
        )}

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl bg-[#171B24] border border-white/10 shadow-2xl p-1 z-30 space-y-0.5 text-xs font-mono animate-in fade-in zoom-in-95 duration-150">
              {onExportHtml && (
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportHtml();
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-[#CBD5E1] hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Report (HTML)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportJson();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[#CBD5E1] hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>JSON Snapshot</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Navigation & Control Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {onViewLibrary && (
          <OracleButton
            variant="secondary"
            size="md"
            icon={<Archive className="w-4 h-4" />}
            onClick={onViewLibrary}
          >
            Library
          </OracleButton>
        )}

        {onExploreWhatIf && (
          <OracleButton
            variant="secondary"
            size="md"
            icon={<Sliders className="w-4 h-4" />}
            onClick={onExploreWhatIf}
          >
            Explore What-If
          </OracleButton>
        )}

        <OracleButton
          variant="primary"
          size="md"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={onNewDecision}
        >
          New Decision
        </OracleButton>
      </div>
    </section>
  );
};
