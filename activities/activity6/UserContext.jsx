import React, { createContext, useEffect, useRef, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext(null);

const THEME_KEY = "@activityhub_dark_mode";
const NAME_KEY = "@activityhub_display_name";

export function UserProvider({ children }) {
  const [displayName, setDisplayName] = useState("Student");
  const [darkMode, setDarkMode] = useState(false);

  const [themeSaving, setThemeSaving] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  // Existing App.jsx waits for this before showing navigation.
  const [themeReady, setThemeReady] = useState(false);

  const [themeError, setThemeError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const nameBusyRef = useRef(false);
  const themeQueueRef = useRef(Promise.resolve());

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
      }
    }

    async function restoreName() {
      try {
        const stored = await AsyncStorage.getItem(NAME_KEY);

        if (stored !== null) {
          const value = JSON.parse(stored);

          if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error("Invalid saved name.");
          }

          if (active) {
            setDisplayName(value.trim());
          }
        }
      } catch (error) {
        console.warn("Name loading failed:", error);

        if (active) {
          setProfileError(
            "Could not restore your saved name. Please enter and save it again.",
          );
        }
      }
    }

    async function loadSettings() {
      await Promise.all([restoreTheme(), restoreName()]);

      if (active) {
        setThemeReady(true);
      }
    }

    loadSettings();

    return () => {
      active = false;
      mountedRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function persistTheme(value) {
    themeQueueRef.current = themeQueueRef.current.then(async () => {
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

  function showThemeSavingFeedback() {
    setThemeSaving(true);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setThemeSaving(false);
      }

      timerRef.current = null;
    }, 1000);
  }

  async function saveDisplayName(value) {
    if (nameBusyRef.current) {
      return false;
    }

    const cleanedName = value.trim();

    if (!cleanedName) {
      setProfileError("Please enter a display name.");
      setProfileMessage("");
      return false;
    }

    if (cleanedName.length > 40) {
      setProfileError("Your display name must be 40 characters or fewer.");
      setProfileMessage("");
      return false;
    }

    nameBusyRef.current = true;

    setNameSaving(true);
    setProfileError("");
    setProfileMessage("");

    try {
      // Only change the shared name after storage succeeds.
      await AsyncStorage.setItem(NAME_KEY, JSON.stringify(cleanedName));

      if (mountedRef.current) {
        setDisplayName(cleanedName);
        setProfileMessage("Name saved successfully.");
      }

      return true;
    } catch (error) {
      console.warn("Name saving failed:", error);

      if (mountedRef.current) {
        setProfileError(
          "Could not save your name. Your previous name was kept. Please try again.",
        );
      }

      return false;
    } finally {
      nameBusyRef.current = false;

      if (mountedRef.current) {
        setNameSaving(false);
      }
    }
  }

  async function updateSettings(changes) {
    if (!themeReady) {
      return false;
    }

    if (typeof changes.darkMode === "boolean") {
      setDarkMode(changes.darkMode);
      persistTheme(changes.darkMode);
      showThemeSavingFeedback();
    }

    if (typeof changes.displayName === "string") {
      return await saveDisplayName(changes.displayName);
    }

    return true;
  }

  function clearProfileFeedback() {
    setProfileError("");
    setProfileMessage("");
  }

  return (
    <UserContext.Provider
      value={{
        displayName,
        darkMode,
        saving: themeSaving || nameSaving,
        nameSaving,
        updateSettings,
        themeReady,
        themeError,
        profileError,
        profileMessage,
        clearProfileFeedback,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
