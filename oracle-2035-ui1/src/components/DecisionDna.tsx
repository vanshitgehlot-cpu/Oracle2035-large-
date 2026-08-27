import React, { useState } from "react";
import { motion } from "motion/react";
import { SimulationResult, DnaMetrics } from "../types";
import { sound } from "../utils/soundEffects";
import { 
  Activity, 
  Sparkles, 
  Sliders, 
  Download, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Heart, 
  CheckCircle 
} from "lucide-react";

interface DecisionDnaProps {
  simulation: SimulationResult;
}

export const DecisionDna: React.FC<DecisionDnaProps> = ({ simulation }) => {
  const [budgetMultiplier, setBudgetMultiplier] = useState(1);
  const [timelineModifier, setTimelineModifier] = useState(0); // -2 to +2
  const [riskTolerance, setRiskTolerance] = useState(5); // 1-10

  const baseDna: DnaMetrics = simulation.dnaMetrics;

  // Calculate dynamic adjusted DNA metrics based on user scenario sliders
  const adjustedRisk = Math.min(100, Math.max(10, baseDna.risk + (riskTolerance - 5) * 4 - (budgetMultiplier - 1) * 10));
  const adjustedGrowth = Math.min(100, Math.max(10, baseDna.growth + (budgetMultiplier - 1) * 15 + timelineModifier * 5));
  const adjustedLearning = Math.min(100, Math.max(10, baseDna.learning + (riskTolerance - 5) * 3));
  const adjustedTime = Math.min(100, Math.max(10, baseDna.time - timelineModifier * 10));
  const adjustedMoney = Math.min(100, Math.max(10, baseDna.money * budgetMultiplier));
  const adjustedSatisfaction = Math.min(100, Math.max(10, baseDna.personalSatisfaction + (budgetMultiplier - 1) * 5));
  const adjustedConfidence = Math.min(100, Math.max(10, baseDna.confidence + (budgetMultiplier - 1) * 8 - (riskTolerance - 5) * 2));

  const metricsList = [
    { label: "Risk", score: Math.round(adjustedRisk), icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, color: "#F59E0B" },
    { label: "Growth", score: Math.round(adjustedGrowth), icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, color: "#10B981" },
    { label: "Learning", score: Math.round(adjustedLearning), icon: <Sparkles className="w-4 h-4 text-cyan-400" />, color: "#00E5FF" },
    { label: "Time", score: Math.round(adjustedTime), icon: <Clock className="w-4 h-4 text-blue-400" />, color: "#3B82F6" },
    { label: "Money", score: Math.round(adjustedMoney), icon: <DollarSign className="w-4 h-4 text-green-400" />, color: "#22C55E" },
    { label: "Satisfaction", score: Math.round(adjustedSatisfaction), icon: <Heart className="w-4 h-4 text-pink-400" />, color: "#EC4899" },
    { label: "Confidence", score: Math.round(adjustedConfidence), icon: <CheckCircle className="w-4 h-4 text-purple-400" />, color: "#7C3AED" },
  ];

  // SVG Radar Chart Coordinates Generator
  const chartSize = 300;
  const center = chartSize / 2;
  const maxRadius = 110;
  const count = metricsList.length;

  const getCoordinates = (index: number, valuePercentage: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (maxRadius * valuePercentage) / 100;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const polygonPoints = metricsList
    .map((m, i) => {
      const { x, y } = getCoordinates(i, m.score);
      return `${x},${y}`;
    })
    .join(" ");

  const handleExport = () => {
    sound.playWarp();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulation, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ORACLE_2035_SIMULATION_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Decision DNA Diagnostics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            Multi-Dimensional Risk & Growth Radar
          </h1>
        </div>

        <button
          onClick={handleExport}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-mono font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export DNA Briefing</span>
        </button>
      </div>

      {/* Strategic Verdict Callout Banner */}
      <div className="p-6 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
            Decision DNA Analysis Verdict
          </div>
          <p className="text-base sm:text-lg font-semibold text-white font-sans">
            {baseDna.verdict}
          </p>
        </div>
      </div>

      {/* Radar Chart & Circular Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: SVG Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-6 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
        >
          <h3 className="text-lg font-bold text-white font-mono mb-4 flex items-center gap-2">
            <span>DNA Polygon Graph</span>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              7-AXIS
            </span>
          </h3>

          <div className="relative">
            <svg width={chartSize} height={chartSize} className="overflow-visible">
              {/* Concentric radar web circles */}
              {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={maxRadius * scale}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                  strokeDasharray={scale === 1 ? undefined : "3,3"}
                />
              ))}

              {/* Axis rays */}
              {metricsList.map((_, i) => {
                const { x, y } = getCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Radar Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(0, 229, 255, 0.25)"
                stroke="#00E5FF"
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              {/* Vertex Nodes & Labels */}
              {metricsList.map((m, i) => {
                const { x, y } = getCoordinates(i, m.score);
                const labelPos = getCoordinates(i, 122);

                return (
                  <g key={i}>
                    {/* Vertex point */}
                    <circle cx={x} cy={y} r="4" fill="#00E5FF" className="animate-ping" />
                    <circle cx={x} cy={y} r="4" fill={m.color} />

                    {/* Label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#E2E8F0"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {m.label} ({m.score})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </motion.div>

        {/* Right: Circular Score Indicators & Metric Cards */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span>Score Metrics Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metricsList.map((m, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  {m.icon}
                  <span className="text-xs font-mono font-bold text-gray-400">{m.label}</span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-extrabold text-white font-mono">{m.score}</span>
                  <span className="text-[10px] font-mono text-gray-500">/ 100</span>
                </div>

                <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.score}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive What-If Scenario Sliders */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-5 mt-6">
            <div className="flex items-center gap-2 text-sm font-mono text-cyan-400 font-semibold">
              <Sliders className="w-4 h-4" />
              <span>Interactive What-If Simulator</span>
            </div>

            {/* Slider 1: Capital / Budget */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Capital / Resource Multiplier</span>
                <span className="text-cyan-400 font-bold">{Math.round(budgetMultiplier * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={budgetMultiplier}
                onChange={(e) => {
                  sound.playHover();
                  setBudgetMultiplier(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Risk Tolerance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Risk Exposure Tolerance</span>
                <span className="text-amber-400 font-bold">{riskTolerance} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={riskTolerance}
                onChange={(e) => {
                  sound.playHover();
                  setRiskTolerance(parseInt(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Timeline Shift */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Timeline Shift</span>
                <span className="text-blue-400 font-bold">
                  {timelineModifier > 0 ? `+${timelineModifier} Years` : timelineModifier < 0 ? `${timelineModifier} Years` : "Standard"}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                value={timelineModifier}
                onChange={(e) => {
                  sound.playHover();
                  setTimelineModifier(parseInt(e.target.value));
                }}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
