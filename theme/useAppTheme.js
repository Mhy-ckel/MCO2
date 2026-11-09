import { useContext, useMemo } from "react";

import { UserContext } from "../activities/activity6/UserContext";
import { themes } from "./palettes";
import { createActivityStyles } from "../styles";
import { createHubStyles } from "../hubStyles";

export function useAppTheme() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside UserProvider.");
  }

  const { darkMode } = context;

  return useMemo(() => {
    const theme = darkMode ? themes.dark : themes.light;

    return {
      darkMode,
      theme,
      styles: createActivityStyles(theme),
      hubStyles: createHubStyles(theme),
    };
  }, [darkMode]);
}
