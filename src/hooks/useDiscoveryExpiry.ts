import { useCallback } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { loadDiscoveryPreferences, type DiscoveryPreferences } from "@/services/discoveryPreferences";

/** Only the focused screen schedules expiry; always recheck the current saved session. */
export function useDiscoveryExpiry(
  userId: string | null,
  expiresAt: number | null,
  onChange: (preferences: DiscoveryPreferences) => void,
) {
  useFocusEffect(useCallback(() => {
    let active = true;
    const refresh = () => {
      void loadDiscoveryPreferences(userId).then((preferences) => {
        if (active) onChange(preferences);
      }).catch(() => {
        // Fail closed in the UI. Do not produce an unhandled timer rejection.
        if (active && expiresAt !== null && expiresAt <= Date.now()) {
          onChange({ enabled: false, duration: "15 minutes", expiresAt: null });
        }
      });
    };
    const timer = expiresAt === null ? undefined : setTimeout(refresh, Math.max(0, expiresAt - Date.now()));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      active = false;
      if (timer !== undefined) clearTimeout(timer);
      subscription.remove();
    };
  }, [userId, expiresAt, onChange]));
}
