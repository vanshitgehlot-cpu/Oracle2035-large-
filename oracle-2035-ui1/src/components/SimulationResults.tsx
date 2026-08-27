import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SimulationResult, FutureOutcome } from "../types";
import { sound } from "../utils/soundEffects";
import { 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  UserCheck, 
  Activity, 
  Columns3, 
  X, 
  Clock, 
  FileCheck2 
} from "lucide-react";

interface SimulationResultsProps {
  simulation: SimulationResult;
  onNavigateAvatar: () => void;
  onNavigateDna: () => void;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  simulation,
  onNavigateAvatar,
  onNavigateDna,
}) => {
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<"best" | "likely" | "worst">("best");

  const cardsData: {
    key: "best" | "likely" | "worst";
    label: string;
    tag: string;
    outcome: FutureOutcome;
    badgeBg: string;
    badgeText: string;
    topBorder: string;
    borderGlow: string;
  }[] = [
    {
      key: "best",
      label: "Favorable Scenario",
      tag: "FAVORABLE TRAJECTORY",
      outcome: simulation.bestFuture,
      badgeBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      badgeText: "text-cyan-400",
      topBorder: "border-t-4 border-t-cyan-500/80",
      borderGlow: "hover:border-cyan-400/60 shadow-cyan-500/10",
    },
    {
      key: "likely",
      label: "Baseline Scenario",
      tag: "BASELINE TRAJECTORY",
      outcome: simulation.mostLikelyFuture,
      badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      badgeText: "text-blue-400",
      topBorder: "border-t-4 border-t-blue-500/80",
      borderGlow: "hover:border-blue-400/60 shadow-blue-500/10",
    },
    {
      key: "worst",
      label: "Stress Scenario",
      tag: "STRESS TRAJECTORY",
      outcome: simulation.worstFuture,
      badgeBg: "bg-red-500/20 text-red-400 border-red-500/30",
      badgeText: "text-red-400",
      topBorder: "border-t-4 border-t-red-500/80",
      borderGlow: "hover:border-red-400/60 shadow-red-500/10",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto space-y-10">
      
      {/* Page Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Deterministic Scenario Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            Conditional Scenario Trajectories
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Explicit conditional outcomes modeled on stated constraints — not probabilistic predictions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowComparisonModal(true);
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            <Columns3 className="w-4 h-4" />
            <span>Compare Trajectories</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateAvatar();
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            <UserCheck className="w-4 h-4" />
            <span>Meet 2035 Avatar</span>
          </button>
        </div>
      </div>

      {/* Mandatory Scenario Epistemic Label */}
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2">
        <FileCheck2 className="w-4 h-4 shrink-0" />
        <span>
          <strong>Deterministic Conditional Trajectories:</strong> Calculated from explicit constraints and heuristic assumptions. These represent structural possibilities rather than predictive likelihoods.
        </span>
      </div>

      {/* 3 Premium Floating Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {cardsData.map(({ key, label, tag, outcome, badgeBg, badgeText, topBorder, borderGlow }) => {
          const isSelected = selectedTimeline === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => {
                sound.playClick();
                setSelectedTimeline(key);
              }}
              className={`relative rounded-[32px] bg-white/5 backdrop-blur-xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xl cursor-pointer ${topBorder} ${
                isSelected
                  ? "border-cyan-400 bg-white/[0.08] ring-2 ring-cyan-400/20 shadow-cyan-500/20"
                  : "border-white/10 hover:border-white/20"
              } ${borderGlow}`}
            >
              {/* Top Tag & Title */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-widest ${badgeBg} ${badgeText}`}>
                    {tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                    <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Conditional Model</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white font-sans tracking-tight mb-2">
                    {label}
                  </h3>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed line-clamp-3">
                    {outcome.summary}
                  </p>
                </div>

                {/* Turning Point Highlight */}
                <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-300 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/20">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{outcome.turningPoint}</span>
                </div>

                {/* Advantages */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Structural Advantages:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {outcome.advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Primary Stress Factors:</span>
                  </div>
                  <ul className="space-y-1.5">
                    {outcome.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onNavigateDna();
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect DNA</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onNavigateAvatar();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all"
                >
                  Explore Avatar →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {showComparisonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#09090B] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Columns3 className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white font-mono">
                    Side-by-Side Trajectory Comparison
                  </h2>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowComparisonModal(false);
                  }}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300 font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-cyan-400 font-mono">
                      <th className="p-3">DIMENSION</th>
                      <th className="p-3 text-cyan-300">FAVORABLE SCENARIO</th>
                      <th className="p-3 text-blue-300">BASELINE SCENARIO</th>
                      <th className="p-3 text-rose-300">STRESS SCENARIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-3 font-mono font-semibold text-gray-400">Trajectory Type</td>
                      <td className="p-3 font-bold text-cyan-400">Favorable Case</td>
                      <td className="p-3 font-bold text-blue-400">Baseline Case</td>
                      <td className="p-3 font-bold text-rose-400">Stress Case</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-gray-400">Turning Point</td>
                      <td className="p-3">{simulation.bestFuture.turningPoint}</td>
                      <td className="p-3">{simulation.mostLikelyFuture.turningPoint}</td>
                      <td className="p-3">{simulation.worstFuture.turningPoint}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-gray-400">Top Advantage</td>
                      <td className="p-3">{simulation.bestFuture.advantages[0]}</td>
                      <td className="p-3">{simulation.mostLikelyFuture.advantages[0]}</td>
                      <td className="p-3">{simulation.worstFuture.advantages[0]}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-gray-400">Primary Risk</td>
                      <td className="p-3">{simulation.bestFuture.risks[0]}</td>
                      <td className="p-3">{simulation.mostLikelyFuture.risks[0]}</td>
                      <td className="p-3">{simulation.worstFuture.risks[0]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowComparisonModal(false)}
                  className="px-6 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
