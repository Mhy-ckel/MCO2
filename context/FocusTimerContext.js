import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FocusTimerContext = createContext(null);

const SETTINGS_KEY = "@activityhub_focus_timer_settings";
const ACTIVE_SESSION_KEY = "@activityhub_focus_timer_active_session";
const HISTORY_KEY = "@activityhub_focus_timer_history";

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  dailyGoalMinutes: 120,
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidSettings(settings) {
  return (
    Number.isFinite(settings.focusMinutes) &&
    Number.isFinite(settings.shortBreakMinutes) &&
    Number.isFinite(settings.longBreakMinutes) &&
    Number.isFinite(settings.sessionsBeforeLongBreak) &&
    Number.isFinite(settings.dailyGoalMinutes) &&
    settings.focusMinutes > 0 &&
    settings.shortBreakMinutes > 0 &&
    settings.longBreakMinutes > 0 &&
    settings.sessionsBeforeLongBreak > 0 &&
    settings.dailyGoalMinutes >= 0
  );
}

function sanitizeSettings(settings) {
  if (!settings || typeof settings !== "object") {
    return DEFAULT_SETTINGS;
  }

  const merged = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  if (!isValidSettings(merged)) {
    return DEFAULT_SETTINGS;
  }

  return {
    focusMinutes: Math.min(Math.max(Math.round(merged.focusMinutes), 1), 180),
    shortBreakMinutes: Math.min(
      Math.max(Math.round(merged.shortBreakMinutes), 1),
      60,
    ),
    longBreakMinutes: Math.min(
      Math.max(Math.round(merged.longBreakMinutes), 1),
      90,
    ),
    sessionsBeforeLongBreak: Math.min(
      Math.max(Math.round(merged.sessionsBeforeLongBreak), 1),
      8,
    ),
    dailyGoalMinutes: Math.min(
      Math.max(Math.round(merged.dailyGoalMinutes), 0),
      1440,
    ),
  };
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (session) =>
        session &&
        typeof session === "object" &&
        typeof session.id === "string" &&
        typeof session.completedAt === "string" &&
        (session.type === "focus" ||
          session.type === "shortBreak" ||
          session.type === "longBreak") &&
        Number.isFinite(session.minutes) &&
        session.minutes > 0,
    )
    .slice(0, 200);
}

function createSession(settings, type, completedFocusCount) {
  const durationMinutes =
    type === "focus"
      ? settings.focusMinutes
      : type === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;

  return {
    type,
    endsAt: null,
    remainingWhenPaused: durationMinutes * 60 * 1000,
    isRunning: false,
    sessionNumber: completedFocusCount + 1,
    completedFocusCount,
  };
}

