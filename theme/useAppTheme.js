import { useContext, useMemo } from "react";

import { UserContext } from "../activities/activity6/UserContext";
import { PreferencesContext } from "../context/PreferencesContext";
import { themes } from "./palettes";
import { createActivityStyles } from "../styles";
import { createHubStyles } from "../hubStyles";

export function useAppTheme() {
  const userContext = useContext(UserContext);
  const preferencesContext = useContext(PreferencesContext);

  if (!userContext) {
    throw new Error("useAppTheme must be used inside UserProvider.");
  }

  const { darkMode } = userContext;
  const accentColor = preferencesContext?.preferences?.accentColor;

  return useMemo(() => {
    let theme = darkMode ? themes.dark : themes.light;

    if (accentColor) {
      theme = {
        ...theme,
        accent: accentColor,
      };
    }

    return {
      darkMode,
      theme,
      styles: createActivityStyles(theme),
      hubStyles: createHubStyles(theme),
      fontScale: preferencesContext?.preferences?.fontScale || 1,
    };
  }, [darkMode, accentColor, preferencesContext?.preferences?.fontScale]);
}
