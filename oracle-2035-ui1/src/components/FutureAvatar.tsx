import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { DecisionInput, SimulationResult } from "../types";
import { askAvatarQuestion } from "../utils/oracleEngine";
import { sound } from "../utils/soundEffects";
import { 
  speak, 
  stopSpeaking, 
  toggleMute, 
  isVoiceSupported, 
  isMuted 
} from "../services/voiceEngine";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Send, 
  Bot, 
  Calendar, 
  Globe, 
  Quote,
  RotateCcw,
  Square,
  AlertCircle
} from "lucide-react";

interface FutureAvatarProps {
  simulation: SimulationResult;
  userContext: DecisionInput;
}

export const FutureAvatar: React.FC<FutureAvatarProps> = ({
  simulation,
  userContext,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(isMuted());
  const [lastResponseText, setLastResponseText] = useState("");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);

  const letter = simulation.avatarLetter;

  useEffect(() => {
    setHasVoiceSupport(isVoiceSupported());
    return () => {
      stopSpeaking();
    };
  }, []);

  // Web Speech Synthesis toggle for reading letter aloud
  const toggleVoicePlayback = () => {
    if (!hasVoiceSupport) {
      return;
    }

    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      sound.playClick();
      const fullText = `${letter.salutation}. ${letter.bodyParagraphs.join(" ")} ${letter.pivotalAdvice}`;
      setLastResponseText(fullText);
      setIsPlayingAudio(true);
      speak(fullText);
    }
  };

  const handleMuteToggle = () => {
    sound.playClick();
    const muted = toggleMute();
    setIsVoiceMuted(muted);
    if (muted) {
      setIsPlayingAudio(false);
    }
  };

  const handleReplayLast = () => {
    sound.playClick();
    const textToSpeak = lastResponseText || `${letter.salutation}. ${letter.bodyParagraphs.join(" ")} ${letter.pivotalAdvice}`;
    setIsPlayingAudio(true);
    speak(textToSpeak);
  };

  const handleStopSpeaking = () => {
    sound.playClick();
    stopSpeaking();
    setIsPlayingAudio(false);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    sound.playClick();
    const currentQ = question;
    setQuestion("");
    setIsAsking(true);

    const answer = await askAvatarQuestion(currentQ, userContext, simulation);
    sound.playPing();
    setChatHistory((prev) => [...prev, { q: currentQ, a: answer }]);
    setIsAsking(false);

    // Store & Automatically speak every Future Self response
    setLastResponseText(answer);
    speak(answer);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto space-y-12">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest"
        >
          <Bot className="w-4 h-4" />
          <span>NEURAL TEMPORAL NODE #2035-ALPHA</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          A Letter From Your Future Self
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto font-sans">
          Transmission originated from August 2035. Looking back across 9 years of decisions.
        </p>
      </div>

      {/* Main Holographic Letter Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative rounded-[32px] bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 p-6 sm:p-10 shadow-[0_0_60px_rgba(0,229,255,0.15)] overflow-hidden space-y-8"
      >
        {/* Subtle Ambient Cyber Highlights */}
        <div className="absolute right-[-20px] top-[-20px] w-64 h-64 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 border border-white/5 rounded-full pointer-events-none" />

        {/* Top Holographic Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            {/* Cybernetic Hologram Portrait Node */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-[0_0_30px_rgba(0,229,255,0.3)] shrink-0">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#3B82F6_0%,_transparent_70%)] opacity-50 absolute" />
                <Bot className="w-8 h-8 text-cyan-400 relative z-10 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-1">
                TRANSFERRED ECHO // 2035
              </div>
              <h3 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                <span>Your 2035 Future Self</span>
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Location: Neo-Tokyo / Decentralized Node</span>
              </p>
              <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Timestamp: August 6, 2035</span>
              </p>
            </div>
          </div>

          {/* Voice Audio Synthesis Player Toggle */}
          <button
            onClick={toggleVoicePlayback}
            onMouseEnter={() => sound.playHover()}
            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              isPlayingAudio
                ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,229,255,0.6)] scale-105 animate-pulse"
                : "bg-white text-black hover:bg-cyan-300 hover:scale-105"
            }`}
          >
            {isPlayingAudio ? (
              <span className="flex items-center gap-2">
                <VolumeX className="w-4 h-4" /> Pause Transmission
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Listen Transmission
              </span>
            )}
          </button>
        </div>

        {/* Emotional Cinematic Letter Text */}
        <div className="space-y-6 text-gray-200 leading-relaxed">
          <div className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono tracking-wide">
            {letter.salutation}
          </div>

          {letter.bodyParagraphs.map((paragraph, index) => (
            <p key={index} className="text-xl font-serif italic text-white/90 leading-relaxed">
              &quot;{paragraph}&quot;
            </p>
          ))}

          {/* Key Advice Callout Box */}
          <div className="relative p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 my-6 shadow-inner space-y-2">
            <Quote className="w-8 h-8 text-cyan-400/40 absolute top-4 right-4 pointer-events-none" />
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              PIVOTAL DIRECTIVE
            </div>
            <p className="text-xl font-serif italic text-white leading-relaxed">
              &quot;{letter.pivotalAdvice}&quot;
            </p>
          </div>

          <div className="pt-4 text-right font-mono text-cyan-400 text-sm font-semibold tracking-wider">
            — {letter.signature}
          </div>
        </div>
      </motion.div>

      {/* Interactive Ask Future Avatar Q&A Section */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white font-mono">
              Ask Your 2035 Avatar a Question
            </h3>
          </div>

          {/* Voice AI Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!hasVoiceSupport ? (
              <div className="text-xs text-amber-400 font-mono flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Voice is unavailable on this browser.</span>
              </div>
            ) : (
              <>
                {/* Mute / Unmute */}
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isVoiceMuted
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                  title={isVoiceMuted ? "Unmute Voice AI" : "Mute Voice AI"}
                >
                  {isVoiceMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Unmute Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mute Voice</span>
                    </>
                  )}
                </button>

                {/* Replay Last Response */}
                <button
                  type="button"
                  onClick={handleReplayLast}
                  onMouseEnter={() => sound.playHover()}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Replay Last Future Self Response"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Replay</span>
                </button>

                {/* Stop Speaking */}
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  onMouseEnter={() => sound.playHover()}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Stop Speech Output"
                >
                  <Square className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Existing Q&A History */}
        {chatHistory.length > 0 && (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {chatHistory.map((item, idx) => (
              <div key={idx} className="space-y-2 text-xs sm:text-sm font-sans">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-cyan-300 font-mono">
                  <span className="text-gray-500 mr-2">YOU:</span> {item.q}
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-white font-sans leading-relaxed">
                  <span className="text-cyan-400 font-mono font-bold block mb-1">
                    2035 AVATAR RESPONSE:
                  </span>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Question Form */}
        <form onSubmit={handleSendQuestion} className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What was the biggest mistake I made in year 2027?"
            className="flex-1 bg-[#09090B] border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            onMouseEnter={() => sound.playHover()}
            className={`px-6 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              question.trim() && !isAsking
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white cursor-pointer shadow-lg shadow-cyan-500/20"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>{isAsking ? "Transmitting..." : "Ask Avatar"}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
