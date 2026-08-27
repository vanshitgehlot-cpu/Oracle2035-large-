import React from "react";
import { AlertTriangle } from "lucide-react";

interface OracleWarningsSectionProps {
  warnings?: string[];
}

export const OracleWarningsSection: React.FC<OracleWarningsSectionProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <section className="p-4 sm:p-5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] space-y-2">
      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Analysis Caveats & Operational Boundaries</span>
      </div>
      <ul className="list-disc list-inside space-y-1 text-xs text-[#F1F5F9]/85 pl-1 leading-relaxed">
        {warnings.map((w, idx) => (
          <li key={idx}>{w}</li>
        ))}
      </ul>
    </section>
  );
};
