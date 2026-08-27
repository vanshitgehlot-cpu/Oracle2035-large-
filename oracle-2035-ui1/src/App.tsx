import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppScreen } from "./types";
import {
  V2DecisionPayload,
  V2AnalyzeDecisionSuccessResponse,
} from "./types/v2";
import { OracleLayout } from "./components/oracle/OracleLayout";
import { OracleLandingPage } from "./components/oracle/OracleLandingPage";
import { OracleIntakeFlow } from "./components/oracle/OracleIntakeFlow";
import { OracleAnalysisWorkspace } from "./components/oracle/OracleAnalysisWorkspace";
import { OracleDecisionLibrary } from "./components/oracle/library/OracleDecisionLibrary";
import { SavedDecisionRecord } from "./services/oracleDecisionLibrary";
import { exportDecisionAsHtmlReport } from "./services/oracleExportService";

// Execution Screen Components
import { V2ThinkingScreen } from "./components/v2/V2ThinkingScreen";

import { sound } from "./utils/soundEffects";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("landing");

  // Decision States
  const [v2Payload, setV2Payload] = useState<V2DecisionPayload | null>(null);
  const [v2Result, setV2Result] = useState<V2AnalyzeDecisionSuccessResponse['data'] | null>(null);
  const [v2Error, setV2Error] = useState<{ code: string; message: string; details?: Array<{ field: string; issue: string }> } | null>(null);

  // Historical Snapshot state
  const [savedRecordId, setSavedRecordId] = useState<string | undefined>(undefined);
  const [isHistoricalSnapshot, setIsHistoricalSnapshot] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Start Decision flow from landing or header
  const handleStartDecision = () => {
    setIsHistoricalSnapshot(false);
    setSavedRecordId(undefined);
    setScreen("v2-interview");
  };

  // Submit decision payload & start analysis
  const handleIntakeSubmit = (payload: V2DecisionPayload) => {
    setV2Payload(payload);
    setV2Error(null);
    setIsHistoricalSnapshot(false);
    setSavedRecordId(undefined);
    setScreen("v2-thinking");
  };

  // Analysis complete -> show dashboard
  const handleAnalysisSuccess = (data: V2AnalyzeDecisionSuccessResponse['data']) => {
    setV2Result(data);
    setIsHistoricalSnapshot(false);
    setScreen("v2-dashboard");
  };

  // Open saved historical decision from library
  const handleOpenSavedDecision = (record: SavedDecisionRecord) => {
    sound.playClick();
    setV2Payload(record.payload);
    setV2Result(record.data);
    setSavedRecordId(record.id);
    setIsHistoricalSnapshot(true);
    setScreen("v2-dashboard");
  };

  // Error handler
  const handleAnalysisError = (err: { code: string; message: string; details?: Array<{ field: string; issue: string }> }) => {
    setV2Error(err);
    setScreen("v2-interview");
  };

  // Reset decision
  const handleResetDecision = () => {
    setV2Result(null);
    setV2Payload(null);
    setSavedRecordId(undefined);
    setIsHistoricalSnapshot(false);
    setScreen("v2-interview");
  };

  const handleExportActiveAnalysis = () => {
    if (v2Result) {
      exportDecisionAsHtmlReport({
        payload: v2Payload,
        data: v2Result,
      });
    }
  };

  const hasAnalysis = !!v2Result;

  return (
    <OracleLayout
      currentScreen={screen}
      setScreen={(s) => setScreen(s)}
      hasAnalysis={hasAnalysis}
      onNewDecision={handleStartDecision}
      onExport={hasAnalysis && v2Result ? handleExportActiveAnalysis : undefined}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
    >
      <div className="w-full flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* UNIFIED ORACLE HOMEPAGE */}
          {screen === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <OracleLandingPage 
                onStartDecision={handleStartDecision}
                onExploreLibrary={() => setScreen("library")}
                onLaunchV2={handleStartDecision}
                onGetStarted={handleStartDecision}
              />
            </motion.div>
          )}

          {/* DECISION LIBRARY SCREEN */}
          {screen === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <OracleDecisionLibrary
                currentDecisionId={savedRecordId}
                onOpenDecision={handleOpenSavedDecision}
                onNewDecision={handleStartDecision}
              />
            </motion.div>
          )}

          {/* DECISION INTAKE EXPERIENCE */}
          {(screen === "v2-interview" || screen === "interview") && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <OracleIntakeFlow
                onSubmit={handleIntakeSubmit}
                onCancel={() => setScreen("landing")}
                serverError={v2Error}
              />
            </motion.div>
          )}

          {/* COMPUTATION & THINKING STATE */}
          {(screen === "v2-thinking" || screen === "thinking") && v2Payload && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <V2ThinkingScreen
                payload={v2Payload}
                onSuccess={handleAnalysisSuccess}
                onError={handleAnalysisError}
              />
            </motion.div>
          )}

          {/* ANALYSIS WORKSPACE */}
          {(screen === "v2-dashboard" || screen === "dashboard" || screen === "results" || screen === "avatar" || screen === "dna") && v2Result && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <OracleAnalysisWorkspace
                data={v2Result}
                payload={v2Payload}
                savedRecordId={savedRecordId}
                isHistoricalSnapshot={isHistoricalSnapshot}
                onNewDecision={handleResetDecision}
                onViewLibrary={() => setScreen("library")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OracleLayout>
  );
}
