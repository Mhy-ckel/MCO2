import React, { createContext, useEffect, useRef, useState } from "react";

import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext(null);

const APPEARANCE_KEY = "@activityhub_appearance_mode";
const THEME_KEY = "@activityhub_dark_mode";
const NAME_KEY = "@activityhub_display_name";

export function UserProvider({ children }) {
  const [appearanceMode, setAppearanceMode] = useState("light");
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme() || "light",
  );
  const [displayName, setDisplayName] = useState("Student");

  const [themeSaving, setThemeSaving] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  const [themeReady, setThemeReady] = useState(false);

  const [themeError, setThemeError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const nameBusyRef = useRef(false);
  const themeQueueRef = useRef(Promise.resolve());

  const darkMode =
    appearanceMode === "system"
      ? systemColorScheme === "dark"
      : appearanceMode === "dark";

  useEffect(() => {
    const appearanceSubscription = Appearance.addChangeListener(
      (appearance) => {
        setSystemColorScheme(appearance.colorScheme || "light");
      },
    );

    return () => {
      appearanceSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restoreAppearance() {
      try {
        const storedAppearance = await AsyncStorage.getItem(APPEARANCE_KEY);

        if (storedAppearance !== null) {
          const value = JSON.parse(storedAppearance);

          if (!["light", "dark", "system"].includes(value)) {
            throw new Error("Invalid saved appearance mode.");
          }

          if (active) {
            setAppearanceMode(value);
          }

          return;
        }

        const storedTheme = await AsyncStorage.getItem(THEME_KEY);

        if (storedTheme !== null) {
          const value = JSON.parse(storedTheme);

          if (typeof value !== "boolean") {
            throw new Error("Invalid saved theme.");
          }

          if (active) {
            setAppearanceMode(value ? "dark" : "light");
          }
        }
      } catch (error) {
        console.warn("Appearance loading failed:", error);

        if (active) {
          setThemeError(
            "Could not restore your appearance. Light mode is being used.",
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
      await Promise.all([restoreAppearance(), restoreName()]);

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

  function persistAppearance(value) {
    themeQueueRef.current = themeQueueRef.current.then(async () => {
      try {
        await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(value));

        if (mountedRef.current) {
          setThemeError("");
        }
      } catch (error) {
        console.warn("Appearance saving failed:", error);

        if (mountedRef.current) {
          setThemeError(
            "Appearance changed but could not be saved. Please try again.",
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

    if (
      typeof changes.appearanceMode === "string" &&
      ["light", "dark", "system"].includes(changes.appearanceMode)
    ) {
      setAppearanceMode(changes.appearanceMode);
      persistAppearance(changes.appearanceMode);
      showThemeSavingFeedback();
    }

    if (typeof changes.darkMode === "boolean") {
      const nextAppearanceMode = changes.darkMode ? "dark" : "light";

      setAppearanceMode(nextAppearanceMode);
      persistAppearance(nextAppearanceMode);
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
        appearanceMode,
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
