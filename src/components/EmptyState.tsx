import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type Palette } from "@/theme/colors";
import { useThemedStyles } from "@/context/AppearanceContext";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 },
  title: { fontWeight: "800", fontSize: 15.5, color: colors.text, marginBottom: 6, textAlign: "center" },
  desc: { fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 19, maxWidth: 260 },
  action: { marginTop: 16, width: "100%", maxWidth: 220 },
});
