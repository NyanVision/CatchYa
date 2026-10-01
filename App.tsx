import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { AppearanceProvider, useTheme, useAppAppearance } from "@/context/AppearanceContext";
import { RootNavigator } from "@/navigation/RootNavigator";

function AppContent() {
  const { ready } = useAppAppearance();
  const { colors, isDark } = useTheme();
  // Wait for the saved appearance to load so the app never flashes the wrong theme.
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <><StatusBar style={isDark ? "light" : "dark"} /><RootNavigator /></>;
}

export default function App() {
  return <SafeAreaProvider><AppearanceProvider><AuthProvider><AppContent /></AuthProvider></AppearanceProvider></SafeAreaProvider>;
}
