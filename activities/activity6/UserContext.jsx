import React, { createContext, useEffect, useRef, useState } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [displayName, setDisplayName] = useState("Student");
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function updateSettings(changes) {
    if (typeof changes.displayName === "string") {
      setDisplayName(changes.displayName);
    }

    if (typeof changes.darkMode === "boolean") {
      setDarkMode(changes.darkMode);
    }

    setSaving(true);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setSaving(false);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
