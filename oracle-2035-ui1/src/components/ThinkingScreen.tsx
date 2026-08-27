import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { DecisionInput, SimulationResult } from "../types";
import { runDecisionSimulation } from "../utils/oracleEngine";
import { sound } from "../utils/soundEffects";
import { Cpu, Terminal, ArrowRight, CheckCircle2 } from "lucide-react";

interface ThinkingScreenProps {
  input: DecisionInput;
  onComplete: (simResult: SimulationResult) => void;
}

export const ThinkingScreen: React.FC<ThinkingScreenProps> = ({
  input,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [simData, setSimData] = useState<SimulationResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const steps = [
    "Analyzing Context...",
    "Generating Future Timelines...",
    "Calculating Decision DNA...",
    "Creating Future Avatar...",
  ];

  // AI Core Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const renderCore = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 90;

      angle += 0.03;

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius + Math.sin(angle * 2) * 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00E5FF";
      ctx.stroke();

      // Middle counter-rotating ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 20, angle, angle + Math.PI * 1.5);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#3B82F6";
      ctx.stroke();

      // Inner purple pulse orb
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 45 + Math.cos(angle * 3) * 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(124, 58, 237, 0.7)";
      ctx.shadowColor = "#7C3AED";
      ctx.shadowBlur = 30;
      ctx.fill();

      // Cyber particles orbiting
      for (let i = 0; i < 8; i++) {
        const orbitA = angle * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 4;
        const ox = cx + Math.cos(orbitA) * (radius + 25);
        const oy = cy + Math.sin(orbitA) * (radius + 25);

        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "#00E5FF" : "#3B82F6";
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      frameId = requestAnimationFrame(renderCore);
    };

    renderCore();

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Simulation execution flow & step progression
  useEffect(() => {
    let mounted = true;

    const executeSimulation = async () => {
      sound.playPing();
      setLogs((l) => [...l, `[QUANTUM_INIT] Decision parameters loaded for "${input.goal.slice(0, 30)}..."`]);

      // Step 1 delay
      await new Promise((r) => setTimeout(r, 900));
      if (!mounted) return;
      setCurrentStepIndex(1);
      sound.playPing();
      setLogs((l) => [...l, `[TIMELINE_SYNTHESIS] Processing 3-tier probabilistic outcomes...`]);

      // Trigger actual AI simulation call
      const simPromise = runDecisionSimulation(input);

      // Step 2 delay
      await new Promise((r) => setTimeout(r, 1100));
      if (!mounted) return;
      setCurrentStepIndex(2);
      sound.playPing();
      setLogs((l) => [...l, `[DECISION_DNA] Mapping risk, growth & variance vectors...`]);

      // Step 3 delay
      await new Promise((r) => setTimeout(r, 1000));
      if (!mounted) return;
      setCurrentStepIndex(3);
      sound.playPing();
      setLogs((l) => [...l, `[AVATAR_ECHO] Generating 2035 temporal avatar letter...`]);

      const result = await simPromise;
      if (!mounted) return;

      setSimData(result);
      setIsFinished(true);
      sound.playWarp();
      setLogs((l) => [...l, `[COMPLETE] Quantum simulation synchronized successfully.`]);
    };

    executeSimulation();

    return () => {
      mounted = false;
    };
  }, [input]);

  const handleProceed = () => {
    if (simData) {
      sound.playClick();
      onComplete(simData);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10">
      
      {/* Central Holographic AI Core */}
      <div className="relative mb-8">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] drop-shadow-[0_0_50px_rgba(0,229,255,0.3)]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <Cpu className="w-8 h-8 text-cyan-400 animate-pulse mb-1" />
          <span className="text-[10px] font-mono text-cyan-300 tracking-widest uppercase">
            ORACLE CORE
          </span>
        </div>
      </div>

      {/* Dynamic Loading Text */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-3 tracking-wide">
          {steps[currentStepIndex]}
        </h2>
        <p className="text-sm text-cyan-400 font-mono">
          Simulating temporal shifts across 2026 – 2035...
        </p>
      </div>

      {/* Step Indicators Checklist */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8 space-y-3">
        {steps.map((stepText, idx) => {
          const isDone = idx < currentStepIndex || (idx === steps.length - 1 && isFinished);
          const isCurrent = idx === currentStepIndex && !isFinished;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs font-mono transition-all ${
                isDone
                  ? "text-cyan-300"
                  : isCurrent
                  ? "text-white font-bold"
                  : "text-gray-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                )}
              </div>
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>

      {/* Quantum Log Stream Terminal */}
      <div className="w-full max-w-md bg-[#09090B] border border-cyan-500/20 rounded-xl p-3 font-mono text-[11px] text-cyan-400/80 max-h-28 overflow-y-auto space-y-1 mb-8 shadow-inner">
        <div className="flex items-center gap-2 text-gray-500 border-b border-white/10 pb-1 mb-1">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>REAL-TIME SIMULATION LOGS</span>
        </div>
        {logs.map((log, i) => (
          <div key={i} className="leading-tight">
            {log}
          </div>
        ))}
      </div>

      {/* Reveal Button when ready */}
      {isFinished && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleProceed}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:shadow-[0_0_50px_rgba(0,229,255,0.8)] border border-cyan-300/30 transition-all cursor-pointer animate-bounce"
        >
          <span>View Quantum Futures</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};
