import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const ActivityProgressContext = createContext(null);

const COMPLETED_KEY = "@activityhub_completed_activities";
const RECENT_KEY = "@activityhub_recent_activities";
const MAX_RECENT_ACTIVITIES = 5;

export function ActivityProgressProvider({ children }) {
  const [completedActivityIds, setCompletedActivityIds] = useState([]);
  const [recentActivityIds, setRecentActivityIds] = useState([]);

  const [progressReady, setProgressReady] = useState(false);
  const [progressError, setProgressError] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restoreProgress() {
      try {
        const [storedCompleted, storedRecent] = await Promise.all([
          AsyncStorage.getItem(COMPLETED_KEY),
          AsyncStorage.getItem(RECENT_KEY),
        ]);

        const completed = storedCompleted ? JSON.parse(storedCompleted) : [];
        const recent = storedRecent ? JSON.parse(storedRecent) : [];

        const validCompleted = Array.isArray(completed)
          ? completed.filter((id) => typeof id === "number")
          : [];

        const validRecent = Array.isArray(recent)
          ? recent.filter((id) => typeof id === "number")
          : [];

        if (active) {
          setCompletedActivityIds(validCompleted);
          setRecentActivityIds(validRecent);
          setProgressReady(true);
        }
      } catch (error) {
        console.warn("Activity progress loading failed:", error);

        if (active) {
          setProgressError(
            "Could not restore your activity progress. Starting with a clean dashboard.",
          );
          setProgressReady(true);
        }
      }
    }

    restoreProgress();

    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!progressReady) {
      return;
    }

    AsyncStorage.setItem(
      COMPLETED_KEY,
      JSON.stringify(completedActivityIds),
    ).catch((error) => {
      console.warn("Completed activity saving failed:", error);

      if (mountedRef.current) {
        setProgressError(
          "Progress changed but could not be saved. Please try again.",
        );
      }
    });
  }, [completedActivityIds, progressReady]);

  useEffect(() => {
    if (!progressReady) {
      return;
    }

    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recentActivityIds)).catch(
      (error) => {
        console.warn("Recent activity saving failed:", error);

        if (mountedRef.current) {
          setProgressError(
            "Recent activity changed but could not be saved. Please try again.",
          );
        }
      },
    );
  }, [recentActivityIds, progressReady]);

  function toggleActivityCompletion(activityId) {
    if (typeof activityId !== "number") {
      return;
    }

    setCompletedActivityIds((currentIds) => {
      if (currentIds.includes(activityId)) {
        return currentIds.filter((id) => id !== activityId);
      }

      return [...currentIds, activityId];
    });
  }

  function markActivityCompleted(activityId) {
    if (typeof activityId !== "number") {
      return;
    }

    setCompletedActivityIds((currentIds) => {
      if (currentIds.includes(activityId)) {
        return currentIds;
      }

      return [...currentIds, activityId];
    });
  }

  function recordActivityAccessed(activityId) {
    if (typeof activityId !== "number") {
      return;
    }

    setRecentActivityIds((currentIds) => {
      const updatedIds = [
        activityId,
        ...currentIds.filter((id) => id !== activityId),
      ];

      return updatedIds.slice(0, MAX_RECENT_ACTIVITIES);
    });
  }

  function clearProgressError() {
    setProgressError("");
  }

  return (
    <ActivityProgressContext.Provider
      value={{
        completedActivityIds,
        recentActivityIds,
        progressReady,
        progressError,
        toggleActivityCompletion,
        markActivityCompleted,
        recordActivityAccessed,
        clearProgressError,
      }}
    >
      {children}
    </ActivityProgressContext.Provider>
  );
}

export function useActivityProgress() {
  const context = useContext(ActivityProgressContext);

  if (!context) {
    throw new Error(
      "useActivityProgress must be used inside ActivityProgressProvider.",
    );
  }

  return context;
}
