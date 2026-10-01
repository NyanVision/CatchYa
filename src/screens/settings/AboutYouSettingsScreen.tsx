import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { AboutYouForm } from "@/components/AboutYouForm";
import { emptyAboutYouPreferences, loadAboutYouPreferences, saveAboutYouPreferences, type AboutYouPreferences } from "@/services/aboutYouPreferences";
import { type Palette } from "@/theme/colors";
import { useTheme, useThemedStyles } from "@/context/AppearanceContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/AppTabs";

type Props = NativeStackScreenProps<AppStackParamList, "AboutYouSettings">;

export function AboutYouSettingsScreen({ navigation }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { userId } = useAuth();
  const [preferences, setPreferences] = useState<AboutYouPreferences>(emptyAboutYouPreferences());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    loadAboutYouPreferences(userId).then((saved) => { if (active) setPreferences(saved); })
      .catch(() => { if (active) setPreferences(emptyAboutYouPreferences()); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const save = async (value: AboutYouPreferences) => {
    setSaving(true);
    try {
      await saveAboutYouPreferences(userId, value);
      navigation.goBack();
    } catch {
      Alert.alert("Couldn’t save your answers", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  return <AboutYouForm initialValue={preferences} submitLabel="Save changes" onSave={save} onCancel={() => navigation.goBack()} saving={saving} />;
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
});
