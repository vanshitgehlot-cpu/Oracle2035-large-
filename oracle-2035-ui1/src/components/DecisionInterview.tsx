import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DecisionInput } from "../types";
import { sound } from "../utils/soundEffects";
import { 
  Target, 
  GitCommit, 
  Calendar, 
  Briefcase, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Lightbulb 
} from "lucide-react";

interface DecisionInterviewProps {
  onSubmit: (input: DecisionInput) => void;
  initialValues?: DecisionInput;
}

export const DecisionInterview: React.FC<DecisionInterviewProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [step, setStep] = useState<number>(0);
  const [input, setInput] = useState<DecisionInput>(
    initialValues || {
      goal: "",
      decision: "",
      deadline: "",
      resources: "",
      context: "",
    }
  );

  const stepsInfo = [
    {
      id: "goal",
      title: "What is your primary goal?",
      subtitle: "Define the grand objective or transformation you wish to achieve.",
      placeholder: "e.g., Launch an autonomous AI startup, Pivot career to Quantum Computing, Relocate to Tokyo",
      icon: <Target className="w-6 h-6 text-cyan-400" />,
      presets: [
        "Launch an AI SaaS Startup",
        "Pivot Career to Quantum Tech",
        "Relocate to San Francisco / Tokyo",
        "Invest $100k Seed Capital into High Risk Asset"
      ]
    },
    {
      id: "decision",
      title: "What is the key decision you are facing?",
      subtitle: "Specify the exact choice or dilemma you are evaluating right now.",
      placeholder: "e.g., Quit full-time job vs build as side-hustle, Raise VCs vs Bootstrap",
      icon: <GitCommit className="w-6 h-6 text-blue-400" />,
      presets: [
        "Quit full-time salary job immediately vs Bootstrap in off-hours",
        "Accept $500k VC funding offer vs Maintain 100% equity ownership",
        "Take high-paying corporate role vs Join early-stage stealth startup",
        "Relocate internationally vs Stay in current market"
      ]
    },
    {
      id: "deadline",
      title: "What is your timeline or deadline?",
      subtitle: "When must this decision be executed or resolved?",
      placeholder: "e.g., 3 Months, 6 Months, Q4 2026, Immediate",
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      presets: [
        "Within 30 Days (Immediate)",
        "3 to 6 Months",
        "1 Year Horizon",
        "End of 2026"
      ]
    },
    {
      id: "resources",
      title: "What resources & constraints do you have?",
      subtitle: "Include available capital, team members, time commitment, or risk tolerance.",
      placeholder: "e.g., $50,000 savings, 2 co-founders, 40 hours/week, medium-high risk tolerance",
      icon: <Briefcase className="w-6 h-6 text-emerald-400" />,
      presets: [
        "$50,000 cash runway, 2 full-time devs, high risk tolerance",
        "6 months liquid savings, solo founder, medium risk tolerance",
        "$250,000 angel investment, remote team of 4",
        "Low capital, high time availability, zero debt"
      ]
    },
    {
      id: "context",
      title: "Any additional context or variables?",
      subtitle: "Add any fears, specific constraints, or background detail for deeper accuracy.",
      placeholder: "e.g., Have family responsibilities, fear of early burn out, strong technical co-founder...",
      icon: <FileText className="w-6 h-6 text-yellow-400" />,
      presets: [
        "High personal drive, want to build long-term enterprise value.",
        "Crucial turning point in my 30s, seeking maximum growth potential.",
        "Need a safety buffer to ensure operational liquidity."
      ]
    }
  ];

  const currentStepInfo = stepsInfo[step];

  const handleNext = () => {
    sound.playClick();
    if (step < stepsInfo.length - 1) {
      setStep(step + 1);
    } else {
      sound.playWarp();
      onSubmit(input);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const applyPreset = (text: string) => {
    sound.playClick();
    const field = currentStepInfo.id as keyof DecisionInput;
    setInput((prev) => ({ ...prev, [field]: text }));
  };

  const canProceed = () => {
    if (step === 0) return input.goal.trim().length > 0;
    if (step === 1) return input.decision.trim().length > 0;
    return true; // deadline, resources, context optional
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      
      {/* Progress Indicator Header */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
          <span>INTERVIEW PHASE</span>
          <span className="text-cyan-400">Step {step + 1} of {stepsInfo.length}</span>
        </div>
        {/* Glowing Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,229,255,0.6)]"
            style={{ width: `${((step + 1) / stepsInfo.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Glass Card Question Box */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Question Header */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                {currentStepInfo.icon}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-white font-sans tracking-tight">
                  {currentStepInfo.title}
                </h2>
                <p className="text-sm text-white/50 mt-1 font-sans leading-relaxed">
                  {currentStepInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Big Input Textarea / Input Box */}
            <div className="relative">
              <textarea
                value={input[currentStepInfo.id as keyof DecisionInput]}
                onChange={(e) =>
                  setInput({ ...input, [currentStepInfo.id]: e.target.value })
                }
                placeholder={currentStepInfo.placeholder}
                rows={4}
                className="w-full bg-[#09090B]/80 border border-white/15 focus:border-cyan-400 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-sans text-base leading-relaxed"
              />
            </div>

            {/* Quick Presets Chips */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2.5 uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Quick Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentStepInfo.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    onMouseEnter={() => sound.playHover()}
                    className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            onMouseEnter={() => sound.playHover()}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all ${
              step === 0
                ? "text-gray-600 cursor-not-allowed opacity-40"
                : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            onMouseEnter={() => sound.playHover()}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all ${
              canProceed()
                ? "bg-white text-black hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 cursor-pointer"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {step === stepsInfo.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" />
                <span>Initiate Simulation</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
