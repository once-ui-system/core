import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** The device's reduce-motion setting: animations hold still while it is on. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => live && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduce);
    return () => {
      live = false;
      sub?.remove();
    };
  }, []);
  return reduce;
}
