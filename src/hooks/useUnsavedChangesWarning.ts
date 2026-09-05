import { useBlocker } from "react-router-dom";

export function useUnsavedChangesWarning(active: boolean) {
  return useBlocker(
    active
      ? ({ currentLocation, nextLocation }) =>
          currentLocation.pathname !== nextLocation.pathname
      : false,
  );
}