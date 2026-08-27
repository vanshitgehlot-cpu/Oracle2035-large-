import React from "react";

import { AppScreen } from "../types";
import { sound } from "../utils/soundEffects";
import { 
  Sparkles, 
  HelpCircle, 
  Cpu, 
  TrendingUp, 
  UserCheck, 
  Activity, 
  Volume2, 
  VolumeX, 
  RotateCcw 
} from "lucide-react";

interface HeaderProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  hasSimulation: boolean;
  hasV2Result?: boolean;
  onReset: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setScreen,
  hasSimulation,
  hasV2Result,
  onReset,
  soundEnabled,
  setSoundEnabled,
}) => {
  const isV2Mode = currentScreen.startsWith('v2-');

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode; requiresSim?: boolean; requiresV2?: boolean }[] = [
    { id: "landing", label: "Overview", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "v2-interview", label: "V2 Engine", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "v2-dashboard", label: "V2 Analysis", icon: <Cpu className="w-3.5 h-3.5" />, requiresV2: true },
    { id: "interview", label: "V1 Classic", icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: "results", label: "V1 Futures", icon: <TrendingUp className="w-3.5 h-3.5" />, requiresSim: true },
    { id: "avatar", label: "V1 Avatar", icon: <UserCheck className="w-3.5 h-3.5" />, requiresSim: true },
    { id: "dna", label: "V1 DNA", icon: <Activity className="w-3.5 h-3.5" />, requiresSim: true },
  ];

  const handleNav = (id: AppScreen, requiresSim?: boolean, requiresV2?: boolean) => {
    if (requiresSim && !hasSimulation) return;
    if (requiresV2 && !hasV2Result) return;
    sound.playClick();
    setScreen(id);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090B]/70 border-b border-white/10 px-4 sm:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            sound.playClick();
            setScreen("landing");
          }}
          className="flex items-center gap-4 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 border-2 border-cyan-400 rounded-lg rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-all">
            <div className="w-3.5 h-3.5 bg-white rounded-sm -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-[0.2em] uppercase text-white group-hover:text-cyan-400 transition-colors">
                ORACLE 2035
              </span>
            </div>
            <p className="text-[10px] text-cyan-400/70 tracking-widest uppercase font-mono hidden sm:block">
              Decision Simulation Engine
            </p>
          </div>
        </button>

        {/* Minimal Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const isDisabled = (item.requiresSim && !hasSimulation) || (item.requiresV2 && !hasV2Result);

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id, item.requiresSim, item.requiresV2)}
                disabled={isDisabled}
                onMouseEnter={() => sound.playHover()}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                    : isDisabled
                    ? "text-gray-600 cursor-not-allowed opacity-50"
                    : "text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & System Status */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/50 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400">System Stable</span>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-cyan-300">
              Timeline: Alpha-7
            </div>
          </div>

          {hasSimulation && (
            <button
              onClick={() => {
                sound.playClick();
                onReset();
              }}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-1.5 text-xs font-mono text-gray-300 hover:text-cyan-400 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-all cursor-pointer uppercase tracking-wider"
              title="Start New Decision Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Simulation</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            onMouseEnter={() => sound.playHover()}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-400 border border-white/10 transition-all cursor-pointer"
            title={soundEnabled ? "Mute Audio Effects" : "Enable Audio Effects"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
