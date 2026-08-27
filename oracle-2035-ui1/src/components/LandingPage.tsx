import React from "react";
import { OracleLandingPage, OracleLandingPageProps } from "./oracle/OracleLandingPage";

export interface LandingPageProps extends Partial<OracleLandingPageProps> {
  onGetStarted?: () => void;
  onLaunchV2?: () => void;
  onStartDecision?: () => void;
  onExploreLibrary?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = (props) => {
  const handleStart = () => {
    if (props.onStartDecision) {
      props.onStartDecision();
    } else if (props.onLaunchV2) {
      props.onLaunchV2();
    } else if (props.onGetStarted) {
      props.onGetStarted();
    }
  };

  return (
    <OracleLandingPage
      onStartDecision={handleStart}
      onExploreLibrary={props.onExploreLibrary}
      onGetStarted={props.onGetStarted}
      onLaunchV2={props.onLaunchV2}
    />
  );
};
