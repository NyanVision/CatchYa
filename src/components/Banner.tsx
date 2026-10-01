import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type Palette, radii } from "@/theme/colors";
import { useThemedStyles } from "@/context/AppearanceContext";

export function Banner({ message }: { message: string | null }) {
  const styles = useThemedStyles(makeStyles);
  if (!message) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  banner: {
    backgroundColor: colors.bannerBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md - 1,
    padding: 12,
    marginBottom: 14,
  },
  text: { color: colors.dangerText, fontSize: 12.5, lineHeight: 18 },
});
