import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const PreferencesContext = createContext(null);

const PREFERENCES_KEY = "@activityhub_preferences";

export const ACCENT_COLORS = [
  {
    key: "blue",
    label: "Blue",
    value: "#2563EB",
  },
  {
    key: "purple",
    label: "Purple",
    value: "#7C3AED",
  },
  {
    key: "green",
    label: "Green",
    value: "#047857",
  },
  {
    key: "orange",
    label: "Orange",
    value: "#D97706",
  },
  {
    key: "pink",
    label: "Pink",
    value: "#DB2777",
  },
];

const DEFAULT_PREFERENCES = {
  accentColor: "#2563EB",
  fontScale: 1,
  firstDayOfWeek: "Sunday",
  defaultCalendarView: "month",
  notifications: {
    enabled: false,
    taskReminders: true,
    calendarReminders: true,
    focusAlerts: true,
  },
};

function sanitizePreferences(preferences) {
  if (!preferences || typeof preferences !== "object") {
    return DEFAULT_PREFERENCES;
  }

  const accentColor = ACCENT_COLORS.some(
    (color) => color.value === preferences.accentColor,
  )
    ? preferences.accentColor
    : DEFAULT_PREFERENCES.accentColor;

  const fontScale =
    typeof preferences.fontScale === "number" &&
    preferences.fontScale >= 0.8 &&
    preferences.fontScale <= 1.4
      ? preferences.fontScale
      : DEFAULT_PREFERENCES.fontScale;

  const firstDayOfWeek = ["Sunday", "Monday"].includes(
    preferences.firstDayOfWeek,
  )
    ? preferences.firstDayOfWeek
    : DEFAULT_PREFERENCES.firstDayOfWeek;

  const defaultCalendarView = ["month", "week", "day"].includes(
    preferences.defaultCalendarView,
  )
    ? preferences.defaultCalendarView
    : DEFAULT_PREFERENCES.defaultCalendarView;

  const notifications = preferences.notifications || {};

  return {
    accentColor,
    fontScale,
    firstDayOfWeek,
    defaultCalendarView,
    notifications: {
      enabled: notifications.enabled === true,
      taskReminders: notifications.taskReminders !== false,
      calendarReminders: notifications.calendarReminders !== false,
      focusAlerts: notifications.focusAlerts !== false,
    },
  };
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [preferencesError, setPreferencesError] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restorePreferences() {
      try {
        const storedPreferences = await AsyncStorage.getItem(PREFERENCES_KEY);
        const parsedPreferences = storedPreferences
          ? JSON.parse(storedPreferences)
          : {};

        if (active) {
          setPreferences(sanitizePreferences(parsedPreferences));
          setPreferencesReady(true);
        }
      } catch (error) {
        console.warn("Preferences loading failed:", error);

        if (active) {
          setPreferencesError(
            "Could not restore preferences. Default settings are being used.",
          );
          setPreferencesReady(true);
        }
      }
    }

    restorePreferences();

    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!preferencesReady) {
      return;
    }

    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)).catch(
      (error) => {
        console.warn("Preferences saving failed:", error);

        if (mountedRef.current) {
          setPreferencesError(
            "Preferences changed but could not be saved. Please try again.",
          );
        }
      },
    );
  }, [preferences, preferencesReady]);

  function updatePreferences(changes) {
    setPreferences((currentPreferences) => {
      const updatedPreferences = {
        ...currentPreferences,
        ...changes,
        notifications: {
          ...currentPreferences.notifications,
          ...(changes.notifications || {}),
        },
      };

      return sanitizePreferences(updatedPreferences);
    });
  }

  function resetPreferences() {
    setPreferences(DEFAULT_PREFERENCES);
  }

  function clearPreferencesError() {
    setPreferencesError("");
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        preferencesReady,
        preferencesError,
        updatePreferences,
        resetPreferences,
        clearPreferencesError,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider.");
  }

  return context;
}
