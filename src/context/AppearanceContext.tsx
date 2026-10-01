import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors, type Palette } from "@/theme/colors";

export type AppearanceChoice = "light" | "dark" | "system";
export type ResolvedScheme = "light" | "dark";
const KEY = "catchya:appearance";

interface AppearanceValue {
  choice: AppearanceChoice;
  /** The scheme actually in effect (System default resolved to the device setting). */
  scheme: ResolvedScheme;
  colors: Palette;
  ready: boolean;
  setChoice: (choice: AppearanceChoice) => Promise<void>;
}
const Context = createContext<AppearanceValue | null>(null);

// Applies the choice to the native layer too, so native dialogs, alerts and
// the keyboard follow the selected mode. "unspecified" hands control back to the device.
function applyNative(choice: AppearanceChoice) {
  Appearance.setColorScheme(choice === "system" ? "unspecified" : choice);
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoiceState] = useState<AppearanceChoice>("system");
  const [ready, setReady] = useState(false);
  const [deviceScheme, setDeviceScheme] = useState<ResolvedScheme>(Appearance.getColorScheme() === "dark" ? "dark" : "light");

  useEffect(() => {
    // Fires when the device appearance changes (only while following System default).
    const sub = Appearance.addChangeListener(({ colorScheme }) => setDeviceScheme(colorScheme === "dark" ? "dark" : "light"));
    let active = true;
    AsyncStorage.getItem(KEY).then((saved) => {
      if (!active) return;
      const next: AppearanceChoice = saved === "light" || saved === "dark" ? saved : "system";
      applyNative(next);
      setChoiceState(next);
      setDeviceScheme(Appearance.getColorScheme() === "dark" ? "dark" : "light");
    }).catch(() => undefined).finally(() => { if (active) setReady(true); });
    return () => { active = false; sub.remove(); };
  }, []);

  const setChoice = useCallback(async (next: AppearanceChoice) => {
    applyNative(next);
    setChoiceState(next);
    setDeviceScheme(Appearance.getColorScheme() === "dark" ? "dark" : "light");
    try { await AsyncStorage.setItem(KEY, next); } catch { /* choice still applies for this session */ }
  }, []);

  const scheme: ResolvedScheme = choice === "system" ? deviceScheme : choice;
  const value = useMemo<AppearanceValue>(() => ({
    choice, scheme, ready, setChoice, colors: scheme === "dark" ? darkColors : lightColors,
  }), [choice, scheme, ready, setChoice]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAppAppearance() {
  const value = useContext(Context);
  if (!value) throw new Error("useAppAppearance must be inside AppearanceProvider");
  return value;
}

export function useTheme() {
  const { colors, scheme } = useAppAppearance();
  return { colors, scheme, isDark: scheme === "dark" };
}

/** Builds a StyleSheet from the active palette; rebuilt only when the theme changes. */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useAppAppearance();
  return useMemo(() => factory(colors), [colors]);
}
