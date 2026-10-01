import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { type Palette, radii } from "@/theme/colors";
import { useTheme, useThemedStyles } from "@/context/AppearanceContext";

interface Props extends TextInputProps {
  label: string;
}

export function TextField({ label, style, ...rest }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardAppearance={isDark ? "dark" : "light"}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: "700", color: colors.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.sm + 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
});
