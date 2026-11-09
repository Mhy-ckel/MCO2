import React, { createContext, useEffect, useRef, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext(null);

const THEME_KEY = "@activityhub_dark_mode";

export function UserProvider({ children }) {
  const [displayName, setDisplayName] = useState("Student");
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [themeError, setThemeError] = useState("");

  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const writeQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restoreTheme() {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);

        if (stored !== null) {
          const value = JSON.parse(stored);

          if (typeof value !== "boolean") {
            throw new Error("Invalid saved theme.");
          }

          if (active) {
            setDarkMode(value);
          }
        }
      } catch (error) {
        console.warn("Theme loading failed:", error);

        if (active) {
          setThemeError(
            "Could not restore your theme. Light mode is being used.",
          );
        }
      } finally {
        if (active) {
          setThemeReady(true);
        }
      }
    }

    restoreTheme();

    return () => {
      active = false;
      mountedRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function persistTheme(value) {
    writeQueueRef.current = writeQueueRef.current.then(async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, JSON.stringify(value));

        if (mountedRef.current) {
          setThemeError("");
        }
      } catch (error) {
        console.warn("Theme saving failed:", error);

        if (mountedRef.current) {
          setThemeError(
            "Theme changed but could not be saved. Toggle again to retry.",
          );
        }
      }
    });
  }

  function updateSettings(changes) {
    if (!themeReady) {
      return;
    }

    if (typeof changes.displayName === "string") {
      setDisplayName(changes.displayName);
    }

    if (typeof changes.darkMode === "boolean") {
      setDarkMode(changes.darkMode);
      persistTheme(changes.darkMode);
    }

    setSaving(true);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setSaving(false);
      }

      timerRef.current = null;
    }, 1000);
  }

  return (
    <UserContext.Provider
      value={{
        displayName,
        darkMode,
        saving,
        updateSettings,
        themeReady,
        themeError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
