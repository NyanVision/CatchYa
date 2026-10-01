import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { type Palette, radii } from "@/theme/colors";
import { useTheme, useThemedStyles } from "@/context/AppearanceContext";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "default" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = "default", loading, disabled, icon, style }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        !isGhost && styles.base,
        isPrimary && styles.primary,
        !isPrimary && !isGhost && styles.default,
        pressed && !isGhost && { opacity: 0.85 },
        (disabled || loading) && !isGhost && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.accentInk : colors.accent} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text
            style={[
              styles.label,
              isPrimary && { color: colors.accentInk },
              isGhost && { color: colors.accent, fontWeight: "700" },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  base: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  default: {},
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14.5, fontWeight: "700", color: colors.text },
});