export function FocusTimerProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeSession, setActiveSession] = useState(() =>
    createSession(DEFAULT_SETTINGS, "focus", 0),
  );
  const [history, setHistory] = useState([]);

  const [timerReady, setTimerReady] = useState(false);
  const [timerError, setTimerError] = useState("");

  const [currentTick, setCurrentTick] = useState(() => Date.now());

  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restoreTimerData() {
      try {
        const [storedSettings, storedActiveSession, storedHistory] =
          await Promise.all([
            AsyncStorage.getItem(SETTINGS_KEY),
            AsyncStorage.getItem(ACTIVE_SESSION_KEY),
            AsyncStorage.getItem(HISTORY_KEY),
          ]);

        const parsedSettings = storedSettings
          ? JSON.parse(storedSettings)
          : DEFAULT_SETTINGS;

        const parsedActiveSession = storedActiveSession
          ? JSON.parse(storedActiveSession)
          : null;

        const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];

        const safeSettings = sanitizeSettings(parsedSettings);
        const safeHistory = sanitizeHistory(parsedHistory);

        let safeActiveSession = null;

        if (
          parsedActiveSession &&
          typeof parsedActiveSession === "object" &&
          (parsedActiveSession.type === "focus" ||
            parsedActiveSession.type === "shortBreak" ||
            parsedActiveSession.type === "longBreak")
        ) {
          safeActiveSession = {
            type: parsedActiveSession.type,
            endsAt:
              typeof parsedActiveSession.endsAt === "number"
                ? parsedActiveSession.endsAt
                : null,
            remainingWhenPaused:
              typeof parsedActiveSession.remainingWhenPaused === "number"
                ? parsedActiveSession.remainingWhenPaused
                : 0,
            isRunning: parsedActiveSession.isRunning === true,
            sessionNumber:
              typeof parsedActiveSession.sessionNumber === "number"
                ? parsedActiveSession.sessionNumber
                : 1,
            completedFocusCount:
              typeof parsedActiveSession.completedFocusCount === "number"
                ? parsedActiveSession.completedFocusCount
                : 0,
          };
        }

        if (!safeActiveSession) {
          safeActiveSession = createSession(safeSettings, "focus", 0);
        }

        if (active) {
          setSettings(safeSettings);
          setActiveSession(safeActiveSession);
          setHistory(safeHistory);
          setTimerReady(true);
        }
      } catch (error) {
        console.warn("Focus timer data loading failed:", error);

        if (active) {
          setTimerError(
            "Could not restore Focus Timer data. Default settings are being used.",
          );
          setTimerReady(true);
        }
      }
    }

    restoreTimerData();

    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!timerReady) {
      return;
    }

    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(
      (error) => {
        console.warn("Focus timer settings saving failed:", error);

        if (mountedRef.current) {
          setTimerError(
            "Timer settings changed but could not be saved. Please try again.",
          );
        }
      },
    );
  }, [settings, timerReady]);

  useEffect(() => {
    if (!timerReady) {
      return;
    }

    AsyncStorage.setItem(
      ACTIVE_SESSION_KEY,
      JSON.stringify(activeSession),
    ).catch((error) => {
      console.warn("Active focus session saving failed:", error);

      if (mountedRef.current) {
        setTimerError(
          "The active session changed but could not be saved. Please try again.",
        );
      }
    });
  }, [activeSession, timerReady]);

  useEffect(() => {
    if (!timerReady) {
      return;
    }

    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(
      (error) => {
        console.warn("Focus session history saving failed:", error);

        if (mountedRef.current) {
          setTimerError(
            "Session history changed but could not be saved. Please try again.",
          );
        }
      },
    );
  }, [history, timerReady]);

  useEffect(() => {
    if (!activeSession.isRunning || !activeSession.endsAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    setCurrentTick(Date.now());

    intervalRef.current = setInterval(() => {
      setCurrentTick(Date.now());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSession.isRunning, activeSession.endsAt]);

  const remainingMilliseconds = useMemo(() => {
    if (!activeSession) {
      return 0;
    }

    if (activeSession.isRunning && activeSession.endsAt) {
      return Math.max(0, activeSession.endsAt - currentTick);
    }

    return Math.max(0, activeSession.remainingWhenPaused);
  }, [activeSession, currentTick]);

  const sessionDurationMilliseconds = useMemo(() => {
    if (!activeSession) {
      return 0;
    }

    const durationMinutes =
      activeSession.type === "focus"
        ? settings.focusMinutes
        : activeSession.type === "shortBreak"
          ? settings.shortBreakMinutes
          : settings.longBreakMinutes;

    return durationMinutes * 60 * 1000;
  }, [activeSession, settings]);

  function addHistoryRecord(type, minutes) {
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type,
      minutes,
      completedAt: new Date().toISOString(),
      taskTitle: null,
    };

    setHistory((currentHistory) => [record, ...currentHistory].slice(0, 200));
  }

  function getNextSessionType(completedFocusCount) {
    return completedFocusCount > 0 &&
      completedFocusCount % settings.sessionsBeforeLongBreak === 0
      ? "longBreak"
      : "shortBreak";
  }

  function completeSession() {
    if (!activeSession) {
      return;
    }

    if (activeSession.type === "focus") {
      addHistoryRecord("focus", settings.focusMinutes);

      const completedFocusCount = activeSession.completedFocusCount + 1;
      const nextType = getNextSessionType(completedFocusCount);

      setActiveSession(createSession(settings, nextType, completedFocusCount));
      return;
    }

    addHistoryRecord(
      activeSession.type,
      activeSession.type === "shortBreak"
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes,
    );

    setActiveSession(
      createSession(settings, "focus", activeSession.completedFocusCount),
    );
  }

  function skipSession() {
    if (!activeSession) {
      return;
    }

    if (activeSession.type === "focus") {
      const nextType = getNextSessionType(activeSession.completedFocusCount);

      setActiveSession(
        createSession(settings, nextType, activeSession.completedFocusCount),
      );
      return;
    }

    setActiveSession(
      createSession(settings, "focus", activeSession.completedFocusCount),
    );
  }

  function startSession() {
    setActiveSession((currentSession) => ({
      ...currentSession,
      endsAt: Date.now() + currentSession.remainingWhenPaused,
      isRunning: true,
    }));
  }

  function pauseSession() {
    setActiveSession((currentSession) => {
      if (!currentSession.isRunning || !currentSession.endsAt) {
        return currentSession;
      }

      const remaining = Math.max(0, currentSession.endsAt - Date.now());

      return {
        ...currentSession,
        endsAt: null,
        remainingWhenPaused: remaining,
        isRunning: false,
      };
    });
  }

  function resetSession() {
    setActiveSession((currentSession) =>
      createSession(
        settings,
        currentSession.type,
        currentSession.completedFocusCount,
      ),
    );
  }

  function selectSessionType(type) {
    if (type !== "focus" && type !== "shortBreak" && type !== "longBreak") {
      return;
    }

    setActiveSession((currentSession) =>
      createSession(settings, type, currentSession.completedFocusCount),
    );
  }

  function updateSettings(changes) {
    setSettings((currentSettings) => {
      const updatedSettings = {
        ...currentSettings,
        ...changes,
      };

      return sanitizeSettings(updatedSettings);
    });
  }

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }

      setCurrentTick(Date.now());

      if (
        activeSession.isRunning &&
        activeSession.endsAt &&
        activeSession.endsAt <= Date.now()
      ) {
        completeSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [activeSession, settings]);

  useEffect(() => {
    if (
      activeSession.isRunning &&
      activeSession.endsAt &&
      remainingMilliseconds <= 0
    ) {
      completeSession();
    }
  }, [remainingMilliseconds, activeSession, settings]);

  const todayFocusMinutes = useMemo(() => {
    const todayKey = getTodayKey();

    return history
      .filter(
        (session) =>
          session.type === "focus" &&
          session.completedAt.slice(0, 10) === todayKey,
      )
      .reduce((total, session) => total + session.minutes, 0);
  }, [history]);

  const weeklyFocusMinutes = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return history
      .filter(
        (session) =>
          session.type === "focus" &&
          new Date(session.completedAt).getTime() >= sevenDaysAgo,
      )
      .reduce((total, session) => total + session.minutes, 0);
  }, [history]);

  const completedFocusSessions = useMemo(() => {
    return history.filter((session) => session.type === "focus").length;
  }, [history]);

  const completedPomodoroCycles = useMemo(() => {
    return Math.floor(
      completedFocusSessions / settings.sessionsBeforeLongBreak,
    );
  }, [completedFocusSessions, settings.sessionsBeforeLongBreak]);

  const dailyGoalProgress =
    settings.dailyGoalMinutes === 0
      ? 0
      : Math.min(
          100,
          Math.round((todayFocusMinutes / settings.dailyGoalMinutes) * 100),
        );

  const remainingGoalMinutes = Math.max(
    0,
    settings.dailyGoalMinutes - todayFocusMinutes,
  );

  return (
    <FocusTimerContext.Provider
      value={{
        settings,
        activeSession,
        history,
        timerReady,
        timerError,
        remainingMilliseconds,
        sessionDurationMilliseconds,
        todayFocusMinutes,
        weeklyFocusMinutes,
        completedFocusSessions,
        completedPomodoroCycles,
        dailyGoalProgress,
        remainingGoalMinutes,
        startSession,
        pauseSession,
        resetSession,
        skipSession,
        selectSessionType,
        updateSettings,
        clearTimerError: () => setTimerError(""),
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimer() {
  const context = useContext(FocusTimerContext);

  if (!context) {
    throw new Error("useFocusTimer must be used inside FocusTimerProvider.");
  }

  return context;
}
