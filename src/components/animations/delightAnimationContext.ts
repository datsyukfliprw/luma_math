import { createContext, useContext } from "react";
import type { DelightStarReaction, SparkleTrailId } from "./DelightAnimationProvider";

export type SendSparkleOptions = {
  fromElement: HTMLElement | null;
  trailId?: SparkleTrailId;
};

export type DelightAnimationContextValue = {
  registerStarTarget: (element: HTMLElement | null) => void;
  sendSparkleToStar: (options: SendSparkleOptions) => void;
  starReaction: DelightStarReaction;
};

export const DelightAnimationContext = createContext<DelightAnimationContextValue | null>(null);

export function useDelightAnimation() {
  const context = useContext(DelightAnimationContext);

  if (!context) {
    throw new Error("useDelightAnimation must be used inside DelightAnimationProvider");
  }

  return context;
}
